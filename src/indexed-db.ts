/*
	Copyright (c) 2025 ifmgrn
	Licensed under the GNU AGPL-3.0 License.
	See LICENSE.txt for details.
*/

// Responsável por gerenciar o banco de dados

import { convertReactionNameToId, normalizeString } from "./common";
import { deleteDB, type IDBPDatabase, openDB } from "idb";

/* Uma "promessa" que retorna o banco de dados.
 * Se isto não estiver definido, é porque não tem uma conexão aberta com o banco de dados.
 */
let dbPromise: Promise<IDBPDatabase<ChemistryDB>> | undefined;

// Extrai termos ("palavras-chave") do dado texto
function tokenize(text: string) {
	/* Remove acentos e transforma em minúsculas (permite pesquisas menos exatas), e extrai palavras junto com números.
	 * Ex.: H₂ (gás hidrogênio) => [h₂, gas, hidrogenio]
	 */
	return normalizeString(text).match(/[\p{L}\p{N}]+/gu) ?? [];
}

// Extrai os termos pesquisáveis ("palavras-chave") de uma reação
function extractTerms(record: Reaction, molecules: { [key: string]: string }) {
	// Campos indexáveis (relevantes para pesquisa)
	const fieldsToIndex: (keyof Reaction)[] = [
		"nome",
		"tipo",
		"reagentes",
		"produtos",
	];

	// Extrai os termos de cada campo indexável da reação sem duplicatas
	const terms: Set<string> = new Set();
	for (const field of fieldsToIndex) {
		const value = record[field]!;

		if (Array.isArray(value)) {
			// Para lista de moléculas, indexa tanto o símbolo quanto o nome delas
			for (const v of value)
				tokenize(v + " " + molecules[v]).forEach((t) => terms.add(t));
		} else tokenize(value).forEach((t) => terms.add(t));
	}

	// IndexedDB's `multiEntry` só aceita arrays, por isso temos que converter
	return Array.from(terms);
}

// Pega todas as reações do banco de dados
export async function getAllReactions() {
	return (await getDB()).getAll("reactions");
}

/* Pesquisa por reações com base na query (o termo não precisa ser exatamente igual a um dos termos indexados da reação, pode ser um prefixo)
 * Ex.: "hidrogenio" retorna todas as reações que têm hidrogênio, assim como faz "hidro" (porque é um prefixo)
 */
export async function searchReactionByPrefix(query: string) {
	// Faz os termos da pesquisa ficarem no mesmo formato que os termos indexados das reações
	const queryTerms = tokenize(normalizeString(query));
	if (!queryTerms.length) return [];

	// Pega a tabela de termos indexados das reações
	const tx = (await getDB()).transaction("reactions");
	const index = tx.store.index("terms_idx");

	/* Cada posição do array é o resultado do respectivo termo de pesquisa (queryTerms[0] => reactionsPerTerm[0])
	 * Cada posição contém um mapa que mapeia o id da reação com suas informações
	 */
	const reactionsPerTerm: Array<Map<string, Reaction>> = [];
	for (const term of queryTerms) {
		// Pega todas as reações que contém termos que começem com o termo da pesquisa
		const matchingRecords = await index.getAll(
			IDBKeyRange.bound(term, term + "\uffff"),
		);
		// Se um dos termos da pesquisa não encontrou nenhuma reação, logo não há reação que atenda a todos os termos
		if (!matchingRecords.length) return [];
		// Mapeia o id da reação com suas informações dentro da posição do termo de pesquisa atual
		reactionsPerTerm.push(
			new Map(matchingRecords.map((record) => [record.id!, record])),
		);
	}

	// Encontra a interseção das reações encontradas entre todos os termos da pesquisa (só reações que satisfazem todos os termos pesquisados são relevantes)
	// Começa com o termo que encontrou menos reações (mais eficiente) e verifica se o resto contém as mesmas reações (filtra as reações que não estão em todos eles)
	reactionsPerTerm.sort((a, b) => a.size - b.size);
	const commonReactions = reactionsPerTerm[0];
	for (let i = 1; i < queryTerms.length && commonReactions.size > 0; i++) {
		const currentReactions = reactionsPerTerm[i];
		for (const id of commonReactions.keys()) {
			if (!currentReactions.has(id)) {
				commonReactions.delete(id);
			}
		}
	}

	return Array.from(commonReactions.values());
}

/* Solicita o banco de dados.
 * Se o banco de dados já estiver aberto, retorna uma "promessa rápida"
 * Se ele estiver fechado, abre uma nova conexão e retorna ele assim que possível
 * Se ele não estiver inicializado, inicializa ele e o retorna (caso mais lento)
 */
export async function getDB(): Promise<IDBPDatabase<ChemistryDB>> {
	// Se o banco de dados já foi inicializado e está aberto, retorna ele
	if (dbPromise) return dbPromise;

	/* Apenas para debug:
	 * Se esta guia for nova, deleta o banco de dados (para criar de novo depois)
	 * Caso contrário (o usuário recarregou a página), ignora (abre uma nova conexão)
	 * Os bancos de dados do IndexedDB são persistentes, então precisamos fazer isso caso não queiramos inserir uma nova versão toda vez que quisermos fazer um teste
	 */
	if (!sessionStorage.getItem("dev-session-active")) {
		await deleteDB("ChemistryDB-dev");
		sessionStorage.setItem("dev-session-active", "true");
	}

	// Retorna uma "promessa" que irá abrir uma nova conexão ou inicializar o banco de dados
	return (dbPromise = (async () => {
		// Alguns navegadores (como o Firefox) não esperam o banco de dados atualizar para dizer que ele está pronto, então precisamos manualmente esperar depois (caso necessário)
		let upgradePromise: Promise<void> | undefined;
		// Abre uma nova conexão (inicializando o banco de dados caso necessário)
		const db = await openDB<ChemistryDB>("ChemistryDB-dev", 1, {
			// Quando o banco de dados precisa ser inicializado ou atualizado
			upgrade(db, _oldVersion, _newVersion, transaction) {
				// Inicializa o banco de dados
				db.createObjectStore("molecules");
				db.createObjectStore("reactions", {
					keyPath: "id",
				}).createIndex("terms_idx", "terms", { multiEntry: true });

				// Coloca a lógica de população numa "promessa" para esperar depois
				upgradePromise = new Promise((resolve, reject) => {
					// Espera a transação de inicialização acabar e os dados serem baixados e importados
					Promise.all([transaction.done, import("./data.js")])
						.then((results) => {
							const molecules = results[1].molecules,
								reactions = results[1].reactions;

							const tx = db.transaction(
								["reactions", "molecules"],
								"readwrite",
							);
							// Popula o banco de dados das moléculas
							for (const [symbol, name] of Object.entries(molecules))
								tx.objectStore("molecules").add(name, symbol);
							// Popula o banco de dados das reações
							for (const reaction of reactions) {
								tx.objectStore("reactions").add({
									...reaction,
									id: convertReactionNameToId(reaction.nome),
									terms: extractTerms(reaction, molecules),
								});
							}

							// Espera a transação de população acabar
							return tx.done;
						})
						.then(resolve)
						.catch(reject);
				});
			},
			/* Quando o usuário abre uma nova guia (além da nossa), a nova guia irá tentar deletar o banco de dados (conforme a lógica de debug lá em cima)
			 * Isso será bloqueado porque nossa guia tem uma conexão aberta, então fechamos ela aqui e permitimos que a outra guia crie o banco de dados de novo (nós abriremos uma nova conexão com ela quando necessário)
			 */
			blocking() {
				closeDB();
			},
		});

		// Se uma nova inicialização/atualização foi necessária, espera ela terminar antes de devolver o banco de dados
		if (upgradePromise) await upgradePromise;
		return db;
	})());
}

// Fecha o banco de dados se ele estiver aberto
export async function closeDB() {
	if (dbPromise) {
		(await dbPromise).close();
		dbPromise = undefined;
	}
}

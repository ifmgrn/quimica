/*
	Copyright (c) 2025 ifmgrn
	Licensed under the GNU AGPL-3.0 License.
	See LICENSE.txt for details.
*/

// Contém variáveis e funções utilitárias (usadas em mais de um arquivo), exceto coisas relacionadas ao banco de dados

import type { IDBPObjectStore } from "idb";
import { getDB } from "./indexed-db";

// Verifica se o caractere dado é um algarismo (número de uma casa).
export function isDigit(str: string) {
	return str.length === 1 && str >= "0" && str <= "9";
}

// Remove todos os acentos do texto dado, incluindo coisas como "ç" (que vira "c").
export function removeAccents(str: string) {
	return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Normaliza um texto ao remover acentos e fazer todas as letras minúsculas
export function normalizeString(str: string) {
	return removeAccents(str).toLowerCase();
}

// Faz o nome de uma reação ficar num bom formato para ser incluído na URL (ainda precisaria fazer "encode")
export function convertReactionNameToId(name: string) {
	return name.replaceAll(" ", "-").toLowerCase();
}

/* Substitui as variáveis no formato "{{ nome }}" do texto dado pelos valores passados no "data". */
export function interpolate(
	template: string,
	data: { [key: string]: unknown },
) {
	return template.replace(/{{\s*(.*?)\s*}}/g, (_, key) => {
		key = removeAccents(key.trim()).toLowerCase();
		return String(data[key]);
	});
}

/* Converte o texto dado para listas em HTML, usando "\t" para indentação. */
export function convertTextToHTMLList(input: string) {
	const lines = input.split("\n");

	const htmlParts: string[] = [];
	const listStack: { type: "ul" | "ol"; indent: number; openLi: boolean }[] =
		[];

	// Escapa texto para HTML
	function escapeHTML(text: string) {
		return text
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#39;");
	}

	// Fecha listas com recuo estritamente maior que targetIndent
	function closeLists(targetIndent: number) {
		while (
			listStack.length > 0 &&
			listStack[listStack.length - 1].indent > targetIndent
		) {
			const list = listStack.pop()!;
			// Fecha o último <li> se ainda estiver aberto
			if (list.openLi) {
				htmlParts.push("</li>");
				list.openLi = false;
			}
			htmlParts.push(list.type === "ul" ? "</ul>" : "</ol>");
		}
	}

	lines.forEach((line) => {
		if (!line.trim()) {
			closeLists(-1); // Fecha todas as listas se for uma linha vazia
			return;
		}

		const indentMatch = line.match(/^(\t*)/);
		const indentLevel = indentMatch ? indentMatch[1].length : 0;

		const content = line.trim();

		/* Regex para listas ordenadas que aceita:
		 * números seguidos de . ou ) e espaço (ex: 1. item, 2) item)
		 * letras (a-z ou A-Z) seguidas de . ou ) e espaço (ex: a) item, B. item)
		 */
		const ulMatch = content.match(/^-\s+(.*)/);
		const olMatch = content.match(/^([0-9a-zA-Z]+)[.)]\s+(.*)/);

		let itemText;
		if (ulMatch) itemText = ulMatch[1];
		else if (olMatch) itemText = olMatch[2];
		else {
			// Fecha todas as listas em linhas de texto normais
			closeLists(-1);
			htmlParts.push(escapeHTML(`<p>${content}</p>`));
			return;
		}

		const type = ulMatch ? "ul" : "ol";

		// Fecha listas mais indentadas que o recuo atual
		closeLists(indentLevel);

		// Verifica se precisamos abrir uma nova <ul> ou <ol>
		if (
			listStack.length === 0 ||
			listStack[listStack.length - 1].indent < indentLevel ||
			listStack[listStack.length - 1].type !== type
		) {
			htmlParts.push(`<${type}>`);

			listStack.push({
				type: type,
				indent: indentLevel,
				openLi: false,
			});
		} else {
			// Fecha o <li> anterior na mesma lista se estiver aberto
			const currentList = listStack[listStack.length - 1];
			if (currentList.openLi) {
				htmlParts.push("</li>");
				currentList.openLi = false;
			}
		}

		// Abre um novo <li>
		htmlParts.push(`<li>${escapeHTML(itemText)}`);
		listStack[listStack.length - 1].openLi = true;
	});

	// Feche todas as listas abertas restantes e <li>
	closeLists(-1);

	return htmlParts.join("");
}

/* Insere o texto dado na posição onde está o cursor do <input> dado. */
export function insertTextAtCursor(input: HTMLInputElement, text: string) {
	const start = input.selectionStart ?? 0;
	const end = input.selectionEnd ?? 0;
	const value = input.value;

	input.value = value.substring(0, start) + text + value.substring(end);

	const newCursorPos = start + text.length;
	input.selectionStart = input.selectionEnd = newCursorPos;

	input.focus();
	input.dispatchEvent(new Event("input", { bubbles: true }));
}

// Formata uma lista de moléculas no formato de símbolos ([M, M2]) para o formato "M (nome), M2 (nome 2)"
export async function formatMolecules(
	molecules: string[],
	store?: IDBPObjectStore<ChemistryDB, ["molecules"], "molecules">,
) {
	if (!store) store = (await getDB()).transaction("molecules").store;

	return (
		await Promise.all(
			molecules.map(async (text) => `${text} (${await store.get(text)})`),
		)
	).join(", ");
}

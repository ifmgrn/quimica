/*
	Copyright (c) 2025 ifmgrn
	Licensed under the GNU AGPL-3.0 License.
	See LICENSE.txt for details.
*/

// Contém a lógica por trás da página de reação

import { convertTextToHTMLList, formatMolecules, interpolate } from "../common";
import { closeDB, getDB } from "../indexed-db";
import { Page } from "../page";

import template from "/templates/reaction.html?raw";

export default class extends Page {
	class = "reaction";
	// Parâmetro usado para especificar uma reação na URL (ex.: ?r=combustao)
	static params = { name: "r" };

	async onload(container: HTMLElement, params: Record<string, string>) {
		const name = params["name"];
		if (!name) return window.location.assign(".");

		// Abre uma conexão com o banco de dados e busca a reação
		const db = await getDB();
		const reaction = await db.get("reactions", name);

		// Volta para a página principal se a reação for inválida
		if (!reaction) return window.location.assign(".");

		document.title = reaction.nome;

		/* Disponibiliza os dados para substituir no template.
		 * Formata as moléculas dos reagentes e dos produtos.
		 * Converte as instruções para listas HTML.
		 * Nós preparamos os dados sem verificar se eles serão usados ou não,
		 * pois o String.replace não suporta métodos assíncronos (e a performance não deve mudar muito)
		 */
		const tx = db.transaction("molecules");
		const template_data = {
			...reaction,
			reagentes: await formatMolecules(reaction.reagentes, tx.store),
			produtos: await formatMolecules(reaction.produtos, tx.store),
			instrucoes: convertTextToHTMLList(reaction.instrucoes, "tree"),
		};

		// Insere o template atualizado na página
		container.insertAdjacentHTML(
			"beforeend",
			interpolate(template, template_data),
		);

		// Fecha o banco de dados (não precisamos mais dele nesta guia)
		closeDB();
	}
}

/*
	Copyright (c) 2025 ifmgrn
	Licensed under the GNU AGPL-3.0 License.
	See LICENSE.txt for details.
*/

// Contém a lógica por trás da página principal

import { formatMolecules, insertTextAtCursor, isDigit } from "../common";
import { getDB, searchReactionByPrefix, getAllReactions } from "../indexed-db";
import template from "/templates/content/reactions.html?raw";
import { Page } from "../page";

// Elementos com id definido no HTML (template)
declare const input: HTMLInputElement;
declare const reactionsGrid: HTMLDivElement;

export default class extends Page {
	class = "reactions";
	html = template;

	typingTimer?: number;

	/* Mapeia colunas da tabela de reações químicas para os seus respectivos dados (chaves do tipo Reaction).
	 * A ordem importa.
	 */
	reactionsTableColumns: { [key: string]: keyof Reaction } = {
		"Reação Química": "nome",
		Tipo: "tipo",
		"Reagente(s)": "reagentes",
		"Produto(s)": "produtos",
		Equação: "equacao",
	};

	// Armazena o último texto do input para evitar fazer pesquisas repetidas
	lastInputValue: string | undefined = undefined;

	// Registra eventos relacionados com os elementos do template
	addEventListeners() {
		input.addEventListener("keydown", (event) => {
			// Tira o foco do input se o usuário pressionar Esc
			if (event.key === "Escape") {
				// Impede com que os navegadores limpem o texto do input
				event.preventDefault();
				input.blur();
			}
			// Se o usuário pressionar Ctrl mais algum dígito, adiciona a versão subscrita do dígito
			else if (event.ctrlKey && isDigit(event.key)) {
				const numberToSubscriptMap: { [key: string]: string } = {
					"0": "₀",
					"1": "₁",
					"2": "₂",
					"3": "₃",
					"4": "₄",
					"5": "₅",
					"6": "₆",
					"7": "₇",
					"8": "₈",
					"9": "₉",
				};

				insertTextAtCursor(input, numberToSubscriptMap[event.key]);
				// Impede com que o dígito original seja adicionado
				event.preventDefault();
			}
		});

		// Automaticamente pesquisa o que usuário digitou após um tempo
		input.addEventListener("input", () => {
			// Reseta o temporizador do input anterior (evita acumular temporizadores e pesquisar várias vezes seguidas)
			clearTimeout(this.typingTimer);

			/* A conexão com o banco de dados pode estar fechada (ex.: o usuário abriu uma reação numa nova guia)
			 * Certifique-se que ela esteja aberta antes de começarmos a pesquisar (evita o lag)
			 */
			getDB();
			this.typingTimer = setTimeout(() => this.search(), 500);
		});

		// Permite escrever no input sem precisar estar focado nele
		document.addEventListener("keydown", (event) => {
			if (
				// Só aceita caracteres e algumas exceções (como o Backspace para deletar) (evita teclas que não têm efeito como Tab)
				(event.key.length === 1 ||
					["Backspace", "Delete"].includes(event.key)) &&
				// Ignora se o usuário já estiver escrevendo num input
				![HTMLInputElement, HTMLTextAreaElement].some(
					(value) => document.activeElement instanceof value,
				) &&
				// Ignora se o usuário tiver pressionando Alt ou Meta (ex.: Win) (evita prejudicar atalhos globais)
				!event.altKey &&
				!event.metaKey &&
				// Só aceita Shift se o usuário tiver pressionado um caractere (evita prejudicar atalhos globais como Shift+Tab)
				(!event.shiftKey || event.key.length === 1) &&
				// Só aceita Ctrl se o usuário tiver pressionado um dígito (para adicionar subscrito) (evita prejudicar atalhos globais)
				(!event.ctrlKey || isDigit(event.key))
			) {
				// Certifica-se que o cursor está no final do input (para evitar adicionar caracteres no meio)
				input.setSelectionRange(input.value.length, input.value.length);
				// Muda o foco para o input (o navegador já direciona o evento de input para ele)
				input.focus();
				// Caso o usuário tenha pressionado Ctrl, manualmente redireciona o evento de input (pois o navegador não redireciona a tecla para o input neste caso)
				if (event.ctrlKey) {
					input.dispatchEvent(
						new KeyboardEvent("keydown", {
							ctrlKey: true,
							key: event.key,
						}),
					);
					event.preventDefault();
				}
			}
		});
	}

	setupToolbars() {
		/* Adiciona a funcionalidade de "barra de ferramentas" a todos os "input-container" da página:
		 * Faz com que a barra apareça quando o input for focado e desapareça quando o input perder o foco
		 * Adiciona conteúdo ao input conforme os botãos da barra forem clicados
		 */

		const input_containers = document.getElementsByClassName(
			"input-container",
		) as HTMLCollectionOf<HTMLDivElement>;
		for (const container of input_containers) {
			const toolbar = container.querySelector('[role="group"]');
			const input = container.querySelector("input");
			if (!toolbar || !input) continue;

			// Necessário para fazer com que os botões possam ser `relatedTarget` no Safari
			for (const button of toolbar.querySelectorAll("button")) {
				button.setAttribute("tabindex", "0");
			}

			toolbar.addEventListener("click", (event) => {
				const button = event.target as HTMLDivElement | HTMLButtonElement;
				if (button instanceof HTMLButtonElement) {
					insertTextAtCursor(
						input,
						button.dataset.toInsert ?? button.textContent ?? "",
					);
				}
			});

			input.addEventListener("focusin", () => {
				toolbar.removeAttribute("aria-hidden");
				toolbar.classList.remove("hidden");
			});
			input.addEventListener("focusout", (event) => {
				const target = event.relatedTarget;
				if (!(target instanceof Node && toolbar.contains(target))) {
					toolbar.setAttribute("aria-hidden", "true");
					toolbar.classList.add("hidden");
				}
			});
		}
	}

	async generateReactionsGrid(data: Reaction[]) {
		const tx = (await getDB()).transaction("molecules");
		async function generateItem(item: Reaction) {
			return `<div>
			    <lite-youtube videoid="${item.embedded_link.slice(item.embedded_link.lastIndexOf("/") + 1)}" title="${item.nome}"></lite-youtube>
				<div class="info">
					<span class="field">Reação:</span><span class="value">${item.nome}</span>
					<span class="field">Tipo:</span><span class="value">${item.tipo}</span>
					<span class="field">Reagente(s):</span><span class="value">${await formatMolecules(item.reagentes, tx.store)}</span>
					<span class="field">Produto(s):</span><span class="value">${await formatMolecules(item.produtos, tx.store)}</span>
					<span class="field">Equação:</span><span class="value">${item.equacao}</span>
				</div>
			</div>`;
		}

		const items = await Promise.all(data.map(generateItem));

		return items.join("");
	}

	/* Pesquisa por reações químicas com base no query (termo de pesquisa).
	 * Se o query não for especificado, usa o texto do input, caso contrário atualiza o texto do input.
	 * Se o query for vazio, mostra todas as reações químicas.
	 * Por padrão, adiciona ao histórico de pesquisas (para que o usuário possa voltar através do navegador)
	 */
	async search(query?: string, addToHistory = true) {
		// Atualiza o texto do input para o query caso necessário
		if (query === undefined) query = input.value;
		else input.value = query;

		// Não repita a mesma pesquisa que antes
		if (this.lastInputValue === query) return;

		// Adiciona ao histórico de pesquisas caso solicitado
		if (addToHistory) {
			/*history.pushState(
				null,
				"",
				query
					? `?${SEARCH_URL_PARAMETER}=${encodeURIComponent(query)}`
					: // Se o query for vazio, não precisa adicionar o parâmetro de pesquisa
						window.location.pathname,
			);*/
		}

		this.lastInputValue = query;

		// Pesquisa pelo query (ou todas as reações) e atualiza a visualização
		reactionsGrid.innerHTML = await this.generateReactionsGrid(
			await (query ? searchReactionByPrefix(query) : getAllReactions()),
		);
	}

	// Quando o usuário clica no botão de voltar ou avançar do navegador (ou quando recarrega a página)
	/*onPopstate() {
		// Pega a pesquisa da URL e atualiza a tabela (sem adicionar ao histórico de novo)
		const urlParams = new URLSearchParams(window.location.search.toLowerCase());
		const searchQuery = urlParams.get(this.SEARCH_URL_PARAMETER);
		// Se nenhuma pesquisa foi especificada, mostre todas as reações
		this.search(searchQuery ?? "", false);
	}*/

	// Mostre a página principal
	async onload() {
		this.addEventListeners();
		this.setupToolbars();

		// Atualiza a tabela e ouve o evento de histórico do navegador
		//this.onPopstate();
		const urlParams = new URLSearchParams(window.location.search.toLowerCase());
		this.search(urlParams.get("p") ?? undefined);
		//window.addEventListener("popstate", onPopstate);
	}

	async onunload() {
		clearTimeout(this.typingTimer);
	}
}

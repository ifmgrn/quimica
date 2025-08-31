/*
	Copyright (c) 2025 ifmgrn
	Licensed under the GNU AGPL-3.0 License.
	See LICENSE.txt for details.
*/

// Ponto de partida, primeiro arquivo a ser executado pelo navegador

import { insertTextAtCursor, REACTION_URL_PARAMETER } from "./common";
import openHomepage from "./home-page";
import openReaction from "./reaction-page";

/* Abra a página de reação caso uma reação foi especificada na URL.
 * Caso contrário, abra a página principal.
 */
const urlParams = new URLSearchParams(window.location.search.toLowerCase());
const reaction = urlParams.get(REACTION_URL_PARAMETER);
if (reaction) openReaction(document.body, reaction);
else openHomepage(document.body);

{
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

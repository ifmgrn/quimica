import openReactions from "./reaction-home";

import template_home from "../templates/home.html?raw";
import template_molecules from "../templates/molecules-home.html?raw";
import template_periodictable from "../templates/periodic_table-home.html?raw";

declare const periodictable_button: HTMLButtonElement;
declare const molecule_button: HTMLButtonElement;
declare const reaction_button: HTMLButtonElement;

// Mostre a página principal
export default async function openHomepage(container: HTMLElement) {
	// Adiciona o conteúdo do template para a página e configura os eventos
	container.insertAdjacentHTML("beforeend", template_home);
	reaction_button.addEventListener("click", () => {
		const main = document.querySelector("main");
		if (main) openReactions(main);
	});
	molecule_button.addEventListener("click", () => {
		const main = document.querySelector("main");
		if (main) main.innerHTML = template_molecules;
	});
	periodictable_button.addEventListener("click", () => {
		const main = document.querySelector("main");
		if (main) main.innerHTML = template_periodictable;
	});
}

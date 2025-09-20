//import openReactions from "./reaction-home";
import reactionPage from "./reaction-home";

import template_home from "../templates/home.html?raw";
import template_molecules from "../templates/molecules-home.html?raw";
import type { Page } from "./page";

import { load } from "./periodic-table";

import "kekule/chemWidget";

declare const periodictable_button: HTMLButtonElement;
declare const molecule_button: HTMLButtonElement;
declare const reaction_button: HTMLButtonElement;

// Mostre a página principal
export default async function openHomepage(container: HTMLElement) {
	let currentPage: Page | undefined;
	let activeButton: HTMLButtonElement | undefined;

	// Adiciona o conteúdo do template para a página e configura os eventos
	container.insertAdjacentHTML("beforeend", template_home);
	reaction_button.addEventListener("click", () => {
		if (currentPage) currentPage.cleanup();
		if (activeButton) activeButton.classList.remove("active");

		const main = document.querySelector("main");
		if (main) reactionPage.load(main);
		currentPage = reactionPage;

		activeButton = reaction_button;
		activeButton.classList.add("active");
	});
	molecule_button.addEventListener("click", () => {
		if (currentPage) currentPage.cleanup();
		if (activeButton) activeButton.classList.remove("active");

		const main = document.querySelector("main");
		if (main) main.innerHTML = template_molecules;
		currentPage = undefined;

		activeButton = molecule_button;
		activeButton.classList.add("active");
	});
	periodictable_button.addEventListener("click", () => {
		if (currentPage) currentPage.cleanup();
		if (activeButton) activeButton.classList.remove("active");

		const main = document.querySelector("main");
		if (main) load(main);
		currentPage = undefined;

		activeButton = periodictable_button;
		activeButton.classList.add("active");
	});
}

import template from "/templates/home.html?raw";

import { Page } from "../page";
import PeriodicTableContent from "../content/periodic-table";
import MoleculesContent from "../content/molecules";
import ReactionsContent from "../content/reactions";

declare const main: HTMLDivElement;
declare const periodictable_button: HTMLButtonElement;
declare const molecules_button: HTMLButtonElement;
declare const reactions_button: HTMLButtonElement;

export default class extends Page {
	class = "home";
	html = template;

	currentPage: Page | undefined;
	activeButton: HTMLButtonElement | undefined;

	static params = { p: "p" };

	async loadPage(page: typeof Page, button: HTMLButtonElement) {
		if (this.currentPage) {
			await this.currentPage.unload();
			const url = window.location.origin + window.location.pathname;
			window.history.replaceState({}, document.title, url);
		}
		if (this.activeButton) this.activeButton.classList.remove("active");

		this.activeButton = button;
		button.classList.add("active");

		this.currentPage = new page(main);
		return this.currentPage.load();
	}

	async onload() {
		for (const [page, button] of [
			[PeriodicTableContent, periodictable_button],
			[MoleculesContent, molecules_button],
			[ReactionsContent, reactions_button],
		] as Array<[typeof Page, HTMLButtonElement]>) {
			button.addEventListener("click", () => this.loadPage(page, button));
		}

		return this.loadPage(ReactionsContent, reactions_button);
	}
}

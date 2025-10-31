import template from "/templates/content/periodic-table.html?raw";
import { Page } from "../page";

declare const filterAtoms: HTMLButtonElement;
declare const periodicTable: HTMLDivElement;

export default class extends Page {
	class = "periodicTable";
	html = template;

	async onload() {
		filterAtoms.addEventListener("click", () => {
			//@ts-expect-error Kekule
			const table = periodicTable.widget;
			const elems = table.getSelectedSymbols();
			if (elems && elems.length) {
				window.location.href = `${window.location.pathname}?p=${encodeURIComponent(elems.join(" "))}`;
			}
		});
	}
}

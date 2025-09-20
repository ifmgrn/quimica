import template from "../templates/periodic_table-home.html?raw";

import { Kekule } from "kekule/chemWidget";

declare const periodic_table: HTMLDivElement;

export function load(container: HTMLElement) {
	container.innerHTML = template;
	new Kekule.ChemWidget.PeriodicTable(periodic_table);
}

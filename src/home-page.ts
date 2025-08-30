/*
	Copyright (c) 2025 ifmgrn
	Licensed under the GNU AGPL-3.0 License.
	See LICENSE.txt for details.
*/

import {
	insertTextAtCursor,
	isDigit,
	type Reaction,
	REACTION_URL_PARAMETER,
} from "./common";
import { getSomeReactions, getDB, searchReactionByPrefix } from "./indexed-db";
import template from "../templates/home-page.html?raw";

const SEARCH_URL_PARAMETER = "p";
const reactionsTableColumns: { [key: string]: keyof Reaction } = {
	"Reação Química": "nome",
	Tipo: "tipo",
	"Reagente(s)": "reagentes",
	"Produto(s)": "produtos",
	Equação: "equacao",
};

declare const input: HTMLInputElement;
declare const table: HTMLTableElement;

let lastInputValue: string;

function setupPage() {
	input.addEventListener("keydown", (event) => {
		if (event.key === "Escape") {
			event.preventDefault();
			input.blur();
		} else if (event.ctrlKey && isDigit(event.key)) {
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
			event.preventDefault();
		}
	});

	let typingTimer: number;
	input.addEventListener("input", () => {
		clearTimeout(typingTimer);

		getDB();
		typingTimer = setTimeout(search, 1000);
	});

	document.addEventListener("keydown", (event) => {
		if (
			!["input", "textarea"].includes(
				document.activeElement!.tagName.toLowerCase(),
			) &&
			!event.altKey &&
			(!event.shiftKey || event.key.length === 1) &&
			!event.metaKey &&
			(!event.ctrlKey || isDigit(event.key)) &&
			(event.key.length === 1 || ["Backspace", "Delete"].includes(event.key))
		) {
			input.setSelectionRange(input.value.length, input.value.length);
			input.focus();
			if (event.ctrlKey && isDigit(event.key)) {
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

async function generateReactionsTable(data: Reaction[]) {
	const columnsOrder = Object.values(reactionsTableColumns);

	const headers = Object.keys(reactionsTableColumns)
		.map((name) => `<th>${name}</th>`)
		.join("");

	const tx = (await getDB()).transaction("molecules");
	async function generateRow(row: Reaction) {
		const cells = await Promise.all(
			columnsOrder.map(async (key, index) => {
				const value = row[key]!;

				const generateCell = (data: string) =>
					"<td>" +
					(index === 0
						? `<a href="?${REACTION_URL_PARAMETER}=${encodeURIComponent(row.id!)}">`
						: "") +
					data +
					(index === 0 ? "</a>" : "") +
					"</td>";

				if (Array.isArray(value)) {
					const parts = await Promise.all(
						value.map(async (text) => `${text} (${await tx.store.get(text)})`),
					);
					return generateCell(parts.join(", "));
				}
				return generateCell(value);
			}),
		);
		return `<tr>${cells.join("")}</tr>`;
	}

	const rows = await Promise.all(data.map(generateRow));

	return `
        <tr>${headers}</tr>
        ${rows.join("")}
    `;
}

async function search(query?: string, addToHistory = true) {
	if (query === undefined) query = input.value;
	else input.value = query;

	if (lastInputValue === query) return;

	if (addToHistory)
		history.pushState(
			null,
			"",
			query
				? `?${SEARCH_URL_PARAMETER}=${encodeURIComponent(query)}`
				: window.location.pathname,
		);

	lastInputValue = query;

	if (query.length === 0) {
		table.innerHTML = await generateReactionsTable(await getSomeReactions());
		return;
	}

	table.innerHTML = await generateReactionsTable(
		await searchReactionByPrefix(query),
	);
}

function onPopstate() {
	const urlParams = new URLSearchParams(window.location.search);
	const searchQuery = urlParams.get(SEARCH_URL_PARAMETER);
	search(searchQuery ?? "", false);
}

export default async function openHomepage(container: HTMLElement) {
	container.insertAdjacentHTML("beforeend", template);
	setupPage();

	onPopstate();
	window.addEventListener("popstate", onPopstate);
}

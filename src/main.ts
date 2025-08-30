/*
	Copyright (c) 2025 ifmgrn
	Licensed under the GNU AGPL-3.0 License.
	See LICENSE.txt for details.
*/

import { insertTextAtCursor, REACTION_URL_PARAMETER } from "./common";
import openHomepage from "./home-page";
import openReaction from "./reaction-page";

const urlParams = new URLSearchParams(window.location.search.toLowerCase());
const reaction = urlParams.get(REACTION_URL_PARAMETER);

if (reaction) openReaction(document.body, reaction);
else openHomepage(document.body);

{
	const input_containers = document.getElementsByClassName("input-container");
	for (const container of input_containers) {
		const toolbar = container.querySelector('[role="group"]');
		const input = container.querySelector("input");
		if (!toolbar || !input) continue;

		toolbar.addEventListener("click", (event) => {
			const button = event.target as HTMLElement | undefined;
			if (button && button.tagName.toLowerCase() === "button") {
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
			// Certifica-se que "focusout" acontece depois de "focusin" no Safari
			setTimeout(() => {
				const target = event.relatedTarget;
				if (!(target instanceof Node) || !toolbar.contains(target)) {
					toolbar.setAttribute("aria-hidden", "true");
					toolbar.classList.add("hidden");
				}
			}, 0);
		});
	}
}

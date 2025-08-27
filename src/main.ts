/*
    Copyright (C) 2025 John

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { insertTextAtCursor, REACTION_URL_PARAMETER } from './common';
import openHomepage from './home-page';
import openReaction from './reaction-page';

const urlParams = new URLSearchParams(window.location.search.toLowerCase());
const reaction = urlParams.get(REACTION_URL_PARAMETER);

if (reaction)
    openReaction(document.body, reaction);
else
    openHomepage(document.body);

{
    const input_containers = document.getElementsByClassName('input-container');
    for (const container of input_containers) {
        const toolbar = container.querySelector('[role="group"]');
        const input = container.querySelector('input');
        if (!toolbar || !input)
            continue;

        toolbar.addEventListener('click', event => {
            const button = event.target as HTMLElement | undefined;
            if (button && button.tagName.toLowerCase() === 'button') {
                insertTextAtCursor(input, button.dataset.toInsert ?? button.textContent ?? '');
            }
        });

        input.addEventListener('focusin', () => {
            toolbar.removeAttribute('aria-hidden');
            toolbar.classList.remove('hidden');
        });
        input.addEventListener('focusout', event => {
            if (!toolbar.contains(event.relatedTarget as Node)) {
                toolbar.setAttribute('aria-hidden', 'true');
                toolbar.classList.add('hidden');
            }

            input.selectionStart = input.selectionEnd = input.value.length;
        });
    }
}
/*
	Copyright (c) 2025 ifmgrn
	Licensed under the GNU AGPL-3.0 License.
	See LICENSE.txt for details.
*/

// Ponto de partida, primeiro arquivo a ser executado pelo navegador

import { REACTION_URL_PARAMETER } from "./common";
import openHomepage from "./home-page";
import openReaction from "./reaction-page";

/* Abra a página de reação caso uma reação foi especificada na URL.
 * Caso contrário, abra a página principal.
 */
const urlParams = new URLSearchParams(window.location.search.toLowerCase());
const reaction = urlParams.get(REACTION_URL_PARAMETER);
if (reaction) openReaction(document.body, reaction);
else openHomepage(document.body);

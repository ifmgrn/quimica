import { REACTION_URL_PARAMETER, removeAccents } from './common';
import openHomepage from './home-page';
import openReaction from './reaction-page';

const urlParams = new URLSearchParams(removeAccents(decodeURIComponent(window.location.search)).toLowerCase());
const reaction = urlParams.get(removeAccents(REACTION_URL_PARAMETER));

if (reaction)
    openReaction(document.body, reaction);
else
    openHomepage(document.body);
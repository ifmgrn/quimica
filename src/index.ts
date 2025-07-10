import { REACTION_URL_PARAMETER, removeAccents } from './common';
import openHomepage from './home-page';
import openReaction from './reaction-page';

const urlParams = new URLSearchParams(removeAccents(decodeURIComponent(window.location.search)).toLowerCase());
const reaction = urlParams.get(removeAccents(REACTION_URL_PARAMETER));

const container = document.getElementById('container') as HTMLDivElement;

if (reaction)
    openReaction(container, reaction);
else
    openHomepage(container);
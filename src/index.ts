import { REACTION_URL_PARAMETER } from './common';
import openHomepage from './home-page';
import openReaction from './reaction-page';

const urlParams = new URLSearchParams(window.location.search.toLowerCase());
const reaction = urlParams.get(REACTION_URL_PARAMETER);

if (reaction)
    openReaction(document.body, reaction);
else
    openHomepage(document.body);
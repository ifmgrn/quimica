import { REACTION_URL_PARAMETER } from './common';
import openHomepage from './home-page';
import openReaction from './reaction-page';

const urlParams = new URLSearchParams(window.location.search);
const reaction = urlParams.get(REACTION_URL_PARAMETER);

const container = document.getElementById('container') as HTMLDivElement;

if (reaction)
    openReaction(container, reaction);
else
    openHomepage(container);
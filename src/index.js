import openHomepage from './home-page.js';
import openReaction from './reaction-page.js';

const urlParams = new URLSearchParams(window.location.search);
const reaction = urlParams.get('reacao');

if (reaction)
    openReaction(reaction);
else
    openHomepage();
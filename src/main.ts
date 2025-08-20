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

import { REACTION_URL_PARAMETER } from './common';
import openHomepage from './home-page';
import openReaction from './reaction-page';

const urlParams = new URLSearchParams(window.location.search.toLowerCase());
const reaction = urlParams.get(REACTION_URL_PARAMETER);

if (reaction)
    openReaction(document.body, reaction);
else
    openHomepage(document.body);
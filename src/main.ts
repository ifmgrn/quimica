/*
	Copyright (c) 2025 ifmgrn
	Licensed under the GNU AGPL-3.0 License.
	See LICENSE.txt for details.
*/

// Ponto de partida, primeiro arquivo a ser executado pelo navegador

import "./kekule/periodicTable";
import "./kekule/localizationData.pt";
import "./kekule/load";

import HomePage from "./pages/home";
import ReactionPage from "./pages/reaction";
import { PageManager } from "./page";

const pM = new PageManager(document.body, [HomePage, ReactionPage]);
pM.checkURL();

/*
	Copyright (c) 2025 ifmgrn
	Licensed under the GNU AGPL-3.0 License.
	See LICENSE.txt for details.
*/

import type { DBSchema } from "idb";

declare global {
	// Informações de uma reação química
	type Reaction = {
		nome: string;
		tipo: string;
		reagentes: string[];
		produtos: string[];
		equacao: string;
		embedded_link: string;
		instrucoes: string;

		// Primary key (Chave primária)
		id?: string;
		// Índice multivalorado contendo os termos pesquisáveis da reação
		terms?: string[];
	};

	// Esquema do banco de dados
	interface ChemistryDB extends DBSchema {
		reactions: {
			key: string;
			value: Reaction;
			indexes: { terms_idx: string };
		};
		molecules: {
			key: string;
			value: string;
		};
	}
}

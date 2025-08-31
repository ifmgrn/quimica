/*
	Copyright (c) 2025 ifmgrn
	Licensed under the GNU AGPL-3.0 License.
	See LICENSE.txt for details.
*/

// Esses dados só serão baixados quando o banco de dados precisar ser inicializado/atualizado pela primeira vez
// Combine os dados das moléculas com os das reações num arquivo só para melhor eficiência
export { default as molecules } from "./molecules";
export { default as reactions } from "./reactions";

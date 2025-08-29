import {
	convertReactionNameToId,
	normalizeString,
	type Reaction,
} from "./common";
import { type DBSchema, deleteDB, type IDBPDatabase, openDB } from "idb";

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

const SOME_REACTIONS_SIZE = 15;

let dbPromise: Promise<IDBPDatabase<ChemistryDB>> | undefined;

function tokenize(text: string) {
	return normalizeString(text).match(/[\p{L}\p{N}]+/gu) ?? [];
}

function extractTerms(record: Reaction, molecules: { [key: string]: string }) {
	const fieldsToIndex: (keyof Reaction)[] = [
		"nome",
		"tipo",
		"reagentes",
		"produtos",
	];

	const terms = [];
	for (const field of fieldsToIndex) {
		const value = record[field];

		if (typeof value === "string") terms.push(...tokenize(value));
		else if (Array.isArray(value)) {
			for (const v of value) terms.push(...tokenize(v + " " + molecules[v]));
		}
	}

	return Array.from(new Set(terms));
}

export async function getSomeReactions() {
	const tx = (await getDB()).transaction("reactions");

	const results: Reaction[] = [];
	for await (const cursor of tx.store) {
		if (results.length < SOME_REACTIONS_SIZE) results.push(cursor.value);
		else break;
	}

	return results;
}

export async function searchReaction(query: string) {
	return await (
		await getDB()
	).getAllFromIndex("reactions", "terms_idx", normalizeString(query));
}

export async function searchReactionByPrefix(query: string) {
	const queryTerms = tokenize(normalizeString(query));
	if (!queryTerms.length) return [];

	const tx = (await getDB()).transaction("reactions");
	const index = tx.store.index("terms_idx");

	const matchedKeysPerTerm: Map<string, Set<string>> = new Map();
	for (const term of queryTerms) {
		const range = IDBKeyRange.bound(term, term + "\uffff");
		const matchingRecords = await index.getAll(range);
		const matchedKeys = new Set(matchingRecords.map((record) => record.id!));
		matchedKeysPerTerm.set(term, matchedKeys);
	}

	let commonKeys = new Set(matchedKeysPerTerm.get(queryTerms[0]!));
	for (let i = 1; i < queryTerms.length; i++) {
		const currentSet = matchedKeysPerTerm.get(queryTerms[i])!;
		commonKeys = new Set([...commonKeys].filter((key) => currentSet.has(key)));
	}

	if (commonKeys.size === 0) return [];

	const results = await Promise.all(
		[...commonKeys].map(async (key) => (await tx.store.get(key)) as Reaction),
	);

	return results;
}

export async function getDB(): Promise<IDBPDatabase<ChemistryDB>> {
	if (dbPromise) return dbPromise;

	if (!sessionStorage.getItem("dev-session-active")) {
		await deleteDB("ChemistryDB-dev");
		sessionStorage.setItem("dev-session-active", "true");
	}

	return (dbPromise = (async () => {
		let upgradePromise: Promise<void> | undefined;
		const db = await openDB<ChemistryDB>("ChemistryDB-dev", 1, {
			upgrade(db, _oldVersion, _newVersion, transaction) {
				db.createObjectStore("molecules");
				db.createObjectStore("reactions", {
					keyPath: "id",
				}).createIndex("terms_idx", "terms", { multiEntry: true });

				upgradePromise = new Promise((resolve, reject) => {
					Promise.all([transaction.done, import("./data.js")])
						.then((results) => {
							const molecules = results[1].molecules,
								reactions = results[1].reactions;

							const tx = db.transaction(
								["reactions", "molecules"],
								"readwrite",
							);
							for (const [symbol, name] of Object.entries(molecules))
								tx.objectStore("molecules").add(name, symbol);

							for (const reaction of reactions) {
								tx.objectStore("reactions").add({
									...reaction,
									id: convertReactionNameToId(reaction.nome),
									terms: extractTerms(reaction, molecules),
								});
							}

							return tx.done;
						})
						.then(resolve)
						.catch(reject);
				});
			},
			blocking() {
				closeDB();
			},
		});

		if (upgradePromise) await upgradePromise;
		return db;
	})());
}

export async function closeDB() {
	if (dbPromise) {
		(await dbPromise).close();
		dbPromise = undefined;
	}
}

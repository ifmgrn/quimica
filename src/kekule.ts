/*import {
	Kekule,
	type ChemicalElementData,
} from "kekule/webComponent.esm.mjs";*/

export function updateElements() {
	//@ts-expect-error test
	const chemicalElementsData = Kekule.chemicalElementsData;
	if (chemicalElementsData.length !== 112) return;

	const newData = [
		{
			symbol: "Cn",
			casId: "54084-26-3",
			group: 12,
			period: 7,
			name: "Copernicium",
			atomicNumber: 112,
			chemicalSerie: "Transition metals",
			phase: "Synthetic",
			radiiCova: 0.122,
			radiiVdw: 1.83,
			paulingE: 2.0,
			naturalMass: 285.1741,
		},
		{
			symbol: "Nh",
			casId: "28689-29-6",
			group: 13,
			period: 7,
			name: "Nihonium",
			atomicNumber: 113,
			chemicalSerie: "Metals",
			phase: "Synthetic",
			radiiCova: 0.17,
			radiiVdw: 1.9,
			paulingE: 1.5,
			naturalMass: 286.1798,
		},
		{
			symbol: "Fl",
			casId: "54037-05-5",
			group: 14,
			period: 7,
			name: "Flerovium",
			atomicNumber: 114,
			chemicalSerie: "Metals",
			phase: "Synthetic",
			radiiCova: 0.114,
			radiiVdw: 1.87,
			paulingE: 1.7,
			naturalMass: 289.1916,
		},
		{
			symbol: "Mc",
			casId: "54038-16-4",
			group: 15,
			period: 7,
			name: "Moscovium",
			atomicNumber: 115,
			chemicalSerie: "Metals",
			phase: "Synthetic",
			radiiCova: 0.135,
			radiiVdw: 1.88,
			paulingE: 1.9,
			naturalMass: 290.1984,
		},
		{
			symbol: "Lv",
			casId: "54038-27-7",
			group: 16,
			period: 7,
			name: "Livermorium",
			atomicNumber: 116,
			chemicalSerie: "Metals",
			phase: "Synthetic",
			radiiCova: 0.129,
			radiiVdw: 1.83,
			paulingE: 2.0,
			naturalMass: 293.2084,
		},
		{
			symbol: "Ts",
			casId: "54039-03-1",
			group: 17,
			period: 7,
			name: "Tennessine",
			atomicNumber: 117,
			chemicalSerie: "Halogens",
			phase: "Synthetic",
			radiiCova: 0.0715,
			radiiVdw: 1.73,
			paulingE: 2.1,
			naturalMass: 294.2146,
		},
		{
			symbol: "Og",
			casId: "54039-04-2",
			group: 18,
			period: 7,
			name: "Oganesson",
			atomicNumber: 118,
			chemicalSerie: "Noble Gasses",
			phase: "Synthetic",
			radiiCova: 0.07,
			radiiVdw: 1.72,
			paulingE: 2.2,
			naturalMass: 294.214,
		},
	]; /*as ChemicalElementData[]*/

	let i = chemicalElementsData.length - 1;
	for (const elem of newData) {
		chemicalElementsData[i] = elem;
		i++;
	}
}

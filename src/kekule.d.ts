declare module "kekule/chemWidget" {
	const Kekule: {
		ChemWidget: {
			PeriodicTable: new (container: HTMLElement) => unknown;
			Viewer: new (container: HTMLElement) => unknown;
		};
		Editor: {
			Composer: new (container: HTMLElement) => unknown;
		};
	};
}

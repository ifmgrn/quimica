export class Page {
	parameters: { [key: string]: (value: string) => void } = {};

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	load(_container: HTMLElement): void {}
	cleanup() {}
}

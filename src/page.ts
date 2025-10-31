export class Page {
	container: HTMLElement;
	html?: string;
	class?: string;
	pM?: PageManager;
	static params: Record<string, string> = {};

	constructor(container: HTMLElement, pM?: PageManager) {
		this.container = container;
		this.pM = pM;
	}

	load(params: Record<string, string> = {}) {
		if (this.class) this.container.classList.add(this.class);
		if (this.html) {
			this.container.innerHTML = this.html;
			this.html = undefined;
		}

		return this.onload(this.container, params);
	}

	async unload() {
		await this.onunload();
		if (this.class) this.container.classList.remove(this.class);
		this.container.innerHTML = "";
	}

	async onload(_container: HTMLElement, _params: Record<string, string>) {}
	async onunload() {}
}

export class PageManager {
	container: HTMLElement;
	pages: Array<typeof Page>;
	currentPage: Page | undefined;

	constructor(container: HTMLElement, pages: Array<typeof Page>) {
		this.container = container;
		this.pages = pages;
	}

	async loadPage(page: typeof Page, params: Record<string, string> = {}) {
		if (this.currentPage) await this.currentPage.unload();

		this.currentPage = new page(this.container, this);
		await this.currentPage.load(params);
	}

	checkURL() {
		const urlParams = new URLSearchParams(window.location.search.toLowerCase());
		let params: Record<string, string> | undefined;

		for (const page of this.pages) {
			for (const [name, param] of Object.entries(page.params)) {
				if (urlParams.has(param)) {
					if (!params) params = {};
					params[name] = urlParams.get(param)!;
				}
			}
			if (params) return this.loadPage(page, params);
		}

		return this.loadPage(this.pages[0]);
	}
}

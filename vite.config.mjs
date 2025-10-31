import { defineConfig } from "vite";
import { copyFileSync } from "node:fs";
import { resolve } from "node:path";

const banner = `/*!
 * Copyright (c) 2025 ifmgrn
 * Licensed under the GNU AGPL-3.0 License.
 * See LICENSE.txt for details.
 */`;

export default defineConfig(({ command }) => ({
	base: "/quimica/",
	define: {
		__DEBUG__: command === "serve",
	},
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: `$debug: ${command === "serve"};`,
			},
		},
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: (id) => (id.includes("kekule") ? "kekule" : null),
			},
		},
	},
	plugins: [
		{
			name: "inject-banner",
			generateBundle(_options, bundle) {
				for (const file of Object.values(bundle)) {
					if (
						file.type === "chunk" &&
						file.code &&
						!file.name.includes("kekule")
					) {
						file.code = banner + file.code;
					}
				}
			},
		},
		{
			name: "copy-license",
			closeBundle() {
				const src = resolve(__dirname, "LICENSE.txt");
				const dest = resolve(__dirname, "dist", "LICENSE.txt");
				copyFileSync(src, dest);
			},
		},
	],
}));

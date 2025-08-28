import { defineConfig } from "vite";
import { copyFileSync } from "node:fs";
import { resolve } from "node:path";

const banner = `/*
    Copyright (c) 2025 John
    This code is licensed under the GNU GPL-3.0 License.
    See LICENSE.txt file for details.
*/\n`;

export default defineConfig({
	base: "/reacoes-quimicas/",
	plugins: [
		{
			name: "inject-banner",
			generateBundle(_options, bundle) {
				for (const file of Object.values(bundle)) {
					if (file.type === "chunk" && file.code) {
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
});

import esbuild from 'esbuild';
import process from 'process';
import fs from 'fs';
import path from 'path';

const outdir = 'dist';

const prod = (process.argv[2] === 'production');

const context = await esbuild.context({
    entryPoints: ['src/index.ts', 'styles/index.css'],
    bundle: true,
    minify: prod,
    sourcemap: prod ? false : 'inline',
    outdir: outdir,
    format: 'esm',
    splitting: true,
    loader: {
        '.ts': 'ts',
        '.js': 'js',
        '.css': 'css',
        '.html': 'text',
        '.woff2': 'file'
    },
    entryNames: '[dir]/[name]', 
    assetNames: '[dir]/[name]',
    chunkNames: '[dir]/[name]',
    target: ['chrome63', 'firefox67', 'safari12', 'edge79'],
    banner: {
        js: 
`/*
    Copyright (c) 2025 John
    This code is licensed under the GNU GPL-3.0 License.
    See LICENSE file for details.
*/`
    }
});

const dataToCopy = ['index.html', 'LICENSE.txt'];
for (const data of dataToCopy) {
    const target = path.join(outdir, data);
    try {
        await fs.promises.cp(data, target, { recursive: true, force: true });
    } catch (err) {
        console.error(`Error copying ${data}:`, err);
    }

    if (prod)
        continue;

    let fsWait = undefined;
    fs.watch(data, { persistent: true, recursive: true }, async (eventType) => {
        if (eventType === 'change' || eventType === 'rename') {
            clearTimeout(fsWait);
            
            fsWait = setTimeout(async () => {
                fsWait = undefined;

                try {
                    await fs.promises.cp(data, target, { recursive: true, force: true });
                } catch (err) {
                    console.error(`Error copying ${data}:`, err);
                }
            }, 300);
        }
    });
}

if (prod) {
	await context.rebuild();
	process.exit(0);
} else {
	await context.watch();
}
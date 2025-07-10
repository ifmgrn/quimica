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
    sourcemap: prod ? false : "inline",
    outdir: outdir,
    loader: {
        '.ts': 'ts',
        '.js': 'js',
        '.css': 'css',
        '.html': 'text',
        '.woff2': 'file'
    },
    entryNames: '[dir]/[name]', 
    assetNames: '[dir]/[name]',
    target: ['chrome58', 'firefox57', 'safari11', 'edge16']
});

const dataToCopy = ['index.html', 'reactions'];
for (const data of dataToCopy) {
    const target = path.join(outdir, data);
    try {
        await fs.promises.cp(data, target, { recursive: true });
    } catch (err) {
        console.error(`Error copying ${data}:`, err);
    }

    if (prod)
        continue;

    let fsWait = false;
    fs.watch(data, { persistent: true, recursive: true }, async (eventType) => {
        if (eventType === 'change' || eventType === 'rename') {
            if (fsWait) return;
            fsWait = setTimeout(() => {
                fsWait = false;
            }, 300);

            try {
                await fs.promises.cp(data, target, { recursive: true });
            } catch (err) {
                console.error(`Error copying ${data}:`, err);
            }
        }
    });
}

if (prod) {
	await context.rebuild();
	process.exit(0);
} else {
	await context.watch();
}
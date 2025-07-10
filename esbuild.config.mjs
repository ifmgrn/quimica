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

const dataToCopy = ['index.html', 'reação'];
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
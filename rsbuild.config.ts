import { defineConfig } from '@rsbuild/core';

export default defineConfig(({ command }) => ({
    server: {
        headers: {
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Embedder-Policy': 'require-corp',
            'Access-Control-Allow-Origin' : '*'
        }
    },
    resolve: {
        alias: {
            "data-structure-typed": require.resolve("data-structure-typed"),
        },
    },
    plugins: [],
    html: {
        template({ entryName }) {
            const templates = {
                index: './index.html',
                ...(command === 'dev' && {'test': './test/index.html'}),
            };
            return templates[entryName] || './index.html';
        },
    },
    source: {
        entry: {
            index: './src/main.js',
            ...(command === 'dev' && {'test': './test/main.ts'}),
        },
    },
}));

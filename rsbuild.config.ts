import { defineConfig } from '@rsbuild/core';

export default defineConfig({
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
        template: './index.html',
    },
    source: {
        entry: {
        index: './src/main.js',
        },
    },
});

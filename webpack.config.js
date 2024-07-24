
const path = require('path');
const Dotenv = require('dotenv-webpack');
const CopyPlugin = require("copy-webpack-plugin");


module.exports = () => {
    return {
        target: ['web'],
        entry: {
          index: path.resolve(__dirname, 'src', 'index.js'),
          voice: path.resolve(__dirname, 'src', 'voice.js'),
          //main: path.resolve(__dirname, 'src', 'main.js')
                },
        output: {
            path: path.resolve(__dirname, 'dist'),
            //filename: 'bundle.min.js',
            filename: '[name].js',
            library: {
                type: 'umd'
            }
        },
        plugins: [new CopyPlugin({
            // Use copy plugin to copy *.wasm to output folder.
            patterns: [{ from: 'node_modules/onnxruntime-web/dist/*.wasm', to: '[name][ext]' }]
        }),
        new Dotenv()],
        //mode: 'production'
        module: {
          
          },
        resolve: {
            fallback: {
              fs: false,
              path: false,
              crypto: false,
              os: false
            }
          }
    }
};
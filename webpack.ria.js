const path = require('path');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const WebpackBundleAnalyzer = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const Dotenv = require('dotenv-webpack');

// process html files in order to inject compiled files
const htmlPluginRIA = ['reia.html', 'overview.html'].map(
    (template) =>
        new HTMLWebpackPlugin({
            inject: 'body',
            hash: true,
            chunks: [path.parse(template).name],
            filename: template,
            template: path.resolve(__dirname, 'src/', template),
        })
);

module.exports = (env) =>
    merge(common(env), {
        entry: {
            reia: {
                import: [
                    path.resolve(__dirname, 'src/js', 'reia.js'),
                    path.resolve(__dirname, 'src/sass', 'main.scss'),
                ],
            },
            overview: {
                import: [
                    path.resolve(__dirname, 'src/js', 'overview.js'),
                    path.resolve(__dirname, 'src/sass', 'main.scss'),
                ],
            },
        },

        // default output folder.
        output: {
            filename: 'js/[name].js',
            path: path.resolve(__dirname, 'dist/reia'),
            clean: true,
        },

        plugins: [
            new WebpackBundleAnalyzer({
                analyzerMode: env.analyze ? 'server' : 'disabled',
            }),
            new MiniCssExtractPlugin({
                filename: 'css/[name].css',
            }),
            new Dotenv(),
        ].concat(htmlPluginRIA),
    });

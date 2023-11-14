const path = require('path');
const { merge } = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const WebpackBundleAnalyzer = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const Dotenv = require('dotenv-webpack');
const common = require('./webpack.common');

// process html files in order to inject compiled files
const htmlPluginWC = ['webcomponents.html'].map(
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
            webcomponents: {
                import: [
                    path.resolve(__dirname, 'src/js/webcomponents', 'LossScale.js'),
                    path.resolve(__dirname, 'src/js/webcomponents', 'DamageGraph.js'),
                    path.resolve(__dirname, 'src/js/webcomponents', 'LossGraph.js'),
                ],
            },
        },

        // default output folder.
        output: {
            filename: 'js/[name].js',
            path: path.resolve(__dirname, 'dist/webcomponents'),
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
        ].concat(htmlPluginWC),
    });

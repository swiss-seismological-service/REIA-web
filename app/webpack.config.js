const path = require('path');
const fs = require('fs');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const WebpackBundleAnalyzer = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

// fetch all html files in source folder
const templateFiles = fs
    .readdirSync(path.resolve(__dirname, 'src/'))
    .filter((file) => path.extname(file).toLowerCase() === '.html');

// process html files in order to inject compiled files
const htmlPluginEntries = templateFiles.map(
    (template) =>
        new HTMLWebpackPlugin({
            inject: 'body',
            hash: true,
            scriptLoading: 'blocking',
            filename: template,
            template: path.resolve(__dirname, 'src/', template),
        })
);

module.exports = {
    entry: {
        index: [
            path.resolve(__dirname, 'src/js', 'index.js'),
            path.resolve(__dirname, 'src/sass', 'main.scss'),
        ],
    },

    mode: process.env.NODE_ENV,

    // default output folder. Possibly overwritten in subconfig
    output: {
        filename: 'js/[name].js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },

    module: {
        rules: [
            // loader for JavaScript
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ['babel-loader'],
            },
            // loader for SASS
            {
                test: /\.((c|sa|sc)ss)$/i,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader, // extracts css into separate file
                        options: {
                            publicPath: '../',
                        },
                    },
                    'css-loader', // css loader
                    {
                        loader: 'postcss-loader', // postprocessing css
                        options: {
                            postcssOptions: {
                                plugins: [
                                    [
                                        'autoprefixer',
                                        {
                                            // Options
                                        },
                                    ],
                                ],
                            },
                        },
                    },
                    { loader: 'sass-loader', options: { sourceMap: true } }, // sass files loader
                ],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
                generator: {
                    // emit: false,
                    filename: 'images/[name][ext][query]',
                },
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'fonts/[name][ext][query]',
                },
            },
        ],
    },

    target: 'web',
    devtool: 'eval-source-map',

    /* Development Server Configuration */
    devServer: {
        static: {
            directory: path.resolve(__dirname, '../dist'),
            publicPath: '/',
            watch: true,
        },
        client: {
            overlay: true,
        },
        open: true,
        compress: true,
        hot: false,
        host: '127.0.0.1',
        port: 5000,
    },

    /* File watcher options */
    watchOptions: {
        aggregateTimeout: 300,
        poll: 300,
        ignored: /node_modules/,
    },

    /* Optimization configuration */
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                parallel: true,
            }),
            new CssMinimizerPlugin(),
        ],
    },

    /* Performance treshold configuration values */
    performance: {
        maxEntrypointSize: 512000,
        maxAssetSize: 512000,
    },

    plugins: [
        new WebpackBundleAnalyzer(),
        new MiniCssExtractPlugin({
            filename: 'css/style.css',
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve('src', 'images'),
                    to: path.resolve('dist', 'images'),
                    toType: 'dir',
                    globOptions: {
                        ignore: ['*.DS_Store', 'Thumbs.db'],
                    },
                },
            ],
        }),
    ].concat(htmlPluginEntries),
};

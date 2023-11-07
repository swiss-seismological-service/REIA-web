const path = require('path');
const fs = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const Dotenv = require('dotenv-webpack');

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
            chunks: ['webcomponents', path.parse(template).name],
            scriptLoading: 'blocking',
            filename: template,
            template: path.resolve(__dirname, 'src/', template),
        })
);

// postcss config
const postCSSLoader = {
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
};

module.exports = {
    entry: {
        webcomponents: {
            import: [
                path.resolve(__dirname, 'src/js/webcomponents', 'LossScale.js'),
                path.resolve(__dirname, 'src/js/webcomponents', 'DamageGraph.js'),
                path.resolve(__dirname, 'src/js/webcomponents', 'LossGraph.js'),
            ],
        },
        reia: {
            import: [
                path.resolve(__dirname, 'src/js', 'reia.js'),
                path.resolve(__dirname, 'src/sass', 'main.scss'),
            ],
            dependOn: 'webcomponents',
        },
        overview: {
            import: [
                path.resolve(__dirname, 'src/js', 'overview.js'),
                path.resolve(__dirname, 'src/sass', 'minimal.scss'),
            ],
            dependOn: 'webcomponents',
        },
    },

    mode:
        process.env.NODE_ENV === 'production' // || process.env.NODE_ENV === 'analyze'
            ? 'production'
            : 'development',

    // default output folder.
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
            // loader for page SASS
            {
                test: /\.((c|sa|sc)ss)$/i,
                exclude: [/\.wc.scss$/, /node_modules/],
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader, // extracts css into separate file
                        options: {
                            publicPath: '../',
                        },
                    },
                    'css-loader', // css loader
                    postCSSLoader,
                    { loader: 'sass-loader', options: { sourceMap: true } }, // sass files loader
                ],
            },
            // loader for WebComponents SASS
            {
                test: /\.wc.scss$/,
                type: 'asset/source',
                use: [
                    postCSSLoader,
                    {
                        loader: 'sass-loader',
                        options: {
                            sassOptions: {
                                includePaths: [path.resolve(__dirname, 'node_modules')],
                                outputStyle: 'compressed',
                            },
                        },
                    },
                ],
            },
            {
                test: /\.(png|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
                generator: {
                    emit: true,
                    filename: 'images/[name][ext][query]',
                },
            },
            {
                test: /\.(svg)$/i,
                type: 'asset',
                generator: {
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
            {
                test: /\.(csv)$/i,
                use: ['csv-loader'],
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
        host: 'localhost',
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
        runtimeChunk: 'single',
    },

    /* Performance treshold configuration values */
    performance: {
        maxEntrypointSize: 512000,
        maxAssetSize: 512000,
    },

    plugins: [
        new WebpackBundleAnalyzer({
            analyzerMode: process.env.NODE_ENV === 'analyze' ? 'server' : 'disabled',
        }),
        new MiniCssExtractPlugin({
            filename: 'css/[name].css',
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
                {
                    from: path.resolve('src', 'data', 'lang'),
                    to: path.resolve('dist', 'lang'),
                    toType: 'dir',
                    globOptions: {
                        ignore: ['*.DS_Store', 'Thumbs.db'],
                    },
                },
            ],
        }),
        new Dotenv(),
    ].concat(htmlPluginEntries),
};

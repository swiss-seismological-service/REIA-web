const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const postCSSLoader = {
    loader: 'postcss-loader', // postprocessing css
    options: {
        postcssOptions: {
            plugins: [['postcss-preset-env']],
        },
    },
};

module.exports = (env) => ({
    target: 'web',
    mode: env.production ? 'production' : 'development',
    devtool: env.production ? false : 'source-map',

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
                exclude: /\.wc.scss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader, // extracts css into separate file
                    },
                    'css-loader',
                    postCSSLoader,
                    'sass-loader',
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
                                includePaths: [
                                    path.resolve(__dirname, 'node_modules', 'bootstrap'),
                                ],
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
                    filename: 'images/[name][ext][query]',
                },
            },
            {
                test: /.svg$/,
                type: 'asset', // inline if < 20kb, else resource
                parser: {
                    dataUrlCondition: {
                        maxSize: 20 * 1024,
                    },
                },
                use: 'svgo-loader',
                generator: {
                    filename: 'images/[name][ext][query]',
                },
            },
            {
                resourceQuery: /rawSVG/,
                type: 'asset/source',
                use: 'svgo-loader',
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
                generator: {
                    filename: 'data/[name][ext][query]',
                },
            },
            {
                test: /\.html$/i,
                loader: 'html-loader',
            },
            {
                test: /\.json$/i,
                type: 'asset/resource',
                include: path.resolve(__dirname, 'src/data/lang'),
                generator: {
                    filename: 'data/lang/[name][ext][query]',
                },
            },
        ],
    },

    /* Development Server Configuration */
    devServer: {
        static: {
            directory: path.resolve(__dirname, 'dist'),
            publicPath: '/',
        },
        watchFiles: ['src/**/*'],
        open: false,
        hot: false,
        host: 'localhost',
        port: 5000,
    },

    /* Optimization configuration */
    optimization: {
        minimize: true,
        minimizer: [new CssMinimizerPlugin()],
        splitChunks: {
            cacheGroups: {
                styles: {
                    name: 'styles',
                    type: 'css/mini-extract',
                    chunks: 'all',
                    enforce: true,
                },
            },
        },
    },

    /* Performance treshold configuration values */
    performance: {
        maxEntrypointSize: 500 * 1024,
        maxAssetSize: 800 * 1024,
    },
});

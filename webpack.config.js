const path = require('path');
const glob = require('glob');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const PurifyCSSPlugin = require('purifycss-webpack');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const RobotstxtPlugin = require('robotstxt-webpack-plugin').default;

const folderDistribute = 'dist';
const switchMinify = false;
const useSSL = true;
const cssConfigEnvironments = {
    'dev': ['style-loader', 'css-loader?sourceMap', 'sass-loader'],
    'prod': ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: ['css-loader', 'sass-loader']
    })
}

const envIsProd = process.env.NODE_ENV === 'prod'
const cssConfig = envIsProd ? cssConfigEnvironments['prod'] : cssConfigEnvironments['dev'];

module.exports = {
    entry: {
        app: ['./src/app.js']
    },
    output: {
        path: path.resolve(__dirname, folderDistribute),
        filename: '[name].bundle.js'
    },
    module: {
        rules: [
            {                                                                                   // Converts sass to css
                test: /\.(sass|scss)$/,
                use: cssConfig
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loaders: [
                    'file-loader?name=img/[name].[ext]',                                        // See https://github.com/webpack-contrib/file-loader
                    'image-webpack-loader?bypassOnDebug'                                        // See https://github.com/tcoopman/image-webpack-loader
                ]
            },
            {
                test: /\.hbs$/,
                loader: 'handlebars-loader',
                query: {
                    inlineRequires: '/img/'
                }
            }
        ]
    },
    devServer: {
        contentBase: path.join(__dirname, folderDistribute),                                    // Configure development server
        compress: true,
        port: 8080,
        https: useSSL,
        stats: 'errors-only',
        hot: true,
        open: false,
        openPage: ''
    },
    plugins: [
        new CleanWebpackPlugin(
          folderDistribute,
          {
            dry: !envIsProd,
          }
        ),
        new HtmlWebpackPlugin({                                                                 // Builds .html, see https://github.com/jantimon/html-webpack-plugin
            title: 'Hello World from HtmlWebpackPlugin',
            minify: {
                collapseWhitespace: switchMinify
            },
            hash: true,
            template: './src/content.hbs'
        }),
        new FaviconsWebpackPlugin({
          logo: './src/img/logo.png',
          prefix: 'img/favicons/icons-[hash]/',
          emitStats: false,
          persistentCache: true,
          background: '#fff',
          title: 'Webpack App',
          icons: {
            favicons: true,
            firefox: true,
            android: true,
            appleIcon: true,
            appleStartup: true,
            opengraph: true,
            twitter: true,
            yandex: false,
            windows: false,
            coast: false
          }
        }),
        new RobotstxtPlugin({
            userAgent: '*',
            disallow: '',
        }),
        new ExtractTextPlugin({                                                                 // Builds .css, see https://github.com/webpack-contrib/extract-text-webpack-plugin
            filename: '[name].css',
            allChunks: true,
            disable: !envIsProd
        }),
        new webpack.HotModuleReplacementPlugin(),                                               // Enable HMR, see https://webpack.js.org/guides/hot-module-replacement/
        new webpack.NamedModulesPlugin(),                                                       // See https://webpack.js.org/plugins/named-modules-plugin/
        new PurifyCSSPlugin({
            // Give paths to parse for rules. These should be absolute!
            paths: glob.sync(path.join(__dirname, 'src/*.html')),
            minimize: envIsProd,
            purifyOptions: {
              info: true,
              whitelist: [ '*:not*' ]
            }
        })
    ]
};

const path = require('path');
const glob = require('glob');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const PurifyCSSPlugin = require('purifycss-webpack');
const bootstrapEntryPoints = require('./webpack.bootstrap.config.js');

const folderDistribute = 'dist';
const switchMinify = false;
const useSSL = true;
const cssConfigEnvironments = {
  'dev': ['style-loader', 'css-loader?sourceMap', 'sass-loader', {
    loader: 'sass-resources-loader',
    options: {
      // Provide path to the file with resources
      resources: [
        './src/resources.scss'
      ],
    },
  }],
  'prod': ExtractTextPlugin.extract({
    fallback: 'style-loader',
    use: ['css-loader', 'sass-loader', {
      loader: 'sass-resources-loader',
      options: {
        // Provide path to the file with resources
        resources: [
          './src/resources.scss'
        ],
      },
    }]
  })
}

const envIsProd = process.env.NODE_ENV === 'prod'
const cssConfig = envIsProd ? cssConfigEnvironments['prod'] : cssConfigEnvironments['dev'];
let bootstrapConfig = envIsProd ? bootstrapEntryPoints.prod : bootstrapEntryPoints.dev;

module.exports = {
  entry: {
    app: './src/app.js',
    bootstrap: bootstrapConfig                                                            // See https://github.com/shakacode/bootstrap-loader
  },
  output: {
    path: path.resolve(__dirname, folderDistribute),
    filename: '[name].bundle.js'
  },
  module: {
    rules: [
      { test: /\.scss$/, use: cssConfig },                                                // Converts sass to css
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          'file-loader?name=images/[name].[ext]',                                         // See https://github.com/webpack-contrib/file-loader
          'image-webpack-loader?bypassOnDebug&optimizationLevel=7&interlaced=false'       // See https://github.com/tcoopman/image-webpack-loader
        ]
      },
      // Bootstrap 3, see https://github.com/shakacode/bootstrap-loader#installation
      { test: /\.(woff2?|svg)$/, use: 'url-loader?limit=10000&name=fonts/[name].[ext]' },
      { test: /\.(ttf|eot)$/, use: 'file-loader?name=fonts/[name].[ext]' },
      { test: /bootstrap-sass[\/\\]assets[\/\\]javascripts[\/\\]/, use: 'imports-loader?jQuery=jquery' }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, folderDistribute),                                    // Configure development server
    compress: true,
    port: 8080,
    https: useSSL,
    stats: 'errors-only',
    hot: true,
    //open: true,
    openPage: ''                                                                      // Bugfix https://stackoverflow.com/questions/44924263/webpack-dev-server-opens-localhost8080-undefined
  },
  plugins: [
    new HtmlWebpackPlugin({                                                                 // Builds .html, see https://github.com/jantimon/html-webpack-plugin
      title: 'Hello World from HtmlWebpackPlugin',
      minify: {
        collapseWhitespace: switchMinify
      },
      hash: true,
      template: './src/content.html'
    }),
    new ExtractTextPlugin({                                                                 // Builds .css, see https://github.com/webpack-contrib/extract-text-webpack-plugin
      filename: './css/[name].css',
      allChunks: true,
      disable: !envIsProd
    }),
    new webpack.HotModuleReplacementPlugin(),                                               // Enable HMR, see https://webpack.js.org/guides/hot-module-replacement/
    new webpack.NamedModulesPlugin(),                                                       // See https://webpack.js.org/plugins/named-modules-plugin/
    new PurifyCSSPlugin({
      // Give paths to parse for rules. These should be absolute!
      paths: glob.sync(path.join(__dirname, 'src/*.html')),
    })
  ]
};

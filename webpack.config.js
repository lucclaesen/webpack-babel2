var path = require("path");
var webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlPlugin = require("html-webpack-plugin");


const DEVELOPMENT = process.env.NODE_ENV === 'development';

var entries = (DEVELOPMENT)
    ? [
        './src/js/index.js',
        'webpack/hot/dev-server',
        'webpack-dev-server/client?http://localhost:8080'
        ]
    : [
        './src/js/index.js'
        ];

var plugins = (DEVELOPMENT)
    ? [
        new webpack.HotModuleReplacementPlugin()
    ]
    : [
          new HtmlPlugin({
            template : "./src/index-template.html"
        })
    ];

plugins.push(new ExtractTextPlugin("style.css"));


module.exports = {
    entry: entries,
    plugins: plugins,
    devtool : 'source-map',
    output: {
        path: path.join(__dirname, 'dist'),
        publicPath: DEVELOPMENT ?  '/dist/' : './', 
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loaders: ['babel-loader'],
                exclude: '/node_modules/'
            }
        ],
        rules: [
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader"
                })
            }
        ]
    }
};
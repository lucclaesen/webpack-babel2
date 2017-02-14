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
        // new webpack.optimize.UglifyJsPlugin()
    ];


var stylesheetName = DEVELOPMENT ? "style.css" : "style-[hash:10].css";
var bundleName = DEVELOPMENT ? "bundle.js" : "bundle-[hash:10].js"


plugins.push(new ExtractTextPlugin(stylesheetName));
plugins.push(new HtmlPlugin({
            template : "./src/index-template.html"
        }));

module.exports = {
    entry: entries,
    plugins: plugins,
    devtool : 'source-map',
    output: {
        path: path.join(__dirname, 'dist'),
        publicPath: '/', 
        filename: bundleName
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
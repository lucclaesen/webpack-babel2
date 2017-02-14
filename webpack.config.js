var path = require("path");
var webpack = require("webpack");
// var HtmlPlugin = require("html-webpack-plugin");

const DEVELOPMENT = process.env.NODE_ENV === 'development';

var entries = (DEVELOPMENT)
    ? [
        './src/index.js',
        'webpack/hot/dev-server',
        'webpack-dev-server/client?http://localhost:8080'
        ]
    : [
        './src/index.js'
        ];

var plugins = (DEVELOPMENT)
    ? [
        new webpack.HotModuleReplacementPlugin()
    ]
    : [];
    // : [ 
    //     new HtmlPlugin({
    //         template: "index-template.html"
    //     })
    // ];


module.exports = {
    entry: entries,
    plugins: plugins,
    devtool : 'source-map',
    output: {
        path: path.join(__dirname, 'dist'),
        publicPath: '/dist/', //
        filename: 'bundle.js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loaders: ['babel-loader'],
                exclude: '/node_modules/'
            }
        ]
    }
};
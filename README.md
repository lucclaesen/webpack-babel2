
I'm following https://www.youtube.com/watch?v=eWmkBNBTbMM here, which is a really nice stepwise setup of webpack

- Step 1: creating a simple application without webpack, using http-server as a static file server. At this point, youtube
need to set up an index.js file, an index.html file with a script tag referencing the former as a src. In package.json
you simply need a "start" : "http-server -p 3000" script to verify that all works.

Of course, this route doesn't allow you to support modular javascript -- which is the whole point of webpack.

- Step 2: first intro of webpack.
* npm install --save-dev webpack
* create a commonjs dependency to a message object using module.exports and require-call.
* create a build script that runs webpack with parameters: "build": "webpack ./src/index.js ./dist/bundle.js --watch"
* adjust index.html to refer to the bundle.js file
* first build, then run the http-server again

The most important shortcoming of this setup is that is is difficult to maintain webpack options as script parameters.
We need a config

-Step 3: create a webpack.config.js that specifies only entry and output. This is how it looks at this stage:

        var path = require("path");
        module.exports = {
            entry: ['./src/index.js'],
            output: {
                path: path.join(__dirname, 'dist'),
                publicPath: '/dist/', //
                filename: 'bundle.js'
            }
        };
 The entry section specifies what will eventually end up in the bundle: webpack will trace all of the module dependencies
 starting from any of the entry points.

 The most important thing in the output specification is the publisPath settings, which determines how the webpack output
 will be served and hence how it should be referenced from within the browser.

 Given this, the "build" script can be simplified to just "webpack --watch"

At this point, the major drawback is that you need two processes to get this thing running in dev mode: there needs to
be a build process in watch mode, looking for eventual compilation and bundle.js creation and another process that
serves the whole thing up.

 - Step 4: replacing http-server by webpack-dev-server: this takes care of rebuilding the assets into an in memory bundle and
 serving it up. It support live / hot reloading out of the box and it does so by creating a socketIo relationship with the
 browser. The browser will be instructed to refresh whenever a new bundle is being emitted.

 Accomplishing this step is as simple as 
 * npm installing webpack-dev-server
 * replacing the "start" script by just calling webpack-dev-server
 * remove the --watch flag from the build script, since dev server will no longer serve the bundle in dist. "build" has
 become a script to create a production bundle.

 - Step 4: setting up HMR (Hot Module Replacement).
 * HMR? A development mode feature that goes one step further than live reloading. It syncs the browser with changes in adjust
 bundle, but without refreshing the page. Instead, 'dirty' chunks in the bundle are being replaced while the application is
 running in the page. Because no page refresh takes place, the state of the application is being preserved.
 * Setting HRM up involves that webpack-dev-server is used as a middleware, instead of as a process in itself. The easiest
 thing is to set up a node process that references webpack-dev-server as a middleware.

dev-server.js:

        var WebPackDevServer = require("webpack-dev-server");
        var webpack = require("webpack");
        var config = require("./webpack.config.js");
        var path = require("path");

        var compiler = webpack(config);
        var server = new WebPackDevServer(compiler, {
            hot: true,
            filename: config.output.filename,
            publicPath: config.output.publicPath,
            stats : { colors: true}
        });
        server.listen(8080, 'localhost', function() {});

Also change the src/index.js to accept HMR: add

        if(module.hot) {
            module.hot.accept();
        }


 * HRM requires some changes in the webpack.config

        var path = require("path");
        var webpack = require("webpack");

        module.exports = {
            entry: [
                './src/index.js',
                'webpack/hot/dev-server',
                'webpack-dev-server/client?http://localhost:8080'
                ],
            plugins: [
                new webpack.HotModuleReplacementPlugin()
            ],
            output: {
                path: path.join(__dirname, 'dist'),
                publicPath: '/dist/', //
                filename: 'bundle.js'
            }
        };

    * Finally, your start script needs to run the node server instead of dev-server: 


Note however that you definity don't want HRM in production. So we need to find a way to branch the webpack setup according
to the target environment.

- Step 5: maintaining different webpack configurations (production and development). One thing you most certainly want
to avoid is enabling HRM and shipping all the js to support it to production. One way this can be done is thus:
* specifiy for every npm script which environment is targetted. Scripts set environment variables.
    - by convention, the environment variable that all npm modules look at is NODE_ENV object, on which {production, development} variables can be set
    - this can be checked in code by means of checking whether process.env.production is defined or another
    - thus, our npm scripts become:
            "scripts": {
                "build": "NODE_ENV=production webpack",
                "dev": "NODE_ENV=development node ./dev-server.js"
        },

* Then, in webpack.config, we branch on the environment variable, defining distinct values for entries and plugins,
depending on whether the node env is developemnt or not:

webpack.config.js:

        var path = require("path");
        var webpack = require("webpack");

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
            : [ ];


        module.exports = {
            entry: entries,
            plugins: plugins,
            output: {
                path: path.join(__dirname, 'dist'),
                publicPath: '/dist/', //
                filename: 'bundle.js'
            }
        };


- Step 6: pluging in a transpiler (babel) for support of ES6+ (es2015 and stage-0).
    * npm install babel-core babel-loader babel-preset-es2015 babel-preset-stage-0
    * create a .babelrc file with the presets
        {
            "presets" : ["es2015", "stage-0"]
        }
    * configure the babel loader for all js files outside node_modules
        module: {
        loaders: [
            {
                test: /\.js$/,
                loaders: ['babel-loader'],
                exclude: '/node_modules/'
            }
    * setup vscode to support javascript language services for the es2015 dialect:
        - create a jsconfig.json with the following contents:
        {
            "compilerOptions": {
                "target": "ES6"
            },
            "exclude": [
                "node_modules", "dist"
            ]
        }

        Note that the mere presence of a jsconfig file at the root enables javascript language services. Note
        also that the language services are disabled for both node_modules and the dist folder

    * install eslint and hook it up to vscode:
        - npm install --save-dev eslint
        - download the vscode eslint extension + run the command (from palette) to create a default .eslintrc.json file
       
- Step 7: enabling source maps: just add  devtool : 'source-map' to webpack.config

- Step 8: styling -- we're gonna skip this part. 

- Step 9: make the dist folder self contained -- i.e. make it deployable. The problem is the index.html file, which lives
outside of the dist folder by now.
 * npm install --save-dev html-webpack-plugin
 * create a template html file under the src dir without script (or link) tags
 * in webpack.config.js
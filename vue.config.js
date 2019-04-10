let path = require('path')
let glob = require('glob')
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
// const IS_PROD = ['production', 'prod'].includes(process.env.NODE_ENV);
// const CompressionWebpackPlugin = require('compression-webpack-plugin');
// const productionGzipExtensions = ['js', 'css']
// const resolve = dir => path.resolve(__dirname, dir);

// const CompressionWebpackPlugin = require('compression-webpack-plugin');
// const zopfli = require("@gfx/zopfli");
// const BrotliPlugin = require("brotli-webpack-plugin");
// const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i;

//配置pages多页面获取当前文件夹下的html和js
function getEntry(globPath) {
    let entries = {},
        basename, tmp, pathname, appname;

    glob.sync(globPath).forEach(function (entry) {
        basename = path.basename(entry, path.extname(entry));
        // console.log(entry)
        tmp = entry.split('/').splice(-3);
        console.log(tmp)
        pathname = basename; // 正确输出js和html的路径

        // console.log(pathname)
        entries[pathname] = {
            entry: 'src/' + tmp[0] + '/' + tmp[1] + '/' + tmp[1] + '.js',
            template: 'src/' + tmp[0] + '/' + tmp[1] + '/' + tmp[2],
            title: tmp[2],
            filename: tmp[2]
        };
    });
    return entries;
}

let pages = getEntry('./src/pages/**?/*.html');
console.log(pages)
//配置end

module.exports = {
    lintOnSave: false, //禁用eslint
    baseUrl: process.env.NODE_ENV === "production" ? 'https://www.mycdn.com/' : '/',
    productionSourceMap: false,
    pages,
    devServer: {
        index: 'page1.html', //默认启动serve 打开page1页面
        open: process.platform === 'darwin',
        host: '',
        port: 8088,
        https: false,
        hotOnly: false,
        proxy: {
            '/xrf/': {
                target: 'http://reg.tool.hexun.com/',
                changeOrigin: true,
                pathRewrite: {
                    '^/xrf': ''
                }
            },
            '/wa/': {
                target: 'http://api.match.hexun.com/',
                changeOrigin: true,
                pathRewrite: {
                    '^/wa': ''
                }
            }
        }, // 设置代理
        before: app => {
        }
    },
    chainWebpack: config => {
        // 修复HMR
        // config.resolve.symlinks(true);

        // //修复 Lazy loading routes Error
        // config.plugin('html').tap(args => {
        //     args[0].chunksSortMode = 'none';
        //     return args;
        // });
        // 添加别名
        // config.resolve.alias
        //     .set('@', resolve('src'))
        //     .set('assets', resolve('src/assets'))
        //     .set('components', resolve('src/components'))
        //     .set('static', resolve('src/static'));
        config.module
            .rule('images')
            .use('url-loader')
            .loader('url-loader')
            .tap(options => {
                // 修改它的选项...
                options.limit = 100
                return options
            })
        Object.keys(pages).forEach(entryName => {
            config.plugins.delete(`prefetch-${entryName}`);
        });
        if (process.env.NODE_ENV === "production") {
            config.plugin("extract-css").tap(() => [{
                path: path.join(__dirname, "./dist"),
                filename: "css/[name].[contenthash:8].css"
            }]);
        }
    },
    configureWebpack: config => {
        if (process.env.NODE_ENV === "production") {
            config.output = {
                path: path.join(__dirname, "./dist"),
                filename: "js/[name].[contenthash:8].js"
            };
        }
        // if (IS_PROD) {
        //     const plugins = [];
        //     plugins.push(
        //         new CompressionWebpackPlugin({
        //             algorithm(input, compressionOptions, callback) {
        //                 return zopfli.gzip(input, compressionOptions, callback);
        //             },
        //             compressionOptions: {
        //                 numiterations: 15
        //             },
        //             minRatio: 0.99,
        //             test: productionGzipExtensions
        //         })
        //     );
        //     plugins.push(
        //         new BrotliPlugin({
        //             test: productionGzipExtensions,
        //             minRatio: 0.99
        //         })
        //     );
        //     config.plugins = [
        //         ...config.plugins,
        //         ...plugins
        //     ];
        // }
        // // 配置 externals, import 的包(package)打包到 bundle 中，而是在运行时(runtime)再去从外部获取这些扩展依赖
        // config.externals = {
        //     'vue': 'Vue',
        //     'vue-router': 'VueRouter',
        //     'vuex': 'Vuex',
        //     'axios': 'axios'
        // }
    }
}

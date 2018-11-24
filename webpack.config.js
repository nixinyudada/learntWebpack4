// 基于node的 比如遵循commonjs 规范
let path = require("path")
let HtmlWebpackPlugin = require("html-webpack-plugin"); // -> note in md
let CleanWebpackPlugin = require("clean-webpack-plugin");  // -> note in md
let webpack = require("webpack");
let ExtractTextWebpackPlugin = require("extract-text-webpack-plugin")
// let MiniCssTractPlugin = require("mini-css-extract-plugin");
// 如果css和less需要单独打包
let lessExtractTextWebpackPlugin = new ExtractTextWebpackPlugin({
    filename:"css/less.css",
    disable:true
});
let cssExtractTextWebpackPlugin = new ExtractTextWebpackPlugin({
    filename:"css/css.css",
    disable:false
});
let PurifycssWebpack = require("purifycss-webpack")
let glob = require("glob");

let CopyWebpackPlugin = require("copy-webpack-plugin")

module.exports = {
    //entry:["./src/index.js","./src/index2.js"],
    //entry:"./src/index.js", // 入口
    entry:{
        index:"./src/index.js",
        index2:"./src/index2.js"
    },
    output:{
        filename:"[name].[hash:8].js", // <- 两个入口(entry:)需要两个出口(output:),[name]是对应entyr的文件名称
        // filename:"build.[hash:8].js",  // 随机哈希防止文件缓存，这里设置为8位，默认是20位
        // path 必须是绝对路径
        path:path.resolve('./build')
    },  // 出口
    devServer:{
        contentBase:"./build", // 以此文件作为服务器
        port:3000,       // 指定端口
        compress:true,   // 启动服务器压缩
        open:true, // 自动打开浏览器
        hot:true,    // 热更新
    }, // 开发服务器
    module:{},  // 配置模块
    plugins:[
        new CopyWebpackPlugin([
            {
                from:'./src/doc',
                to:'public'  // <- 这里是去找 path:path.resolve('./build'),也就是build下的public文件夹
            }// 这是一个数组，可见可以传入多个值，可以拷贝多个文件
        ]),
        lessExtractTextWebpackPlugin,
        cssExtractTextWebpackPlugin,
        // new MiniCssTractPlugin({
        //     filename:"css/index.css"
        // }),
        new webpack.HotModuleReplacementPlugin,
        new CleanWebpackPlugin(['./build']),
        new HtmlWebpackPlugin({
            filename:"index.html", // 指定打包后的文件名
            template:"./src/index.html",
            title:"webpack@4",
            hash:true, // 这个好像不写也行，应该是默认为 -> true
            chunks:["index"], // <- 入口文件的key值决定了这个html所引的js文件
            minify:{
                removeAttributeQuotes:true,  // 删除打包之后html中属性的双引号
                collapseWhitespace:true,   // 压缩成一行
            }
        }),
        new HtmlWebpackPlugin({
            filename:"index2.html", // 指定打包后的文件名
            template:"./src/index2.html",
            title:"webpack@4",
            hash:true, // 这个好像不写也行，应该是默认为 -> true
            chunks:["index2"],   // <- 入口文件的key值决定了这个html所引的js文件
            minify:{
                removeAttributeQuotes:true,  // 删除打包之后html中属性的双引号
                collapseWhitespace:true,   // 压缩成一行
            }
        }),
        // css文件中没用到的类会被删除 ^ ^  注意这个插件必须得放在HtmlWebpackPlugin 之后！
        // 刚刚试了下在js控制样式时调用class类名，居然这样就不能使用了！！！ /@`@/ , 所以对于我来说暂时就不使用了。。。
        // new PurifycssWebpack({  
        //     paths:glob.sync(path.resolve('src/*.html'))
        // })
    ],  // 插件的配置
    mode:"development", // 可以更改模式
    resolve:{},  // 配置解析
    module:{
        rules:[
            {
                test:/\.css$/,
                use:cssExtractTextWebpackPlugin.extract({ 
                    fallback:'style-loader',                    
                    use:[
                      /*{
                            loader:'style-loader'  此时css通过link引入，也就不需要style-loader了
                        },*/
                       // MiniCssTractPlugin.loader, <- 另外一种插件的用法
                        {
                            loader:'css-loader'
                            
                        },{
                            loader:'postcss-loader'
                        }
                    ]
                }),
            },
            {
                test:/\.less$/,
                use:lessExtractTextWebpackPlugin.extract({
                    fallback:'style-loader',                    
                    use:[
                     //   {loader:'style-loader'},   <-  这里同样不需要 style-loader
                     //    MiniCssTractPlugin.loader,  <- 另外一种插件的用法
                        {loader:'css-loader'},
                        {loader:'less-loader'}
                    ]
                })
            }
        ]
    }
}



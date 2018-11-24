- 本地安装

```
npm install webpack webpack-cli -D
```

`-D` -> 开发环境下安装

1. index.js 主文件 引入其他模块文件 比如 js文件夹下的 app.js -> 这里把 app.js 看作一个模块组件打包到index.js总文件中一起打包
    `import "./js/app.js"`


- `webpack.config.js` 的配置

```js

// 基于node的 比如遵循commonjs 规范

module.exports = {
    entry:"", // 入口
    output:{},  // 出口
    devServer:{}, // 开发服务器
    module:{},  // 配置模块
    plugins:[],  // 插件的配置
    mode:"development", // 可以更改模式
    resolve:{},  // 配置解析
}

```





- 在 webpack 中 配置开发服务器 webpack-dev-server

```
npm install webpack-dev-server
```



- 将开发环境下src文件夹中的文件打包到build文件中，并且生成index.html
    1. 使用插件:将html打包到build并且自动引入build.js   ->  "html-webpack-plugin"

    ```js
    plugins:[
        new HtmlWebpackPlugin({
            template:"./src/index.html",  // 需要打包的模板，就是开发环境下src下的html文件
            title:"webpack@4", //  <title><%= htmlWebpackPlugin.options.title %></title>
            minify:{  // 这里我理解位 -> mini 化  -> 就是压缩打包之后的html文件
                removeAttributeQuotes:true,  // 删除打包之后html中属性的双引号
                collapseWhitespace:true,   // 压缩成一行
            }
        })
    ],  // 插件的配置
    ```

    2. 使用插件:删除每次打包后之前所剩余的多余的文件   -> "clean-webpack-plugin"
        `npm install clean-webpack-plugin -D`

    3. 如果将 `entry` 的 `value` 写成一个数组，那么就可以同时打包这两个js文件！
        - ` entry:["./src/index.js","./src/index2.js"],`  <- 比如这样
    4. 但是我们需要生成两个或者是对应得文件名，那么可能就还需要再定义两个出口文件
        - 比如这样：
        ```js
        filename:"[name].[hash:8].js", // <- 两个入口(entry:)需要两个出口(output:),[name]是对应entyr的文件名称
        // 当然还有在htmlwebpackplugin插件中配置filename:
        ```
    5. 除了生成对应个数的html文件，还有指定该html文件应该引用的js文件，这里需要使用插件
        - 比如这样：需要配置`chunks`,以及同上述一样需要配置`filename`
        ```js
        plugins:[
        new CleanWebpackPlugin(['./build']),
        new HtmlWebpackPlugin({
            filename:"index.html", // 指定打包后的文件名
            template:"./src/index.html",
            title:"webpack@4",
            hash:true, // 这个好像不写也行，应该是 只要上面文件名用的是hash的写法，这里就直接是 true 了  比如这样-> filename:"[name].[hash:8].js"
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
            hash:true, // 这个好像不写也行，应该是 只要上面filename文件名用的是hash的写法，这里就直接是 true 了  比如这样 -> filename:"[name].[hash:8].js" 
            chunks:["index2"],   // <- 入口文件的key值决定了这个html所引的js文件
            minify:{
                removeAttributeQuotes:true,  // 删除打包之后html中属性的双引号
                collapseWhitespace:true,   // 压缩成一行
            }
        })
        ],  // 插件的配置
        ```

    6. loader ! -> 插件和loader在webpack中都是很重要的知识点。  有配置loader的情况下，就不需要配置webpack的热更新插件了，因为loader自带有这个功能
        - style-loader -> 把css解析完之后变成`<style>`标签插入html页面
        - css-loader   ->  将css装换成一个一个的模块，再将这些模块代码插入到`style-loader`之中
        - less-loader  ->  ...

        -    如何配置 loader:

        ```js
        module:{
                rules:[
                    {
                        test:/\.css$/,  // <- 匹配文件后缀名
                        use:[
                                {
                                    loader:'style-loader' // 使用loader类型，loader按照解析步骤按顺序写，从低级到高级  
                                },
                                {
                                    loader:'css-loader' 
                                }
                            ]
                    },
                    {
                        test:/\.less$/,
                        use:[
                            {loader:'style-loader'},
                            {loader:'css-loader'},
                            {loader:'less-loader'}
                        ]
                    }
                ]
            }
        ```

        - 抽离样式，抽离到一个css文件， 通过css文件的方式来引用   -> 防止在最终打包的main.js文件中存在太多css代码，影响网页加载
            - 需要安装两个插件：extract-text-webpack-plugin@next(以前webpack3版本的，现在webpack4需要@next来进行安装)  / mini-css-extract-plugin(webpack新出)
            - 导入插件 -> 在plugin中配置插件(在配置插件中需要指定filename多个css文件打包后最终的css文件) -> 在rules中的use使用插件并且去掉style-loader
            - mini-css-extract-plugin(webpack新出) : 这个只能导出一个css文件，使用方法：导入插件 -> 配置插件(直接new，并且制定导出文件名及路径filename) -> 使用插件(在use中添加MiniCssTractPlugin.loader) 

        - 对于extract-text-webpack-plugin,开发的时候我们可以将它禁用，还是使用style-loader, 这样可能会快一点，而不用每次都全部打包
        ```js
        let lessExtractTextWebpackPlugin = new ExtractTextWebpackPlugin({
            filename:"css/less.css",
            disable:true
        });
        ```
        **这是fallback**
        ```js
        use:cssExtractTextWebpackPlugin.extract({ 
            fallback:'style-loader',                    
            use:[
                /*{
                    loader:'style-loader'  此时css通过link引入，也就不需要style-loader了
                },*/
                // MiniCssTractPlugin.loader, <- 另外一种插件的用法
                {
                    loader:'css-loader' 
                }
            ]
        }),
        ```


        - 插件使用：如果在项目中使用bootstrap，但是使用其样式比较少，我们可以使用插件删掉其多余的部分   -> purifycss-webpack / purify-css / glob
            ```js
             // css文件中没用到的类会被删除 ^ ^  注意这个插件必须得放在HtmlWebpackPlugin 之后！
            // 刚刚试了下在js控制样式时调用class类名，居然这样就不能使用了！！！ /@`@/ , 所以对于我来说暂时就不使用了。。。
            // new PurifycssWebpack({  
            //     paths:glob.sync(path.resolve('src/*.html'))
            // })
            ```
            - 使用了之后，居然不能在js中使用样式类名，算了
            
        
        - postcss-loader 取之不竭，用之不竭，眼花缭乱的 loader，我tm想死！！！    /  autoprefixer   ->  一个自动给css样式加前缀的插件
            安装:`npm i postcss-loader autoprefixer -D`    
            1. 需要建立一个postcss.config.js的文件，文件内容位：
  
            ```js
            module.exports = {
                plugins:[
                    require("autoprefixer")
                ]
            }
            ```
            
            2. 如何使用这个loader，直接在css-loader后面添加 `{loader:'postcss-loader'}`

            ```js
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
            ```


            - copy-webpack-plugin  -> 这是一个将src开发目录下文件直接拷贝到build文件夹中而不需要编译该文件夹的插件，拷贝插件2333
                安装：`npm i copy-webpack-plugin -D`

                1. 导入插件 -> 2. 使用，可以拷贝多个文件夹到build文件中，而不将它编译，可用于一些不用编译的文件使用
                
                **使用方法**
                
                ```js
                new CopyWebpackPlugin([
                    {
                        from:'./src/doc',
                        to:'public'  // <- 这里是去找 path:path.resolve('./build'),也就是build下的public文件夹
                    }// 这是一个数组，可见可以传入多个值，可以拷贝多个文件
                ]),
                ```


    






- package.json 中的配置及注释

> "scripts"中的配置使用 `npm run [key]` -> `npm run start` 

```json
{
  "name": "webpack4",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "build": "webpack",  // 构建准备上线时使用 webpack 这个命令直接打包文件
    "start":"webpack-dev-server"  // 平时开发使用 webpack-dev-server
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "webpack": "^4.26.0",
    "webpack-cli": "^3.1.2"
  }
}

```
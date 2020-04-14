// 把外联标签变成内联标签link -> style,<script src> -> <script></script>

const HtmlWebpackPlugin = require('html-webpack-plugin');

class InlineSourcePlugin {
    constructor({match}) {
        this.reg = match; // 正则匹配
    }
    apply(compiler) {
        // 要通过html-webpack-plugin来实现这个功能
        compiler.hooks.compilation.tap('InlineSourcePlugin', (compilation) => {
            HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tapAsync('my',(data, cb) => {
                data = this.processTags(data, compilation);
                cb(null, data);
            })
        });
    }
    // 处理引入标签的数据
    processTags(data, compilation) {
        let headTags = [];
        let bodyTags = [];
        data.headTags.forEach(headTag => {
            headTags.push(this.process(headTag, compilation))
        });
        data.bodyTags.forEach(bodyTag => {
            bodyTags.push(this.process(bodyTag, compilation))
        });
        // 返回替换掉headTags和bodyTags的数据
        return {...data, headTags, bodyTags};
    }
    // 处理某一个标签
    process(tag, compilation) {
        let newTag, url;
        if (tag.tagName === 'link' && this.reg.test(tag.attributes.href)) {
            newTag = {
                tagName: 'style',
                attributes: {type: 'text/css'}  // 属性想加就加
            };
            url = tag.attributes.href;
        }

        if (tag.tagName === 'script' && this.reg.test(tag.attributes.src)) {
            newTag = {
                tagName: 'script',
                attributes: {type: 'text/javascript'}
            };
            url = tag.attributes.src;
        }

        if (url) {
            // 把文件的内容放到innerHTML属性上
            newTag.innerHTML = compilation.assets[url].source();
            // 删除原有应该生成的资源
            delete compilation.assets[url];
            return newTag;
        }

        return tag;
    }
}

module.exports = InlineSourcePlugin;
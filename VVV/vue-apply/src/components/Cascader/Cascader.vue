<template>
    <div class="cascader" v-click-outside="close">
        <div class="title" @click="toggle">
            {{result}}
        </div>
        <div class="content" v-if="visible">
            <CascaderItem :options="options" :value="value" :level="0" @change="change"></CascaderItem>
        </div>
    </div>
</template>

<script>
// 级联组件
import CascaderItem from './CascaderItem';
import cloneDeep from 'lodash/cloneDeep';


// 如果希望对某个元素有一系列的DOM操作，可以封装指令，自定义指令
export default {
    props: {
        options: {
            type: Array,
            default: () => []
        },
        value: {
            type: Array,
            default: () => []
        },
        lazyload: {
            type: Function
        }
    },
    data() {
        return {
            visible: false,
        }
    },
    computed: {
        result() {
            return this.value.map(item => item.label).join('/');
        }
    },
    methods: {
        change(val) {
            // 获取点击的是哪项，再调用lazyload方法
            let item = val[val.length - 1];
            let id = item.id;
            if (this.lazyload) {
                // 给当前id这项添加个children属性，好显示子级内容
                this.lazyload(id, (children) => this.handle(id, children));
            }
            this.$emit('input', val);
        },
        handle(id, children) {
            // 不能直接修改父组件传递的options，需要clone一下
            let cloneOptions = cloneDeep(this.options);
            // 利用树的广度优先遍历
            let stack = [...cloneOptions];
            let index = 0;
            let current;

            while (current = stack[index++]) {
                if (current.id !== id) {
                    if (current.children) {
                        // stack.push(current.children);
                        stack = stack.concat(current.children);
                    }
                } else {
                    break;
                }
            }
            current.children = children;    // 动态添加儿子节点
            this.$emit('update:options', cloneOptions);
        },
        close() {   // 关闭
            this.visible = false;
        },
        toggle() {  // 切换
            this.visible = !this.visible;
        }
    },
    components: {
        CascaderItem
    }
}
</script>

<style scoped>
.cascader {
    display: inline-block;
}
.cascader .title {
    display: inline-block;
    padding: 0 10px;
    height: 30px;
    line-height: 30px;
    border: 1px solid #ededed;
    min-width: 150px;
}

</style>
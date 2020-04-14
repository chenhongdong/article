<template>
    <div class="cascader-item">
        <div class="left">
            <div v-for="(opt,index) in options" :key="index">
                <div class="label" @click="select(opt)">{{opt.label}}</div>
            </div>
        </div>
        <div class="right" v-if="list && list.length">
            <CascaderItem :options="list" :value="value" :level="level+1" @change="change"></CascaderItem>
        </div>
    </div>
</template>

<script>
export default {
    name: 'CascaderItem',   // 递归组件，必须起名
    props: {
        options: {
            type: Array,
            default: () => []
        },
        value: {
            type: Array,
            default: () => []
        },
        level: {
            type: Number,
            required: true
        }
    },
    data() {
        return {
            current: null
        }
    },
    computed: {
        list() {
            // 点击第一层算出第二层
            
            // 去自己的那一层找自己的儿子
            if (this.value[this.level] && this.value[this.level].id) {
                let opt = this.options.find(item => item.id === this.value[this.level].id);
                return opt.children;
            }

            // this.value[this.level]对应当前自己的那一层数据
            // return this.value[this.level] && this.value[this.level].children;
        }
    },
    methods: {
        change(item) {
            console.log('二级',item)
            this.$emit('change', item);
        },
        select(item) {
            // 把当前左边选中的这一项存起来
            this.current = item;
            // 拷贝一份数据，改好后提交给父组件
            let clone = [...this.value];
            clone[this.level] = item;
            // 当前点击某项时，就将除了下级的所有项都干掉
            clone.splice(this.level + 1);
            // $emit通知父组件更新值
            this.$emit('change', clone);
        }
    }
}
</script>

<style scoped>
.cascader-item {
    display: flex;
}
.cascader-item .left {
    width: 100px;
    border: 1px solid #ddd;
    min-height: 150px;
    height: 200px;
    overflow-y: auto;
    text-align: center;
}
.cascader-item .left .label:hover {
    background-color: #00a1f4;
    color: #fff;
}
</style>
<template>
    <div class="swiper">
        <div class="view" @touchstart="touchstart" @touchend="touchend">
            <slot></slot>
        </div>
        <div class="dots">
            <span class="dot" v-for="dot in len" :key="dot" :class="{active: selectId === dot}"></span>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        value: {
            type: Number,
            default: 1
        },
        autoplay: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            selectId: 1,
            len: 0
        }
    },
    mounted() {
        this.len = this.$children.length;

        this.show();
        this.run();
        this.prevIndex = this.selectId;
    },
    watch: {
        value() {
            this.show();
        }
    },
    methods: {
        touchstart(e) {
            this.startX = e.touches[0].pageX;
            this.stop();
        },
        touchend(e) {
            let disX = e.changedTouches[0].pageX - this.startX;
            if (disX < 0) {
                this.change(this.selectId + 1);
            } else {
                this.change(this.selectId - 1);
            }
            this.run();
        },
        stop() {
            clearInterval(this.timer);
            this.timer = null;
        },
        show() {
            this.selectId = this.value || this.$children[0].id;

            this.$children.forEach(vm => {
                
                this.$nextTick(() => {
                    vm.index = this.selectId;
                });
                console.log(this.prevIndex, '比较', this.selectId)
                vm.direction = this.prevIndex > this.selectId;

                // 处理自动播放时的边界情况
                if (this.timer) {
                    if (this.prevIndex === 1 && this.selectId === this.len) {
                        vm.direction = true;
                    } else if (this.prevIndex === this.len && this.selectId === 1) {
                        vm.direction = false;
                    }
                }
            });
        },
        run() {
            if (this.autoplay) {
                this.timer = setInterval(() => {
                    this.change(this.selectId + 1);
                }, 3000);
            }
        },
        change(index) {
            this.prevIndex = this.selectId;
            if (index === this.len + 1) {
                index = 1;
            } else if (index === 0) {
                index = this.len;
            }
            this.$emit('input', index);
        }
    },
    beforeDestroy() {
        this.stop();
    }
}
</script>

<style scoped>
.swiper {
    position: relative;
    width: 100%;
    height: 220px;
    overflow: hidden;
}
/* 轮播图小点样式 */
.swiper .dots {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
}
.swiper .dots .dot {
    width: 10px;
    height: 4px;
    border-radius: 6px;
    background-color: rgba(255, 255, 255, 0.7);
    display: inline-block;
    margin: 0 2px;
}
.swiper .dots .active {
    width: 14px;
    background-color: #fff;
}
</style>
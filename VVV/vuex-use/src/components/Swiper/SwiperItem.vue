<template>
    <transition name="items">
        <div class="swiper-item" v-if="isShow" :class="{direction}">
            <slot></slot>
        </div>
    </transition>
</template>

<script>
export default {
    props: {
        id: {
            type: Number,
            default: 1
        }
    },
    data() {
        return {
            index: 1,
            direction: false
        }
    },
    computed: {
        isShow() {
            return this.id === this.index;
        }
    }
}
</script>

<style scoped>
.items-enter-active,
.items-leave-active {
    transition: .5s linear;
}
.items-leave-to {
    transform: translateX(-100%);
}
.items-enter {
    transform: translateX(100%);
}
.items-enter-active {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
}
.items-leave-to.direction {
    transform: translateX(100%);
}
.items-enter.direction {
    transform: translateX(-100%);
}
</style>
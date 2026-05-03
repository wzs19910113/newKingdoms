<template>
    <div class="tabs-container">

        <!-- 顶部按钮栏 -->
        <div class="tabs-header" ref="headerRef">
            <button v-for="(tab, index) in tabs" :key="index" class="tab-btn" :class="{ active: activeIndex === index }" @click.stop="selectTab(index)" >
                {{ tab.label }}
            </button>
            <div class="active-indicator" :style="indicatorStyle"></div>
        </div>

        <!-- 横向滑动的内容区 -->
        <div class="tabs-content" ref="contentRef" @scroll="onScroll">
            <div class="content-slot-wrapper" :style="{ width: `${tabs.length * 100}%` }">
                <div v-for="(tab, index) in tabs" :key="index" class="tab-page" :style="{ width: `${100 / tabs.length}%` }">
                    <slot :name="`tab-${index}`"></slot>
                </div>
            </div>
        </div>

    </div>
</template>

<script>
export default {
    name: "SwipeTabs",
    props: {
        // 接收 tabs 数组，每个元素包含 label 字段
        tabs: {
            type: Array,
            required: true,
            validator: (val) => val.every(item => item.label)
        },
        // 当前激活的索引，支持 v-model
        modelValue: {
            type: Number,
            default: 0
        }
    },
    emits: ["update:modelValue"],
    data() {
        return {
            activeIndex: this.modelValue,
            indicatorStyle: {
                transform: "translateX(0px)",
                width: "0px"
            }
        };
    },
    watch: {
        modelValue(newVal) {
            if (newVal !== this.activeIndex) {
                this.activeIndex = newVal;
                this.updateIndicator();
            }
        },
        activeIndex(newVal) {
            this.$emit("update:modelValue", newVal);
            this.updateIndicator();
        },
        tabs: {
            handler() {
                this.$nextTick(() => {
                      this.updateIndicator();
                });
            },
            immediate: true
        }
    },
    mounted() {
        this.updateIndicator();
        window.addEventListener("resize", this.updateIndicator);
    },
    beforeDestroy() {
        window.removeEventListener("resize", this.updateIndicator);
    },
    methods: {
        selectTab(index) {
            if (index === this.activeIndex) return;
            this.activeIndex = index;
            this.$nextTick(() => {
                this.scrollToActivePage();
                this.updateIndicator();
                // let dom = this.$refs.contentRef;
                // if(dom){
                //     // dom.scrollTop = 0;
                // }
            });
        },
        scrollToActivePage() {
            if (!this.$refs.contentRef) return;
            const contentWidth = this.$refs.contentRef.clientWidth;
            const scrollLeft = this.activeIndex * contentWidth;
            this.$refs.contentRef.scrollTo({ left: scrollLeft, top: 0, behavior: 'auto' });
        },
        onScroll() {
            if (!this.$refs.contentRef) return;
            const scrollLeft = this.$refs.contentRef.scrollLeft;
            const contentWidth = this.$refs.contentRef.clientWidth;
            const index = Math.round(scrollLeft / contentWidth);
            if (index !== this.activeIndex && index >= 0 && index < this.tabs.length) {
                this.activeIndex = index;
            }
            this.updateIndicator();
        },
        updateIndicator() {
            const header = this.$refs.headerRef;
            if (!header) return;
            const activeBtn = header.querySelector(".tab-btn.active");
            if (activeBtn) {
                const { offsetLeft, offsetWidth } = activeBtn;
                this.indicatorStyle = {
                    transform: `translateX(${offsetLeft}px)`,
                    width: `${offsetWidth}px`
                };
            }
        }
    }
};
</script>

<style scoped>
.tabs-container {
    background: rgba(0, 0, 0, 0.5); /* 黑色半透明 */
    border-radius: .08rem;
    width: 100%;
    display: flex;
    flex-direction: column;
}

/* 顶部按钮栏 */
.tabs-header {
    position: relative;
    display: flex;
    justify-content: space-around;
    align-items: center;
    gap: 0;
    border-bottom: .01rem solid rgba(255, 165, 0, 0.3);
    overflow-x: auto;
    scrollbar-width: none;
    background: inherit;
    padding: 0 .08rem;
}
.tabs-header::-webkit-scrollbar {
    display: none;
}

.tab-btn {
    background: transparent;
    border: none;
    height: .6rem;
    line-height: .6rem;
    font-size: .3rem;
    font-weight: 500;
    color: #fff;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
    position: relative;
    opacity: 0.7;
}

.tab-btn.active {
    opacity: 1;
    color: #ffa500;
    font-weight: bold;
}

.active-indicator {
    position: absolute;
    bottom: -.02rem;
    left: 0;
    height: .06rem;
    background-color: #ffa500; /* 橙色标识线 */
    transition: transform 0.3s ease, width 0.3s ease;
    border-radius: .04rem;
}

/* 横向滚动内容区 */
.tabs-content {
    /* overflow-x: hidden;
    overflow-y: auto; */
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    /* scroll-behavior: smooth; */
    flex: 1;
    background: inherit;
}
.tabs-content::-webkit-scrollbar {
    display: none;
}

.content-slot-wrapper {
    display: flex;
    height: 100%;
    min-height: 2rem; /* 保证内容区有最小高度 */
}

.tab-page {
    box-sizing: border-box;
}
</style>

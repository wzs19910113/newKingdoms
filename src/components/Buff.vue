<template>
    <a class="buff" :class="`${buff.good?'buff-good':'buff-bad'}`" @click="onTap">
        <span class="buff-bg" :style="`opacity:${buffBg(buff)}`"></span>
        <span class="buff-name" :style="`opacity:${buffText(buff)}`">{{buff.name}}</span>
    </a>
</template>
<script>
import { query, r, bulbsort, getParentNode, numFormat, genRandomWorkerName, genRandomRoomName, genRandomFactoryName, genRandomWorker, genRandomTerminal, genRandomRoom, getListByID } from '../tools/utils';
import { DEBUG, CONFIG } from '../config/config';
export default {
    props:{
        buff: Object,
        onTap: Function, // 点击事件
    },
    data() {
        return {

        };
    },
    computed: {
    },
    mounted(){

    },
    methods: {
        buffBg(buff){ // 计算buff背景透明度
            let l = buff.level;
            return `${50+l*5}%`;
        },
        buffText(buff){ // 计算buff文本明度
            let l = buff.level;
            return `${70+l*3}%`;
        },
    },
};
</script>
<style scoped>
    .buff{
        display: inline-block;
        position: relative;
        width: 30%;
        height: .3rem;
        line-height: .3rem;
        font-size: .18rem;
        color: #fff;
        background-color: transparent;
        overflow: hidden;
        text-align: center;
        white-space: nowrap;
        word-break: keep-all;
        margin: .01rem .022rem;
        border-radius: .04rem;
    }
    .buff .buff-bg,
    .buff .buff-name{
        position: absolute;
        display: inline-block;
        width: 100%;
        height: 100%;
        top: 0;
        right: 0;
        left: 0;
        bottom: 0;
    }
    .buff .buff-bg{
        z-index: 5;
    }
    .buff .buff-name{
        z-index: 10;
    }
    .buff-good .buff-bg{
        background-image: radial-gradient(#AAA 0%, #228B22 100%);
    }
    .buff-bad .buff-bg{
        background-image: radial-gradient(#131313 0%, #800000 100%);
    }
</style>

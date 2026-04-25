<template>
    <a class="avatar" ref="avatar" :class="common.isCrumble(unit)?'avatar-crumble':''" @click.stop="_onTap">
        <span class="name">
            {{unit.btd.name}}
        </span>
        <img class="bg-src" :src="require(`../assets/${common.calcIconSrc(unit)}`)" />
    </a>
</template>
<script>
import { query, r, bulbsort, getParentNode, numFormat, genRandomWorkerName, genRandomRoomName, genRandomFactoryName, genRandomWorker, genRandomTerminal, genRandomRoom, getListByID } from '../tools/utils';
import * as common from '../tools/common';
import { DEBUG, CONFIG } from '../config/config';
export default {
    props:{
        unit: {
            type: Object,
            default: function(){},
        },
        onTap: { // 点击事件
            type: Function,
            default: function(){},
        },
    },
    data() {
        return {

            common,
            DEBUG,
            CONFIG,
        };
    },
    computed: {
    },
    mounted(){
    },
    methods: {
        _onTap(){
            this.$emit('onTap');
        },
    },
};
</script>
<style scoped>
    .avatar{
        position: relative;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        /* box-shadow: 0 0 .1rem #fff; */
        /* border: .03rem double #131313; */
        /* box-shadow: 0 0 .06rem .02rem #aaa; */
    }
    .avatar-crumble{
        box-shadow: 0 0 .4rem #e81313 inset;
    }
    .avatar .name{
        position: absolute;
        display: inline-block;
        z-index: 10;
        bottom: 0;
        left: 0;
        right: 0;
        margin: 0 auto;
        height: .3rem;
        line-height: .32rem;
        text-align: center;
        color: #000;
        font-weight: bold;
        /* text-shadow: 0 0 .1rem #fff; */
        background-color: rgba(255,255,255,.75);
    }
    .avatar .bg-src{
        position: absolute;
        display: block;
        z-index: 5;
        width: 100%;
        height: 100%;
        top: -15%;
        right: 0;
        bottom: 0;
        left: 0;
        margin: 0;
        border-radius: 50%;
        transform: scale(1.25);
    }
</style>

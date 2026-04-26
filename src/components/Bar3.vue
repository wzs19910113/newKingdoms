<template>
    <a class="bar-wrap" :class="title?'':'bar-narrow'" @click.stop="_onTap">
        <div class="bar">
            <div class="bar-full" :class="{'bar-def':type==1,'bar-phy':type==2}" :style="{width:`${calcBarLength()}%`}"></div>
            <div class="bar-label">
                <span class="txt" v-if="title">{{title}}</span>
                <span class="num">
                    <span class="crt" :class="`${crt<=0?'crt-red':''}`">{{Math.round(this.crt)}}</span>
                    /
                    <span class="max">{{Math.round(this.max)}}</span>
                </span>
            </div>
        </div>
    </a>
</template>
<script>
import { query, r, exptr, setInRange, shuffle, bulbsort, getParentNode, cloneObj, numFormat, avg, percent, calcDistance, getMatchList, getSubMatchList, removeFromList, arrContains, } from '../tools/utils';
import * as common from '../tools/common';
import { DEBUG, CONFIG } from '../config/config';
export default {
    name: 'Bar3',
    props:{
        title: String,
        type: Number, // [1：防御|2：体力]
        crt: Number,
        max: Number,
        onTap: { // 点击事件
            type: Function,
            default: function(){},
        },
    },
    data() {
        return {

            common,DEBUG,CONFIG,
        };
    },
    computed: {},
    mounted(){

    },
    methods: {
        calcBarLength(){
            let res = Math.round(this.crt/this.max*100);
            if(res>100)
                res = 100;
            else if(res<0)
                res = 0;
            return res;
        },
        _onTap(){
            this.$emit('onTap');
        },
    },
};
</script>
<style scoped>
    .bar-wrap{
        position: absolute;
        max-width: 90%;
        height: .35rem;
        line-height: .35rem;
        padding: 0 .2rem;
        top: .26rem;
        right: -.05rem;
        font-size: .26rem;
        background-image: radial-gradient(closest-corner, #AAA 50%, #CCC 100%);
        border: .01rem solid #CCC;
        z-index: 5;
        overflow: hidden;
        white-space: nowrap;
        word-break: keep-all;
        text-align: left;
        color: #fff;
        box-shadow: .03rem .05rem .02rem .02rem rgba(50,50,50,.3);
    }
    .bar-full{
        position: absolute;
        top: 0;
        left: 0;
        height: .4rem;
        transition: all .2s;
        z-index: 2;
        box-shadow: 0 1rem .28rem rgba(0,0,0,.99);
    }
    .bar-def{
        background-image: radial-gradient(closest-corner, #FF7F50 10%, #A0522D 100%);
    }
    .bar-phy{
        background-image: radial-gradient(closest-corner, #00BFFF 10%, #008B8B 100%);
        text-shadow: 0 0 .1rem #000;
    }
    .crt-red{
        /* color: #80A; */
        /* font-weight: bold; */
        /* text-shadow: none; */
    }
    .bar-label{
        position: relative;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        width: 100%;
        white-space: nowrap;
        word-break: keep-all;
        text-align: right;
        z-index: 3;
        text-shadow: 0 0 .12rem #000;
    }
    .bar-narrow{
        height: .24rem;
        line-height: .24rem;
    }
</style>

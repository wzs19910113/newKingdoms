<template>
    <a class="bar-wrap" @click.stop="onTap">
        <div class="bar">
            <div class="bar-full" :class="{'bar-hp':type==1,'bar-phy':type==2}" :style="{width:`${calcBarLength()}%`}"></div>
            <div class="bar-label">
                <span class="txt" v-if="title">{{title}}</span>
                <span class="num" v-if="mode==1">
                    <span class="crt">{{Math.round(this.crt)}}</span>
                </span>
                <span class="num" v-if="mode==2">
                    <span class="crt">{{Math.round(this.crt)}}</span>&nbsp;/&nbsp;<span class="max">{{Math.round(this.max)}}</span>
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
    props:{
        title: String,
        type: Number, // [1：生命值|2：精力]
        mode: { // 模式 1简约 2详细
            type: Number,
            default: 1,
        },
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
    },
};
</script>
<style scoped>
    .bar-wrap{
        display: flex;
        justify-content: flex-start;
        align-items: center;
        width: 100%;
    }
    .bar{
        position: relative;
        border: none;
        border-bottom-right-radius: .2rem;
        height: .4rem;
        width: 100%;
        overflow: hidden;
        background-image: radial-gradient(closest-side at 90% 50%, rgba(188,188,188,.8) 2%, rgba(255,255,255,.9) 400%);
    }
    .bar-full{
        position: absolute;
        top: 0;
        left: 0;
        height: .4rem;
        transition: all .2s;
        border-bottom-right-radius: .2rem;
        z-index: 2;
    }
    .bar-full::after{
        content: '';
        display: block;
        position: absolute;
        right: -.03rem;
        height: 50%;
        width: .03rem;
        background-color: #fff;
        z-index: 1;
        opacity: .6;
        animation: lighting .5s ease-in-out alternate infinite;
    }
    @keyframes lighting{
        from{
            box-shadow: 0 0 .01rem .01rem #ccc;
        }
        to{
            box-shadow: none;
        }
    }
    .bar-hp{
        background-image: radial-gradient(closest-corner, #CD5C5C 0%, #B22222 100%);
    }
    .bar-phy{
        background-image: radial-gradient(closest-corner, #6495ED 0%, #6A5ACD 100%);
    }
    .bar-label{
        position: absolute;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        width: 100%;
        height: .3rem;
        line-height: .28rem;
        padding-left: .04rem;
        white-space: nowrap;
        word-break: keep-all;
        color: #090909;
        z-index: 3;
        font-weight: bold;
        text-shadow: 0 0 .08rem #fff;
    }
    .bar-label .txt{
        display: inline-block;
        font-size: .25rem;
        margin-right: .15rem;
    }
    .bar-label .num{
        display: inline-block;
    }
    .bar-label .num .crt{
        font-size: .28rem;
    }
    .bar-label .num .max{
        font-size: .24rem;
    }
</style>

<template>
    <a class="bar-wrap" @click="onTap">
        <div class="bar">
            <div class="bar-full" :class="{'bar-hp':type==1,'bar-phy':type==2}" :style="{width:`${calcBarLength()}%`}"></div>
            <div class="label">
                <span class="txt">{{title}}</span>
                <span class="num">
                    <span class="crt">{{Math.round(this.crt)}}</span>&nbsp;/&nbsp;<span class="max">{{Math.round(this.max)}}</span>
                </span>
            </div>
        </div>
    </a>
</template>
<script>
import { query, r, bulbsort, getParentNode, numFormat, genRandomWorkerName, genRandomRoomName, genRandomFactoryName, genRandomWorker, genRandomTerminal, genRandomRoom, getListByID } from '../tools/utils';
import { DEBUG, CONFIG } from '../config/config';
export default {
    props:{
        title: String,
        type: Number, // [1：生命值|2：精力]
        crt: Number,
        max: Number,
        onTap: Function, // 点击事件
    },
    data() {
        return {

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
        background-color: #eee;
    }
    .bar{
        position: relative;
        border: none;
        border-bottom-right-radius: .2rem;
        height: .4rem;
        width: 100%;
        overflow: hidden;
        background-image: radial-gradient(closest-side at 90% 50%, #EFEFEF 2%, #AAA 400%);
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
    .label{
        position: absolute;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        width: 100%;
        height: .3rem;
        line-height: .28rem;
        white-space: nowrap;
        word-break: keep-all;
        color: #090909;
        z-index: 3;
        text-shadow: 0 0 .08rem #fff;
    }
    .label .txt{
        display: inline-block;
        font-size: .25rem;
        margin-right: .1rem;
    }
    .label .num{
        display: inline-block;
    }
    .label .num .crt{
        font-size: .28rem;
    }
    .label .num .max{
        font-size: .24rem;
    }
</style>

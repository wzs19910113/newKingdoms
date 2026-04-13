<template>
    <a class="equip" :class="`equip-${equip.t}`" @click="onTap({flag:1,equip,},$event)">
        <span class="value money" v-html="common.moneyFormat(equip.v,1)"></span>
        <div class="row">
            <span class="type">{{[`🗡️`,`🎩`,`🧥`,`💍`,`🥾`,][equip.t-1]}}</span>
            <span class="name">{{equip.n}}</span>
            <span class="awa">（存在感：{{common.awaFormat(equip.d)}}%）</span>
        </div>
        <div class="row">
            <div class="attr" v-for="attr in equip.a">
                <span class="attr-name">{{CONFIG.attrMap[attr[0]]}}</span><span class="attr-val">+{{attr[1]}}</span>
            </div>
        </div>
        <div class="row row-clm" v-if="equip.t==1">
            <div class="atk" v-for="atk in equip.k">
                <span class="atk-item atk-name">{{atk.a?'全':''}}{{atk.n}} <span class="atk-consume">({{atk.c}})</span></span>
                <span class="atk-item">伤害<br/>{{atk.d}}</span>
                <span class="atk-item">力补<br/>{{common.genRXString(atk.r1)}}</span>
                <span class="atk-item">精补<br/>{{common.genRXString(atk.r2)}}</span>
                <!-- <span class="atk-item">力补<br/>{{atk.r1}}</span>
                <span class="atk-item">精补<br/>{{atk.r2}}</span> -->
                <div class="atk-item buff-wrap">
                    <span class="buff" v-for="(buffId,index) in atk.b" v-bind:key="buffId">
                        <Buff :buff="genBuff(buffId,atk.bl[index])" :mode="2" :onTap="onTap.bind(this,{flag:2,buffId,buffLevel:atk.bl[index]})" />
                    </span>
                </div>
                <span class="atk-item sp" v-if="atk.s">{{[`硬直`,`破甲`,`削气`,`必中`,`削精`][atk.s-1]}}<br/>{{atk.sl}}</span>
            </div>
        </div>
    </a>
</template>
<script>
import Buff from '../components/Buff';
import { query, r, exptr, setInRange, shuffle, bulbsort, getParentNode, cloneObj, numFormat, avg, percent, calcDistance, getMatchList, getSubMatchList, removeFromList, arrContains, } from '../tools/utils';
import * as common from '../tools/common';
import { DEBUG, CONFIG } from '../config/config';

export default {
    name: 'Equip',
    props:{
        equip: Object,
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
    computed: {
    },
    mounted(){
        // for(let i=0;i<151;i+=1){
        //     console.log(`${i} => ${this.genRXString(i)}`);
        // }
    },
    methods: {
        genBuff(buffId,buffLevel){ // 生成buff数据
            let res = {};
            let buffArr = [...CONFIG.goodBuffs,...CONFIG.badBuffs];
            let oBuff = getMatchList(buffArr,[['id',buffId]])[0];
            if(oBuff){
                res = cloneObj(oBuff);
                res.level = buffLevel;
            }
            return res;
        },
    },
    components: {
        Buff,
    },
};
</script>
<style scoped>
    .equip{
        position: relative;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex-direction: column;
        width: 6rem;
        margin: 0 auto;
        min-height: 1.2rem;
        line-height: .32rem;
        color: #fff;
        font-size: .22rem;
        margin-bottom: .2rem;
        padding: .14rem .12rem;
        background-color: rgba(105,106,129,.5);
    }
    .row{
        position: relative;
        width: 100%;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex-wrap: wrap;
        min-height: .4rem;
        margin-bottom: .1rem;
    }
    .row:last-child{
        margin-bottom: 0;
    }
    .money{
        color: gold;
    }
    /* 名字 */
    .row .type{
        width: .6rem;
        border: .01rem solid #fffa4f;
        line-height: .4rem;
        font-size: .4rem;
        background-color: #131313;
        margin-right: .1rem;
    }
    .row .name{
        line-height: .3rem;
        font-size: .3rem;
        font-weight: bold;
        text-shadow: .02rem .02rem .12rem #000;
    }
    .row .awa{
        line-height: .3rem;
        font-size: .24rem;
    }
    .value{
        position: absolute;
        top: .16rem;
        right: -.08rem;
        padding: 0 .2rem;
        height: .34rem;
        line-height: .34rem;
        background-color: rgba(24,24,24,.98);
        /* border-top-left-radius: .06rem; */
        border-bottom-left-radius: .16rem;
    }

    /* 属性加成 */
    .attr{
        min-width: .6rem;
        margin-right: .1rem;
    }
    .attr-name,.attr-val{
        display: block;
        white-space: nowrap;
        word-break: keep-all;
    }
    .attr-name{

    }
    .attr-val{

    }
    /* 攻击方式 */
    .row-clm{
        flex-direction: column;
    }
    .atk{
        width: 100%;
        padding: .04rem .08rem;
        margin-bottom: .14rem;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        border-radius: .06rem;
        text-shadow: 0 0 .12rem #000;
        background-color: rgba(184,146,32,.96);
    }
    .atk:last-child{
        margin-bottom: 0;
    }
    .atk-item{
        width: 13%;
        font-size: .22rem;
    }
    .atk-name{
        width: 25%;
        height: .6rem;
        line-height: .6rem;
        background-color: #131313;
        border-radius: .1rem;
        white-space: nowrap;
        word-break: keep-all;
    }
    .atk-consume{
        color: #05cFd3;
        font-weight: bold;
        text-shadow: none;
    }
    /* 攻击方式-buff */
    .atk .buff-wrap{
        width: 20%;
    }
    /* 攻击方式-特殊效果 */
    .atk .sp{
        display: inline-block;
        border-radius: .1rem;
        width: .82rem;
        height: .82rem;
        line-height: .41rem;
        background-color: rgba(96,72,14,.96);
    }
</style>

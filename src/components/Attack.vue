<template>
    <a class="attack" @click="onTap({flag:1,attack,},$event)">
        <span class="attack-item attack-name">{{attack.a?'全':''}}{{attack.n}} <span class="attack-consume">({{attack.c}})</span></span>
        <span class="attack-item">伤害<br/>{{attack.d}}</span>
        <span class="attack-item">力补<br/>{{common.genRXString(attack.r1)}}</span>
        <span class="attack-item">精补<br/>{{common.genRXString(attack.r2)}}</span>
        <div class="attack-item buff-wrap">
            <span class="buff" v-for="(buffId,index) in attack.b" v-bind:key="buffId">
                <Buff :buff="genBuff(buffId,attack.bl[index])" :mode="2" :onTap="onTap.bind(this,{flag:2,buffId,buffLevel:attack.bl[index]})" />
            </span>
        </div>
        <span class="attack-item sp" v-if="attack.s">{{[`硬直`,`破甲`,`削气`,`必中`,`削精`,`攻心`][attack.s-1]}}<br/>Lv.{{attack.sl}}</span>
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
        attack: { // 攻击方式数据
            type: Object,
            default: {},
        },
        mode: { // 模式 1装备栏 2战斗-菜单
            type: Number,
            default: 1,
        },
        unit: { // 持有者
            type: Object,
            default: function(){},
        },
        equip: { // 所属武器
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

            common,DEBUG,CONFIG,
        };
    },
    computed: {
    },
    mounted(){

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
    .attack{
        width: 100%;
        height: 1rem;
        padding: .04rem 0;
        margin-bottom: .14rem;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        text-shadow: 0 0 .12rem #000;
        /* border: .01rem solid #8ae4f1; */
        border: .01rem solid rgba(138,228,241,.2);
        background-color: rgba(44,44,44,.6);
    }
    .attack:last-child{
        margin-bottom: 0;
    }
    .attack-item{
        width: 13%;
        line-height: .3rem;
        font-size: .22rem;
    }
    .attack-name{
        width: 25%;
        height: .8rem;
        line-height: .8rem;
        white-space: nowrap;
        word-break: keep-all;
        border-right: .01rem solid rgba(138,228,241,.2);
    }
    .attack-consume{
        color: #05cFd3;
        font-weight: bold;
        text-shadow: none;
    }
    /* 攻击方式-buff */
    .attack .buff-wrap{
        width: 20%;
    }
    .attack .buff-wrap .buff{
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        margin: .02rem 0;
    }
    /* 攻击方式-特殊效果 */
    .attack .sp{
        display: inline-block;
        border-radius: .1rem;
        width: .82rem;
        height: .82rem;
        line-height: .41rem;
        background-color: rgba(126,112,14,.96);
    }
</style>

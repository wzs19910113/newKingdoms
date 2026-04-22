<template>
    <a class="attack" :class="`mode-${mode} ${ban?'attack-ban':''}`" @click.stop="_onTap">
        <span class="attack-mode" v-if="mode==1">
            <span class="attack-item attack-name">{{attack.a?'全':''}}{{attack.n}} <span class="attack-consume">({{common.calcConsume({type:1,data:attack,unit})}})</span></span>
            <span class="attack-item">伤害<br/>{{attack.d}}</span>
            <span class="attack-item"><span v-show="attack.r1">力补<br/>{{common.genRXString(attack.r1)}}</span></span>
            <span class="attack-item"><span v-show="attack.r2">精补<br/>{{common.genRXString(attack.r2)}}</span></span>
            <div class="attack-item buff-wrap">
                <span class="buff" v-for="(buffId,index) in attack.b" :key="buffId">
                    <Buff :buff="genBuff(buffId,attack.bl[index])" :mode="2" @onTap="_onTapBuff(buffId,attack.bl[index])" />
                </span>
            </div>
            <a class="attack-item sp" @click.stop="_onTapSp(attack.s,attack.sl)" v-if="attack.s">{{CONFIG.spAttackList[attack.s-1]}}<br/>Lv.{{attack.sl}}</a>
        </span>
        <span class="attack-mode" v-if="mode==2">
            <span class="attack-shrink">
                <span class="attack-sp" v-if="attack.s">{{getSpName()}}</span>
                {{attack.a?'全':''}}{{attack.n}}
                <span class="attack-consume">({{getConsumeValue()}})</span>
            </span>
        </span>
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
        mode: { // 模式 1详细 2简略
            type: Number,
            default: 1,
        },
        ban: { // 禁用
            type: Boolean,
            default: false,
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
        getConsumeValue(){
            let res = common.calcConsume({type:1,data:this.attack,unit:this.unit,});
            return res;
        },
        getSpName(){
            let res = `${CONFIG.spAttackShrinkList[this.attack.s-1]}`;
            return res;
        },
        _onTap(){
            this.$emit('onTap',{flag:1,data:this.attack,ban:this.ban,});
        },
        _onTapBuff(buffId,buffLevel){
            this.$emit('onTap',{flag:2,buffId,buffLevel,});
        },
        _onTapSp(sp,spLevel){
            this.$emit('onTap',{flag:3,sp,spLevel,});
        },
    },
    components: {
        Buff,
    },
};
</script>
<style scoped>
    .attack{

    }
    .attack-mode{
        display: flex;
        justify-content: flex-start;
        align-items: center;
    }
    /* 详细版本 */
    .mode-1{
        width: 100%;
        margin-bottom: .06rem;
    }
    .mode-1 .attack-mode{
        width: 100%;
        text-shadow: 0 0 .12rem #000;
        background-color: rgba(0,0,0,.33);
        padding: .04rem .08rem;
        height: 1rem;
        line-height: .33rem;
    }
    .mode-1 .attack-item{
        width: 13%;
        font-size: .22rem;
    }
    .mode-1 .attack-name{
        width: 25%;
        height: .6rem;
        line-height: .6rem;
        white-space: nowrap;
        word-break: keep-all;
        border-right: .01rem solid rgba(138,228,241,.5);
    }
    .mode-1 .attack .buff-wrap{
        width: 20%;
    }
    .mode-1 .attack .sp{
        display: inline-block;
        border-radius: .1rem;
        width: .82rem;
        height: .82rem;
        line-height: .41rem;
        background-color: rgba(96,72,114,.96);
    }
    /* 简略版本 */
    .mode-2{
        width: 32%;
        margin-right: 1.3%;
    }
    .mode-2:last-child{
        margin-bottom: 0;
    }
    .mode-2 .attack-mode{
        text-align: center;
    }
    .mode-2 .attack-shrink{
        display: inline-block;
        width: 100%;
    }
    .mode-2 .attack-consume{
        display: inline-block;
    }
    .mode-2 .attack-sp{
        display: inline-block;
        height: .34rem;
        line-height: .34rem;
        padding: 0 .04rem;
        border-radius: .08rem;
        background-color: rgba(96,72,114,.96);
    }
    /* 消耗 */
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
        background-color: rgba(96,72,114,.96);
    }
    /* 禁用 */
    .attack-ban{
        background-color: rgba(55,55,55,.4);
        box-shadow: none;
        border: none;
        color: #777;
        opacity: .7;
    }
    .attack-ban .attack-shrink{
        text-decoration: line-through;
    }
    .attack-ban .attack-name{
        text-decoration: line-through;
    }
    .attack-ban .attack-consume{
        text-decoration: line-through;
        color: #777;
    }
</style>

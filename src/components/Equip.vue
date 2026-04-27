<template>
    <a class="equip" :class="`equip-${equip.t} equip-mode-${mode}`" @click="_onTap">
        <span class="value money" v-if="mode==1" v-html="common.moneyFormat(equip.v,1)"></span>
        <div class="row">
            <span class="type">{{[`🗡️`,`🎩`,`🧥`,`💍`,`🥾`,][equip.t-1]}}</span>
            <span class="name">{{equip.n}}</span>
            <span class="awa" v-if="mode==1">存在感 {{common.awaFormat(equip.d)}}%</span>
        </div>
        <div class="row">
            <div class="attr" v-for="attr in equip.a">
                <span class="attr-name" v-if="mode==1">{{CONFIG.attrMap[attr[0]]}}</span>
                <span class="attr-val" v-if="mode==1">+{{attr[1]}}</span>
                <span class="attr-name" v-if="mode==2">{{CONFIG.attrMap[attr[0]]}}+{{attr[1]}}</span>
            </div>
        </div>
        <div class="row row-clm" v-if="equip.t==1">
            <Attack class="atk" v-for="(attack,index) in equip.k" :key="index" :attack="attack" :mode="mode" @onTap="_onTapAttack" />
        </div>
    </a>
</template>
<script>
import Attack from '../components/Attack';
import Buff from '../components/Buff';
import { query, r, exptr, setInRange, shuffle, bulbsort, getParentNode, cloneObj, numFormat, avg, percent, calcDistance, getMatchList, getSubMatchList, removeFromList, arrContains, } from '../tools/utils';
import * as common from '../tools/common';
import { DEBUG, CONFIG } from '../config/config';

export default {
    name: 'Equip',
    props:{
        equip: Object,
        mode: { // 模式 1详细 2简约
            type: Number,
            default: 1,
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
        // for(let i=0;i<151;i+=1){
        //     console.log(`${i} => ${this.genRXString(i)}`);
        // }
        // console.log(this.equip.n,this.equip);
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
        _onTap(){
            this.$emit('onTap',{flag:1,equip:this.equip,});
        },
        _onTapAttack(data){
            this.$emit('onTap',data);
        },
    },
    components: {
        Attack,
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
        margin-right: .06rem;
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
        box-shadow: 0 0 .01rem .01rem #fff inset;
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
    .row .awa{
        display: inline-block;
        background-color: #DAA520;
        padding: 0 .06rem;
        height: .3rem;
        line-height: .3rem;
        font-size: .24rem;
        border-radius: .04rem;
        margin-right: .08rem;
        color: #131313;
        text-shadow: none;
        white-space: nowrap;
        word-break: keep-all;
    }
    /* 攻击方式 */
    .row-clm{
        flex-direction: column;
    }
    /* 简约模式 */
    .equip-mode-2{
        margin: 0;
        padding: .06rem;
        background-color: rgba(42,42,82,.9);
        box-shadow: 0 0 .06rem .06rem rgba(42,42,82,1) inset;
    }
    .equip-mode-2 .attr{
        border: none;
        display: block;
        margin-bottom: .04rem;
        box-shadow: none;
    }
    .equip-mode-2 .row .type{
        display: inline-block;
        width: auto;
        font-size: .24rem;
    }
    .equip-mode-2 .row .name{
        font-size: .26rem;
        text-decoration: underline;
    }
    .equip-mode-2 .row-clm{
    }
    .equip-mode-2 .row .atk{
        width: 100%;
        margin-bottom: .08rem;
        background-color: #131313;
    }
</style>

<template>
    <a class="unit">
        <div class="block block-stat">
            <div class="avatar-wrap">
                <a class="avatar" :class="">{{unit.nk+`\r`+unit.btd.name}}</a>
                <div class="weapon" v-if="unit.btd.weaponName1">🗡️{{unit.btd.weaponName1}}</div>
                <div class="weapon" v-if="unit.btd.weaponName2">🗡️{{unit.btd.weaponName2}}</div>
            </div>
            <div class="stat-block-bars">
                <div class="stat-block-bars-row">
                    <Bar1 class="bar" title="生命：" :mode="2" :type="1" :crt="unit.btd.hp[0]" :max="unit.btd.hp[0]" />
                    <div class="sub-mark def">
                        防御：<span class="sub-crt" :class="`${unit.btd.def[0]<0?'sub-red':''}`">{{Math.round(unit.btd.def[0])}}</span>&nbsp;/&nbsp;<span class="max">{{Math.round(unit.btd.def[1])}}</span>
                    </div>
                </div>
                <div class="stat-block-bars-row">
                    <Bar1 class="bar" title="精力：" :mode="2" :type="2" :crt="unit.btd.eng[1]" :max="unit.btd.eng[1]" />
                    <div class="sub-mark phy">
                        体力：<span class="sub-crt">{{Math.round(unit.btd.phy[0])}}</span>&nbsp;/&nbsp;<span class="max">{{Math.round(unit.btd.phy[1])}}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="block block-data">
            <div class="stat-row">
                    <span class="stat-team-info" v-if="unit.tms>0">在队</span>{{(unit.nk?`${unit.nk}·`:``)+unit.nm}}，{{['男','女'][unit.gd-1]}} ，{{unit.age}}，信任度 <b>{{Math.floor(unit.rel/10000*100)}}</b> %
                </div>
            <div class="stat-row" v-if="mode==2">
                心里防御：{{unit.btd.mdef}}
            </div>
            <div class="stat-row" v-if="stys.length>0">
                <span class="stat-sty" v-for="sty in stys">【{{sty}}】</span>
            </div>

        </div>
        <div class="block block-data">
            <div class="stat-attr" v-for="index in 7">
                <div class="stat-attr-title">
                    <label class="stat-attr-name">{{['','力量','精准','速度','智力','定力','隐蔽','爆发',][index]}}：</label>
                    <label class="stat-attr-val">{{unit.btd.attrs[index+3]}}（{{unit.as[index+3]}}）</label>
                </div>
                <div class="line-wrap">
                    <div class="line-bar line-2" :style="{width:`${unit.btd.attrs[index+3]/1200*4.2}rem`}"></div>
                    <div class="line-bar line-1" :style="{width:`${unit.as[index+3]/1200*4.2}rem`}"></div>
                </div>
            </div>
        </div>
    </a>
</template>
<script>
/*
hp: 5, // 生命力
atk: 1, // 攻击力
def: 2, // 护甲
weight: 3, // 权重
heal: 0, // 治愈
str: 0, // 力量
dex: 0, // 防御
vig: 3, // 气力
tvig: 50, // 精力（总体力）
int: 8, // 智力
buffs: [{ // 状态栏
    id: 1,
    name: '急救',
    desc: '每回合恢复生命力',
    level: 1,
    trendVals: [20,0,0,0], // 倾向分值[保护,强化,伤害,弱化]
    elapse: 9, // 剩余回合数
},]
mentalDef: 150, // 心理防御
move: 1, // 本回合行动者顺序，由小到大【0:非本回合行动者】
alive: 1, // 存活
isPlayer: 1, // 玩家可操控
*/
import Bar1 from '../components/Bar1';
import Bar2 from '../components/Bar2';
import Buff from '../components/Buff';
import { query, r, bulbsort, getParentNode, numFormat, genRandomWorkerName, genRandomRoomName, genRandomFactoryName, genRandomWorker, genRandomTerminal, genRandomRoom, getListByID } from '../tools/utils';
import * as common from '../tools/common';
import { DEBUG, CONFIG } from '../config/config';
export default {
    props:{
        unit: Object, // 角色数据
        mode: { // 模式 1平时 2战斗
            type: Number,
            default: 1,
        }
    },
    data() {
        return {
            loading: false,
            stys: [],

            common,
            CONFIG,
            DEBUG,
        };
    },
    computed: {
    },
    mounted(){
        this.init();
    },
    methods: {
        init(){
            this.stys = common.getStyleTip(this.unit.sty);
        },
    },
    components:{
        Bar1,
        Bar2,
        Buff,
    },
};
</script>
<style scoped>
    .unit{
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        width: 100%;
        height: 100%;
    }
    .block{
        width: 100%;
        padding: .08rem .16rem;
        background-color: rgba(105,106,129,.5);
        margin-bottom: .2rem;
        border-radius: .06rem;
        overflow: hidden;
    }
    .block-stat{
        display: flex;
        justify-content: center;
        align-items: center;
    }
    /* 头像 */
    .avatar-wrap{
        position: relative;
        width: 1.5rem;
        height: 1.5rem;
        white-space: normal;
        word-break: keep-all;
        margin-bottom: .05rem;
        margin-right: .2rem;
        z-index: 100;
    }
    /* 头像 */
    .avatar{
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 1rem;
        height: 1rem;
        margin: 0 auto;
        line-height: .3rem;
        font-weight: bold;
        background-image: linear-gradient(to right bottom, #666 0%, #fff 40%, #888 100%);
        /* background-image: radial-gradient(closest-corner, #fff 10%, #aaa 100%); */
        color: #000;
        border-radius: 50%;
        border: .03rem double #131313;
        z-index: 100;
        white-space: normal;
        word-break: break-all;
        box-shadow: 0 0 .06rem .02rem #aaa;
    }
    .weapon{
        width: 100%;
        height: .24rem;
        line-height: .24rem;
        color: #fff;
        font-size: .18rem;
        white-space: nowrap;
        word-break: keep-all;
        overflow: hidden;
        text-align: right;
    }
    .stat-block-bars{
        width: 100%;
    }
    .stat-block-bars-row{
        position: relative;
        margin-bottom: .25rem;
    }
    /* bar栏 */
    .sub-mark{
        position: absolute;
        max-width: 90%;
        height: .35rem;
        line-height: .35rem;
        padding: 0 .2rem;
        top: .26rem;
        right: -.05rem;
        font-size: .26rem;
        background-color: #fff;
        border: .005rem solid #aaa;
        z-index: 5;
        overflow: hidden;
        white-space: nowrap;
        word-break: keep-all;
        text-align: left;
        color: #fff;
        box-shadow: .03rem .05rem .02rem .02rem rgba(50,50,50,.3);
    }
    .def{
        background-image: radial-gradient(closest-corner, #FF7F50 10%, #A0522D 100%);
    }
    .phy{
        background-image: radial-gradient(closest-corner, #00BFFF 10%, #008B8B 100%);
        text-shadow: 0 0 .1rem #000;
    }
    .sub-mark .sub-red{
        color: #80A;
    }
    /* 数据栏 */
    .block-data{
        width: 100%;
    }
    .stat-row{
        width: 100%;
        min-height: .36rem;
        line-height: .36rem;
        text-align: left;
    }
    .stat-attr{
        display: flex;
        justify-content: flex-start;
        align-items: center;
        height: .36rem;
    }
    .stat-team-info{
        display: inline-block;
        padding: 0 .06rem;
        border: .01rem solid #fff;
        margin-right: .08rem;
    }
    .stat-attr-title{
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 2rem;
        height: .36rem;
        line-height: .36rem;
        color: #fff;
        white-space: nowrap;
        word-break: keep-all;
    }
    .stat-attr-name{
        display: inline-block;
        width: 1.2rem;
        text-align: left;
    }
    .stat-attr-val{
        display: inline-block;
        width: 100%;
        text-align: right;
    }
    .line-wrap{
        position: relative;
    }
    .line-bar{
        position: absolute;
        left: 0;
        height: .03rem;
        line-height: .03rem;
        transform: scaleX(0);
        transform-origin: left;
        animation: extend .33s linear forwards;
    }
    .line-1{
        background-color: #fff;
    }
    .line-2{
        background-image: linear-gradient(to right, rgba(225,55,55,.9) 0%, rgba(225,55,55,.5) 50%, rgba(225,55,55,1) 100%);
    }
    @keyframes extend {
        to{
            transform: scaleX(100%);
        }
    }
</style>

<template>
    <a class="btn-unit" :class="`${unit.alive?'':'unit-dim'}`" @click="onTap({flag:1,unit,},$event)">
        <div class="avatar-wrap" :class="`${!unit.btd.alive?'dead':''}`">
            <a class="avatar" :class="" @click="onTap({flag:106,unit,},$event)">{{unitNameFormat(unit.btd.name)}}</a>
            <div class="cur" v-show="unit.btd.cur&&unit.btd.alive"></div>
            <Bar2 class="cir1" :current="unit.btd.move" :type="1" :onTap="onTap.bind(this,{flag:103,unit,})" />
            <Bar2 class="cir2" :current="unit.btd.ptc" :type="2" :onTap="onTap.bind(this,{flag:104,unit,})" />
            <Bar2 class="cir3" :current="unit.btd.dge" :type="3" :onTap="onTap.bind(this,{flag:105,unit,})" />
        </div>
        <div class="weapon-row" :class="`${!unit.btd.alive?'dead':''}`">
            <div class="weapon" v-if="unit.btd.weaponName1">{{unit.btd.weaponName1}}</div>
            <div class="weapon" v-if="unit.btd.weaponName2">{{unit.btd.weaponName2}}</div>
        </div>
        <div class="stat-row" :class="`${!unit.btd.alive?'dead':''}`">
            <Bar1 class="bar" title="" :type="1" :crt="unit.btd.hp[0]" :max="unit.btd.hp[1]" :onTap="onTap.bind(this,{flag:101,unit,})" />
            <div class="sub-mark def">
                <span class="sub-crt" :class="`${unit.btd.def[0]<0?'sub-red':''}`">{{Math.round(unit.btd.def[0])}}</span>&nbsp;/&nbsp;<span class="max">{{Math.round(unit.btd.def[1])}}</span>
            </div>
        </div>
        <div class="stat-row" :class="`${!unit.btd.alive?'dead':''}`">
            <Bar1 class="bar" title="" :type="2" :crt="unit.btd.eng[0]" :max="unit.btd.eng[1]" :onTap="onTap.bind(this,{flag:102,unit,})" />
            <div class="sub-mark phy">
                <span class="sub-crt">{{Math.round(unit.btd.phy[0])}}</span>&nbsp;/&nbsp;<span class="max">{{Math.round(unit.btd.phy[1])}}</span>
            </div>
        </div>
        <div class="buff-wrap" :class="`${!unit.btd.alive?'dead':''}`">
            <Buff v-for="buff in unit.btd.buffs" v-bind:key="buff.id" :buff="buff" :onTap="onTap.bind(this,{flag:2,unit,buff})" />
        </div>
        <div class="death-cover" v-if="!unit.btd.alive">战<br/>退</div>
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
import { DEBUG, CONFIG } from '../config/config';
export default {
    props:{
        unit: Object, // 角色数据
        onTap: { // 点击事件
            type: Function,
            default: function(){},
        },
    },
    data() {
        return {
            loading: false,

            CONFIG,
            DEBUG,
        };
    },
    computed: {
    },
    mounted(){
    },
    methods: {
        unitNameFormat(name){ // 单位名字标准化
            let pv = 0;
            if(name.length>3&&name.length<6){
                pv = 2;
            }
            else if(name.length>=6){
                pv = 3;
            }
            if(pv){
                name = name.substring(0,pv)+'\r'+name.substring(pv);
            }
            return name;
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
    .btn-unit{
        position: relative;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex-direction: column;
        width: 20%;
        height: 100%;
        margin: 0 .05rem;
    }
    /* 头像 */
    .avatar-wrap{
        position: relative;
        width: 100%;
        height: 1rem;
        white-space: normal;
        word-break: keep-all;
        margin-bottom: .05rem;
        z-index: 100;
    }
    .avatar{
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 1rem;
        height: 1rem;
        line-height: .3rem;
        font-weight: bold;
        background-image: linear-gradient(to right bottom, #666 0%, #fff 40%, #888 100%);
        /* background-image: radial-gradient(closest-corner, #fff 10%, #aaa 100%); */
        color: #000;
        border-radius: 50%;
        border: .03rem double #131313;
        z-index: 100;
        box-shadow: 0 0 .06rem .02rem #aaa;
    }
    .cur{
        position: absolute;
        z-index: 90;
        width: 2rem;
        height: 2rem;
        top: -.5rem;
        left: -.5rem;
        background-color: #FFD700;
        opacity: 0;
        border-radius: 1rem;
        animation: cur .5s infinite alternate;
    }
    @keyframes cur{
        to{
            transform: scale(66%);
            opacity: .5;
        }
    }
    .cir1{ /* 行动 */
        position: absolute;
        z-index: 103;
        width: .4rem;
        height: .4rem;
        top: -.12rem;
        right: .16rem;
        background-color: #000;
        border-radius: .4rem;
    }
    .cir2{ /* 气 */
        position: absolute;
        z-index: 103;
        width: .4rem;
        height: .4rem;
        top: .26rem;
        right: .08rem;
        background-color: #000;
        border-radius: .4rem;
    }
    .cir3{ /* 隐蔽 */
        position: absolute;
        z-index: 103;
        width: .4rem;
        height: .4rem;
        top: .66rem;
        right: .16rem;
        background-color: #000;
        border-radius: .4rem;
    }
    /* 武器 */
    .weapon-row{
        width: 100%;
        max-height: .48rem;
    }
    .weapon-row .weapon{
        height: .24rem;
        line-height: .24rem;
        color: #fff;
        font-size: .18rem;
        text-decoration: underline;
        white-space: nowrap;
        word-break: keep-all;
        overflow: hidden;
        text-align: left;
    }
    /* 数据行 */
    .stat-row{
        position: relative;
        height: .4rem;
        width: 100%;
        margin-bottom: .13rem;
        z-index: 120;
    }
    .stat-row .sub-mark{
        position: absolute;
        max-width: 90%;
        height: .25rem;
        line-height: .25rem;
        padding: 0 .03rem;
        top: .26rem;
        right: -.05rem;
        font-size: .22rem;
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
    .stat-row .def{
        background-image: radial-gradient(closest-corner, #FF7F50 10%, #A0522D 100%);
    }
    .stat-row .phy{
        background-image: radial-gradient(closest-corner, #00BFFF 10%, #008B8B 100%);
        text-shadow: 0 0 .1rem #000;
    }
    .stat-row .sub-mark .sub-red{
        color: #80A;
    }
    /* buff行 */
    .buff-wrap{
        display: block;
        width: 100%;
        height: 100%;
        /* background-color: rgba(255,255,255,.9); */
        overflow-y: auto;
        text-align: left;
    }
    /* 战退 */
    .dead{
        opacity: .2;
    }
    .death-cover{
        position: absolute;
        left: 0;
        right: 0;
        top: 8%;
        margin: auto;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 80%;
        height: 50%;
        color: #fff;
        font-size: .6rem;
        font-weight: bold;
        color: #f00;
        box-shadow: 0 0 .5rem #f00 inset;
        line-height: 1.2rem;
        text-shadow: 0 0 .2rem #000;
        z-index: 1000;
        opacity: .5;
    }
</style>

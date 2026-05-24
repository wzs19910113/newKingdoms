<template>
    <a class="btn-unit" :class="`${!unit.out?'':'unit-dim'} ${aniStyle}`" @click.stop="_onTap">
        <div class="avatar-wrap" :class="`${unit.btd.out?'out':''}`">

            <div class="cur" v-if="unit.btd.cur&&!unit.btd.out"></div>

            <Avatar class="unit-avatar" v-if="!aniStyle" ref="unit-icon" :nameStyle="2" :unit="unit" :size="2" @onTap="_onTapAvatar" />
            <Avatar class="unit-avatar" v-else ref="unit-icon" :nameStyle="2" :unit="unit" :size="2" @onTap="_onTapAvatar" />

            <Bar2 class="cir1" :current="unit.btd.mov" :type="1" :showCritical="!unit.btd.out" @onTap="_onTapFlag(103)" />
            <Bar2 class="cir2" :current="unit.btd.ptc" :type="2" @onTap="_onTapFlag(104)" />
            <Bar2 class="cir3" :current="unit.btd.dge" :type="3" @onTap="_onTapFlag(105)" />
        </div>
        <div class="weapon-row" :class="`${unit.btd.out?'out':''}`">
            <div class="weapon" v-if="unit.btd.weaponName1">{{unit.btd.weaponName1}}</div>
            <div class="weapon" v-if="unit.btd.weaponName2">{{unit.btd.weaponName2}}</div>
        </div>
        <div class="stat-row" :class="`${unit.btd.out?'out':''}`">
            <Bar1 class="bar bar-1" title="" :type="1" :crt="unit.btd.hp[0]" :max="unit.btd.hp[1]" @onTap="_onTapFlag(101)" />
            <Bar3 class="bar bar-3" v-if="unit.btd.def[1]" :type="1" :crt="unit.btd.def[0]" :max="unit.btd.def[1]" />
        </div>
        <div class="stat-row" :class="`${unit.btd.out?'out':''}`">
            <Bar1 class="bar bar-1" title="" :type="2" :crt="unit.btd.eng[0]" :max="unit.btd.eng[1]" @onTap="_onTapFlag(102)" />
            <Bar3 class="bar bar-3" v-if="unit.btd.phy[1]" :type="2" :crt="unit.btd.phy[0]" :max="unit.btd.phy[1]" />
        </div>
        <div class="buff-wrap" :class="`${unit.btd.out?'out':''}`">
            <Buff class="buff" v-for="buff in unit.btd.buffList" :key="buff.id" :buff="buff" @onTap="_onTapBuff(buff)" />
        </div>
        <div class="dead-cover" v-if="unit.btd.out==1">战<br/>退</div>
        <div class="capitulate-cover" v-if="unit.btd.out==2">屈<br/>服</div>
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
buffList: [{ // 状态栏
    id: 1,
    name: '急救',
    desc: '每回合恢复生命力',
    level: 1,
    trendVals: [20,0,0,0], // 倾向分值[保护,强化,伤害,弱化]
    elapse: 9, // 剩余回合数
},]
mentalDef: 150, // 心理防御
mov: 1, // 本回合行动者顺序，由小到大【0:非本回合行动者】
out: 0, // 是否出局
isPlayer: 1, // 玩家可操控
*/
import Bar1 from '../components/Bar1';
import Bar2 from '../components/Bar2';
import Bar3 from '../components/Bar3';
import Avatar from '../components/Avatar';
import Buff from '../components/Buff';
import { query, r, bulbsort, getParentNode, numFormat, genRandomWorkerName, genRandomRoomName, genRandomFactoryName, genRandomWorker, genRandomTerminal, genRandomRoom, getListByID } from '../tools/utils';
import * as common from '../tools/common';
import { DEBUG, CONFIG } from '../config/config';
export default {
    props:{
        unit: Object, // 角色数据
        pageState: { // 当前页面
            type: Number,
            default: 0,
        },
        onTap: { // 点击事件
            type: Function,
            default: function(){},
        },
    },
    data() {
        return {
            loading: false,
            aniStyle: '',

            common,CONFIG,DEBUG,
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
        getIconVDom(){ // 获取头像的VDOM
            return this.$refs[`unit-icon`].$refs.avatar;
        },
        trigAni(name){ // 触发动画
            if(name=='cast'){
                this.aniStyle = `unit-${name}-${this.unit.btd.isPlayer?'bottom':'top'}`;
            }
            else if(name=='shake'){
                this.aniStyle = `unit-${name}`;
            }
            else if(name=='strand'){
                this.aniStyle = `unit-${name}`;
            }
            else{
                this.aniStyle = '';
            }
        },
        calcOpacity(){ // 计算透明度
            let res, dodge = this.unit.btd.dge;
            // res = 80 + Math.round(common.awaFormat(dodge)/5);
            res = 100;
            return res;
        },
        _onTap(){
            this.$emit('onTap',{flag:1,unit:this.unit,});
        },
        _onTapAvatar(){
            this.$emit('onTap',{flag:106,unit:this.unit,});
        },
        _onTapFlag(flag){
            this.$emit('onTap',{flag,unit:this.unit,});
        },
        _onTapBuff(buff){
            this.$emit('onTap',{flag:2,unit:this.unit,buff,});
        },
    },
    components:{
        Bar1,
        Bar2,
        Bar3,
        Avatar,
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
        height: 100%;
    }
    /* 头像 */
    .avatar-wrap{
        position: relative;
        width: 100%;
        height: 1rem;
        white-space: normal;
        word-break: keep-all;
        z-index: 100;
    }
    .avatar-wrap .unit-avatar{
        display: block;
        width: 1rem;
        height: 1rem;
        z-index: 99;
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
            opacity: .33;
        }
    }
    .cir1{ /* 行动 */
        position: absolute;
        z-index: 103;
        width: .4rem;
        height: .4rem;
        top: -.14rem;
        right: .16rem;
        background-color: #000;
        border-radius: .4rem;
    }
    .cir2{ /* 气 */
        position: absolute;
        z-index: 103;
        width: .4rem;
        height: .4rem;
        top: .27rem;
        right: .03rem;
        background-color: #000;
        border-radius: .4rem;
    }
    .cir3{ /* 隐蔽 */
        position: absolute;
        z-index: 103;
        width: .4rem;
        height: .4rem;
        top: .68rem;
        right: .16rem;
        background-color: #000;
        border-radius: .4rem;
    }
    /* 武器 */
    .weapon-row{
        position: relative;
        z-index: 120;
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
        height: .66rem;
        width: 100%;
        margin-bottom: .1rem;
        z-index: 120;
    }
    .bar-1{
        height: .4rem;
    }
    .bar-3{
        top: .26rem;
        right: -.05rem;
        height: .24rem;
        line-height: .22rem;
    }
    /* .stat-row .sub-mark{
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
    } */

    /* buff行 */
    .buff-wrap{
        display: block;
        width: 100%;
        height: 100%;
        /* background-color: rgba(255,255,255,.9); */
        overflow-y: auto;
        text-align: left;
    }

    /* 战退和屈服 */
    .out{
        opacity: .2;
    }
    .dead-cover,.capitulate-cover{
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
        line-height: 1.2rem;
        text-shadow: 0 0 .2rem #000;
        z-index: 1000;
        opacity: .5;
    }
    .dead-cover{
        color: #f00;
        box-shadow: 0 0 .5rem #f00 inset;
    }
    .capitulate-cover{
        color: #caf;
        box-shadow: 0 0 .5rem #caf inset;
    }
    /* 动画 */
    .unit-cast-top .avatar-wrap{
        z-index: 150;
    }
    .unit-cast-top .avatar{
        animation: castTop .5s ease-in-out forwards;
    }
    @keyframes castTop {
        50%{
            transform: translateY(250%);
        }
        100%{
            transform: translateY(0);
        }
    }
    .unit-cast-bottom .avatar{
        animation: castBottom .5s ease-in-out forwards;
    }
    @keyframes castBottom {
        50%{
            transform: translateY(-250%);
        }
        100%{
            transform: translateY(0);
        }
    }
    .unit-shake .avatar{
        animation: shake .5s .4s ease-in-out forwards;
    }
    @keyframes shake {
        10%{
            transform: translateX(-20%);
        }
        20%{
            transform: translateX(20%);
        }
        30%{
            transform: translateX(-15%);
        }
        40%{
            transform: translateX(15%);
        }
        50%{
            transform: translateX(-12%);
        }
        60%{
            transform: translateX(12%);
        }
        70%{
            transform: translateX(6%);
        }
        80%{
            transform: translateX(-6%);
        }
        90%{
            transform: translateX(3%);
        }
        100%{
            transform: translateX(0);
        }
    }

    .unit-strand .avatar{
        animation: strand .5s ease-in-out forwards;
    }
    @keyframes strand {
        40%{
            transform: scale(1.5);
        }
        60%{
            transform: scale(.9);
        }
        80%{
            transform: scale(1.2);
        }
        100%{
            transform: scale(1);
        }
    }
</style>

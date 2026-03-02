<template>
    <a class="btn-role" :class="`${role.alive?'':'role-dim'}`">
        <span class="row row1">
            <b class="sp sp1">{{role.move>0?role.move:''}}</b>
            <span class="sp sp2">{{role.name}}</span>
            <b class="sp sp3 sp-hp">
                血:{{role.hp}}
                <span class="sp sp-m">+{{role.heal}}</span>
            </b>
            <b class="sp sp3 sp-def">
                甲:{{role.def}}/{{role.maxDef}}
                <span class="sp sp-m">+{{role.dex}}</span>
            </b>
            <b class="sp sp3 sp-atk">
                攻:{{role.atk}}
                <span class="sp sp-m">+{{role.str}}</span>
            </b>
            <b class="sp sp1">{{role.weight}}权</b>
            <b class="sp sp1">{{role.int}}智</b>
            <b class="sp sp4 sp-vig">气:{{role.vig}}/{{role.tvig}}</b>
        </span>
        <span class="row row2"></span>
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
import { query, r, bulbsort, getParentNode, numFormat, genRandomWorkerName, genRandomRoomName, genRandomFactoryName, genRandomWorker, genRandomTerminal, genRandomRoom, getListByID } from '../tools/utils';
import { DEBUG, CONFIG } from '../config/config';
export default {
    props:{
        role: Object, // 角色战斗数据
    },
    data() {
        return {
            loading: false,

            CONFIG,
            DEBUG,
        };
    },
    computed: {},
    mounted(){

    },
    methods: {

    },
};
</script>
<style scoped>
    .btn-role{
        display: block;
        width: 100%;
        margin-bottom: .08rem;
        background-color: #ddd;
        color: #222;
    }
    .row{
        position: relative;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        height: .4rem;
    }
    .sp{
        position: relative;
        display: inline-block;
        min-width: .06rem;
        height: .4rem;
        line-height: .4rem;
        text-align: center;
        font-size: .22rem;
        white-space: nowrap;
        word-break: break-all;
    }
    .sp1{
        width: 8%;
    }
    .sp2{
        width: 13%;
    }
    .sp3{
        width: 17%;
    }
    .sp4{
        width: 20%;
    }
    .sp-m{
        opacity: .5;
    }
    .sp-hp{
        color: #FF4500;
    }
    .sp-def{
        color: #FF8C00;
    }
    .sp-atk{
        color: #0000CD;
    }
    .sp-vig{
        color: #2E8B57;
    }
</style>

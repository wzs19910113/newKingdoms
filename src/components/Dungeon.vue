<template>
    <div class="dungeon">
        <a class="dungeon-guard" @click.stop="onTapGuard">
            <div class="guard-level">
                <span>警戒等级：{{common.calcGuardLevel(map)}} 级</span>
                <span>{{calcNextGuard()}}</span>
            </div>
            <Bar1 class="guard-bar" @onTap="onTapGuard" :class="`guard-${common.calcGuardLevel(map)}`" :type="5" :title="`警戒值`" :mode="2" :crt="map.guard" :max="100" />
        </a>
        <div class="dungeon-main">
            <div class="cell-wrap">
                <!--
                    id: 1,
                    show: false,
                    flag: true,
                    core: false,
                    marked: false, // 是否显示路标或核心标识
                    enemy: 0, // 0无敌人 1+敌人数量
                -->
                <a class="btn-cell" :class="`${cell.show?'':'btn-cell-hide'}`" :style="calcCellPosition(cell,index)" v-for="(cell,index) of map.cellList" @click.stop="onTapCell(cell,index)">
                    <span class="ele flag" v-if="cell.flag&&(cell.show||cell.marked)">
                        <b>标</b>
                        <!-- <img :src="require(`../assets/icon-flag.png`)" /> -->
                    </span>
                    <span class="ele core" v-if="cell.core&&(cell.show||cell.marked)">
                        <b>核</b>
                        <!-- <img :src="require(`../assets/icon-core.png`)" /> -->
                    </span>
                    <span class="ele enemy" v-if="cell.enemy&&cell.show"></span>
                    <div class="brick" :class="`${cell.show?`brick-flip`:``}`"></div>
                    <!-- <div :style="{position:'absolute',zIndex:'100',color:'#f43',fontWeight:'bold',fontSize:'.32rem'}">{{cell.enemy}}</div> -->
                </a>
            </div>
        </div>
        <div class="dungeon-ops">
            <a class="btn btn-leave-tip" v-if="calcFlagCount()<(map.size-1)">找齐 {{map.size-1}}（{{calcFlagCount()}}） 个<b>路标</b>方可离开</a>
            <a class="btn btn-leave" v-else @click.stop="onTapLeave">返回龙虾村</a>
            <a class="btn btn-core" v-if="calcCoreShow()" @click.stop="onTapCore">进入核心</a>
            <a class="btn btn-temple" v-if="calcTempleShow()" @click.stop="onTapTemple">参拜神庙</a>
            <a class="battery-wrap" @click.stop="onTapBattery">
                <div class="battery-title">能源储备</div>
                <div class="battery-value">
                    <div class="battery-value-remain">{{map.battery[0]}}</div>
                    <div class="battery-value-total">{{map.battery[1]}}</div>
                </div>
            </a>
        </div>
    </div>
</template>
<script>
import Bar1 from './Bar1';
import { cl, query, r, exptr, setInRange, loadImages, shuffle, bulbsort, bulbsort2, getParentNode, cloneObj, numFormat, avg, percent, calcDistance, getMatchList, getSubMatchList, removeFromList, removeFromNumberList, arrContains, } from '../tools/utils';
import * as common from '../tools/common';

import { DEBUG, CONFIG, CACHE, ASSETS, } from '../config/config';

const mapLength = 100;
const cellLength = 13;

export default {
    name: 'Dungeon',
    props:{
        map: Object, // 地图数据
        onTapGuard: { // 点击警戒栏位事件
            type: Function,
            default: function(){},
        },
        onTapCell: { // 点击单元格事件
            type: Function,
            default: function(){},
        },
        onTapCore: { // 点击进入核心按钮事件
            type: Function,
            default: function(){},
        },
        onTapLeave: { // 点击离开按钮事件
            type: Function,
            default: function(){},
        },
        onTapTemple: { // 点击解救居民按钮事件
            type: Function,
            default: function(){},
        },
        onTapBattery: { // 点击电池
            type: Function,
            default: function(){},
        },
    },
    data() {
        return {

            common,
            ASSETS,
            CONFIG,
            DEBUG,
        };
    },
    computed: {
    },
    mounted(){
    },
    methods: {
        calcCellPosition(cell,index){ // 计算单元格的style
            let res;
            let left = 0, top = 0;
            let size = this.map.size;
            let x = index%size, y = Math.floor(index/size);
            let blank = mapLength-size*cellLength;
            let padding = blank/(size-1);

            left = x*(cellLength+padding);
            top = y*(cellLength+padding);

            res = { left:left+`%`, top:top+`%`, };
            return res;
        },
        calcFlagCount(){ // 计算已显示的路标数量
            let res = 0;
            for(let cell of this.map.cellList){
                if(cell.flag&&cell.show){
                    res++;
                }
            }
            return res;
        },
        calcCoreShow(){ // 判断核心是否可见
            let res = false;
            for(let cell of this.map.cellList){
                if(cell.core&&cell.show){
                    res = true;
                    break;
                }
            }
            return res;
        },
        calcTempleShow(){ // 判断居民是否可见
            let res = true;
            for(let cell of this.map.cellList){
                if(!cell.show){
                    res = false;
                    break;
                }
            }
            if(res){
                let hasNoCore = true;
                for(let cell of this.map.cellList){
                    if(cell.core){
                        hasNoCore = false;
                        break;
                    }
                }
                res = !hasNoCore;
            }
            return res;
        },
        calcNextGuard(){ // 计算下一个等级警戒值需求
            let res = `升级需求警戒值：`;
            let curLevel = common.calcGuardLevel(this.map);
            let nextFloor = this.map.floors[curLevel+1];
            if(nextFloor){
                res += `${nextFloor.thresGuard}`;
            }
            else{
                res = `警戒等级已满`;
            }
            return res;
        },
    },
    components:{
        Bar1,
    }
};
</script>
<style scoped>
    .dungeon{
        position: absolute;
        left: 0;
        right: 0;
        margin: 0 auto;
        top: .95rem;
        bottom: 2.81rem;
        width: 100%;
        /* box-shadow: 0 0 .44rem pink inset; */
    }

    /* 警戒值栏目 */
    .dungeon-guard{
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        top: 0;
        width: 100%;
        left: 0;
        right: 0;
        margin: 0 auto;
        height: 80px;
        /* box-shadow: 0 0 .44rem grey inset; */
    }
    .guard-bar{
        height: .4rem;
        width: 6.5rem;
    }
    .guard-level{
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: .42rem;
        line-height: .42rem;
        color: #CD812C;
        font-weight: bold;
        text-align: left;
        width: 6.5rem;
        padding: .14rem;
        font-size: .27rem;
        background-image: linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 80%, rgba(0,0,0,0) 100%);
    }
    .guard-1{

    }
    .guard-2{

    }
    .guard-3{

    }
    .guard-4{

    }
    .guard-5{

    }

    /* 单元格栏目 */
    .dungeon-main{
        position: absolute;
        left: 0;
        right: 0;
        top: 80px;
        bottom: 120px;
        margin: 0 auto;
        padding: .2rem;
        max-width: 329px;
        max-height: 329px;
        /* background-color: rgba(0,0,0,.5); */
    }
    /* @media (min-width: 360px){
        .dungeon-main{
            top: auto;
            bottom: 110px;
        }
    } */
    .cell-wrap{
        position: absolute;
        left: 0;
        right: 0;

        margin: 0 auto;
        width: 90%;
        height: 90%;
    }
    .btn-cell{
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 38px;
        height: 38px;
        color: #000;
    }
    .btn-cell-hide{
    }

    /* ---------- 最具灵魂的菱形元素 ---------- */
    .brick{
        position: absolute;
        transform: rotateZ(45deg);
        width: 100%;
        height: 100%;
        transform-style: preserve-3d;
        perspective: 100px;
        background-color: transparent;
        /* background-image: url('./../assets/icon-brick-off.png'); */
        background-size: 100% 100%;
        background-position: right;
        background-repeat: no-repeat;
        box-shadow: 0 0 .12rem #fff;
        border-radius: .14rem;
        animation: brickfade .25s ease-in-out infinite alternate;
    }
    @keyframes brickfade {
        to{
            box-shadow: 0 0 .22rem #fff;
        }
    }
    .brick-flip{
        animation: frontFlip .25s forwards ease-in-out;
        z-index: 0;
    }
    @keyframes frontFlip {
        0% {
            transform: rotateZ(45deg) rotateY(0deg);
            /* background-image: url('./../assets/icon-brick-off.png'); */
        }
        50% {
            transform: rotateZ(45deg) rotateY(90deg);
            /* background-image: url('./../assets/icon-brick-off.png'); */
        }
        51% {
            transform: rotateZ(45deg) rotateY(90deg);
            /* background-image: url('./../assets/icon-brick-on.png'); */
            background-image: linear-gradient(to right, rgba(205,205,205,.5) 0%,rgba(255,255,255,1) 50%,rgba(205,205,205,.5) 100%);
        }
        100% {
            transform: rotateZ(45deg) rotateY(180deg);
            /* background-image: url('./../assets/icon-brick-on.png'); */
            background-image: linear-gradient(to right, rgba(205,205,205,.5) 0%,rgba(255,255,255,1) 50%,rgba(205,205,205,.5) 100%);
            box-shadow: none;
        }
    }
    .btn-cell .ele{
        position: relative;
        z-index: 1;
        width: .5rem;
        height: .5rem;
        line-height: .5rem;
        font-size: .4rem;
        overflow: hidden;
    }
    .btn-cell .ele >b{
        display: block;
        width: .5rem;
        height: .5rem;
        overflow: hidden;
        border-radius: 50%;
    }
    .btn-cell .ele >img{
        display: block;
        width: 100%;
        height: 100%;
    }
    .btn-cell .flag >b{
        color: #184;
        border: .03rem solid #184;
    }
    .btn-cell .core >b{
        color: #D23;
        border: .03rem solid #D23;
    }
    .btn-cell .enemy{
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        margin: auto;
        width: .4rem;
        height: .4rem;
        border-radius: 50%;
        border: .1rem solid rgba(255,6,17,1);
        animation: explore .4s ease-in-out forwards;
    }
    @keyframes explore {
        80%{
            transform: scale(2000%);
            border-width: .001rem;
        }
        100%{
            transform: scale(2400%);
            opacity: 0;
        }
    }

    /* 按钮栏目 */
    .dungeon-ops{
        position: absolute;
        bottom: 0;
        right: 0;
        left: 0;
        margin: 0 auto;
        width: 100%;
        height: 2.1rem;
        max-width: 400px;
        max-height: 110px;
        /* box-shadow: 0 0 .44rem red inset; */
        overflow-y: auto;
    }
    .dungeon-ops .btn{
        margin: 0 auto;
        margin-bottom: .1rem;
        width: 3.5rem;
        height: .6rem;
        line-height: .6rem;
        padding: 0 .1rem;
        color: #fff;
        font-size: .24rem;
        background-color: rgba(0,0,0,.75);
    }
    .dungeon-ops .btn-leave-tip,
    .dungeon-ops .btn-leave{
    }
    .dungeon-ops .btn-leave-tip{
        border-bottom: .02rem solid orangeRed;
    }
    .dungeon-ops .btn-leave-tip >b{
        color: #184;
        font-size: .28rem;
    }
    .dungeon-ops .btn-leave{
        border: .02rem solid #32FD32;
        box-shadow: 0 0 .04rem #32FD32;
        animation: leaveFlash 1s ease-in-out infinite alternate;
    }
    @keyframes leaveFlash {
        to{
            box-shadow: 0 0 1.24rem #32FD32;
        }
    }
    .dungeon-ops .btn-core{
        border: .02rem solid #e81313;
        box-shadow: 0 0 .04rem #e81313;
        animation: coreFlash 1s ease-in-out infinite alternate;
    }
    @keyframes coreFlash {
        to{
            box-shadow: 0 0 1.24rem #e81313;
        }
    }
    .dungeon-ops .btn-temple{
        border: .02rem solid #f1a644;
        box-shadow: 0 0 .04rem #f1a644;
        animation: templeFlash 1s ease-in-out infinite alternate;
    }
    @keyframes templeFlash {
        to{
            box-shadow: 0 0 1.24rem #f1a644;
        }
    }
    .btn{
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .btn >img{
        display: inline-block;
        height: 70%;
    }

    /* 电池 */
    .battery-wrap{
        position: absolute;
        left: .4rem;
        top: .2rem;
        width: 1.2rem;
        color: #fff;
        border: .02rem solid #fff;
    }
    .battery-wrap .battery-title{
        height: .5rem;
        line-height: .5rem;
        border-bottom: .02rem solid #fff;
        background-image: radial-gradient(closest-corner, rgba(5,5,25,1) 0%, rgba(45,45,125,.8) 100%);
    }
    .battery-wrap .battery-value{
        height: .72rem;
        line-height: .72rem;
        font-size: .3rem;
    }
    .battery-wrap .battery-value-remain{
        width: 85%;
        margin: 0 auto;
        height: .36rem;
        line-height: .36rem;
        border-bottom: .02rem solid #fff;
    }
    .battery-wrap .battery-value-total{
        width: 85%;
        margin: 0 auto;
        height: .36rem;
        line-height: .36rem;
    }
</style>

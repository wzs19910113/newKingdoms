<template>
    <div class="equip-list">
        <a class="unit-bag-equip-wrap" :class="selectingEquip.id==equip.id?'unit-bag-equip-wrap-sel':''" v-for="equip of unit.btd.bagList" :key="equip.id"  @click.stop="onTapEquip(equip)">
            <Equip class="unit-bag-equip" :equip="equip" />
            <div class="unit-bag-op-wrap" v-show="selectingEquip.id==equip.id">
                <!-- 在队或同道单位 -->
                <div class="unit-bag-op" v-if="unit.rel>=2">
                    <a class="btn" v-if="showSell" @click.stop="onTapSellEquip(equip,unit)">售卖</a>
                    <a class="btn" @click.stop="onTapMoveEquip(equip,unit)">转移</a>
                    <a class="btn" v-if="selectingEquip.t!=1&&selectingEquip.t!=4" @click.stop="onTapEquipOn(equip,unit,0)">装上</a>
                    <a class="btn" v-if="selectingEquip.t==1||selectingEquip.t==4" @click.stop="onTapEquipOn(equip,unit,1)">装上1</a>
                    <a class="btn" v-if="selectingEquip.t==1||selectingEquip.t==4" @click.stop="onTapEquipOn(equip,unit,2)">装上2</a>
                </div>
                <!-- 相识单位 -->
                <div class="unit-bag-op" v-if="unit.rel==1">
                    <a class="btn" @click.stop="onTapBuyEquip(equip,unit)">购买</a>
                </div>
                <!-- 对比装备 -->
                <div class="unit-bag-compare-wrap" v-if="selectingEquip.id==equip.id">
                    <div class="unit-bag-compare-title">{{unit.btd.name}}身上的装备：</div>
                    <Equip :ref="`compareEquip1-${equip.id}`" class="unit-bag-equip unit-bag-compare" v-if="compare1.id" :equip="compare1" :compare="selectingEquip" />
                    <Equip :ref="`compareEquip2-${equip.id}`" class="unit-bag-equip unit-bag-compare" v-if="compare2.id" :equip="compare2" :compare="selectingEquip" />
                </div>
            </div>
        </a>
    </div>
</template>
<script>
import Unit1 from '../components/Unit1';
import Bar1 from '../components/Bar1';
import Bar2 from '../components/Bar2';
import Bar3 from '../components/Bar3';
import Equip from '../components/Equip';
import Skill from '../components/Skill';
import Toast from '../components/Toast';
import Pop from '../components/Pop';
import Avatar from '../components/Avatar';
import draggable from 'vuedraggable';
import { cl, query, r, exptr, setInRange, loadImages, shuffle, bulbsort, bulbsort2, getParentNode, cloneObj, numFormat, avg, percent, calcDistance, getMatchList, getSubMatchList, removeFromList, arrContains, } from '../tools/utils';
import * as common from '../tools/common';
import * as ai from '../tools/ai';
import { DEBUG, CONFIG, CACHE, ASSETS, } from '../config/config';

export default {
    name: 'EquipList',
    props:{
        unit: { // 背包持有者
            type: Object,
            default: {},
            required: true,
        },
        selectingUnit: { // 浏览背包的人
            type: Object,
            default: {},
            required: true,
        },
        onTapSellEquip: { // 点击【贩卖】
            type: Function,
            default: function(){},
        },
        onTapMoveEquip: { // 点击【转移】
            type: Function,
            default: function(){},
        },
        onTapEquipOn: { // 点击【装上】
            type: Function,
            default: function(){},
        },
        onTapBuyEquip: { // 点击【购买】
            type: Function,
            default: function(){},
        },
        showSell: Boolean, // 是否显示售卖按钮
    },
    data() {
        return {
            selectingEquip: { id:0, }, // 单位弹窗-选中的背包装备
            compare1: {}, // 对比装备1
            compare2: {}, // 对比装备2

            common,
            ASSETS,
            CONFIG,
            DEBUG,
        };
    },
    computed: {},
    mounted(){
        this.init();
    },
    methods: {
        init(){
            this.selectingEquip = { id:0, };
            this.compare1 = {};
            this.compare2 = {};
        },
        onTapEquip(equip){ // 点击【背包中的装备】
            if(equip.id==this.selectingEquip.id){ // 点击同一个装备
                this.selectingEquip = { id:0, };
                this.compare1 = {};
                this.compare2 = {};
            }
            else{ // 选中装备
                this.selectingEquip = equip;
                // 设置2个“对比装备”
                let equipList = this.selectingUnit.btd.equipList;
                if(equip.t==1){ // 武器 [1手,2头,3身体,4配饰,5脚]
                    this.compare1 = equipList[0]||{};
                    this.compare2 = equipList[1]||{};
                }
                else if(equip.t==4){ // 首饰
                    this.compare1 = equipList[2]||{};
                    this.compare2 = equipList[3]||{};
                }
                else{
                    this.compare1 = equipList[[0,0,5,4,0,6,][equip.t]]||{};
                    this.compare2 = {};
                }
                // console.log(`点击【弹窗-背包中的装备】`,this.selectingEquip);
            }
        },
    },
    components: {
        Bar1,
        Bar2,
        Bar3,
        Equip,
        Skill,
        Toast,
        Unit1,
        Avatar,
        draggable,
        Pop,
    },
};
</script>
<style scoped>
    .equip-list{
        display: block;
    }
    .unit-bag-equip-wrap{
        display: block;
        margin-bottom: .32rem;
        border-radius: .12rem;
        border: .01rem solid #FEC;
    }
    .unit-bag-equip-wrap-sel{
        /* background-color: rgba(144,114,51,.5); */
        /* background-color: orangeRed; */
        background-image: linear-gradient(to right, rgba(14,24,71,.5) 0%, rgba(13,13,13,.5) 40%, rgba(13,13,13,.5) 60%, rgba(14,24,71,.5) 100%);
        box-shadow: 0 0 .54rem orangeRed;
        border: .04rem solid orangeRed;
        /* box-shadow: 0 0 .4rem #e81313 inset; */
    }
    /* 弹窗-单位-背包-操作栏 */
    .unit-bag-op-wrap{
        animation: expendDown .1s ease-in-out forwards;
        transform: scaleY(0);
        transform-origin: 50% 0;
    }
    @keyframes expendDown {
        to{
            transform: scaleY(100%);
        }
    }
    .unit-bag-equip-wrap .unit-bag-equip{

    }
    .unit-bag-equip-wrap .unit-bag-op{
        text-align: right;
        padding: 0 .1rem;
        height: .8rem;
        line-height: .8rem;
    }
    .unit-bag-equip-wrap .unit-bag-op .btn{
        display: inline-block;
        padding: 0 .2rem;
        height: .55rem;
        line-height: .55rem;
        font-size: .3rem;
        box-shadow: 0 0 .14rem orangeRed inset;
        border: .02rem solid orangeRed;
    }
    .unit-bag-compare-wrap{
        padding: 0 .6rem;
        padding-bottom: .2rem;
        border-radius: .1rem;
    }
    .unit-bag-compare-title{
        text-align: left;
        height: .36rem;
        line-height: .36rem;
        font-size: .24rem;
        padding: 0 .1rem;
    }
    .unit-bag-compare{
        border-radius: .2rem;
        margin-bottom: .12rem;
    }
</style>

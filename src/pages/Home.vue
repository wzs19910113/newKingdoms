<template>
    <div class="main">
        <!--作弊-->
        <nut-drag direction="y" :style="{right:'0px',top:'75px',zIndex:'200'}" v-if="DEBUG">
            <a class="btn touch-dom" @click="onTapCheat">cheat</a>
        </nut-drag>
        <!-- 主体 -->
        <div class="panel" v-if="state==0">
            <div class="equip-wrap">加载中</div>
        </div>
        <div class="panel" v-if="state==1">
            <!-- <img class="bg-src" :src="require(`../assets/bg-battle.png`)" />
            <img class="bg-src" :src="require(`../assets/bg-menu.png`)" />
            <img class="bg-src" :src="require(`../assets/icon-female-1.png`)" />
            <img class="bg-src" :src="require(`../assets/icon-female-2.png`)" />
            <img class="bg-src" :src="require(`../assets/icon-female-3.png`)" />
            <img class="bg-src" :src="require(`../assets/icon-male-1.png`)" />
            <img class="bg-src" :src="require(`../assets/icon-male-2.png`)" />
            <img class="bg-src" :src="require(`../assets/icon-male-3.png`)" /> -->
            <!-- <div class="skill-wrap">
                <Skill class="skill" v-for="skill of game.allSkills" :key="skill.id" :skill="skill" :mode="1" @onTap="onTapSkill" />
            </div>
            <div class="equip-wrap">
                <Equip v-for="equip of game.allEquips" :key="equip.id" :equip="equip" @onTap="onTapEquip" />
            </div> -->

            <!-- 操作板块 -->
            <div class="menu-wrap">
                <draggable class="unit-list-group" handle=".mover" :disabled="false" v-model="team" @end="onUnitDragEnd" animation="100">
                    <div class="unit-item" v-for="index in [0,1,2,3]" :key="index">
                        <a class="unit" v-if="team[index]">
                            <Avatar class="unit-avatar" :unit="team[index]" @onTap="onTapUnit(team[index])" />
                            <a class="anchor mover" v-if="team.length>1">拖移</a>
                            <Bar1 class="unit-bar" :suffix="team[index].btd.def[1]?`${team[index].btd.def[1]}`:''" :type="1" :crt="team[index].btd.hp[0]" :max="team[index].btd.hp[1]" />
                            <Bar1 class="unit-bar" :suffix="team[index].btd.phy[1]?`${team[index].btd.phy[1]}`:''" :type="2" :crt="team[index].btd.eng[0]" :max="team[index].btd.eng[1]" />
                        </a>
                        <div class="unit unit-empty" v-else></div>
                    </div>
                </draggable>
                <!-- <div class="unit-list-group">
                    <div class="unit-item" v-for="index in [0,1,2,3]" :key="index">
                        <a class="unit mover" v-if="team[index]">
                            <Avatar class="unit-avatar" :unit="team[index]" @onTap="onTapUnit(team[index])" />
                        </a>
                        <div class="unit unit-empty" v-else></div>
                    </div>
                </div> -->
            </div>
        </div>
        <!-- 背景 -->
        <div class="bg" v-if="state==1"></div>
        <!-- 弹窗 -->
        <Pop v-if="viewingUnitTab" :title="`${viewingUnit.btd.name}的${[`面板`,`装备`,`技能`,][viewingUnitTab-1]}`" :arrowTitle="`${[`装备`,`技能`,`面板`,][viewingUnitTab-1]}`" :showCloseButton="true" @onTapClose="onTapClosePop" @onTapArrow="onTapArrowPop">
            <!-- 角色面板 -->
            <div class="unit-info-pop unit-board" v-if="viewingUnitTab==1">
                <Unit1 :unit="viewingUnit" @onTapTransferMoney="onTapTransferMoney" :mode="1" />
            </div>
            <!-- 角色装备表 -->
            <div class="unit-info-pop unit-equip-board" v-if="viewingUnitTab==2">
                <div class="unit-body">
                    <img class="unit-body-bg" :src="require(`../assets/outline-${viewingUnit.gd==1?'male':'female'}.png`)" />
                    <a class="unit-body-equip-wrap" :class="`${viewingUnitEquipIndex==(index-1)?'unit-body-equip-wrap-expand':''} unit-body-${[`weapon1`,`weapon2`,`accessory1`,`accessory2`,`armor`,`helmet`,`shoes`,][index-1]}`" v-for="index in 7" :key="index" @click.stop="onTapViewingUnitEquip(index-1)">
                        <Equip class="unit-body-equip" :class="" v-if="viewingUnit.btd.equipList[index-1]" :equip="viewingUnit.btd.equipList[index-1]" :mode="viewingUnitEquipIndex==(index-1)?1:2" />
                        <div class="unit-body-op" v-if="viewingUnitEquipIndex==(index-1)">
                            <a class="btn" @click.stop="onTapSellEquip(viewingUnit.btd.equipList[index-1])">售卖</a>
                            <a class="btn" @click.stop="onTapEquipOff(viewingUnit.btd.equipList[index-1])">卸下</a>
                        </div>
                    </a>
                </div>
                <div class="unit-bag equip-wrap">
                    <div class="unit-bag-title">背包（{{viewingUnit.btd.bagList.length}}）：</div>
                    <a class="unit-bag-equip-wrap" v-for="equip of viewingUnit.btd.bagList" :key="equip.id"  @click.stop="onTapViewingUnitBag(equip)">
                        <Equip class="unit-bag-equip" :equip="equip" />
                        <div class="unit-bag-op" v-show="viewingUnitBagEquip.id==equip.id">
                            <a class="btn" @click.stop="onTapSellEquip(equip)">售卖</a>
                            <a class="btn" @click.stop="onTapEquipOn(equip)">装上</a>
                        </div>
                    </a>
                </div>
            </div>
            <!-- 角色技能表 -->
            <div class="unit-info-pop unit-skill-board" v-if="viewingUnitTab==3">
                <div class="skill-wrap">
                    <Skill class="skill" v-for="skill of viewingUnit.btd.skillList" :key="skill.id" :skill="skill" :mode="1" @onTap="onTapSkill" />
                </div>
            </div>
        </Pop>
        <!-- alert -->
        <Toast ref="toast" />
    </div>
</template>

<script>
import List from '../components/List';
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

const BUFF_LIST = [...CONFIG.goodBuffs,...CONFIG.badBuffs];

export default {
    name: 'Home',
    data(){
        return {
            loading: false,
            state: 0,

            game: {},

            team: [],

            viewingUnitTab: 0,
            viewingUnit: null,
            viewingUnitEquipIndex: -1, // 单位弹窗-放大的装备 index
            viewingUnitBagEquip: {id:0,}, // 单位弹窗-选中的背包装备

            unitDraggable: false,

            common,
            ASSETS,
            CONFIG,
            DEBUG,
        };

    },
    mounted(){
        let _storage = localStorage.getItem(CACHE.sto);
        if(!_storage){
            if(window.GLOBAL&&window.GLOBAL.game){
                this.game = window.GLOBAL.game;
                this.init();
            }
            else{
                this.$router.push('/');
            }
        }
        else{
            let storage = JSON.parse(_storage);
            this.game = storage;
            this.init();
        }
    },
    methods: {
        init(){ // 初始化
            loadImages(ASSETS.image_urls).then(images=>{
                this._alert(`成功加载 ${images.length} 张图片`,3);
                this.asynTeam();
                this.state = 1;
                console.log(this.game);
            });
        },
        save(showAlert){ // 保存数据到 local
            let storage = this.game;
            try{
                localStorage.setItem(CACHE.sto,JSON.stringify(storage));
                if(showAlert){
                    this._alert(`保存成功`);
                }
            }
            catch(err){
                this._alert(`游戏保存失败：${err.message}`);
                console.error(err);
            }
        },
        asynTeam(){ // 同步 team 数据到 home
            let team = [];
            for(let unit of this.game.allUnits){
                if(unit.tms){
                    let btd = common.getUnitBtd(unit,this.game);
                    let cUnit = cloneObj(unit);
                    cUnit.btd = btd;
                    team.push(cUnit);
                }
            }
            this.team = bulbsort(team,'tms',0);
        },
        resetViewingUnitPopData(){ // 重置单位预览弹窗数据
            this.viewingUnitTab = 0;
            this.viewingUnit = null;
            this.viewingUnitEquipIndex = -1; // 单位弹窗-放大的装备 index
            this.viewingUnitBagEquip = {id:0,}; // 单位弹窗-选中的背包装备
        },

        onUnitDragEnd(e){ // 当单位拖拽结束
            for(let i=0;i<this.team.length;i++){
                let member = this.team[i];
                let oUnit = getMatchList(this.game.allUnits,[['id',member.id]])[0];
                if(oUnit){
                    oUnit.tms = i+1;
                }
            }
            this.asynTeam();
            this.save();
        },

        onTapUnit(unit){ // 点击【单位】
            this.viewingUnit = unit;
            this.viewingUnitTab = 1;
        },
        onTapSkill(data){ // 点击【技能】
            let { flag, skill, buffId, buffLevel, text, } = data;
            if(flag==1){ //

            }
            else if(flag==2&&buffId&&buffLevel){ // 点击buff
                this.onTapBuff(buffId,buffLevel);
            }
            else if(flag==3&&text){ // 发送说明弹窗
                this._alert(text);
            }
        },
        onTapEquip(data){ // 点击【装备】
            let { flag, equip, buffId, buffLevel, sp, spLevel, } = data;
            if(flag==1){ //
                // console.log(equip);
            }
            else if(flag==2){ // 点击buff
                this.onTapBuff(buffId,buffLevel);
            }
            else if(flag==3){ // 点击SP
                this._alert(`${CONFIG.spAttackList[sp-1]}：${CONFIG.spAttackDescList[sp-1]}`,5);
            }
        },
        onTapBuff(id,level){ // 点击【buff】
            let buff = getMatchList(BUFF_LIST,[['id',id]])[0]||{};
            this._alert(`给予敌人：${buff.name}（强度${level}）- ${buff.desc}`,5);
        },
        onTapTransferMoney(){ // 点击【转移金币】
            console.log(`!`);
        },
        onTapArrowPop(){ // 点击【弹窗-箭头】
            this.viewingUnitTab = [2,3,1,][this.viewingUnitTab-1];
        },
        onTapViewingUnitEquip(equipIndex){
            let equip = this.viewingUnit.btd.equipList[equipIndex];
            if(equip&&equip.id){
                this.viewingUnitEquipIndex = (this.viewingUnitEquipIndex!=-1)?-1:equipIndex;
            }
            else{
                this.viewingUnitEquipIndex = -1;
            }
        },
        onTapViewingUnitBag(equip){ // 点击【弹窗-背包中的装备】
            this.viewingUnitBagEquip = (this.viewingUnitBagEquip.id!=0)?{id:0,}:equip;
            console.log(`点击【弹窗-背包中的装备】`,this.viewingUnitBagEquip);
        },
        onTapEquipOn(equip){ // 点击【装上装备】
            console.log(`装上装备`,equip.n);
        },
        onTapEquipOff(equip){ // 点击【卸下装备】
            console.log(`卸下装备`,equip.n);
        },
        onTapSellEquip(equip){ // 点击【售卖装备】
            console.log(`售卖装备`,equip.n);
        },
        onTapClosePop(){ // 点击【弹窗-关闭】
            this.resetViewingUnitPopData();
        },
        onTapCheat(){ // 点击【作弊】按钮

        },

        _alert(text,time){ // 显示提示
            this.$refs.toast.trigger(text,time);
        },
    },
    components:{
        List,
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
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .main{
        position: relative;
        text-align: center;
        width: 100%;
        height: 100%;
        color: #4a4a4a;
        font-size: .24rem;
        line-height: 0;
        background-color: #140425;
    }
    .btn{
        background-color: transparent;
        display: inline-block;
        color: #fff;
        text-align: center;
        cursor: pointer;
        border-radius: .01rem;
        border: .02rem solid #2F4F4F;
        box-shadow: 0 0 .14rem #2F4F4F inset;
    }
    .panel{
        width: 100%;
        height: 100%;
        overflow-y: auto;
    }

    .bg{
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        margin: 0;
        width: 100%;
        height: 100%;
        background-image: url('./../assets/bg-town-1.png');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        opacity: 1;
        z-index: 1;
        box-shadow: 0 0 4rem 1rem #acd inset;
        animation: bg_fadein .2s .3s ease-in forwards;
    }
    @keyframes bg_fadein {
        to{
            opacity: .8;
        }
    }
    .skill-wrap{
        width: 6rem;
        margin: 0 auto;
    }
    .skill-wrap .skill{
        display: block;
        margin-bottom: .2rem;
    }

    /* 菜单 */
    .menu-wrap{
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        height: 3.2rem;
        padding-top: .3rem;
        background-image: url('./../assets/bg-menu.png');
        background-size: 115% 160%;
        background-position: top;
        background-repeat: no-repeat;
        z-index: 2000;
        transition: all .2s;
    }
    .menu-wrap-expand{
        height: 100%;
    }

    /* 单位 */
    .unit-list-group{
        width: 100%;
        height: 100%;
        /* border: 1px solid red; */
        display: flex;
        justify-content: flex-start;
        align-items: center;
    }
    .unit-list-group .unit-item{
        display: flex;
        justify-content: center;
        align-items: center;
        width: 23%;
        margin: 0 1%;
        height: 90%;
        position: relative;
        background-image: linear-gradient(to top, rgba(0,0,0,.2) 0%, rgba(0,0,0,0) 100%);
        border-bottom: .01rem solid #111;
    }
    .unit-list-group .unit-item .unit{
        display: block;
        width: 1.5rem;
        padding-top: .2rem;
        /* background-color: rgba(0,0,0,.2); */
    }
    .unit-list-group .unit-item .unit-avatar{
        display: block;
        width: 1.5rem;
        height: 1.5rem;
    }
    .unit-bar{
        position: relative;
        display: block;
        height: .3rem;
        width: 100%;
        margin: .04rem 0;
    }
    .unit-list-group .anchor{
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
        left: 0;
        top: 0;
        width: .3rem;
        height: .5rem;
        line-height: .2rem;
        color: #fff;
        z-index: 40;
        font-size: .2rem;
        border: .01rem solid #fff;
        text-align: center;
    }

    /* pop */
    /*
    <div class="unit-info-pop unit-equip-board">
        <div class="unit-body">
            <img class="unit-body-bg" />
            <div class="unit-body-equip-wrap unit-body-weapon1">
                <Equip class="unit-body-equip"/>
            </div>
        </div>
        <br/>
        <div class="unit-bag equip-wrap">
            <Equip class="unit-bag-equip"/>
        </div>
    </div>
    */
    .unit-info-pop{
        position: relative;
        width: 100%;
        padding: .14rem .22rem;
    }
    .unit-equip-board{
        padding: .04rem .06rem;
        padding-bottom: 2.2rem;
    }
    .unit-equip-board .unit-body{
        position: relative;
        width: 100%;
        height: 8.4rem;
        margin: 0 auto .1rem;
    }
    .unit-body-bg{
        position: absolute;
        width: 4.5rem;
        display: block;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        margin: auto;
        opacity: .9;
    }

    .unit-body-equip-wrap{
        position: absolute;
        background-color: rgba(108,108,108,.3);
        width: 1rem;
        height: 1rem;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        margin: 0;
        overflow-x: hidden;
        overflow-y: auto;
        transition: .13s all;
    }
    .unit-body-equip{
        width: 100%;
    }
    .unit-body-weapon1{
        width: 2rem;
        height: 3.8rem;
        top: 3rem;
        left: 0;
        right: auto;
    }
    .unit-body-weapon2{
        width: 2rem;
        height: 3.8rem;
        top: 3rem;
        right: 0;
        left: auto;
    }
    .unit-body-accessory1{
        top: 0;
        left: 0;
        width: 2rem;
        height: 2.8rem;
        right: auto;
    }
    .unit-body-accessory2{
        top: 0;
        right: 0;
        width: 2rem;
        height: 2.8rem;
        left: auto;
    }
    .unit-body-helmet{
        width: 2rem;
        height: 1.8rem;
        top: 0;
        margin: 0 auto;
    }
    .unit-body-armor{
        width: 2rem;
        top: 2rem;
        height: 4.8rem;
        margin: 0 auto;
    }
    .unit-body-shoes{
        width: 6.3rem;
        height: 1.4rem;
        top: auto;
        bottom: 0;
        margin: 0 auto;
    }
    .unit-body-equip-wrap-expand{
        width: 90%;
        height: auto;
        top: auto;
        bottom: auto;
        right: 0;
        left: 0;
        margin: 0 auto;
        padding: .16rem;
        background-color: #131313;
        border: .04rem solid #fc7;
        /* border-radius: .12rem; */
        z-index: 44;
    }
    .unit-body-equip-wrap-expand .unit-body-equip{

    }
    .unit-body-op{

    }
    .unit-body-op .btn{
        padding: 0 .2rem;
        height: .55rem;
        line-height: .55rem;
        font-size: .3rem;
    }
    /* 弹窗-单位-背包 */
    .unit-bag-title{
        height: .3rem;
        line-height: .3rem;
        margin: .2rem 0;
        text-align: left;
        font-size: .28rem;
        padding-left: .1rem;
        border-left: .06rem solid #fff;
    }
    .unit-bag{
        padding-top: .02rem;
        background-color: rgba(54,34,1,.5);
    }
    .unit-bag-equip-wrap{

    }
    .unit-bag-equip-wrap .unit-bag-equip{

    }
    .unit-bag-equip-wrap .unit-bag-op{
        background-color: #131313;
        height: .8rem;
        line-height: .8rem;
    }
    .unit-bag-equip-wrap .unit-bag-op .btn{
        padding: 0 .2rem;
        height: .55rem;
        line-height: .55rem;
        font-size: .3rem;
    }
    /* 角色技能表 */
    /* <div class="unit-info-pop unit-skill-board" v-if="viewingUnitTab==3">
        <div class="skill-wrap">
            <Skill class="skill" v-for="skill of viewingUnit.btd.skillList" :key="skill.id" :skill="skill" :mode="1" @onTap="onTapSkill" />
        </div>
    </div> */
    .unit-skill-board{
        background-image: linear-gradient(to right, rgba(58,58,58,.5) 0%,rgba(110,113,115,.1) 40%,rgba(110,113,115,.1) 60%,rgba(58,58,58,.5) 100%);
    }
    .unit-skill-board .skill-wrap{
        padding-bottom: 2.2rem;
    }
    .unit-skill-board .skill-wrap .skill{

    }
</style>

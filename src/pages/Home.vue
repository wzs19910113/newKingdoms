<template>
    <div class="main">
        <!--作弊-->
        <!-- <nut-drag direction="y" :style="{right:'0px',top:'75px',zIndex:'200'}" v-if="DEBUG">
            <a class="btn touch-dom" @click="onTapCheat">cheat</a>
        </nut-drag> -->
        <!-- 主体 -->
        <div class="panel" v-if="state==0">
            <div class="panel-loading">加载中...</div>
        </div>
        <div class="panel" v-if="state==1">
            <!-- 顶部栏位 -->
            <div class="banner-wrap">
                <div class="day">
                    <b>第 {{game.day}} 天</b>
                </div>
                <div class="money-wrap">
                    <b class="money-preifx">金币</b>
                    &nbsp;
                    <b class="money" v-html="common.moneyFormat(calcTotalMoney())+' $'"></b>
                </div>
                <!-- 齿轮 -->
                <a class="btn btn-gear" v-if="map.type==1" @click.stop="onTapGear">系统</a>
            </div>
            <!-- 吊牌 -->
            <a class="brand" @click="onTapBrand()">{{map.name}}</a>
            <!-- 啤酒按钮 -->
            <a class="beer" @click="onTapBeer()">
                <div class="beer-title">以太酒馆</div>
                <img class="beer-icon" :src="require('../assets/icon-beer.png')" />
            </a>
            <!-- 队形板块 -->
            <div class="menu-wrap">
                <draggable class="unit-list-group" handle=".mover" :disabled="false" v-model="team" @end="onUnitDragEnd" animation="100">
                    <div class="unit-item" :class="((viewingUnit&&team[index]&&(team[index].id==viewingUnit.id))?'unit-item-cur':'')" v-for="index in [0,1,2,3]" :key="index">
                        <a class="unit" v-if="team[index]">
                            <Avatar class="unit-avatar" :unit="team[index]" @onTap="onTapUnit(team[index])" />
                            <a class="anchor mover" v-if="team.length>1">拖移</a>
                            <Bar1 class="unit-bar" @onTap="onTapUnit(team[index])" :suffix="team[index].btd.def[1]?`${team[index].btd.def[1]}`:''" :type="1" :crt="team[index].btd.hp[0]" :max="team[index].btd.hp[1]" />
                            <Bar1 class="unit-bar" @onTap="onTapUnit(team[index])" :suffix="team[index].btd.phy[1]?`${team[index].btd.phy[1]}`:''" :type="2" :crt="team[index].btd.eng[0]" :max="team[index].btd.eng[1]" />
                        </a>
                        <div class="unit unit-empty" v-else></div>
                    </div>
                </draggable>
            </div>
        </div>
        <!-- 背景 -->
        <div class="bg" v-if="state==1"></div>
        <!-- 单位浏览弹窗 -->
        <Pop v-if="showUnitPop&&selectingUnit" ref="pop-content" :title="`${viewingUnit.btd.name}的${[`面板`,`装备`,`技能`,][popUnitTab-1]}${popUnitTab==3?`（${viewingUnit.btd.skillList.length}）`:``}`" :arrowTitle="`${[`装备`,`技能`,`面板`,][popUnitTab-1]}`" :showCloseButton="true" @onTapClose="onTapClosePop" @onTapArrow="onTapArrowPop">
            <!-- 角色面板 -->
            <div class="unit-info-pop unit-board" v-if="popUnitTab==1">
                <Unit1 :unit="viewingUnit" :showTransferButton="team.length>1" @onTapTransferMoney="onTapTransferMoney" :mode="1" />
            </div>
            <!-- 角色装备表 -->
            <div class="unit-info-pop unit-equip-board" v-if="popUnitTab==2">
                <!-- 已着装备 -->
                <div class="unit-body">
                    <img class="unit-body-bg" :src="require(`../assets/outline-${viewingUnit.gd==1?'male':'female'}.png`)" />
                    <a class="unit-body-equip-wrap" :class="`${viewingUnitBodyEquipIndex==(index-1)?'unit-body-equip-wrap-expand':''} unit-body-${[`weapon1`,`weapon2`,`accessory1`,`accessory2`,`armor`,`helmet`,`shoes`,][index-1]}`" v-for="index in 7" :key="index" @click.stop="onTapViewingBodyEquip(index-1)">
                        <Equip class="unit-body-equip" :class="" v-if="viewingUnit.btd.equipList[index-1]" :equip="viewingUnit.btd.equipList[index-1]" :mode="viewingUnitBodyEquipIndex==(index-1)?1:2" />
                        <!-- 选中的已着装备操作栏，只有在队或同道才能显示 -->
                        <div class="unit-body-op" v-if="viewingUnitBodyEquipIndex==(index-1)&&viewingUnit.rel>=2">
                            <a class="btn" @click.stop="onTapAllEquipOff(viewingUnit)">全卸下</a>
                            <a class="btn" v-if="selling" @click.stop="onTapSellEquip(viewingUnit.btd.equipList[index-1])">售卖</a>
                            <a class="btn" @click.stop="onTapEquipOff(viewingUnit.btd.equipList[index-1],viewingUnit)">卸下</a>
                        </div>
                    </a>
                </div>
                <!-- 背包 -->
                <div class="unit-bag equip-wrap">
                    <div class="unit-bag-title">
                        <div class="bag-title">背包（{{viewingUnit.btd.bagList.length}}）：</div>
                        <!-- 背包顶部操作栏，只有在队或同道才能显示 -->
                        <div class="bag-op" v-if="viewingUnit.rel>=2">
                            <a class="btn btn-bag-title-sellAll" v-if="selling" @click="onTapSellBag(viewingUnit.btd.bagList)">全售卖</a>
                            <a class="btn btn-bag-title-moveAll" v-if="viewingUnit.btd.bagList.length>1" @click="onTapMoveBag(viewingUnit.btd.bagList)">全转移</a>
                        </div>
                    </div>
                    <EquipList ref="bag" :unit="selectingUnit" :viewingUnit="viewingUnit" :showSell="selling" :onTapSellEquip="onTapSellEquip" :onTapEquipOn="onTapEquipOn" :onTapMoveEquip="onTapMoveEquip" />
                </div>
            </div>
            <!-- 角色技能表 -->
            <div class="unit-info-pop unit-skill-board" v-if="popUnitTab==3">
                <draggable v-if="viewingUnit.btd.skillList.length>0" class="skill-list-group" handle=".mover" :disabled="false" v-model="viewingUnit.btd.skillList" @end="onSkillDragEnd" animation="100">
                    <div class="skill-wrap" v-for="skill of viewingUnit.btd.skillList" :key="skill.id">
                        <Skill class="skill" :skill="skill" :mode="1" @onTap="onTapSkill" />
                        <a class="anchor mover" v-if="viewingUnit.rel>=2&&viewingUnit.btd.skillList.length>1">拖<br/>移<br/>↕</a>
                    </div>
                </draggable>
                <div class="skill-empty" v-else>没有技能</div>
            </div>
        </Pop>
        <!-- 酒馆 -->
        <div class="pop-tarven" :class="showTarven?'pop-tarven-expand':''" v-if="state==1">

            <SwipeTabs class="tarven-tabs-wrap" :tabs="[{label:'商人酒保',},{label:'大厅',}]">
                <!-- 使用具名插槽填充每个页面的内容 -->
                <template #tab-0>
                    <div class="tarven-cot tarven-shop" v-if="viewingUnit&&bartender&&bartender.btd.bagList">
                        <EquipList v-show="bartender.btd.bagList.length>0" ref="shop" :unit="bartender" :viewingUnit="viewingUnit" :showBuy="true" :onTapBuyEquip="onTapBuyEquip" :onTapSwitchViewingUnit="team.length>1?onTapSwitchMember:null" :discount="5" :money="calcTotalMoney()" />
                        <div class="tarven-shop-empty" v-if="bartender.btd.bagList.length<=0">暂无商品</div>
                    </div>
                </template>
                <template #tab-1>
                    <div class="tarven-cot tarven-inmate">客人列表</div>
                </template>
            </SwipeTabs>

            <div class="tarven-bg"></div>
        </div>
        <!-- 金币转移遮罩 -->
        <Cover v-if="showMoneyTrasferCover" @onTap="onTapCover" tip="选取并转移金币给目标：">
            <div class="pop-money-transfer-wrap">
                <van-slider class="pop-money-transfer-slider" active-color="gold" v-model="transferringMoney" :step="100" :min="1" :max="viewingUnit.g" />
                <div class="pop-money-transfer-indicator" v-html="common.moneyFormat(transferringMoney)+' $'"></div>
                <a class="btn btn-money-transfer-all" @click.stop="onTapAllMoneyTransfer">满</a>
            </div>
        </Cover>
        <!-- 普通提示遮罩 -->
        <Cover v-if="coverTip" @onTap="onTapCover" :tip="coverTip"></Cover>
        <!-- 右上角系统菜单弹窗 -->
        <div class="pop-gear" v-if="showGearPop">
            <div class="pop-gear-bg"></div>
            <a class="btn btn-save" @click="onTapSave">存档</a>
            <a class="btn btn-guide" @click="onTapGuide">指引</a>
            <a class="btn btn-restart" @click="onTapRestart">退出</a>
        </div>
        <!-- alert -->
        <Toast ref="toast-alert" />
        <!-- confirm -->
        <Toast ref="toast-confirm" />
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
import SwipeTabs from '../components/SwipeTabs';
import Cover from '../components/Cover';
import EquipList from '../components/EquipList';
import Avatar from '../components/Avatar';
import draggable from 'vuedraggable';
import { cl, query, r, exptr, setInRange, loadImages, shuffle, bulbsort, bulbsort2, getParentNode, cloneObj, numFormat, avg, percent, calcDistance, getMatchList, getSubMatchList, removeFromList, removeFromNumberList, arrContains, } from '../tools/utils';
import * as common from '../tools/common';
import * as ai from '../tools/ai';
import Vue from 'vue';
import { Slider } from 'vant-green';
import 'vant-green/lib/index.css';
Vue.use(Slider);

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
            map: {},

            bartender: null, // 商人酒保单位

            popUnitTab: 1,
            viewingUnit: null, // 浏览者，只能是团队中的人
            selectingUnit: null, // 被浏览者，可以是团队中的人，也可以是NPC
            viewingUnitBodyEquipIndex: -1, // 单位弹窗-已着放大的装备 index

            /* 状态标识 */
            selling: false, // 售卖状态标识
            movingEquipList: [], // 正在转移的装备数组，用作状态标识
            transferringMoney: 0, // 正在转移的金币数

            showUnitPop: false, // 显示团队单位浏览弹窗
            showGearPop: false, // 显示系统弹窗
            showMoneyTrasferCover: false, // 显示金币转移遮罩
            showTarven: false, // 显示酒馆弹窗

            coverTip: '', // 阴影遮罩文本
            confirmTip: '', // 确认弹窗的文本

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
                loadImages(ASSETS.image_urls).then(images=>{
                    this.init();
                });
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
            // this._alert(`成功加载 ${images.length} 张图片`,3);
            this.state = 0;
            this.$nextTick(_=>{
                this.map = getMatchList(CONFIG.mapConfig,[['id',this.game.currentMapID]])[0];
                this.asynTeam();
                this.viewingUnit = this.team[0];
                // 商人酒保
                this.bartender = getMatchList(this.game.allUnits,[['id',1]])[0];
                this.bartender.btd = common.getUnitBtd(this.bartender,this.game);
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
        asynTeam(){ // 同步 team 数据到 home，并重新计算每个单位的 btd
            let team = [];
            let viewingUnitId, selectingUnitId;
            if(this.viewingUnit&&this.viewingUnit.id){
                viewingUnitId = this.viewingUnit.id;
            }
            if(this.selectingUnit&&this.selectingUnit.id){
                selectingUnitId = this.selectingUnit.id;
            }
            for(let unit of this.game.allUnits){
                if(unit.tms){
                    let btd = common.getUnitBtd(unit,this.game);
                    let cUnit = cloneObj(unit);
                    cUnit.btd = btd;
                    team.push(cUnit);
                }
            }
            this.team = bulbsort(team,'tms',0);
            // 同步“单位浏览弹窗”中的单位数据
            if(viewingUnitId){
                this.viewingUnit = getMatchList(this.team,[['id',viewingUnitId]])[0];
            }
            if(selectingUnitId){
                this.selectingUnit = getMatchList(this.team,[['id',selectingUnitId]])[0];
            }
            // 重置 EquipList 数据
            let bagDom = this.$refs[`bag`];
            if(bagDom){
                bagDom.init();
            }
        },
        asynBartender(){ // 同步酒保数据
            this.bartender = null;
            this.$nextTick(_=>{
                this.bartender = getMatchList(this.game.allUnits,[['id',1]])[0];
                this.bartender.btd = common.getUnitBtd(this.bartender,this.game);
            });
        },
        resetViewingUnitPopData(){ // 重置单位预览弹窗数据
            this.showUnitPop = false;
            this.viewingUnitBodyEquipIndex = -1; // 单位弹窗-放大的装备 index
        },
        setViewingUnit(unit,showUnitPop){ // 切换浏览者
            // 记录shop中原有的“选择中的装备”
            let shopDom = this.$refs[`shop`];
            let oldSelectingEquip;
            if(shopDom&&this.showTarven){
                oldSelectingEquip = shopDom.selectingEquip;
            }

            this.viewingUnit = null;
            this.selectingUnit = null;
            this.viewingUnitBodyEquipIndex = -1;
            this.onTapCover();

            this.$nextTick(_=>{
                this.viewingUnit = unit;
                this.selectingUnit = unit;
                if(showUnitPop){
                    this.showUnitPop = true;
                }
                if(oldSelectingEquip){ // 处于酒馆中，并且shop中存在“原有的选择中的装备”，则选中这个装备
                    this.$nextTick(_=>{
                        shopDom = this.$refs[`shop`];
                        if(shopDom){
                            shopDom.setSelectingEquip(oldSelectingEquip);
                        }
                    });
                }
            });
        },

        equipOn(equip,unit,seq){ // 装上装备
            let type = equip.t, slotIndex;
            if(type==1){ // 手
                slotIndex = seq-1;
            }
            else if(type==4){ // 首饰
                slotIndex = seq+1;
            }
            else{ // 头、身体、脚
                slotIndex = [0,0,5,4,0,6,][type];
            }
            let oUnit = getMatchList(this.game.allUnits,[['id',unit.id]])[0];
            let oldEquipId = oUnit.es[slotIndex];
            if(oldEquipId>0){ // 如果原来的槽位上有其他装备，则把这个装备放入背包
                oUnit.b.push(oUnit.es[slotIndex]);
            }
            oUnit.es[slotIndex] = equip.id;
            oUnit.b = removeFromNumberList(equip.id,oUnit.b);
            this.asynTeam();
        },
        equipOff(equip,unit){ // 卸下装备
            let oUnit = getMatchList(this.game.allUnits,[['id',unit.id]])[0];
            let oldSlot;//装备原先所在 es 中的槽位
            for(let i=0;i<oUnit.es.length;i++){
                if(oUnit.es[i]==equip.id){
                    oldSlot = i;
                    break;
                }
            }
            oUnit.es[oldSlot] = 0;
            oUnit.b.push(equip.id);
            this.asynTeam(unit);
        },
        moveEquipList(toUnit,fromUnit,equipList){ // 转移装备数组
            let oTo = getMatchList(this.game.allUnits,[['id',toUnit.id]])[0];
            let oFrom = getMatchList(this.game.allUnits,[['id',fromUnit.id]])[0];
            for(let equip of equipList){
                oFrom.b = removeFromNumberList(equip.id,oFrom.b);
                oTo.b.push(equip.id);
            }
        },

        calcTotalMoney(){ // 计算总金币数
            let res = 0;
            for(let unit of this.team){
                res += unit.g;
            }
            return res;
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
        },
        onSkillDragEnd(e){ // 当技能拖拽结束
            let skillList = this.viewingUnit.btd.skillList;
            for(let i=0;i<skillList.length;i++){
                let skill = skillList[i];
                let oSkill = getMatchList(this.game.allSkills,[['id',skill.id]])[0];
                if(oSkill){
                    oSkill.o = i+1;
                }
            }
        },

        onTapUnit(unit){ // 点击【单位】
            if(this.viewingUnit&&this.movingEquipList.length>0){ // 如果正在转移装备
                if(unit.id!=this.viewingUnit.id){ // 点击的不是本人
                    this.moveEquipList(unit,this.viewingUnit,this.movingEquipList);
                    this.movingEquipList = [];
                    this.coverTip = ``;
                    this.asynTeam();
                }
            }
            else if(this.showMoneyTrasferCover){ // 如果正在转移金币
                if(this.transferringMoney==0){
                    this._alert(`请先选择金币数量`);
                }
                else if(this.viewingUnit.id==unit.id){

                }
                else{
                    let oFrom = getMatchList(this.game.allUnits,[['id',this.viewingUnit.id]])[0];
                    let oTo = getMatchList(this.game.allUnits,[['id',unit.id]])[0];
                    oTo.g += this.transferringMoney;
                    oFrom.g -= this.transferringMoney;
                    this.showMoneyTrasferCover = false;
                    this.transferringMoney = 0;
                    this.asynTeam();
                }
            }
            else{ // 普通点击
                this.setViewingUnit(unit,1);
            }
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
            this._alert(`给予目标：${buff.name}（强度${level}）- ${buff.desc}`,5);
        },
        onTapBrand(){ // 点击【标牌】
            this.showTarven = false;
        },
        onTapBeer(){ // 点击【啤酒】
            this.showTarven = !this.showTarven;
            this.showUnitPop = false;
        },
        onTapSwitchMember(){ // 点击【切换队员】
            let index;
            if(this.viewingUnit&&this.viewingUnit.id){
                for(let i=0;i<this.team.length;i++){
                    if(this.team[i].id==this.viewingUnit.id){
                        index = i;
                    }
                }
            }
            index++;
            if(index>this.team.length-1){
                index = 0;
            }
            this.setViewingUnit(this.team[index]);
        },

        onTapTransferMoney(){ // 点击【转移金币】
            if(this.viewingUnit.g<1||this.team.length<2){
                this._alert(`无法转移`);
            }
            else{
                this.showMoneyTrasferCover = true;
                this.transferringMoney = 1;
            }
        },
        onTapArrowPop(){ // 点击【弹窗-箭头】
            this.popUnitTab = [2,3,1,][this.popUnitTab-1];
        },
        onTapViewingBodyEquip(equipIndex){ // 点击【弹窗-单位-已着装备】
            let equip = this.viewingUnit.btd.equipList[equipIndex];
            if(equip&&equip.id){
                this.viewingUnitBodyEquipIndex = (this.viewingUnitBodyEquipIndex!=-1)?-1:equipIndex;
                // 滚动条置顶
                let pcDom = this.$refs[`pop-content`].$refs[`pop`];
                if(pcDom){
                    pcDom.scroll({
                        top: 0,
                        behavior: 'smooth',
                    });
                }
            }
            else{
                this.viewingUnitBodyEquipIndex = -1;
            }
        },
        onTapAllMoneyTransfer(){ // 点击【弹窗-金币转移-全部】
            this.transferringMoney = this.viewingUnit.g;
        },

        onTapEquipOff(equip,unit){ // 点击【卸下装备】
            if(this.viewingUnitBodyEquipIndex>=0){
                this.viewingUnitBodyEquipIndex = -1;
            }
            this.equipOff(equip,unit);
        },
        onTapAllEquipOff(unit){ // 点击【全卸下】
            let equipList = unit.es;
            if(this.viewingUnitBodyEquipIndex>=0){
                this.viewingUnitBodyEquipIndex = -1;
            }
            for(let equipId of equipList){
                let equip = getMatchList(this.game.allEquips,[['id',equipId]])[0];
                if(equip){
                    this.equipOff(equip,unit);
                }
            }
        },
        onTapEquipOn(equip,unit,seq){ // 点击【装上装备】
            this.equipOn(equip,unit,seq);
        },
        onTapMoveEquip(equip){ // 点击【转移装备】
            this.movingEquipList = [equip];
            this.coverTip = `请选择转移目标：`;
        },
        onTapMoveBag(equipList){ // 点击【全转移】
            this.movingEquipList = equipList;
            this.coverTip = `共 ${equipList.length} 件装备，请选择转移目标：`;
        },
        onTapSellEquip(equip){ // 点击【售卖装备】
            console.log(`售卖装备`,equip.n);
        },
        onTapSellBag(equipList){ // 点击【全售卖】

        },
        onTapBuyEquip(equip,price,seller,buyer){ // 点击【购买装备】
            let money = buyer.g;
            if(money>=price){
                let oBuyer = getMatchList(this.game.allUnits,[['id',buyer.id]])[0];
                let oSeller = getMatchList(this.game.allUnits,[['id',seller.id]])[0];
                oSeller.b = removeFromNumberList(equip.id,oSeller.b);
                oBuyer.b.push(equip.id);
                oBuyer.g -= price;
                oSeller.g += price;
                this.asynTeam();
                this.asynBartender();
                this._alert(`${equip.n} 已进入 ${buyer.nm} 的背包中`,5);
            }
            else{
                this._alert(`${buyer.nm} 的金币不足`);
            }
            // console.log(`点击【购买装备】`,equip,price,seller,buyer);
        },
        onTapClosePop(){ // 点击【弹窗-关闭】
            this.resetViewingUnitPopData();
        },

        onTapGear(){ // 点击【齿轮】
            this.showGearPop = !this.showGearPop;
        },
        onTapSave(){ // 点击【齿轮-存档】
            this.save(1);
        },
        onTapGuide(){ // 点击【齿轮-指引】

        },
        onTapRestart(){ // 点击【齿轮-回到主界面】
            this.$router.push('/');
        },
        onTapCover(){ // 点击【遮罩层】
            this.coverTip = ``;
            this.movingEquipList = [];
            this.transferringMoney = 0;
            this.showMoneyTrasferCover = false;
        },

        _alert(text,time){ // 显示提示
            this.$refs['toast-alert'].trigger(text,time);
        },
        _confirm(confirmTip,onTapConfirm){ // 显示确认文本
            this.$refs['toast-confirm'].showConfirm({ confirmTip, onTapConfirm, });
        },

        onTapCheat(){ // 点击【作弊】按钮

        },
    },
    components:{
        Bar1,
        Bar2,
        Bar3,
        Equip,
        Skill,
        Toast,
        SwipeTabs,
        EquipList,
        Unit1,
        Avatar,
        draggable,
        Pop,
        Cover,
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    @import '../style/home/main.css';
    @import '../style/home/banner.css';
    @import '../style/home/tarven.css';
    @import '../style/home/team.css';
    @import '../style/home/pop.css';
    @import '../style/home/pop-board.css';
    @import '../style/home/pop-equip.css';
    @import '../style/home/pop-skill.css';
</style>

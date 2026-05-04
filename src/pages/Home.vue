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
                            <div class="icon-arrow-down" v-if="viewingUnit&&!coverTip&&!showMoneyTrasferCover&&team[index]&&(team[index].id==viewingUnit.id)"></div>
                        </a>
                        <div class="unit unit-empty" v-else></div>
                    </div>
                </draggable>
            </div>
        </div>
        <!-- 背景 -->
        <div class="bg" v-if="state==1"></div>
        <!-- 单位浏览弹窗 -->
        <Pop class="pop-unit" v-if="showUnitPop&&selectingUnit" ref="pop-content" :title="`${selectingUnit.btd.name}的${[`面板`,`装备`,`技能`,][popUnitTab-1]}${popUnitTab==3?`（${selectingUnit.btd.skillList.length}）`:``}`" :arrowTitle="`${[`装备`,`技能`,`面板`,][popUnitTab-1]}`" :showCloseButton="true" @onTapClose="onTapClosePop" @onTapArrow="onTapArrowPop">
            <!-- 角色面板 -->
            <div class="unit-info-pop unit-board" v-if="popUnitTab==1">
                <Unit1 :unit="selectingUnit" :showTransferButton="team.length>1&&selectingUnit.rel==3" @onTapTransferMoney="onTapTransferMoney" :mode="1" />
                <!-- 角色隶属操作栏 -->
                <div class="unit-board option-wrap">
                    <a class="btn" v-if="selectingUnit.rel<2&&selectingUnit.id!=1" @click="onTapHire(selectingUnit)">
                        雇佣&nbsp;&nbsp;<b class="money" v-html="`${common.moneyFormat(selectingUnit.btd.price)} $`"></b>
                    </a>
                    <a class="btn" v-if="selectingUnit.rel==2" @click="onTapJoinTeam(selectingUnit)">入队</a>
                    <a class="btn" v-if="selectingUnit.rel==3&&selectingUnit.id!=101" @click="onTapLeavTeam(selectingUnit)">离队</a>
                </div>
            </div>
            <!-- 角色装备表 -->
            <div class="unit-info-pop unit-equip-board" v-if="popUnitTab==2">
                <!-- 已着装备 -->
                <div class="unit-body">
                    <img class="unit-body-bg" :src="require(`../assets/outline-${selectingUnit.gd==1?'male':'female'}.png`)" />
                    <a class="unit-body-equip-wrap" :class="`${selectingUnitBodyEquipIndex==(index-1)?'unit-body-equip-wrap-expand':''} unit-body-${[`weapon1`,`weapon2`,`accessory1`,`accessory2`,`armor`,`helmet`,`shoes`,][index-1]}`" v-for="index in 7" :key="index" @click.stop="onTapViewingBodyEquip(index-1)">
                        <Equip class="unit-body-equip" :class="" v-if="selectingUnit.btd.equipList[index-1]" :equip="selectingUnit.btd.equipList[index-1]" :mode="selectingUnitBodyEquipIndex==(index-1)?1:2" />
                        <!-- 选中的已着装备操作栏，只有在队或同道才能显示 -->
                        <div class="unit-body-op" v-if="selectingUnitBodyEquipIndex==(index-1)&&selectingUnit.rel==3">
                            <a class="btn" @click.stop="onTapAllEquipOff(selectingUnit)">全卸下</a>
                            <!-- <a class="btn" v-if="selling" @click.stop="onTapSellEquip(selectingUnit.btd.equipList[index-1])">
                                售卖
                            </a> -->
                            <a class="btn" @click.stop="onTapEquipOff(selectingUnit.btd.equipList[index-1],selectingUnit)">卸下</a>
                        </div>
                    </a>
                </div>
                <!-- 背包 -->
                <div class="unit-bag equip-wrap">
                    <div class="unit-bag-title">
                        <div class="bag-title">背包（{{selectingUnit.btd.bagList.length}}）：</div>
                        <!-- 背包顶部操作栏，只有在队或同道才能显示 -->
                        <div class="bag-op" v-if="selectingUnit.rel==3">
                            <a class="btn btn-bag-title-sellAll" v-if="selling&&selectingUnit.btd.bagList.length>0" @click="onTapSellBag(selectingUnit.btd.bagList,selectingUnit)">
                                全售卖 <b class="money" v-html="`${common.moneyFormat(common.getSellAllPrice(selectingUnit))} $`"></b>
                            </a>
                            <a class="btn btn-bag-title-moveAll" v-if="selectingUnit.btd.bagList.length>1" @click="onTapMoveBag(selectingUnit.btd.bagList)">全转移</a>
                        </div>
                    </div>
                    <EquipList ref="bag" :unit="selectingUnit" :viewingUnit="viewingUnit" :showSell="selling" :onTapSellEquip="onTapSellEquip" :onTapEquipOn="onTapEquipOn" :onTapMoveEquip="onTapMoveEquip" />
                </div>
            </div>
            <!-- 角色技能表 -->
            <div class="unit-info-pop unit-skill-board" v-if="popUnitTab==3">
                <div class="skill-x-wrap" v-if="selectingUnit.id==me.id&&(game.x>0||game.xp>0)">
                    <Bar1 class="skill-x" title="灵感指数" :mode="2" :type="4" :crt="game.x" :max="common.calcSkillXDemand(game.xl)" @onTap="onTapXPointBar" />
                    <a class="btn btn-skill-x" :class="`${game.xp>0?'btn-skill-x-active':''}`" @click="onTapXPoint">{{game.xp}}</a>
                </div>
                <div class="skill-copy-wrap" v-if="selectingUnit.id==me.id&&showSkillCopy">
                    <div class="title">选择要复制的技能（{{skillCopyList.length}}）：</div>
                    <Skill class="skill" v-for="skill of skillCopyList" :key="skill.id" :skill="skill" :isOption="true" :mode="1" @onTap="onTapCopySkill" />
                </div>
                <draggable v-if="selectingUnit.btd.skillList.length>0" class="skill-list-group" handle=".mover" :disabled="false" v-model="selectingUnit.btd.skillList" @end="onSkillDragEnd" animation="100">
                    <div class="skill-wrap" v-for="skill of selectingUnit.btd.skillList" :key="skill.id">
                        <Skill class="skill" :skill="skill" :mode="1" @onTap="onTapSkill" />
                        <a class="anchor mover" v-if="selectingUnit.rel==3&&selectingUnit.btd.skillList.length>1">拖<br/>移<br/>↕</a>
                    </div>
                </draggable>
                <div class="skill-empty" v-else>没有技能</div>
            </div>
        </Pop>
        <!-- 酒馆 -->
        <div class="pop-tarven" :class="showTarven?'pop-tarven-expand':''" v-if="state==1">
            <SwipeTabs class="tarven-tabs-wrap" ref="tarven-wrap" :tabs="[{label:`商人酒保·${(bartender||{}).nm}`,},{label:`大厅（${inmateList.length}）`},{label:`悬赏榜`,}]">
                <!-- 商人酒保 -->
                <template #tab-0>
                    <div class="tarven-cot tarven-shop" v-if="viewingUnit&&bartender">
                        <div class="bartender">
                            <a class="btn" @click="onTapChatButton">聊天</a>
                            <a class="btn" @click="onTapSellButton">当卖</a>
                            <a class="btn" @click="onTapRestButton">住宿</a>
                        </div>
                        <van-divider class="bartender-divider">装备交易（{{calcShopRefreshRemainDays()}}天后更新）</van-divider>
                        <EquipList v-if="bartender.btd.bagList&&bartender.btd.bagList.length>0" ref="shop" :unit="bartender" :viewingUnit="viewingUnit" :showBuy="true" :onTapBuyEquip="onTapBuyEquip" :onTapSwitchViewingUnit="team.length>1?onTapSwitchMember:null" :discount="3" />
                        <div class="tarven-shop-empty" v-if="bartender.btd.bagList.length<=0">暂无商品</div>
                    </div>
                </template>
                <!-- 大厅 -->
                <template #tab-1>
                    <div class="tarven-cot tarven-inmate" v-if="inmateList&&inmateList.length>0">
                        <UnitList :unitList="inmateList" :onTapUnit="onTapInmate" />
                    </div>
                </template>
                <!-- 悬赏榜 -->
                <template #tab-2>
                    <div class="wanted-list-wrap" v-if="game.wantedList&&game.wantedList.length>0">
                        {{game.wantedList}}
                    </div>
                </template>
            </SwipeTabs>
            <div class="tarven-bg"></div>
        </div>
        <!-- 金币转移遮罩 -->
        <Cover v-if="showMoneyTrasferCover" @onTap="onTapCover" tip="选取并转移金币给目标：">
            <div class="pop-money-transfer-wrap">
                <van-slider class="pop-money-transfer-slider" active-color="gold" v-model="transferringMoney" :step="100" :min="1" :max="selectingUnit.g" />
                <div class="pop-money-transfer-indicator" v-html="common.moneyFormat(transferringMoney)+' $'"></div>
                <a class="btn btn-money-transfer-all" @click.stop="onTapAllMoneyTransfer">满</a>
            </div>
        </Cover>
        <!-- 普通提示遮罩 -->
        <Cover v-if="coverTip" @onTap="onTapCover" :tip="coverTip"></Cover>
        <!-- 右上角系统菜单弹窗 -->
        <div class="pop-gear" v-show="showGearPop">
            <div class="pop-gear-bg"></div>
            <a class="btn btn-save" @click="onTapSave">存档</a>
            <a class="btn btn-guide" @click="onTapGuide">指引</a>
            <a class="btn btn-restart" @click="onTapRestart">退出</a>
            <a class="btn btn-cheat" v-if="DEBUG" @click="onTapCheat">作弊</a>
            <!-- <a class="btn" v-if="DEBUG">{{selectingUnit?'---S':'----'}}</a>
            <a class="btn" v-if="DEBUG">{{showUnitPop?'---P':'----'}}</a> -->
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
import UnitList from '../components/UnitList';
import Avatar from '../components/Avatar';
import draggable from 'vuedraggable';
import { cl, query, r, exptr, setInRange, loadImages, shuffle, bulbsort, bulbsort2, getParentNode, cloneObj, numFormat, avg, percent, calcDistance, getMatchList, getSubMatchList, removeFromList, removeFromNumberList, arrContains, } from '../tools/utils';
import * as common from '../tools/common';
import * as ai from '../tools/ai';
import Vue from 'vue';
import { Slider } from 'vant-green';
import { Divider } from 'vant-green';
import 'vant-green/lib/index.css';
Vue.use(Slider).use(Divider);

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
            me: null,

            bartender: null, // 商人酒保单位
            inmateList: [], // 酒馆大厅单位数组

            popUnitTab: 1,
            viewingUnit: null, // 浏览者，只能是团队中的人
            selectingUnit: null, // 被浏览者，可以是团队中的人，也可以是NPC
            selectingUnitBodyEquipIndex: -1, // 单位弹窗-已着放大的装备 index

            /* 状态标识 */
            selling: false, // 售卖状态标识
            movingEquipList: [], // 正在转移的装备数组，用作状态标识
            transferringMoney: 0, // 正在转移的金币数

            showUnitPop: false, // 显示团队单位浏览弹窗
            showGearPop: false, // 显示系统弹窗
            showMoneyTrasferCover: false, // 显示金币转移遮罩
            showTarven: false, // 显示酒馆弹窗
            showSkillCopy: false, // 显示技能复制弹窗
            skillCopyList: [], // 可复制的技能数组

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
                this.asynBartender();
                this.asynInmates();
                this.viewingUnit = this.me;
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
                if(unit.rel==3){
                    let btd = common.getUnitBtd(unit,this.game);
                    let cUnit = cloneObj(unit);
                    cUnit.btd = btd;
                    team.push(cUnit);
                }
            }
            this.team = bulbsort(team,'tms',0);
            // 设置我
            this.me = getMatchList(this.game.allUnits,[['id',101]])[0];
            this.me.btd = common.getUnitBtd(this.me,this.game);
            // 同步“单位浏览弹窗”中的单位数据
            if(viewingUnitId){
                this.viewingUnit = getMatchList(this.team,[['id',viewingUnitId]])[0];
            }
            if(selectingUnitId){
                this.selectingUnit = getMatchList(this.game.allUnits,[['id',selectingUnitId]])[0];
                this.selectingUnit.btd = common.getUnitBtd(this.selectingUnit,this.game);
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
        asynInmates(){ // 同步酒馆客人数据
            this.inmateList = [];
            this.$nextTick(_=>{
                let inmateList = [];
                for(let unit of this.game.allUnits){
                    if(unit.rel<3){
                        let newInmate = cloneObj(unit);
                        newInmate.btd = common.getUnitBtd(newInmate,this.game);
                        inmateList.push(newInmate);
                    }
                }
                this.inmateList = inmateList;
            });
        },
        resetViewingUnitPopData(){ // 重置单位预览弹窗数据
            this.showUnitPop = false;
            this.selectingUnit = null;
            this.selectingUnitBodyEquipIndex = -1; // 单位弹窗-放大的装备 index
        },
        setViewingUnit(unit,showUnitPop,callback){ // 切换浏览者
            // 记录shop中原有的“选择中的装备”
            let shopDom = this.$refs[`shop`];
            let oldSelectingEquip;
            if(shopDom&&this.showTarven){
                oldSelectingEquip = shopDom.selectingEquip;
            }
            // 记录 tab-content 原有的滚动条位置
            let domList = this.$refs[`tarven-wrap`].$refs[`contentRef`];
            let targetY = 0;
            if(domList){
                targetY = domList.scrollTop;
            }

            this.viewingUnit = null;
            this.selectingUnit = null;
            this.selectingUnitBodyEquipIndex = -1;
            this.onTapCover();

            this.$nextTick(_=>{
                this.viewingUnit = unit;
                this.selectingUnit = unit;
                if(showUnitPop){
                    this.showUnitPop = true;
                }
                callback&&callback();
                if(oldSelectingEquip){ // 处于酒馆中，并且shop中存在“原有的选择中的装备”，则选中这个装备
                    this.$nextTick(_=>{
                        shopDom = this.$refs[`shop`];
                        if(shopDom){
                            shopDom.setSelectingEquip(oldSelectingEquip);
                        }
                        // 设置 tab-content 的滚动条到原有位置
                        this.$nextTick(_=>{
                            domList = this.$refs[`tarven-wrap`].$refs[`contentRef`];
                            if(domList){
                                domList.scrollTop = targetY;
                            }
                        });
                    });
                }
            });
        },
        dayPass(){ // 经历一天
            this.game.day++;
            // 悬赏令状态更新
            for(let wanted of this.game.wantedList){
                if(this.game.day>=wanted.e&&wanted.s!=3){
                    wanted.s = 2;
                }
            }
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
            this.asynInmates();
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
            this.asynTeam();
            this.asynInmates();
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
        calcShopRefreshRemainDays(){ // 计算商品更新剩余天数
            let res;
            res = CONFIG.shopRefreshInterval-this.game.day%CONFIG.shopRefreshInterval;
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
            let skillList = this.selectingUnit.btd.skillList;
            for(let i=0;i<skillList.length;i++){
                let skill = skillList[i];
                let oSkill = getMatchList(this.game.allSkills,[['id',skill.id]])[0];
                if(oSkill){
                    oSkill.o = i+1;
                }
            }
        },

        onTapUnit(unit){ // 点击【单位】
            if(this.selectingUnit&&this.movingEquipList.length>0){ // 如果正在转移装备
                if(unit.id!=this.selectingUnit.id){ // 点击的不是本人
                    this.moveEquipList(unit,this.selectingUnit,this.movingEquipList);
                    this.movingEquipList = [];
                    this.coverTip = ``;
                    this.asynTeam();
                    this.asynInmates();
                }
            }
            else if(this.showMoneyTrasferCover){ // 如果正在转移金币
                if(this.transferringMoney==0){
                    this._alert(`请先选择金币数量`);
                }
                else if(this.selectingUnit.id==unit.id){

                }
                else{
                    let oFrom = getMatchList(this.game.allUnits,[['id',this.selectingUnit.id]])[0];
                    let oTo = getMatchList(this.game.allUnits,[['id',unit.id]])[0];
                    oTo.g += this.transferringMoney;
                    oFrom.g -= this.transferringMoney;
                    this.showMoneyTrasferCover = false;
                    this.transferringMoney = 0;
                    this.asynTeam();
                    this.asynInmates();
                }
            }
            else{ // 普通点击
                this.setViewingUnit(unit,1);
            }
        },
        onTapInmate(unit){ // 点击【酒馆客人】
            let btd = common.getUnitBtd(unit,this.game);
            this.selectingUnit = unit;
            this.selectingUnit.btd = btd;
            this.showUnitPop = true;
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
            this.selling = this.showTarven;
            this.showUnitPop = false;
        },
        onTapSwitchMember(equip){ // 点击【切换队员】
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
            if(this.selectingUnit.g<1||this.team.length<2){
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
            let equip = this.selectingUnit.btd.equipList[equipIndex];
            if(equip&&equip.id){
                this.selectingUnitBodyEquipIndex = (this.selectingUnitBodyEquipIndex!=-1)?-1:equipIndex;
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
                this.selectingUnitBodyEquipIndex = -1;
            }
        },
        onTapAllMoneyTransfer(){ // 点击【弹窗-金币转移-全部】
            this.transferringMoney = this.selectingUnit.g;
        },

        onTapEquipOff(equip,unit){ // 点击【卸下装备】
            if(this.selectingUnitBodyEquipIndex>=0){
                this.selectingUnitBodyEquipIndex = -1;
            }
            this.equipOff(equip,unit);
        },
        onTapAllEquipOff(unit){ // 点击【全卸下】
            let equipList = unit.es;
            if(this.selectingUnitBodyEquipIndex>=0){
                this.selectingUnitBodyEquipIndex = -1;
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
        onTapSellEquip(equip,seller){ // 点击【售卖装备】
            let oSeller = getMatchList(this.game.allUnits,[['id',seller.id]])[0];
            let buyer = this.bartender;
            let price = common.getSellPrice(equip);
            this.moveEquipList(buyer,seller,[equip]);
            oSeller.g += price;
            this.asynTeam();
            this.asynBartender();
            this.asynInmates();
            this._alert(`已售卖 ${equip.n}`);
        },
        onTapSellBag(equipList,seller){ // 点击【全售卖】
            this._confirm(`确定要售卖全部（共 ${equipList.length} 个）装备吗？`,_=>{
                let oSeller = getMatchList(this.game.allUnits,[['id',seller.id]])[0];
                let buyer = this.bartender;
                let price = common.getSellAllPrice(seller);
                this.moveEquipList(buyer,seller,equipList);
                oSeller.g += price;
                this.asynTeam();
                this.asynBartender();
                this.asynInmates();
                this._alert(`已售卖 ${equipList.length} 个装备`);
            });
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
        onTapHire(unit){ // 点击【雇佣】
            let employer = getMatchList(this.game.allUnits,[['id',this.viewingUnit.id]])[0];
            let oUnit = getMatchList(this.game.allUnits,[['id',unit.id]])[0];
            let price = unit.btd.price;
            if(employer.g>=price){
                oUnit.rel = 2;
                employer.g -= price;
                this.asynTeam();
                this.asynInmates();
                this._alert(`欢迎新队友：${oUnit.nm} ！`,5);
            }
            else{
                this._alert(`${employer.nm} 的金币不足`);
            }
        },
        onTapJoinTeam(unit){ // 点击【入队】
            let oUnit = getMatchList(this.game.allUnits,[['id',unit.id]])[0];
            if(this.team.length<4){
                oUnit.rel = 3;
                oUnit.tms = 99;
                this.showUnitPop = false;
                this.asynTeam();
                this.asynInmates();
            }
            else{
                this._alert(`队伍人数已满`);
            }
        },
        onTapLeavTeam(unit){ // 点击【离队】
            let oUnit = getMatchList(this.game.allUnits,[['id',unit.id]])[0];
            oUnit.rel = 2;
            if(this.viewingUnit.id==unit.id){
                this.showUnitPop = false;
                this.viewingUnit = this.me;
            }
            this._alert(`${unit.nm} 已回到酒馆`,5);
            this.asynTeam();
            this.asynInmates();
        },
        onTapChatButton(){ // 点击【聊天】
            this.coverTip = `酒保：`+CONFIG.bartenderChats[r(0,CONFIG.bartenderChats.length-1)];
        },
        onTapRestButton(){ // 点击【住宿】
            this._confirm(`是否消耗 1 天的时间休息，完全恢复生命和精力？`,_=>{
                this.dayPass();
                for(let unit of this.game.allUnits){
                    let btd = common.getUnitBtd(unit,this.game);
                    unit.st[0] = btd.hp[1];
                    unit.st[1] = btd.eng[1];
                }
                this.asynTeam();
                this.asynBartender();
                this.asynInmates();
                this._alert(`所有人状态恢复`);
            });
        },
        onTapSellButton(){ // 点击【当卖】
            this.showUnitPop = true;
            let viewingUnit = this.viewingUnit||this.me;
            this.setViewingUnit(viewingUnit,true,_=>{
                this.popUnitTab = 2;
            });
        },
        onTapXPointBar(){ // 点击【灵感进度条】
            if(this.game.xp<=0){
                this._alert(`每次战斗后积累，槽满后可复制队友的一个技能`,5);
            }
            else{
                this.onTapXPoint();
            }
        },
        onTapXPoint(){ // 点击【灵感进度数字】
            let skillCopyList = [];
            if(this.team.length<2){
                this._alert(`没有队友`);
                return;
            }
            if(this.game.xp>0){
                for(let unit of this.team){
                    if(unit.id!=this.me.id){
                        // 从所有队友技能中筛选“我未拥有的技能”
                        let skillList = unit.btd.skillList;
                        let mySkillList = this.me.btd.skillList;
                        for(let skill of skillList){
                            let mySkill = getMatchList(mySkillList,[['id',skill.id]])[0];
                            if(!mySkill){ // 若我已有的技能数组中没有这个技能，则放入 copylist
                                skillCopyList.push(skill);
                            }
                        }
                    }
                }
                this.skillCopyList = cloneObj(skillCopyList);
                this.showSkillCopy = !this.showSkillCopy;
            }
        },
        onTapCopySkill({flag,data,}){ // 点击【复制技能】
            let skill = data;
            if(flag!=1){
                return;
            }
            this._confirm(`确定要复制技能 “${skill.n}” 吗？`,_=>{
                if(this.game.xp>0){
                    let oMe = getMatchList(this.game.allUnits,[['id',this.me.id]])[0];
                    oMe.ss.push(skill.id);
                    this.game.xp -= 1;
                    this.asynTeam();
                    this.asynInmates();
                    if(this.game.xp<=0){
                        this.showSkillCopy = false;
                    }
                    else{
                        this.onTapXPoint();
                        this.$nextTick(_=>{
                            this.onTapXPoint();
                        })
                    }
                    this._alert(`成功学会技能 “${skill.n}”`);
                }
                else{
                    this._alert(`灵感点数不够`);
                }
            });
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
            let me = this.game.allUnits[1];
            me.g += 100000;
            common.skillXIncrease(55000,this.game);
            this.asynTeam();
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
        UnitList,
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

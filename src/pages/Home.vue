<template>
    <div class="main">
        <!--作弊-->
        <!-- <nut-drag direction="y" :style="{right:'0px',top:'75px',zIndex:'200'}" v-if="DEBUG">
            <a class="btn touch-dom" @click="onTapCheat">cheat</a>
        </nut-drag> -->
        <!-- 主体 -->
        <div class="panel" v-if="state==0">
            <div class="equip-wrap">加载中</div>
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
                <a class="btn btn-gear" v-if="map.type==1" @click.stop="onTapGear">酒馆</a>
            </div>
            <!-- 吊牌 -->
            <div class="brand">{{map.name}}</div>
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
            </div>
        </div>
        <!-- 背景 -->
        <div class="bg" v-if="state==1"></div>
        <!-- 弹窗 -->
        <Pop v-if="viewingUnitTab" ref="pop-content" :title="`${viewingUnit.btd.name}的${[`面板`,`装备`,`技能`,][viewingUnitTab-1]}${viewingUnitTab==3?`（${viewingUnit.btd.skillList.length}）`:``}`" :arrowTitle="`${[`装备`,`技能`,`面板`,][viewingUnitTab-1]}`" :showCloseButton="true" @onTapClose="onTapClosePop" @onTapArrow="onTapArrowPop">
            <!-- 角色面板 -->
            <div class="unit-info-pop unit-board" v-if="viewingUnitTab==1">
                <Unit1 :unit="viewingUnit" :showTransferButton="team.length>1" @onTapTransferMoney="onTapTransferMoney" :mode="1" />
            </div>
            <!-- 角色装备表 -->
            <div class="unit-info-pop unit-equip-board" v-if="viewingUnitTab==2">
                <div class="unit-body">
                    <img class="unit-body-bg" :src="require(`../assets/outline-${viewingUnit.gd==1?'male':'female'}.png`)" />
                    <a class="unit-body-equip-wrap" :class="`${viewingUnitEquipIndex==(index-1)?'unit-body-equip-wrap-expand':''} unit-body-${[`weapon1`,`weapon2`,`accessory1`,`accessory2`,`armor`,`helmet`,`shoes`,][index-1]}`" v-for="index in 7" :key="index" @click.stop="onTapViewingUnitEquip(index-1)">
                        <Equip class="unit-body-equip" :class="" v-if="viewingUnit.btd.equipList[index-1]" :equip="viewingUnit.btd.equipList[index-1]" :mode="viewingUnitEquipIndex==(index-1)?1:2" />
                        <div class="unit-body-op" v-if="viewingUnitEquipIndex==(index-1)">
                            <a class="btn" @click.stop="onTapAllEquipOff()">卸下全身</a>
                            <a class="btn" @click.stop="onTapSellEquip(viewingUnit.btd.equipList[index-1])">售卖</a>
                            <a class="btn" @click.stop="onTapEquipOff(viewingUnit.btd.equipList[index-1])">卸下</a>
                        </div>
                    </a>
                </div>
                <div class="unit-bag equip-wrap">
                    <div class="unit-bag-title">背包（{{viewingUnit.btd.bagList.length}}）：</div>
                    <a class="unit-bag-equip-wrap" :class="viewingUnitBagEquip.id==equip.id?'unit-bag-equip-wrap-sel':''" v-for="equip of viewingUnit.btd.bagList" :key="equip.id"  @click.stop="onTapViewingUnitBag(equip)">
                        <Equip class="unit-bag-equip" :equip="equip" />
                        <div class="unit-bag-op-wrap" v-show="viewingUnitBagEquip.id==equip.id">
                            <div class="unit-bag-op">
                                <a class="btn" @click.stop="onTapSellEquip(equip)">售卖</a>
                                <a class="btn" v-if="viewingUnitBagEquip.t!=1&&viewingUnitBagEquip.t!=4" @click.stop="onTapEquipOn(equip,0)">装上</a>
                                <a class="btn" v-if="viewingUnitBagEquip.t==1||viewingUnitBagEquip.t==4" @click.stop="onTapEquipOn(equip,1)">装上1</a>
                                <a class="btn" v-if="viewingUnitBagEquip.t==1||viewingUnitBagEquip.t==4" @click.stop="onTapEquipOn(equip,2)">装上2</a>
                            </div>
                            <div class="unit-bag-compare-wrap" v-if="viewingUnitBagEquip.id==equip.id">
                                <div class="unit-bag-compare-title">{{viewingUnit.btd.name}}身上的装备：</div>
                                <Equip :ref="`compareEquip1-${equip.id}`" class="unit-bag-equip unit-bag-compare" v-if="viewingUnitCompareEquip1.id" :equip="viewingUnitCompareEquip1" :compare="viewingUnitBagEquip" />
                                <Equip :ref="`compareEquip2-${equip.id}`" class="unit-bag-equip unit-bag-compare" v-if="viewingUnitCompareEquip2.id" :equip="viewingUnitCompareEquip2" :compare="viewingUnitBagEquip" />
                            </div>
                        </div>
                    </a>
                </div>
            </div>
            <!-- 角色技能表 -->
            <div class="unit-info-pop unit-skill-board" v-if="viewingUnitTab==3">
                <draggable v-if="viewingUnit.btd.skillList.length>0" class="skill-list-group" handle=".mover" :disabled="false" v-model="viewingUnit.btd.skillList" @end="onSkillDragEnd" animation="100">
                    <div class="skill-wrap" v-for="skill of viewingUnit.btd.skillList" :key="skill.id">
                        <Skill class="skill" :skill="skill" :mode="1" @onTap="onTapSkill" />
                        <a class="anchor mover" v-if="viewingUnit.btd.skillList.length>1">拖<br/>移<br/>↕</a>
                    </div>
                </draggable>
                <div class="skill-empty" v-else>没有技能</div>
            </div>
        </Pop>
        <div class="pop-gear" v-if="showGearPop">
            <div class="pop-gear-bg"></div>
            <a class="btn btn-save" @click="onTapSave">存档</a>
            <a class="btn btn-restart" @click="onTapRestart">退出</a>
        </div>
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

            map: {},

            viewingUnitTab: 0,
            viewingUnit: null,
            viewingUnitEquipIndex: -1, // 单位弹窗-放大的装备 index
            viewingUnitBagEquip: {id:0,}, // 单位弹窗-选中的背包装备
            viewingUnitCompareEquip1: {}, // 对比装备1
            viewingUnitCompareEquip2: {}, // 对比装备2

            showGearPop: false, // 显示系统弹窗

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
                // this._alert(`成功加载 ${images.length} 张图片`,3);
                this.map = getMatchList(CONFIG.mapConfig,[['id',this.game.currentMapID]])[0];
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
            this.viewingUnitCompareEquip1 = {};
            this.viewingUnitCompareEquip2 = {};
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
            this._alert(`给予目标：${buff.name}（强度${level}）- ${buff.desc}`,5);
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
                let pcDom = this.$refs[`pop-content`].$refs[`pop`];
                if(pcDom){
                    pcDom.scroll({
                        top: 0,
                        behavior: 'smooth',
                    });
                }
            }
            else{
                this.viewingUnitEquipIndex = -1;
            }
        },
        onTapViewingUnitBag(equip){ // 点击【弹窗-背包中的装备】
            if(equip.id==this.viewingUnitBagEquip.id){ // 点击同一个装备
                this.viewingUnitBagEquip = { id:0, };
                this.viewingUnitCompareEquip1 = {};
                this.viewingUnitCompareEquip2 = {};
            }
            else{ // 选中装备
                let equipList = this.viewingUnit.btd.equipList;
                this.viewingUnitBagEquip = equip;
                if(equip.t==1){ // 武器 [1手,2头,3身体,4配饰,5脚]
                    this.viewingUnitCompareEquip1 = equipList[0]||{};
                    this.viewingUnitCompareEquip2 = equipList[1]||{};
                }
                else if(equip.t==4){ // 首饰
                    this.viewingUnitCompareEquip1 = equipList[2]||{};
                    this.viewingUnitCompareEquip2 = equipList[3]||{};
                }
                else{
                    this.viewingUnitCompareEquip1 = equipList[[0,0,5,4,0,6,][equip.t]]||{};
                    this.viewingUnitCompareEquip2 = {};
                }
                console.log(`点击【弹窗-背包中的装备】`,this.viewingUnitBagEquip);
            }
        },
        onTapEquipOn(equip){ // 点击【装上装备】
            console.log(`装上装备`,equip.n);
        },
        onTapEquipOff(equip){ // 点击【卸下装备】
            console.log(`卸下装备`,equip.n);
        },
        onTapAllEquipOff(){ // 点击【卸下全部装备】
            console.log(`卸下全部装备`);
        },
        onTapSellEquip(equip){ // 点击【售卖装备】
            console.log(`售卖装备`,equip.n);
        },
        onTapClosePop(){ // 点击【弹窗-关闭】
            this.resetViewingUnitPopData();
            this.showGearPop = false;
        },

        onTapGear(){ // 点击【齿轮】
            this.showGearPop = !this.showGearPop;
        },
        onTapSave(){ // 点击【齿轮-存档】
            this.save(1);
        },
        onTapRestart(){ // 点击【齿轮-回到主界面】
            this.$router.push('/');
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
    @import '../style/home/main.css';
    @import '../style/home/banner.css';
    @import '../style/home/team.css';
    @import '../style/home/pop.css';
    @import '../style/home/pop-board.css';
    @import '../style/home/pop-equip.css';
    @import '../style/home/pop-skill.css';
</style>

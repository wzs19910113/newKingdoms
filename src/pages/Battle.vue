<template>
    <div class="main" v-if="battle">
        <!--作弊-->
        <!-- <nut-drag direction="y" :style="{right:'0px',top:'75px',zIndex:'200'}" v-if="DEBUG">
            <a class="btn touch-dom" @click="onTapCheat">cheat</a>
        </nut-drag> -->

        <!--页面内容-->
        <div class="panel">
            <div class="body" v-if="pageState!=0">
                <!-- 战场 -->
                <div class="battle-field">
                    <!-- 敌方区域 -->
                    <div class="team-pan team-pan-top">
                        <Unit2 class="unit" v-for="unit in enemyTeam" :ref="'u-'+unit.id" :key="unit.id" :pageState="pageState" :unit="unit" @onTap="onTapUnit" />
                    </div>
                    <!-- 公示信息区域 -->
                    <div class="board-container">
                        <div class="board-flee-wrap" v-if="isFleeing">
                            <Bar1 class="board-flee-bar" title="撤离：" :mode="2" :type="3" :crt="fleeMove" :max="totalFleeMove" />
                        </div>
                        <div class="board-row" v-if="(!(boardSkill&&boardSkill.n))&&boardText">{{boardText}}</div>
                        <div class="board-row skill-name-flash" v-if="pageState==4&&boardSkill&&boardSkill.n">
                            <i class="flashing flashing-left">{{boardSkill.n}}</i>
                            <i class="flashing-skill">{{boardSkill.n}}</i>
                            <i class="flashing flashing-right">{{boardSkill.n}}</i>
                        </div>
                        <a class="btn btn-start" v-if="pageState==1" @click="onTapStartBattle">开 始 战 斗</a>
                        <a class="btn btn-cheat btn-cheat-1" v-if="pageState==1&&DEBUG" @click="onTapCheat(1)">作弊2</a>
                        <a class="btn btn-cheat btn-cheat-2" v-if="pageState==1&&DEBUG" @click="onTapCheat(2)">作弊1</a>
                    </div>
                    <!-- 我方区域 -->
                    <div class="team-pan team-pan-bottom">
                        <Unit2 class="unit" v-for="unit in playerTeam" :ref="'u-'+unit.id" :key="unit.id" :pageState="pageState" :unit="unit" @onTap="onTapUnit" />
                    </div>
                </div>
                <!-- 操作板块 -->
                <div class="menu-wrap" :class="`${menuData.expand?'menu-wrap-expand':''}`" v-if="menuData.state>0">
                    <a class="btn btn-expand" @click="onTapMenuExpand">{{menuData.expand?`▽`:`△`}}</a>
                    <a class="btn btn-back" v-if="menuData.state>1" @click="onTapMenuBack">返回</a>
                    <div class="menu">
                        <p class="menu-tip">{{menuData.tip}} {{menuData.extip}}：</p>

                        <div class="menu-tag" v-if="menuData.state==1">
                            <a class="btn menu-block menu-btn menu-btn-1" @click="onTapMenu({flag:1})">攻击</a>
                            <a class="btn menu-block menu-btn menu-btn-2" @click="onTapMenu({flag:2})">技能</a>
                            <div class="menu-block menu-block-lg">
                                <a class="btn btn-mop btn-cdot" :class="`btn-cdot-${CONFIG.baseConsumeList[0]} ${checkMenuButtonBan({flag:1,checkCrumble:1})?'btn-ban':''}`" @click="onTapMenu({flag:3,ban:checkMenuButtonBan({flag:1,checkCrumble:1}),})">防御️</a>

                                <a class="btn btn-mop btn-cdot" :class="`btn-cdot-${CONFIG.baseConsumeList[1]} ${checkMenuButtonBan({flag:2,checkCrumble:1})?'btn-ban':''}`" @click="onTapMenu({flag:4,ban:checkMenuButtonBan({flag:2,checkCrumble:1}),})">躲避</a>

                                <a class="btn btn-mop btn-cdot" :class="`btn-cdot-${CONFIG.baseConsumeList[2]} ${checkMenuButtonBan({flag:3,})?'btn-ban':''}`" @click="onTapMenu({flag:5,ban:checkMenuButtonBan({flag:3,}),})">追踪</a>

                                <a class="btn btn-mop btn-cdot" :class="`btn-cdot-${CONFIG.baseConsumeList[3]} ${checkMenuButtonBan({flag:4,})?'btn-ban':''}`" @click="onTapMenu({flag:6,ban:checkMenuButtonBan({flag:4,}),})">调息</a>

                                <a class="btn btn-mop btn-cdot" :class="`btn-cdot-${CONFIG.baseConsumeList[4]} ${checkMenuButtonBan({flag:5,})?'btn-ban':''}`" @click="onTapMenu({flag:7,ban:checkMenuButtonBan({flag:5,}),})">集气</a>

                                <a class="btn btn-mop btn-cdot" :class="`btn-cdot-${CONFIG.baseConsumeList[5]} ${checkMenuButtonBan({flag:6,})?'btn-ban':''}`" @click="onTapMenu({flag:8,ban:checkMenuButtonBan({flag:6,}),})">爆气</a>

                                <a class="btn btn-mop btn-cdot" :class="`btn-cdot-${CONFIG.baseConsumeList[6]} ${checkMenuButtonBan({flag:7,checkCrumble:1})?'btn-ban':''}`" @click="onTapMenu({flag:9,ban:checkMenuButtonBan({flag:7,checkCrumble:1}),})">话术</a>

                                <a class="btn btn-mop btn-cdot" :class="`btn-cdot-${mode==4?0:CONFIG.baseConsumeList[7]} ${checkMenuButtonBan({flag:8,})?'btn-ban':''}`" @click="onTapMenu({flag:10,ban:checkMenuButtonBan({flag:8,}),})">{{mode==4?`离开`:`撤离`}}</a>
                            </div>
                        </div>
                        <div class="menu-tag" v-if="menuData.state==2">
                            <div class="menu-sub-wrap menu-attack-wrap">
                                <div class="menu-weapon" v-for="(weapon,index) in curUnitList[curUnitListIndex].btd.weaponList" :key="index">
                                    <Attack class="menu-attack btn" :class="menuData.expand?'':'menu-attack-shrink'" v-for="(attack,index) in weapon.k" :key="index" :unit="curUnitList[curUnitListIndex]" :attack="attack" :mode="menuData.expand?1:2"  :ban="checkSubMenuButtonBan({unit:curUnitList[curUnitListIndex],data:attack})" @onTap="onTapMenuAttack" />
                                </div>
                                <div class="menu-weapon">
                                    <Attack class="menu-attack btn" :class="menuData.expand?'':'menu-attack-shrink'" :attack="curUnitList[curUnitListIndex].btd.defaultAttack" :unit="curUnitList[curUnitListIndex]" :mode="menuData.expand?1:2"  :ban="checkSubMenuButtonBan({unit:curUnitList[curUnitListIndex],data:curUnitList[curUnitListIndex].btd.defaultAttack,})" @onTap="onTapMenuAttack" />
                                </div>
                            </div>
                        </div>
                        <div class="menu-tag" v-if="menuData.state==3">
                            <div class="menu-sub-wrap menu-skill-wrap">
                                <Skill class="btn" :class="menuData.expand?'menu-skill-expand':'menu-skill-shrink'" v-for="(skill,index) in curUnitList[curUnitListIndex].btd.skillList" :key="index" :unit="curUnitList[curUnitListIndex]" :ban="checkSubMenuButtonBan({unit:curUnitList[curUnitListIndex],data:skill,})" :skill="skill" :mode="menuData.expand?1:2" :isOption="true" @onTap="onTapMenuSkill" />
                            </div>
                        </div>
                        <div class="menu-tag" v-if="menuData.state==4">
                            <div class="menu-sub-wrap menu-unit-wrap">
                                <a class="btn" :class="unit.btd.isPlayer?'btn-target-player':'btn-target-enemy'" v-for="(unit,index) in menuData.unitList" :key="index"  @click="onTapMenu({flag:21,data:unit})">{{unit.btd.name}}</a>
                            </div>
                        </div>
                        <div class="menu-tag" v-if="menuData.state==5">
                            <div class="menu-sub-wrap menu-attr-wrap">
                                <a class="btn" v-for="(attr,index) in menuData.attrList" :key="index"  @click="onTapMenu({flag:22,data:attr.i})">{{attr.n}}</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- 背景 -->
        <div class="bg" :style="`background-image:url(${require('../assets/bg-battle-'+field+'.png')})`"></div>
        <div class="purdah purdah-left" v-if="pageState==0"></div>
        <div class="purdah purdah-right" v-if="pageState==0"></div>
        <!-- 弹窗 -->
        <div class="canvas-cover" v-if="pageState==4" @click="onTapCanvas2">
            <Ani class="ani" ref="ani" @onAnimationEnd="onAnimationEnd" />
        </div>
        <Pop v-if="pageState==5&&editBuffUnitList.length>0" :title="`选择并削减 ${editBuffUnitList[editBuffUnitIndex].btd.name} 的状态强度 ${editLevel} 层：`" @onTap="onTapPop">
            <div class="buff-edit-menu">
                <Buff class="buff-edit-btn" v-for="(buff,index) in editBuffList" :key="index" :buff="buff" :mode="2" @onTap="onTapEditBuff(buff)" />
            </div>
        </Pop>
        <Pop v-if="viewingUnit" title="角色面板" :showCloseButton="true" @onTapClose="onTapPop">
            <div class="unit-info-pop">
                <Unit1 :unit="viewingUnit" :mode="2" />
            </div>
        </Pop>
        <Pop v-if="showMenuGuide" title="战斗操作说明" :showCloseButton="true" @onTapClose="onTapPop">
            <div class="guide-menu">
                <p class="guide-menu-row" v-for="(item,index) in menuGuids">
                    <label class="guide-name">{{item.name}}：</label><label class="guide-desc">{{item.desc}}。</label>
                </p>
            </div>
        </Pop>
        <Toast ref="toast" />
    </div>
</template>

<script>
import Unit1 from '../components/Unit1';
import Unit2 from '../components/Unit2';
import Equip from '../components/Equip';
import Skill from '../components/Skill';
import Attack from '../components/Attack';
import Bar1 from '../components/Bar1';
import Bar2 from '../components/Bar2';
import Buff from '../components/Buff';
import Ani from '../components/Ani';
import Pop from '../components/Pop';
import Toast from '../components/Toast';
import { cl, query, r, exptr, setInRange, loadImages, shuffle, bulbsort, bulbsort2, getParentNode, cloneObj, numFormat, avg, percent, calcDistance, getMatchList, getSubMatchList, removeFromList, arrContains, } from '../tools/utils';
import * as common from '../tools/common';
import * as ai from '../tools/ai';
import { DEBUG, CONFIG, CACHE, } from '../config/config';

const INIT_CHANGES = {
    hp: 0,
    def: 0,
    eng: 0,
    phy: 0,
    mov: 0,
    ptc: 0,
    dge: 0,
    mdef: 0,
    money: 0,
    buffList: [],
    weakenBuff: null,
    effectTypeList: [],
    capitulate: 0,
    domAni: '',
}

/*
window.GLOBAL.battle = { // 输入：战斗参数
    mode: 4, // 战斗模式 【 1：普通|2：BOSS|3：切磋|4：营地 】
    field: 1, // 战场 1-9
    map: { // 当前所在地图数据
        id: 101,
        level: 2,
        name: '地图名字',
        size: 5,
        type: 2,
        links: [],
        bosses: [],
        floors: [],
        guard: 17,
        conquered: false,

        cellList: [{ // 单元格数据数组
            id: 1,
            show: false,
            flag: true,
            core: false,
            marked: false, // 是否显示路标或核心标识
            enemy: 0, // 0无敌人 1+敌人数量
        },...],
        curCellIndex: 4, // 当前所在单元格下标
        tempGame: {...}, 游戏数据样本
    },
    playerTeamIds: [],
    enemyTeamIds: [],
}
window.GLOBAL.battleResult = { // 输出：战斗结果数据
    battle: {...}, // 战斗参数
    result: 1, // 结果 0离开营地 1获胜 2战败 3撤离成功
    playerTeam: [], // 我方单位数据数组
    enemyTeam: [], // 敌方单位数据数组
    bonusRate: 1, // 额外金币奖励比率
    roundCount: 56, // 战斗的回合数
}
*/

export default {
    name: 'Battle',
    props:{

    },
    data(){
        return {
            pageState: 0, // 页面状态【0:读取数据中|1：战斗准备完成|2：累积行动条|3：战斗-操作中|4：动画|5：buff编辑|99：离开】

            boardText: '', // 战场公示文字
            boardSkill: {}, // 战场公示特效技能

            menuData: { // 菜单数据
                state: 0, // 操作面板出现状态【0:不显示|1：基础选项|2：攻击选项|3：技能选项|4：选择单位|5：选择属性】
                unitList: [],
                attrList: [{n:`力量`,i:4},{n:`精准`,i:5},{n:`速度`,i:6},{n:`智力`,i:7},{n:`定力`,i:8},{n:`隐蔽`,i:9},{n:`爆发`,i:10},],
                tip: '', // 菜单公示主文字
                extip: '', // 菜单公示副文字
                expand: 0, // 菜单展开标识
                unitOptionType: 0, // 选择单位对应的行动【1攻击|2技能施放|3话术】
                unitOptionData: {}, // 选择单位对应的行动相关的数据
                stateRecordList: [],
            },

            curUnitList: [], // 本帧行动单位数组
            curUnitListIndex: -1, // 本帧行动单位数组下标

            viewingUnit: null, // 正在查看的单位

            showMenuGuide: 0, // 显示操作菜单指导
            menuGuids: [
                {name:'防御',desc:'恢复防御力到满值'},
                {name:'躲避',desc:'降低自己的存在感'},
                {name:'追踪',desc:'提升敌方单位10%的存在感，该单位只能是存在感最高的敌人'},
                {name:'调息',desc:'恢复体力到满值'},
                {name:'集气',desc:'提升潜能'},
                {name:'爆气',desc:'消耗自己全部潜能，选择自己的某项属性按百分比提升'},
                {name:'话术',desc:'降低敌人的心理防御（智力vs定力）'},
                {name:'撤离',desc:'敌人攻击命中会打断'},
            ],

            battle: null,

            field: 0,

            roundCount: 0, // 经历的回合次数

            isFleeing: 0, // 当前正在撤离
            fleeMove: 0, // 当前撤离进度
            totalFleeMove: 1, // 撤离进度总值

            aniList: [], // 播放画布动画的数据数组

            playerTeam: [],
            enemyTeam: [],

            editBuffUnitList: [], // buff编辑对象单位数组
            editBuffUnitIndex: -1, // buff编辑对象单位数组下标
            editBuffList: [], // 编辑弹窗的 buff 数组
            editLevel: 0, // 可以削减的 buff 层数

            bonusRate: 1, // 额外金币奖励比率

            timerList: [],
            itv: null,

            common,
            CONFIG,
            DEBUG,
        };

    },
    mounted(){
        let _nus = [];
       //  _nus.push(common.genUnitData({id:1,name:'赵日天',age:20,gender:1,level:1,tms:1,rel:3,game:this.battle.tempGame,}));
       //  _nus.push(common.genUnitData({id:2,gender:2,tms:2,level:1,inten:1,rel:3,game:this.battle.tempGame,}));
       //  _nus.push(common.genUnitData({id:3,tms:3,level:1,inten:2,rel:3,game:this.battle.tempGame,}));
       //  _nus.push(common.genUnitData({id:4,tms:4,level:1,inten:3,rel:3,game:this.battle.tempGame,}));
       //  _nus.push(common.genUnitData({id:11,gender:1,level:9,inten:0,game:this.battle.tempGame,}));
       //  _nus.push(common.genUnitData({id:12,gender:1,level:9,inten:0,game:this.battle.tempGame,}));
       //  _nus.push(common.genUnitData({id:13,gender:2,level:9,inten:0,game:this.battle.tempGame,}));
       //  _nus.push(common.genUnitData({id:14,gender:2,level:9,inten:0,game:this.battle.tempGame,}));
       //  window.GLOBAL = {};
       //  window.GLOBAL.game = {
       //  	money: 1000,
       //  	day: 1,
       //  	hour: 0,
       //  	meTeamIDs: [1,], // 队伍角色ID
       //  	luck: 0, // 夺宝能力
       //  	allUnits: [], // 角色
       //  	unitIndex: 101, // 角色 ID 索引
       //  	allEquips: [], // 装备
       //  	equipIndex: 101, // 装备 ID 索引
       //  	allSkills: [], // 技能
       //  	skillIndex: 101, // 技能 ID 索引
       //  	allMaps: [], // 地图
       //  };
       //  window.GLOBAL.battle = {
       //      mode: 1, // 战斗模式【1:普通|2：BOSS|3：切磋|4：营地】
       //      envirs: {
       //          mapId: 101,
       //      },
       //      field: 9, // 战场 1-9
       //      playerTeamIds: [1,2,3,4,],
       //      enemyTeamIds: [11,12,13,14,],
       //  }
       //  // 预设装备
       //  window.GLOBAL.game.allUnits = _nus;
       //  window.GLOBAL.game.allEquips = [];
       //
       //  // _nus[0].as[6] = 50;
       //  // _nus[1].as[6] = 50;
       //  // _nus[2].as[6] = 50;
       //  // _nus[3].as[6] = 50;
       //
       //  _nus[0].as[6] = 800;
       //  _nus[1].as[6] = 800;
       //  _nus[2].as[6] = 800;
       //  _nus[3].as[6] = 800;
       //  _nus[1].as[0] = 1800;
       //  _nus[1].as[7] = 100;
       //  _nus[1].as[10] = 1000;
       //  _nus[3].as[9] = 250;
       //  _nus[3].as[0] = 2300;
       //  _nus[3].as[2] = 100;
       //  _nus[3].as[1] = 400;
       //  _nus[3].as[3] = 100;
       //  _nus[3].as[10] = 200;
       //  _nus[3].as[7] = 500;
       //  _nus[3].ss[0] = 12;
       //  // _nus[3].as[8] = -500;
       //  _nus[7].as[1] = 1;
       //  _nus[7].as[1] = 1;
       //  _nus[6].as[0] = 2350;
       //  _nus[7].as[0] = 1350;
       //  _nus[7].as[1] = 300;
       //  _nus[7].as[2] = 100;
       //  _nus[7].as[3] = 242;
       //  _nus[7].as[6] = 944;
       //  //
       //  _nus[1].es[0] = 1;
       //  _nus[1].es[0] = 2;
       //  _nus[1].es[5] = 6;
       //  _nus[1].es[3] = 7;
       //  _nus[1].es[0] = 3;
       //  _nus[2].es[5] = 6;
       //  _nus[2].es[3] = 7;
       //  //
       //  _nus[3].es[0] = 4;
       //  _nus[3].es[1] = 5;
       //  _nus[3].es[5] = 6;
       //  _nus[3].es[3] = 7;
       //  _nus[3].es[4] = 8;
       //  //
       //  // _nus[6].as[6] = 15;
       //  // _nus[5].as[6] = 14;
       //  // _nus[4].as[6] = 13;
       //  _nus[4].es[0] = 9;
       //  _nus[4].es[5] = 10;
       //  _nus[4].es[1] = 1;
       //  _nus[5].es[1] = 2;
       //  _nus[6].es[1] = 3;
       //  _nus[7].es[1] = 4;
       //  _nus[7].es[2] = 5;
       //  //
       //  // // _nus[4].ss[0] = 11;
       //  // // _nus[5].ss[0] = 11;
       //  // // _nus[6].ss[0] = 11;
       //  // // _nus[7].ss[0] = 11;
       //  // // _nus[7].ss[1] = 12;
       //  // // _nus[7].ss[2] = 13;
       //  // // _nus[7].ss[3] = 14;
       //  // // _nus[7].ss[3] = 12;
       //  // // _nus[7].ss[2] = 11;
       //  // // _nus[7].ss[1] = 13;
       //  // _nus[7].ss[0] = 14;
       //
       //  window.GLOBAL.game.allEquips.push(common.genEquipData({id:1,game:{},level:1,inten:0,type:r(1,1)}));
       //  window.GLOBAL.game.allEquips.push(common.genEquipData({id:2,game:{},level:1,inten:0,type:r(1,1)}));
       //  window.GLOBAL.game.allEquips.push(common.genEquipData({id:3,game:{},level:1,inten:1,inten:3,type:r(1,1)}));
       //  window.GLOBAL.game.allEquips.push(common.genEquipData({id:4,game:{},level:1,inten:2,type:r(1,1)}));
       //  window.GLOBAL.game.allEquips.push(common.genEquipData({id:5,game:{},level:1,inten:3,type:r(1,1)}));
       //
       //  window.GLOBAL.game.allEquips.push(common.genEquipData({id:6,game:{},level:r(1,1),type:r(3,3)}));
       //  window.GLOBAL.game.allEquips.push(common.genEquipData({id:7,game:{},level:r(1,1),type:r(5,5)}));
       //  window.GLOBAL.game.allEquips.push(common.genEquipData({id:8,game:{},level:r(1,1),type:r(5,5)}));
       //  window.GLOBAL.game.allEquips.push(common.genEquipData({id:9,game:{},level:r(1,1),type:r(1,1)}));
       //  window.GLOBAL.game.allEquips.push(common.genEquipData({id:10,game:{},level:r(1,1),type:r(5,5)}));
       //  // 预设技能
       //  for(let i=0;i<10;i++){
       //      _nus[0].ss[i] = i+1;
       //      window.GLOBAL.game.allSkills.push(common.genSkillData({id:i+1,game:{},level:r(1,9)}));
       //  }
       //
       //  // 效果类型【 1攻击 2添加状态 3减弱一个增益状态 4削减一个减益状态 5恢复生命 6改变护甲 7改变潜能 8改变心防 9改变存在感】
       // // 攻击方式{...attack}，添加的状态-等级数组{ b:[1,2], bl:[3,4],}，
       // // 固疗和百分疗 { h:100, rx:35, }，心防固伤和智力补正 { d:100, rx1:0, rx2:44, }
       // // 潜能补正 { d:100, rx:35, }，存在感 { d:100, rx:35, }
       //  window.GLOBAL.game.allSkills.push({
       //      id: 11,
       //  	l: 1,
       //  	n: '治愈术',
       //  	t: 2, // 1自己 2我方单体 3敌方单体
       //  	el: [{ // 技能效果数组
       //          t: 5,
       //  		d: {h:117,rx:10},
       //      },],
       //  	c: 39, // 体力消耗
       //  	d: 1200, // 存在感
       //  	v: 133, // 价值
       //  });
       //  window.GLOBAL.game.allSkills.push({
       //      id: 12,
       //  	l: 1,
       //  	n: '龙虾斩',
       //  	t: 3, // 1自己 2我方单体 3敌方单体
       //  	el: [{ // 技能效果数组
       //          t: 1,
       //  		d: {
       //              n: '挥砍',
       //  			d: 16, // 基础伤害
       //  			r1: 13, // 力量补正
       //  			r2: 15, // 精准补正
       //  			b: [], // buff制造表（buff id）
       //  			bl: [], // buff等级表（1-9）
       //  			s: 0, // SP效果 1压制 2破盾 3气溃 4漩流 5锁敌 6攻心 7摸金
       //  			sl: 9, // SP效果等级
       //  			et: 1, // 特效类型 1劈砍 2钝击 3子弹 4飞刀 5火炮 6雷击
       //          },
       //      },{
       //          t: 2,
       //          d: { b:[114,115], bl:[2,4], },
       //      }],
       //  	c: 10, // 体力消耗
       //  	d: 5200, // 存在感
       //  	v: 1533, // 价值
       //  });
       //  window.GLOBAL.game.allSkills.push({
       //      id: 13,
       //  	l: 1,
       //  	n: '蝴蝶阵法',
       //  	t: 1, // 1自己 2我方单体 3敌方单体
       //  	el: [{ // 技能效果数组
       //          t: 9,
       //  		d: { d:-5346, rx:115, },
       //      },{ // 技能效果数组
       //          t: 2,
       //  		d: { b:[5,14,], bl:[4,3,], },
       //      },],
       //  	c: 46, // 体力消耗
       //  	d: 5200, // 存在感
       //  	v: 1533, // 价值
       //  });
       //  window.GLOBAL.game.allSkills.push({
       //      id: 14,
       //  	l: 1,
       //  	n: '凝视',
       //  	t: 3, // 1自己 2我方单体 3敌方单体
       //  	el: [{
       //          t: 9,
       //  		// d: {d:100,rx1:35,rx2:40,},
       //  		d: {d:3100,rx:0,},
       //      },],
       //  	c: 23, // 体力消耗
       //  	d: 1600, // 存在感
       //  	v: 0, // 价值
       //  });
       //  window.GLOBAL.game.allSkills.push({
       //      id: 15,
       //  	l: 3,
       //  	n: '大绝命',
       //  	t: 3, // 1自己 2我方单体 3敌方单体
       //  	el: [
       //          {
       //              t: 8,
       //      		d: { d:-146, rx1:115, rx2:12, },
       //          },
       //          {
       //              t: 9,
       //      		d: { d:3400, rx:35, },
       //          },
       //          {
       //              t: 2,
       //      		d: { b:[115,103,], bl:[1,5,], },
       //          },
       //      ],
       //  	c: 144, // 体力消耗
       //  	d: 700, // 存在感
       //  	v: 0, // 价值
       //  });
       //  for(let i=0;i<4;i++){
       //      let skill = window.GLOBAL.game.allSkills[i];
       //      skill.v = common.calcSkillValue(skill);
       //  }
        if(window.GLOBAL&&window.GLOBAL.battle){
            this.battle = window.GLOBAL.battle;
            this.init();
        }
        else{
            this.$router.push('/');
        }
    },
    beforeDestroy(){
        this.clearAllTimers();
        clearInterval(this.itv);
    },
    methods: {
        /* 流程相关 */
        init(){ // 初始化全部
            let { playerTeamIds, enemyTeamIds, field, mode, } = this.battle;
            let playerTeam = [], enemyTeam = [];
            let unitAction = (ids,team) => {
                for(let unitId of ids){
                    let unit = getMatchList(this.battle.map.tempGame.allUnits,[['id',unitId]])[0];
                    if(unit){
                        let btd = common.getUnitBtd(unit,this.battle.map.tempGame); // 获取单位战斗数据
                        let _unit = cloneObj(unit);
                        _unit.btd = btd;
                        team.push(_unit);
                    }
                }
                return team;
            };

            this.playerTeam = unitAction(playerTeamIds,playerTeam);
            this.enemyTeam = unitAction(enemyTeamIds,enemyTeam);

            this.field = field;
            this.mode = mode;

            if(this.mode==4){ // 营地模式
                this.goPageState(2);
                this.boardTip(`营地模式`);
            }
            else{
                this.timerList.push(setTimeout(_=>{
                    this.goPageState(1);
                },800));
            }

            // this.itv = setInterval(_=>{
            //     this.forceUpdatePage();
            // },500);
        },
        goPageState(flag){ // 切换页面
            let allUnits;
            this.pageState = flag;
            switch(flag){
                case 1: // 战斗开始
                break;
                case 2: // 本帧所有行动者动作执行完毕，行动力推进
                    this.resetMenu();
                    // 清空所有单位的 cur 标识
                    allUnits = [...this.playerTeam,...this.enemyTeam];
                    for(let unit of allUnits){
                        unit.btd.cur = 0;
                    }
                    // 清空帧行动者数组
                    this.curUnitList = [];
                    this.curUnitListIndex = 0;
                    // 行动力推进
                    this.movementProcess();
                break;
                case 3: // 进行操作
                case 4: // 动画
                case 5: // buff编辑
                case 99: // 战斗结束
                break;
            }
        },
        goMenuState(flag,data={}){ // 切换菜单
            let { type, caster, } = data;
            if(flag==4){ // 选择目标单位 type:1敌方全体，2友方全体
                let list, team;
                if(type==1){
                    list = getSubMatchList(this.enemyTeam,[['out',0]],'btd');
                    team = '敌方';
                }
                else if(type==2){
                    list = getSubMatchList(this.playerTeam,[['out',0]],'btd');
                    list = removeFromList(caster.id,'id',list); // 剔除执行者
                    team = '友方';
                }
                this.menuData.unitList = list;
                this.menuData.extip = `选择${team}目标`;
            }
            else if(flag==5){ // 选择属性
                this.menuData.extip = `选择属性`;
            }
            else{
                this.menuData.extip = ``;
            }
            this.menuData.stateRecordList.push(this.menuData.state);
            this.menuData.state = flag;
        },
        movementProcess(){ // 行动条进展，计算出本帧行动者数组
            let allAliveUnits;
            if(this.isFleeing){ // 如果正在撤离
                let allEnemyUnits = [...this.enemyTeam];
                allAliveUnits = getSubMatchList(allEnemyUnits,[['out',0]],'btd');
            }
            else{
                allAliveUnits = this.getAllAliveUnits();
            }
            let tickCount = 0;
            let _curUnitList = []; // 可行动单位数组
            let curUnitList = []; // 多重可行动单位数组
            let genCurUnitList = _ =>{
                let smallestTickCount = Infinity; // 最先行动者的所需行动步数
                // 计算每个人的【所需行动步数】和【超出行动力】
                for(let unit of allAliveUnits){
                    let speed = common.getSpeed(unit); // 3
                    let diff= 10000-unit.btd.mov; // 10
                    let divisor = Math.ceil(diff/speed); // 除数=4
                    unit.tickCount = divisor; // 需要 4 步才能行动
                    unit.overflowMove = speed*divisor-diff; // 超出的行动力为 2
                }
                // 计算最先行动者需要的步数
                for(let unit of allAliveUnits){
                    if(unit.tickCount<smallestTickCount){
                        smallestTickCount = unit.tickCount;
                    }
                }
                tickCount = smallestTickCount;
                // 所有人推进行动条
                for(let unit of allAliveUnits){
                    unit.btd.mov += smallestTickCount*common.getSpeed(unit);
                }
                // 得出最小行动步数为 3，筛选出本帧行动者
                for(let unit of allAliveUnits){
                    if(unit.tickCount<=smallestTickCount){
                        _curUnitList.push(unit);
                    }
                }
                // 根据超出行动力，对本帧行动者数组进行逆向排序
                _curUnitList = bulbsort(_curUnitList,'overflowMove',1);
                // 根据每个行动者的 roundTotal 进行复制
                for(let unit of _curUnitList){
                    for(let i=0;i<unit.btd.roundTotal;i++){
                        curUnitList.push(unit);
                    }
                }
                this.curUnitList = curUnitList; // [{id:1,...},{id:1,...},{id:2,...},{id:3,...},{id:3,...},...]
            }

            // 计算出本帧行动者数组（curUnitList）
            genCurUnitList();

            if(this.isFleeing){ // 如果正在撤离，则根据已过时间单位（tickCount）增加撤离进度
                let allPlayerUnits = [...this.playerTeam];
                let allAlivePlayerUnits = getSubMatchList(allPlayerUnits,[['out',0]],'btd');
                let fleeMoveIncresement = 0; // 所有存活我方单位的速度总和
                for(let unit of allAlivePlayerUnits){
                    fleeMoveIncresement += common.getSpeed(unit);
                }
                this.fleeMove += Math.round(fleeMoveIncresement*tickCount*.01);
            }
            if(this.isFleeing&&this.fleeMove>=this.totalFleeMove){ // 如果撤离进度满，则撤离成功，结束战斗
                this.fleeMove = this.totalFleeMove;
                this.battleEnd(3);
            }
            else{ // 开始下一个 curUnitList 的第一个单位行动
                this.timerList.push(setTimeout(_=>{
                    // 所有本帧行动者行动条归零
                    for(let _unit of this.curUnitList){
                        _unit.btd.mov = 0;
                    }

                    // 回合开始
                    let curUnit = this.curUnitList[this.curUnitListIndex];
                    this.roundStart(curUnit);
                },500));
            }
        },

        roundStart(unit){ // 单位回合开始
            // console.log(`单位回合开始`,unit.btd.name);
            let allUnits = [...this.playerTeam,...this.enemyTeam];
            this.clearAllTimers();
            // 初始化所有单位的 changes 和破防标识
            for(let _unit of allUnits){
                _unit.btd.changes = cloneObj(INIT_CHANGES);
                _unit.btd.followChanges = cloneObj(INIT_CHANGES);
                _unit.btd.penetrated = 0;
            }
            // 撤离中的话玩家不能行动
            if(this.isFleeing&&unit.btd.isPlayer){
                this.roundEnd();
                return;
            }
            // 当前行动者标识
            unit.btd.cur = 1;
            // 回合次数+1
            this.roundCount++;
            // 通用前置动作
            this.unitRoundPrologue(unit);
            // 刷新页面
            this.forceUpdatePage();
            unit = this.curUnitList[this.curUnitListIndex];
            // 判断玩家还是人机
            if(unit.btd.isPlayer){ // 玩家
                this.goPageState(3);
                this.menuData.state = 1;
                this.menuData.tip = `${unit.btd.name}行动`; // 更新菜单提示文本
                this.menuData.extip = ``;
            }
            else{ // 人机
                let unitAction = ai.genAction({unit,meTeam:this.enemyTeam,youTeam:this.playerTeam,isFleeing:this.isFleeing,mode:this.mode,});
                // console.log(unitAction);
                this.timerList.push(setTimeout(_=>{
                    this.unitAction(unitAction);
                },CONFIG.aiExpireTime));
            }
        },
        unitRoundPrologue(unit){ // 单位回合的通用前置动作
            let btd = unit.btd;
            // 防御值自动回升
            if(btd.mdef>0){ // 判断是否心理崩溃，若没有则防御值自动回升
                let defRecover = common.calcDefRecover({unit,});
                btd.def[0] += defRecover;
                btd.def[0] = setInRange(btd.def[0],0,btd.def[1]);
            }
        },
        unitRoundEpilog(curUnit){ // 单位回合的通用后置动作（已计算好所有单位的changes，还未触发动画）
            let allAliveUnits = this.getAllAliveUnits();
            let buff;

            /* 根据buff，重新计算当前单位的 changes */

            // 养息bufff
            if(buff=common.getBuff(curUnit,5)){
                let phyRecover = common.calcAdjustBuff({caster:curUnit,buff,});
                curUnit.btd.followChanges.phy += phyRecover;
            }

            // 隐匿bufff
            if(buff=common.getBuff(curUnit,17)){
                let dgeRecover = common.calcHideBuff({caster:curUnit,buff,});
                curUnit.btd.followChanges.dge -= dgeRecover;
                this.registerAniEffect(104,curUnit,1);
            }

            // 疗愈bufff
            if(buff=common.getBuff(curUnit,22)){
                let hpRecover = common.calcHealBuff({caster:curUnit,buff,});
                curUnit.btd.followChanges.hp += hpRecover;
                this.registerAniEffect(201,curUnit,1);
            }

            // 恐惧bufff
            if(buff=common.getBuff(curUnit,116)){
                let mentalDmg = common.calcFearBuff({buff,});
                curUnit.btd.followChanges.mdef -= mentalDmg;
                this.registerAniEffect(201,curUnit,1);
            }

            // 干毒bufff
            if(buff=common.getBuff(curUnit,119)){
                let hpDmg = common.calcFixPoisonBuff({buff,});
                curUnit.btd.followChanges.hp -= hpDmg;
                this.registerAniEffect(201,curUnit,1);
            }

            // 湿毒bufff
            if(buff=common.getBuff(curUnit,122)){
                let hpDmg = common.calcPctPoisonBuff({caster:curUnit,buff,});
                curUnit.btd.followChanges.hp -= hpDmg;
                this.registerAniEffect(201,curUnit,1);
            }

            // 战意流失
            this.enviorDamage();

            // 遍历每个存活单位，根据 changes 生成并推送画布动画
            for(let unit of allAliveUnits){
                this.pushAniByChanges({caster:curUnit,target:unit});
            }
            if(this.mode==4){ // 营地模式，不播放动画
                this.timerList.push(setTimeout(_=>{
                    this.onAnimationResponse();
                    this.$nextTick(_=>{
                        this.timerList.push(setTimeout(_=>{
                            this.onAnimationEnd();
                        },100));
                    });
                },100));
            }
            else{
                // 计算完动作后，播放DOM动画+所有画布动画
                this.playAniList();
            }
        },
        playAniList(){ // 播放所有单位的dom动画，同时逐一播放 aniList 中的全部画布动画
            this.goPageState(4);
            // console.log(`播放所有单位的dom动画，同时逐一播放 aniList 中的全部画布动画`);
            this.$nextTick(_=>{
                let allAliveUnits = this.getAllAliveUnits();
                let domAniExist = 0;
                // 播放每个单位的dom动画
                for(let unit of allAliveUnits){
                    let changes = unit.btd.changes;
                    if(changes.domAni){
                        domAniExist = 1;
                        this.playDomAni(unit,changes.domAni);
                    }
                }
                if(this.aniList.length<=0){ // 如果没有动画，则直接结束动画
                    this.timerList.push(setTimeout(_=>{
                        this.onAnimationResponse();
                        this.$nextTick(_=>{
                            this.timerList.push(setTimeout(_=>{
                                this.onAnimationEnd();
                            },100));
                        });
                    },domAniExist?550:10));
                }
                else{ // 播放每个单位的画布动画
                    this.aniList = bulbsort(this.aniList,'effectType',0);
                    for(let aniData of this.aniList){
                        this.playAni(aniData);
                    }
                }
                // console.log(`播放所有单位的dom动画，同时逐一播放 aniList 中的全部画布动画`,this.aniList);
            });
        },
        onAnimationEnd(){ // 当动画结束
            // console.log(`动画结束`);
            // 清除所有dom动画和所有changes
            let allUnits = [...this.playerTeam,...this.enemyTeam];
            for(let unit of allUnits){
                let vdom = this.$refs[`u-${unit.id}`][0];
                vdom.trigAni();
                unit.btd.changes = {};
                unit.btd.followChanges = {};
            }
            // 清空所有动画
            this.aniList = [];
            // 清空特效名技能
            this.boardSkill = null;
            // 判断是否需要进入编辑buff环节
            let canEditBuff = this.editBuffList.length>0;
            if(this.checkEnd()){
                canEditBuff = 0;
            }
            if(this.editBuffUnitIndex>=0){
                let target = this.editBuffUnitList[this.editBuffUnitIndex];
                if(target.btd.out){
                    canEditBuff = 0;
                }
            }
            if(canEditBuff){ // 进入编辑buff环节
                this.goPageState(5);
            }
            else{ // 回合结束
                this.roundEnd();
            }
        },
        roundEnd(){ // 回合结束（动画播放完毕，且buff编辑完毕）
            // 检查是否满足结束条件
            let checkEndResult = this.checkEnd();
            if(checkEndResult){ // 战斗结束
                this.battleEnd(checkEndResult);
            }
            else{ // 战斗未结束
                let curUnit = this.curUnitList[this.curUnitListIndex];
                let oCurUnit = this.getUnit(curUnit.id);
                // console.log(`单位回合结束`,curUnit.btd.name);
                // 清除画布的 response trigger
                this.$refs.ani&&this.$refs.ani.resetResponseTrigger();
                // 清除当前行动者标识
                oCurUnit.btd.cur = 0;
                // 清除当前行动者冗余数据
                oCurUnit.tickCount = 0;
                oCurUnit.overflowMove = 0;
                // 清除编辑buff弹窗数据
                this.editBuffUnitList = [];
                this.editBuffUnitIndex = -1;
                this.editBuffList = [];
                this.editLevel = 0;
                // 获取本帧的下一个行动者
                this.curUnitListIndex++;
                let nextCurUnit = this.curUnitList[this.curUnitListIndex];
                let oNextCurUnit;
                if(nextCurUnit&&nextCurUnit.id){
                    oNextCurUnit = this.getUnit(nextCurUnit.id);
                }
                if(oNextCurUnit&&!oNextCurUnit.btd.out){ // 如果存在下一个行动者，且他存活，则开始他的回合
                    // console.log(`存在下一个行动者，且他存活，则开始他的回合`,this.curUnitList);
                    this.roundStart(oNextCurUnit);
                }
                else{ // 如果不存在下一个本帧行动者，所有人继续读行动条
                    // console.log(`不存在下一个本帧行动者，所有人继续读行动条`);
                    this.goPageState(2);
                }
            }
        },
        battleEnd(result=0){ // 战斗结束
            if(result==1){ // 获胜
                this._alert(`获胜！`);
            }
            else if(result==2){ // 战败
                this._alert(`战败...`);
            }
            else if(result==3){ // 撤离
                this.boardTip(`撤离成功！`);
            }
            this.goPageState(99);
            let resultData = {
                result,
                battle: this.battle,
                playerTeam: this.playerTeam,
                enemyTeam: this.enemyTeam,
                bonusRate: this.bonusRate,
                roundCount: this.roundCount,
            };
            window.GLOBAL.battleResult = resultData;
            this.timerList.push(setTimeout(_=>{
                this.$router.push('home');
            },1000));
        },

        /* 快捷功能 */
        _alert(text,time){ // 弹出提示
            this.$refs.toast.trigger(text,time);
        },
        boardTip(text){ // 公共信息提示
            this.boardText = text;
        },
        resetMenu(){ // 重置Menu
            this.menuData.state = 0;
            this.menuData.unitList = [];
            this.menuData.tip = '';
            this.menuData.extip = '';
            this.menuData.expand = 0;
            this.menuData.unitOptionType = 0;
            this.menuData.unitOptionData = {};
            this.menuData.stateRecordList = [];
        },
        resetFlee(){ // 重置撤离数据
            this.isFleeing = 0;
            this.fleeMove = 0;
            this.totalFleeMove = 1;
        },
        clearAllTimers(){ // 清除所有计时器
            for(let timer of this.timerList){
                clearTimeout(timer);
                timer = null;
            }
        },
        getAllAliveUnits(){ // 获取所有存活单位
            let allUnits = [...this.playerTeam,...this.enemyTeam];
            return getSubMatchList(allUnits,[['out',0]],'btd');
        },
        getUnit(id){ // 根据unitId获取unit
            let allUnits = [...this.playerTeam,...this.enemyTeam];
            return getMatchList(allUnits,[['id',id]])[0];
        },
        checkEnd(){ // 检查胜负 0未结束 1我方获胜 2敌人获胜 3撤离成功
            let res = 0;
            if(this.mode==4){ // 营地模式
                return res;
            }
            let playerDefeat = 1, enemyDefeat = 1;
            for(let unit of this.playerTeam){
                if(!unit.btd.out){
                    playerDefeat = 0;
                    break;
                }
            }
            for(let unit of this.enemyTeam){
                if(!unit.btd.out){
                    enemyDefeat = 0;
                    break;
                }
            }
            if(playerDefeat&&enemyDefeat){
                res = 3;
            }
            else if(enemyDefeat){
                res = 1;
            }
            else if(playerDefeat){
                res = 2;
            }
            return res;
        },
        checkMenuButtonBan({flag,checkCrumble=0,}){ // 检查菜单的基本操作按钮是否该禁用
            let res = 0;
            let consume = CONFIG.baseConsumeList[flag-1];
            let curUnit = this.curUnitList[this.curUnitListIndex];
            if(this.mode==4&&flag==8){ // 营地模式撤离不需要消耗体力
                consume = 0;
            }
            // 体力不够时禁止防御
            if(consume>(curUnit.btd.phy[0]+curUnit.btd.eng[0])){
                res = 1;
            }
            if(checkCrumble){
                // 心理奔溃时禁止防御
                if(common.isCrumble(curUnit)){
                    res = 1;
                }
            }
            // 没有防御力的情况下禁止防御
            if(flag==1&&curUnit.btd.def[1]<=0){
                res = 1;
            }
            if(this.mode==4&&(flag==3||flag==5||flag==6||flag==7)){
                res = 1;
            }
            // BOSS战禁止撤离
            if(this.mode==2&&flag==8){
                res = 1;
            }
            return res;
        },
        checkSubMenuButtonBan({unit,data}){ // 检查菜单的攻击和技能按钮是否该禁用
            return !common.canConsume({unit,consume:common.calcConsume({type:1,unit,data,})});
        },

        painAction({dmg,unit,}){ // 结算常规伤害
            let penetrate = 0;
            let { defPain, hpPain, } = common.calcPain({unit,dmg,}); // pain = { defPain, hpPain, }
            unit.btd.changes.def -= defPain;
            if(hpPain>0){ // 破防，掉血
                unit.btd.changes.hp -= hpPain;
                this.registerAniEffect(201,unit);
                penetrate = 1;
            }
            return penetrate;
        },
        consumeAction({consume,unit,convert=1,}){ // 单位动作消耗体力并计算 changes
            let res = 0;
            // 执行结算
            unit.btd.changes.phy -= consume;
            if(consume>unit.btd.phy[0]){ // 破限，掉精
                res = consume-unit.btd.phy[0];
                unit.btd.changes.eng -= res;
                this.registerAniEffect(201,unit);
            }
            // 把消耗转化为潜能
            if(convert){
                unit.btd.changes.ptc += common.calcPotencyByConsume({unit,consume,});
            }
            return res;
        },
        mentalAttackAction({dmg,unit,}){ // 结算单位受到的心理攻击
            let buff;
            // 专注bufff
            if(buff=common.getBuff(unit,21)){
                dmg = common.calcFocusBuff({dmg,buff,});
            }
            unit.btd.changes.mdef -= dmg;
            this.registerAniEffect(201,unit);
        },
        stealAction({caster,target,gold,}){ // 结算偷钱行为
            let gain = gold;
            gain = setInRange(gain,0,target.btd.money);
            if(gain>0){
                target.btd.changes.money -= gain;
                caster.btd.changes.money += gain;
                this.registerAniEffect(201,target);
                this.registerAniEffect(201,caster);
            }
        },

        enviorDamage(){ // 战意流失：环境对我方全员造成心理伤害
            let { mentalDmg, eDmgCount, happen, } = common.calcEnviorDamage(this.roundCount);
            if(happen){
                let allAliveUnits = this.getAllAliveUnits();
                for(let unit of allAliveUnits){
                    if(unit.btd.isPlayer){
                        unit.btd.changes.mdef -= mentalDmg;
                        this.registerAniEffect(201,unit);
                    }
                }
                this._alert(`触发第 ${eDmgCount} 次环境崩溃`,5);
            }
        },
        attackOnTarget({caster,target,attack,hit=0,skill}){ // 单位受到攻击并计算 changes，hit是否确定命中
            let hitBuffActions = ({dmg,}) =>{ // 结算所有的 buff 效果
                let buff;

                if(buff=common.getBuff(caster,7)){ // 财迷bufff
                    let goldDmg = common.calcStealBuff({buff,});
                    this.stealAction({ caster, target, gold:goldDmg, });
                }

                if(buff=common.getBuff(caster,8)){ // 架势bufff
                    let defRecover = common.calcPoseBuff({target,buff,});
                    target.btd.changes.def += defRecover;
                }

                if(buff=common.getBuff(caster,9)){ // 通畅bufff
                    let phyRecover = common.calcAuraBuff({target,buff,});
                    target.btd.changes.phy += phyRecover;
                }

                if(buff=common.getBuff(caster,10)){ // 狂暴bufff
                    let movRecover = common.calcRageBuff({buff,});
                    target.btd.changes.mov += movRecover;
                    this.registerAniEffect(102,target);
                }

                if(buff=common.getBuff(caster,11)){ // 反伤bufff
                    let rebounceDmg = common.calcRebounceBuff({buff,dmg,});
                    this.painAction({unit:caster,dmg:rebounceDmg,});
                }

                if(buff=common.getBuff(caster,12)){ // 嗜血bufff
                    let hpRecover = common.calcDrainingBuff({buff,dmg,});
                    caster.btd.changes.hp += hpRecover;
                    this.registerAniEffect(201,caster);
                }

                if(buff=common.getBuff(caster,16)){ // 亢奋bufff
                    let phyRecover = common.calcExcitedBuff({buff,dmg,});
                    caster.btd.changes.phy += phyRecover;
                }

                if(buff=common.getBuff(caster,18)){ // 战气bufff
                    let phyDmg = common.calcMoraleBuff({buff,});
                    this.consumeAction({unit:target,consume:phyDmg,convert:0,});
                }

                if(buff=common.getBuff(caster,19)){ // 霸气bufff
                    let ptcDmg = common.calcAweBuff({buff,});
                    target.btd.changes.ptc -= ptcDmg;
                    this.registerAniEffect(103,target);
                }

                if(buff=common.getBuff(caster,20)){ // 威慑bufff
                    let mentalDmg = common.calcMenaceBuff({caster,buff,});
                    this.mentalAttackAction({unit:target,dmg:mentalDmg,});
                }

                if(buff=common.getBuff(caster,102)){ // 出血bufff
                    let hpDmg = common.calcBleedBuff({caster,buff,});
                    caster.btd.changes.hp -= hpDmg;
                    this.registerAniEffect(51,caster);
                }

                if(buff=common.getBuff(target,108)){ // 悬赏bufff
                    let goldPain = common.calcBountyBuff({dmg,buff,});
                    this.stealAction({ caster, target, gold:goldPain, });
                }

                if(buff=common.getBuff(caster,114)){ // 鲁莽bufff
                    let defLose = common.calcOpeningBuff({caster,buff,});
                    caster.btd.changes.def -= defLose;
                }

                if(buff=common.getBuff(caster,115)){ // 破气bufff
                    let ptcLose = common.calcKiBreakBuff({buff,});
                    caster.btd.followChanges.ptc -= ptcLose;
                    this.registerAniEffect(103,caster,1);
                }

                if(buff=common.getBuff(target,117)){ // 促息bufff
                    let phyLose = common.calcHasteBuff({buff,});
                    target.btd.changes.phy -= phyLose;
                }

                if(buff=common.getBuff(target,118)){ // 麻痹bufff
                    let ptcLose = common.calcParalysisBuff({buff,});
                    target.btd.followChanges.ptc -= ptcLose;
                    this.registerAniEffect(103,target,1);
                }
            }

            if(hit||common.calcHit({caster,target})){ // 命中，结算伤害
                let btd = target.btd;
                let changes = btd.changes;
                let penetrate = 0; // 是否穿透防御

                changes.domAni = "shake";

                // 推送攻击画布动画
                this.registerAniEffect(attack.et+(skill?10:0),target);

                 // 计算伤害
                let dmg = common.calcAttackDmg({caster,attack,isSkill:skill,});

                // 破盾sppp
                if(attack.s&&attack.s==2&&r(1,100)<CONFIG.spAttackRate){
                    let extraTrueDmg = Math.round(dmg*CONFIG.spLevelMap[1][attack.sl-1]); // 额外增加的真实伤害值
                    if(extraTrueDmg>0){
                        this.registerAniEffect(201,target);
                        this.registerAniEffect(105,target);
                        penetrate = 1;
                        changes.hp -= extraTrueDmg;
                    }
                }

                // 结算伤害
                let hpDamaged = this.painAction({unit:target,dmg,});
                if(!penetrate&&hpDamaged){
                    target.btd.penetrated = 1;
                }

                // 其他sppp
                if(attack.s&&r(1,100)<CONFIG.spAttackRate){
                    if(attack.s==1){ // 压制sppp，计算行动力下降值
                        let movDmg = common.calcQuellSpDmg({caster,target,attack,dmg});
                        if(movDmg>0){
                            changes.mov -= movDmg;
                            this.registerAniEffect(102,target);
                        }
                    }
                    else if(attack.s==3){ // 气溃sppp，计算潜能伤害
                        let ptcDmg = common.calcPotencySpDmg({caster,target,attack,dmg});
                        if(ptcDmg>0){
                            changes.ptc -= ptcDmg;
                            this.registerAniEffect(103,target);
                        }
                    }
                    else if(attack.s==4){ // 漩流sppp，计算体力伤害
                        let phyDmg = common.calcVortexSpDmg({caster,target,attack,dmg});
                        if(phyDmg>0){
                            let engReduction = this.consumeAction({unit:target,consume:phyDmg,convert:0,});
                            if(engReduction>0){
                                this.registerAniEffect(201,target);
                            }
                        }
                    }
                    else if(attack.s==6){ // 攻心sppp，计算心灵伤害
                        let mentalDmg = common.calcMentalSpDmg({caster,target,attack,dmg});
                        if(mentalDmg>0){
                            this.mentalAttackAction({unit:target,dmg:mentalDmg});
                        }
                    }
                    else if(attack.s==7){ // 偷窃sppp，计算金币伤害
                        let goldDmg = common.calcGoldSpDmg({caster,target,attack,dmg,});
                        if(goldDmg>0){
                            this.stealAction({ caster, target, gold:goldDmg, });
                        }
                    }
                }

                // 如果穿透防御，则添加buff
                if((target.btd.penetrated||(target.btd.hp[0]<target.btd.hp[1]))&&attack.b){
                    for(let i=0;i<attack.b.length;i++){
                        let buffId = attack.b[i], buffLevel = attack.bl[i];
                        target.btd.changes.buffList.push({ id:buffId, level:buffLevel, });
                    }
                }

                hitBuffActions({dmg,});

                // 撤离失败
                if(target.btd.isPlayer&&this.isFleeing){
                    this.resetFlee();
                    this._alert(`撤离失败`);
                }
            }
            else{ // 未命中
                this.registerAniEffect(106,target);
            }
            if(attack.s&&attack.s==5&&r(1,100)<CONFIG.spAttackRate){ // 锁敌sppp
                this.registerAniEffect(104,target);
                target.btd.changes.dge += CONFIG.spLevelMap[4][attack.sl-1];
            }
        },

        /* 动画相关 */
        playDomAni(unit,aniName){ // 播放单位DOM元素动作
            let vdom = this.$refs[`u-${unit.id}`][0];
            if(vdom){
                vdom.trigAni(aniName);
            }
        },
        playAni({caster,target,effectType,number,delay=0}){ // 播放‘单动画’
            /*
                effectType: 5,// 1slash 2smash 3bullet 4range 5fire 6thunder 7cure 8power 9pure 10mental
                // 11重slash 12重smash 13重bullet 14重range 15重fire 16重thunder 50shield
                // 102行动力 103潜能 104存在感 105破盾 106miss
                // 201浮动数字（血|精|心|钱）
                number: 1||{}, // { hp:0, eng:0, mdef:0, money:0, }
                delay: 0,
            */
            let casterPos = this.getUnitDomPos(caster.id);
            let targetPos = this.getUnitDomPos(target.id);

            let params;
            let aniName, textList = [];

            switch(effectType){
                case 1:
                    aniName = `attack-slash`;
                break;
                case 2:
                    aniName = `attack-smash`;
                break;
                case 3:
                    aniName = `attack-bullet`;
                break;
                case 4:
                    aniName = `attack-range`;
                break;
                case 5:
                    aniName = `attack-fire`;
                break;
                case 6:
                    aniName = `attack-thunder`;
                break;
                case 7:
                    aniName = `protect-cure`;
                break;
                case 8:
                    aniName = `protect-power`;
                break;
                case 9:
                    aniName = `protect-pure`;
                break;
                case 10:
                    aniName = `attack-mental`;
                break;

                case 11:
                    aniName = `attack-slash-heavy`;
                break;
                case 12:
                    aniName = `attack-smash-heavy`;
                break;
                case 13:
                    aniName = `attack-bullet-heavy`;
                break;
                case 14:
                    aniName = `attack-range-heavy`;
                break;
                case 15:
                    aniName = `attack-fire-heavy`;
                break;
                case 16:
                    aniName = `attack-thunder-heavy`;
                break;

                case 50:
                    aniName = `protect-shield`;
                break;
                case 51:
                    aniName = `attack-blood`;
                break;

                case 201: // 通用浮动数字，涉及到数值
                    aniName = `number-common`;
                    if(number.eng){
                        textList.push({val:number.eng,colorType:3});
                    }
                    if(number.mdef){
                        textList.push({val:number.mdef,colorType:4});
                    }
                    if(number.money){
                        textList.push({val:number.money,colorType:8});
                    }
                    if(number.hp){
                        let colorType = number.hp>0?1:2;
                        textList.push({val:number.hp,colorType});
                    }
                break;
                case 102: // 压制，涉及到数值
                    aniName = `number-quell`;
                    textList.push({val:number,});
                break;
                case 103: // 气溃，涉及到数值
                    aniName = `number-potency-damage`;
                    textList.push({val:number,});
                break;
                case 104: // 锁敌，涉及到数值
                    aniName = `number-lock-on`;
                    textList.push({val:number,});
                break;
                case 105: // 破盾，涉及到数值
                    aniName = `text`;
                    textList.push({val:'破',colorType:9,fontSize:.6,});
                break;
                case 106: // miss
                    aniName = `text`;
                    textList.push({val:'miss',colorType:8,fontSize:.66});
                break;
            };
            params = {
                name: aniName,
                fromX: casterPos.x,
                fromY: casterPos.y,
                toX: targetPos.x,
                toY: targetPos.y,
                response: this.onAnimationResponse,
                delay,
            }
            if(textList.length>0){
                params.textList = textList;
            }
            // console.log(`播放‘单动画’参数，`,params);
            this.$refs.ani&&this.$refs.ani.trigger(params);
        },
        pushAniByChanges({caster,target,}){ // 根据 changes 和 followChanges 生成并推送多个‘单动画数据’进入aniList用于稍后播放
            let changes = target.btd.changes;
            let followChanges = target.btd.followChanges;
            let effectTypeList = changes.effectTypeList;
            let followEffectTypeList = followChanges.effectTypeList;
            // console.log(`根据 changes 和 followChanges 生成并推送多个‘单动画数据’进入aniList用于稍后播放`,caster.btd.name,effectTypeList,followEffectTypeList);
            let pushEffect = (effectType,changes,delay=0) =>{
                if((effectType>0&&effectType<99)||effectType==105||effectType==106){ // 动画效果+破盾+miss
                    this.aniList.push({caster,target,effectType,delay,});
                }
                else if(effectType==201&&(changes.hp||changes.eng||changes.mdef||changes.money)){ // 通用数字（血精心钱）
                    this.aniList.push({caster,target,effectType:201,number:changes,delay,});
                }
                else if(effectType==102&&changes.mov){ // 特殊数字·行动力
                    this.aniList.push({caster,target,effectType:102,number:changes.mov,delay,});
                }
                else if(effectType==103&&changes.ptc){ // 特殊数字·潜能
                    this.aniList.push({caster,target,effectType:103,number:changes.ptc,delay,});
                }
                else if(effectType==104&&changes.dge){ // 特殊数字·存在感
                    this.aniList.push({caster,target,effectType:104,number:changes.dge,delay,});
                }
            }
            for(let effectType of effectTypeList){
                pushEffect(effectType,changes);
            }
            for(let effectType of followEffectTypeList){
                pushEffect(effectType,followChanges,CONFIG.followChangesDelay);
            }
        },
        registerAniEffect(type,unit,follow=0,){ // 为单位的 changes（或followChanges） 添加 effectType，用于播放画布动画
            let changesName = follow?'followChanges':'changes';
            if(arrContains(unit.btd[changesName].effectTypeList,type)==-1){
                unit.btd[[changesName]].effectTypeList.push(type);
                // console.log(`!!!!!!!!!!!${unit.btd.name}`,unit.btd.changes.effectTypeList);
            }
        },
        getUnitDomPos(id){ // 获取单位dom的坐标
            let vdom = this.$refs[`u-${id}`][0];
            if(vdom){
                let dom = vdom.getIconVDom();
                let rect = dom.getBoundingClientRect();
                return {
                    x: Math.round((rect.left+rect.right)/2),
                    y: Math.round((rect.top+rect.bottom)/2),
                };
            }
            else{
                return false;
            }
        },
        onAnimationResponse(){ // 当动画中途回应
            let allAliveUnits = this.getAllAliveUnits();
            for(let unit of allAliveUnits){ // 保存 changes 和 followChanges：根据所有单位的 changes 和 followChanges 改变其数据
                common.saveUnitChanges(unit);
                common.saveUnitFollowChanges(unit);
                common.saveUnitOutState(unit);
            }
            this.forceUpdatePage();
        },

        /* 单位动作 */
        unitAction({caster,type,targetUnitList,burstAttr,skill,attack}){ // 单位执行动作
            /*action = {
                type: 1, // 动作类型 1攻击 2技能 3防御 4躲避 5追踪 6调息 7集气 8爆气 9话术 10撤离
                burstAttr: 1, // 4力量 5精准 6速度 7智力 8定力 9隐蔽 10爆发
                targetUnitList: [], // 目标单位数组
            }*/
            this.resetMenu();
            let oTargetUnitList = [], oCaster = this.getUnit(caster.id);
            if(targetUnitList&&targetUnitList.length){
                for(let target of targetUnitList){
                    oTargetUnitList.push(this.getUnit(target.id));
                }
            }
            switch(type){
                case 1: // 进行攻击
                    this.boardTip(`${oCaster.btd.name} 进行攻击`);
                    this.unitAttack(oCaster,attack,oTargetUnitList);
                break;
                case 2: // 施放技能
                    this.boardTip(`${oCaster.btd.name} 发动 ${skill.n}`);
                    this.unitSpell(oCaster,skill,oTargetUnitList);
                break;
                case 3: // 防御
                    this.boardTip(`${oCaster.btd.name} 恢复了防御`);
                    this.unitDefense(oCaster);
                break;
                case 4: // 躲避
                    this.boardTip(`${oCaster.btd.name} 降低了存在感`);
                    this.unitDodge(oCaster);
                break;
                case 5: // 追踪
                    this.boardTip(`${oCaster.btd.name} 进行追踪`);
                    this.unitTrace(oCaster);
                break;
                case 6: // 调息
                    this.boardTip(`${oCaster.btd.name} 恢复了体力`);
                    this.unitBreath(oCaster);
                break;
                case 7: // 集气
                    this.boardTip(`${oCaster.btd.name} 提升了潜能`);
                    this.unitConcentrate(oCaster);
                break;
                case 8: // 爆气
                    this.boardTip(`${oCaster.btd.name} 消耗潜能提升了 ${CONFIG.attrMap[burstAttr]}`);
                    this.unitBurst(oCaster,burstAttr);
                break;
                case 9: // 话术
                    this.boardTip(`${oCaster.btd.name} 进行心理攻击`);
                    this.unitPersuade(oCaster,oTargetUnitList);
                break;
                case 10: // 撤离
                    this.boardTip(`${oCaster.btd.name} 准备撤离了`);
                    this.unitFlee(oCaster);
                break;
            }
        },
        unitAttack(caster,attack,targetUnitList){ // 单位进行攻击

            caster.btd.changes.domAni = "cast";

            // 攻击者体力消耗
            let consume = common.calcConsume({type:1,unit:caster,data:attack,});
            this.consumeAction({consume,unit:caster,});
            if(consume>0){
                this.registerAniEffect(103,caster);
            }

            // 攻击者存在感上升
            let dodgeup = common.calcAttackDodgeup({unit:caster,});
            caster.btd.changes.dge += dodgeup;
            this.registerAniEffect(104,caster);

            this.registerAniEffect(201,caster);

            // 遍历每个攻击目标单位
            for(let target of targetUnitList){
                this.attackOnTarget({caster,target,attack,});
            }

            // 回合后置动作
            this.unitRoundEpilog(caster);
        },
        unitSpell(caster,skill,targetUnitList){ // 单位施放技能

            caster.btd.changes.domAni = "cast";

            console.log(skill.n,skill);

            // 施放者体力消耗
            let consume = common.calcConsume({type:1,unit:caster,data:skill,});
            this.consumeAction({consume,unit:caster,});
            if(consume>0){
                this.registerAniEffect(103,caster);
            }

            if(skill.t>2){ // 目标为敌人，攻击者存在感上升
                let dodgeup = common.calcSkillDodgeup({unit:caster,skill,});
                caster.btd.changes.dge += dodgeup;
                this.registerAniEffect(104,caster);
            }

            this.registerAniEffect(201,caster); // 注册通用数字动画

            // 遍历每个攻击目标单位
            for(let target of targetUnitList){
                let hit = common.calcHit({caster,target});
                if(!hit){ // 技能未命中
                    this.registerAniEffect(106,target);
                }
                else{ // 技能命中
                    for(let e of skill.el){ // 遍历技能的每个效果 1攻击 2添加状态 3减弱一个状态 4治疗 5改甲 6改潜 7改心 8改存
                        let { t, d, } = e;
                        if(t==1){ // 攻击
                            this.attackOnTarget({caster,target,attack:d,hit,skill,});
                            this.boardSkill = skill;
                        }
                        else if(t==2){ // 添加状态
                            let { b, bl, } = d;
                            if((target.btd.hp[0]<target.btd.hp[1])||target.btd.penetrated){ // 如果 target 已掉血或者已被破防
                                // 祝福bufff
                                let blessBuff = common.getBuff(target,3);

                                // 诅咒bufff
                                let curseBuff = common.getBuff(target,103);

                                for(let i=0;i<b.length;i++){
                                    let canBuff = 1; // target是否可以获得这个buff
                                    let buffId = b[i], buffLevel = bl[i];
                                    let oBuff = common.getConfigBuff(buffId);
                                    if(!oBuff.good&&blessBuff&&buffLevel<=blessBuff.level){ // 祝福bufff抵挡负面buff
                                        canBuff = 0;
                                        this._alert(`祝福免疫`);
                                    }
                                    if(oBuff.good&&curseBuff&&buffLevel<=curseBuff.level){ // 诅咒bufff抵挡正面buff
                                        canBuff = 0;
                                        this._alert(`诅咒侵蚀`);
                                    }
                                    if(canBuff){ // 可以获得buff
                                        target.btd.changes.buffList.push({ id:buffId, level:buffLevel, });
                                        this.registerAniEffect(oBuff.good?50:10,target);
                                        target.btd.changes.domAni = oBuff.good?'strand':'shake';
                                    }
                                }
                            }
                        }
                        else if(t==3||t==4){ // 减弱状态
                            let editBuffList = getMatchList(target.btd.buffList,[['good',t==3?1:0]]);
                            if(editBuffList.length>0){ // 如果 target 身上有符合条件的buff
                                if(caster.btd.isPlayer){ // 施放者是玩家
                                    this.editLevel = d;
                                    this.editBuffUnitList.push(target);
                                    this.editBuffUnitIndex++;
                                    this.editBuffList = editBuffList;
                                }
                                else{ // 施放者是AI
                                    let weakenBuff = ai.getWeakenBuff({caster,target,buffList:editBuffList,reduceLevel:d,});
                                    target.btd.changes.weakenBuff = { id:weakenBuff.id, level:d, };
                                }
                            }
                            if(t==3){ // 有利
                                this.registerAniEffect(10,target);
                                target.btd.changes.domAni = 'shake';
                            }
                            else{ // 有害
                                this.registerAniEffect(50,target);
                                target.btd.changes.domAni = 'strand';
                            }
                        }
                        else if(t==5){ // 治疗
                            let cureDmg = common.calcCure({caster,target,data:d,});
                            target.btd.changes.hp += cureDmg;

                            this.registerAniEffect(7,target);
                            this.registerAniEffect(201,target);
                            target.btd.changes.domAni = 'strand';
                        }
                        else if(t==6){ // 改变护甲（弃用）

                        }
                        else if(t==7){ // 改变潜能
                            let ptcAlt = common.calcPotencyAlteration({target,data:d,});
                            target.btd.changes.ptc += ptcAlt;
                            this.registerAniEffect(103,target);
                            this.registerAniEffect(ptcAlt>0?8:10,target);
                            target.btd.changes.domAni = skill.t==3?'shake':'strand';
                        }
                        else if(t==8){ // 改变心理防御
                            let mentalAlt = common.calcMentalAlteration({caster,target,data:d,});
                            this.mentalAttackAction({unit:target,dmg:-mentalAlt});
                            this.registerAniEffect(mentalAlt>0?8:10,target);
                            target.btd.changes.domAni = skill.t==3?'shake':'strand';
                        }
                    }
                    if(target.btd.isPlayer&&this.isFleeing){
                        this.resetFlee();
                        this._alert(`撤离失败`);
                    }
                }
                // 不论是否命中，执行存在感增减
                for(let e of skill.el){
                    let { t, d, } = e;
                    if(t==9){
                        let dodgeAlt = common.calcDodgeAlteration({target,data:d,});
                        target.btd.changes.dge += dodgeAlt;
                        this.registerAniEffect(104,target);
                        this.registerAniEffect(dodgeAlt<0?8:10,target);
                        target.btd.changes.domAni = skill.t==3?'':'strand';
                    }
                }
            }

            // 回合后置动作
            this.unitRoundEpilog(caster);
        },
        unitDefense(caster){ // 单位防御
            if(!common.isCrumble(caster)){
                let defRecover = common.calcDef({caster,});
                caster.btd.def[0] += defRecover;
                caster.btd.def[0] = setInRange(caster.btd.def[0],0,caster.btd.def[1]);
                caster.btd.changes.domAni = "strand";
            }
            else{
                this.boardTip(`${caster.btd.name} 心理防御奔溃，无法恢复防御`);
            }
            if(this.consumeAction({consume:CONFIG.baseConsumeList[0],unit:caster,})){ // 结算消耗
                this.registerAniEffect(201,caster);
            }
            this.unitRoundEpilog(caster);
        },
        unitDodge(caster){ // 单位躲避
            if(!common.isCrumble(caster)){
                let dodgeValue = common.calcDodge({caster});
                caster.btd.changes.dge -= dodgeValue;
                caster.btd.changes.domAni = "strand";
                this.registerAniEffect(104,caster);
            }
            else{
                this.boardTip(`${caster.btd.name} 心理防御奔溃，无法躲避`);
            }
            if(this.consumeAction({consume:CONFIG.baseConsumeList[1],unit:caster,})){ // 结算消耗
                this.registerAniEffect(201,caster);
            }
            this.unitRoundEpilog(caster);
        },
        unitTrace(caster){ // 单位追踪
            let enemyAliveTeam = getSubMatchList(caster.btd.isPlayer?this.enemyTeam:this.playerTeam,[['out',0]],'btd');
            let sfdEnemyList = shuffle(enemyAliveTeam);
            let sortedEnemy = bulbsort2(sfdEnemyList,'btd','dge',1);
            let target = sortedEnemy[0];
            if(target){
                caster.btd.changes.domAni = "cast";
                target.btd.changes.dge += CONFIG.dodgeupByTrace;
                if(this.consumeAction({consume:CONFIG.baseConsumeList[2],unit:caster,})){
                    this.registerAniEffect(201,caster);
                }
                this.registerAniEffect(104,target);
            }
            this.unitRoundEpilog(caster);
        },
        unitBreath(caster){ // 单位调息
            let phyRecover = common.calcBreathValue({caster,});
            caster.btd.changes.phy += phyRecover;
            caster.btd.changes.domAni = "strand";
            if(common.isCrumble(caster)){
                this.boardTip(`${caster.btd.name} 心理防御奔溃，体力最多恢复到1点`);
            }
            this.unitRoundEpilog(caster);
        },
        unitConcentrate(caster){ // 单位集气
            let potencyValue = common.calcConcentrate({caster});
            caster.btd.changes.ptc += potencyValue;
            caster.btd.changes.domAni = "strand";
            if(this.consumeAction({consume:CONFIG.baseConsumeList[4],unit:caster,})){
                this.registerAniEffect(201,caster);
            }
            this.registerAniEffect(103,caster);
            this.unitRoundEpilog(caster);
        },
        unitBurst(caster,attr){ // 单位爆气
            caster.btd.attrs[attr] += Math.floor(caster.btd.ptc/10000*caster.btd.attrs[attr]);
            caster.btd.changes.ptc -= caster.btd.ptc;
            caster.btd.changes.domAni = "strand";
            if(this.consumeAction({consume:CONFIG.baseConsumeList[5],unit:caster,})){
                this.registerAniEffect(201,caster);
            }
            this.registerAniEffect(9,caster);
            this.unitRoundEpilog(caster);
        },
        unitPersuade(caster,targetUnitList){ // 单位话术
            if(this.consumeAction({consume:CONFIG.baseConsumeList[6],unit:caster,})){ // 结算消耗
                this.registerAniEffect(201,caster);
            }
            if(!common.isCrumble(caster)){
                caster.btd.changes.domAni = "cast";

                // 发动者存在感提升
                let dodgeup = common.calcPersuadeDodgeup({unit:caster,});
                caster.btd.changes.dge += dodgeup;

                this.registerAniEffect(201,caster);

                // 遍历每个目标对象
                for(let target of targetUnitList){
                    let hit = common.calcHit({caster,target});
                    if(!hit){ // 话术未命中
                        this.registerAniEffect(106,target);
                    }
                    else{ // 话术命中
                        let psyValue = common.calcPersuade({caster,target,});
                        target.btd.changes.domAni = "shake";
                        if(caster.btd.isPlayer){ // 施放者是玩家，则给目标添加屈服标识
                            target.btd.changes.capitulate = 1;
                        }
                        this.mentalAttackAction({unit:target,dmg:psyValue});
                        this.boardTip(`${caster.btd.name} 对 ${target.btd.name} 说：“${CONFIG.balderdashs[r(0,CONFIG.balderdashs.length-1)]}”`);
                    }
                }
            }
            else{
                this.boardTip(`${caster.btd.name} 心理防御奔溃，无法使用话术`);
            }
            this.unitRoundEpilog(caster);
        },
        unitFlee(caster){ // 单位撤离
            if(this.mode==4){ // 营地模式
                this.battleEnd();
            }
            else{ // 非营地模式
                let allEnemyUnits = [...this.enemyTeam];
                let allAliveEnemyUnits = getSubMatchList(allEnemyUnits,[['out',0]],'btd');
                let fleeMoveIncresement = 0; // 所有存活敌方单位的速度总和
                for(let unit of allAliveEnemyUnits){
                    fleeMoveIncresement += common.getSpeed(unit);
                }
                this.isFleeing = 1;
                this.totalFleeMove = fleeMoveIncresement*CONFIG.fleeTotalMoveFactor;
                if(this.consumeAction({consume:CONFIG.baseConsumeList[7],unit:caster,})){ // 结算消耗
                    this.registerAniEffect(201,caster);
                }
                this.unitRoundEpilog(caster);
            }
        },

        /* 点击事件 */
        onTapStartBattle(){ // 点击【开始战斗】
            this.goPageState(2);
        },
        onTapUnit(data){ // 点击【单位图标】
            let { flag, unit, buff, } = data;
            let btd = unit.btd;
            if(flag==1){ // 点击单位
                // this._alert(`${btd.name}`);
            }
            else if(flag==2){ // 点击buff
                this._alert(`${buff.name}（强度${buff.level}）：${buff.desc}`,5);
            }
            else if(flag==101){ // 点击血条
                // this._alert(`生命力: ${btd.hp[0]} / ${btd.hp[1]}`);
            }
            else if(flag==102){ // 点击精条
                // this._alert(`精力: ${btd.eng[0]} / ${btd.eng[1]}`);
            }
            else if(flag==103){ // 点击行动条
                this._alert(`行动进度: ${Math.round(btd.mov/100)} %`);
            }
            else if(flag==104){ // 点击气条
                this._alert(`潜力累积： ${Math.round(btd.ptc/100)} %`);
            }
            else if(flag==105){ // 点击躲避条
                this._alert(`存在感： ${Math.round(btd.dge/100)} %`);
            }
            else if(flag==106){ // 点击头像
                let allUnits = [...this.playerTeam,...this.enemyTeam];
                let _unit = cloneObj(getMatchList(allUnits,[['id',unit.id]])[0]);
                this.viewingUnit = _unit;
            }
        },
        onTapPop(){ // 点击【弹窗-关闭】
            this.viewingUnit = null;
            this.showMenuGuide = 0;
        },
        onTapEditBuff(buff){ // 点击【弹窗-状态编辑弹窗-状态按钮】
            this._alert(`将 ${this.editBuffUnitList[this.editBuffUnitIndex].btd.name} 的 ${buff.name} 状态削减 ${this.editLevel} 层。`,5);
            let oUnit = this.getUnit(this.editBuffUnitList[this.editBuffUnitIndex].id);
            common.weakenBuffFrom({buffId:buff.id,buffLevel:this.editLevel,unit:oUnit});
            this.roundEnd();
        },
        onTapMenuHelp(){ // 点击【菜单-？】
            this.showMenuGuide = !this.showMenuGuide;
        },
        onTapMenuExpand(){ // 点击【菜单-展开】
            this.menuData.expand = !this.menuData.expand;
        },
        onTapMenuBack(){ // 点击【菜单-退后】
            this.menuData.extip = ``;
            this.menuData.state = this.menuData.stateRecordList[this.menuData.stateRecordList.length-1];
            this.menuData.stateRecordList.pop();
        },
        onTapMenuAttack({flag,data,ban,buffId,buffLevel,sp,spLevel}){ // 点击【菜单-攻击】
            if(flag==1){ // 点击attack图标
                this.onTapMenu({flag:101,data,ban});
            }
            else if(flag==2){ // 点击buff图标
                let buff = common.getConfigBuff(buffId);
                this._alert(`让敌人${buff.name}：${buff.desc}`,5);
            }
            else if(flag==3){ // 点击sp图标
                this._alert(`${CONFIG.spAttackList[sp-1]}：${CONFIG.spAttackDescList[sp-1]}`,5);
            }
        },
        onTapMenuSkill({flag,data,ban,}){ // 点击【菜单-技能】
            this.onTapMenu({flag:102,data,ban});
        },
        onTapMenu({flag,data={},ban,}){ // 点击【执行操作】 0不显示 1基础选项 2攻击选项 3技能选项 4选择单位 5选择属性
            if(ban){
                return;
            }
            let curUnit = this.curUnitList[this.curUnitListIndex];
            if(flag==1){ // 攻击面板
                this.goMenuState(2);
            }
            else if(flag==2){ // 技能面板
                this.goMenuState(3);
            }
            else if(flag==3){ // 防御
                this.unitAction({caster:curUnit,type:3});
            }
            else if(flag==4){ // 躲避
                this.unitAction({caster:curUnit,type:4});
            }
            else if(flag==5){ // 追踪
                this.unitAction({caster:curUnit,type:5});
            }
            else if(flag==6){ // 调息
                this.unitAction({caster:curUnit,type:6});
            }
            else if(flag==7){ // 集气
                this.unitAction({caster:curUnit,type:7});
            }
            else if(flag==8){ // 爆气
                this.goMenuState(5);
            }
            else if(flag==9){ // 话术
                this.menuData.unitOptionType = 3; // 以单位为目标的行动类型：话术
                this.goMenuState(4,{type:1,caster:curUnit});
            }
            else if(flag==10){ // 撤离
                if(this.mode==4){ // 营地模式
                    this.unitFlee(curUnit);
                }
                else{
                    this.unitAction({caster:curUnit,type:10});
                }
            }
            else if(flag==21){ // 选择单位
                switch(this.menuData.unitOptionType){
                    case 1: // 攻击
                        this.unitAction({
                            type: 1,
                            caster: curUnit,
                            attack: this.menuData.unitOptionData,
                            targetUnitList: [data],
                        });
                    break;
                    case 2: // 技能施放
                        this.unitAction({
                            type: 2,
                            caster: curUnit,
                            skill: this.menuData.unitOptionData,
                            targetUnitList: [data],
                        });
                    break;
                    case 3: // 话术
                        this.unitAction({
                            type: 9,
                            caster: curUnit,
                            targetUnitList: [data],
                        });
                    break;
                }
            }
            else if(flag==22){ // 选择属性
                this.unitAction({caster:curUnit,type:8,burstAttr:data});
            }
            else if(flag==101){ // 点击攻击方式
                let attack = data;
                if(attack.a){ // 全体攻击，则直接执行动作
                    this.unitAction({caster:curUnit,type:1,attack,targetUnitList:this.enemyTeam});
                }
                else{ // 普通攻击，则选择目标
                    this.menuData.unitOptionType = 1; // 以单位为目标的行动类型：攻击
                    this.menuData.unitOptionData = attack;
                    this.goMenuState(4,{type:1,caster:curUnit});
                }
            }
            else if(flag==102){ // 点击技能
                let skill = data;
                let target = skill.t;
                if(target==1){ // 自己，则直接执行动作
                    this.unitAction({caster:curUnit,type:2,skill,targetUnitList:[curUnit]});
                }
                else if(target==2){ // 友方，则选择目标
                    this.menuData.unitOptionType = 2; // 以单位为目标的行动类型：技能施放
                    this.menuData.unitOptionData = skill;
                    this.goMenuState(4,{type:2,caster:curUnit});
                }
                else if(target==3){ // 敌方，则选择目标
                    this.menuData.unitOptionType = 2; // 以单位为目标的行动类型：技能施放
                    this.menuData.unitOptionData = skill;
                    this.goMenuState(4,{type:1,caster:curUnit});
                }
            }
        },

        /* 其他 */
        forceUpdatePage(){ // 防止页面刷新停滞
            let oPlayerTeam = cloneObj(this.playerTeam), oEnemyTeam = cloneObj(this.enemyTeam);
            this.playerTeam = [];
            this.enemyTeam = [];
            this.playerTeam = oPlayerTeam;
            this.enemyTeam = oEnemyTeam;
        },
        onTapCheat(flag){ // 点击【作弊】按钮
            if(flag==1){
                for(let unit of this.enemyTeam){
                    unit.btd.mdef = -1;
                }
            }
            this.battleEnd(flag);
            // this.battleEnd(1);
        },
        onTapCanvas1(){
            let cUnit = this.playerTeam[3],tUnit = this.enemyTeam[2],t2Unit = this.enemyTeam[3];
            let c_pos = this.getUnitDomPos(tUnit.id);
            let t_pos = this.getUnitDomPos(cUnit.id);
            let c_vdom = this.$refs[`u-${cUnit.id}`][0], t_vdom = this.$refs[`u-${tUnit.id}`][0], t2_vdom = this.$refs[`u-${t2Unit.id}`][0];

            let x = 250;
            t_vdom.trigAni('cast');
            c_vdom.trigAni('shake');
            // // t2_vdom.trigAni('shake');

            this.$refs.ani.trigger({name:'attack-slash',fromX:c_pos.x, fromY:c_pos.y, toX:t_pos.x, toY:t_pos.y, });
            this.$refs.ani.trigger({name:'number-common',textList:[{val:-135,colorType:3},{val:-229,colorType:2}],fromX:c_pos.x, fromY:c_pos.y, toX:t_pos.x, toY:t_pos.y, });
            // // let tl1 = [{val:'破',colorType:9,fontSize:.6,},];
            // // this.$refs.ani.trigger({name:'text',textList:tl1, fromX:c_pos.x, fromY:c_pos.y, toX:t_pos.x, toY:t_pos.y, });
            // // let tl2 = [{val:-973,colorType:2,},];
            // // this.$refs.ani.trigger({name:'number-common',textList:tl2, fromX:c_pos.x, fromY:c_pos.y, toX:t_pos.x, toY:t_pos.y, });
            // // this.$refs.ani.trigger({name:'number-potency-damage',textList:[{val:3700,},], fromX:c_pos.x, fromY:c_pos.y, toX:t_pos.x, toY:t_pos.y, });
            // // this.$refs.ani.trigger({name:'number-common',textList:[{val:-316,colorType:4},], fromX:c_pos.x, fromY:c_pos.y, toX:t_pos.x, toY:t_pos.y, });
            // this.$refs.ani.trigger({name:'text',textList:[{val:'miss',colorType:10,fontSize:.66},], fromX:c_pos.x, fromY:c_pos.y, toX:t_pos.x, toY:t_pos.y, });
        },
        onTapCanvas2(){

        },
    },
    components:{
        Unit1,
        Unit2,
        Equip,
        Skill,
        Attack,
        Bar1,
        Bar2,
        Buff,
        Ani,
        Pop,
        Toast,
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    @import '../style/public.css';
    @import '../style/battle-menu.css';
    .main{
        position: relative;
        text-align: center;
        width: 100%;
        height: 100%;
        color: #4a4a4a;
        font-size: .24rem;
        line-height: 0;
        background-color: #000;
        /* background-image: url('./../assets/bg-battle.png');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat; */
        box-shadow: 0 0 1.35rem #000 inset;
        overflow-x: hidden;
    }
    .panel{
        position: relative;
        width: 100%;
        height: 100%;
        overflow-y: scroll;
        overflow-x: hidden;
        z-index: 100;
        opacity: 0;
        animation: fadeout .6s .6s ease-in forwards;
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
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        opacity: 1;
        z-index: 1;
        box-shadow: 0 0 4rem 1rem #000 inset;
        animation: bg_fadein .2s .3s ease-in forwards;
    }
    @keyframes bg_fadein {
        to{
            opacity: .3;
        }
    }
    @keyframes fadeout {
        to{
            opacity: 1;
        }
    }
    .purdah{
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        margin: 0;
        width: 100%;
        height: 100%;
        z-index: 2;
    }
    .purdah-left{
        animation: fadeleft .3s ease-in-out forwards;
        /* background-image: linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%); */
        background-image: linear-gradient(to left, rgba(15,15,15,1) 0%, rgba(15,15,15,1) 70%, rgba(15,15,15,0) 100%);
    }
    .purdah-right{
        animation: faderight .3s ease-in-out forwards;
        /* background-image: linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%); */
        background-image: linear-gradient(to right, rgba(15,15,15,1) 0%, rgba(15,15,15,1) 70%, rgba(15,15,15,0) 100%);
    }
    @keyframes fadeleft {
        to{
            left: 100%;
        }
    }
    @keyframes faderight {
        to{
            left: -100%;
        }
    }
    .body{
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 13.75rem;
    }

    .panel-shadow{
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        z-index: 100;
    }
    .panel-shadow-tip{
        width: 100%;
        height: 1rem;
        line-height: .25rem;
        font-size: .32rem;
    }

    /* 战场 */
    .battle-field{
        width: 100%;
        height: 11.2rem;
        padding-top: .23rem;
        /* box-shadow: 0 0 .24rem #fff inset; */
    }
    .team-pan{
        display: flex;
        justify-content: space-around;
        align-items: flex-start;
        flex-wrap: nowrap;
        height: 5rem;
        padding: 0 .1rem;
        /* box-shadow: 0 0 .1rem red inset; */
    }
    .team-pan-top{

    }
    .team-pan-bottom{

    }
    .unit{
        width: 24%;
        margin: 0 1%;
    }
    .unit-info-pop .unit{
        width: 100%;
        margin: 0;
    }

    /* 战场-board */
    .board-container{
        position: relative;
        width: 100%;
        height: 1rem;
        z-index: 1050;
    }
    .battle-field .board-container .board-row{
        position: relative;
        z-index: 10;
        height: 1rem;
        padding: 0 .2rem;
        line-height: .3rem;
        font-size: .24rem;
        color: #fff;
    }
    .board-container .btn-start,
    .board-container .btn-cheat{
        position: relative;
        display: block;
        margin: 0 auto;
        width: 4rem;
        height: 1rem;
        line-height: 1rem;
        text-align: center;
        font-size: .4rem;
        font-weight: bold;
        color: #8ae4f1;
        z-index: 15;
        box-shadow: 0 0 .5rem .2rem #2F4F4F inset;
        animation: startBtn 1.33s ease-in-out infinite alternate;
    }
    @keyframes startBtn{
        to{
            transform: scale(1.05);
        }
    }
    .board-container .btn-cheat{
        position: absolute;
        right: .25rem;
        width: 1rem;
        height: .5rem;
        line-height: .5rem;
    }
    .btn-cheat-1{
        top: 0;
    }
    .btn-cheat-2{
        top: .6rem;
    }

    /* time */
    .board-flee-wrap{
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        left: 0;
        top: 0;
        width: 100%;
        height: 1rem;
        z-index: 8;
    }
    .board-flee-wrap .board-flee-bar{
        margin: 0 auto;
        width: 5rem;
        height: .38rem;
        border: .01rem solid #888;
        border-radius: .04rem;
        box-shadow: 0 0 .04rem #000;
    }

    /* 技能名动画 */
    .skill-name-flash{
        min-width: 120px;
        min-height: 30px;
        display: inline-block;
        font-weight: bold;
        font-style: italic;
        font-size: 18px;
        color: MediumSlateBlue;
        animation: skill .8s ease-out forwards;

    }
    .flashing-skill{
        left: 8px;
        top: 10px;
        display: inline-block;
        position: absolute;
        font-weight: bold;
        font-style: italic;
        width: 120px;
        white-space: nowrap;
        word-break: keep-all;
        font-size: 30px;
        animation: flashing .85s ease-out forwards;
    }
    .flashing-left,.flashing-right{
        left: 8px;
        top: 10px;
        display: inline-block;
        font-size: 30px;
        width: 120px;
        white-space: nowrap;
        word-break: keep-all;
        position: absolute;
    }
    .flashing-left{
        animation: flashingToLeft .7s ease-out forwards;
    }
    .flashing-right{
        color: MediumSlateBlue;
        animation: flashingToRight .7s ease-out forwards;
    }
    @keyframes skill {
        50% {
            opacity: .3;
            transform: scale(1.2);
        }
        100% {
            opacity: 1;
            transform: scale(1.1);
        }
    }
    @keyframes flashing {
        18% {
            opacity: .3;
            transform: scale(5);
        }
        24% {
            opacity: .3;
            transform: scale(4.5);
            color: #e81313;
        }
        35% {
            opacity: 1;
            transform: scale(1);
            color: #000;
        }
        50% {
            color: #e81313;
        }
        60% {
            color: MediumSlateBlue;
        }
        100% {
            color: #fd9;
            text-shadow: 0 0 .06rem #000;
        }
    }
    @keyframes flashingToLeft {
        10% {
            opacity: .5;
            transform: translate(-5%,-5.6%);
        }
        20% {
            opacity: .8;
            transform: translate(-4%,-12%);
        }
        30% {
            opacity: .5;
            transform: translate(-5.5%,-6.8%);
        }
        40% {
            opacity: .5;
            transform: translate(-4.2%,-18%);
        }
        50% {
            opacity: .8;
            transform: translate(-5.2%,-15.6%);
        }
        60% {
            opacity: .5;
            transform: translate(-3.6%,-4.5%);
        }
        80% {
            opacity: .8;
            transform: translate(-5.6%,-4.8%);
        }
        90% {
            opacity: .5;
            transform: translate(-4.1%,-19.3%);
        }
        100% {
            opacity: 0;
            transform: translate(0,0);
        }
    }
    @keyframes flashingToRight {
        10% {
            opacity: .5;
            transform: translate(5%,5.6%);
        }
        20% {
            opacity: .8;
            transform: translate(4%,12%);
        }
        30% {
            opacity: .5;
            transform: translate(5.5%,6.8%);
        }
        40% {
            opacity: .5;
            transform: translate(4.2%,18%);
        }
        50% {
            opacity: .8;
            transform: translate(5.2%,15.6%);
        }
        60% {
            opacity: .5;
            transform: translate(3.6%,4.5%);
        }
        80% {
            opacity: .8;
            transform: translate(5.6%,4.8%);
        }
        90% {
            opacity: .5;
            transform: translate(4.1%,19.3%);
        }
        100% {
            opacity: 0;
            transform: translate(0,0);
        }
    }

    /* 动画 */
    .canvas-cover{
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
        z-index: 1500;
        color: #131313;
        font-size: .4rem;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .ani{
        /* box-shadow: 0 0 .5rem #fff inset; */
    }

    /* pop */
    .unit-info-pop{
        width: 100%;
        padding: .14rem .22rem;
    }
    .guide-menu{
        width: 100%;
        padding: .32rem .18rem;
        font-weight: normal;
    }
    .guide-menu-row{
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
        min-height: .4rem;
        line-height: .4rem;
        text-align: left;
        font-size: .3rem;
    }
    .guide-menu-row .guide-name{
        display: inline-block;
        text-align: right;
        width: 1.2rem;
    }
    .guide-menu-row .guide-desc{
        display: inline-block;
        width: calc( 100% - 1.2rem );
    }
    .buff-edit-menu{
        width: 3.2rem;
        margin: 0 auto;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex-wrap: wrap;
        padding: .5rem 0;
        overflow-y: auto;
    }
    .buff-edit-menu .buff-edit-btn{
        width: 1.5rem;
        height: .6rem;
        margin: .08rem .05rem;
        line-height: .6rem;
    }

    /* 侧边按钮 */
    .touch-dom{
        width: 1.4rem;
        height: .76rem;
        line-height: .76rem;
        background-color: #2F4F4F;
    }

</style>

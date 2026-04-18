<template>
    <div class="main" v-if="game">
        <!--作弊-->
        <nut-drag direction="y" :style="{right:'0px',top:'75px',zIndex:'200'}" v-if="DEBUG">
            <a class="btn touch-dom" @click="onTapCheat">cheat</a>
        </nut-drag>
        <!--页面内容-->
        <div class="panel">
            <div class="body" v-if="pageState!=0">
                <!-- 战场 -->
                <div class="battle-field">
                    <!-- 敌方区域 -->
                    <div class="team-pan team-pan-top">
                        <Unit2 v-for="unit in enemyTeam" :ref="'u-'+unit.id" :key="unit.id" :unit="unit" @onTap="onTapUnit" />
                    </div>
                    <!-- 公示信息区域 -->
                    <div class="board-container">
                        <div class="board-row" v-if="boardTip">{{boardTip}} - {{aniList.length}}</div>
                        <a class="btn btn-start" v-if="pageState==1" @click="onTapStartBattle">开 始 战 斗</a>
                    </div>
                    <!-- 我方区域 -->
                    <div class="team-pan team-pan-bottom">
                        <Unit2 v-for="unit in playerTeam" :ref="'u-'+unit.id" :key="unit.id" :unit="unit" @onTap="onTapUnit" />
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
                                <a class="btn btn-mop btn-cdot" :class="`btn-cdot-${CONFIG.baseConsumeList[0]}`" @click="onTapMenu({flag:3})">防御️</a>
                                <a class="btn btn-mop btn-cdot" :class="`btn-cdot-${CONFIG.baseConsumeList[1]}`" @click="onTapMenu({flag:4})">躲避</a>
                                <a class="btn btn-mop btn-cdot" :class="`btn-cdot-${CONFIG.baseConsumeList[2]}`" @click="onTapMenu({flag:5})">追踪</a>
                                <a class="btn btn-mop btn-cdot" :class="`btn-cdot-${CONFIG.baseConsumeList[3]}`" @click="onTapMenu({flag:6})">呼吸</a>
                                <a class="btn btn-mop btn-cdot" :class="`btn-cdot-${CONFIG.baseConsumeList[4]}`" @click="onTapMenu({flag:7})">集气</a>
                                <a class="btn btn-mop btn-cdot" :class="`btn-cdot-${CONFIG.baseConsumeList[5]}`" @click="onTapMenu({flag:8})">爆气</a>
                                <a class="btn btn-mop btn-cdot" :class="`btn-cdot-${CONFIG.baseConsumeList[6]}`" @click="onTapMenu({flag:9})">劝降</a>
                                <a class="btn btn-mop btn-cdot" :class="`btn-cdot-${CONFIG.baseConsumeList[7]}`" @click="onTapMenu({flag:10})">撤离</a>
                            </div>
                        </div>
                        <div class="menu-tag" v-if="menuData.state==2">
                            <div class="menu-sub-wrap menu-attack-wrap">
                                <div class="menu-weapon" v-for="(weapon,index) in curUnitList[curUnitListIndex].btd.weaponList" :key="index">
                                    <Attack class="menu-attack btn" :class="menuData.expand?'':'menu-attack-shrink'" v-for="(attack,index) in weapon.k" :key="index" :attack="attack" :mode="menuData.expand?1:2"  :ban="checkBan({unit:curUnitList[curUnitListIndex],data:attack})" @onTap="onTapMenuAttack" />
                                </div>
                            </div>
                        </div>
                        <div class="menu-tag" v-if="menuData.state==3">
                            <div class="menu-sub-wrap menu-skill-wrap">
                                <Skill class="btn" :class="menuData.expand?'menu-skill-expand':'menu-skill-shrink'" v-for="(skill,index) in curUnitList[curUnitListIndex].btd.skillList" :key="index" :unit="curUnitList[curUnitListIndex]" :skill="skill" :mode="menuData.expand?1:2" :isOption="true" @onTap="onTapMenuSkill" />
                            </div>
                        </div>
                        <div class="menu-tag" v-if="menuData.state==4">
                            <div class="menu-sub-wrap menu-unit-wrap">
                                <a class="btn" v-for="(unit,index) in menuData.unitList" :key="index"  @click="onTapMenu({flag:21,data:unit})">{{unit.btd.name}}</a>
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
        <!-- 弹窗 -->
        <!-- <div class="canvas-cover" v-if="pageState==4">
            <Ani class="ani" res="ani" />
        </div> -->
        <div class="canvas-cover" v-if="pageState==4">
            <Ani class="ani" ref="ani" @onAnimationEnd="onAnimationEnd" />
        </div>
        <Pop v-if="viewingUnit" title="角色面板" @onTap="onTapPop">
            <div class="unit-info-pop">
                <Unit1 :unit="viewingUnit" :mode="2" />
            </div>
        </Pop>
        <Pop v-if="showMenuGuide" title="战斗操作说明" @onTap="onTapPop">
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
import Ani from '../components/Ani';
import Pop from '../components/Pop';
import Toast from '../components/Toast';
import { query, r, exptr, setInRange, shuffle, bulbsort, getParentNode, cloneObj, numFormat, avg, percent, calcDistance, getMatchList, getSubMatchList, removeFromList, arrContains, } from '../tools/utils';
import * as common from '../tools/common';
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
}

export default {
    name: 'Battle',
    props:{
        onBattleEnd: { // 战斗结束事件
            type: Function,
            default: function(){},
        },
    },
    data(){
        return {
            pageState: 0, // 页面状态【0:读取数据中|1：战斗准备完成|2：累积行动条|3：战斗-操作中|4：动画|5：buff编辑|99：离开】

            boardTip: '', // 战场公示文字

            menuData: { // 菜单数据
                state: 0, // 操作面板出现状态【0:不显示|1：基础选项|2：攻击选项|3：技能选项|4：选择单位|5：选择属性】
                unitList: [],
                attrList: [{n:`力量`,i:4},{n:`精准`,i:5},{n:`速度`,i:6},{n:`智力`,i:7},{n:`定力`,i:8},{n:`隐蔽`,i:9},{n:`爆发`,i:10},],
                tip: '', // 菜单公示主文字
                extip: '', // 菜单公示副文字
                expand: 0, // 菜单展开标识
                unitOptionType: 0, // 选择单位对应的行动【1攻击|2技能施放|3劝降】
                unitOptionData: {}, // 选择单位对应的行动相关的数据
                stateRecordList: [],
            },

            curUnitList: [], // 本帧行动单位数组
            curUnitListIndex: -1, // 本帧行动单位数组下标

            viewingUnit: null, // 正在查看的单位

            showMenuGuide: 0, // 显示操作菜单指导
            menuGuids: [
                {name:'防御',desc:'恢复防御力到满值'},
                {name:'躲避',desc:'降低自己的存在感（隐蔽）'},
                {name:'追踪',desc:'提升敌方单位10%的存在感，该单位只能是存在感最高的敌人'},
                {name:'呼吸',desc:'恢复体力到满值'},
                {name:'集气',desc:'提升潜能（爆发）'},
                {name:'爆气',desc:'消耗自己全部潜能，选择自己的某项属性按百分比提升'},
                {name:'话术',desc:'降低敌人的心理防御（智力）'},
            ],

            game: null,

            turnCount: 0,

            aniList: [], // 播放画布动画的数据数组

            playerTeam:[],
            enemyTeam:[],

            timerList: [],

            CONFIG,
            DEBUG,
        };

    },
    mounted(){
        // TODO
        let _nus = [];
        _nus.push(common.genUnit({id:1,name:'赵日天',age:20,gender:1,level:5,tms:1,rel:100,game:this.game,}));
        _nus.push(common.genUnit({id:2,gender:2,level:6,tms:2,rel:100,game:this.game,}));
        _nus.push(common.genUnit({id:3,tms:3,level:7,rel:80,game:this.game,}));
        _nus.push(common.genUnit({id:4,tms:4,level:8,rel:50,game:this.game,}));
        _nus.push(common.genUnit({id:11,gender:1,level:1,game:this.game,}));
        _nus.push(common.genUnit({id:12,gender:1,level:2,game:this.game,}));
        _nus.push(common.genUnit({id:13,gender:1,level:3,game:this.game,}));
        _nus.push(common.genUnit({id:14,gender:1,level:9,game:this.game,}));
        window.GLOBAL = {};
        window.GLOBAL.game = {
        	money: 1000,
        	day: 1,
        	hour: 0,
        	meTeamIDs: [1,], // 队伍角色ID
        	currentMapID: 101, // 当前所在地图ID
        	luck: 0, // 夺宝能力
        	allUnits: [], // 角色
        	unitIndex: 101, // 角色 ID 索引
        	allEquips: [], // 装备
        	equipIndex: 101, // 装备 ID 索引
        	allSkills: [], // 技能
        	skillIndex: 101, // 技能 ID 索引
        	allMaps: [], // 地图
        };
        window.GLOBAL.game.battle = {
            mode: 1, // 战斗模式【1:普通|2：BOSS|3：切磋|4：营地】
            envirs: {
                mapId: 1,
                floor: 2,
            },
            playerTeamIds: [1,2,3,4,],
            enemyTeamIds: [11,12,13,14,],
        }
        // 预设装备
        window.GLOBAL.game.allUnits = _nus;
        window.GLOBAL.game.allEquips = [];
        _nus[0].es[0] = 1;
        _nus[1].es[0] = 2;
        _nus[1].es[5] = 6;
        _nus[1].es[3] = 7;
        _nus[2].es[0] = 3;
        _nus[2].es[5] = 6;
        _nus[2].es[3] = 7;

        _nus[3].es[0] = 4;
        _nus[3].es[1] = 5;
        _nus[3].es[5] = 6;
        _nus[3].es[3] = 7;
        _nus[3].es[4] = 8;

        _nus[3].as[6] = 656;
        _nus[4].es[0] = 9;
        _nus[4].es[5] = 10;
        _nus[7].es[4] = 10;
        _nus[7].es[5] = 10;
        window.GLOBAL.game.allEquips.push(common.genEquip({id:1,game:{},level:r(9,9),type:r(1,1)}));
        window.GLOBAL.game.allEquips.push(common.genEquip({id:2,game:{},level:r(9,9),type:r(1,1)}));
        window.GLOBAL.game.allEquips.push(common.genEquip({id:3,game:{},level:r(9,9),type:r(1,1)}));
        window.GLOBAL.game.allEquips.push(common.genEquip({id:4,game:{},level:r(9,9),type:r(1,1)}));
        window.GLOBAL.game.allEquips.push(common.genEquip({id:5,game:{},level:r(9,9),type:r(1,1)}));
        window.GLOBAL.game.allEquips.push(common.genEquip({id:6,game:{},level:r(9,9),type:r(3,3)}));
        window.GLOBAL.game.allEquips.push(common.genEquip({id:7,game:{},level:r(9,9),type:r(5,5)}));
        window.GLOBAL.game.allEquips.push(common.genEquip({id:8,game:{},level:r(9,9),type:r(5,5)}));
        window.GLOBAL.game.allEquips.push(common.genEquip({id:9,game:{},level:r(1,1),type:r(1,1)}));
        window.GLOBAL.game.allEquips.push(common.genEquip({id:10,game:{},level:r(9,9),type:r(5,5)}));
        // 预设技能
        for(let i=0;i<10;i++){
            _nus[3].ss[i] = i+1;
            window.GLOBAL.game.allSkills.push(common.genSkill({id:i+1,game:{},level:r(1,9)}));
        }

        if(window.GLOBAL&&window.GLOBAL.game&&window.GLOBAL.game.battle){ // TODO
            this.game = window.GLOBAL.game;
            this.init();
            console.log(this.game);
        }
        else{
            this.$router.push('/');
        }
    },
    beforeDestroy(){
        for(let timer of this.timerList){
            clearTimeout(timer);
            timer = null;
        }
    },
    methods: {
        /* 流程相关 */
        init(){ // 初始化全部
            let { playerTeamIds, enemyTeamIds, } = this.game.battle;
            let playerTeam = [], enemyTeam = [];
            let unitAction = (ids,team) => {
                for(let unitId of ids){
                    let unit = getMatchList(this.game.allUnits,[['id',unitId]])[0];
                    if(unit){
                        let btd = common.getUnitBtd(unit,this.game); // 获取单位战斗数据
                        let _unit = cloneObj(unit);
                        _unit.btd = btd;
                        team.push(_unit);
                    }
                }
                return team;
            };

            this.playerTeam = unitAction(playerTeamIds,playerTeam);
            this.enemyTeam = unitAction(enemyTeamIds,enemyTeam);

            this.$nextTick(_=>{
                this.goPageState(1);
            });
        },
        goPageState(flag){ // 进入页面状态
            let allUnits = [...this.playerTeam,...this.enemyTeam];
            this.pageState = flag;
            this.resetMenu();
            this.$nextTick(_=>{
                switch(flag){
                    case 1: // 战斗开始

                    break;
                    case 2: // 行动力推进
                        for(let unit of allUnits){
                            unit.btd.cur = 0;
                        }
                        this.menuData.state = 0;
                        this.movementProcess();
                    break;
                    case 3: // 进行操作

                    break;
                    case 4: // 动画

                    break
                    case 5: // buff编辑

                    break
                    case 99: // 战斗结束

                    break
                }
            });
        },
        goMenuState(flag,data={}){ // 进入菜单
            let { type, caster, } = data;
            if(flag==4){ // 选择目标单位 type:1敌方全体，2友方全体
                let list, team;
                if(type==1){
                    list = getSubMatchList(this.enemyTeam,[['alive',1]],'btd');
                    team = '敌方';
                }
                else if(type==2){
                    list = getSubMatchList(this.playerTeam,[['alive',1]],'btd');
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
        movementProcess(){ // 行动条进展
            let allAliveUnits = this.getAllAliveUnits();
            let stop = 0, tickCount = 0;
            let curUnitList = []; // 可行动单位数组
            let calcTickCount = _ =>{
                let smallestTickCount = Infinity; // 最先行动者的所需行动步数
                // 计算每个人的【所需行动步数】和【超出行动力】
                for(let unit of allAliveUnits){
                    let speed = unit.btd.speed; // 3
                    let diff= 10000-unit.btd.move; // 10
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
                // 所有人推进行动条
                for(let unit of allAliveUnits){
                    unit.btd.move += smallestTickCount*unit.btd.speed;
                }
                // 得出最小行动步数为 3，筛选出本帧行动者
                for(let unit of allAliveUnits){
                    if(unit.tickCount<=smallestTickCount){
                        curUnitList.push(unit);
                    }
                }
                // 根据超出行动力，对本帧行动者数组进行逆向排序
                curUnitList = bulbsort(curUnitList,'overflowMove',1);
                this.curUnitList = curUnitList;
            }
            calcTickCount();
            for(let unit of curUnitList){ // 所有本帧行动者行动条归零
                unit.btd.move = 0;
                unit.btd.roundRemainCount = unit.btd.roundTotal;
            }
            this.$nextTick(_=>{
                this.turnStart();
                // for(let u of this.curUnitList){ console.log(u.nm); }
            });
        },
        unitRoundStart(){ // 单位的回合开始
            let curUnit = this.curUnitList[this.curUnitListIndex];
            let allUnits = [...this.playerTeam,...this.enemyTeam];

            // 初始化所有单位的 changes
            for(let unit of allUnits){
                unit.btd.changes = cloneObj(INIT_CHANGES);
                unit.btd.changes.effectTypeList = [];
                unit.btd.changes.domAni = '';
            }

            // 清空所有动画
            this.aniList = [];

            this.$nextTick(_=>{
                let _n = curUnit.btd.name;
                curUnit.btd.name = 'JK';
                curUnit.btd.name = _n;

                let btd = curUnit.btd;
                btd.cur = true;
                this.unitRoundPrepare({unit:curUnit});

                if(curUnit.btd.isPlayer){ // 玩家
                    this.goPageState(3);
                    this.menuData.state = 1;
                    this.menuData.tip = `${curUnit.btd.name}行动`;
                    this.menuData.extip = ``;
                }
                else{ // 人机 TODO

                }
            })
        },
        turnStart(){ // 大回合开始，一个turn可以包含多个round
            this.turnCount++;
            this.boardTip = `第 ${this.turnCount} 回合`;
            this.curUnitListIndex = 0;
            this.unitRoundStart();
        },
        turnEnd(){ // 大回合结束，一个turn可以包含多个round
            // 清除所有dom动画和所有changes
            let allUnits = [...this.playerTeam,...this.enemyTeam];
            for(let unit of allUnits){
                let vdom = this.$refs[`u-${unit.id}`][0];
                vdom.trigAni();
                unit.btd.changes = {};
            }

            let checkEndResult = this.checkEnd();
            if(checkEndResult){ // 战斗结束
                if(checkEndResult==1){ // 获胜
                    this._alert(`获胜`);
                }
                else{ // 战败
                    this._alert(`战败`);
                }
                this.goPageState(99);
                let resultData = {
                    result: checkEndResult,

                };
                this.$emit('onBattleEnd',resultData);
            }
            else{ // 战斗未结束，继续行动条增长
                let curUnit = this.curUnitList[this.curUnitListIndex];
                if(curUnit.btd.roundRemainCount>0&&curUnit.btd.alive){
                    this.unitRoundStart();
                }
                else{
                    this.goPageState(2);
                }
            }
        },
        checkEnd(){ // 检查胜负 0未结束 1我方获胜 2敌人获胜 3无人获胜
            let res = 0;
            let playerDefeat = 1, enemyDefeat = 1;
            for(let unit of this.playerTeam){
                if(unit.btd.alive){
                    playerDefeat = 0;
                    break;
                }
            }
            for(let unit of this.enemyTeam){
                if(unit.btd.alive){
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

        /* 快捷功能 */
        _alert(text,time){ // 弹出提示
            this.$refs.toast.trigger(text,time);
        },
        getAllAliveUnits(){ // 获取所有存活单位
            let allUnits = [...this.playerTeam,...this.enemyTeam];
            return getSubMatchList(allUnits,[['alive',1]],'btd');
        },
        attackOnTarget({caster,target,attack}){ // 对一个单位进行攻击
            // 计算 changes
            if(common.calcHit({caster,target})){ // 命中
                let btd = target.btd;
                let changes = btd.changes;
                changes.domAni = "shake";
                // 推送攻击画布动画
                this.pushEffectType(attack.et,target);
                 // 计算伤害
                let dmg = common.calcDmg({caster,attack,});
                changes.def -= dmg;
                if(dmg>btd.def[0]){ // 破防，掉血
                    changes.hp -= (dmg-btd.def[0]);
                }
            }
            else{ // 未命中
                this.pushEffectType(106,target);
                if(attack.s==5&&r(1,100)<CONFIG.spAttackRate){ // 锁敌sppp
                    this.pushEffectType(104,target);

                }
            }
            this.pushEffectType(101,target);
        },
        checkBan({unit,data}){ // 检查按钮是否禁用
            return !common.canConsume({unit,consume:common.calcConsume({type:1,unit,data,})});
        },

        /* 动画相关 */
        playDomAni(unit,aniName){ // 播放单位DOM元素动作
            let vdom = this.$refs[`u-${unit.id}`][0];
            if(vdom){
                vdom.trigAni(aniName);
            }
        },
        playAniList(){ // 播放所有单位的dom动画，同时逐一播放 aniList 中的全部画布动画
            this.goPageState(4);
            let allAliveUnits = this.getAllAliveUnits();
            this.$nextTick(_=>{
                let domAniExist = 0;
                for(let unit of allAliveUnits){
                    let changes = unit.btd.changes;
                    if(changes.domAni){
                        domAniExist = 1;
                        this.playDomAni(unit,changes.domAni);
                    }
                }
                if(this.aniList.length<=0){ // 如果没有动画，则直接结束动画
                    this.timerList.push(setTimeout(_=>{
                        this.onAnimationEnd();
                    },domAniExist?550:10));
                }
                else{
                    for(let aniData of this.aniList){
                        this.playAni(aniData);
                    }
                }
            });
        },
        playAni({caster,target,effectType,number}){ // 播放‘单动画’
            /*
                effectType: 5,// 1slash 2smash 3bullet 4range 5fire 6thunder 7cure 8power 9pure 10mental
                // 11重slash 12重smash 13重bullet 14重range 15重fire
                // 101浮动数字（血|精|心|钱） 102行动力 103潜能 104存在感 105破盾 106miss
                number: 1||{}, // { hp:0, eng:0, mdef:0, money:0, }
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
                    aniName = `protect-mental`;
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

                case 101: // 通用浮动数字，涉及到数值
                    aniName = `number-common`;
                    if(number.hp){
                        let colorType = number.hp>0?1:2;
                        textList.push({val:number.hp,colorType});
                    }
                    if(number.eng){
                        textList.push({val:number.eng,colorType:3});
                    }
                    if(number.mdef){
                        textList.push({val:number.mdef,colorType:4});
                    }
                    if(number.money){
                        textList.push({val:number.money,colorType:8});
                    }
                break;
                case 102: // 压制，涉及到数值
                    aniName = `number-quell`;
                    textList.push({val:number,});
                break;
                case 103: // 破盾，涉及到数值
                    aniName = `text`;
                    textList.push({val:'破',colorType:9,fontSize:.6,});
                break;
                case 104: // 气溃，涉及到数值
                    aniName = `number-potency-damage`;
                    textList.push({val:number,});
                break;
                case 105: // 锁敌，涉及到数值
                    aniName = `number-lock-on`;
                    textList.push({val:number,});
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
            }
            if(textList.length>0){
                params.textList = textList;
            }

            this.$refs.ani&&this.$refs.ani.trigger(params);
        },
        pushAniByChanges({caster,target}){ // 根据 changes 生成并推送多个‘单动画数据’进入aniList用于稍后播放
            let changes = target.btd.changes;
            let effectTypeList = changes.effectTypeList;
            for(let effectType of effectTypeList){
                if((effectType>0&&effectType<16)||effectType==105||effectType==106){ // 动画效果+破盾+miss
                    this.aniList.push({caster,target,effectType,});
                }
                else if(effectType==101&&(changes.hp||changes.eng||changes.mdef||changes.money)){ // 通用数字（血精心钱）
                    this.aniList.push({caster,target,effectType:101,number:changes});
                }
                else if(effectType==102&&changes.mov){ // 特殊数字·行动力
                    this.aniList.push({caster,target,effectType:102,number:changes.mov,});
                }
                else if(effectType==103&&changes.ptc){ // 特殊数字·潜能
                    this.aniList.push({caster,target,effectType:103,number:changes.ptc,});
                }
                else if(effectType==104&&changes.dge){ // 特殊数字·存在感
                    this.aniList.push({caster,target,effectType:104,number:changes.dge,});
                }
            }
        },
        pushEffectType(type,unit,){ // 为单位添加 effectType，用于播放画布动画
            unit.btd.changes.effectTypeList.push(type);
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
        onAnimationEnd(){ // 当动画结束
            if(this.pageState==4){
                this.turnEnd();
            }
        },
        onAnimationResponse(){ // 当动画中途回应
            let allAliveUnits = this.getAllAliveUnits();
            for(let unit of allAliveUnits){ // 根据所有单位的 changes 改变其数据
                common.saveUnitChanges(unit);
                let _n = unit.btd.name;
                unit.btd.name = 'JK';
                unit.btd.name = _n;
            }
        },

        /* 单位动作 */
        unitAction({caster,type,targetUnitList,burstAttr,skill,attack}){ // 单位执行动作
            /*action = {
                type: 1, // 动作类型 1攻击 2技能 3防御 4躲避 5追踪 6呼吸 7集气 8爆气 9劝降 10撤离
                targetUnitList: [], // 目标单位数组
            }*/
            switch(type){
                case 1: // 进行攻击
                    this.unitAttack(caster,attack,targetUnitList);
                break;
                case 2: // 施放技能
                    this.unitSpell(caster,skill,targetUnitList);
                break;
                case 3: // 防御
                    this.unitDefense(caster);
                break;
                case 4: // 躲避
                    this.unitDodge(caster);
                break;
                case 5: // 追踪
                    this.unitTrace(caster);
                break;
                case 6: // 呼吸
                    this.unitBreath(caster);
                break;
                case 7: // 集气
                    this.unitConcentrate(caster);
                break;
                case 8: // 爆气
                    this.unitBurst(caster,burstAttr);
                break;
                case 9: // 劝降
                    this.unitPersuade(caster,targetUnitList);
                break;
                case 10: // 撤离
                    this.unitFlee(caster);
                break;
            }
        },
        unitRoundPrepare({unit}){ // 单位小回合开始的准备动作
            let btd = unit.btd;
            btd.roundRemainCount--;
            // 防御值自动回升
            btd.def[0] += Math.round(btd.def[1]*btd.hp[0]/btd.hp[1]*CONFIG.defAutoRecoverFactor);
            btd.def[0] = setInRange(btd.def[0],0,btd.def[1]);
        },
        unitAttack(caster,attack,targetUnitList){ // 单位进行攻击
            let allAliveUnits = this.getAllAliveUnits();
            caster.btd.changes.domAni = "cast";

            // 攻击者体力消耗
            let consume = common.calcConsume({type:1,unit:caster,data:attack,});
            caster.btd.changes.phy -= consume;
            if(consume>caster.btd.phy[0]){ // 破限，掉精
                caster.btd.changes.eng -= (consume-caster.btd.phy[0]);
            }

            // 攻击者存在感上升
            let dodgeup = common.calcAttackAwaup({unit:caster,attack,});
            caster.btd.changes.dge += dodgeup;

            this.pushEffectType(101,caster);

            // 遍历每个攻击目标单位
            for(let target of targetUnitList){
                this.attackOnTarget({caster,target,attack,});
            }

            // 遍历每个存活单位，根据 changes 生成并推送画布动画
            for(let unit of allAliveUnits){
                this.pushAniByChanges({caster,target:unit});
            }
            // 计算完动作后，播放DOM动画+所有画布动画
            this.playAniList();

            // TODO
            // let names = ``;
            // for(let unit of targetUnitList){ names += `${unit.btd.name}+`;}
            // console.log(`${caster.btd.name} ${attack.n}攻击 ${names}`,attack);
        },
        unitSpell(caster,skill,targetUnitList){ // 单位施放技能
            console.log(`${caster.btd.name} 对 ${targetUnitList[0].btd.name} 使用技能【${skill.n}】`,skill);
        },
        unitDefense(caster){ // 单位防御
            console.log(`${caster.btd.name} 进行防御`);
        },
        unitDodge(caster){ // 单位躲避
            console.log(`${caster.btd.name} 进行躲避`);
        },
        unitTrace(caster){ // 单位追踪
            console.log(`${caster.btd.name} 进行追踪`);
        },
        unitBreath(caster){ // 单位呼吸
            console.log(`${caster.btd.name} 进行呼吸`);
            caster.btd.phy[0] = caster.btd.phy[1];
            this.playAniList();
        },
        unitConcentrate(caster){ // 单位集气
            console.log(`${caster.btd.name} 进行集气`);
        },
        unitBurst(caster,attr){ // 单位爆气
            console.log(`${caster.btd.name} ${[`力量`,`精准`,`速度`,`智力`,`定力`,`隐蔽`,`爆发`,][attr-4]}爆发`);
        },
        unitPersuade(caster,targetUnitList){ // 单位劝降
            console.log(`${caster.btd.name} 劝降 ${targetUnitList[0].btd.name}`);
        },
        unitFlee(caster){ // 单位撤离
            console.log(`${caster.btd.name} 进行撤离`);
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
                this._alert(`行动进度: ${Math.round(btd.move/100)} %`);
            }
            else if(flag==104){ // 点击气条
                this._alert(`潜力累积： ${Math.round(btd.ptc/100)} %`);
            }
            else if(flag==105){ // 点击躲避条
                this._alert(`存在感： ${Math.round(btd.dge/100)} %`);
            }
            else if(flag==106){ // 点击头像
                let _unit = cloneObj(getMatchList(this.game.allUnits,[['id',unit.id]])[0]);
                _unit.btd = common.getUnitBtd(unit,this.game);
                this.viewingUnit = _unit;
            }
        },
        onTapPop(){ // 点击【弹窗-关闭】
            this.viewingUnit = null;
            this.showMenuGuide = 0;
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
        onTapMenuAttack({flag,data,ban,}){ // 点击【菜单-攻击】
            this.onTapMenu({flag:101,data,ban});
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
            else if(flag==6){ // 呼吸
                this.unitAction({caster:curUnit,type:6});
            }
            else if(flag==7){ // 集气
                this.unitAction({caster:curUnit,type:7});
            }
            else if(flag==8){ // 爆气
                this.goMenuState(5);
            }
            else if(flag==9){ // 劝降
                this.menuData.unitOptionType = 3; // 以单位为目标的行动类型：劝降
                this.goMenuState(4,{type:1,caster:curUnit});
            }
            else if(flag==10){ // 撤离
                this.unitAction({caster:curUnit,type:10});
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
                    case 3: // 劝降
                        // console.log(`????`,data);
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
        onTapCheat(){ // 点击【作弊】按钮
            this.goPageState(2);
            // let cUnit = this.playerTeam[3],tUnit = this.enemyTeam[2],t2Unit = this.enemyTeam[3];
            // let c_pos = this.getUnitDomPos(cUnit.id);
            // let t_pos = this.getUnitDomPos(tUnit.id);
            // let c_vdom = this.$refs[`u-${cUnit.id}`][0], t_vdom = this.$refs[`u-${tUnit.id}`][0], t2_vdom = this.$refs[`u-${t2Unit.id}`][0];
            //
            // let x = 250;
            // c_vdom.trigAni('cast');
            // // t_vdom.trigAni('shake');
            // // t2_vdom.trigAni('shake');
            //
            // this.$refs.ani.trigger({name:'attack-slash-heavy',fromX:c_pos.x, fromY:c_pos.y, toX:t_pos.x, toY:t_pos.y, });
            // // let tl1 = [{val:'破',colorType:9,fontSize:.6,},];
            // // this.$refs.ani.trigger({name:'text',textList:tl1, fromX:c_pos.x, fromY:c_pos.y, toX:t_pos.x, toY:t_pos.y, });
            // // let tl2 = [{val:-973,colorType:2,},];
            // // this.$refs.ani.trigger({name:'number-common',textList:tl2, fromX:c_pos.x, fromY:c_pos.y, toX:t_pos.x, toY:t_pos.y, });
            // // this.$refs.ani.trigger({name:'number-potency-damage',textList:[{val:3700,},], fromX:c_pos.x, fromY:c_pos.y, toX:t_pos.x, toY:t_pos.y, });
            // // this.$refs.ani.trigger({name:'number-common',textList:[{val:-316,colorType:4},], fromX:c_pos.x, fromY:c_pos.y, toX:t_pos.x, toY:t_pos.y, });
            // this.$refs.ani.trigger({name:'text',textList:[{val:'miss',colorType:10,fontSize:.66},], fromX:c_pos.x, fromY:c_pos.y, toX:t_pos.x, toY:t_pos.y, });
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
        Ani,
        Pop,
        Toast,
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
        background-image: url('./../assets/bg-battle.png');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        box-shadow: 0 0 1.35rem #000 inset;
    }
    .panel{
        position: relative;
        width: 100%;
        height: 100%;
        overflow-y: scroll;
        overflow-x: hidden;
    }
    .body{
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 13.75rem;
    }
    .btn{
        background-color: transparent;
        display: inline-block;
        color: #fff;
        text-align: center;
        cursor: pointer;
        border-radius: .01rem;
        border: .02rem solid #2F4F4F;
        box-shadow: 0 0 .34rem #2F4F4F inset;
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
        padding-top: .13rem;
        /* box-shadow: 0 0 .24rem #fff inset; */
    }
    .team-pan{
        display: flex;
        justify-content: space-around;
        align-items: flex-start;
        flex-wrap: nowrap;
        height: 5rem;
        /* box-shadow: 0 0 .1rem #fff inset; */
    }
    .team-pan-top{
        top: .05rem;
    }
    .team-pan-bottom{
        top: 6rem;
    }
    .board-container{
        position: relative;
        width: 100%;
        height: 1rem;
        line-height: 1rem;
        z-index: 1050;
    }
    .battle-field .board-container .board-row{
        font-size: .24rem;
        color: #fff;
    }
    .board-container .btn-start{
        display: block;
        margin: 0 auto;
        width: 4rem;
        height: 1rem;
        line-height: 1rem;
        text-align: center;
        font-size: .4rem;
        font-weight: bold;
        color: #8ae4f1;
        box-shadow: 0 0 .5rem .2rem #2F4F4F inset;
        animation: startBtn 1.33s ease-in-out infinite alternate;
    }
    @keyframes startBtn{
        to{
            transform: scale(1.05);
        }
    }

    /* 菜单 */
    .menu-wrap{
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        height: 2.5rem;
        background-color: #2F4F4F;
        background-image: url('./../assets/bg-menu.png');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        z-index: 2000;
        box-shadow: 0 -.03rem .04rem #8ae4f1;
        transition: all .2s;
    }
    .menu-wrap-expand{
        height: 100%;
    }
    .menu-wrap .btn-expand,
    .menu-wrap .btn-back{
        display: inline-block;
        position: absolute;
        top: 0;
        width: .88rem;
        height: .76rem;
        line-height: .76rem;
        text-align: center;
        border: none;
        box-shadow: none;
        color: #8ae4f1;
    }
    .menu-wrap .btn-expand{
        right: 0;
        font-weight: bold;
        font-size: .4rem;
    }
    .menu-wrap .btn-back{
        right: .88rem;
        font-size: .24rem;
    }
    .menu{
        display: flex;
        justify-content: center;
        align-items: flex-start;
        flex-direction: column;
        width: 100%;
        height: 100%;
        padding: .2rem .35rem;
        padding-bottom: .04rem;
        overflow: hidden;
    }
    .menu .menu-tip{
        height: .44rem;
        line-height: .44rem;
        margin-bottom: .12rem;
        width: 100%;
        font-size: .24rem;
        color: #fff;
        text-align: left;
    }
    .menu-tag{
        display: flex;
        justify-content: space-around;
        align-items: flex-start;
        overflow-y: auto;
        width: 100%;
        height: 100%;
    }
    /* 菜单 block */
    .menu-block{
        width: 22%;
        height: 1.5rem;
        /* box-shadow: 0 0 2px #fff inset; */
    }
    .menu-btn{
        line-height: 1.5rem;
        font-size: .4rem;
        text-align: center;
    }
    .menu-block-lg{
        width: 50%;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        flex-wrap: wrap;
    }
    .menu-block-lg .btn{
        display: inline-block;
        width: .75rem;
        height: .7rem;
        line-height: .7rem;
        margin-right: .1rem;
        margin-bottom: .1rem;
    }
    /* 菜单 row */
    .menu .menu-row{
        display: flex;
        justify-content: flex-start;
        align-items: center;
        height: .75rem;
        line-height: .75rem;
    }
    .menu .menu-row .btn{
        display: inline-block;
        width: .8rem;
        height: .6rem;
        line-height: .6rem;
        margin-right: .1rem;
    }
    .menu .menu-row .btn-lg{
        width: 2rem;
    }
    /* 菜单-基础选项 */
    .btn-mop{
        position: relative;
    }
    .btn-cdot::after{
        position: absolute;
        top: .12rem;
        right: .09rem;
        width: .06rem;
        height: .1rem;
        line-height: .1rem;
        color: #05cFd3;
        font-weight: bold;
        text-align: center;
        font-size: .2rem;
    }
    .btn-cdot-1::after{
        content: '1';
    }
    .btn-cdot-2::after{
        content: '2';
    }
    .btn-cdot-3::after{
        content: '3';
    }
    /* 菜单-选择攻击 */
    .menu .menu-sub-wrap{
        width: 100%;
    }
    .menu .menu-attack-wrap{

    }
    .menu .menu-weapon{
        width: 100%;
        color: #fff;
        margin-bottom: .12rem;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex-wrap: wrap;
    }
    .menu .menu-weapon .menu-attack-shrink{
        width: 32%;
        margin-right: 1%;
        margin-bottom: .04rem;
        height: .68rem;
        line-height: .68rem;
    }
    /* 菜单-选择技能 */
    .menu-skill-wrap{
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex-wrap: wrap;
        margin-bottom: .12rem;
    }
    .menu .menu-skill-shrink{
        width: 49%;
        margin-right: 1%;
        margin-bottom: .08rem;
        height: .5rem;
        line-height: .5rem;
    }
    .menu .menu-skill-expand{
        height: auto;
        width: 100%;
        margin-bottom: .08rem;
    }
    /* 菜单-选择单位 */
    .menu-unit-wrap{
        display: flex;
        justify-content: flex-start;
        align-items: center;
    }
    .menu-unit-wrap .btn{
        width: 24%;
        margin-right: 1%;
        height: 1.632rem;
        font-size: .4rem;
        line-height: 1.632rem;
    }
    /* 菜单-选择属性 */
    .menu-attr-wrap{
        display: flex;
        justify-content: flex-start;
        align-items: center;
    }
    .menu-attr-wrap .btn{
        width: 13.2%;
        margin-right: 1%;
        height: .8977rem;
        line-height: .8977rem;
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
        z-index: 20000;
        color: #131313;
        font-size: .4rem;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .ani{
        box-shadow: 0 0 .5rem #fff inset;
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

    /* 侧边按钮 */
    .touch-dom{
        width: 1.4rem;
        height: .76rem;
        line-height: .76rem;
        background-color: #2F4F4F;
    }

</style>

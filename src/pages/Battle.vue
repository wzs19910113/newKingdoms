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
                        <Unit2 v-for="unit in enemyTeam" v-bind:key="unit.id" :unit="unit" :onTap="onTapUnit" />
                    </div>
                    <!-- 公示信息区域 -->
                    <div class="board-container">
                        <div class="board-row" v-if="boardTip">{{boardTip}}</div>
                        <a class="btn btn-start" v-if="pageState==1" @click="onTapStartBattle">开 始 战 斗</a>
                    </div>
                    <!-- 我方区域 -->
                    <div class="team-pan team-pan-bottom">
                        <Unit2 v-for="unit in playerTeam" v-bind:key="unit.id" :unit="unit" :onTap="onTapUnit" />
                    </div>
                </div>
                <!-- 操作板块 -->
                <div class="menu-wrap" :class="`${menuExpand?'menu-wrap-expand':''}`" v-if="menuState>0">
                    <a class="btn btn-help" @click="onTapMenuHelp">?</a>
                    <a class="btn btn-expand" @click="onTapMenuExpand">{{menuExpand?`▽`:`△`}}</a>
                    <div class="menu">
                        <p class="menu-tip">{{menuTip}}</p>
                        <div class="menu-tag" v-if="menuState==1">
                            <a class="btn menu-block menu-btn menu-btn-1" @click="onTapMenu(1)">攻击</a>
                            <a class="btn menu-block menu-btn menu-btn-2" @click="onTapMenu(2)">技能</a>
                            <div class="menu-block menu-block-lg">
                                <a class="btn" @click="onTapMenu(3)">防御️</a>
                                <a class="btn" @click="onTapMenu(4)">躲避</a>
                                <a class="btn" @click="onTapMenu(5)">追踪</a>
                                <a class="btn" @click="onTapMenu(6)">呼吸</a>
                                <a class="btn" @click="onTapMenu(7)">集气</a>
                                <a class="btn" @click="onTapMenu(8)">爆气</a>
                                <a class="btn" @click="onTapMenu(9)">劝降</a>
                                <a class="btn" @click="onTapMenu(10)">撤离</a>
                            </div>
                        </div>
                        <div class="menu-tag" v-if="menuState>1">
                            <div class="menu-row"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- 弹窗 -->
        <Pop v-if="viewingUnit" title="角色面板" :onTap="onTapPop">
            <div class="unit-info-pop">
                <Unit1 :unit="viewingUnit" :mode="2" />
            </div>
        </Pop>
        <Pop v-if="showMenuGuide" title="战斗操作说明" :onTap="onTapPop">
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
import Bar1 from '../components/Bar1';
import Bar2 from '../components/Bar2';
import Pop from '../components/Pop';
import Toast from '../components/Toast';
import { query, r, exptr, setInRange, shuffle, bulbsort, getParentNode, cloneObj, numFormat, avg, percent, calcDistance, getMatchList, getSubMatchList, removeFromList, arrContains, } from '../tools/utils';
import * as common from '../tools/common';
import { DEBUG, CONFIG, CACHE, } from '../config/config';

export default {
    name: 'Home',
    data(){
        return {
            loading: false,
            pageState: 0, // 页面状态【0:读取数据中|1：战斗准备完成|2：累积行动条|3：战斗-操作中|4：动画|5：buff编辑|99：离开】

            menuState: 0, // 操作面板出现状态【0:不显示|1：基础选项|2：攻击选项|3：技能选项|4：选择单位|5：选择属性】
            boardTip: '', // 战场公示文字
            menuTip: '', // 菜单公示文字
            menuExpand: 0, // 菜单展开标识

            curUnits: [], // 本帧行动单位数组
            curUnitsIndex: -1, // 本帧行动单位数组下标

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

            playerTeam:[],
            enemyTeam:[],

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
        window.GLOBAL.battle = {
            mode: 1, // 战斗模式【1:普通|2：BOSS|3：切磋】
            envirs: {
                mapId: 1,
                cellId: 2,
            },
            playerTeamIds: [1,2,3,4,],
            enemyTeamIds: [11,12,13,14,],
        }
        _nus[1].es[0] = 1;
        _nus[1].es[1] = 4;
        _nus[2].es[0] = 4;
        window.GLOBAL.allUnits = _nus;
        window.GLOBAL.allEquips = [];
        window.GLOBAL.allEquips.push(common.genEquip({id:1,game:{},level:r(9,9),type:r(1,1)}));
        window.GLOBAL.allEquips.push(common.genEquip({id:2,game:{},level:r(9,9),type:r(1,5)}));
        window.GLOBAL.allEquips.push(common.genEquip({id:3,game:{},level:r(9,9),type:r(1,5)}));
        window.GLOBAL.allSkills =  [{ // 全部技能
            	id: 1,
            	n: '治疗术',
            	t: [7,3,],// 技能类型
            	bid: [1,2,], // 添加的状态ID
                bls: [1,1,], // 状态等级
            	csm: 4, // 体力消耗
                des: '治疗，获得1级急救和1级抵挡。',
        },];


        if(window.GLOBAL&&window.GLOBAL.battle){ // TODO
            this.game = window.GLOBAL;
            this.init();
            console.log(this.game);
            console.log(this.battleData);
        }
        else{
            this.$router.push('/');
        }
    },
    methods: {
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
            this.$nextTick(_=>{
                switch(flag){
                    case 1: // 战斗开始

                    break;
                    case 2: // 行动力推进
                        for(let unit of allUnits){
                            unit.btd.cur = 0;
                        }
                        this.menuState = 0;
                        this.movementProcess();
                    break;
                    case 3: // 进行操作
                        this.curUnitsIndex = 0;
                        this.exeCurUnit();
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
        movementProcess(){ // 行动条进展
            let allUnits = [...this.playerTeam,...this.enemyTeam];
            let allAliveUnits = getSubMatchList(allUnits,[['alive',1]],'btd');
            let stop = 0, tickCount = 0;
            let curUnits = []; // 可行动单位数组
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
                        curUnits.push(unit);
                    }
                }
                // 根据超出行动力，对本帧行动者数组进行逆向排序
                curUnits = bulbsort(curUnits,'overflowMove',1);
                this.curUnits = curUnits;
            }
            calcTickCount();
            for(let unit of curUnits){ // 所有本帧行动者行动条归零
                unit.btd.move = 0;
            }
            this.$nextTick(_=>{
                this.goPageState(3);
                // for(let u of this.curUnits){ console.log(u.nm); }
            });
        },
        exeCurUnit(){ // 执行本帧行动者的动作
            let curUnit = this.curUnits[this.curUnitsIndex];
            this.$nextTick(_=>{
                let _n = curUnit.btd.name;
                curUnit.btd.name = 'JK';
                curUnit.btd.name = _n;
                curUnit.btd.cur = true;
                if(curUnit.btd.isPlayer){ // 玩家
                    this.menuState = 1;
                    this.menuTip = `${curUnit.btd.name}行动：`;
                }
                else{ // 人机
                    this.goPageState(4);
                }
            })
        },

        onTapStartBattle(){ // 点击【开始战斗】
            this.goPageState(2);
        },
        onTapUnit(data,evt){ // 点击【单位图标】
            let { flag, unit, buff, } = data;
            let btd = unit.btd;
            evt.stopPropagation();
            evt.preventDefault();
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
            return false;
        },
        onTapPop(){ // 点击【弹窗-关闭】
            this.viewingUnit = null;
            this.showMenuGuide = 0;
        },
        onTapMenuHelp(){ // 点击【菜单-？】
            this.showMenuGuide = !this.showMenuGuide;
        },
        onTapMenuExpand(){ // 点击【菜单-展开】
            this.menuExpand = !this.menuExpand;
        },
        onTapMenu(flag){ // 点击【执行操作】 0不显示 1基础选项 2攻击选项 3技能选项 4选择单位 5选择属性
            let nextStep = _ =>{
                this.goPageState(2);
            }
            if(flag==1){ // 攻击
                nextStep();
            }
            else if(flag==2){ // 技能
                nextStep();
            }
            else if(flag==3){ // 防御
                nextStep();
            }
            else if(flag==4){ // 躲避
                nextStep();
            }
            else if(flag==5){ // 恢复
                nextStep();
            }
            else if(flag==6){ // 话术
                nextStep();
            }
            else if(flag==7){ // 追踪
                nextStep();
            }
            else if(flag==8){ // 撤离
                nextStep();
            }
        },

        _alert(text,time){ // 显示提示
            this.$refs.toast.trigger(text,time);
        },

        onTapCheat(){ // 点击【作弊】按钮
            this.goPageState(2);
        },
    },
    components:{
        Toast,
        Unit1,
        Unit2,
        Equip,
        Pop,
        Bar1,
        Bar2,
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
        box-shadow: 0 0 .14rem #2F4F4F inset;
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
        overflow-y: auto;
        z-index: 2000;
        box-shadow: 0 -.03rem .04rem #8ae4f1;
        transition: all .2s;
    }
    .menu-wrap-expand{
        height: 100%;
    }
    .menu-wrap .btn-help,
    .menu-wrap .btn-expand{
        display: inline-block;
        position: absolute;
        top: .14rem;
        height: .3rem;
        line-height: .3rem;
        font-size: .2rem;
        font-weight: bold;
    }
    .menu-wrap .btn-help{
        width: .3rem;
        right: .16rem;
        border-radius: 50%;
    }
    .menu-wrap .btn-expand{
        width: 3rem;
        right: .56rem;
        text-align: right;
        border: none;
        box-shadow: none;
        padding-right: .2rem;
        color: #8ae4f1;
    }
    .menu{
        width: 100%;
        height: 100%;
        padding: .2rem .35rem;
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

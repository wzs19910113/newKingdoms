<template>
    <div class="main">
        <h1 class="title"><i>- 悬赏令 -</i></h1>
        <div class="block" v-show="state==0">
            <a class="btn btn-newgame" @click="onTapNewGame">新游戏</a>
            <a class="btn btn-load" @click="onTapLoad" v-if="storage">读档</a>
        </div>
        <div class="block" v-show="state==1">
            <div class="row">
                <div class="lab">你的名字</div>
                <input class="inp" v-model="name" placeholder="你的姓名" :disabled="false"/>
            </div>
            <div class="row">
                <div class="lab">你的性别</div>
                <div class="radio-group">
                    <a class="btn" :class="`${gender==1?'btn-sel':''}`" @click="onTapGender(1)">男</a>
                    <a class="btn" :class="`${gender==0?'btn-sel':''}`" @click="onTapGender(0)">女</a>
                </div>
            </div>
            <div class="row">
                <div class="lab">你的年龄</div>
                <input class="inp" v-model="age" type="number" placeholder="你的年龄" :disabled="false"/>
            </div>
            <div class="row row-bot">
                <a class="btn btn-start" @click="onTapStart">开始游戏</a>
                <a class="btn btn-back" @click="onTapBack">返回</a>
            </div>
        </div>
        <!-- alert -->
        <Toast ref="toast-alert" />
        <!-- confirm -->
        <Toast ref="toast-confirm" />
    </div>
</template>

<script>
// Copyright (c) 2018 Copyright Holder All Rights Reserved.
import Toast from '../components/Toast';
import Pop from '../components/Pop';

import { query, r, exptr, setInRange, shuffle, bulbsort, getParentNode, cloneObj, numFormat, avg, percent, calcDistance, getMatchList, getSubMatchList, removeFromList, arrContains, } from '../tools/utils';
import * as common from '../tools/common';
import { DEBUG, CONFIG, CACHE, ASSETS, PRESETS, } from '../config/config';

export default {
    name: 'Start',
    data(){
        return {
            state: 0,

            name: '',
            gender: 0,
            age: 16,

            game: {},

            storage: null,

            common,
            ASSETS,
            CONFIG,
            PRESETS,
            DEBUG,
        };
    },
    mounted(){
        window.GLOBAL.game = null;
        this.game = cloneObj(CONFIG.initGameData);

        let _storage = localStorage.getItem(CACHE.sto);
        let storage = JSON.parse(_storage);
        this.storage = storage;
        this.name = common.genRoleName(this.gender);
    },
    methods: {
        onTapNewGame(){ // 点击【新游戏】
            this.state = 1;
        },
        onTapGender(flag){ // 点击【性别选项】
            this.gender = flag;
        },
        onTapBack(){
            this.state = 0;
        },
        onTapLoad(){ // 点击读档按钮
            try{
                localStorage.setItem(CACHE.sto,JSON.stringify(this.storage));
                this.$router.push('home');
            }
            catch(err){
                this._alert(`读取存档失败（${err}）`);
            }

        },
        onTapStart(){ // 点击【开始游戏】
            let { name, gender, age, } = this;
            // 校对格式
            if(name.length<=0){
                this._alert('输入名字');
                return;
            }
            if(name.length>4){
                this._alert('名字过长');
                return;
            }
            if(age<=5||age>199){
                this._alert('无效年龄');
                return;
            }
            // 校对通过，生成游戏初始数据
            this.genGameData({name,gender,age});

            let begin = _ =>{
                try{
                    let newStorage = this.game;
                    localStorage.setItem(CACHE.sto,JSON.stringify(newStorage));
                    localStorage.setItem(CACHE.tm,1);
                    this.$router.push('home');
                }
                catch(err){
                    this._alert(`存储失败（${err}）`);
                }
            }

            let _storage = localStorage.getItem(CACHE.sto);
            if(_storage){
                this._confirm(`创建新游戏会覆盖以前的存档，确定要创建吗？`,_=>{
                    begin();
                });
            }
            else{
                begin();
            }
        },

        genGameData({}){ // 生成随机的游戏数据
            // 载入预设数据
            this.loadPresets();
            // 生成我
            let me = this.genMe();
            this.genBosses();
            this.genAllMaps();
            this.game.wantedList = common.genWantedList(this.game);
            // 生成其他角色 @test
            // let tempUnitList = [],tempEquipList = [], tempSkillList = [];
            // for(let i=0;i<15;i++){ // @test
            //     let unit = common.genUnit({
            //         id: i+1,
            //         game: this.game,
            //         level: 1,
            //         equipList: tempEquipList,
            //         skillList: tempSkillList,
            //     });
            //     tempUnitList.push(unit);
            //     if(i==7){
            //         unit.rel = 2;
            //     }
            //     else{
            //         unit.rel = 1;
            //     }
            //     if(i<3){
            //         unit.tms = 1;
            //         unit.rel = 3;
            //     }
            // }
            // for(let unit of tempUnitList){
            //     let newUnit = common.registerUnit({
            //         unit,
            //         game: this.game,
            //         equipList: tempEquipList,
            //         skillList: tempSkillList,
            //     });
            // }
            // me.es = cloneObj(this.game.allUnits[4].es);
            // me.ss = cloneObj(this.game.allUnits[4].ss);
            // me.b = cloneObj(this.game.allUnits[4].b);
        },
        genMe(){ // 生成主角
            let unit = common.genUnitData({
                id: this.game.unitIndex++,
                game: this.game,
                level: 4,
                gender: this.gender,
                name: this.name,
                age: this.age,
                tms: 1,
                rel: 3,
            });
            let skill1Consume = 12+r(0,7);
            let skill2Consume = 10+r(0,6);
            let melee = unit.as[4]>unit.as[5];
            let skill2Attack;
            // unit.as[0] = 100000; // @test
            // unit.st[0] = 100000; // @test
            if(melee){
                skill2Attack = {
        			n: '挥砍',
        			d: 2+Math.ceil(skill2Consume*2.1), // 基础伤害
        			r1: 0, // 力量补正
        			r2: 0, // 精准补正
        			b: [], // buff制造表（buff id）
        			bl: [], // buff等级表（1-9）
        			s: 0, // SP效果 1压制 2破盾 3气溃 4漩流 5锁敌 6攻心 7摸金
        			sl: 0, // SP效果等级
        			a: 0, // 目标是否为全体
        			c: 0, // 体力消耗
        			et: 1, // 特效类型 1劈砍 2钝击 3子弹 4飞刀 5火炮 6雷击
        			sid: this.game.skillIndex+1, // 所属的技能id
        			eid: 0, // 所属的武器id
        		}
            }
            else{
                skill2Attack = {
        			n: '射击',
        			d: 2+Math.ceil(skill2Consume*2.1), // 基础伤害
        			// d: 33, // 基础伤害
        			r1: 0, // 力量补正
        			r2: 0, // 精准补正
        			b: [], // buff制造表（buff id）
        			bl: [], // buff等级表（1-9）
        			s: 0, // SP效果 1压制 2破盾 3气溃 4漩流 5锁敌 6攻心 7摸金
        			sl: 0, // SP效果等级
        			a: 0, // 目标是否为全体
        			c: 0, // 体力消耗
        			et: 3, // 特效类型 1劈砍 2钝击 3子弹 4飞刀 5火炮 6雷击
        			sid: this.game.skillIndex+1, // 所属的技能id
        			eid: 0, // 所属的武器id
        		}
            }
            let skill1 = {
                id: this.game.skillIndex++,
            	l: 1, // 等级(1-9)
            	n: '轻语',
            	t: 1, // 1自己 2我方单体 3敌方单体
            	el: [{ // 技能效果数组
                    t: 4, // 效果类型【 1攻击 2添加状态 3减弱一个增益状态 4削减一个减益状态 5恢复生命 6改变护甲 7改变潜能 8改变心防 9改变存在感】
            		// 攻击方式{...attack}，添加的状态-等级数组{ b:[1,2], bl:[3,4],}，
            		// 固疗和百分疗 { h:100, rx:35, }，心防固定修改值和定力、智力补正 { d:100, rx1:0, rx2:44, }
            		// 潜能补正 { d:100, rx:35, }，存在感 { d:100, rx:35, }
            		// 减弱状态强度 7
            		d: 1,
                },{ t: 5, d: { h:Math.ceil(skill1Consume*4)+5, rx:0, },},],
            	c: skill1Consume, // 体力消耗
            	d: 1200, // 存在感
            	o: 1, // 顺位
            };
            let skill2 = {
                id: this.game.skillIndex++,
            	l: 1,
            	n: melee?'龙虾斩':'流水箭',
            	t: 3, // 3敌方单体
            	el: [{
                    t: 1,
            		d: skill2Attack,
                },],
            	c: skill2Consume, // 体力消耗
            	d: 2000+(300-unit.as[9]*5)*25, // 存在感
            	o: 1, // 顺位
            };
            skill1.v = common.calcSkillValue(skill1);
            skill2.v = common.calcSkillValue(skill2);

            unit.ss.push(skill2.id);
            unit.ss.push(skill1.id);
            unit.g = 0;
            unit.nk = `穿越者`;

            this.game.allUnits.push(unit);
            this.game.allSkills.push(skill1);
            this.game.allSkills.push(skill2);
            return unit;
        },
        genBosses(){ // 生成所有boss
            let tempUnitList = [], tempEquipList = [], tempSkillList = [];
            for(let i=0;i<CONFIG.mapConfigs.length;i++){
                let mapConfig = CONFIG.mapConfigs[i];
                let { type, level, bosses, } = mapConfig;
                if(type==2){
                    for(let boss of bosses){
                        let unit = common.genUnit({
                            id: boss.id,
                            game: this.game,
                            level,
                            inten: boss.inten,
                            nickname: boss.title,
                            equipList: tempEquipList,
                            skillList: tempSkillList,
                            rel: 0,
                            isBoss: true,
                        });
                        tempUnitList.push(unit);
                    }
                }
            }
            for(let unit of tempUnitList){
                let newUnit = common.registerUnit({
                    unit,
                    game: this.game,
                    equipList: tempEquipList,
                    skillList: tempSkillList,
                });
                common.recoverUnit(newUnit,this.game);
            }
        },
        genAllMaps(){ // 生成所有地图数据
            let mapList = [];
            let newMap;
            for(let mapConfig of CONFIG.mapConfigs){
                newMap = common.genMapData(mapConfig);
                mapList.push(newMap);
            }
            this.game.mapList = mapList;
        },
        loadPresets(){ // 载入预设数据
            // 载入预设角色
            for(let unit of PRESETS.unitList){
                let cUnit = cloneObj(unit);
                let newUnit = common.genUnitData({id:cUnit.id,level:cUnit.level,game:this.game,});
                for(let key in cUnit){
                    newUnit[key] = cUnit[key];
                }
                this.game.allUnits.push(newUnit);
            }
            // 载入预设技能
            for(let skill of PRESETS.skillList){
                this.game.allSkills.push(skill);
            }
            // 载入预设装备
            for(let equip of PRESETS.equipList){

            }
            // 生成初始随机装备
            for(let i=1;i<=3;i++){
                let type = 1;
                if(i>1){
                    type = r(2,5);
                }
                let newEquip = common.genEquipData({id:this.game.equipIndex++,level:1,type,game:this.game,});
                this.game.allUnits[0].b.push(newEquip.id); // 放入商人酒保的背包
                this.game.allEquips.push(newEquip);
            }
        },

        _alert(text,time){ // 显示提示
            this.$refs['toast-alert'].trigger(text,time);
        },
        _confirm(confirmTip,onTapConfirm){ // 显示确认文本
            this.$refs['toast-confirm'].showConfirm({ confirmTip, onTapConfirm, });
        },
    },
    components:{
        Toast,
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
        padding-top: .01rem;
        color: #fff;
        font-size: .24rem;
        line-height: 0;
        background-color: #140425;
        box-shadow: 0 0 1.35rem #000 inset;
    }
    .title{
        height: 1rem;
        line-height: 1rem;
        font-size: .5rem;
        margin-top: 1rem;
        color: #4F4F4F;
        animation: titleFlash 1s ease-in-out infinite;
    }
    @keyframes titleFlash{
        50%{
            color: #4F4F4F;
        }
        75%{
            color: #acacac;
        }
        80%{
            color: #4F4F4F;
        }
        90%{
            color: #acacac;
        }
        100%{
            color: #4F4F4F;
        }
    }
    .btn{
        display: block;
        margin: 0 auto;
        width: 1.6rem;
        height: .6rem;
        line-height: .6rem;
        font-size: .3rem;
    }
    .block{
        width: 7rem;
        height: calc( 100% - 3.5rem );
        padding: .1rem;
        margin: 0 auto;
        overflow-y: auto;
    }
    .row{
        width: 100%;
        min-height: 1.2rem;
        margin-bottom: .42rem;
    }
    .row-bot{
        margin-top: 1.4rem;
    }
    .row .lab{
        display: block;
        min-height: .6rem;
        line-height: .6rem;
        color: #afafaf;
    }
    .row .inp{
        min-height: .6rem;
        text-align: center;
        margin: 0 auto;
        -webkit-appearance: none;
        border: none;
        background-color: transparent;
        background-image: linear-gradient(to bottom, transparent 0%, #2F4F4F 100%);
        width: 4rem;
        height: .6rem;
        line-height: .6rem;
        padding: 0 .06rem;
        font-size: .34rem;
        color: #fff;
    }
    .radio-group{
        width: 4.2rem;
        display: flex;
        margin: 0 auto;
        justify-content: space-around;
        align-items: center;
    }
    .radio-group .btn{
        width: 2rem;
        height: .8rem;
        line-height: .8rem;
    }
    .radio-group .btn-sel{
        background-color: transparent;
        background-image: linear-gradient(to bottom, transparent 0%, #2F4F4F 100%);
    }

</style>

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
        <Toast ref="toast" />
    </div>
</template>

<script>
// Copyright (c) 2018 Copyright Holder All Rights Reserved.
import Toast from '../components/Toast';
import Pop from '../components/Pop';

import { query, r, exptr, setInRange, shuffle, bulbsort, getParentNode, cloneObj, numFormat, avg, percent, calcDistance, getMatchList, getSubMatchList, removeFromList, arrContains, } from '../tools/utils';
import * as common from '../tools/common';
import { DEBUG, CONFIG, CACHE, ASSETS, } from '../config/config';

export default {
    name: 'Start',
    data(){
        return {
            state: 0,

            name: '',
            gender: 0,
            age: 16,

            game: {
            	day: 1,
            	currentMapID: 1, // 当前所在地图ID
            	guard: 0, // 警戒值 0-1000000

            	allUnits: [], // 角色
            	unitIndex: 101, // 角色 ID 索引
            	allEquips: [], // 装备
            	equipIndex: 101, // 装备 ID 索引
            	allSkills: [], // 技能
            	skillIndex: 101, // 技能 ID 索引
            	conqueredMapIDList: [], // 已经攻克的地牢ID数组
            },

            storage: null,

            common,
            ASSETS,
            CONFIG,
            DEBUG,
        };
    },
    mounted(){
        window.GLOBAL = {
            game: null, // 游戏数据
        }

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
                window.GLOBAL.game = this.storage;
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

            window.GLOBAL.game = this.game;

            try{
                let newStorage = window.GLOBAL.game;
                localStorage.setItem(CACHE.sto,JSON.stringify(newStorage));
                this.$router.push('home');
            }
            catch(err){
                this._alert(`存储失败（${err}）`);
            }
        },

        genGameData({}){ // 生成随机的游戏数据
            // 生成角色
            let me = this.genMe();
            let tempUnitList = [],tempEquipList = [], tempSkillList = [];
            for(let i=0;i<3;i++){ // @test
                let unit = common.genUnit({
                    id: i+1,
                    game: this.game,
                    level: i+1,
                    equipList: tempEquipList,
                    skillList: tempSkillList,
                });
                tempUnitList.push(unit);
                if(i<3){
                    unit.tms = 1;
                }
            }
            for(let unit of tempUnitList){
                let newUnit = common.registerUnit({
                    unit,
                    game: this.game,
                    equipList: tempEquipList,
                    skillList: tempSkillList,
                });
            }
            me.es = cloneObj(this.game.allUnits[3].es);
            me.ss = cloneObj(this.game.allUnits[3].ss);
            me.b = cloneObj(this.game.allUnits[3].b);
        },
        genMe(){ // 生成主角
            let unit = common.genUnitData({
                id: this.game.unitIndex++,
                game: this.game,
                level: 1,
                gender: this.gender,
                name: this.name,
                age: this.age,
                tms: 1,
                rel: 3,
                icon: r(1,3),
            });
            let firstSkillConsume = 5+r(0,3);
            let skill = {
                id: this.game.skillIndex++,
            	l: 1, // 等级(1-9)
            	n: '轻语',
            	t: 1, // 1自己 2我方单体 3敌方单体
            	el: [{ // 技能效果数组
                    t: 3, // 效果类型【 1攻击 2添加状态 3减弱一个增益状态 4削减一个减益状态 5恢复生命 6改变护甲 7改变潜能 8改变心防 9改变存在感】
            		// 攻击方式{...attack}，添加的状态-等级数组{ b:[1,2], bl:[3,4],}，
            		// 固疗和百分疗 { h:100, rx:35, }，心防固定修改值和定力、智力补正 { d:100, rx1:0, rx2:44, }
            		// 潜能补正 { d:100, rx:35, }，存在感 { d:100, rx:35, }
            		// 减弱状态强度 7
            		d: 1,
                },{ t: 5, d: { h:firstSkillConsume+9, rx:0, },},],
            	c: firstSkillConsume, // 体力消耗
            	d: 1200, // 存在感
            	o: 1, // 顺位
            };
            skill.v = common.calcSkillValue(skill);

            unit.ss.push(skill.id);
            unit.g = 0;

            this.game.allUnits.push(unit);
            this.game.allSkills.push(skill);
            return unit;
        },

        _alert(text){ // 显示提示
            this.$refs.toast.trigger(text);
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

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
import { DEBUG, CONFIG, CACHE, } from '../config/config';

export default {
    name: 'Start',
    data(){
        return {
            state: 0,

            name: '',
            gender: 0,
            age: 16,

            game: {
                money: 0, // 资金
                day: 0, // 日期-天
                hour: 0, // 日期-小时
                currentMapID: 101, // 当前所在地图ID
                luck: 0, // 夺宝能力

                allUnits: [], // 角色
                unitIndex: 101, // 角色 ID 索引
                allEquips: [], // 装备
                equipIndex: 101, // 装备 ID 索引
                allSkills: [], // 技能
                skillIndex: 101, // 技能 ID 索引
                allMaps: [], // 地图
            },

            storage: null,
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
            // 生成装备
            for(let i=0;i<3;i++){
                this.genEquip(1,r(1,5));
            }
            for(let i=0;i<2;i++){
                // this.genSkill(r(1,9),1);
                this.genSkill(1,);
            }
        },
        genEquip(level,type){ // 生成一个装备
            let equip = common.genEquip({
                id: this.game.equipIndex++,
                game: this.game,
                level,
                type,
            });
            this.game.allEquips.push(equip);
        },
        genSkill(level,beni){ // 生成一个技能
            let skill = common.genSkill({
                id: this.game.skillIndex++,
                game: this.game,
                level,
                beni,
            });
            this.game.allSkills.push(skill);
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

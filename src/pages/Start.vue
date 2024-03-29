<template>
    <div class="main">
        <h1 class="title"><i>New Kindoms</i></h1>
        <div class="wrap" v-show="state==0">
            <nut-button class="btn btn-newgame" @click="newgame">新游戏</nut-button>
            <nut-button class="btn btn-read" @click="read" v-if="storageList.length>0">读档</nut-button>
        </div>
        <div class="wrap" v-show="state==1" style="margin-bottom:1.2rem">
            <div class="row">
                <div class="label">你的名字：</div>
                <nut-textinput class="input" v-model="name" placeholder="君主的姓名" :disabled="false"/>
            </div>
            <div class="row">
                <div class="label">你的性别：</div>
                <div class="radio-group input">
                    <a class="btn" :class="`${gender==1?'btn-sel':''}`" @click="gender=1">男</a>
                    <a class="btn" :class="`${gender==0?'btn-sel':''}`" @click="gender=0">女</a>
                </div>
            </div>
            <div class="row">
                <div class="label">你的年龄</div>
                <nut-slider class="input" v-model="age" :range="[16,60]" :showLabel="true" :showLabelAlways="true" :showRangeTxt="true"></nut-slider>
            </div>
            <div class="h-line"></div>
            <div class="row">
                <div class="label">可用能力点数：</div>
                <div class="input abi-point" :class="`${calcAbiPoint()<0?'abi-point-ban':''}`"><b>{{calcAbiPoint()}}</b></div>
            </div>
            <div class="row">
                <div class="label">你的统率</div>
                <nut-slider class="input" v-model="lea" :range="[1,100]" :showLabel="true" :showLabelAlways="true" ></nut-slider>
            </div>
            <div class="row">
                <div class="label">你的武力</div>
                <nut-slider class="input" v-model="str" :range="[1,100]" :showLabel="true" :showLabelAlways="true" ></nut-slider>
            </div>
            <div class="row">
                <div class="label">你的智谋</div>
                <nut-slider class="input" v-model="int" :range="[1,100]" :showLabel="true" :showLabelAlways="true" ></nut-slider>
            </div>
            <div class="row">
                <div class="label">你的人脉</div>
                <nut-slider class="input" v-model="net" :range="[1,100]" :showLabel="true" :showLabelAlways="true" ></nut-slider>
            </div>
            <div class="h-line"></div>
            <div class="row">
                <div class="label">初始同伴数量<br/><small class="label-tip">(同伴越少能力越强)</small></div>
                <nut-slider class="input" v-model="partnerCount" :range="[1,4]" :showLabel="true" :showLabelAlways="true" :showRangeTxt="true" ></nut-slider>
            </div>
            <div class="h-line"></div>
            <div class="row">
                <div class="label">阵营数量</div>
                <nut-slider class="input" v-model="campCount" :range="[3,8]" :showLabel="true" :showLabelAlways="true" :showRangeTxt="true" ></nut-slider>
            </div>
            <div class="h-line"></div>
            <nut-textinput class="row code" ref="code" v-model="newcode" label="" placeholder="输入新的存档代码，用于存档" :disabled="false"/>
            <nut-button class="btn btn-start" @click="start">开始游戏</nut-button>
            <nut-button class="btn btn-back" @click="back">返回</nut-button>
        </div>
        <div class="wrap" v-show="state==2">
            <nut-textinput class="row code" v-model="loadcode" label="" placeholder="输入存档代码" :disabled="false"/>
            <nut-button class="btn btn-load" @click="load">继续游戏</nut-button>
            <nut-button class="btn btn-back" @click="back">返回</nut-button>
            <div class="storage-list-wrap" v-if="storageList.length>0">
                <div class="storage-list-title">存档列表 &nbsp;<a class="btn btn-truncate" @click="onTapTruncate">清空所有存档</a></div>
                <div class="storage-list-head">
                    <span class="storage-code">存档代码</span>
                    <span class="storage-lord">君主</span>
                    <span class="storage-campCount">阵营数</span>
                    <span class="storage-day">进度</span>
                </div>
                <div class="storage-list">
                    <a @click="onTapStorage(storage)" class="storage" v-for="(storage,index) in storageList">
                        <span class="storage-code">{{storage.code}}</span>
                        <span class="storage-lord">{{storage.data.game.roleList[0].name}}</span>
                        <span class="storage-campCount">{{storage.data.game.campList.length}}</span>
                        <span class="storage-day">{{storage.data.day}} 天</span>
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
// Copyright (c) 2018 Copyright Holder All Rights Reserved.
import { query, r, exptr, shuffle, bulbsort, getParentNode, cloneObj, numFormat, avg, percent, calcDistance, getMatchList, removeFromList, } from '../tools/utils';
import { DEBUG, CONFIG, CACHE, } from '../config/config';
export default {
    name: 'Start',
    data(){
        return {
            loading: false,
            state: 0,
            loadcode: localStorage.getItem(CACHE.code)||'',
            newcode: '',
            name: '',
            gender: 1,
            age: 16,
            lea: 1,
            str: 1,
            int: 1,
            net: 1,
            campCount: 3,
            partnerCount: 1,

            storageList: [],
        };
    },
    mounted(){
        window.GLOBAL = {
            game: null, // 游戏数据
        }

        let _storageList = localStorage.getItem(CACHE.list)||'[]';
        let storageList = JSON.parse(_storageList);
        this.storageList = storageList;
    },
    methods: {
        start(){
            let abiPoint = this.calcAbiPoint();
            if(this.loading) return;
            if(this.name.length<=0){
                this.$toast.text('输入君主名字');
                return;
            }
            if(this.name.length>6){
                this.$toast.text('君主名字过长');
                return;
            }
            if(abiPoint<0){
                this.$toast.text('能力点数不足');
                return;
            }
            if(this.newcode.length<=0){
                this.$toast.text('输入一个代码');
                this.$refs.code.focus();
                return;
            }
            if(this.newcode.length>10){
                this.$toast.text('代码过长');
                this.$refs.code.focus();
                return;
            }
            let initConfig = {
                    name: this.name,
                    gender: this.gender,
                    age: this.age,
                    lea: this.lea,
                    str: this.str,
                    int: this.int,
                    net: this.net,
                    campCount: this.campCount,
                },
                game = this.genGameData(initConfig); // 生成游戏初始数据
            this.loading = true;
            this.loading = this.$toast.loading();
            window.GLOBAL.game = game;
            window.GLOBAL.day = 1;

            let _storageList = localStorage.getItem(CACHE.list)||'[]';
            let storageList = JSON.parse(_storageList);
            // 遍历存档
            let savedStorage;
            for(let storage of storageList){
                if(storage.code==this.newcode){
                    savedStorage = storage;
                    break;
                }
            }
            if(savedStorage){ // 已有存档
                this.$toast.text('该存档代码已存在，请使用其他代码');
            }
            else{ // 没有该存档
                try{
                    let newStorage = {
                        code: this.newcode,
                        data: window.GLOBAL,
                    }
                    storageList.push(newStorage);
                    _storageList = JSON.stringify(storageList);
                    localStorage.setItem(CACHE.list,_storageList);
                    localStorage.setItem(CACHE.code,this.newcode);
                    this.$router.push('home');
                }
                catch(err){
                    this.$toast.text(`存储失败（${err}）`);
                }
            }
            this.loading.hide();
            this.loading = null;
        },
        back(){
            if(this.loading) return;
            this.state = 0;
        },
        newgame(){
            if(this.loading) return;
            this.name = '王正';
            this.newcode = 'fff';
            this.state = 1;
        },
        read(){
            if(this.loading) return;
            this.state = 2;
        },
        load(){
            if(this.loading) return;
            if(this.loadcode.length<=0) return;
            this.loading = true;
            this.loading = this.$toast.loading();

            let _storageList = localStorage.getItem(CACHE.list)||'[]';
            let storageList = JSON.parse(_storageList);
            // 遍历存档
            let savedStorage;
            for(let storage of storageList){
                if(storage.code==this.loadcode){
                    savedStorage = storage;
                    break;
                }
            }
            if(savedStorage){ // 已有存档
                window.GLOBAL = savedStorage.data;
                localStorage.setItem(CACHE.code,this.loadcode);
                this.$router.push('home');
            }
            else{ // 没有该存档
                this.$toast.text('找不到该存档');
            }
            this.loading.hide();
            this.loading = null;
        },
        calcAbiPoint(){ // 计算能力虽大值
            return 134-(this.lea+this.str+this.int+this.net)+Math.round(120/this.partnerCount);
        },

        onTapStorage(storage){ // 点击【存档】按钮
            this.loadcode = storage.code;
        },
        onTapTruncate(){ // 点击【清空所有存档】按钮
            let _this = this;
            this.$dialog({
                title: '确定清空所有存档？',
                onOkBtn: function(){
                    _this.deleteAllStorange();
                    this.close();
                }
            });
        },
        deleteAllStorange(){ // 清空所有存档
            localStorage.removeItem(CACHE.list);
            localStorage.removeItem(CACHE.code);
            this.storageList = [];
            this.loadcode = '';
            if(this.storageList.length<=0){
                this.state = 0;
            }
        },
        genGameData({name,gender,age,lea,str,int,net,campCount}){ // 生成随机的游戏数据 TODO
            let map = [];
            let campList = [];
            let roleList = [];
            let data;
            // 初始化地图
            let cellIdIndex = 0;
            for(let y=0;y<CONFIG.mapHeight;y++){
                let row = [];
                let rowLength = CONFIG.mapWidth;
                if(y%2==0){
                    rowLength -= 1;
                }
                for(let x=0;x<rowLength;x++){
                    let newCell = {
                        id: cellIdIndex++,
                        state: 0,
                        camp: 0,
                        color: 'green',
                    }
                    row.push(newCell);
                }
                map.push(row);
            }

            // 初始化阵营列表
            campList.push({
                money: 1000,
                food: 50,
                cityList: [],
            });
            // 初始化角色列表
            let lord = {
                name,gender,age,lea,str,int,net,
            }
            roleList.push(lord);
            // 合成初始数据
            data = { map, campList, roleList, };
            return data;
        },
    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .main{
        text-align: center;
        width: 100%;
        min-height: 100%;
        padding: 2rem .3rem 0 .3rem;
        border: #ff4f18 .2rem solid;
    }
    .title{
        font-size: 1rem;
        margin-bottom: 1rem;
    }
    .h-line{
        margin: .8rem 0;
        width: 100%;
        height: 1px;
        background-image: linear-gradient(to right, rgba(0,0,0,0) 0%, #aaa 50%, rgba(0,0,0,0) 100%);
    }
    .wrap{

    }
    .row{
        display: flex;
        align-items: center;
        justify-content: flex-start;
        margin-bottom: .55rem;
    }
    .row .label,.row. .input{

    }
    .row .label .label-tip{
        color: #777;
    }
    .row .label{
        width: 2.5rem;
        white-space: nowrap;
        word-break: keep-all;
        text-align: right;
        padding-right: .1rem;
    }
    .row .input{
        width: 5rem;
    }
    .row .abi-point{
        text-align: left;
        padding: 0 10px;
    }
    .row .abi-point b{
        font-size: 18px;
    }
    .row .abi-point-ban{
        color: #f0250f;
    }
    .btn{
        display: block;
        width: 4rem;
        margin: 0 auto .3rem auto;
    }
    .code{
        width: 6rem;
        margin-left: auto;
        margin-right: auto;
    }
    .radio-group{
        display: flex;
        justify-content: space-around;
        align-items: center;
    }
    .radio-group .btn{
        display: inline-block;
        width: 50%;
        margin: 0;
    }
    .radio-group .btn-sel{
        color: #fff;
        background-color: #f0250f;
        font-weight: bold;
        border: 1px solid #f0250f;
    }

    /* 存档列表 */
    .storage-list-wrap{
        width: 6rem;
        margin: 0 auto;
        color: #4a4a4a;
    }
    .storage-list-title{
        height: .5rem;
        line-height: .5rem;
        text-align: left;
        border-bottom: 1px solid #848484;
        font-size: .3rem;
    }
    .btn-truncate{
        display: inline-block;
        float: right;
        color: orange;
        margin: 0;
        width: auto;
        padding: 0 4px;
        font-size: .2rem;
    }
    .storage-list-head,.storage{
        display: flex;
        justify-content: space-around;
        align-items: center;
        width: 100%;
        height: .5rem;
        line-height: .5rem;
        font-size: .24rem;
    }
    .storage-list-head{
        color: #848484;
    }
    .storage-list{
        max-height: 2rem;
        overflow-y: auto;
    }
    .storage{
        background-color: #eaeaea;
        border-bottom: 1px solid #fff;
    }
    .storage-code,.storage-lord,.storage-day,.storage-campCount{
        white-space: nowrap;
        word-break: keep-all;
        overflow: hidden;
        text-overflow: ellipsis;
        padding: 0 4px;
    }
    .storage-code{
        width: 30%;
    }
    .storage-lord{
        width: 20%;
    }
    .storage-day{
        width: 20%;
    }
    .storage-campCount{
        width: 30%;
    }
</style>

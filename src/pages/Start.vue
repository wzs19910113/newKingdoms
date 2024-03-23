<template>
    <div class="main">
        <h1 class="title"><i>Molopoly</i></h1>
        <div class="wrap" v-show="state==0">
            <nut-button class="btn btn-newgame" @click="newgame">新游戏</nut-button>
            <nut-button class="btn btn-read" @click="read" v-if="storageList.length>0">读档</nut-button>
        </div>
        <div class="wrap" v-show="state==1" style="margin-bottom:1.2rem">
            <div class="row">
                <div class="label">你的名字：</div>
                <nut-textinput class="input" v-model="myname" placeholder="公司创始人的姓名" :disabled="false"/>
            </div>
            <div class="row">
                <div class="label">你的性别：</div>
                <div class="radio-group input">
                    <a class="btn" :class="`${mygender==1?'btn-sel':''}`" @click="mygender=1">男</a>
                    <a class="btn" :class="`${mygender==0?'btn-sel':''}`" @click="mygender=0">女</a>
                </div>
            </div>
            <div class="row">
                <div class="label">你的年龄</div>
                <nut-slider class="input" v-model="myage" :range="[16,60]" :showLabel="true" :showLabelAlways="true" :showRangeTxt="true"></nut-slider>
            </div>
            <div class="h-line"></div>
            <div class="row">
                <div class="label">可用能力点数：</div>
                <div class="input abi-point" :class="`${calcAbiPoint()<0?'abi-point-ban':''}`"><b>{{calcAbiPoint()}}</b></div>
            </div>
            <div class="row">
                <div class="label">你的体能</div>
                <nut-slider class="input" v-model="mystrength" :range="[1,100]" :showLabel="true" :showLabelAlways="true" ></nut-slider>
            </div>
            <div class="row">
                <div class="label">你的智力</div>
                <nut-slider class="input" v-model="myintelligence" :range="[1,100]" :showLabel="true" :showLabelAlways="true" ></nut-slider>
            </div>
            <div class="row">
                <div class="label">你的交流</div>
                <nut-slider class="input" v-model="mycommunication" :range="[1,100]" :showLabel="true" :showLabelAlways="true" ></nut-slider>
            </div>
            <div class="row">
                <div class="label">你的形象</div>
                <nut-slider class="input" v-model="myimage" :range="[1,100]" :showLabel="true" :showLabelAlways="true" ></nut-slider>
            </div>
            <div class="h-line"></div>
            <div class="row">
                <div class="label">初始同伴数量<br/><small class="label-tip">(同伴越少能力越强)</small></div>
                <nut-slider class="input" v-model="partnerCount" :range="[1,4]" :showLabel="true" :showLabelAlways="true" :showRangeTxt="true" ></nut-slider>
            </div>
            <div class="h-line"></div>
            <div class="row">
                <div class="label">世界工厂数量</div>
                <nut-slider class="input" v-model="factoryCount" :range="[3,8]" :showLabel="true" :showLabelAlways="true" :showRangeTxt="true" ></nut-slider>
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
                    <span class="storage-boss">老板</span>
                    <span class="storage-factoryCount">世界工厂数</span>
                    <span class="storage-day">进度</span>
                </div>
                <div class="storage-list">
                    <a @click="onTapStorage(storage)" class="storage" v-for="(storage,index) in storageList">
                        <span class="storage-code">{{storage.code}}</span>
                        <span class="storage-boss">{{storage.data.game.workerList[0].name}}</span>
                        <span class="storage-factoryCount">{{storage.data.game.factoryList.length}}</span>
                        <span class="storage-day">{{storage.data.day}} 天</span>
                    </a>
                </div>
            </div>
        </div>
        <!-- <div id="t" style="box-shadow:0 0 4px 4px grey;width:100px;height:100px;margin: 0 auto;overflow:hidden;position:relative"></div> -->
    </div>
</template>

<script>
// Copyright (c) 2018 Copyright Holder All Rights Reserved.
import { query, r, bulbsort, percent, genRandomWorkerName, genRandomRoomName, genRandomFactoryName, genRandomRoom, genRandomWorker, genRandomPartner, genRandomTerminal, getListByID } from '../tools/utils';
import { DEBUG, CONFIG, CACHE, } from '../config/config';
export default {
    name: 'Start',
    data(){
        return {
            loading: false,
            state: 0,
            loadcode: localStorage.getItem(CACHE.code)||'',
            newcode: '',
            myname: '',
            mygender: 1,
            myage: 16,
            mystrength: 1,
            myintelligence: 1,
            mycommunication: 1,
            myimage: 1,
            factoryCount: 3,
            partnerCount: 1,

            storageList: [],
        };
    },
    mounted(){
        window.GLOBAL = {
            game: null, // 游戏数据
            accFactoryID: 1, // 工厂ID累加基数
            accRoomID: 1, // 房间ID累加基数
            accTerminalID: 1, // 终端ID累加基数
            accWorkerID: 1, // 工人ID累加基数
            accTaskID: 1, // 任务ID累加基数
        }

        let _storageList = localStorage.getItem(CACHE.list)||'[]';
        let storageList = JSON.parse(_storageList);
        this.storageList = storageList;
        // @TEST
        // function y(x){
        //     return Math.sin(Math.pow(x/5,.5))*20+50;
        // }
        // for(let i=0;i<100;i++){
        //     let x = r(0,100);
        //     $('#t').append(`<div style="width:2px;height:2px;background:blue;position:absolute;border-radius: 2px;bottom:${y(x)}px;left:${x}px"></div>`);
        // }
    },
    methods: {
        start(){
            let abiPoint = this.calcAbiPoint();
            if(this.loading) return;
            if(this.myname.length<=0){
                this.$toast.text('输入角色名字');
                return;
            }
            if(this.myname.length>6){
                this.$toast.text('角色名字过长');
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
                    myname: this.myname,
                    mygender: this.mygender,
                    myage: this.myage,
                    mystrength: this.mystrength,
                    myintelligence: this.myintelligence,
                    mycommunication: this.mycommunication,
                    myimage: this.myimage,
                    factoryCount: this.factoryCount,
                },
                game = this.genGameData(initConfig); // 生成游戏初始数据
            this.loading = true;
            this.loading = this.$toast.loading();
            window.GLOBAL.game = game;
            window.GLOBAL.day = 1;
            window.GLOBAL.dayLimit = CONFIG.days_limit_range[initConfig.factoryCount-3];

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

            /*query(DEBUG?'http://darkmirror.cn/api/monopoly_new.php':'../../api/monopoly_new.php',rdata=>{ // 新建存档
                this.loading.hide();
                this.loading = null;
                localStorage.setItem('CODE',this.newcode);
                this.$router.push('home');
            },edata=>{
                this.loading.hide();
                this.loading = null;
                this.$toast.text(edata.msg);
            },1,{
                code: this.newcode,
                data: JSON.stringify(window.GLOBAL),
            });*/
        },
        back(){
            if(this.loading) return;
            this.state = 0;
        },
        newgame(){
            if(this.loading) return;
            this.myname = genRandomWorkerName();
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

            /*query(DEBUG?'http://darkmirror.cn/api/monopoly_load.php':'../../api/monopoly_load.php',rdata=>{ // 读取存档
                this.loading.hide();
                this.loading = null;
                window.GLOBAL = JSON.parse(rdata.data.data);
                localStorage.setItem('CODE',this.loadcode);
                this.$router.push('home');
            },edata=>{
                this.loading.hide();
                this.loading = null;
                this.$toast.text(edata.msg);
            },1,{
                code: this.loadcode,
            });*/
        },
        calcAbiPoint(){ // 计算能力虽大值
            return 134-(this.mystrength+this.myintelligence+this.mycommunication+this.myimage)+Math.round(120/this.partnerCount);
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

            localStorage.removeItem(CACHE.tip1);
            localStorage.removeItem(CACHE.tip2);
            localStorage.removeItem(CACHE.tip3);
            localStorage.removeItem(CACHE.not_show_guide);

            this.storageList = [];
            this.loadcode = '';
            if(this.storageList.length<=0){
                this.state = 0;
            }
        },
        genGameData({myname,mygender,myage,mystrength,myintelligence,mycommunication,myimage,factoryCount}){ // 生成随机的游戏数据
            let factoryList = [],
                roomList = [],
                terminalList = [],
                workerList = [],
                relationList = [],
                logList = [],
                taskList = [],
                data,
                init = CONFIG.init;
            // 生成工厂列表
            factoryList.push({
                id: window.GLOBAL.accFactoryID++,
                name: genRandomFactoryName(),
                money: init.money,
                image: init.image,
                hrp: init.humanResourcePoint,
                rrp: init.roomResourcePoint,
            });
            for(let i=1;i<factoryCount;i++){
                factoryList.push({
                    id: window.GLOBAL.accFactoryID++,
                    name: genRandomFactoryName(),
                    money: r(init.randomOtherMoney[0],init.randomOtherMoney[1]),
                    image: r(init.randomOtherImage[0],init.randomOtherImage[1]),
                });
            }
            // 生成房间列表
            let id = window.GLOBAL.accRoomID++;
            roomList.push({
                id,
                fid: factoryList[0].id,
                fname: factoryList[0].name,
                name: genRandomRoomName(init.roomType),
                power: init.roomPower,
                durab: init.roomDurab,
                risk: init.roomRisk,
                auto: init.roomAuto,
                level: init.roomLevel,
                type: init.roomType,
                basicImage: init.roomBasicImage,
                order: 1,
                group: 0,
            });
            for(let f=1;f<factoryList.length;f++){
                for(let i=0;i<r(init.randomOtherRoomRange[0],init.randomOtherRoomRange[1]);i++){
                    roomList.push(genRandomRoom(window.GLOBAL.accRoomID++,{fid:factoryList[f].id,fname:factoryList[f].name,}));
                }
            }
            // 生成终端列表
            for(let i=0;i<CONFIG.terminal_count_distribution[roomList[0].level-1];i++){ // 循环添置我的第一个房间的终端
                terminalList.push({
                    id: window.GLOBAL.accTerminalID++,
                    fid: factoryList[0].id,
                    rid: roomList[0].id,
                	durab: init.terminalDurab,
                	powerLevel: init.terminalPowerLevel,
                	digLevel: init.terminalDigLevel,
                	tradeLevel: init.terminalTradeLevel,
                });
            }
            for(let r=1;r<roomList.length;r++){ // 遍历每个其他工厂的房间
                let room = roomList[r];
                for(let i=0;i<CONFIG.terminal_count_distribution[room.level-1];i++){ // 循环添置终端
                    terminalList.push({
                        id: window.GLOBAL.accTerminalID++,
                        fid: room.fid,
                        rid: room.id,
                    	durab: init.terminalDurab,
                    	powerLevel: init.terminalPowerLevel,
                    	digLevel: init.terminalDigLevel,
                    	tradeLevel: init.terminalTradeLevel,
                    });
                }
            }
            // 生成工人列表
            workerList.push({ // 我
                id: window.GLOBAL.accWorkerID++,
            	tid: 0,
                rid: 0,
                fid: factoryList[0].id,
                fname: factoryList[0].name,
                rname: '',
                tfname: '',
            	tfid: 0,
                studyfid: 0,
                studyfname: '',
            	name: myname,
                gender: mygender,
                age: myage,
            	str: mystrength,
            	int: myintelligence,
            	com: mycommunication,
            	img: myimage,
            	job: 0,
                boss: true,
            });
            for(let i=0;i<this.partnerCount;i++){ // 我的同伴
                workerList.push(genRandomPartner(window.GLOBAL.accWorkerID++,{fid:factoryList[0].id,fname:factoryList[0].name,},this.myage,this.partnerCount));
            }
            for(let f=1;f<factoryList.length;f++){ // 生成其他工厂员工
                let factory = factoryList[f],
                    thisRoomList = getListByID(factory.id,'fid',roomList);
                for(let ri=0;ri<thisRoomList.length;ri++){
                    let room = thisRoomList[ri],
                        rand = r(1,CONFIG.terminal_count_distribution[room.level-1]);
                    for(let ti=0;ti<rand;ti++){
                        workerList.push(genRandomWorker(window.GLOBAL.accWorkerID++,{
                            fid: factory.id,
                            rid: room.id,
                            fname: factory.name,
                            rname: room.name,
                            boss: (ti==0&&ri==0),
                        }));
                    }
                }
            }
            // 生成外交关系列表
            for(let i=0;i<factoryList.length;i++){
                let afactory = factoryList[i];
                for(let j=0;j<factoryList.length;j++){
                    let bfactory = factoryList[j];
                    if(afactory.id!=bfactory.id){
                        relationList.push({
                            id: j+''+i,
                            from: afactory.id,
                            fromName: afactory.name,
                            to: bfactory.id,
                            toName: bfactory.name,
                            invest: 0,
                            support: 0,
                        });
                    }
                }
            }
            // 合成初始数据
            data = { factoryList, roomList, terminalList, workerList, relationList, logList, taskList, investedMoney: 0 };
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
    .storage-code,.storage-boss,.storage-day,.storage-factoryCount{
        white-space: nowrap;
        word-break: keep-all;
        overflow: hidden;
        text-overflow: ellipsis;
        padding: 0 4px;
    }
    .storage-code{
        width: 30%;
    }
    .storage-boss{
        width: 20%;
    }
    .storage-day{
        width: 20%;
    }
    .storage-factoryCount{
        width: 30%;
    }
</style>

<template>
    <div class="main" v-if="game.campList">
        <!--系统操作-->
        <nut-drag direction="y" :style="{right:'0px',top:'24px'}">
            <a class="touch-dom" @click="showSystemMenu=true">系统<br/>菜单</a>
        </nut-drag>
        <!--作弊-->
        <nut-drag direction="y" :style="{right:'0px',top:'75px'}" v-if="DEBUG">
            <a class="touch-dom" @click="onTapCheat">CHEAT</a>
        </nut-drag>
        <!--页面内容-->
        <div class="panel">
            <div class="tab-panel" v-show="state==1">
                <div class='map'>
                    <div class="maprow" :class="{'oddrow':index%2!=0}" v-for="(row,index) in game.map">
                        <a class="btn btn-mapcell" v-for="cell in row" :style="{'background-color':cell.color,}">
                            {{cell.id}}
                        </a>
                    </div>
                </div>
            </div>
            <!--城市-->
            <div class="tab-panel" v-show="state==2">
                城市
            </div>
            <!--将臣-->
            <div class="tab-panel" v-show="state==3">
                将臣
            </div>
            <!--求贤-->
            <div class="tab-panel" v-show="state==4">
                求贤
            </div>
            <!--报表-->
            <div class="tab-panel" v-show="state==99">
                <div class="row no-margin">
                    <h2 class="room-name">势力报表</h2>
                    <div class="my-name">当前第 <b>{{day}}</b> 日</div>
                </div>
                <div class="row log">
                    <nut-timeline>
                        <nut-timelineitem v-for="(item,index) in game.logList" :key="index">
                            <div class="title" slot="title">{{item.title}}</div>
                            <div class="sub-title btn" @click="onTapLog(item.id)">{{item.subTitle}}</div>
                        </nut-timelineitem>
                    </nut-timeline>
                </div>
            </div>
        </div>
        <!--底部导航-->
        <div class="tab-wrap">
            <a class="btn btn-tab" :class="{'active':state==1}" @click="onTapTab(1)">地图</a>
            <a class="btn btn-tab" :class="{'active':state==2}" @click="onTapTab(2)">城市</a>
            <a class="btn btn-tab" :class="{'active':state==3}" @click="onTapTab(3)">将臣</a>
            <a class="btn btn-tab" :class="{'active':state==4}" @click="onTapTab(4)">求贤</a>
            <a class="btn btn-tab" :class="{'active':state==99}" @click="onTapTab(99)">报表</a>
        </div>
        <!--脚部-->
        <div class="footer">
            <div class="fact">
                <div class="fact-item">总资金：{{numFormat(game.campList[0].money)}} $</div>
                <div class="fact-item">总粮草：{{game.campList[0].food}}</div>
            </div>
            <nut-button class="btn btn-go" @click="onTapGo"><small>第 {{day}} 天</small><p>结束本日</p></nut-button>
        </div>
        <!--弹出层-->
        <nut-popup class="pop pop-system-menu" :round="true" v-model="showSystemMenu">
            <!-- <div class="switch">
                <label>自动存档</label>
                <nut-switch :active.sync="autoSave" @change="onChangeAutoSave"></nut-switch>
            </div> -->
            <a class="menu-item" @click="onTapDrag(1)">存档</a>
            <a class="menu-item" @click="onTapDrag(2)">删档</a>
            <a class="menu-item" @click="onTapDrag(3)">新手指导</a>
            <a class="menu-item" @click="onTapDrag(5)">返回初始界面</a>
        </nut-popup>
    </div>
</template>

<script>
import List from '../components/List';
import Bar from '../components/Bar';
import { query, r, exptr, shuffle, bulbsort, getParentNode, cloneObj, numFormat, avg, percent, calcDistance, getMatchList, removeFromList, } from '../tools/utils';
import { DEBUG, CONFIG, CACHE, } from '../config/config';
export default {
    name: 'Home',
    data(){
        return {
            loading: false,
            state: 1,

            day: 0,
            game: {},

            tempData: {
                log: [],
            },

            showSystemMenu: false,
            showGuide: false,
            showLog: false,
            showConfirmGo: false,

            CONFIG,
            DEBUG,
        };

    },
    mounted(){
        if(window.GLOBAL&&window.GLOBAL.game){
            this.game = window.GLOBAL.game;
            this.day = window.GLOBAL.day;
            this.asynAllPages();
            if(!localStorage.getItem(CACHE.not_show_guide)){
                this.showGuide = true;
                localStorage.setItem(CACHE.not_show_guide,1);
            }
        }
        else{
            this.$router.push('/');
        }
    },
    methods: {
        numFormat(num){
            return numFormat(num);
        },
        save(tip){ // 存档
            if(this.loading) return;
            let code = localStorage.getItem(CACHE.code)||'';
            if(!code){
                this.$toast.text('获取存档代码错误');
                return ;
            }
            this.loading = true;
            this.loading = this.$toast.loading();
            window.GLOBAL.game = this.game;
            window.GLOBAL.day = this.day;
            let _storageList = localStorage.getItem(CACHE.list)||'[]';
            let storageList = JSON.parse(_storageList);
            // 遍历存档
            let savedStorage;
            for(let storage of storageList){
                if(storage.code==code){
                    savedStorage = storage;
                    break;
                }
            }
            if(savedStorage){ // 已有存档
                try{
                    savedStorage.data = window.GLOBAL;
                    _storageList = JSON.stringify(storageList);
                    localStorage.setItem(CACHE.list,_storageList);
                    tip&&this.$toast.text('存储成功');
                }
                catch(err){
                    tip&&this.$toast.text(`存储失败（${err}）`);
                }
            }
            else{ // 没有该存档
                try{
                    let newStorage = {
                        code,
                        data: window.GLOBAL,
                    }
                    storageList.push(newStorage);
                    _storageList = JSON.stringify(storageList);
                    localStorage.setItem(CACHE.list,_storageList);
                    tip&&this.$toast.text('存储成功');
                }
                catch(err){
                    tip&&this.$toast.text(`存储失败（${err}）`);
                }
            }
            this.loading.hide();
            this.loading = null;
        },
        deleteSave(){ // 删除存档
            if(this.loading) return;
            let code = localStorage.getItem(CACHE.code)||'';
            if(!code){
                this.$toast.text('获取存档代码错误');
                return ;
            }
            this.loading = true;
            this.loading = this.$toast.loading();
            let _storageList = localStorage.getItem(CACHE.list)||'[]';
            let storageList = JSON.parse(_storageList);
            // 遍历存档
            let savedStorage;
            for(let storage of storageList){
                if(storage.code==code){
                    savedStorage = storage;
                    break;
                }
            }
            if(savedStorage){
                try{
                    let newStorageList = removeFromList(code,'code',storageList);
                    _storageList = JSON.stringify(newStorageList);
                    localStorage.setItem(CACHE.list,_storageList);
                    this.$toast.text('存档已删除');
                }
                catch(err){
                    this.$toast.text(`存档删除失败（${err}）`);
                }
            }
            else{
                this.$toast.text('存档代码失效，找不到该存档');
            }
            this.loading.hide();
            this.loading = null;
        },

        onTapTab(index){ // 点击【标签页码】
            this.routeToPage(index);
        },
        onTapLog(id){ // 点击【报表】按钮
            this.tempData.log = getMatchList(this.game.logList,[['id',id]])[0];
            this.showLog = true;
        },
        onTapGo(){ // 点击【结束】按钮
            this.showConfirmGo = true;
        },
        onTapDrag(index){ // 点击【悬浮拖拽】按钮
            if(this.loading) return;
            switch(index){
                case 1: // 手动存档
                    this.save(1);
                break;
                case 2: // 删除存档
                    let _this = this;
                    this.$dialog({
                        title: '确定删除此存档？',
                        content: '若误删可立即点击【存档】按钮保存当前游戏',
                        onOkBtn: function(){
                            _this.deleteSave();
                            this.close();
                        }
                    });
                break;
                case 3: // 新手指导
                    this.showSystemMenu = false;
                    this.showGuide = true;
                break;
                case 5: // 退出游戏
                    this.$router.push('/');
                break;
            }
        },
        onTapCheat(){ // 点击【作弊】按钮

        },

        routeToPage(state,id=0){ // 跳转到页面
            let allowrouteToPage = true;
            switch(state){
                case 1: // 地图
                break;
                case 2: // 城市
                break;
                case 3: // 将臣列表
                break;
                case 4: // 求贤
                break;
                case 99: // 报表
                break;
            }
            if(allowrouteToPage){
                this.asynAllPages();
                this.state = state;
            }
        },
        asynAllPages(){ // 刷新所有页面temp数据
            this.$nextTick(e=>{
                this.asynHomePage();
            });
            this.save();
        },
        asynHomePage(){ // 刷新首页temp数据

        },
    },
    components:{
        List,
        Bar,
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .main{
        text-align: center;
        width: 100%;
        height: 100%;
        color: #4a4a4a;
        font-size: .24rem;
    }
    .orange{
        color: #ff4f18;
    }
    .panel{
        position: relative;
        width: 100%;
        height: 100%;
        padding-bottom: 2.21rem;
        overflow-y: scroll;
        overflow-x: hidden;
    }
    .clr{
        clear: both;
    }
    .pop{
        background-color: #fff;
        width: 3rem;
    }
    .pop-system-menu .menu-item,
    .pop-system-menu .switch{
        display: block;
        width: 3rem;
        height: .8rem;
        line-height: .8rem;
        font-size: .28rem;
        white-space: nowrap;
        word-break: keep-all;
        text-align: center;
    }
    .pop-system-menu .switch{
        display: flex;
        justify-content: space-around;
        align-items: center;
    }
    .pop-system-menu .switch label{

    }
    .tab-panel{
        padding: 0 .12rem;
    }
    .tab-panel .row{
        min-height: 1rem;
        margin-bottom: .3rem;
    }
    .tab-panel .no-margin{
        margin-bottom: 0;
    }
    .row .label,.row. .input{

    }
    .flex{
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
    }
    .row .row-column{
        width: 49%;
        display: inline-block;
    }
    .row .label{
        width: 2.5rem;
        white-space: nowrap;
        word-break: keep-all;
        text-align: right;
        padding-right: .1rem;
    }
    .row .input{
        width: 4rem;
    }
    .row-tip,.tip{
        font-size: .2rem;
        line-height: .3rem;
        margin: .14rem 0;
        color: #777;
    }
    .row-tip p{
        text-align: left;
    }
    .row-tip .btn{
        margin-left: .1rem;
        text-align: center;
        white-space: nowrap;
        word-break: keep-all;
    }
    .row-tip p::before{
        content: '';
        display: inline-block;
        vertical-align: middle;
        width: .08rem;
        height: .08rem;
        background-color: #ff4f18;
        margin-right: .12rem;
    }
    .btn{
        color: #ff4f18;
    }
    .btn-icon{
        display: inline-block;
        color: #ff4f18;
        text-align: center;
        font-size: .33rem;
        width: .26rem;
    }
    .btn-go{
        color: #fff;
    }
    .btn-go p,
    .btn-go small{
        word-break: keep-all;
        white-space: nowrap;
    }
    .btn-small{
        margin-left: .2rem;
        font-size: .22rem;
    }
    .small{
        font-size: .2rem;
        font-weight: normal;
    }
    .touch-dom{
        display: block;
        padding-left: .2rem;
        width: 1.2rem;
        height: .8rem;
        line-height: .4rem;
        font-size: .24rem;
        word-break: break-all;
        color: #fff;
        border-top-left-radius: .4rem;
        border-bottom-left-radius: .4rem;
        background: linear-gradient(315deg, #ff4f18 0%, #f20000 100%);
        border: .02rem solid #fff;
        border-right: 0;
    }
    .btn-edit{
        color: #ff4f18;
        display: inline-block;
        font-size: .2rem;
    }
    .my-name{
        display: flex;
        justify-content: flex-start;
        align-items: center;
        height: .46rem;
        line-height: .46rem;
        font-weight: normal;
        text-align: left;
    }
    .my-name >b{
        display: inline-block;
        margin: 0 .04rem;
    }
    .room-name{
        height: .9rem;
        line-height: .9rem;
        text-align: left;
        border-bottom: 1px solid #414141;
    }
    .room-name >span{
        font-weight: normal;
        font-size: .28rem;
    }
    .tab-wrap{
        position: absolute;
        z-index: 999;
        bottom: 1.2rem;
        left: 0;
        right: 0;
        width: 100%;
        height: 1rem;
        line-height: 1rem;
        display: flex;
        justify-content: space-around;
        align-items: center;
        background-color: #fff;
        /* border-top: .01rem solid #ff4f18; */
        box-shadow: 0 0 .2rem .03rem grey;
    }
    .tab-wrap .btn{
        width: 1.5rem;
        font-size: .26rem;
        white-space: nowrap;
        word-break: keep-all;
    }
    .tab-wrap .btn-tab-ban{
        background-color: #ccc;
        color: #eaeaea;
    }
    .tab-wrap .active{
        background: linear-gradient(315deg, #ff4f18 0%, #f20000 100%);
        color: #fff;
    }
    .index{
        text-align: left;
        padding: .12rem 0;
        margin-bottom: .18rem;
    }
    .index::after{
        content: '';
        display: block;
        width: 100%;
        clear: both;
    }
    .index-cell{
        height: .5rem;
        line-height: .5rem;
        font-size: .26rem;
        display: inline-block;
        width: 100%;
        white-space: nowrap;
        word-break: keep-all;
    }
    .index-cell-grey{
        font-weight: normal;
        color: #777;
    }
    .index-lg{
        margin-top: 35px;
    }
    .pct-wrap b{
        width: 35%;
    }
    .index .pct{
        display: inline-block;
        width: calc( 60% - .12rem );
        margin-left: .12rem;
    }
    .index-cell b{
        padding-left: .1rem;
        border-left: .06rem solid #ff4f18;
    }
    .index-cell .lab-name{
        display: inline-block;
        width: 1rem;
    }
    .index .left{
        float: left;
        width: 50%;
    }
    .index .right{
        float: right;
        width: 50%;
    }
    .filter{
        padding: .1rem 0;
        margin: 0;
        line-height: .5rem;
    }
    .filter .select,
    .market .select{
        font-weight: bold;
        text-decoration: underline;
    }
    .filter .btn,
    .market .btn{
        display: inline-block;
        width: 1.2rem;
        font-size: .26rem;
        text-align: left;
    }
    .market{
        padding: 0;
        margin: 0;
        height: .6rem;
        line-height: .6rem;
    }
    .market .btn{
        width: 49%;
        font-size: .3rem;
    }
    .market .select{
        border-bottom: .01rem solid #ff4f18;
        font-size: .3rem;
    }
    .footer{
        position: absolute;
        z-index: 999;
        bottom: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 1.2rem;
        width: 100%;
        background: white;
    }
    .footer .fact{
        padding: 0 .23rem;
        width: 4.2rem;
        text-align: center;
        height: 1.2rem;
        border-top: .01rem solid #ccc;
    }
    .footer .fact .fact-item{
        width: 4.2rem;
        height: .6rem;
        line-height: .6rem;
        text-align: left;
        font-size: .34rem;
    }
    .footer .btn{
        width: 3.3rem;
        height: 1.2rem;
        font-size: .32rem;
    }
    .gameover{
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 30px;
        background-color: #aaa;
        color: #fff;
    }
    /* 弹窗 */
    .room-board{
        width: 6.5rem;
        padding: 0 .2rem;
    }
    .room-board .btn{
        text-align: center;
        font-size: .24rem;
    }
    .room-board .row{
        padding: .3rem 0;
        border-bottom: .01rem solid #ccc;
    }
    .room-board .level{
        display: flex;
        justify-content: space-around;
        align-items: center;
        height: 1.5rem;
    }
    .room-board .room-level{
        padding-bottom: 0;
    }
    .room-board .room-level .btn{
        font-weight: bold;
        font-size: .3rem;
    }
    .room-board .room-level .main-level{
        display: flex;
        justify-content: space-around;
        align-items: center;
        height: 1rem;
    }
    .room-board .level .btn{
        font-weight: bold;
        font-size: .3rem;
    }
    .room-board .order-con{
        display: flex;
        justify-content: space-between;
        align-items: center;
        float: left;
        width: 2rem;
        height: .4rem;
        line-height: .4rem;
    }
    .counter{
        display: flex;
        justify-content: space-around;
        align-items: center;
        font-size: .3rem;
        width: 1.2rem;
    }
    .counter .btn{
        height: .4rem;
        width: .4rem;
        color: #a4a4a4;
        border: .01rem solid #a4a4a4;
    }
    .counter .active{
        color: #ff4f18;
        border: .01rem solid #ff4f18;
    }
    .counter span{
        display: inline-block;
        width: .4rem;
    }
    .room-board .room-level .all-level{
        text-align: left;
        float: right;
    }
    .room-board .room-level .all-level .btn-small{
        height: .4rem;
        line-height: .4rem;
        font-size: .22rem;
        color: #ff4f18;
        display: block;
        margin-bottom: 10px;
    }
    .room-board .risk{
        text-align: left;
        min-height: 2rem;
    }
    .room-board .risk h3{
        height: .6rem;
        line-height: .6rem;
    }
    .room-board .risk .risk-side{
        display: inline-block;
        width: 49%;
        padding: 0 4px;
    }
    .room-board .risk .risk-side-border{
        border-right: 1px solid #ccc;
    }
    .room-board .risk .select{
        color: #ff4f18;
    }
    .room-board .risk .risk-item{
        display: inline-block;
        margin-right: .2rem;
    }
    .room-board .sell{
        color: #ff4f18;
        font-size: .3rem;
        font-weight: bold;
        text-align: right;
    }
    .room-board .sell a{
        display: inline-block;
        margin: 0 6px;
    }
    .btn-group{
        display: flex;
        justify-content: space-around;
        align-items: center;
    }
    .btn-group a{
        width: 3rem;
    }
    .worker-board{
        width: 5rem;
        padding: 0 .2rem;
        padding-bottom: .3rem;
        text-align: left;
    }
    .worker-board .title{
        min-height: .8rem;
        line-height: .8rem;
        margin-bottom: .2rem;
        font-size: .3rem;
        border-bottom: .01rem solid #ccc;
    }
    .worker-board .title span{
        font-size: .2rem;
        font-weight: normal;
    }
    .worker-board .item{
        display: flex;
        justify-content: flex-start;
        align-items: center;
    }
    .worker-board .item h3{
        width: 35%;
        text-align: left;
        height: .58rem;
        line-height: .58rem;
        white-space: nowrap;
        word-break: keep-all;
    }
    .worker-board .item span{
        width: 60%;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        text-align: left;
        white-space: nowrap;
        word-break: keep-all;
    }
    .worker-board .item span b{
        width: .65rem;
    }
    .worker-board .sell{
        color: #ff4f18;
        font-size: .3rem;
        font-weight: bold;
        justify-content: flex-end;
    }
    .worker-board .sell .risk-item{
        height: .72rem;
        line-height: .72rem;
        margin-left: .24rem;
    }
    .pop-worker-list{
        width: 7.2rem;
        padding: .1rem;
        height: 6.2rem;
        overflow-y: scroll;
        overflow-x: hidden;
    }
    .pop-room-list{
        width: 7.2rem;
        padding: .3rem;
        height: 6.2rem;
        overflow: scroll;
    }
    .pop-room-list h3{
        width: 2.5rem;
    }
    .pop-room-list h3 >p{
        white-space: nowrap;
        word-break: keep-all;
    }
    .pop-room-list .level{
        display: flex;
        align-items: center;
        justify-content: flex-start;
        height: 1.5rem;
    }
    .log{
        padding: .2rem;
    }
    .log .title{
        text-align: left;
        font-size: .26rem;
    }
    .log .sub-title{
        font-size: .26rem;
    }
    .log-board{
        width: 7rem;
        height: 10rem;
        max-height: 90%;
        padding: .2rem;
        text-align: left;
        overflow-y: scroll;
    }
    .log-board .title{
        font-size: .32rem;
        border-bottom: .01rem solid #ccc;
    }
    .para{
        font-size: .24rem;
        line-height: .4rem;
    }
    .para .p1{
        padding: .16rem 0;
        border-bottom: .01rem solid #ccc;
    }
    /* 规则 */
    .rule{
        position: absolute;
        top: 0;
        right: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
        color: #fff;
        overflow-x: hidden;
        overflow-y: scroll;
        background-color: rgba(0,0,0,.7);
        transition: all .2s;
    }
    .rule-hide{
        top: 42px;
        right: 22px;
        width: 0;
        height: 0;
    }
    .rule-board{
        width: 100%;
        padding: .8rem .35rem;
    }
    .rule-board .row,
    .rule-board .sub-row{
        text-align: left;
    }
    .rule-board .row{
        margin-bottom: .2rem;
        padding: 0 .12rem;
        padding-bottom: .2rem;
        background-color: rgba(0,0,0,.5);
    }
    .heavy-shadow .row{
        background-color: rgba(0,0,0,.75);
    }
    .rule-board .sub-row{
        padding-left: .2rem;
    }
    .rule-board .row h3,
    .rule-board .sub-row h3{
        height: .5rem;
        line-height: .5rem;
        white-space: nowrap;
        word-break: keep-all;
        font-size: .26rem;
    }
    .rule-board .sub-row h3{
        margin-top: .1rem;
        height: .4rem;
        line-height: .4rem;
    }
    .rule-board .row h3 >label{
        padding-left: .12rem;
        border-left: .06rem solid #ff4f18;
    }
    .rule-board .sub-row h3 label{
        padding-left: .12rem;
        border-left: none;
    }
    .rule-board .sub-row h3 label::before{
        content: '';
        display: inline-block;
        vertical-align: middle;
        width: .08rem;
        height: .08rem;
        background-color: #ff4f18;
        margin-right: .12rem;
    }
    .rule-board .row p,
    .rule-board .sub-row p{
        font-size: .26rem;
        padding: 0 .2rem;
    }
    .rule-board .sub-row p{
        padding-left: .32rem;
    }
    .level-bar{
        display: inline-block;
        height: .2rem;
        line-height: .2rem;
        width: 1rem;
        margin-right: .04rem;
    }
    .level-bar-1{
        background-color: #ccc;
    }
    .level-bar-2{
        background-color: #5EC0FF;
    }
    .level-bar-3{
        background-color: #0E56FF;
    }
    .level-text{
        font-weight: bold;
    }

    .btn-lvlup{
        display: inline-block;
        margin-left: 10px;
        font-weight: bold;
    }

    /* new kingdoms */
    .map{
        position: relative;
        left: 0;
        right: 0;
        margin: 0 auto;
        width: 7rem;
        height: 4.7rem;
        background-color: #aaa;
    }
    .map .maprow{
        width: 100%;
        height: 20%;
        display: flex;
        justify-content: space-around;
        align-items: center;
        padding: 0 .6rem;
    }
    .map .oddrow{
        padding: 0;
    }
    .map .maprow .btn-mapcell{
        display: block;
        width: 1rem;
        height: 1rem;
        border-radius: 50%;
        border: 2px solid #aaa;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #fff;
        font-weight: bold;
    }

</style>

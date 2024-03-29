<template>
    <div class="main">
        start
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
        }

        let _storageList = localStorage.getItem(CACHE.list)||'[]';
        let storageList = JSON.parse(_storageList);
        this.storageList = storageList;
    },
    methods: {
        start(){
            let abiPoint = this.calcAbiPoint();
            if(this.loading) return;
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
            let game = this.genGameData(); // 生成游戏初始数据
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
        genGameData(){ // 生成随机的游戏数据
            let data = {};
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

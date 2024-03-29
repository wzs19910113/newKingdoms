<template>
    <div class="main" v-if="game.flagList">
        home
    </div>
</template>

<script>
import List from '../components/List';
import Bar from '../components/Bar';
import { query, r, bulbsort, getParentNode, cloneObj, numFormat, avg, percent, getListByID, getMatchList, removeFromList, genRandomWorkerName, genRandomRoomName, genRandomFactoryName, genRandomRoom, genRandomWorker, genRandomTerminal, releaseAllByJob } from '../tools/utils';
import { DEBUG, CONFIG, CACHE, } from '../config/config';
export default {
    name: 'Home',
    data(){
        return {
            loading: false,
            dragActive: false,
            state: 1,
            day: 0,
            dayLimit: 0,
            game: {},
            filter: 1, // 人员列表页过滤器
            marketType: 1, // 市场页搜索类型
            tipList: [], // 提示条目
            popTip: '', // 弹窗说明
            tempData: {
                myFactoryList: [],
                // 首页
                myRoomList: [],
                myRoomList2: [],
                myRoomList3: [],
                imageAgent: {},
                resourceManager: {},
                viewType: 0,
                propMoneyPct: 0,

                // 房间页
                room: null,
                myPopRoomList: [],
                assignPowerPct: 0,
                myTerminalList: [],
                myRoomWorkerList: [],
                powerLevelUpCost: 0,
                digLevelUpCost: 0,
                tradeLevelUpCost: 0,

                // 终端页
                terminal: null,

                // 员工页
                myWorkerList: [],

                // 员工详情弹窗
                myWorker: null,

                // 弹窗员工列表
                myPopWorkerList: [],

                // 市场
                marketRoomList: [],
                marketWorkerList: [],
                myRRList: [],
                myHRList: [],
                buyRoom: null,
                buyWorker: null,
                totalCost: 0,

                // 外交
                relationList: [],
                relation: null,

                // 工厂
                factory: null,
                joint: null,
                mySpyList: [],
                factoryRoomList: [],
                factoryWorkerList: [],
                stealRoom: null,
                stealWorker: null,
                investMoney: '',
                studyWorker: null,

                // 报表
                log: {},

                workListPopMode: 0,
            },
            config: CONFIG,

            searchingRoomID: '', // 当前搜索的房间ID
            searchingTerminalID: '', // 当前搜索的终端ID
            searchingWorkerID: '', // 当前搜索的人员ID
            searchingFactoryID: '', // 当前搜索的工厂ID

            autoSave: false,
            tip1: false,
            tip2: false,
            tip3: false,

            // 弹出层
            showSystemMenu: false,
            showEditFactoryName: false,
            showEditRoom: false,
            showAssignPower: false,
            showEditTerminal: false,
            showWorkerList: false,
            showJobPop: false,
            showWorkerPop: false,
            showConfirmSellRoom: false,
            showConfirmSellWorker: false,
            showConfirmBuyRoom: false,
            showConfirmBuyWorker: false,
            showConfirmBuyAllWorker: false,
            showConfirmBuyFactory: false,
            showEditFactory: false,
            showStealRoom: false,
            showStealWorker: false,
            showInvest: false,
            showSanction: false,
            showConfirmDamage: false,
            showConfirmSanction: false,
            showLog: false,
            showKeyborad: false,
            showConfirmGo: false,
            showEditWorkerPage: false,
            showProp: false,
            showRule: false,
            showGuide: false,
            showSpyTargets: false,
            showTasks: false,

            // const
            ROOM_LIST_COLUMN: [ // 首页房间列表基本情况
                {name:'name',title:'房间名',width:'35%',format:(name,room)=>`${room.order} ${name}`,},
                {name:'power',title:'电力',isPower:true,width:'12%',},
                {name:'basicImage',title:'门面',width:'10%',},
                {name:'durab',title:'老化',isRoomDurab:true,width:'12%',format:v=>`${percent(v,CONFIG.max_durab)}%`,},
                {name:'risk',title:'策略',isMode:true,width:'8%',format:v=>`${CONFIG.risk_name_map[v-1]}`,},
                {name:'auto',title:'自动化',isAuto:true,width:'13%',format:v=>`${percent(v,CONFIG.max_auto)}%`,},
                {name:'level',title:'等级',isLevel:true,width:'10%',format:v=>`LV.${v}`,},
            ],
            ROOM_LIST_2_COLUMN: [ // 市场页房间列表
                {name:'id',title:'ID',width:'0',},
                {name:'name',title:'房间名',width:'25%',},
                {name:'basicImage',title:'基础门面',width:'25%',},
                {name:'durab',title:'老化',width:'25%',isRoomDurab:true,format:v=>`${percent(v,CONFIG.max_durab)}%`,},
                {name:'price',title:'售价',width:'25%',format:v=>`${v} $`,},
            ],
            ROOM_LIST_3_COLUMN: [ // 房间页弹出房间列表
                {name:'name',title:'房间名',width:'50%',},
                {name:'power',title:'电力',isPower:true,width:'25%',},
                {name:'avgPower',title:'参与分配',width:'25%',format:v=>`${v?'参与':'否'}`,},
            ],
            ROOM_LIST_4_COLUMN: [ // 工厂页房间列表
                {name:'name',title:'房间名',width:'30%',},
                {name:'power',title:'电力',isPower:true,width:'15%',},
                {name:'basicImage',title:'门面',width:'15%',},
                {name:'durab',title:'老化',isRoomDurab:true,width:'15%',format:v=>`${percent(v,CONFIG.max_durab)}%`,},
                {name:'auto',title:'自动化',isAuto:true,width:'15%',format:v=>`${percent(v,CONFIG.max_auto)}%`,},
                {name:'level',title:'等级',isLevel:true,width:'10%',format:v=>`LV.${v}`,},
            ],
            ROOM_LIST_5_COLUMN: [ // 首页页房间列表工位情况
                {name:'managerName',title:'管理员',width:'16%',},
                {name:'maintainerName',title:'维护工',width:'16%',},
                {name:'imageAgentName',title:'门面',width:'16%',},
                {name:'autoWorkerName',title:'工程师',width:'16%',},
                // {name:'freeTerminalCount',title:'空置',width:'12%',},
                // {name:'workerCount',title:'人数',width:'12%',},
                {name:'terminalOccupies',title:'终端灯位',width:'24%',},
                {name:'freeWorkerCount',title:'空闲',width:'12%',},
            ],
            ROOM_LIST_6_COLUMN: [ // 首页备用房间列表
                {name:'name',title:'房间名',width:'29%',},
                {name:'power',title:'电力',isPower:true,width:'12%',},
                {name:'basicImage',title:'门面',width:'10%',},
                {name:'durab',title:'老化',isRoomDurab:true,width:'12%',format:v=>`${percent(v,CONFIG.max_durab)}%`,},
                {name:'imageAgentName',title:'门面',width:'14%',},
                {name:'auto',title:'自动化',isAuto:true,width:'13%',format:v=>`${percent(v,CONFIG.max_auto)}%`,},
                {name:'level',title:'等级',isLevel:true,width:'10%',format:v=>`LV.${v}`,},
            ],
            ROOM_LIST_7_COLUMN: [ // 首页自营房间列表
                {name:'name',title:'房间名',width:'27%',},
                {name:'power',title:'电力',isPower:true,width:'12%',},
                {name:'basicImage',title:'门面',width:'10%',},
                {name:'durab',title:'老化',isRoomDurab:true,width:'12%',format:v=>`${percent(v,CONFIG.max_durab)}%`,},
                {name:'risk',title:'策略',isMode:true,width:'8%',format:v=>`${CONFIG.risk_name_map[v-1]}`,},
                {name:'auto',title:'自动化',isAuto:true,width:'13%',format:v=>`${percent(v,CONFIG.max_auto)}%`,},
                {name:'workerCount',title:'人数',width:'8%',},
                {name:'level',title:'等级',isLevel:true,width:'10%',format:v=>`LV.${v}`,},
            ],
            TERMINAL_LIST_COLUMN: [ // 房间设备列表
                {name:'powerLevel',title:'供电Lv',isLevel:true,width:'1.3rem',format:v=>`LV.${v}`,},
                {name:'digLevel',title:'挖矿Lv',isLevel:true,width:'1.3rem',format:v=>`LV.${v}`,},
                {name:'tradeLevel',title:'交易Lv',isLevel:true,width:'1.3rem',format:v=>`LV.${v}`,},
                {name:'durab',title:'老化',width:'.7rem',isDurab:true,format:v=>`${percent(v,CONFIG.max_durab)}%`,},
                {name:'workerName',title:'工人',width:'1rem',format:v=>`${v||'-'}`},
                {name:'jobName',title:'运行',width:'1rem',format:v=>`${v||'-'}`},
                {name:'str',title:'体能',width:'1rem',showAbi:true,format:v=>`${v||'-'}`},
                {name:'int',title:'智力',width:'1rem',showAbi:true,format:v=>`${v||'-'}`},
                {name:'com',title:'交流',width:'1rem',showAbi:true,format:v=>`${v||'-'}`},
                {name:'img',title:'形象',width:'1rem',showAbi:true,format:v=>`${v||'-'}`},
            ],
            WORKER_LIST_COLUMN: [ // 弹窗人员列表
                {name:'name',title:'名字',width:'15%',},
                // {name:'abi-chart',title:'能力图形',width:'24%',},
                {name:'str',title:'体能',width:'10%',},
                {name:'int',title:'智力',width:'10%',},
                {name:'com',title:'交流',width:'10%',},
                {name:'img',title:'形象',width:'10%',},
                {name:'rname',title:'房间',width:'30%',format:v=>`${v||'-'}`,},
                {name:'job',title:'职能',width:'15%',format:v=>`${CONFIG.job_name_map[v]}`,},
            ],
            WORKER_LIST_2_COLUMN: [ // 人员列表
                {name:'name',title:'名字',width:'23%',format:(name,worker)=>`${name} (${worker.gender?'男':'女'} ${worker.age})`,},
                {name:'str',title:'体能',width:'8%',},
                {name:'int',title:'智力',width:'8%',},
                {name:'com',title:'交流',width:'8%',},
                {name:'img',title:'形象',width:'8%',},
                {name:'rname',title:'房间',width:'30%',format:v=>`${v||'-'}`,},
                {name:'job',title:'职能',width:'15%',format:v=>`${CONFIG.job_name_map[v]}`,},
            ],
            WORKER_LIST_3_COLUMN: [ // 房间人员列表
                {name:'id',title:'ID',width:'0',},
                {name:'name',title:'名字',width:'50%',format:(name,worker)=>`${name} (${worker.gender?'男':'女'} ${worker.age})`,},
                {name:'job',title:'职能',width:'50%',format:v=>`${CONFIG.job_name_map[v]}`,},
            ],
            WORKER_LIST_4_COLUMN: [ // 房间搜索人员列表
                {name:'id',title:'ID',width:'0',},
                {name:'name',title:'名字',width:'50%',},
                {name:'str',title:'体能',width:'25%',},
                {name:'int',title:'智力',width:'25%',},
            ],
            WORKER_LIST_5_COLUMN: [ // 人力搜索人员列表
                {name:'id',title:'ID',width:'0',},
                {name:'name',title:'名字',width:'50%',},
                {name:'com',title:'交流',width:'25%',},
                {name:'img',title:'形象',width:'25%',},
            ],
            WORKER_LIST_6_COLUMN: [ // 市场页人员列表
                {name:'id',title:'ID',width:'0',},
                {name:'name',title:'名字',width:'26%',format:(name,worker)=>`${name} (${worker.gender?'男':'女'} ${worker.age})`,},
                {name:'str',title:'体能',width:'12%',},
                {name:'int',title:'智力',width:'12%',},
                {name:'com',title:'交流',width:'12%',},
                {name:'img',title:'形象',width:'12%',},
                {name:'price',title:'售价',width:'26%',format:v=>`${v} $`,},
            ],
            WORKER_LIST_7_COLUMN: [ // 工厂页人员列表
                {name:'name',title:'名字',width:'28%',format:(name,worker)=>`${name} (${worker.gender?'男':'女'} ${worker.age})`,},
                {name:'str',title:'体能',width:'18%',},
                {name:'int',title:'智力',width:'18%',},
                {name:'com',title:'交流',width:'18%',},
                {name:'img',title:'形象',width:'18%',},
            ],
            WORKER_LIST_8_COLUMN: [ // 工厂页间谍列表
                {name:'name',title:'名字',width:'50%',},
                {name:'int',title:'智力',width:'50%',},
            ],
            RELATION_LIST_COLUMN: [ // 外交关系列表
                {name:'toName',title:'工厂名',width:'15%',},
                {name:'money',title:'总资金',width:'20%',format:v=>`${numFormat(v)} $`,},
                {name:'image',title:'形象',width:'12.5%',},
                {name:'invest',title:'投资',width:'15%',},
                {name:'support',title:'支持率',width:'12.5%',format:v=>`${percent(v,CONFIG.max_support)}%`,},
                {name:'jointName',title:'外交员',width:'12.5%',format:v=>`${v||'-'}`,},
                {name:'spyCount',title:'间谍数',width:'12.5%',},
            ],

            CONFIG,
            DEBUG,
        };

    },
    mounted(){
        if(window.GLOBAL&&window.GLOBAL.game){
            this.game = window.GLOBAL.game;
            this.day = window.GLOBAL.day;
            this.asynHomePage();
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
            /*query(DEBUG?'http://darkmirror.cn/api/monopoly_delete.php':'../../api/monopoly_delete.php',rdata=>{
                this.loading.hide();
                this.loading = null;
                this.$toast.text(rdata.msg);
                this.showSystemMenu = false;
                localStorage.removeItem('NSG');
            },edata=>{
                this.loading.hide();
                this.loading = null;
                this.$toast.text(edata.msg);
            },1,{
                code,
            });*/
        },

        asynAllPages(){ // 刷新所有页面temp数据
            this.$nextTick(e=>{

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
        height: calc( 100% - 1.2rem );
    }
    .clr{
        clear: both;
    }
    .block{
        height: 100%;
        width: 100%;
        overflow-x: hidden;
        overflow-y: scroll;
        padding-bottom: 1.5rem;
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
    .factory-name{
        position: relative;
        width: 100%;
        height: 1.05rem;
        line-height: 1.05rem;
        text-align: left;
        font-size: .5rem;
    }
    .factory-name >span{
        display: block;
        height: 1rem;
        border-bottom: 1px solid #414141;
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
        bottom: 0;
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

    .factory-board{
        width: 7rem;
        padding: .2rem .1rem;
    }
</style>

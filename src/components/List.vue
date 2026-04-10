<template>
    <div class="list-container list-container-room">
        <div class="list-title">
            <div class="list-title-head left">{{title}}</div>
            <div class="list-title-count left" v-if="!simple">共 {{localData.length}} 条</div>
            <a class="btn btn-asyn right" v-if="!simple" @click="asyn">刷新</a>
            <a class="btn btn-option right" :class="{'large-text mg-l':largeOption}" v-if="option" @click="onTapOption_">{{option}}</a>
        </div>
        <div class="list-content" :class="{'large':large,'v-scroll':vScroll}">
            <div class="list-header">
                <a class="list-cell" v-for="(column,index) in localColumns" v-if="column.width!=0" :style="{width:column.width}" @click="onTapHead(index)">{{column.title}}</a>
            </div>
            <div class="list" :class="{'list-room':type&&type=='room'}" v-if="localData.length>0">
                <a class="list-item" :class="{'select':item.select,}" :data-id="item.id" v-for="(item,index) in localData" @click="onTapListItem($event)">
                    <p class="list-cell" :class="genClassName(column,item)" :style="genStyle(column,item)" v-for="(column,index) in localColumns" v-if="column.width!=0"></p>
                </a>
            </div>
            <div class="list" v-else>
                -
            </div>
        </div>
    </div>
</template>
<script>
import { query, r, bulbsort, getParentNode, numFormat, genRandomWorkerName, genRandomRoomName, genRandomFactoryName, genRandomWorker, genRandomTerminal, genRandomRoom, getListByID } from '../tools/utils';
import { DEBUG, CONFIG } from '../config/config';
export default {
    props:{
        title: String, // 表标题
        columns: Array, // 表头数组 [{name,disableSort,width,format}]
        data: Array, // 列表数组
        simple: Boolean, // 简单模式
        large: Boolean, // 放大模式
        onDoubleTap: Function, // 双击事件
        option: String, // 其他操作按钮文字
        largeOption: Boolean, // 操作按钮大字体
        vScroll: Boolean, // 允许横向滑动
        onTapOption: Function, // 点击其他操作事件
        showTip: Boolean, // 显示提示
        type: String, // 对象类型
    },
    data() {
        return {
            localColumns: [],
            localData: [],
        };
    },
    computed: {},
    mounted(){
        this.asyn();
    },
    methods: {
        asyn(){
            this.localColumns = Array.from(this.columns,column=>{
                return {
                    sort: false,
                    ...column,
                }
            })
            this.localData = Array.from(this.data,d=>{
                return {
                    select: false,
                    ...d,
                }
            })
        },
        genClassName(column,item){
            return {
                'warm': 0,
            }
        },
        genStyle(column,item){
            let res = {
                'width': column.width,
            }
            return res;
        },
        onTapOption_(e){
            this.$emit('onTapOption');
        },
        onTapHead(index){
            let column = this.localColumns[index];
            if(column.disableSort)
                return ;
            column.sort = !column.sort;
            this.localData = bulbsort(this.localData,column.name,column.sort);
        },
        onTapListItem(e){
            let a = getParentNode(e.target);
            if(a){
                let target;
                for(let i=0;i<this.localData.length;i++){
                    let item = this.localData[i];
                    if(item.id==a.dataset.id){
                        if(item.select)
                            target = item;
                        else
                            item.select = true;
                    }
                    else{
                        item.select = false;
                    }
                }
                if(target){
                    this.$emit('onDoubleTap',target.id);
                }
            }
        },
    },
};
</script>
<style scoped>
    .list-container{
        width: 100%;
    }
    .list{
        display: inline-block;
        min-width: 100%;
        border-top: .01rem solid #ccc;
    }
    .list-content{
        width: 100%;
        padding-bottom: 8px;
    }
    .v-scroll{
        overflow-x: scroll;
    }
    .list-item,.list-header{
        position: relative;
        display: inline-block;
        min-width: 100%;
        white-space: nowrap;
        word-break: keep-all;
        height: .6rem;
        line-height: .3rem;
        border-bottom: .01rem solid #ccc;
    }
    .list-room .list-item{
        border-bottom: .01rem solid #eee;
    }
    .large .list-item,.large .list-header{
        height: .8rem;
        line-height: .8rem;
    }
    .list-item::after,.list-header::after{
        content: '';
        width: 100%;
        display: block;
        clear: both;
    }
    .list-header >.list-cell, .list-item >.list-cell{
        height: .6rem;
        line-height: .6rem;
        display: inline-block;
        text-align: center;
        vertical-align: middle;
    }
    .list .select{
        background-color: #dcdcdc;
    }
    .list-room .select{
    }
    .list-title{
        height: .5rem;
        line-height: .5rem;
        text-align: left;
        padding: 0 .2rem;
        padding-left: .1rem;
        border-left: .06rem solid #ff4f18;
    }
    .list-title::after{
        content: '';
        display: block;
        width: 100%;
        clear: both;
    }
    .list-title .left{
        float: left;
    }
    .list-title .right{
        float: right;
    }
    .list-title-head{
        font-size: .26rem;
        font-weight: bold;
    }
    .list-title-count{
        margin-left: .2rem;
    }
    .btn{
        color: #ff4f18;
    }
    .btn-option{
    }
    .large-text{
        font-size: .3rem;
        font-weight: bold;
    }
    .no-border{
        padding: 0;
        border-bottom: .01rem solid #ccc;
    }
    .no-border .list-header,
    .no-border .list-item,
    .no-border .list{
        border: none;
    }
</style>

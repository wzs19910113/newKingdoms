<template>
    <div class="list-container list-container-room">
        <div class="list-title">
            <div class="list-title-head left">{{title}}<span class="remark" v-if="remark">（{{remark}}）</span></div>
            <div class="list-title-count left" v-if="!simple">共 {{localData.length}} 条</div>
            <a class="btn btn-asyn right" v-if="!simple" @click="asyn">刷新</a>
            <a class="btn btn-option right mg-r" :class="{'large-text mg-l':largeOption}" v-if="option" @click="onTapOption_">{{option}}</a>
        </div>
        <div class="list-content" :class="{'large':large,'v-scroll':vScroll}">
            <div class="list-header">
                <a class="list-cell" v-for="(column,index) in localColumns" v-if="column.width!=0" :style="{width:column.width}" @click="onTapHead(index)">{{column.title}}</a>
            </div>
            <div class="list" :class="{'list-room':type&&type=='room'}" v-if="localData.length>0">
                <a class="list-item" :class="{'select':item.select,'bg-1':(type&&type=='room'&&item.type==1),'bg-2':(type&&type=='room'&&item.type==2),'bg-3':(type&&type=='room'&&item.type==3)}" :data-id="item.id" v-for="(item,index) in localData" @click="onTapListItem($event)">
                    <a class="tip" v-if="index==0&&showTip">双击可查看</a>
                    <p class="list-cell" :class="genClassName(column,item)" :style="genStyle(column,item)" v-for="(column,index) in localColumns" v-if="column.width!=0">
                        <!-- <div class="abi-chart" v-if="column.name=='abi-chart'" v-for="abiName in ['str','int','com','img']">
                            <div class="abi-bar-wrap">
                                <div class="abi-bar-fill" :class="`abi-${abiName}`" :style="{width:`${item[abiName]}%`}"></div>
                            </div>
                        </div> -->
                        <span class="cell-s" v-if="column.name!='terminalOccupies'">{{column.format?column.format(item[column.name],item):item[column.name]}}</span>
                        <span class="cell-occupies" :class="`cell-occupies-${item.terminalOccupies.length}`" v-else>
                            <b :class="dot?'on':'off'" v-for="dot of item.terminalOccupies"></b>
                        </span>
                    </p>
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
        remark: String, // 标题备注
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
                'warm': ((column.isDurab||column.isRoomDurab)&&item[column.name]>=5000)
                        ||(column.isPower&&item[column.name]<=0),
                'lv1': column.isLevel&&item[column.name]==1,
                'lv2': column.isLevel&&item[column.name]==2,
                'lv3': (column.isLevel&&item[column.name]==3)
                        ||((column.isRoomDurab||column.isDurab)&&item[column.name]<=0)
                        ||(column.isMode&&item[column.name]==3)
                        ||(column.isAuto&&item[column.name]>=10000),
                'abi-hl': (column.name=='str'&&(item.job==1||item.job==4||item.job==6)
                            ||(column.name=='int'&&(item.job==2||item.job==5||item.job==13))
                            ||(column.name=='com'&&(item.job==3||item.job==7||item.job==12))
                            ||(column.name=='img'&&(item.job==8||item.job==11))
                            ||(column.name=='str'&&item.job==10&&item.str>=item.int)
                            ||(column.name=='int'&&item.job==10&&item.int>=item.str)
                            ||(column.name=='com'&&item.job==9&&item.com>=item.img)
                            ||(column.name=='img'&&item.job==9&&item.img>=item.com)
                        ),
            }
        },
        genStyle(column,item){
            let res = {
                    'width': column.width,
                }
            // if(column.name=='str'||column.name=='int'||column.name=='com'||column.name=='img'){
            //     res.fontSize = `${parseFloat(item[column.name]/100*.14+.2).toFixed(2)}rem`;
            // }
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
    .list .tip{
        height: .6rem;
        line-height: .6rem;
        border-bottom: .01rem solid #ccc;
    }
    .list-content{
        width: 100%;
        padding-bottom: 8px;
    }
    .v-scroll{
        overflow-x: scroll;
    }
    .list .bg-1{
        /* color: #c445fd; */
        text-shadow: 0 0 2px #fff;
        box-shadow: 0 0 24px #c445fd inset;
    }
    .list .bg-2{
        /* color: #fa6540; */
        text-shadow: 0 0 2px #fff;
        box-shadow: 0 0 24px #fac540 inset;
    }
    .list .bg-3{
        /* color: #4cb321; */
        text-shadow: 0 0 2px #fff;
        box-shadow: 0 0 24px #4ce371 inset;
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
    .list-item .tip{
        position: absolute;
        top: -.45rem;
        left: 10%;
        height: .5rem;
        line-height: .5rem;
        width: 1.4rem;
        padding: 0 .1rem;
        font-size: .2rem;
        color: #fff;
        background-color: black;
        text-align: center;
        white-space: nowrap;
        word-break: keep-all;
        opacity: .6;
        animation: flt 1s ease-in-out alternate infinite;
    }
    @keyframes flt {
        to{
            top: -.6rem;
        }
    }
    .remark{
        font-size: .2rem;
        font-weight: normal;
    }
    .list-item .tip::after{
        content: '';
        position: absolute;
        bottom: -.16rem;
        right: 66.66%;
        margin: 0 auto;
        width: 0;
        height: 0;
        border-left: .08rem solid transparent;
        border-right: .08rem solid transparent;
        border-top: .16rem solid black;
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
    .warm{
        color: red;
    }
    .lv1{
        color: #a5a5a5;
    }
    .lv2{
        color: #5EC0FF;
        font-weight: bold;
    }
    .lv3{
        color: #0E56FF;
        font-weight: bold;
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
    .abi-hl{
        font-weight: bold;
        color: #000;
        text-decoration: underline;
    }
    .mg-r{
        margin-left: 0;
        margin-right: .2rem;
    }
    .mg-l{
        margin-left: .2rem;
        margin-right: 0;
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
    .no-border .tip,
    .no-border .list{
        border: none;
    }
    .abi-chart{
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        height: .15rem;
    }
    .abi-bar-wrap{
        width: 80%;
        height: 100%;
        height: .09rem;
        margin: .03rem 0;
    }
    .abi-bar-fill{
        height: 100%;
    }
    .abi-str{
        background-color: red;
    }
    .abi-int{
        background-color: blue;
    }
    .abi-com{
        background-color: orange;
    }
    .abi-img{
        background-color: green;
    }
    /* 终端灯位 */
    .cell-occupies{
        display: flex;
        justify-content: flex-end;
        align-items: center;
        height: 100%;
        width: 100%;
    }
    .cell-occupies b{
        position: relative;
        display: block;
        height: 50%;
        width: 10%;
    }
    .cell-occupies .on::after,
    .cell-occupies .off::after{
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        margin: auto;
        width: 6px;
        height: 6px;
        border-radius: 50%;
    }
    .cell-occupies .on::after{
        background-color: #0E56FF;
        border: 1px solid #333;
    }
    .cell-occupies .off::after{
        background-color: #eee;
        border: 1px solid #777;
    }
</style>

<template>
    <div class="unit-list" ref="list">
            <div class="list-header" v-if="localUnitList.length>12">
                排序：
                <a class="btn btn-sort-tag" v-for="(sortTag,index) in sortTags" @click="onTapHead(sortTag,index)">{{sortTag.title}}</a>
            </div>
            <div class="list" v-if="localUnitList.length>0">
                <a class="btn btn-unit" :class="`rel-${unit.rel}`" @click.stop="onTapUnit(unit)" v-for="(unit,index) in localUnitList">
                    <!-- <span class="avatar">
                        <img :src="require(`../assets/${common.calcIconSrc(unit)}`)" />
                    </span> -->
                    <span><b>{{unit.nm}}</b> {{['女','男'][unit.gd]}} {{unit.age}}</span>
                </a>
            </div>
            <div class="list" v-else>
                -
            </div>
        </div>
    </div>
</template>
<script>
import Unit1 from '../components/Unit1';
import Bar1 from '../components/Bar1';
import Bar2 from '../components/Bar2';
import Bar3 from '../components/Bar3';
import Equip from '../components/Equip';
import Skill from '../components/Skill';
import Toast from '../components/Toast';
import Pop from '../components/Pop';
import Avatar from '../components/Avatar';
import draggable from 'vuedraggable';
import { cl, query, r, exptr, setInRange, loadImages, shuffle, bulbsort, bulbsort2, getParentNode, cloneObj, numFormat, avg, percent, calcDistance, getMatchList, getSubMatchList, removeFromList, arrContains, } from '../tools/utils';
import * as common from '../tools/common';
import * as ai from '../tools/ai';
import { DEBUG, CONFIG, CACHE, ASSETS, } from '../config/config';

export default {
    name: 'UnitList',
    props:{
        unitList: { // 单位列表
            type: Array,
            default: [],
        },
        onTapUnit: { // 点击【单位】
            type: Function,
            default: function(){},
        },
    },
    data() {
        return {
            sortTags:[
                { title: `性别`, valueName: `gd`, state:0, },
                { title: `年龄`, valueName: `age`, state:0, },
                { title: `关系`, valueName: `rel`, state:0, },
                { title: `入村时间`, valueName: `rt`, state:0, },
                // { title: `战力分数`, valueName: `score`, btd: true, state:0, },
                { title: `雇佣价格`, valueName: `price`, btd: true, state:0, },
            ],

            localUnitList: [],

            common,
            ASSETS,
            CONFIG,
            DEBUG,
        };
    },
    computed: {},
    mounted(){
        this.init();
    },
    methods: {
        init(){
            this.localUnitList = cloneObj(this.unitList);
        },
        onTapHead(sortTag,index){
            let {title,valueName,btd,state,} = sortTag;
            let orderType = [0,1,0][state];
            if(!btd){
                this.localUnitList = bulbsort(this.localUnitList,valueName,orderType);
            }
            else{
                this.localUnitList = bulbsort2(this.localUnitList,'btd',valueName,orderType);
            }
            this.sortTags[index].state = [1,2,1][state];
        },
    },
    components: {
        Bar1,
        Bar2,
        Bar3,
        Equip,
        Skill,
        Toast,
        Unit1,
        Avatar,
        draggable,
        Pop,
    },
};
</script>
<style scoped>
    .unit-list{
        width: 100%;
    }
    .list-header{
        display: flex;
        justify-content: flex-start;
        align-items: center;
        height: .6rem;
        line-height: .6rem;
        border-bottom: .02rem solid #ccc;
        margin-bottom: .1rem;
    }
    .list-header .btn-sort-tag{
        min-width: .6rem;
        padding: 0 .1rem;
        margin-right: .08rem;
        height: .4rem;
        line-height: .4rem;
        border: .02rem solid orangeRed;
    }
    .list{
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex-flow: wrap;
        width: 100%;
    }
    .btn-unit{
        display: flex;
        justify-content: center;
        align-items: center;
        min-width: 1rem;
        margin-right: .08rem;
        margin-bottom: .1rem;
        padding: 0 .06rem;
        height: .6rem;
        line-height: .6rem;
        background-color: #fff;
        color: #000;
    }
    .avatar{
        display: inline-block;
        width: .55rem;
        height: .55rem;
        background-color: #000;
        border-radius: 50%;
        margin-right: .1rem;
        overflow: hidden;
    }
    .avatar img{
        display: inline-block;
        width: 100%;
        height: 100%;
    }
    .rel-0{
        background-color: #f85353;
    }
    .rel-1{
        background-color: #fff;
    }
    .rel-2{
        /* background-color: #e89613; */
        background-image: linear-gradient(to bottom, #DFA570 0%, #DFA570 20%, #E89613 80%, #E89613 100%);
    }
    .rel-3{
        background-color: #13a3e8;
    }
</style>

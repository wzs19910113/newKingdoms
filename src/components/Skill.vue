<template>
    <a class="skill" @click="onTap">
        <div class="row">
            <span class="name">{{skill.name}}</span>
        </div>
    </a>
</template>
<script>
import Buff from '../components/Buff';
import { query, r, exptr, setInRange, shuffle, bulbsort, getParentNode, cloneObj, numFormat, avg, percent, calcDistance, getMatchList, getSubMatchList, removeFromList, arrContains, } from '../tools/utils';
import { DEBUG, CONFIG } from '../config/config';

export default {
    name: 'Skill',
    props:{
        skill: Object,
        onTap: { // 点击事件
            type: Function,
            default: function(){},
        },
    },
    data() {
        return {

            DEBUG,CONFIG,
        };
    },
    computed: {
    },
    mounted(){

    },
    methods: {

    },
    components: {
        Buff,
    },
};
</script>
<style scoped>
    .skill{
        position: relative;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex-direction: column;
        width: 6rem;
        margin: 0 auto;
        min-height: 1.2rem;
        line-height: .32rem;
        color: #fff;
        font-size: .22rem;
        margin-bottom: .2rem;
        padding: .14rem .12rem;
        background-color: rgba(215,196,78,.4);
    }
    .row{
        width: 100%;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        min-height: .4rem;
        margin-bottom: .1rem;
    }
    .row:last-child{
        margin-bottom: 0;
    }
    /* 名字 */
    .row .type{
        width: .6rem;
        border: .01rem solid #fffa4f;
        line-height: .4rem;
        font-size: .4rem;
        background-color: #131313;
        margin-right: .1rem;
    }
    .row .name{
        line-height: .3rem;
        font-size: .3rem;
        font-weight: bold;
        text-shadow: .02rem .02rem .12rem #000;
    }
</style>

<template>
    <a class="pop-cover" @click.top="_onTap">
        <p class="tip" v-html="tip" v-if="tip"></p>
        <div class="content">
            <slot></slot>
        </div>
    </a>
</template>
<script>
import { query, r, exptr, setInRange, shuffle, bulbsort, getParentNode, cloneObj, numFormat, avg, percent, calcDistance, getMatchList, getSubMatchList, removeFromList, arrContains, } from '../tools/utils';
import * as common from '../tools/common';
import { DEBUG, CONFIG } from '../config/config';

export default {
    name: "Cover",
    props:{
        tip: String,
    },
    data() {
        return {

            common,DEBUG,CONFIG,
        };
    },
    computed: {
    },
    mounted(){

    },
    methods: {
        _onTap(){
            this.$emit('onTap');
        },
    },
};
</script>
<style scoped>
    .pop-cover{
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        margin: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        padding: 0 .2rem;
        background-color: rgba(0,0,0,.55);
        backdrop-filter: blur(.3rem);
        z-index: 6900;
    }
    .tip{
        display: block;
        font-size: .34rem;
        height: .5rem;
        line-height: .5rem;
        color: #fff;
    }
    .content{
        min-height: 2rem;
    }
</style>

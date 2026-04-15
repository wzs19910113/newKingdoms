<template>
    <canvas class="ani" ref="cvs"></canvas>
</template>
<script>
import { query, r, exptr, setInRange, shuffle, bulbsort, getParentNode, cloneObj, numFormat, avg, percent, calcDistance, getMatchList, getSubMatchList, removeFromList, arrContains, } from '../tools/utils';
import * as common from '../tools/common';
import { DEBUG, CONFIG } from '../config/config';

export default {
    name: "Ani",
    props:{
        data: Object,
    },
    data(){
        return {

            common,DEBUG,CONFIG,
        };
    },
    computed: {},
    mounted(){},
    methods: {

    },
};
</script>
<style scoped>
    .ani{
        display: block;
        width: 100%;
        height: 100%;
        box-shadow: 0 0 .2rem #131313 inset;
    }
</style>

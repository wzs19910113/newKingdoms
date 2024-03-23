<template>
    <div class="bar-wrap">
        <div class="bar" :style="{'width':genWidth(),'opacity':genOpacity()}"></div>
    </div>
</template>
<script>
import { query, r, bulbsort, getParentNode, numFormat, genRandomWorkerName, genRandomRoomName, genRandomFactoryName, genRandomWorker, genRandomTerminal, genRandomRoom, getListByID } from '../tools/utils';
import { DEBUG, CONFIG } from '../config/config';
export default {
    props:{
        data: { // 数值
            type: Number,
            default: 0,
        },
        max: { // 最大数值
            type: Number,
            default: 100,
        },
    },
    data() {
        return {

        };
    },
    computed: {},
    mounted(){

    },
    methods: {
        genWidth(){
            let val = Math.round(this.data/this.max*100);
            return `${val}%`;
        },
        genOpacity(){
            let val = Math.round(this.data/this.max*70)+30;
            return `${val}%`;
        },
    },
};
</script>
<style scoped>
    .bar-wrap{
        display: flex;
        justify-content: flex-start;
        align-items: center;
        width: 100%;
        height: 4px;
        background-color: #eee;
        border-radius: 2px;
    }
    .bar{
        height: 4px;
        background-color: #ff4f18;
        border-radius: 2px;
        transition: .3s all;
    }
</style>

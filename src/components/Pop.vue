<template>
    <div class="pop" @click.stop="_onTap">
        <div class="pop-main">
            <div class="pop-title" v-if="title">{{title}}</div>
            <div class="pop-content">
                <slot></slot>
            </div>
        </div>
    </div>
</template>
<script>
import { query, r, bulbsort, getParentNode, numFormat, genRandomWorkerName, genRandomRoomName, genRandomFactoryName, genRandomWorker, genRandomTerminal, genRandomRoom, getListByID } from '../tools/utils';
import { DEBUG, CONFIG } from '../config/config';
export default {
    props:{
        title: String, // 标题
        onTap: { // 点击事件
            type: Function,
            default: function(){},
        },
    },
    data() {
        return {

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
    .pop{

    }
    .pop-main{
        position: absolute;
        left: 0;
        right: 0;
        top: 4%;
        margin: 0 auto;
        width: 90%;
        min-height: 5%;
        max-height: 92%;
        box-shadow: 0 0 .04rem #8ae4f1;
        padding: .1rem .16rem;
        border-radius: .08rem;
        background-color: rgba(13,13,13,.95);
        color: #fff;
        font-size: .22rem;
        line-height: .25rem;
        z-index: 5000;
    }
    .pop-title{
        width: 100%;
        height: .76rem;
        line-height: .76rem;
        white-space: nowrap;
        word-break: keep-all;
        overflow: hidden;
        font-size: .3rem;
        font-weight: bold;
        text-align: left;
        padding: 0 .12rem;
        margin-bottom: .08rem;
        border-bottom: .01rem solid #8ae4f1;
    }
    .pop-content{
        overflow-y: auto;
    }
</style>

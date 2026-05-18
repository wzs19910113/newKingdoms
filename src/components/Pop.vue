<template>
    <div class="pop">
        <div class="pop-main">
            <div class="pop-title" v-if="title">
                {{title}}
                <a class="btn btn-arrow" v-if="arrowTitle" @click.stop="_onTapArrow">{{arrowTitle}}</a>
            </div>
            <div class="pop-content" ref="pop">
                <slot></slot>
            </div>
            <a class="btn btn-close" v-if="showCloseButton" @click.stop="_onTapClose">✖</a>
        </div>
        <div class="pop-cover" @click.stop="_onTapClose"></div>
    </div>
</template>
<script>
import { query, r, bulbsort, getParentNode, numFormat, genRandomWorkerName, genRandomRoomName, genRandomFactoryName, genRandomWorker, genRandomTerminal, genRandomRoom, getListByID } from '../tools/utils';
import { DEBUG, CONFIG } from '../config/config';
export default {
    props:{
        title: String, // 标题
        arrowTitle: String, // 箭头标题
        onTap: { // 点击事件
            type: Function,
            default: function(){},
        },
        showCloseButton: Boolean, // 是否现实关闭按钮
        onTapClose: { // 点击关闭事件
            type: Function,
            default: function(){},
        },
        onTapArrow: { // 点击箭头事件
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
        _onTapClose(){
            this.$emit('onTapClose');
        },
        _onTapArrow(){
            this.$emit('onTapArrow');
        },
    },
};
</script>
<style scoped>
    .pop{
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: 5000;
    }
    .pop-cover{
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        top: 0;
        width: 100%;
        height: 100%;
        margin: 0;
        background-color: rgba(255,255,255,.5);
        z-index: 4990;
    }
    .pop-main{
        position: absolute;
        left: 0;
        right: 0;
        top: 1%;
        margin: 0 auto;
        width: 90%;
        min-height: 5%;
        max-height: calc( 100% - 2.96rem );
        box-shadow: 0 0 .04rem #8ae4f1;
        padding: .1rem .16rem;
        border-radius: .08rem;
        background-color: rgba(13,13,13,.95);
        color: #fff;
        font-size: .22rem;
        line-height: .25rem;
        z-index: 5000;
        overflow: hidden;
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
        height: 8rem;
        padding-bottom: 2rem;
        /* height: calc( 100% - 10rem ); */
    }
    .btn-close,.btn-arrow{
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #fff;
        font-size: .3rem;
        height: .4rem;
    }
    .btn-close{
        width: .4rem;
        top: .26rem;
        right: .2rem;
        border: .02rem solid #fff;
        border-radius: 50%;
    }
    .btn-arrow{
        padding: 0 .08rem;
        top: .26rem;
        right: 1rem;
        color: #4F9F9F;
        border: .01rem solid #4F9F9F;
    }
</style>

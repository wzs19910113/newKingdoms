<template>
    <a class="avatar" ref="avatar" :class="common.isCrumble(unit)?'avatar-crumble':''" @click.stop="_onTap">
        <span class="nickname" v-if="showNickName&&unit.nk">
            “{{unit.nk}}”
        </span>
        <span class="name">
            {{unit.nm}}
        </span>
        <img class="bg-src" :src="require(`../assets/${common.calcIconSrc(unit)}`)" />
    </a>
</template>
<script>
import { query, r, bulbsort, getParentNode, numFormat, genRandomWorkerName, genRandomRoomName, genRandomFactoryName, genRandomWorker, genRandomTerminal, genRandomRoom, getListByID } from '../tools/utils';
import * as common from '../tools/common';
import { DEBUG, CONFIG } from '../config/config';
export default {
    props:{
        unit: {
            type: Object,
            default: function(){},
        },
        showNickName: Boolean,
        onTap: { // 点击事件
            type: Function,
            default: function(){},
        },
    },
    data() {
        return {

            common,
            DEBUG,
            CONFIG,
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
    .avatar{
        position: relative;
        width: 100%;
        height: 100%;
        border-radius: 50%;
    }
    .avatar-crumble{
        box-shadow: 0 0 .4rem #e81313 inset;
    }
    .avatar .nickname,
    .avatar .name{
        position: absolute;
        display: inline-block;
        z-index: 10;
        left: 0;
        right: 0;
        margin: 0 auto;
        text-align: center;
        color: #000;
        font-weight: bold;
        background-color: rgba(255,255,255,.85);
    }
    .avatar .nickname{
        bottom: .32rem;
        height: .24rem;
        line-height: .26rem;
    }
    .avatar .name{
        bottom: 0;
        height: .3rem;
        line-height: .32rem;
    }
    .avatar .bg-src{
        position: absolute;
        display: block;
        z-index: 5;
        width: 100%;
        height: 100%;
        top: -15%;
        right: 0;
        bottom: 0;
        left: 0;
        margin: 0;
        border-radius: 50%;
        transform: scale(1.25);
    }
</style>

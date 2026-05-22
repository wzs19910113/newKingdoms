<template>
    <a class="avatar" ref="avatar" :class="`${common.isCrumble(unit)?'avatar-crumble':''} avatar-name-${nameStyle} avatar-halo-${getHaloIndex(unit)}`" @click.stop="_onTap">
        <span class="nickname" v-if="unit.nk">
            {{unit.nk}}
        </span>
        <span class="name">
            {{unit.nm}}
        </span>
        <!-- <img class="bg-src" :src="require(`../assets/${common.calcIconSrc(unit)}`)" /> -->
        <canvas v-if="unit.i" class="bg-src" :class="`bg-size-${size}`" :width="CVSLEN" :height="CVSLEN" ref="cvs" />
        <div class="halo" :class="`halo-${getHaloIndex(unit)}`"></div>
    </a>
</template>
<script>
import { query, r, bulbsort, getParentNode, numFormat, genRandomWorkerName, genRandomRoomName, genRandomFactoryName, genRandomWorker, genRandomTerminal, genRandomRoom, getListByID } from '../tools/utils';
import * as common from '../tools/common';
import { genRandomAvatar, paintAvatar, genForeHairData, genBangsData, genBackHairData, } from '../tools/avatar';
import { DEBUG, CONFIG } from '../config/config';
const CVSLEN = (window.GLOBAL||{fontSize:7.5}).fontSize*5;
export default {
    props:{
        unit: {
            type: Object,
            default: function(){},
            required: true,
        },
        nameStyle: {
            type: Number,
            default: 1,
        },
        size:{
            type: Number,
            default: 1, // 1小 2中 3大
        },
        onTap: { // 点击事件
            type: Function,
            default: function(){},
        },
    },
    data() {
        return {

            ctx: null,

            common,
            CVSLEN,
            DEBUG,
            CONFIG,
        };
    },
    computed: {
    },
    mounted(){
        this.init();
    },
    updated(){
        this.init();
    },
    methods: {
        init(){
            let cvs = this.$refs.cvs;
            if(cvs){
                this.ctx = cvs.getContext(`2d`);
                if(this.ctx&&this.unit.i){
                    let avatarTemplate = common.calcAvatarData(this.unit);
                    let avatarData = JSON.parse(avatarTemplate);
                    paintAvatar(this.ctx,avatarData,CVSLEN,CVSLEN);
                }
            }
        },
        getHaloIndex(unit){
            let res = ``;
            let { id, it, rel, } = unit;
            if(rel==0){
                res = it;
                if(id>50&&id<101){ // 是BOSS
                    res = 5;
                }
            }
            return res;
        },
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
        background-color: rgba(255,255,255,.85);
        font-weight: bold;
    }
    .avatar-name-1 .nickname{
        bottom: .32rem;
        height: .24rem;
        line-height: .26rem;
    }
    .avatar-name-1 .name{
        bottom: 0;
        height: .3rem;
        line-height: .32rem;
    }
    .avatar-name-2 .nickname{
        top: -.2rem;
        left: -.1rem;
        margin-left: 0;
        width: .2rem;
        line-height: .16rem;
        text-align: left;
        background-color: transparent;
        text-shadow: 0 0 .08rem #000;
        writing-mode: vertical-lr;
        text-rendering: optimizeLegibility;
        z-index: 15;
        color: #fff;
        font-size: .2rem;
    }
    .avatar-name-2 .name{
        bottom: 0;
        height: .3rem;
        line-height: .32rem;
    }
    .avatar .bg-src{
        position: absolute;
        display: block;
        z-index: 5;
        margin: 0;
        bottom: 0;
        border-radius: 50%;
        transform: scale(1.25);
    }
    .avatar .bg-size-1{
        width: 100%;
        height: 100%;
        top: -15%;
    }
    .avatar .bg-size-2{
        width: 150%;
        height: 150%;
        top: -50%;
        right: -25%;
    }
    /* 背景光环 */
    .avatar-halo-1 .nickname{
        color: #09C6ED;
        background-color: #000;
    }
    .avatar-halo-2 .nickname{
        color: gold;
        background-color: #000;
    }
    .avatar-halo-3 .nickname{
        color: #9932CC;
        background-color: #000;
    }
    .avatar-halo-4 .nickname{
        color: orangeRed;
        font-size: .22rem;
        background-color: #000;
    }
    .avatar-halo-5 .nickname{
        color: #E81313;
        font-size: .22rem;
        background-color: #000;
    }
    .halo{
        position: absolute;
        top: 0;
        right: 0;
        left: 0;
        bottom: 0;
        margin: auto;
        width: 100%;
        height: 100%;
        border-radius: 50%;
    }
    .halo-1{
        box-shadow: 0 0 .2rem .08rem #09C6ED inset;
    }
    .halo-2{
        box-shadow: 0 0 .2rem .08rem gold inset;
    }
    .halo-3{
        box-shadow: 0 0 .2rem .08rem #9932CC inset;
    }
    .halo-4{
        box-shadow: 0 0 .2rem .08rem orangeRed inset;
    }
    .halo-5{
        box-shadow: 0 0 .2rem .08rem #E81313 inset;
    }
</style>

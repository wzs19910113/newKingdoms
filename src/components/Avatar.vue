<template>
    <a class="avatar" ref="avatar" :class="common.isCrumble(unit)?'avatar-crumble':''" @click.stop="_onTap">
        <span class="nickname" v-if="showNickName&&unit.nk">
            “{{unit.nk}}”
        </span>
        <span class="name">
            {{unit.nm}}
        </span>
        <!-- <img class="bg-src" :src="require(`../assets/${common.calcIconSrc(unit)}`)" /> -->
        <canvas v-if="unit.i" class="bg-src" :class="`bg-size-${size}`" :width="CVSLEN" :height="CVSLEN" ref="cvs" />
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
        showNickName: Boolean,
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
</style>

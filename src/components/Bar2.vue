<template>
    <a class="circular-progress" @click.stop="_onTap">
        <svg viewBox="0 0 110 110" class="progress-svg">
            <!-- 背景圆环 -->
            <circle class="progress-bg" cx="55" cy="55" r="45" fill="none" :stroke="bgColor" :stroke-width="strokeWidth"/>
            <!-- 进度圆环（顺时针旋转从顶部开始） -->
            <circle class="progress-bar" cx="55" cy="55" r="45" fill="none" :stroke="pColor" :stroke-width="strokeWidth" :stroke-dasharray="circumference" :stroke-dashoffset="progressOffset" transform="rotate(-90 55 55)"/>
        </svg>
        <!-- 中心显示百分比 -->
        <label class="progress-text">{{percentage}}</label>
    </a>
</template>

<script>

import { query, r, exptr, setInRange, shuffle, bulbsort, getParentNode, cloneObj, numFormat, avg, percent, calcDistance, getMatchList, getSubMatchList, removeFromList, arrContains, } from '../tools/utils';
import * as common from '../tools/common';
import { DEBUG, CONFIG } from '../config/config';

export default{
    name: "Bar2",
    props: {
        current:{ // 当前进度值
            type: Number,
            required: true,
            validator: (value) => value >= 0
        },
        type: {  // [1:行动|2:隐蔽|3:潜能]
            type: Number,
            default: 1
        },
        size:{ // 圆环大小（宽高）
            type: Number,
            default: 25
        },
        strokeWidth:{ // 圆环线条粗细
            type: Number,
            default: 15
        },
        onTap: { // 点击事件
            type: Function,
            default: function(){},
        },
    },
    data(){
        return{
            pColor: ['','#00a800','#8B008B','#FFA500','#00a800','#a21821'][this.type],
            bgColor: ['','transparent','transparent','transparent','transparent','transparent'][this.type],

            common,DEBUG,CONFIG,
        }
    },
    computed: {
        percentage(){ // 计算百分比（0-100）
            const percent = common.awaFormat(this.current);
            return Math.min(100, Math.max(0, Math.floor(percent)));
        },
        circumference(){ // 圆环周长（半径45，周长=2*PI*45 ≈ 282.74）
            const radius = 45;
            return 2 * Math.PI * radius;
        },
        progressOffset(){ // 根据进度计算偏移量（偏移越大，显示越少）
            const progressLength = ( 1 - this.circumference * this.percentage ) / 100;
            return this.circumference - progressLength;
        },
        textSize(){ // 中心文字大小（根据组件大小自适应）
            return Math.max(12, Math.floor(this.size / 5));
        },
    },
    methods: {
        _onTap(){
            this.$emit('onTap');
        },
    },
};
</script>

<style scoped>
.circular-progress{
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.progress-svg{
    width: 100%;
    height: 100%;
    transform: rotate(0deg);
}

.progress-bg{
    transition: stroke-dashoffset 0.3s ease;
}

.progress-bar{
    transition: stroke-dashoffset 0.3s ease;
}

.progress-text{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #fff;
    text-align: center;
    line-height: 1;
    font-size: .16rem;
}
</style>

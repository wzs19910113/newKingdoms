<template>
    <div class="ani-effect">
        <AniElement class="effect" v-for="(play,index) in playList" :key="play.id" @onAnimationEnd="onSingleAnimationEnd"
            :id="play.id"

            :type="play.type"
            :text="play.text"
            :color="play.color"
            :fontSize="play.fontSize"

            :delay="play.delay"
            :period="play.period"
            :initAngle="play.initAngle"
            :spinSpeed="play.spinSpeed"

            :fromX="play.fromX"
            :fromY="play.fromY"
            :toX="play.toX"
            :toY="play.toY"
            :scaleX="play.scaleX"
            :scaleY="play.scaleY"
        />
    </div>
</template>

<script>
import AniElement from './AniElement.vue';
import { query, r, exptr, setInRange, shuffle, bulbsort, getParentNode, cloneObj, numFormat, avg, percent, calcDistance, getMatchList, getSubMatchList, removeFromList, arrContains, } from '../tools/utils';
import * as common from '../tools/common';
import { DEBUG, CONFIG, CACHE, } from '../config/config';

const typeMap = ['text','thunder', 'arc', 'laser', 'blood', 'fire', 'explosion', 'heal', 'barrier', 'formation', 'moon', 'halo', 'cross', 'dark', ];

const textColorMap = [
    {r:44,g:179,b:84}, // 1治疗
    {r:255,g:15,b:15}, // 2伤害
    {r:155,g:155,b:255}, // 3精力
    {r:215,g:172,b:155}, // 4心防
    {r:0,g:168,b:0}, // 5行动力sp
    {r:139,g:0,b:139}, // 6潜能sp
    {r:255,g:165,b:0}, // 7存在感sp
    {r:255,g:215,b:0}, // 8金币
    {r:178,g:55,b:64}, // 9破盾sp
    {r:255,g:195,b:55}, // 10MISS
];

const sizeScale = (window.GLOBAL||{fontSize:7.5}).fontSize/42;

export default {
    name: 'Ani',
    props: {
        onAnimationEnd: { // 动画结束回调
            type: Function,
            default: function(){},
        },
    },
    components: { AniElement, },
    data() {
        return {
            params:{
                type: '',
                period: 0,
                initAngle: 0,
                spinSpeed: 0,
                fromX: 0,
                fromY: 0,
                toX: 0,
                toY: 0,
                scaleX: 0,
                scaleY: 0,
            },
            playList: [],
            playIdIndex: 1,

            common, DEBUG, CONFIG,
        }
    },
    mounted(){},
    beforeDestroy(){},
    methods:{
        trigger({name,fromX,fromY,toX,toY,textList}){ // 触发组合动画 textList=[{val,colorType,fontSize}]
            let toX2,toY2,fromX2,fromY2,angle1,text;
            switch(name){

                case 'text': // 显示数字
                    for(let i=0;i<textList.length;i++){
                        let { val, colorType, fontSize, } = textList[i];
                        text = val;
                        this.triggerElement({type:1, fromX:toX,fromY:toY, toX,toY, text,color:textColorMap[colorType-1], fontSize, delay: .2 +.3*i});
                    }
                break;
                case 'number-common': // 通用显示数字
                    for(let i=0;i<textList.length;i++){
                        let { val, colorType, fontSize, } = textList[i];
                        if(val<0){
                            text = `${val}`;
                            toY2 = toY+17*sizeScale;
                            fromY2 = toY+8*sizeScale;
                        }
                        else{
                            text = `+${val}`;
                            toY2 = toY-17*sizeScale;
                            fromY2 = toY-8*sizeScale;
                        }
                        if(colorType==8){
                            text += '$';
                        }
                        this.triggerElement({type:1, fromX,fromY:fromY2, toX,toY:toY2, text,color:textColorMap[colorType-1], fontSize, delay: .5 +.3*i});
                    }
                break;
                case 'number-quell': // 压制
                    fromX2 = toX + 45*sizeScale;
                    fromY2 = toY - 21*sizeScale;
                    toX2 = fromX2;
                    toY2 = fromY2 + 2*sizeScale;
                    for(let i=0;i<textList.length;i++){
                        let { val, } = textList[i];
                        text = `${common.awaFormat(val)}%`;
                        this.triggerElement({type:1, fromX:fromX2,fromY:fromY2, toX:toX2,toY:toY2, text,color:textColorMap[4], fontSize:.22, delay: .5 +.3*i});
                    }
                break;
                case 'number-potency-damage': // 气溃
                    fromX2 = toX + 47*sizeScale;
                    fromY2 = toY - 3*sizeScale;
                    toX2 = fromX2;
                    toY2 = fromY2 + 2*sizeScale;
                    for(let i=0;i<textList.length;i++){
                        let { val, } = textList[i];
                        text = `${common.awaFormat(val)}%`;
                        this.triggerElement({type:1, fromX:fromX2,fromY:fromY2, toX:toX2,toY:toY2, text,color:textColorMap[5], fontSize:.22, delay: .5 +.3*i});
                    }
                break;
                case 'number-lock-on': // 锁敌
                    fromX2 = toX + 45*sizeScale;
                    fromY2 = toY + 18*sizeScale;
                    toX2 = fromX2;
                    toY2 = fromY2 - 2*sizeScale;
                    for(let i=0;i<textList.length;i++){
                        let { val, } = textList[i];
                        text = `+${common.awaFormat(val)}%`;
                        this.triggerElement({type:1, fromX:fromX2,fromY:fromY2, toX:toX2,toY:toY2, text,color:textColorMap[6], fontSize:.22, delay: .5 +.3*i});
                    }
                break;

                case 'attack-slash': // 近战劈砍
                    angle1 = r(0,Math.PI*200);
                    this.triggerElement({type:13, fromX,fromY, toX,toY, angle:angle1/100, delay: 0 });
                    this.triggerElement({type:13, fromX,fromY, toX,toY, angle:(angle1+r(100,300))/100, delay: .15 });
                    this.triggerElement({type:5, fromX,fromY, toX,toY, delay:.5});
                break;
                case 'attack-smash': // 近战钝击
                    fromY = toY+(toY<fromY?160*sizeScale:-160*sizeScale);
                    toY2 = toY+(toY<fromY?-260*sizeScale:260*sizeScale);
                    fromY2 = toY+(toY<fromY?30*sizeScale:-30*sizeScale);
                    toX2 = toX;
                    this.triggerElement({type:11,fromX:toX2,fromY, toX:toX2,toY:toY2, period:.65, delay:.1,});
                    this.triggerElement({type:11,fromX:toX2,fromY:fromY2, toX:toX2,toY, delay:.35,});
                break;
                case 'attack-range': // 飞刀攻击
                    toX2 = toX+r(-15,15);
                    this.triggerElement({type:3,fromX,fromY, toX,toY, delay:.1,});
                    this.triggerElement({type:5,fromX,fromY, toX,toY, delay:.1+.5});
                break;
                case 'attack-fire': // 火枪攻击
                    fromY = toY<fromY?window.innerHeight:-100*sizeScale;
                    toY2 = toY<fromY?-300*sizeScale:window.innerHeight;
                    toX2 = toX+r(-15,15);
                    this.triggerElement({type:6,fromX:toX2,fromY, toX:toX2,toY:toY2,});
                    this.triggerElement({type:7,fromX,fromY, toX,toY, delay:.3});
                break;
                case 'attack-bullet': // 子弹攻击
                    fromY = toY<fromY?window.innerHeight:-100*sizeScale;
                    toY2 = toY<fromY?-300*sizeScale:window.innerHeight;
                    toX2 = toX+r(-15,15);
                    this.triggerElement({type:4,fromX:toX2,fromY, toX:toX2,toY:toY2,delay:.3});
                    fromY = toY+(toY<fromY?30*sizeScale:-30*sizeScale);
                    this.triggerElement({type:11,fromX:toX2,fromY, toX,toY, delay:.45});
                break;
                case 'attack-thunder': // 雷电攻击
                    this.triggerElement({type:2,fromX,fromY, toX,toY,});
                break;
                case 'attack-mental': // 心理攻击
                    this.triggerElement({type:14,toX,toY,delay:0});
                break;
                case 'protect-cure': // 治疗
                    this.triggerElement({type:8,toX,toY,delay:0});
                break;
                case 'protect-power': // 强化
                    toY2 = toY+15*sizeScale;
                    this.triggerElement({type:9,toX,toY,});
                    this.triggerElement({type:10,toX,toY:toY2,});
                break;
                case 'protect-pure': // 净化
                    this.triggerElement({type:12,toX,toY,delay:0});
                break;
                case 'attack-slash-heavy': // 近战劈砍·重
                    angle1 = r(0,Math.PI*200);
                    for(let i=0;i<5;i++){
                        this.triggerElement({type:13, fromX,fromY, toX,toY, angle:angle1+r(100,200*i)/100, delay: i*.15 });
                        this.triggerElement({type:5,fromX,fromY, toX,toY, delay:.2+i*.1});
                    }
                break;
                case 'attack-smash-heavy': // 近战钝击·重
                    fromY = toY+(toY<fromY?160*sizeScale:-160*sizeScale);
                    toY2 = toY+(toY<fromY?-260*sizeScale:260*sizeScale);
                    fromY2 = toY+(toY<fromY?30*sizeScale:-30*sizeScale);
                    for(let i=0;i<3;i++){
                        toX2 = toX+r(-15*sizeScale,15*sizeScale);
                        this.triggerElement({type:11,fromX:toX2,fromY, toX:toX2,toY:toY2, period:.65, delay:.1+.15*i,});
                        this.triggerElement({type:11,fromX:toX2,fromY:fromY2, toX:toX2,toY, delay:.45+.15*i,});
                    }
                break;
                case 'attack-range-heavy': // 飞刀攻击·重
                    for(let i=0;i<6;i++){
                        fromX2 = fromX+r(-250,250);
                        fromY2 = fromY+r(-20,20);
                        this.triggerElement({type:3,fromX:fromX2,fromY:fromY2, toX,toY, delay:.1*i,});
                        this.triggerElement({type:5,fromX,fromY, toX,toY, delay:.1*i+.5});
                    }
                break;
                case 'attack-fire-heavy': // 火枪攻击·重
                    for(let i=0;i<6;i++){
                        fromY = toY<fromY?window.innerHeight:-100*sizeScale;
                        toY2 = toY<fromY?-300*sizeScale:window.innerHeight;
                        toX2 = toX+r(-15,15);
                        this.triggerElement({type:6,fromX:toX2,fromY, toX:toX2,toY:toY2,delay:.1+i*.045});
                    }
                    this.triggerElement({type:7,fromX,fromY, toX,toY, delay:.44});
                break;
                case 'attack-bullet-heavy': // 子弹攻击·重
                    fromY = toY<fromY?window.innerHeight:-100*sizeScale;
                    toY2 = toY<fromY?-300*sizeScale:window.innerHeight;
                    fromY2 = toY+(toY<fromY?30*sizeScale:-30*sizeScale);
                    for(let i=0;i<6;i++){
                        toX2 = toX+r(-15,15);
                        this.triggerElement({type:4,fromX:toX2,fromY, toX:toX2,toY:toY2,delay:.3+.1*i});
                        this.triggerElement({type:11,fromX:toX2,fromY:fromY2, toX,toY, delay:.45+.1*i});
                    }
                break;
                case 'attack-thunder-heavy': // 雷电攻击·重
                    for(let i=0;i<6;i++){
                        toX2 = toX+r(-15*sizeScale,15*sizeScale);
                        this.triggerElement({type:2,fromX,fromY, toX:toX2,toY, delay:.1+i*.1});
                    }
                break;
            }
        },
        triggerElement({type,fromX,fromY,toX,toY,period,angle,text,color,fontSize,delay=0,}){ // 触发动画元素 type【1thunder 2arc 3laser 4blood 5fire 6explosion 7heal 8barrier 9formation 10moon 11halo 12cross 13dark】
            let res = { type: typeMap[type-1], fromX, fromY, toX, toY, delay, id:this.playIdIndex, };
            switch(res.type){
                case 'text': //
                    res.period = .95;
                    res.text = text;
                    res.color = color;
                    res.initAngle = 0;
                    res.spinSpeed = 0;
                    res.scaleX = 1;
                    res.scaleY = 1;
                    res.fontSize = fontSize;
                    res.fromX = toX;
                break;
                case 'thunder': //
                    res.period = .55;
                    res.initAngle = 0;
                    res.spinSpeed = 0;
                    res.scaleX = 1.2;
                    res.scaleY = .6;
                    res.fromX = toX;
                    res.fromY = toY-15*sizeScale;
                    res.toY = toY+23*sizeScale;
                break;
                case 'arc': //
                    res.period = .55;
                    res.initAngle = 0;
                    res.spinSpeed = 83;
                    res.scaleX = 1;
                    res.scaleY = 1;
                break;
                case 'laser': //
                    res.period = .25;
                    res.initAngle = Math.PI/2;
                    res.spinSpeed = 0;
                    res.scaleX = 3;
                    res.scaleY = .3;
                break;
                case 'blood': //
                    res.period = .55;
                    res.initAngle = 0;
                    res.spinSpeed = 0;
                    res.scaleX = 1;
                    res.scaleY = 1;
                    res.fromX = toX;
                    res.fromY = toY;
                break;
                case 'fire': //
                    res.period = .55;
                    res.initAngle = 0;
                    res.spinSpeed = 0;
                    res.scaleX = .2;
                    res.scaleY = 3;
                break;
                case 'explosion': //
                    res.period = .45;
                    res.initAngle = 0;
                    res.spinSpeed = 0;
                    res.scaleX = 1.4;
                    res.scaleY = .6;
                    res.fromX = toX;
                    res.fromY = toY;
                    res.toY = toY;
                break;
                case 'heal': //
                    res.period = .95;
                    res.initAngle = 0;
                    res.spinSpeed = 0;
                    res.scaleX = 1.4;
                    res.scaleY = 1.4;
                    res.fromX = toX;
                    res.fromY = toY+20*sizeScale;
                    res.toY = toY-0*sizeScale;
                break;
                case 'barrier': //
                    res.period = .75;
                    res.initAngle = 0;
                    res.spinSpeed = 0;
                    res.scaleX = 1.9;
                    res.scaleY = 2.5;
                    res.fromX = toX;
                    res.fromY = toY;
                break;
                case 'formation': //
                    res.period = .95;
                    res.initAngle = 0;
                    res.spinSpeed = 0;
                    res.scaleX = 1.6;
                    res.scaleY = .5;
                    res.fromX = toX;
                    res.fromY = toY;
                break;
                case 'moon': //
                    res.period = period||.35;
                    res.initAngle = toY<fromY?Math.PI:0;
                    res.spinSpeed = 0;
                    res.scaleX = 2.7;
                    res.scaleY = 1.9;
                break;
                case 'halo': //
                    res.period = .55;
                    res.initAngle = 0;
                    res.spinSpeed = 0;
                    res.scaleX = .9;
                    res.scaleY = .9;
                    res.fromX = toX;
                    res.fromY = toY;
                break;
                case 'cross': //
                    res.period = .35;
                    res.initAngle = angle||1;
                    res.spinSpeed = 0;
                    res.scaleX = .4;
                    res.scaleY = 1.7;
                    res.fromX = toX;
                    res.fromY = toY;
                break;
                case 'dark': //
                    res.period = .95;
                    res.initAngle = 0;
                    res.spinSpeed = 0;
                    res.scaleX = 1;
                    res.scaleY = 1;
                    res.fromX = toX;
                    res.fromY = toY;
                break;
            }
            res.scaleX *= sizeScale;
            res.scaleY *= sizeScale;
            this.playList.push(res);
            this.playIdIndex++;
        },
        onSingleAnimationEnd(id){ // 当单一动画结束
            this.playList = removeFromList(id,'id',this.playList);
            if(this.playList.length==0){ // 若所有动画都结束，则真的结束
                this.$emit('onAnimationEnd');
            }
        },
    }
}
</script>

<style scoped>
    .ani-effect{
        width: 100%;
        height: 100%;
    }
    .effect{
        position: fixed;
        top: 0;
        left: 0;
        pointer-events: none;
        z-index: 99999;
    }
</style>

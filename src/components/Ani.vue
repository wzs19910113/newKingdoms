<template>
    <div class="ani-effect">
        <BattleEffect class="effect" v-for="(play,index) in playList" :key="play.id" @onAnimationEnd="onSingleAnimationEnd"
            :id="play.id"
            :type="play.type"
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
import BattleEffect from '../_t/Ccc.vue';
import { query, r, exptr, setInRange, shuffle, bulbsort, getParentNode, cloneObj, numFormat, avg, percent, calcDistance, getMatchList, getSubMatchList, removeFromList, arrContains, } from '../tools/utils';
import * as common from '../tools/common';
import { DEBUG, CONFIG, CACHE, } from '../config/config';

const typeMap = ['thunder', 'arc', 'laser', 'blood', 'fire', 'explosion', 'heal', 'barrier', 'formation', 'moon', 'halo', 'cross', ];

export default {
    name: 'Ani',
    props: {
        onAnimationEnd: { // 动画结束回调
            type: Function,
            default: function(){},
        },
    },
    components: { BattleEffect, },
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
        trigger({name,fromX,fromY,toX,toY}){ // 触发组合动画 name【1近战攻击 2飞刀攻击 3火枪攻击 4雷电攻击 5治疗 6强化】
            switch(name){
                case 'attack-melee': // 近战攻击
                    // fromY = toY<fromY?window.innerHeight:-100;
                    // for(let i=0;i<2;i++){
                    //     let ttoX = toX+r(-15,15);
                    //     this.triggerElement({type:10,fromX:ttoX,fromY, toX:ttoX,toY, delay:.1*i,});
                    //     this.triggerElement({type:4,fromX,fromY, toX,toY, delay:.1*i+.5});
                    // }
                    this.triggerElement({type:12, fromX:toX,fromY:toY, toX,toY, angle:r(0,Math.PI*200)/100, delay: 0 });
                    this.triggerElement({type:12, fromX:toX,fromY:toY, toX,toY, angle:r(0,Math.PI*200)/100, delay: .15 });
                break;
                case 'attack-range': // 飞刀攻击

                break;
                case 'attack-bullet': // 火枪攻击
                    fromY = toY<fromY?window.innerHeight:-100;
                    let ttoY = toY<fromY?-200:window.innerHeight;
                    for(let i=0;i<3;i++){
                        let ttoX = toX+r(-15,15);
                        this.triggerElement({type:5,fromX:ttoX,fromY, toX:ttoX,toY:ttoY, delay:.1*i,});
                    }
                    this.triggerElement({type:6,fromX,fromY, toX,toY, delay:.3});
                break;
                case 'attack-thunder': // 雷电攻击

                break;
                case 'protect-cure': // 治疗
                    this.triggerElement({type:7,toX,toY,delay:.5});
                break;
                case 'protect-shield': // 强化

                break;
            }
        },
        triggerElement({type,fromX,fromY,toX,toY,angle,delay=0,}){ // 触发动画元素 type【1thunder 2arc 3laser 4blood 5fire 6explosion 7heal 8barrier 9formation 10moon 11halo 12cross】
            let res = { type: typeMap[type-1], fromX, fromY, toX, toY, delay, id:this.playIdIndex, };
            switch(res.type){
                case 'thunder': //
                    res.period = 55;
                    res.initAngle = 0;
                    res.spinSpeed = 0;
                    res.scaleX = 1.2;
                    res.scaleY = .6;
                break;
                case 'arc': //
                    res.period = .55;
                    res.initAngle = 0;
                    res.spinSpeed = 43;
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
                    res.period = .95;
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
                    res.scaleX = 2;
                    res.scaleY = 2;
                    res.fromX = toX;
                    res.fromY = toY+30;
                    res.toY = toY-30;
                break;
                case 'barrier': //
                    res.period = .95;
                    res.initAngle = 0;
                    res.spinSpeed = 5;
                    res.scaleX = 1.5;
                    res.scaleY = 1.5;
                    res.fromX = toX;
                    res.fromY = toY+30;
                    res.toY = toY-30;
                break;
                case 'formation': //
                    res.period = .95;
                    res.initAngle = 0;
                    res.spinSpeed = 0;
                    res.scaleX = 1.6;
                    res.scaleY = .5;
                    res.fromX = toX;
                    res.fromY = toY+30;
                    res.toY = toY-30;
                break;
                case 'moon': //
                    res.period = .55;
                    res.initAngle = toY<fromY?Math.PI:0;
                    // res.initAngle = 0;
                    res.spinSpeed = 0;
                    res.scaleX = 1;
                    res.scaleY = 1;
                break;
                case 'halo': //
                    res.period = .95;
                    res.initAngle = 0;
                    res.spinSpeed = 0;
                    res.scaleX = 1;
                    res.scaleY = 1;
                break;
                case 'cross': //
                    res.period = .35;
                    res.initAngle = angle||1;
                    res.spinSpeed = 0;
                    res.scaleX = .3;
                    res.scaleY = 1.7;
                break;
            }
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

    }
</style>

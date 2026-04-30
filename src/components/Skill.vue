<template>
    <a class="skill" :class="`mode-${mode} ${isOption?'isoption':''} ${ban?'skill-ban':''}`" @click.stop="_onTap">
        <div class="skill-mode" :class="`${skill.t==3?'harm':'beni'}`" v-if="mode==1">
            <!-- <span class="value money" v-if="!isOption" v-html="common.moneyFormat(skill.v,1)"></span> -->
            <div class="row">
                <span class="name">{{skill.n}}</span>
                <a class="consume">（{{common.calcConsume({type:2,data:skill,unit})}}）</a>
                <span class="awa" v-if="skill.t==3">存在感 {{common.awaFormat(skill.d)}}%</span>
            </div>
            <div class="row row-desc">
                <span class="desc" v-html="getSkillTip()"></span>
            </div>
            <div class="row atk-wrap" v-if="atkEffectIndex!=-1">
                <div class="wrap-item atk">
                    <a class="atk-dmg">伤害 {{skill.el[atkEffectIndex].d.d}}</a>
                    <a class="atk-r1" v-if="skill.el[atkEffectIndex].d.r1" @click.stop="_onTapRx1">（ 力补：{{common.genRXString(skill.el[atkEffectIndex].d.r1)}} ）</a>
                    <a class="atk-r2" v-if="skill.el[atkEffectIndex].d.r2" @click.stop="_onTapRx2">（ 准补：{{common.genRXString(skill.el[atkEffectIndex].d.r2)}} ）</a>
                </div>
            </div>
            <div class="row buff-wrap" v-if="buffEffectIndex!=-1">
                <div class="wrap-item buff" v-for="(buffId,index) in skill.el[buffEffectIndex].d.b">
                    <Buff class="buff" :buff="genBuff(buffId,skill.el[buffEffectIndex].d.bl[index])" :mode="2" :shadow="isOption?0:1" @onTap="_onTapBuff(buffId,skill.el[buffEffectIndex].d.bl[index])" />
                </div>
            </div>
        </div>
        <div class="skill-mode" :class="`${skill.t==3?'harm':'beni'}`" v-if="mode==2">
            <div class="row">
                <span class="name">{{skill.n}}</span>
                <span class="consume">（{{common.calcConsume({type:2,data:skill,unit})}}）</span>
            </div>
        </div>
    </a>
</template>
<script>
import Buff from '../components/Buff';
import { query, r, exptr, setInRange, shuffle, bulbsort, getParentNode, cloneObj, numFormat, avg, percent, calcDistance, getMatchList, getSubMatchList, removeFromList, arrContains, } from '../tools/utils';
import * as common from '../tools/common';
import { DEBUG, CONFIG } from '../config/config';

export default {
    name: 'Skill',
    props:{
        skill: Object,
        mode: { // 模式 1详细 2简略
            type: Number,
            default: 1,
        },
        unit: { // 持有者
            type: Object,
            default: function(){},
        },
        ban: { // 禁用
            type: Boolean,
            default: false,
        },
        isOption: { // 是选项
            type: Boolean,
            default: false,
        },
        onTap: { // 点击事件
            type: Function,
            default: function(){},
        },
    },
    data() {
        return {

            atkEffectIndex: -1, // 攻击效果的下标
            buffEffectIndex: -1, // 赋予状态效果的下标

            common,DEBUG,CONFIG,
        };
    },
    computed: {
    },
    mounted(){
        for(let i=0;i<this.skill.el.length;i++){
            let effect = this.skill.el[i];
            if(effect.t==1){
                this.atkEffectIndex = i;
            }
            if(effect.t==2){
                this.buffEffectIndex = i;
            }
        }
        // console.log(this.skill.n,this.skill);
    },
    methods: {
        genBuff(buffId,buffLevel){ // 生成buff数据
            let res = {};
            let buffArr = [...CONFIG.goodBuffs,...CONFIG.badBuffs];
            let oBuff = getMatchList(buffArr,[['id',buffId]])[0];
            if(oBuff){
                res = cloneObj(oBuff);
                res.level = buffLevel;
            }
            return res;
        },
        getSkillTip(){ // 获取技能描述
            let effectTip = ``;
            effectTip += `令${['自己','友方','敌方'][this.skill.t-1]}：`;
            for(let i=0;i<this.skill.el.length;i++){
                let { t, d, } = this.skill.el[i];
                switch(t){
                    case 1: // 攻击
                        effectTip += `受到伤害，`;
                    break;
                    case 2: // 添加状态
                        effectTip += `获得状态，`;
                    break;
                    case 3: // 减弱正面状态
                        effectTip += `状态强度-${d}，`;
                    break;
                    case 4: // 减弱负面状态
                        effectTip += `状态强度-${d}，`;
                    break;
                    case 5: // 恢复生命
                        effectTip += `治疗（${d.h}${d.rx>0?`+智${common.genRXString(d.rx)}）`:'）'}，`;
                    break;
                    case 6: // 改变护甲
                        // effectTip += `${d>0?'护甲+':'护甲'}${d}，`;
                    break;
                    case 7: // 改变潜能
                        effectTip += `${d.d>0?'潜能提升':'潜能'}（${common.awaFormat(d.d)}%`;
                        if(d.rx){
                            effectTip += `+爆${common.genRXString(d.rx)}）`;
                        }
                        else{
                            effectTip += `）`;
                        }
                        effectTip += `，`;
                    break;
                    case 8: // 改变心防
                        effectTip += `${d.d>0?'心理恢复':'心理伤害'}（${Math.abs(d.d)}`;
                        if(d.rx1){
                            effectTip += `+定${common.genRXString(d.rx1)}）`;
                        }
                        else if(d.rx2){
                            effectTip += `+智${common.genRXString(d.rx2)}）`;
                        }
                        else{
                            effectTip += `）`;
                        }
                        effectTip += `，`;
                    break;
                    case 9: // 改变存在感
                        if(d.d>0){
                            effectTip += `存在感+${Math.abs(common.awaFormat(d.d))}%`;
                        }
                        else{
                            effectTip += `存在感下降（隐${common.genRXString(d.rx)})`;
                        }
                        effectTip += `， `;
                    break;
                    break;
                }
            }
            if(effectTip[effectTip.length-1]=='，'){
                effectTip = effectTip.slice(0,-1);
            }
            return effectTip;
        },
        _onTap(){
            this.$emit('onTap',{flag:1,data:this.skill,ban:this.ban,});
        },
        _onTapRx1(){
            this.$emit('onTap',{flag:3,text:`力量补正：力量带来的伤害提升`});
        },
        _onTapRx2(){
            this.$emit('onTap',{flag:3,text:`精准补正：精准带来的伤害提升`});
        },
        _onTapBuff(buffId,buffLevel){
            this.$emit('onTap',{flag:2,buffId,buffLevel,skill:this.skill});
        },
    },
    components: {
        Buff,
    },
};
</script>
<style scoped>
    .skill{
        display: inline-block;
        /* box-shadow: 0 0 .08rem #fff; */
        border-top: .02rem solid #fff;
        border-left: .02rem solid #fff;
        border-bottom: .02rem solid #888;
        border-right: .02rem solid #888;
    }
    .skill-mode{
        position: relative;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex-direction: column;
        width: 100%;
        min-height: 1.2rem;
        line-height: .32rem;
        color: #fff;
        font-size: .22rem;
        padding: .14rem .12rem;
    }
    .row{
        width: 100%;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        min-height: .4rem;
        margin-bottom: .1rem;
        text-shadow: .02rem .02rem .12rem #000;
    }
    .row:last-child{
        margin-bottom: 0;
    }
    .money{
        color: gold;
    }
    /* 名字 */
    .row .name{
        font-size: .3rem;
        font-weight: bold;
    }
    .row .consume{
        color: #05cFd3;
        font-weight: bold;
    }
    .row-desc{
        align-items: flex-start;
    }
    .row .awa{
        display: inline-block;
        background-color: #DAA520;
        padding: 0 .06rem;
        height: .3rem;
        line-height: .3rem;
        font-size: .24rem;
        border-radius: .04rem;
        margin-right: .08rem;
        color: #131313;
        text-shadow: none;
        white-space: nowrap;
        word-break: keep-all;
    }
    .row .desc{
        text-align: left;
    }
    .value{
        position: absolute;
        top: .16rem;
        right: -.08rem;
        padding: 0 .2rem;
        height: .34rem;
        line-height: .34rem;
        background-color: rgba(24,24,24,.98);
        /* border-top-left-radius: .06rem; */
        border-bottom-left-radius: .16rem;
    }
    .beni{
        background-color: #224B12;
        background-image: linear-gradient(to right top, rgba(14,25,18,1) 0%, rgba(18,53,26,1) 50%, rgba(18,53,26,1) 70%, rgba(14,65,38,1) 100%);
    }
    .harm{
        background-color: #A05040;
        background-image: linear-gradient(to right top,rgba(45,14,18,1) 0%,rgba(125,48,17,1) 10%,rgba(125,48,17,1) 20%,rgba(95,32,36,1) 100%);
    }
    .atk-wrap{
        flex-direction: column;
    }
    .atk{
        width: 100%;
        height: .44rem;
        line-height: .44rem;
        text-align: left;
        padding: 0 .18rem;
        border-radius: .04rem;
        background-color: rgba(14,14,14,.74);
    }
    /* 简略版本 */
    .mode-2{
    }
    .mode-2:last-child{
        margin-right: 0;
    }
    .mode-2 .skill-mode{
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        min-height: 0;
        padding: 0;
        margin: 0;
        font-weight: normal;
        font-size: .24rem;
    }
    .mode-2 .row{
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
    }
    .mode-2 .name{
        font-weight: normal;
        font-size: .24rem;
        overflow: hidden;
        white-space: nowrap;
        word-break: keep-all;
    }
    /* 作为选项 */
    .isoption .skill-mode{
        /* background-color: rgba(24,24,24,.98); */
        background-color: transparent;
        background-image: none;
    }
    .isoption .beni{
        border-left: .2rem solid rgba(14,65,38,1);
    }
    .isoption .harm{
        border-left: .2rem solid rgba(95,32,36,1);
    }
    /* 禁用 */
    .skill-ban{
        background-color: rgba(55,55,55,.4);
        box-shadow: none;
        border: none;
        opacity: .7;
        color: #000;
    }
    .skill-ban .name{
        text-decoration: line-through;
        color: #777;
    }
    .skill-ban .consume{
        text-decoration: line-through;
        color: #777;
    }
    .skill-ban .desc{
        color: #777;
    }
    .skill-ban .beni{
        border-color: #232;
    }
    .skill-ban .harm{
        border-color: #322;
    }
</style>

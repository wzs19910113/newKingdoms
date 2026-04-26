<template>
    <div class="main">
        <!--作弊-->
        <!-- <nut-drag direction="y" :style="{right:'0px',top:'75px',zIndex:'200'}" v-if="DEBUG">
            <a class="btn touch-dom" @click="onTapCheat">cheat</a>
        </nut-drag> -->
        <!-- 主体 -->
        <div class="panel" v-if="state==0">
            <div class="equip-wrap">加载中</div>
        </div>
        <div class="panel" v-if="state==1">
            <!-- <img class="bg-src" :src="require(`../assets/bg-battle.png`)" />
            <img class="bg-src" :src="require(`../assets/bg-menu.png`)" />
            <img class="bg-src" :src="require(`../assets/icon-female-1.png`)" />
            <img class="bg-src" :src="require(`../assets/icon-female-2.png`)" />
            <img class="bg-src" :src="require(`../assets/icon-female-3.png`)" />
            <img class="bg-src" :src="require(`../assets/icon-male-1.png`)" />
            <img class="bg-src" :src="require(`../assets/icon-male-2.png`)" />
            <img class="bg-src" :src="require(`../assets/icon-male-3.png`)" /> -->
            <!-- <div class="skill-wrap">
                <Skill class="skill" v-for="skill of game.allSkills" :key="skill.id" :skill="skill" :mode="1" @onTap="onTapSkill" />
            </div>
            <div class="equip-wrap">
                <Equip v-for="equip of game.allEquips" :key="equip.id" :equip="equip" @onTap="onTapEquip" />
            </div> -->

            <!-- 操作板块 -->
            <div class="menu-wrap">
                <draggable class="unit-list-group" handle=".mover" :disabled="false" v-model="team" @end="onUnitDragEnd" animation="100">
                    <div class="unit-item" v-for="(unit,index) in team" :key="index">
                        <div class="mover draggable">
                            <Avatar class="unit-avatar" :unit="unit" />{{unit.tms}}
                        </div>
                    </div>
                </draggable>
            </div>
        </div>
        <!-- 背景 -->
        <div class="bg"></div>
        <!-- alert -->
        <Toast ref="toast" />
    </div>
</template>

<script>
import List from '../components/List';
import Unit1 from '../components/Unit1';
import Bar1 from '../components/Bar1';
import Equip from '../components/Equip';
import Skill from '../components/Skill';
import Toast from '../components/Toast';
import Pop from '../components/Pop';
import Avatar from '../components/Avatar';
import draggable from 'vuedraggable';
import { cl, query, r, exptr, setInRange, loadImages, shuffle, bulbsort, bulbsort2, getParentNode, cloneObj, numFormat, avg, percent, calcDistance, getMatchList, getSubMatchList, removeFromList, arrContains, } from '../tools/utils';
import * as common from '../tools/common';
import * as ai from '../tools/ai';
import { DEBUG, CONFIG, CACHE, ASSETS, } from '../config/config';

const BUFF_LIST = [...CONFIG.goodBuffs,...CONFIG.badBuffs];

export default {
    name: 'Home',
    data(){
        return {
            loading: false,
            state: 0,

            game: {},

            team: [],

            common,
            ASSETS,
            CONFIG,
            DEBUG,
        };

    },
    mounted(){
        if(window.GLOBAL&&window.GLOBAL.game){
            this.game = window.GLOBAL.game;
            loadImages(ASSETS.image_urls).then(images=>{
                this._alert(`成功加载 ${images.length} 张图片`,3);
                this.init();
            });
        }
        else{
            this.$router.push('/');
        }
    },
    methods: {
        save(tip){ // 存档
            try{
                let newStorage = window.GLOBAL.game;
                localStorage.setItem(CACHE.sto,JSON.stringify(newStorage));
                this._alert(`保存成功`);
            }
            catch(err){
                this._alert(`存储失败（${err}）`);
            }
        },

        init(){ // 初始化
            this.asynTeam();
            this.state = 1;
            console.log(this.game);
        },
        asynTeam(){ // 同步 team 数据到 home
            let team = [];
            for(let unit of this.game.allUnits){
                if(unit.tms){
                    let btd = common.getUnitBtd(unit,this.game);
                    let cUnit = cloneObj(unit);
                    cUnit.btd = btd;
                    team.push(cUnit);
                }
            }
            this.team = bulbsort(team,'tms',0);
        },

        onUnitDragEnd(e){ // 当单位拖拽结束
            for(let i=0;i<this.team.length;i++){
                let member = this.team[i];
                let oUnit = getMatchList(this.game.allUnits,[['id',member.id]])[0];
                if(oUnit){
                    oUnit.tms = i+1;
                }
            }
            this.asynTeam();

            // for(let i=0;i<this.team.length;i++){
            //     let member = this.team[i];
            //     if(member.id==this.oldSelectedRole.id){
            //         this.meIndex = i;
            //     }
            // }
        },

        onTapSkill(data){ // 点击【技能】
            let { flag, skill, buffId, buffLevel, text, } = data;
            if(flag==1){ //

            }
            else if(flag==2&&buffId&&buffLevel){ // 点击buff
                this.onTapBuff(buffId,buffLevel);
            }
            else if(flag==3&&text){ // 发送说明弹窗
                this._alert(text);
            }
        },
        onTapEquip(data){ // 点击【装备】
            let { flag, equip, buffId, buffLevel, sp, spLevel, } = data;
            if(flag==1){ //
                // console.log(equip);
            }
            else if(flag==2){ // 点击buff
                this.onTapBuff(buffId,buffLevel);
            }
            else if(flag==3){ // 点击SP
                this._alert(`${CONFIG.spAttackList[sp-1]}：${CONFIG.spAttackDescList[sp-1]}`,5);
            }
        },
        onTapBuff(id,level){ // 点击【buff】
            let buff = getMatchList(BUFF_LIST,[['id',id]])[0]||{};
            this._alert(`给予敌人：${buff.name}（强度${level}）- ${buff.desc}`,5);
        },
        onTapCheat(){ // 点击【作弊】按钮

        },

        _alert(text,time){ // 显示提示
            this.$refs.toast.trigger(text,time);
        },
    },
    components:{
        List,
        Bar1,
        Equip,
        Skill,
        Toast,
        Unit1,
        Avatar,
        draggable,
        Pop,
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .main{
        position: relative;
        text-align: center;
        width: 100%;
        height: 100%;
        color: #4a4a4a;
        font-size: .24rem;
        line-height: 0;
        background-color: #251404;
    }
    .btn{
        background-color: transparent;
        display: inline-block;
        color: #fff;
        text-align: center;
        cursor: pointer;
        border-radius: .01rem;
        border: .02rem solid #2F4F4F;
        box-shadow: 0 0 .14rem #2F4F4F inset;
    }
    .panel{
        width: 100%;
        height: 100%;
        overflow-y: auto;
    }

    .bg{
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        margin: 0;
        width: 100%;
        height: 100%;
        background-image: url('./../assets/bg-town-1.png');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        opacity: 1;
        z-index: 1;
        box-shadow: 0 0 4rem 1rem #acd inset;
        animation: bg_fadein .2s .3s ease-in forwards;
    }
    @keyframes bg_fadein {
        to{
            opacity: .8;
        }
    }
    .skill-wrap{
        width: 6rem;
        margin: 0 auto;
    }
    .skill-wrap .skill{
        display: block;
        margin-bottom: .2rem;
    }

    /* 菜单 */
    .menu-wrap{
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        height: 2.5rem;
        background-image: url('./../assets/bg-menu.png');
        background-size: 103% 160%;
        background-position: top;
        background-repeat: no-repeat;
        z-index: 2000;
        transition: all .2s;
    }
    .menu-wrap-expand{
        height: 100%;
    }
    .unit-list-group{
        width: 100%;
        height: 2.5rem;
        /* border: 1px solid red; */
        display: flex;
        justify-content: flex-start;
        align-items: center;
    }
    .unit-list-group .unit-item{
        display: flex;
        justify-content: center;
        align-items: center;
        width: 25%;
        height: 100%;
        position: relative;
    }
    .unit-list-group .unit-item .mover{
        display: block;
        width: 1.5rem;
        height: 1.5rem;
    }
    .unit-list-group .unit-item .unit-avatar{
        display: block;
        width: 100%;
        height: 100%;
    }

    /* 侧边按钮 */
    .touch-dom{
        width: 1.4rem;
        height: .76rem;
        line-height: .76rem;
        background-color: #2F4F4F;
    }
    .bg-src{
        display: block;
        width: 100%;
    }
</style>

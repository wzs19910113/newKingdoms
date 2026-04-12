<template>
    <div class="main">
        <!--作弊-->
        <nut-drag direction="y" :style="{right:'0px',top:'75px',zIndex:'200'}" v-if="DEBUG">
            <a class="btn touch-dom" @click="onTapCheat">cheat</a>
        </nut-drag>
        <!-- 主体 -->
        <div class="panel">
            <div class="equip-wrap">
                <Equip v-for="equip of game.allEquips" v-bind:key="equip.id" :equip="equip" />
            </div>
            <!-- <div class="skill-wrap">
                <Skill v-for="skill of game.allSkills" v-bind:key="skill.id" :equip="skill" />
            </div> -->
        </div>
        <!-- alert -->
        <Toast ref="toast" />
    </div>
</template>

<script>
import List from '../components/List';
import Bar1 from '../components/Bar1';
import Equip from '../components/Equip';
import Skill from '../components/Skill';
import Toast from '../components/Toast';
import Pop from '../components/Pop';
import { query, r, exptr, shuffle, bulbsort, getParentNode, cloneObj, numFormat, avg, percent, calcDistance, getMatchList, removeFromList, } from '../tools/utils';
import { DEBUG, CONFIG, CACHE, } from '../config/config';
export default {
    name: 'Home',
    data(){
        return {
            loading: false,
            state: 1,

            game: {},

            CONFIG,
            DEBUG,
        };

    },
    mounted(){
        if(window.GLOBAL&&window.GLOBAL.game){
            this.game = window.GLOBAL.game;
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

        onTapCheat(){ // 点击【作弊】按钮

        },

        _alert(text){ // 显示提示
            this.$refs.toast.trigger(text);
        },
    },
    components:{
        List,
        Bar1,
        Equip,
        Skill,
        Toast,
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
        background-color: #140425;
        overflow-y: auto;
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

    /* 侧边按钮 */
    .touch-dom{
        width: 1.4rem;
        height: .76rem;
        line-height: .76rem;
        background-color: #2F4F4F;
    }
</style>

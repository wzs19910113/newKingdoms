<template>
    <div class="main" v-if="game">
        <!--作弊-->
        <nut-drag direction="y" :style="{right:'0px',top:'75px',zIndex:'200'}" v-if="DEBUG">
            <a class="touch-dom" @click="onTapCheat">CHT</a>
        </nut-drag>
        <!--页面内容-->
        <div class="panel">
            <div class="body" v-if="state!=0">
                <!-- 阅读板块 -->
                <div class="role-list-container">
                    <div class="title">回合 {{round}}</div>
                    <div class="team-pan">
                        <BattleRole v-for="role in enemyTeam" v-bind:key="role.id" :role="role" />
                    </div>
                    <div class="board-container" v-if="state>1">
                        <div class="board-row">
                            <div class="board-t-2" v-if="curMoveRoles.length>0">本回合行动者（{{curMoveRoles.length}}→{{nextMoveCount}}）:
                                <span class="board-t-2-1" v-for="(role,index) in curMoveRoles" v-if="curMoveRoles[curMoveRoleIndex]">
                                    <span class="board-t-2-1-name" :class="`${curMoveRoles[curMoveRoleIndex].id==role.id?'cur-move':''}`">{{role.name}}</span>
                                    <span v-if="index<curMoveRoles.length-1">→</span>
                                </span>
                            </div>
                        </div>
                        <div class="board-row">
                            <div class="board-t-5">{{tip}}</div>
                        </div>
                    </div>
                    <div class="team-pan">
                        <BattleRole v-for="role in playerTeam" v-bind:key="role.id" :role="role" />
                    </div>
                </div>
                <!-- 操作板块 -->
                <div class="option-container" v-if="fob==0">
                    <div class="option-menu-1" v-if="menuState==1">
                        <a class="btn" @click="onTapAction(1)">攻击</a>
                        <a class="btn" @click="onTapAction(2)">恢复</a>
                        <a class="btn" @click="onTapAction(3)">加权</a>
                        <a class="btn" @click="onTapAction(4)">回气</a>
                        <br/>
                        <a class="btn" @click="onTapAction(5)">力量强化</a>
                        <a class="btn" @click="onTapAction(6)">治愈强化</a>
                        <a class="btn" @click="onTapAction(7)">防御强化</a>
                        <br/>
                        <a class="btn" @click="onTapCastMenu">施放技能</a>
                        <br/>
                        <a class="btn" @click="onTapAction(8)">撤离</a>
                        <a class="btn" @click="onTapAction(9)">攻心</a>
                        <a class="btn" @click="onTapAction(10)">置后</a>
                    </div>
                    <div class="option-menu-2" v-if="menuState==2">
                        <a class="btn" @click="onTapCastMenuBack">←</a>
                        <div class="option-menu-skills" v-if="curMoveRoles[curMoveRoleIndex].skills.length<=0">
                            无可用技能
                        </div>
                        <div class="option-menu-skills" v-else>
                            <a class="btn" :class="`${curMoveRoles[curMoveRoleIndex].vig<=0?'btn-ban':''}`" v-for="skill in curMoveRoles[curMoveRoleIndex].skills" @click="onTapSkill(skill)">
                                <span class="skill-name">{{skill.name}}</span>
                                <span class="skill-desc">{{skill.desc}}</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <a class="panel-shadow" v-if="fob==1" @click="onTapShadow">
            <div class="panel-shadow-tip">
                {{tip}}
            </div>
        </a>
    </div>
</template>

<script>
import BattleRole from '../components/BattleRole';
import List from '../components/List';
import Bar from '../components/Bar';
import { query, r, exptr, shuffle, bulbsort, getParentNode, cloneObj, numFormat, avg, percent, calcDistance, getMatchList, removeFromList, arrContains, } from '../tools/utils';
import { DEBUG, CONFIG, CACHE, } from '../config/config';

//@TODO
window.GLOBAL = {
    battle:{
        mode: 1, // 战斗模式【1:普通|2：BOSS|3：切磋】
        envirs: {
            mapId: 1,
            cellId: 2,
        },
        playerTeamIds: [1,2,],
        enemyTeamIds: [3,4,],
    },
    allRoles: [{ // 全部角色
        id: 1,
        name: '赵日天',
        gender: 1,
        age: 18,
        level: 1,
        exp: 0,
        stylies: [15,28,77,4,14,], // 人格 [勇猛,敏感,野心,理智,道德]
        teamSeq: 1,
        attrs: [5,1,2,3, 0,1,0, 3,50,4], // 基础属性 [0生命力,1攻击力,2护甲,3权重,4治愈,5力量,6防御,7体力,8精力,9智力]
        skillIds: [],
        equipIds: [1,2,0,], // [身体，手，装饰]
    },{
        id: 2,
        name: '孙晓瑶',
        gender: 2,
        age: 16,
        level: 2,
        exp: 0,
        stylies: [44,2,89,67,0,],
        teamSeq: 1,
        attrs: [4,1,1,4, 1,1,0, 2,45,7],
        skillIds: [1,],
        equipIds: [0,0,4,],
    },{
        id: 3,
        name: '路人甲',
        gender: 1,
        age: 35,
        level: 1,
        exp: 0,
        stylies: [50,2,4,7,9,],
        teamSeq: 0,
        attrs: [3,1,0,2, 0,0,0, 3,25,3],
        skillIds: [],
        equipIds: [0,0,0,],
    },{
        id: 4,
        name: '路人乙',
        gender: 1,
        age: 40,
        level: 1,
        exp: 0,
        stylies: [15,16,8,19,33,],
        teamSeq: 0,
        attrs: [3,1,0,3, 0,0,0, 2,22,4],
        skillIds: [],
        equipIds: [0,0,0,],
    },],
    allEquips: [{ // 全部装备
    	id: 1,
    	level: 1,
    	type: 1, // [1:身体|2:手|3:配饰]
    	attrs: [[0,3],[2,2],], // 装备属性 [[属性下标,属性调整值]]
    },{
    	id: 2,
    	level: 1,
    	type: 2, // [1:身体|2:手|3:配饰]
    	attrs: [[1,1],[3,1],], // 装备属性 [[属性下标,属性调整值]]
    },{
    	id: 3,
    	level: 1,
    	type: 3, // [1:身体|2:手|3:配饰]
    	attrs: [[4,1],[9,2],], // 装备属性 [[属性下标,属性调整值]]
    },],
    allSkills: [{ // 全部技能
        	id: 1,
        	level: 1,
        	name: '治疗术',
        	type: [7,3,],// 技能类型
        	buffId: [1,2,], // 添加的状态ID
            buffLevels: [1,1,],
        	consume: 4, // 体力消耗
            desc: '治疗，获得1级急救和1级抵挡。',
    },],
}

// 十进制转十一进制
function d211(num){
    if(num === 0) return '0';
    const digits = '0123456789A';
    let result = '';
    let n = num;
    while(n > 0){
        const remainder = n%11;
        result = digits[remainder]+result;
        n = Math.floor(n/11);
    }
    return result;
}
// 十一进制转十进制
function _11td(str){
    const digits = '0123456789A';
    str = str.toUpperCase();
    let result = 0;
    for(let i=0;i<str.length;i++){
        const char = str[i];
        const value = digits.indexOf(char);
        if(value==-1){
            throw new Error(`无效的十一进制数字: ${char}`);
        }
        result = result*11+value;
    }
    return result;
}

// 使用示例
// console.log('十进制转十一进制：');
// console.log('175489 ->', d211(175489));
// console.log('10 ->', d211(10));         // 输出 A
// console.log('11 ->', d211(11));         // 输出 10
// console.log('12 ->', d211(12));         // 输出 11
//
// console.log('\n十一进制转十进制：');
// console.log('10A936 ->', _11td('10A936'));
// console.log('A ->', _11td('A'));           // 输出 10
// console.log('10 ->', _11td('10'));         // 输出 11
// console.log('11 ->', _11td('11'));         // 输出 12


export default {
    name: 'Home',
    data(){
        return {
            loading: false,
            state: 0, // 页面状态【0:读取数据中|1：战斗准备完成|2：回合开始|3：角色回合结束|4：玩家选择行动|5：玩家选择目标角色|6：回合结束|7：战斗结束】
            menuState: 1, // 操作菜单级别
            fob: 1, // 页面可操纵状态
            tip: '', // 公示文字

            game: null,

            round: 1, //回合数
            playerTeam:[],
            enemyTeam:[],
            nextMoveCount: 0, // 下回合行动人数
            curMoveRoles: [], // 本回合可以行动的角色数组
            curMoveRoleIndex: 0, // 当前正在行动的角色下标

            CONFIG,
            DEBUG,
        };

    },
    mounted(){
        if(window.GLOBAL&&window.GLOBAL.battle){ // TODO
            this.game = window.GLOBAL;
            this.init();
            console.log(this.game);
            console.log(this.battleData);
        }
        else{
            this.$router.push('/');
        }
    },
    methods: {
        save(tip){ // 存档
            if(this.loading) return;
            let code = localStorage.getItem(CACHE.code)||'';
            if(!code){
                this.$toast.text('获取存档代码错误');
                return ;
            }
            this.loading = true;
            this.loading = this.$toast.loading();
            window.GLOBAL.game = this.game;
            window.GLOBAL.day = this.day;
            let _storageList = localStorage.getItem(CACHE.list)||'[]';
            let storageList = JSON.parse(_storageList);
            // 遍历存档
            let savedStorage;
            for(let storage of storageList){
                if(storage.code==code){
                    savedStorage = storage;
                    break;
                }
            }
            if(savedStorage){ // 已有存档
                try{
                    savedStorage.data = window.GLOBAL;
                    _storageList = JSON.stringify(storageList);
                    localStorage.setItem(CACHE.list,_storageList);
                    tip&&this.$toast.text('存储成功');
                }
                catch(err){
                    tip&&this.$toast.text(`存储失败（${err}）`);
                }
            }
            else{ // 没有该存档
                try{
                    let newStorage = {
                        code,
                        data: window.GLOBAL,
                    }
                    storageList.push(newStorage);
                    _storageList = JSON.stringify(storageList);
                    localStorage.setItem(CACHE.list,_storageList);
                    tip&&this.$toast.text('存储成功');
                }
                catch(err){
                    tip&&this.$toast.text(`存储失败（${err}）`);
                }
            }
            this.loading.hide();
            this.loading = null;
        },
        deleteSave(){ // 删除存档
            if(this.loading) return;
            let code = localStorage.getItem(CACHE.code)||'';
            if(!code){
                this.$toast.text('获取存档代码错误');
                return ;
            }
            this.loading = true;
            this.loading = this.$toast.loading();
            let _storageList = localStorage.getItem(CACHE.list)||'[]';
            let storageList = JSON.parse(_storageList);
            // 遍历存档
            let savedStorage;
            for(let storage of storageList){
                if(storage.code==code){
                    savedStorage = storage;
                    break;
                }
            }
            if(savedStorage){
                try{
                    let newStorageList = removeFromList(code,'code',storageList);
                    _storageList = JSON.stringify(newStorageList);
                    localStorage.setItem(CACHE.list,_storageList);
                    this.$toast.text('存档已删除');
                }
                catch(err){
                    this.$toast.text(`存档删除失败（${err}）`);
                }
            }
            else{
                this.$toast.text('存档代码失效，找不到该存档');
            }
            this.loading.hide();
            this.loading = null;
        },

        init(){ // 初始化全部
            let { playerTeamIds, enemyTeamIds, } = this.game.battle;
            let playerTeam = [], enemyTeam = [];
            let roleAction = (ids,team) => {
                for(let roleId of ids){
                    let role = getMatchList(this.game.allRoles,[['id',roleId]])[0];
                    if(role){
                        team.push(this.initRole(role));
                    }
                }
                return team;
            };
            this.playerTeam = roleAction(playerTeamIds,playerTeam);
            this.enemyTeam = roleAction(enemyTeamIds,enemyTeam);
            this.$nextTick(_=>{
                this.state = 1;
            });
        },
        initRole(role){ // 初始化角色数据
            let equips = [],skills = [];
            for(let equipId of role.equipIds){
                let equip = getMatchList(this.game.allEquips,[['id',equipId]])[0];
                if(equip){
                    equips.push(equip);
                }
            }
            for(let skillId of role.skillIds){
                let skill = getMatchList(this.game.allSkills,[['id',skillId]])[0];
                if(skill){
                    skills.push(skill);
                }
            }
            let res = cloneObj(role);
            let tempAttrs = res.attrs;
            for(let equip of equips){
                let eattrs = equip.attrs||[];
                for(let attr of eattrs){
                    tempAttrs[attr[0]] += attr[1];
                }
            }
            res.hp = tempAttrs[0]; // 生命力
            res.atk = tempAttrs[1]; // 攻击力
            res.def = tempAttrs[2]; // 护甲
            res.maxDef = res.def; // 最大护甲
            res.weight = tempAttrs[3]; // 权重
            res.heal = tempAttrs[4]; // 治愈
            res.str = tempAttrs[5]; // 力量
            res.dex = tempAttrs[6]; // 防御
            res.vig = tempAttrs[7]; // 气力
            res.tvig = tempAttrs[8]; // 精力（总体力）
            res.int = tempAttrs[9]; // 智力
            res.buffs = [];
            res.skills = skills;
            res.mentalDef = res.int*10; // 心理防御
            res.move = 0; // 本回合行动者
            res.alive = 1; // 存活
            if(res.teamSeq>0){
                res.isPlayer = 1; // 可操控角色
            }
            return res;
        },
        showTip(text){ // 显示提示
            console.log(text);
            this.tip = text;
        },
        nextStep(){ // 下一步
            let setMoveRoles = count =>{ // 随机挑选行动者数组
                let roles = [...this.playerTeam,...this.enemyTeam];
                let aliveRoles = [...getMatchList(this.playerTeam,[['alive',1]]),...getMatchList(this.enemyTeam,[['alive',1]])];
                let weights = [],shuffledWeights = [],distinctWeights = [];
                let moveRoles = [];
                for(let role of roles){
                    role.move = 0;
                }
                for(let role of roles){
                    for(let i=0;i<role.weight;i++){
                        weights.push(role.id);
                    }
                }
                shuffledWeights = shuffle(weights);
                // 去同
                for(let w of shuffledWeights){
                    if(arrContains(distinctWeights,w)==-1){
                        distinctWeights.push(w);
                    }
                }
                for(let i=0;i<count;i++){
                    let role = getMatchList(roles,[['id',distinctWeights[i]]])[0];
                    if(role){
                        moveRoles.push(role);
                    }
                }
                for(let i=0;i<count;i++){
                    moveRoles[i].move = i+1;
                }
                this.curMoveRoles = moveRoles;
            }
            if(this.state==1){ // 战斗准备完成
                let aliveRoles = [...getMatchList(this.playerTeam,[['alive',1]]),...getMatchList(this.enemyTeam,[['alive',1]])];
                let aliveCount = aliveRoles.length;
                this.round = 1;
                this.nextMoveCount = r(1,aliveCount);
                setMoveRoles(aliveCount);
                this.curMoveRoleIndex = 0;
                this.$nextTick(_=>{
                    this.state = 2;
                })
            }
            else if(this.state==2){ // 回合开始
                this.showTip(`第 ${this.round} 回合开始`);
                this.state = 3;
            }
            else if(this.state==3){ // 角色回合开始 @TODO
                let curMoveRole = this.curMoveRoles[this.curMoveRoleIndex];
                if(curMoveRole){
                    if(curMoveRole.isPlayer){ // 可操控角色
                        this.fob = 0;
                    }
                    else{ // 人机
                        this.state = 4;
                    }
                    this.showTip(`轮到 ${curMoveRole.name} 行动`);
                }
                else{
                    console.error(curMoveRole,`不存在`);
                }
            }
            else if(this.state==4){ // 角色回合结束
                let curMoveRole = this.curMoveRoles[this.curMoveRoleIndex];
                this.curMoveRoleIndex += 1;
                let nextMoveRole = this.curMoveRoles[this.curMoveRoleIndex];
                if(nextMoveRole){
                    this.showTip(`${curMoveRole.name} 的回合结束了`);
                    this.state = 3;
                }
                else{
                    this.showTip(`${curMoveRole.name} 的回合结束了，本回合结束`);
                    this.state = 6;
                }
            }
            else if(this.state==6){ // 回合结束
                let aliveRoles = [...getMatchList(this.playerTeam,[['alive',1]]),...getMatchList(this.enemyTeam,[['alive',1]])];
                this.round += 1;
                setMoveRoles(this.nextMoveCount);
                this.nextMoveCount = r(1,aliveRoles.length);
                this.curMoveRoleIndex = 0;
                this.showTip(``);
                this.$nextTick(_=>{
                    this.state = 2;
                })
            }
            else if(this.state==7){ // 战斗结束
                this.showTip(`战斗结束了`);
            }
        },

        onTapCastMenu(){ // 点击【施放技能】
            this.menuState = 2;
        },
        onTapCastMenuBack(){ // 点击【菜单-返回】
            this.menuState = 1;
        },
        onTapSkill(skill){ // 点击【技能】
            if(this.curMoveRole.vig<=0){
                return;
            }
        },
        onTapShadow(){ // 点击【幕布】
            this.nextStep();
        },
        onTapAction(flag){ // 点击【执行操作】
            let nextStep = _ =>{
                this.fob = 1;
                this.state = 4;
                this.nextStep();
            }
            if(flag==1){ // 攻击

            }
            else if(flag==2){ // 恢复
                nextStep();
            }
            else if(flag==3){ // 加权
                nextStep();
            }
            else if(flag==4){ // 回气
                nextStep();
            }
            else if(flag==5){ // 力量强化
                nextStep();
            }
            else if(flag==6){ // 治愈强化
                nextStep();
            }
            else if(flag==7){ // 防御强化
                nextStep();
            }
            else if(flag==8){ // 撤离
                nextStep();
            }
            else if(flag==9){ // 攻心

            }
            else if(flag==10){ // 置后
                nextStep();
            }
        },
        onTapCheat(){ // 点击【作弊】按钮

        },
    },
    components:{
        BattleRole,
        List,
        Bar,
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .main{
        text-align: center;
        width: 100%;
        height: 100%;
        color: #4a4a4a;
        font-size: .24rem;
    }
    .orange{
        color: #ff4f18;
    }
    .panel{
        position: relative;
        width: 100%;
        height: 100%;
        padding-bottom: 2.21rem;
        overflow-y: scroll;
        overflow-x: hidden;
    }
    .pop{
        background-color: #fff;
        width: 3rem;
    }
    .btn{
        background-color: #ff4f18;
        display: inline-block;
        color: #fff;
        text-align: center;
        cursor: pointer;
    }

    .panel-shadow{
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        box-shadow: 0 0 .35rem #000 inset;
        z-index: 100;
    }
    .panel-shadow-tip{
        width: 100%;
        height: 1rem;
        line-height: .25rem;
        font-size: .32rem;
    }
    .team-pan{
        height: 4rem;
    }

    /*board*/
    .board{

    }
    .board-t-2-1 .cur-move{
        color: #e81313;
    }

</style>

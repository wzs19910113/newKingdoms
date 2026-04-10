<template>
    <div class="main" v-if="game">
        <!--作弊-->
        <nut-drag direction="y" :style="{right:'0px',top:'75px',zIndex:'200'}" v-if="DEBUG">
            <a class="touch-dom" @click="onTapCheat">cheat</a>
        </nut-drag>
        <!--页面内容-->
        <div class="panel">
            <div class="body" v-if="pageState!=0">
                <!-- 战场 -->
                <div class="battle-field">
                    <!-- 敌方区域 -->
                    <div class="team-pan team-pan-top">
                        <Unit v-for="unit in enemyTeam" v-bind:key="unit.id" :unit="unit" :onTap="onTapUnit" />
                    </div>
                    <!-- 公示信息区域 -->
                    <div class="board-container" v-if="pageState>1">
                        <div class="board-row">
                        </div>
                    </div>
                    <!-- 我方区域 -->
                    <div class="team-pan team-pan-bottom">
                        <Unit v-for="unit in playerTeam" v-bind:key="unit.id" :unit="unit" :onTap="onTapUnit" />
                    </div>
                </div>
                <!-- 操作板块 -->
                <div class="option-container">
                    <div class="option-menu" v-if="menuState==1">
                        <a class="btn" @click="onTapAction(1)">攻击</a>
                        <a class="btn" @click="onTapAction(2)">技能</a>
                        <br/>
                        <a class="btn" @click="onTapAction(3)">防御</a>
                        <a class="btn" @click="onTapAction(4)">躲避</a>
                        <a class="btn" @click="onTapAction(5)">休整</a>
                        <br/>
                        <a class="btn" @click="onTapAction(6)">话术</a>
                        <a class="btn" @click="onTapAction(7)">追踪</a>
                        <a class="btn" @click="onTapAction(8)">撤离</a>
                    </div>
                </div>
            </div>
        </div>
        <!-- <a class="panel-shadow" v-if="showOperation==1" @click="onTapShadow">
            <div class="panel-shadow-tip">
                {{tip}}
            </div>
        </a> -->
        <Toast ref="toast" />
    </div>
</template>

<script>
import Unit from '../components/Unit';
import List from '../components/List';
import Bar1 from '../components/Bar1';
import Bar2 from '../components/Bar2';
import Toast from '../components/Toast';
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
        playerTeamIds: [1,2,3,4,5,],
        enemyTeamIds: [11,12,],
    },
    allUnits: [{ // 全部角色
        id: 1,
        nm: '赵日天', // 名字
        gd: 1, // 性别
        age: 18, // 年龄
        lvl: 1, // 等级
        exp: 0, // 经验值
        sty: [15,28,77,4,14,], // 性格[勇猛,敏感,野心,理智,道德]
        tms: 1, // 队伍编号
        as: [50,35,2,0, 20,14,16,17,25,10,], // 属性表 [0血量,1精力,2体力,3防御, 4力量,5精准,6速度,7智力,8定力,9隐蔽]
        ss: [], // 技能表
        es: [1,4,0,0,5,0,0], // 装备表 [0手一,1手二,2配饰一,3配饰二,4身体,5头,6脚]
    },{
        id: 2,
        nm: '孙晓瑶大西瓜',
        gd: 2,
        age: 16,
        lvl: 2,
        exp: 0,
        sty: [44,2,89,67,0,],
        tms: 2,
        as: [45449,40,113,-220, 18,25,23,24,22,29,],
        ss: [1,],
        es: [0,0,2,0,3,0,0],
    },{
        id: 11,
        nm: '路人甲',
        gd: 1,
        age: 35,
        lvl: 1,
        exp: 0,
        sty: [50,2,4,7,9,],
        tms: 0,
        as: [30,22,2,0, 20,4,13,9,12,5,],
        ss: [],
        es: [0,0,0,0,0,0,0],
    },{
        id: 12,
        nm: '路人乙',
        gd: 1,
        age: 40,
        lvl: 1,
        exp: 0,
        sty: [15,16,8,19,33,],
        tms: 0,
        as: [25,25,1,0, 12,15,11,10,14,8,],
        ss: [],
        es: [4,0,0,0,0,0,0],
    },],
    allEquips: [{ // 全部装备
    	id: 1,
        n: '龙虾刀',
    	t: 1, //  [1手,2配饰,3身体,4头,5脚]
    	a: [[4,20],[5,8],], // 装备属性 [[属性下标,属性调整值]] [0血量,1精力,2体力,3防御, 4力量,5精准,6速度,7智力,8定力,9隐蔽]
    },{
    	id: 2,
        n: '蝴蝶结',
    	t: 2,
    	a: [[1,5],[6,5],[7,10],[8,3],],
    },{
    	id: 3,
        n: '夜行衣',
    	t: 3,
    	a: [[3,2],],
    },{
    	id: 4,
        n: '铜铁铜铁铜铁锤',
    	t: 1,
    	a: [[4,8],],
    },{
    	id: 5,
        n: '锁子甲',
    	t: 3,
    	a: [[3,4],],
    },],
    allSkills: [{ // 全部技能
        	id: 1,
        	n: '治疗术',
        	t: [7,3,],// 技能类型
        	bid: [1,2,], // 添加的状态ID
            bls: [1,1,], // 状态等级
        	csm: 4, // 体力消耗
            des: '治疗，获得1级急救和1级抵挡。',
    },],
}

// TODO
window.GLOBAL.allUnits.push({ // 全部角色
    id: 3,
    nm: '赵日地', // 名字
    gd: 1, // 性别
    age: 18, // 年龄
    lvl: 1, // 等级
    exp: 0, // 经验值
    sty: [15,28,77,4,14,], // 性格[勇猛,敏感,野心,理智,道德]
    tms: 1, // 队伍编号
    as: [50,35,2,0, 20,14,16,17,25,39,], // 属性表 [0血量,1精力,2体力,3防御, 4力量,5精准,6速度,7智力,8定力,9隐蔽]
    ss: [], // 技能表
    es: [0,0,0,0,5,0,0], // 装备表 [0手一,1手二,2配饰一,3配饰二,4身体,5头,6脚]
});
window.GLOBAL.allUnits.push({ // 全部角色
    id: 5,
    nm: '赵日水', // 名字
    gd: 1, // 性别
    age: 18, // 年龄
    lvl: 1, // 等级
    exp: 0, // 经验值
    sty: [15,28,77,4,14,], // 性格[勇猛,敏感,野心,理智,道德]
    tms: 1, // 队伍编号
    as: [50,35,2,-23, 20,14,16,17,25,86,],
    ss: [], // 技能表
    es: [4,0,0,0,5,0,0],
});


// // 十进制转十一进制
// function d211(num){
//     if(num === 0) return '0';
//     const digits = '0123456789A';
//     let result = '';
//     let n = num;
//     while(n > 0){
//         const remainder = n%11;
//         result = digits[remainder]+result;
//         n = Math.floor(n/11);
//     }
//     return result;
// }
// // 十一进制转十进制
// function _11td(str){
//     const digits = '0123456789A';
//     str = str.toUpperCase();
//     let result = 0;
//     for(let i=0;i<str.length;i++){
//         const char = str[i];
//         const value = digits.indexOf(char);
//         if(value==-1){
//             throw new Error(`无效的十一进制数字: ${char}`);
//         }
//         result = result*11+value;
//     }
//     return result;
// }
//
// // 使用示例
// let d10 = `163842`, d11 = `10A476`;
// // console.log(`${d10} ->`, d211(d10));
// // console.log(`${d11} ->`, _11td(d11));
// let isDup = str =>{
//     for(let i=0;i<str.length;i++){
//         let s = str[i];
//         for(let j=0;j<str.length;j++){
//             if(j!=i&&s==str[j]){
//                 return true;
//             }
//         }
//     }
//     return false;
// }
// const RIDX1 = [0,1,2,3,4,], RIDX2 = [0,1,2,4,5];
// let comp = str =>{
//     let str11 = d211(str)+'';
//     // console.log(str,str11);
//     // console.log(str[5],str11[3]);
//     if((str11.length==6)&&(str[5]==str11[3])){
//         let remains = '';
//         for(let i=0;i<RIDX1.length;i++){
//             remains += str[RIDX1[i]];
//         }
//         for(let i=0;i<RIDX2.length;i++){
//             remains += str11[RIDX2[i]];
//         }
//         // console.log(remains);
//         if(str11[2]!='A'){
//             return false;
//         }
//         else if(isDup(str11)){
//             return false;
//         }
//         else if(isDup(remains)){
//             return false;
//         }
//         else{
//             return str11;
//         }
//     }
//     else{
//         return false;
//     }
// }
// // let res = [];
// // for(let i=163456;i<999999;i++){
// //     let p1 = i+'';
// //     if(!isDup(p1)){ // 不包含重复字符
// //         let cp = comp(p1);
// //         if(cp){
// //             res.push(p1);
// //         }
// //     }
// // }
// // console.log(res);
// // console.log(comp(`438091`));
// // let stock = [`平民`,`平民`,`平民`,`平民`,`狼人`,`狼人`,`狼人`,`机械狼`,`通灵师`,`女巫`,`守卫`,`猎人`,];
// // let unit = stock[r(0,stock.length-1)];
// // console.log(unit);

export default {
    name: 'Home',
    data(){
        return {
            loading: false,
            pageState: 1, // 页面状态【0:读取数据中|1：战斗准备完成|2：回合开始|3：角色回合结束|4：玩家选择行动|5：玩家选择目标角色|6：回合结束|7：战斗结束】
            menuState: 1, // 操作面板出现状态【0:不显示|1：显示基础选项|2：显示攻击选项|3：显示技能选项】
            tip: '', // 公示文字

            game: null,

            playerTeam:[],
            enemyTeam:[],

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
            let unitAction = (ids,team) => {
                for(let unitId of ids){
                    let unit = getMatchList(this.game.allUnits,[['id',unitId]])[0];
                    if(unit){
                        team.push(this.initUnit(unit));
                    }
                }
                return team;
            };

            this.playerTeam = unitAction(playerTeamIds,playerTeam);
            this.enemyTeam = unitAction(enemyTeamIds,enemyTeam);
        },
        initUnit(unit){ // 初始化单位数据
            let res = {};
            let equips = [], weapons = [], skills = [], btd = {};
            for(let equipId of unit.es){
                let equip = getMatchList(this.game.allEquips,[['id',equipId]])[0];
                if(equip){
                    equips.push(cloneObj(equip));
                    if(equip.t==1){
                        weapons.push(cloneObj(equip));
                    }
                }
            }
            for(let skillId of unit.ss){
                let skill = getMatchList(this.game.allSkills,[['id',skillId]])[0];
                if(skill){
                    skills.push(cloneObj(skill));
                }
            }
            res = cloneObj(unit);
            for(let equip of equips){
                let eattrs = equip.a||[];
                for(let attr of eattrs){
                    res.as[attr[0]] += attr[1];
                }
            }
            let tas = res.as; // [0血量,1精力,2体力,3防御, 4力量,5精准,6速度,7智力,8定力]
            btd.name = unit.nm;
            btd.hp = [tas[0],tas[0],]; // 血
            btd.def = [tas[3],tas[3],], // 护甲
            btd.eng = [tas[1],tas[1],], // 精力
            btd.phy = [tas[2],tas[2],], // 体力
            btd.dge = 10000-tas[9]*25; // 隐蔽
            btd.move = 0; // 行动
            btd.mdef = tas[8]*25; // 心理防御
            btd.alive = 1; // 存活
            btd.buffs = [];
            for(let i=0;i<weapons.length;i++){
                if(weapons[i]){
                    if(i==0){
                        btd.weapon1 = weapons[i].n;
                    }
                    else if(i==1){
                        btd.weapon2 = weapons[i].n;
                    }
                }
            }
            if(btd.teamSeq>0){
                btd.isPlayer = 1; // 可操控角色
            }
            res.btd = btd;
            // @TODO
            if(res.id==2){
                res.btd.selected = 1;
            }
            if(res.id==3||res.id==11){
                res.btd.alive = 0;
            }
            let bufflen = r(0,3);
            for(let i=0;i<bufflen;i++){
                let buff;
                if(r(0,1)){
                    buff = {
                        id: i+1,
            			name: '急救',
            			desc: '每回合恢复生命力',
            			level: r(1,3),
                        good: 1,
            			trendVals: [20,0,0,0],
                    }
                }
                else{
                    buff = {
                        id: i+100,
                        name: '破绽',
        				desc: '受到的伤害增加',
                        level: r(1,3),
                        good: 0,
            			trendVals: [0,0,20,0],
                    }
                }
                btd.buffs.push(buff);
            }
            return res;
        },
        _alert(text){ // 显示提示
            this.$refs.toast.trigger(text);
        },

        onTapUnit(data,evt){ // 点击【单位图标】
            let { flag, unit, buff, } = data;
            let btd = unit.btd;
            evt.stopPropagation();
            evt.preventDefault();
            if(flag==1){ // 点击单位
                this._alert(`${btd.name}`);
            }
            else if(flag==2){ // 点击buff
                this._alert(`${buff.name}（等级${buff.level}）`);
            }
            else if(flag==101){ // 点击血条
                this._alert(`生命力: ${btd.hp[0]} / ${btd.hp[1]}`);
            }
            else if(flag==102){ // 点击精条
                this._alert(`精力: ${btd.eng[0]} / ${btd.eng[1]}`);
            }
            else if(flag==103){ // 点击行动条
                this._alert(`行动进度: ${Math.round(btd.move/100)} %`);
            }
            else if(flag==104){ // 点击隐蔽条
                this._alert(`躲避率： ${Math.round(btd.dge/100)} %`);
            }
            return false;
        },
        onTapCastMenu(){ // 点击【施放技能】
            this.menuState = 2;
        },
        onTapCastMenuBack(){ // 点击【菜单-返回】
            this.menuState = 1;
        },
        onTapSkill(skill){ // 点击【技能】
            if(this.curMoveUnit.vig<=0){
                return;
            }
        },
        onTapShadow(){ // 点击【幕布】
            this.nextStep();
        },
        onTapAction(flag){ // 点击【执行操作】
            let nextStep = _ =>{
                this.menuState = 0;
                this.pageState = 1;
                // this.nextStep();
            }
            if(flag==1){ // 攻击
                nextStep();
            }
            else if(flag==2){ // 技能
                nextStep();
            }
            else if(flag==3){ // 防御
                nextStep();
            }
            else if(flag==4){ // 躲避
                nextStep();
            }
            else if(flag==5){ // 恢复
                nextStep();
            }
            else if(flag==6){ // 话术
                nextStep();
            }
            else if(flag==7){ // 追踪
                nextStep();
            }
            else if(flag==8){ // 撤离
                nextStep();
            }
        },
        onTapCheat(){ // 点击【作弊】按钮

        },
    },
    components:{
        Toast,
        Unit,
        List,
        Bar1,
        Bar2,
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

    /* 战场 */
    .battle-field{
        width: 100%;
        height: 9rem;
        background-color: #131313;
    }
    .team-pan{
        position: absolute;
        left: 0;
        right: 0;
        width: 100%;
        display: flex;
        justify-content: space-around;
        align-items: flex-start;
        flex-wrap: nowrap;
        height: 4rem;
        /* box-shadow: 0 0 .1rem #fff inset; */
    }
    .team-pan-top{
        top: .05rem;
    }
    .team-pan-bottom{
        top: 5rem;
    }

    /*board*/
    .board{

    }
    .board-t-2-1 .cur-move{
        color: #e81313;
    }

</style>

<template>
    <div class="main">
        <div class="top-op-p">
            <a class="btn" @click="onClickSave()">SAVE</a>
            <a class="btn" @click="onClickDelete()">DEL</a>
            <span>卡牌总数：{{game.plates[0].length+game.plates[1].length+game.plates[2].length+game.plates[3].length}}</span>
            <br/>
            <a class="btn" @click="onClickNextRound()">回合结束（{{game.roundCount}},{{game.roundOwner&&game.roundOwner.name}}）</a>
            <br/>
            <div class="tip" @click="tip=''">{{tip}}</div>
        </div>
        <div class="plate-op-p" :class="{'sel-plate-op-p':selPlate&&selPlate.visible}" v-if="selPlate&&selPlate.cellId">
            <a class="btn" @click="onClickFlipPlate()">翻转卡牌</a>
            <a class="btn" @click="onClickRemovePlate()">移除卡牌</a>
            <div class="tip" v-if="selPlate.visible"></div>
        </div>
        <div class="map">
            <div class="row" v-for="(row,index) in game.map">
                <a class="cell btn btn-cell" :class="{'sel-cell':selCellId==cell.id}" v-for="(cell,index) in row" :ref="`cell${cell.id}`" @click="onClickCell(cell)" :style="cell.style">
                    <span class="cell-dot">
                        <span class="id">{{cell.id}}</span>
                        <span class="text">{{['C','B','A','S',][cell.level-1]}}</span>
                    </span>
                </a>
            </div>
        </div>
        <div class="role-panel">
            <div class="role" v-for="(role,index) in game.roles" :style="{'background-color':role.color}">
                <div class="row">
                </div>
            </div>
        </div>
        <a class="btn btn-role-flag" :class="{'sel-flag':selFlag&&(selFlag.id==role.id)}" v-for="(role,index) in game.roles" :style="getFlagStyle(role)" @click="onClickFlag(role)">
            {{role.name[0]}}
        </a>
        <div class="plate-wrap" :class="`plate-wrap-${pRow+1}`" v-for="pRow in [0,1,2,3]">
            <a class="btn btn-plate" :class="`plate-lv-${plate.level} ${(selPlate&&(selPlate.id==plate.id))?'sel-plate':''} ${plate.visible?'plate-on':''}`" v-for="(plate,index) in game.plates[pRow]" :style="getPlateStyle(plate)" @click="onClickPlate(plate)">
                <span class="plate-dot">
                    <span v-if="plate.visible">*{{['C','B','A','S'][plate.level-1]}}*<br/>{{plate.n}}</span>
                    <span v-else></span>
                </span>
            </a>
        </div>
    </div>
</template>

<script>
import List from '../components/List';
import Bar from '../components/Bar';
import { query, r, exptr, shuffle, bulbsort, getParentNode, cloneObj, numFormat, avg, percent, calcDistance, getMatchList, removeFromList, } from '../tools/utils';
import { DEBUG, CONFIG, CACHE, } from '../config/config';

const CACHE_NAME = 'ED2';
const MAP_ROWLEN_LIST = [6,7,8,9,10,11,10,9,8,7,6]; // 行宽列表
const MAP_LEVEL_GAPS = [2,4,5,6]; // 格子等级区间列表
/* {n:'',a:[0,0,0,0,0,0,],d:'',} 速度，智力，洞察，力量，精准，医疗，*/
const PLATE_LIST_C = [ // cost 1 （60张）
    {n:'C-01',a:[1,0,0,0,0,0,],d:'获得【1】个移动步数。'},
    {n:'C-02',a:[1,0,0,0,0,0,],d:'本回合的下一次移动时可以跳跃一格。'},
    {n:'C-03',a:[1,0,0,0,0,0,],d:'本回合的下一次任何攻击造成的伤害【+1】。'},
    {n:'C-04',a:[1,0,0,0,0,0,],d:''},
    {n:'C-05',a:[1,0,0,0,0,0,],d:''},
    {n:'C-06',a:[1,0,0,0,0,0,],d:''},
    {n:'C-07',a:[1,0,0,0,0,0,],d:''},
    {n:'C-08',a:[1,0,0,0,0,0,],d:''},
    {n:'C-09',a:[1,0,0,0,0,0,],d:''},
    {n:'C-10',a:[1,0,0,0,0,0,],d:''},
        {n:'C-11',a:[0,1,0,0,0,0,],d:''},
        {n:'C-12',a:[0,1,0,0,0,0,],d:''},
        {n:'C-13',a:[0,1,0,0,0,0,],d:''},
        {n:'C-14',a:[0,1,0,0,0,0,],d:''},
        {n:'C-15',a:[0,1,0,0,0,0,],d:''},
        {n:'C-16',a:[0,1,0,0,0,0,],d:''},
        {n:'C-17',a:[0,1,0,0,0,0,],d:''},
        {n:'C-18',a:[0,1,0,0,0,0,],d:''},
        {n:'C-19',a:[0,1,0,0,0,0,],d:''},
        {n:'C-20',a:[0,1,0,0,0,0,],d:''},
    {n:'C-21',a:[0,0,1,0,0,0,],d:''},
    {n:'C-22',a:[0,0,1,0,0,0,],d:''},
    {n:'C-23',a:[0,0,1,0,0,0,],d:''},
    {n:'C-24',a:[0,0,1,0,0,0,],d:''},
    {n:'C-25',a:[0,0,1,0,0,0,],d:''},
    {n:'C-26',a:[0,0,1,0,0,0,],d:''},
    {n:'C-27',a:[0,0,1,0,0,0,],d:''},
    {n:'C-28',a:[0,0,1,0,0,0,],d:''},
    {n:'C-29',a:[0,0,1,0,0,0,],d:''},
    {n:'C-30',a:[0,0,1,0,0,0,],d:''},
        {n:'C-31',a:[0,0,0,1,0,0,],d:''},
        {n:'C-32',a:[0,0,0,1,0,0,],d:''},
        {n:'C-33',a:[0,0,0,1,0,0,],d:''},
        {n:'C-34',a:[0,0,0,1,0,0,],d:''},
        {n:'C-35',a:[0,0,0,1,0,0,],d:''},
        {n:'C-36',a:[0,0,0,1,0,0,],d:''},
        {n:'C-37',a:[0,0,0,1,0,0,],d:''},
        {n:'C-38',a:[0,0,0,1,0,0,],d:''},
        {n:'C-39',a:[0,0,0,1,0,0,],d:''},
        {n:'C-40',a:[0,0,0,1,0,0,],d:''},
    {n:'C-41',a:[0,0,0,0,1,0,],d:''},
    {n:'C-42',a:[0,0,0,0,1,0,],d:''},
    {n:'C-43',a:[0,0,0,0,1,0,],d:''},
    {n:'C-44',a:[0,0,0,0,1,0,],d:''},
    {n:'C-45',a:[0,0,0,0,1,0,],d:''},
    {n:'C-46',a:[0,0,0,0,1,0,],d:''},
    {n:'C-47',a:[0,0,0,0,1,0,],d:''},
    {n:'C-48',a:[0,0,0,0,1,0,],d:''},
    {n:'C-49',a:[0,0,0,0,1,0,],d:''},
    {n:'C-50',a:[0,0,0,0,1,0,],d:''},
        {n:'C-51',a:[0,0,0,0,0,1,],d:''},
        {n:'C-52',a:[0,0,0,0,0,1,],d:''},
        {n:'C-53',a:[0,0,0,0,0,1,],d:''},
        {n:'C-54',a:[0,0,0,0,0,1,],d:''},
        {n:'C-55',a:[0,0,0,0,0,1,],d:''},
        {n:'C-56',a:[0,0,0,0,0,1,],d:''},
        {n:'C-57',a:[0,0,0,0,0,1,],d:''},
        {n:'C-58',a:[0,0,0,0,0,1,],d:''},
        {n:'C-59',a:[0,0,0,0,0,1,],d:''},
        {n:'C-60',a:[0,0,0,0,0,1,],d:''},
];
const PLATE_LIST_B = [ // cost 2-3 （36张）
    {n:'B-01',a:[1,2,0,0,0,0,],d:''},
    {n:'B-02',a:[1,0,2,0,0,0,],d:''},
    {n:'B-03',a:[1,0,0,0,0,2,],d:''},
    {n:'B-04',a:[1,1,0,0,0,0,],d:''},
    {n:'B-05',a:[1,0,1,0,0,0,],d:''},
    {n:'B-06',a:[1,0,0,0,0,1,],d:''},
        {n:'B-07',a:[0,3,0,0,0,0,],d:''},
        {n:'B-08',a:[0,2,0,0,1,0,],d:''},
        {n:'B-09',a:[0,1,1,1,0,0,],d:''},
        {n:'B-10',a:[0,1,0,0,0,1,],d:''},
        {n:'B-11',a:[0,1,0,1,0,0,],d:''},
        {n:'B-12',a:[0,1,0,0,1,0,],d:''},
    {n:'B-13',a:[0,0,3,0,0,0,],d:''},
    {n:'B-14',a:[0,1,2,0,0,0,],d:''},
    {n:'B-15',a:[1,0,1,1,0,0,],d:''},
    {n:'B-16',a:[0,0,1,1,0,0,],d:''},
    {n:'B-17',a:[0,1,1,0,0,0,],d:''},
    {n:'B-18',a:[0,0,1,0,1,0,],d:''},
        {n:'B-19',a:[0,0,0,3,0,0,],d:''},
        {n:'B-20',a:[0,0,1,2,0,0,],d:''},
        {n:'B-21',a:[0,0,0,2,0,1,],d:''},
        {n:'B-22',a:[0,0,0,2,0,0,],d:''},
        {n:'B-23',a:[1,0,0,1,0,0,],d:''},
        {n:'B-24',a:[0,0,0,1,0,1,],d:''},
    {n:'B-25',a:[0,0,0,0,3,0,],d:''},
    {n:'B-26',a:[0,0,0,0,3,0,],d:''},
    {n:'B-27',a:[0,0,0,0,2,1,],d:''},
    {n:'B-28',a:[0,0,0,0,2,0,],d:''},
    {n:'B-29',a:[0,0,0,0,1,1,],d:''},
    {n:'B-30',a:[1,0,0,0,1,0,],d:''},
        {n:'B-31',a:[0,0,0,0,0,3,],d:''},
        {n:'B-32',a:[1,0,0,0,0,2,],d:''},
        {n:'B-33',a:[0,1,0,0,1,1,],d:''},
        {n:'B-34',a:[0,0,0,0,0,2,],d:''},
        {n:'B-35',a:[0,0,1,0,0,1,],d:''},
        {n:'B-36',a:[0,0,0,0,0,2,],d:''},
];
const PLATE_LIST_A = [ // cost 4-6 （36张）
    {n:'A-01',a:[2,2,2,0,0,0,],d:''},
    {n:'A-02',a:[2,4,0,0,0,0,],d:''},
    {n:'A-03',a:[2,1,2,0,0,0,],d:''},
    {n:'A-04',a:[1,0,4,0,0,0,],d:''},
    {n:'A-05',a:[2,1,0,1,0,0,],d:''},
    {n:'A-06',a:[2,0,0,0,1,1,],d:''},
        {n:'A-07',a:[0,3,3,0,0,0,],d:''},
        {n:'A-08',a:[0,2,0,0,0,4,],d:''},
        {n:'A-09',a:[0,4,1,0,0,0,],d:''},
        {n:'A-10',a:[0,2,2,0,1,0,],d:''},
        {n:'A-11',a:[0,2,0,2,0,0,],d:''},
        {n:'A-12',a:[1,2,0,0,0,1,],d:''},
    {n:'A-13',a:[0,0,4,0,2,0,],d:''},
    {n:'A-14',a:[1,1,2,0,0,2,],d:''},
    {n:'A-15',a:[0,2,2,0,1,0,],d:''},
    {n:'A-16',a:[0,0,2,2,0,1,],d:''},
    {n:'A-17',a:[1,0,2,0,1,0,],d:''},
    {n:'A-18',a:[0,0,4,0,0,0,],d:''},
        {n:'A-19',a:[1,0,0,3,0,2,],d:''},
        {n:'A-20',a:[0,1,2,3,0,0,],d:''},
        {n:'A-21',a:[0,1,0,4,0,0,],d:''},
        {n:'A-22',a:[0,0,1,4,0,0,],d:''},
        {n:'A-23',a:[0,0,0,2,0,2,],d:''},
        {n:'A-24',a:[0,1,1,2,0,0,],d:''},
    {n:'A-25',a:[0,0,2,0,4,0,],d:''},
    {n:'A-26',a:[0,2,0,0,4,0,],d:''},
    {n:'A-27',a:[1,0,0,0,3,1,],d:''},
    {n:'A-28',a:[0,1,0,0,2,2,],d:''},
    {n:'A-29',a:[0,0,0,0,2,2,],d:''},
    {n:'A-30',a:[1,0,1,0,2,0,],d:''},
        {n:'A-31',a:[0,0,4,0,0,2,],d:''},
        {n:'A-32',a:[0,2,2,0,0,2,],d:''},
        {n:'A-33',a:[1,0,2,0,0,2,],d:''},
        {n:'A-34',a:[1,2,0,0,0,2,],d:''},
        {n:'A-35',a:[0,0,0,0,0,4,],d:''},
        {n:'A-36',a:[0,0,2,0,0,2,],d:''},
];
const PLATE_LIST_S = [ // cost 10 （10张）
    {n:'',a:[3,3,3,0,0,1,],d:''},
    {n:'',a:[2,4,2,0,1,1,],d:''},
    {n:'',a:[1,4,4,1,0,0,],d:''},
    {n:'',a:[0,3,2,5,0,0,],d:''},
    {n:'',a:[1,1,2,0,5,1,],d:''},
    {n:'',a:[2,1,1,1,0,5,],d:''},
    {n:'',a:[3,2,2,2,0,1,],d:''},
    {n:'',a:[2,3,0,3,0,2,],d:''},
    {n:'',a:[1,2,3,3,0,1,],d:''},
    {n:'',a:[0,2,2,6,0,0,],d:''},
    {n:'',a:[0,0,1,0,6,3,],d:''},
    {n:'',a:[0,1,3,0,0,6,],d:''},
];
const PLATE_EVENT_LIST_C = [ // （30张）
    {c:2,d:`获得【2】次临时移动，本回合内有效。`},
    {c:3,d:`恢复【5】生命。`},
    {c:3,d:`获得【1】魔法。`},
    {c:8,d:`攻击地图上除自己外的所有角色，攻击力为【1】。`},
    {c:8,d:`攻击地图上除自己外的随机一名角色，攻击力为【3】。`},
    {c:6,d:`单独翻看地图上任意【3】个未知卡牌。`},
]
const PLATE_EVENT_LIST_B = [ // (30张)
    {c:3,d:`获得【速度】次临时移动，本回合内有效。`},
    {c:3,d:`恢复【医疗x5】生命。`},
    {c:3,d:`获得【智力/2】魔法。`},
    {c:9,d:`攻击地图上除自己外的所有角色，攻击力为【精准】。`},
    {c:9,d:`攻击地图上除自己外的随机一名角色，攻击力为【精准+3】。`},
    {c:3,d:`收走并翻看地图上任意【洞察】个未知卡牌,然后全部摆放回地图上的任意空白地块。`},
]
const ROLE_LIST = [
    {name: 'Ally',color: '#DC143C',},
    {name: 'Bob',color: '#6495ED',},
    {name: 'Clare',color: '#D2691E',},
    {name: 'Douglas',color: '#228B22',},
    {name: 'Eva',color: '#8B008B',},
    {name: 'Frank',color: '#778899',},
];

export default {
    name: 'Home',
    data(){
        return {
            loading: false,

            game: {
                map: [],
                roles: [],
                plates: [[],[],[],[]], // C,B,A,S
                roundCount: 0, // 回合总数
                roundOwner: null, // 回合角色
            },

            selPlate: null, // 当前选中的卡牌
            selFlag: null, // 当前选中的棋子
            selCellId: 0, // 当前选中的格子ID

            tip: '',

            CONFIG,
            DEBUG,
        };

    },
    mounted(){
        let cache = localStorage.getItem(CACHE_NAME);
        if(!cache){
            this.init();
        }
        else{
            let storage = JSON.parse(cache);
            this.game = storage;
        }

        // 键盘事件
        document.onkeyup = event =>{
            let e = event||window.event||arguments.callee.caller.arguments[0];
            if(e&&e.keyCode==83){ // 按 S
                this.onKeyupS();
            }
        };

        // @MODIFY
        // for(let i=0;i<44;i++){
        //     let res = this.calcLevelByExp(i);
        //     console.log(`${i}=> ${res.level} (${res.diff})`);
        // }
    },
    methods: {
        init(){
            this.initMap();
        },
        initMap(){ // 生成地图
            let cid = 1;
            let calcCellLevel = tid =>{ // 根据格子ID计算格子等级
                let x,y,acc=0;
                for(let i=0;i<MAP_ROWLEN_LIST.length;i++){
                    if(tid<=MAP_ROWLEN_LIST[i]+acc){
                        y = i;
                        break;
                    }
                    else{
                        acc += MAP_ROWLEN_LIST[i];
                    }
                }
                x = tid-acc-1;
                for(let i=0;i<MAP_LEVEL_GAPS.length;i++){
                    if(
                        x<MAP_LEVEL_GAPS[i] ||
                        (MAP_ROWLEN_LIST[y]-x)<=MAP_LEVEL_GAPS[i] ||
                        y<MAP_LEVEL_GAPS[i] ||
                        (MAP_ROWLEN_LIST.length-y)<=MAP_LEVEL_GAPS[i]
                    ){
                        return i+1;
                    }
                }
                return -1;
            };
            for(let rowLen of MAP_ROWLEN_LIST){
                let row = [];
                for(let i=0;i<rowLen;i++){
                    let newCell;
                    newCell = {
                        id: cid,
                        text: '',
                        level: calcCellLevel(cid),
                        style: {},
                    };
                    row.push(newCell);
                    cid++;
                }
                this.game.map.push(row);
            }

            // 永驻
            // let aCell = this.getCell(45);
            // aCell.text = '巨大生命树';
            // aCell.style = {'background-color':'orange'};

            // 生成角色
            for(let i=0;i<ROLE_LIST.length;i++){
                let newRole;
                newRole = {
                    id: i+1,
                    name: ROLE_LIST[i].name,
                    color: ROLE_LIST[i].color,
                    exp: 0,
                    hp: 0,
                    mp: 0,
                    cellId: 0,
                };
                this.game.roles.push(newRole);
            }

            //生成
            let pid = 1;
            let genPlatesByLevel = (plateList,level) =>{
                let tempPlates = [];
                for(let i=0;i<plateList.length;i++){
                    let newPlate = {
                        id: pid,
                        n: plateList[i].n,
                        a: plateList[i].a,
                        d: plateList[i].d,
                        level,
                        cellId: 0,
                        type: 1, // 类型[1:装备|2:事件]
                        visible: false,
                        roleId: 0, // 被角色ID所持有
                        cached: false, // 是否被暂存
                    }
                    tempPlates.push(newPlate);
                    pid++;
                }
                if(level==1||level==2){ // C级或B级，填充事件卡牌
                    let tlist = level==1?PLATE_EVENT_LIST_C:PLATE_EVENT_LIST_B;
                    for(let i1=0;i1<tlist.length;i1++){
                        for(let i2=0;i2<tlist[i1].c;i2++){
                            let newPlate = {
                                id: pid,
                                n: `事件`,
                                a: [0,0,0,0,0,0,],
                                d: tlist[i1].d,
                                level,
                                cellId: 0,
                                type: 2, // 类型[1:装备|2:事件]
                                visible: false,
                                roleId: 0, // 被角色ID所持有
                                cached: false, // 是否被暂存
                            }
                            tempPlates.push(newPlate);
                            pid++;
                        }
                    }
                }
                this.game.plates[level-1] = shuffle(tempPlates);
            }
            genPlatesByLevel(PLATE_LIST_C,1);
            genPlatesByLevel(PLATE_LIST_B,2);
            genPlatesByLevel(PLATE_LIST_A,3);
            genPlatesByLevel(PLATE_LIST_S,4);

            // 回合信息
            this.game.roundCount = 1;
            this.game.roundOwner = this.game.roles[0];

            // 生成格子坐标
            this.$nextTick(_=>{
                for(let row of this.game.map){
                    for(let cell of row){
                        let domCell = this.$refs[`cell${cell.id}`][0];
                        cell.pos = {
                            x: domCell.offsetLeft,
                            y: domCell.offsetTop,
                        }
                    }
                }
                this.fillPlates();
            });
        },
        onKeyupS(){ // 键盘【S】
            this.onClickSave();
        },
        getCell(id){ // 根据ID获取cell
            for(let row of this.game.map){
                for(let cell of row){
                    if(cell.id==id){
                        return cell;
                    }
                }
            }
        },
        getFlagStyle(role){ // 根据角色数据获取style
            let res = {
                'background-color': role.color,
                'left': `${720+role.id*20}px`,
                'top': `${60}px`,
            }
            let cellId = role.cellId;
            if(cellId){
                let pos = this.getCell(cellId).pos;
                res.left = `${pos.x+26}px`;
                res.top = `${pos.y+15}px`;
            }
            return res;
        },
        getPlateStyle(plate){ // 根据卡牌数据获取style
            let res = {
                'left': `${850+plate.id*1}px`,
                'top': `${640}px`,
            }
            let cellId = plate.cellId;
            if(cellId){
                let pos = this.getCell(cellId).pos;
                res.left = `${pos.x+5}px`;
                res.top = `${pos.y+5}px`;
            }
            return res;
        },
        getPlateByCell(cell){ // 获取格子上的卡牌
            return getMatchList(this.game.plates,[['cellId',cell.id]])[0];
        },
        getFlagByCell(cell){ // 获取格子上的棋子
            return getMatchList(this.game.roles,[['cellId',cell.id]])[0];
        },
        clearIndicators(){ // 清除全部临时标记
            this.selPlate = null;
            this.selFlag = null;
            this.selCellId = 0;
            this.tip = '';
        },
        fillPlates(){ // 填充卡牌
            let drawAPlate = cell =>{ // 随机抽一个卡牌放置于格子上
                let unsetPlates = getMatchList(this.game.plates[cell.level-1],[['cellId',0],['roleId',0]]);
                let randomPlate = unsetPlates[r(0,unsetPlates.length-1)];
                randomPlate.cellId = cell.id;
                randomPlate.visible = false;
            }
            for(let row of this.game.map){
                for(let cell of row){
                    let plate = this.getPlateByCell(cell);
                    let flag = this.getFlagByCell(cell);
                    if(!flag&&!plate){ // 如果格子上没有棋子，并且没有卡牌
                        drawAPlate(cell);
                    }
                }
            }
            this.tip = '卡牌已填充';
        },

        onClickSave(){ // 点击【保存】
            this.clearIndicators();
            let storage = JSON.stringify(this.game);
            localStorage.setItem(CACHE_NAME,storage);
            this.tip = '已保存';
        },
        onClickDelete(){ // 点击【删除】
            this.clearIndicators();
            let storage = JSON.stringify(this.game);
            localStorage.removeItem(CACHE_NAME);
            this.tip = '存档已删除';
        },
        onClickNextRound(){ // 点击【下一回合】
            this.clearIndicators();
            this.fillPlates();
            this.game.roundCount += 1;
            let roundRoleId = this.game.roundOwner&&this.game.roundOwner.id;
            if(roundRoleId<this.game.roles.length-1){
                this.game.roundOwner = this.game.roles[this.game.roundOwner.id+1];
            }
            else{
                this.game.roundOwner = this.game.roles[0];
            }
        },
        onClickRedoPlates(){ // 点击【上一步】
            this.clearIndicators();
        },

        onClickCell(cell){ // 点击【格子】
            this.selCellId = cell.id;
            if(this.selFlag){ // 移动棋子
                let role = getMatchList(this.game.roles,[['id',this.selFlag.id]])[0];
                role.cellId = cell.id;
                this.selFlag = null;
            }
        },
        onClickFlag(role){ // 点击【棋子】
            this.selPlate = null;
            this.tip = '';
            this.selCellId = 0;
            if(!this.selFlag||(this.selFlag&&(this.selFlag.id!=role.id))){
                this.selFlag = role;
            }
            else{
                this.selFlag = null;
            }
        },
        onClickRemoveFlag(role){ // 点击【退场】
            let oRole = getMatchList(this.game.roles,[['id',role.id]])[0];
            let cl = this.calcLevelByExp(oRole.exp);
            let level = cl.level;
            this.onClickUnequip(oRole,0);
            this.onClickUnequip(oRole,1);
            oRole.cellId = 0;
            oRole.talents = [1,1,1,1,1,1,1,];
            oRole.hp = Math.round(level*5);
            oRole.bullet = 0;
            oRole.arrow = 0;
            oRole.itemList = '';
            for(let i=0;i<level;i++){
                oRole.talents[r(0,5)] += 1;
            }
        },

        onClickPlate(plate){ // 点击【卡牌】
            if(!this.selPlate||(this.selPlate&&this.selPlate.id!=plate.id)){
                this.selPlate = plate;
                if(plate.cellId){
                    let cell = this.getCell(plate.cellId);
                    this.onClickCell(cell);
                }
            }
            else{
                this.selPlate = null;
            }
        },
        onClickFlipPlate(){ // 点击【翻转卡牌】
            if(this.selPlate){
                let oPlate = getMatchList(this.game.plates[this.selPlate.level-1],[['id',this.selPlate.id]])[0];
                oPlate.visible = !oPlate.visible;
            }
        },
        onClickRemovePlate(){ // 点击【移除卡牌】
            if(this.selPlate){
                let oPlate = getMatchList(this.game.plates[this.selPlate.level-1],[['id',this.selPlate.id]])[0];
                oPlate.cellId = 0;
                oPlate.visible = false;
            }
        },
    },
    components:{
        List,
        Bar,
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    @import '../style/home3.css';
</style>

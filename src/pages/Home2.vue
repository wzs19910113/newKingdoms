<template>
    <div class="main">
        <div class="top-op-p">
            <a class="btn" @click="onClickSave()">SAVE</a>
            <a class="btn" @click="onClickDelete()">DEL</a>
            <span>地块总数：{{game.plates.length}}</span>
            <br/>
            <a class="btn" @click="onClickNextRound()">回合结束（{{game.roundCount}},{{game.roundOwner&&game.roundOwner.name}}）</a>
            <a class="btn" @click="onClickGetRandomItem()">随机物资</a>
            <br/>
            <div class="tip" @click="tip=''">{{tip}}</div>
        </div>
        <div class="plate-op-p" :class="{'sel-plate-op-p':selPlate&&selPlate.visible}" v-if="selPlate&&selPlate.cellId>-1">
            <a class="btn" @click="onClickFlipPlate()">翻转地块</a>
            <a class="btn" @click="onClickRemovePlate()">移除地块</a>
            <div class="tip" v-if="selPlate.visible">*{{['永驻','常驻','物资','事件'][selPlate.type]}}*{{selPlate.name}}：<br/>{{selPlate.desc}}</div>
        </div>
        <div class="map">
            <div class="row" v-for="(row,index) in game.map">
                <a class="cell btn btn-cell" :class="{'sel-cell':selCellId==cell.id}" v-for="(cell,index) in row" :ref="`cell${cell.id}`" @click="onClickCell(cell)" :style="cell.style">
                    <span class="cell-dot">
                        <span class="id">{{cell.id}}</span>
                        <span class="text">{{cell.text}}</span>
                    </span>
                </a>
            </div>
        </div>
        <div class="role-panel">
            <div class="role" v-for="(role,index) in game.roles" :style="{'background-color':role.color}">
                <div class="row name">{{role.name}} [L{{calcLevelByExp(role.exp).level}}]（<input type="number" v-model="role.exp"/>，差{{calcLevelByExp(role.exp).diff}}升级）</div>
                <div class="row talents">
                    <span>体<input type="number" v-model="role.talents[0]"/></span>
                    <span>力<input type="number" v-model="role.talents[1]"/></span>
                    <span>准<input type="number" v-model="role.talents[2]"/></span>
                    <span>悟<input type="number" v-model="role.talents[3]"/></span>
                    <br/>
                    <span>察<input type="number" v-model="role.talents[4]"/></span>
                    <span>医<input type="number" v-model="role.talents[5]"/></span>
                    <span>物<input type="number" v-model="role.talents[6]"/></span>
                </div>
                <div class="row row-hp">
                    <span>血<input type="number" v-model="role.hp"/></span>
                    <span>弹<input type="number" v-model="role.bullet"/></span>
                    <span>矢<input type="number" v-model="role.arrow"/></span>
                </div>
                <div class="row">
                    <textarea v-model="role.itemList" placeholder="物品"></textarea>
                </div>
                <div class="row">
                    <textarea class="weapon-1" v-model="role.weaponList[0].desc" placeholder="武器1"></textarea>
                    <textarea class="weapon-2" v-model="role.weaponList[1].desc" placeholder="武器2"></textarea>
                </div>
                <div class="row">
                    <a class="btn" @click="onClickRemoveFlag(role)">退场</a>
                    <a class="btn" @click="onClickEquip(role)" v-if="selPlate&&selPlate.visible&&(role.weaponList[0].id<0||role.weaponList[1].id<0)">装备</a>
                    <a class="btn" @click="onClickUnequip(role,0)" v-if="role.weaponList[0].id!=-1">卸下1</a>
                    <a class="btn" @click="onClickUnequip(role,1)" v-if="role.weaponList[1].id!=-1">卸下2</a>
                    <!-- <a class="btn" @click="onClickPushToStock(role)" v-if="role.weaponId>-1">存</a>
                    <a class="btn" @click="onClickStock(role)">库</a> -->
                </div>
            </div>
        </div>
        <a class="btn btn-role-flag" :class="{'sel-flag':selFlag&&(selFlag.id==role.id)}" v-for="(role,index) in game.roles" :style="getFlagStyle(role)" @click="onClickFlag(role)">
            {{role.name[0]}}
        </a>
        <a class="btn btn-plate" :class="{'sel-plate':selPlate&&(selPlate.id==plate.id),'plate-on':plate.visible,'plate-fixed':(plate.type==1&&plate.visible)}" v-for="(plate,index) in game.plates" :style="getPlateStyle(plate)" @click="onClickPlate(plate)">
            <span class="plate-dot">
                <span v-if="plate.visible">*{{['永驻','常驻','物资','事件'][plate.type]}}*<br/>{{plate.name}}</span>
                <span v-else></span>
                <!-- <span>*{{['永驻','常驻','物资','事件'][plate.type]}}*<br/>{{plate.name}}</span> -->
            </span>
        </a>
        <!-- <div class="stock-pop" v-if="stockPopList.length>0">
            <div class="shadow-cover" @click="onClickCloseStockPop()"></div>
            <div class="pop-main">
                <div class="stock-weapon" v-for="(weapon,index) in stockPopList">
                    {{weapon.name}}：
                    <br/>
                    {{weapon.desc}}
                    <br/>
                    <a class="btn" @click="onClickEquipStockWeapon(weapon)" v-if="stockPopRole&&stockPopRole.weaponId==-1">装备</a>
                    <a class="btn" @click="onClickRemoveStockWeapon(weapon)">移除</a>
                </div>
            </div>
        </div> -->
    </div>
</template>

<script>
import List from '../components/List';
import Bar from '../components/Bar';
import { query, r, exptr, shuffle, bulbsort, getParentNode, cloneObj, numFormat, avg, percent, calcDistance, getMatchList, removeFromList, } from '../tools/utils';
import { DEBUG, CONFIG, CACHE, } from '../config/config';

const CACHE_NAME = 'ED2';
const MAP_ROWLEN_LIST = [3,4,5,6,7,6,7,6,7,6,5,4,3,]; // 行宽列表
const PLATE_LIST = [
    {name: '巨大生命树', type: 1, count: 1, desc: '在角色的回合结束时，若其位于生命树，或与生命树相邻，则恢复【医术】点生命值（可叠加）；位于生命树的角色可重新分配天赋（每回合只能重新分配一次）。'},
    {name: '传送阵', type: 1, count: 1, desc: '到达传送阵的角色可立即选择并移动（无消耗地）至另一个传送阵；一回合内只能传送一次。'},
    {name: '瞭望塔', type: 1, count: 5, desc: '位于瞭望塔的角色可消耗1个@单独探测全图任意【洞察x2】个未知地块；位于瞭望塔的角色进行【子弹】、【箭矢】攻击时伤害翻倍。'},
    {name: '烟雾', type: 1, count: 3, desc: '位于烟雾的角色无法成为【子弹】和【箭矢】的目标。'},
    {name: '固定炮台', type: 1, count: 10, desc: '位于固定炮台的角色可消耗1@和1枚柯伯伊导弹，选择任意一个格子进行【轰炸攻击】。'},

    {name: '子弹箱', type: 2, count: 7 , desc: '获得【物资】发子弹。'},
    {name: '箭矢箱', type: 2, count: 7 , desc: '获得【物资】枚箭矢。'},
    {name: '柯伯伊导弹', type: 2, count: 5 , desc: '获得1枚柯伯伊导弹。'},
    {name: '医疗箱', type: 2, count: 5 , desc: '获得【物资】个恢复配方或肾上腺素（自由分配）。'},
    {name: '设备箱', type: 2, count: 5 , desc: '获得【物资】个传送器或喷气背包（自由分配）。'},
    {name: '炸药箱', type: 2, count: 5 , desc: '获得【物资】个定向炸弹。'},

    {name: '收割者', type: 2, count: 1, desc: '技能：消耗2@获得一层【精准】。破坏技：消耗1@和1子弹，获得共计【精准+10】伤害，自由分配至全图最多3个目标。被动：精准比你低的角色使用【子弹】或【箭矢】攻击你时需骰子判定，若结果小于【双方精准差】则攻击无效。'},
    {name: '六十四倍镜', type: 2, count: 1, desc: '技能：消耗1@探测全图任意【洞察x2】个未知地块。破坏技：消耗1@和1子弹，对全图单目标造成【精准+12】伤害。被动：精准比你低的角色使用【子弹】或【箭矢】攻击你时需掷骰判定，若结果小于双方精准差值则攻击无效。'},
    {name: '小丑派对', type: 2, count: 1, desc: '技能：消耗1@和2子弹对全图任意2个目标造成【精准+6】伤害。破坏技：消耗1@和1子弹，对全图单目标造成【医术+12】伤害。被动：【洞察】的计算额外+1。'},
    {name: '春田', type: 2, count: 1, desc: '技能：消耗1@恢复【医术+3】生命值。破坏技：获得1点经验值。被动：【物资】的计算额外+1。'},
    {name: '三连发', type: 2, count: 1, desc: '技能：消耗1@和3子弹，对全图单目标造成【精准+20】伤害。破坏技：获得2枚柯伯伊导弹。'},
    {name: '噪音火舌', type: 2, count: 1, desc: '技能：消耗2@摧毁任一常驻地块。破坏技：消耗1@，令你本回合的下一次攻击造成的伤害翻倍。被动：每当你受到伤害，若存活则可立即恢复【医术】生命值。'},

    {name: '弓之脉细', type: 2, count: 1, desc: '技能：消耗1@和一层【悟性】，获得两层【悟性】以外的任意天赋（自由分配）。破坏技：消耗1@和1箭矢，对全图单目标造成【洞察x4】伤害。被动：你可把子弹当作箭矢使用，也可把箭矢当子弹用。'},
    {name: '无赖双弦', type: 2, count: 1, desc: '技能：消耗2@，立即获得【物资】个随机道具（不包括柯伯伊导弹）。破坏技：免除一次死亡，并恢复生命值至【医术】。被动：受到近战攻击的伤害时你可以立即选择并移动至一个传送阵。'},
    {name: '反曲滑轮', type: 2, count: 1, desc: '技能：消耗1@和2箭矢，对一条直线方向上的所有目标造成【精准x4】伤害。破坏技：消耗1@和1箭矢，对全图单目标造成【精准x5】伤害。被动：每次受到伤害，你获得一层【精准】。'},
    {name: '以太弓', type: 2, count: 1, desc: '技能：消耗1@进行一次跳跃移动。破坏技：消耗1@，将生命值设置为30。'},
    {name: '善人弓', type: 2, count: 1, desc: '技能：消耗1@和1箭矢，对全图单目标造成【医术x3】伤害。破坏技：消耗1@和1箭矢，对全图所有【悟性】低于你的角色造成【精准x4】伤害。被动：【悟性】的计算额外+1。'},
    {name: '龙华', type: 2, count: 1, desc: '技能：丢弃两个道具，获得1@（每回合只能使用一次）。破坏技：消耗1@和1箭矢，骰子判定，对全图单目标造成【判定结果x6】伤害。被动：每击杀一个角色获得一层【精准】（破坏技亦会触发）。'},

    {name: '沉剑', type: 2, count: 1, desc: '技能：消耗2@获得一层【力量】。破坏技：消耗1@对一个邻格目标造成【力量+12】伤害。被动：每击杀一个角色获得1@（破坏技亦会触发）。'},
    {name: '柯伯伊剑', type: 2, count: 1, desc: '技能：消耗2@获得一枚柯伯伊导弹。破坏技：立即获得一层【体能】和一层【洞察】。被动：【医术】的计算额外+1。'},
    {name: '施暴者', type: 2, count: 1, desc: '技能：失去一层任一天赋，获得1@（每回合只能使用一次）。破坏技：消耗1@，对一邻格【力量】低于你的目标造成【双方力量差x10】伤害。被动：使用【肾上腺素】可额外获得1@。'},
    {name: '双刃剑', type: 2, count: 1, desc: '技能：消耗1@和3点生命值，对一个邻格目标造成【力量x4】伤害。破坏技：消耗1@对自己和一个邻格目标同时造成【力量x5】伤害。被动：遇到事件时必须骰子判定，若结果>3，则该事件触发两次。'},
    {name: '烟熏之刃', type: 2, count: 1, desc: '技能：消耗1@，摧毁一个邻格的常驻地块。破坏技：消耗1@，掠夺全图每个存活角色一层任意天赋。'},
    {name: '妙手', type: 2, count: 1, desc: '技能：丢弃一个道具，获得【医术】点生命值。破坏技：消耗1@对一个邻格目标造成【体能x4】伤害。被动：每对一个角色造成伤害，可立即掠夺其一个道具（破坏技亦会触发）。'},

    {name: '核能锁链', type: 2, count: 1, desc: '技能：消耗1@探测全图任意【洞察+2】个未知地块。破坏技：消耗3@对距离2格范围内的所有角色造成【力量x4】伤害，并摧毁范围内所有常驻地块。被动：每回合结束时对所有邻格角色造成【力量】伤害。'},
    {name: '薪油鞭', type: 2, count: 1, desc: '技能：消耗2@令邻格所有角色失去一层【精准】。破坏技：消耗2@对所有邻格角色造成【力量x4】伤害。被动：每对一个角色造成伤害，可立即恢复【医术】点生命值（破坏技亦会触发）。'},
    {name: '弹簧', type: 2, count: 1, desc: '技能：消耗2@获得【物资】个【子弹】或【箭矢】。破坏技：消耗2@，选择并跳跃至全图任一格子（无视并移除格子上的地块），随后对所有邻格角色造成【力量x3】伤害。被动：【体能】的计算额外+1。'},
    {name: '大龙牙', type: 2, count: 1, desc: '技能：丢弃2个道具，获得1@（每回合只能使用一次）。破坏技：消耗1@，获得共计【力量x4】伤害，自由分配至邻格角色。被动：击杀【等级】高于你的角色获得的经验值额外+2（破坏技亦会触发）。'},
    {name: '荆棘软鞭', type: 2, count: 1, desc: '技能：与一个相邻角色交换位置。破坏技：消耗N@，进行N次移动，每次移动后对邻格所有角色造成【力量X3】伤害。被动：你受到的【子弹】和【箭矢】伤害永久减免2点。'},
    {name: '破坏长藤', type: 2, count: 1, desc: '技能：消耗1@，对邻格所有角色和自己造成【力量x4】伤害。破坏技：消耗1@，对一个邻格【等级】高于你的角色造成【双方等级差x10】伤害。被动：你的【普通近战攻击】攻击范围+1。'},

    {name: '融合T发射器', type: 2, count: 1, desc: '技能：将3发【子弹】融合成一个柯伯伊导弹。'},
    {name: '融合K发射器', type: 2, count: 1, desc: '技能：将3发【箭矢】融合成一个柯伯伊导弹。'},
    {name: '载体Z发射器', type: 2, count: 1, desc: '被动：装备此武器的时候可立即获得1枚柯伯伊导弹。'},
    {name: '载体M发射器', type: 2, count: 1, desc: '被动：在导弹箱中获得的柯伯伊导弹数量+1。'},
    {name: '推进式发射器', type: 2, count: 1, desc: '被动：每次轰炸攻击后可立即移动至轰炸范围的任一格子中。'},
    {name: '灭绝者发射器', type: 2, count: 1, desc: '被动：轰炸造成的伤害+5。'},

    {name: '愚人陷阱', type: 3, count: 2, desc: '丢弃一个道具，并恢复5点生命值（若无道具则不触发）。'},
    {name: '危机意识', type: 3, count: 2, desc: '失去3点生命值，若存活则获得2@。'},
    {name: '野兽本能', type: 3, count: 2, desc: '失去一层【悟性】，获得2@（【悟性】为1则不触发）。'},
    {name: '火力不足', type: 3, count: 2, desc: '失去3点生命值，若存活则获得一枚子弹或箭矢。'},
    {name: '未知恐惧', type: 3, count: 2, desc: '失去1@，获得一个随机道具（若无@则不触发）。'},
    {name: '训练上头', type: 3, count: 10, desc: '获得【悟性】层【力量】或【体能】（自由分配）。'},
    {name: '敏锐强化', type: 3, count: 10, desc: '获得【悟性】层【精准】或【洞察】（自由分配）。'},
    {name: '野外生存经验', type: 3, count: 10, desc: '获得【悟性】层【物资】或【医术】（自由分配）。'},
];
const ROLE_LIST = [{
    name: 'Ally',
    color: '#DC143C',
},{
    name: 'Bob',
    color: '#6495ED',
},{
    name: 'Clare',
    color: '#D2691E',
},{
    name: 'Douglas',
    color: '#228B22',
},{
    name: 'Eva',
    color: '#8B008B',
},{
    name: 'Frank',
    color: '#778899',
},];
const EXP_PHASE_LIST = [1,2,3,4,5,6,7,8,9,10]; // 经验阶梯

export default {
    name: 'Home',
    data(){
        return {
            loading: false,

            game: {
                map: [],
                roles: [],
                plates: [],
                roundCount: 0, // 回合总数
                roundOwner: null, // 回合角色
            },

            selPlate: null, // 当前选中的地块
            selFlag: null, // 当前选中的棋子
            selCellId: -1, // 当前选中的格子ID

            stockPopList: [], // 库存弹窗数据
            stockPopRole: null, // 库存弹窗选中的角色

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
            let idIndex = 0;
            for(let rowLen of MAP_ROWLEN_LIST){
                let row = [];
                for(let i=0;i<rowLen;i++){
                    let newCell;
                    newCell = {
                        id: idIndex,
                        text: '',
                        style: {},
                    };
                    row.push(newCell);
                    idIndex++;
                }
                this.game.map.push(row);
            }

            // 永驻
            let aCell = this.getCell(34);
            let portCell1 = this.getCell(18);
            let portCell2 = this.getCell(50);
            aCell.text = '巨大生命树';
            aCell.style = {'background-color':'orange'};
            portCell1.text = '传送阵';
            portCell1.style = {'background-color':'green'};
            portCell2.text = '传送阵';
            portCell2.style = {'background-color':'green'};

            // 生成角色
            for(let i=0;i<ROLE_LIST.length;i++){
                let newRole;
                newRole = {
                    id: i,
                    name: ROLE_LIST[i].name,
                    color: ROLE_LIST[i].color,
                    exp: 0,
                    talents: [1,1,1,1,1,1,1,],
                    hp: 0,
                    bullet: 0,
                    arrow: 0,
                    itemList: '',
                    weaponList: [{id:-1,desc:''},{id:-1,desc:''},], // 武器列表
                    // weaponId: -1, // 武器对应的地块ID
                    // weapon: '', // 武器描述
                    cellId: -1,
                };
                this.game.roles.push(newRole);
            }

            //生成地块
            let tempPlates = [];
            let id = 0;
            for(let i1=0;i1<PLATE_LIST.length;i1++){
                let row = PLATE_LIST[i1];
                for(let i2=0;i2<row.count;i2++){
                    let newPlate;
                    newPlate = {
                        id,
                        name: row.name,
                        type: row.type,
                        desc: row.desc,
                        cellId: -1,
                        visible: false,
                        belong: -1, // 所属角色ID
                        owner: -1, // 被角色ID永久拥有
                    }
                    tempPlates.push(newPlate);
                    id++;
                }
            }
            this.game.plates = shuffle(tempPlates);

            // 回合信息
            this.game.roundCount = 1;
            this.game.roundOwner = this.game.roles[0];

            // 生成坐标
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
                'left': `${1040+role.id*20}px`,
                'top': `${60}px`,
            }
            let cellId = role.cellId;
            if(cellId>-1){
                let pos = this.getCell(cellId).pos;
                res.left = `${pos.x+35}px`;
                res.top = `${pos.y+25}px`;
            }
            return res;
        },
        getPlateStyle(plate){ // 根据地块数据获取style
            let res = {
                'left': `${950+plate.id*1}px`,
                'top': `${640}px`,
            }
            let cellId = plate.cellId;
            if(cellId>-1){
                let pos = this.getCell(cellId).pos;
                res.left = `${pos.x+5}px`;
                res.top = `${pos.y+5}px`;
            }
            return res;
        },
        getPlateByCell(cell){ // 获取格子上的地块
            return getMatchList(this.game.plates,[['cellId',cell.id]])[0];
        },
        getFlagByCell(cell){ // 获取格子上的棋子
            return getMatchList(this.game.roles,[['cellId',cell.id]])[0];
        },
        clearIndicators(){ // 清除全部临时标记
            this.selPlate = null;
            this.selFlag = null;
            this.selCellId = -1;
            this.tip = '';
        },
        fillPlates(){ // 填充地块
            let drawAPlate = cell =>{ // 随机抽一个地块放置于格子上
                let unsetPlates = getMatchList(this.game.plates,[['cellId',-1],['belong',-1],['owner',-1]]);
                let randomPlate = unsetPlates[r(0,unsetPlates.length-1)];
                randomPlate.cellId = cell.id;
            }
            for(let row of this.game.map){
                for(let cell of row){
                    let plate = this.getPlateByCell(cell);
                    let flag = this.getFlagByCell(cell);
                    if(!flag&&!plate&&cell.id!=18&&cell.id!=34&&cell.id!=50){ // 如果格子上没有棋子，并且没有地块
                        drawAPlate(cell);
                    }
                }
            }
            this.tip = '地块已填充';
        },
        calcLevelByExp(exp){ // 根据经验值计算等级，以及距离下次升级还差多少经验
            let remain = exp;
            for(let i=0;i<EXP_PHASE_LIST.length;i++){
                let diff = EXP_PHASE_LIST[i]-remain;
                if(diff>0){
                    return {level:i+1,diff};
                }
                remain -= EXP_PHASE_LIST[i];
            }
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
        onClickGetRandomItem(){ // 点击【随机物资】
            this.clearIndicators();
            let res = ['子弹','箭矢','配方','肾上腺素','传送器','喷气背包','定向炸弹',][r(0,6)];
            this.tip = res;
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
            this.selCellId = -1;
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
            oRole.cellId = -1;
            oRole.talents = [1,1,1,1,1,1,1,];
            oRole.hp = Math.round(level*5);
            oRole.bullet = 0;
            oRole.arrow = 0;
            oRole.itemList = '';
            for(let i=0;i<level;i++){
                oRole.talents[r(0,5)] += 1;
            }
        },
        onClickEquip(role){ // 点击【装备武器】
            if(this.selPlate&&this.selPlate.visible){
                let oRole = getMatchList(this.game.roles,[['id',role.id]])[0];
                let tIndex = oRole.weaponList[0].id>-1?1:0;
                if(oRole.weaponList[tIndex].id<0){
                    oRole.weaponList[tIndex].desc = `${this.selPlate.name}[${this.selPlate.id}]：${this.selPlate.desc}`;
                    oRole.weaponList[tIndex].id = this.selPlate.id;
                    this.selPlate.belong = oRole.id;
                    this.onClickRemovePlate();
                }
                else{
                    this.tip = `[错误]${oRole.name}已经装备了 2 把武器`;
                }
            }
        },
        onClickUnequip(role,tIndex){ // 点击【卸下武器】
            let oRole = getMatchList(this.game.roles,[['id',role.id]])[0];
            if(oRole.weaponList[tIndex].id>-1){
                let oPlate = getMatchList(this.game.plates,[['id',oRole.weaponList[tIndex].id]])[0];
                oPlate.belong = -1;
                oRole.weaponList[tIndex].id = -1;
                oRole.weaponList[tIndex].desc = '';
            }
        },
        // onClickPushToStock(role){ // 点击【入库】
        //     let oRole = getMatchList(this.game.roles,[['id',role.id]])[0];
        //     if(oRole.weaponId>-1){
        //         let oPlate = getMatchList(this.game.plates,[['id',oRole.weaponId]])[0];
        //         oPlate.owner = oRole.id;
        //     }
        // },
        onClickStock(role){ // 点击【查看库存】
            let stockList = getMatchList(this.game.plates,[['owner',role.id]]);
            this.stockPopList = stockList;
            if(this.stockPopList.length<=0){
                this.tip = '没有库存';
            }
            else{
                this.stockPopRole = role;
            }
        },

        onClickPlate(plate){ // 点击【地块】
            if(!this.selPlate||(this.selPlate&&this.selPlate.id!=plate.id)){
                this.selPlate = plate;
                if(plate.cellId>-1){
                    let cell = this.getCell(plate.cellId);
                    this.onClickCell(cell);
                }
            }
            else{
                this.selPlate = null;
            }
        },
        onClickFlipPlate(){ // 点击【翻转地块】
            if(this.selPlate){
                let oPlate = getMatchList(this.game.plates,[['id',this.selPlate.id]])[0];
                oPlate.visible = !oPlate.visible;
            }
        },
        onClickRemovePlate(){ // 点击【移除地块】
            if(this.selPlate){
                let oPlate = getMatchList(this.game.plates,[['id',this.selPlate.id]])[0];
                oPlate.cellId = -1;
                oPlate.visible = false;
            }
        },
        onClickCloseStockPop(){ // 点击【关闭库存弹窗】
            this.stockPopList = [];
            this.stockPopRole = null;
        },
        // onClickEquipStockWeapon(weapon){ // 点击【装备库存武器】
        //     let oRole = getMatchList(this.game.roles,[['id',weapon.owner]])[0];
        //     let oPlate = getMatchList(this.game.plates,[['id',weapon.id]])[0];
        //     if(oRole.weaponId<0){
        //         oRole.weapon = `${oPlate.name}[${oPlate.id}]：${oPlate.desc}`;
        //         oRole.weaponId = oPlate.id;
        //         oPlate.belong = oRole.id;
        //         this.stockPopList = [];
        //     }
        //     else{
        //         this.tip = `[错误]${oRole.name}已经装备了武器`;
        //     }
        // },
        // onClickRemoveStockWeapon(weapon){ // 点击【移除库存武器】
        //     let oRole = getMatchList(this.game.plates,[['id',weapon.owner]])[0];
        //     let oPlate = getMatchList(this.game.plates,[['id',weapon.id]])[0];
        //     oPlate.owner = -1;
        //     let stockList = getMatchList(this.game.plates,[['owner',oRole.id]]);
        //     this.stockPopList = stockList;
        // },
    },
    components:{
        List,
        Bar,
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    @import '../style/home.css';
</style>

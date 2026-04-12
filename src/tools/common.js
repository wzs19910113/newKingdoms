import { DEBUG, CONFIG } from '../config/config';
import { query, r, rr, exptr, setInRange, bulbsort, cloneObj, shuffle, getParentNode, getMatchList, removeFromList, arrContains, removeFromNumberList, } from '../tools/utils';
import * as NAMES from '../tools/namestock';

let _sns = [];
for(let sno of NAMES.SURNAME_LIST){
    for(let i=0;i<sno.c;i++){
        _sns.push(sno.n);
    }
}
const SURNAMES = _sns;

function cl(n){
    return Math.floor(n);
}
function pow(n,p=2){
    return Math.pow(n,p);
}
function rInArr(arr){
    return arr[r(0,arr.length-1)];
}
function genEquipName(suffixList){ // 通用装备生成格式
    let res;
    switch(r(1,5)){
        case 1: // 21-
            res = `${rInArr(NAMES.EQUIP_NAME2_LIST)}${r(0,1)?rInArr(NAMES.EQUIP_NAME1_LIST):''}${r(0,4)?rInArr(suffixList):''}`;
        break;
        case 2: // 22-
            res = `${rInArr(NAMES.EQUIP_NAME2_LIST)}${r(0,1)?rInArr(NAMES.EQUIP_NAME2_LIST):''}${r(0,4)?rInArr(suffixList):''}`;
        break;
        case 3: // 11-
            res = `${rInArr(NAMES.EQUIP_NAME1_LIST)}${rInArr(NAMES.EQUIP_NAME1_LIST)}${rInArr(suffixList)}`;
        break;
        case 4: // 1-
            res = `${rInArr(NAMES.EQUIP_NAME1_LIST)}${rInArr(suffixList)}`;
        break;
        case 5: // 2-
            res = `${rInArr(NAMES.EQUIP_NAME2_LIST)}${rInArr(suffixList)}`;
        break;
    }
    return res;
}
export function genHelmetName(){ // 生成头盔名
    return genEquipName(NAMES.HELMET_NAME_LIST);
};
export function genWeaponName(melee=1){ // 生成武器名
    let suffixList = melee==1?NAMES.MELEE_WEAPON_NAME_LIST:NAMES.RANGE_WEAPON_NAME_LIST;
    return genEquipName(suffixList);
};
export function genArmorName(){ // 生成铠甲名
    return genEquipName(NAMES.ARMOR_NAME_LIST);
};
export function genShoesName(){ // 生成鞋名
    return genEquipName(NAMES.SHOES_NAME_LIST);
};
export function genAccName(){ // 生成配饰名
    return genEquipName(NAMES.ACC_NAME_LIST);
}
export function genRoleName(gender=1){ // 生成角色名
    let givennames = gender==1?NAMES.MALE_NAME_LIST:NAMES.FEMALE_NAME_LIST;
    return `${rInArr(SURNAMES)}${r(0,1)?rInArr(givennames):''}${rInArr(givennames)}`;
};
export function genNickName(){ // 生成称谓
    return `高手`;
}

export function getUnitBtd(unit,game){ // 获取单位战斗数据
    let equips = [], weapons = [], skills = [], btd = {}, _unit = cloneObj(unit);
    let awa = 0;
    for(let equipId of unit.es){
        let equip = getMatchList(game.allEquips,[['id',equipId]])[0];
        if(equip){
            equips.push(cloneObj(equip));
            if(equip.t==1){
                weapons.push(cloneObj(equip));
            }
        }
    }
    for(let skillId of unit.ss){
        let skill = getMatchList(game.allSkills,[['id',skillId]])[0];
        if(skill){
            skills.push(cloneObj(skill));
        }
    }
    for(let equip of equips){
        let eattrs = equip.a||[];
        for(let attr of eattrs){
            _unit.as[attr[0]] += attr[1];
        }
        awa += equip.d||0;
    }
    btd.attrs = _unit.as; // [0血量,1精力,2体力,3防御, 4力量,5精准,6速度,7智力,8定力,0隐蔽,10潜能]
    btd.name = _unit.nm;

    btd.hp = [_unit.st[0],btd.attrs[0],]; // 血
    btd.def = [btd.attrs[3],btd.attrs[3],], // 护甲
    btd.eng = [_unit.st[1],btd.attrs[1],], // 精力
    btd.phy = [btd.attrs[2],btd.attrs[2],], // 体力
    btd.speed = Math.sqrt([btd.attrs[6]]); // 真速度

    // btd.dge = 10000-btd.attrs[9]*10; // 隐蔽
    btd.dge = awa; // 隐蔽

    btd.move = 0; // 行动
    btd.mdef = btd.attrs[8]*25; // 心理防御
    btd.ptc = btd.attrs[10]*4; // 潜能
    btd.alive = 1; // 存活
    btd.teamSeq = _unit.tms;
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
    btd.isPlayer = btd.teamSeq>0?1:0; // 可操控角色

    // 设置数值范围
    btd.ptc = setInRange(btd.ptc,0,10000);
    btd.dge = setInRange(btd.dge,0,10000);

    // @TODO
    // if(unit.id==2){
    //     btd.cur = 1;
    // }
    // if(unit.id==3||unit.id==11){
    //     btd.alive = 0;
    // }
    // let bufflen = r(0,3);
    // for(let i=0;i<bufflen;i++){
    //     let buff;
    //     if(r(0,1)){
    //         buff = {
    //             id: i+1,
    //             name: '急救',
    //             desc: '每回合恢复生命力',
    //             level: r(1,3),
    //             good: 1,
    //             trendVals: [20,0,0,0],
    //         }
    //     }
    //     else{
    //         buff = {
    //             id: i+100,
    //             name: '破绽',
    //             desc: '受到的伤害增加',
    //             level: r(1,3),
    //             good: 0,
    //             trendVals: [0,0,20,0],
    //         }
    //     }
    //     btd.buffs.push(buff);
    // }

    return btd;
}
export function genRandomPersonalities({gender,age,}){ // 随机生成性格属性
    let personalities = [];
    personalities[0] = r(0,100); // 勇猛
    personalities[1] = r(0,100); // 敏感
    personalities[2] = r(0,100); // 野心
    personalities[3] = r(0,100); // 理智
    personalities[4] = r(0,100); // 道德
    /* 根据性别修正数据 */
    if(gender==1){ // 男
        personalities[0] = personalities[0]+r(0,45);
        personalities[0] = personalities[0]+r(0,25);
    }
    else{ // 女
        personalities[0] = personalities[0]-r(0,45);
        personalities[1] = personalities[1]+r(0,38);
    }
    // /* 根据年龄修正数据 */
    // // ----25岁以下冷静值降低
    if(age<25){
        personalities[3] -= r(0,(25-age)*3);
    }

    /* 规范数值范围 */
    for(let i=0;i<personalities.length;i++){
        if(personalities[i]<0){
            personalities[i] = r(5,10);
        }
        else if(personalities[i]>100){
            personalities[i] = r(90,95);
        }
    }

    /* 数据整合并输出 */
    return personalities;
}
export function genRandomAge(){ // 随机生成年龄
    let age = r(1,100);
    if(age<2){ // 儿童
        return r(5,11);
    }
    if(age<12){ // 少年
        return r(12,17);
    }
    else if(age<70){ // 青年
        return r(18,29);
    }
    else if(age<97){ // 壮年
        return r(30,39);
    }
    else{ // 中老年
        return r(40,80);
    }
    return age;
};
export function genUnit({id,game,name,nickname='',gender=r(1,2),age=genRandomAge(),tms=0,level=1,rel=0,}){ // 生成一个角色
    let genAtr = (rp=3) =>{
        return exptr(CONFIG.attrRangeMap[level-1][0],CONFIG.attrRangeMap[level-1][1],rp);
    }
    if(!name){
        name = genRoleName(gender);
    }
    let epo = 1.5; // 属性分布指数
    let res = {
        id,
        nm: name,
        nk: nickname,
        gd: gender,
        age,
        tms,
        rel,
        as: [
            exptr(CONFIG.hpRangeMap[level-1][0],CONFIG.hpRangeMap[level-1][1],2), // 血量
            exptr(CONFIG.engRangeMap[level-1][0],CONFIG.engRangeMap[level-1][1],2), // 精力
            exptr(1+level,cl(0+pow(1.5,level+3)),1), // 体力
            0, // 防御

            genAtr(), // 力量
            genAtr(), // 精准
            genAtr(), // 速度
            genAtr(), // 智力
            genAtr(), // 定力
            genAtr(), // 隐蔽
            genAtr(), // 爆发
        ],
        ss: [],
        es: [0,0,0,0,0,0,0,],
    };
    res.st = [res.as[0],res.as[1],];
    res.sty = genRandomPersonalities(res.gd,res.age);
    for(let i=4;i<11;i++){
        res.as[i] = setInRange(res.as[i],1,9999);
    }
    // 检查是否能拥有称谓
    let score = calcUnitScore(res,game);
    if(!res.nk&&score>5000){
        res.nk = genNickName();
    }
    return res;
}
export function genEquip({id,game,level=1,type=1}){ // 生成一个装备
    let res = {
        id,
        t: type,
        a: [],
        d: 25,
        v: level*level+10,
    };
    let aRange = []; // 必加成的属性范围 [0血量,1精力,2体力,3防御, 4力量,5精准,6速度,7智力,8定力,9隐蔽,10爆发]
    let rRange = []; // 可加成的属性范围
    let dRange = [0,0,]; // 存在感范围 0-500
    let name;
    let melee = r(1,2); // 武器类型 1近战 2远程
    let genAttrVal = (attr) =>{ // 根据等级生成属性值
        let res = 0;
        switch(attr){
            case 0: // 血量
                res = cl(exptr(CONFIG.hpRangeMap[level-1][0],CONFIG.hpRangeMap[level-1][1],4)/5)+3;
            break;
            case 1: // 精力
                res = cl(exptr(CONFIG.engRangeMap[level-1][0],CONFIG.engRangeMap[level-1][1],4)/5)+2;
            break;
            case 2: // 体力
                res = cl(r(1,pow(level)+2));
            break;
            case 3: // 防御
                res = cl(exptr(CONFIG.defRangeMap[level-1][0],CONFIG.defRangeMap[level-1][1],4))+1;
            break;
            case 4: // 属性
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
            case 10:
                res = cl(exptr(CONFIG.attrRangeMap[level-1][0],CONFIG.attrRangeMap[level-1][1],3)/6)+1;
            break;
        }
        return res;
    }

    if(type==1){ // 武器
        if(melee){
            aRange = [4,];
            rRange = [3,5,6,7,8,10,];
        }
        else{
            aRange = [5,];
            rRange = [3,4,6,7,8,10,];
        }
        dRange = [1,250];
        name = genWeaponName(melee);
    }
    else if(type==2){ // 头
        aRange = [0,3,8,];
        rRange = [1,2,4,5,6,7,9,10,];
        name = genHelmetName();
        dRange = [2,125];
    }
    else if(type==3){ // 身体
        aRange = [0,3,8,9,];
        rRange = [1,2,7,10,];
        name = genArmorName();
        dRange = [20,450];
    }
    else if(type==4){ // 配饰
        rRange = [1,2,3,4,5,6,7,8,9,10,];
        name = genAccName();
        dRange = [1,40];
    }
    else if(type==5){ // 脚
        aRange = [0,3,8,];
        rRange = [1,2,4,5,6,7,9,10,];
        name = genShoesName();
        dRange = [1,135];
    }
    // 设置必有属性
    for(let i=0;i<aRange.length;i++){
        let newAttr = [0,0,];
        newAttr[0] = aRange[i];
        newAttr[1] = genAttrVal(aRange[i]);
        res.a.push(newAttr);
    }
    // 设置可有属性
    let rCount = exptr(0,4,3);
    let shufRRange = shuffle(rRange);
    for(let i=0;i<rCount;i++){
        let newAttr = [0,0,];
        newAttr[0] = shufRRange[i];
        newAttr[1] = genAttrVal(shufRRange[i]);
        res.a.push(newAttr);
    }
    // 确保有属性加成
    if(res.a.length<=0){
        let newAttr = [0,0,];
        newAttr[0] = r(0,10);
        newAttr[1] = genAttrVal(newAttr[0]);
        res.a.push(newAttr);
    }

    // 武器添加攻击方式
    if(type==1){
        let atkCount = exptr(1,3,3); // 攻击方式的数量
        let minAtk = CONFIG.atkRangeMap[level-1][0], maxAtk = CONFIG.atkRangeMap[level-1][1];
        let meleeNames = shuffle(NAMES.ATTACK_NAME_MELEE_LIST);
        let rangeNames = shuffle(NAMES.ATTACK_NAME_RANGE_LIST);
        let genConsume = atk =>{ // 根据攻击方式生成体力消耗
            let score = 10, res = 0;
            score += atk.d;
            score += atk.r1*6;
            score += atk.r2*6;
            for(let i=0;i<atk.bl.length;i++){
                score += atk.bl[i]*50;
            }
            score += atk.sl*100;
            if(atk.a){
                score *= 1.5;
            }
            res = cl(score/32);
            if(res<1){
                res = 1;
            }
            return res;
        }
        res.k = [];
        for(let i=0;i<atkCount;i++){ // 循环生成攻击方式
            let atkAll = !r(0,4); // 是否为全体攻击
            let r1Ratio = 0, r2Ratio = 0;
            let name;
            if(melee==1){ // 近战
                name = meleeNames[i];
                if(r(1,10)<=3){ // 纯近战
                    r1Ratio = 1;
                    r2Ratio = 0;
                }
                else{
                    r1Ratio = .5;
                    r2Ratio = .5;
                }
            }
            else{ // 远程
                name = rangeNames[i];
                if(r(1,10)<=9){ // 纯远程
                    r1Ratio = 0;
                    r2Ratio = 1;
                }
                else{
                    r1Ratio = .2;
                    r2Ratio = .8;
                }
            }
            let newAtk = {
                n: name,
                d: cl(exptr(minAtk,maxAtk,1))+1,
                r1: cl(exptr(minAtk,maxAtk,3)*5*r1Ratio),
                r2: cl(exptr(minAtk,maxAtk,3)*5*r2Ratio),
                b: [],
                bl: [],
                s: 0,
                sl: 0,
            };
            if(!atkAll){ // 如果不是全体攻击
                // 添加buff
                let buffCount = exptr(0,2,3);
                for(let i=0;i<buffCount;i++){
                    let buffId = CONFIG.badBuffs[r(0,CONFIG.badBuffs.length-1)].id;
                    let buffLvl = r(1,level);
                    newAtk.b.push(buffId);
                    newAtk.bl.push(buffLvl);
                }
                // 添加特殊效果
                if(r(1,10)<=3){
                    newAtk.s = r(1,5);
                    newAtk.sl = r(1,level);
                }
            }
            newAtk.c = genConsume(newAtk);
            newAtk.a = atkAll;
            res.k.push(newAtk);
        }
    }

    res.n = name;
    res.d = cl(r(dRange[0],dRange[1])*25);

    return res;
}
export function genSkill({id,game,level=1,}){ // 生成一个技能
    let res = {};
    return res;
}

export function moneyFormat(money,dollar){ // 金币格式
    let res = '';
    let s_money = money+'';
    let arr_money = s_money.split('');
    if(money>9999){
        // let thousands = money%10000;
        // let majors = money - thousands;
        let thousandTreashold = arr_money.length-4;
        for(let i=0;i<arr_money.length;i++){
            let char = arr_money[i];
            if(i<thousandTreashold){
                res += `<b style="transform:scale(1.1) translate(-10%,-1%);display:inline-block;margin-right: 1px;text-decoration:underline;">${char}</b>`;
            }
            else{
                res += `${char}`;
            }
        }
    }
    else{
        res += s_money;
    }
    if(dollar){
        res += ` $`;
    }
    return res;
}
export function getStyleTip(style){ // 生成角色性格介绍
    let res = [];
    let adjs = [
        ['胆怯','勇猛'],
        ['麻木','敏感'],
        ['无欲','野心'],
        ['鲁莽','理智'],
        ['邪恶','正义'],
    ];
    let prefix = '';
    for(let p=0;p<style.length;p++){
        let newAdj = '';
        if(style[p]<=20){
            newAdj = adjs[p][0];
        }
        else if(style[p]>=80){
            newAdj = adjs[p][1];
        }
        if(newAdj){
            if(style[p]<5||style[p]>95){
                prefix = '极端';
            }
            res.push(prefix+newAdj);
        }
    }
    return res;
}
export function calcUnitScore(unit,game){ // 计算单位战力 TODO
    let res = 0;
    return res;
}


















//

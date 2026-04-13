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
const BUFF_LIST = [...CONFIG.goodBuffs,...CONFIG.badBuffs];
const BENI_SKILL_EFFECT_LIST = [2,3,4,6,7,8,];
const HARM_SKILL_EFFECT_LIST = [1,2,3,6,7,8,];
const SKILL_EFFECT_MAP = [ // 技能效果类型的数量分布【 1攻击 2添加状态 3减弱一个状态 4恢复生命 5改变护甲 6改变潜能 7改变心防 8改变存在感 】
    3, // 攻击
    3, // 添加状态
    2, // 减弱状态
    2, // 治疗
    0, // 改变护甲
    1, // 改变潜能
    1, // 改变心防
    1, // 改变存在感
];
const REJUST_LEVELS_MAP = [ // 补正等级描述表
    [``,0,],
    [`F`,10,],
    [`E`,28,],
    [`D`,46,],
    [`C`,64,],
    [`B`,82,],
    [`A`,100,],
    [`S`,118,],
    [`SS`,136,],
    [`SSS`,150,],
];

function cl(n){
    return Math.ceil(n);
}
function pow(n,p=2){
    return Math.pow(n,p);
}
function randIn(arr){
    return arr[r(0,arr.length-1)];
}

/* 生成 */
export function genEquipName(type,melee=1){ // 生成装备名字
    let regularName = (suffixList) =>{ // 通用装备生成格式
        let res;
        switch(r(1,5)){
            case 1: // 21-
                res = `${randIn(NAMES.EQUIP_NAME2_LIST)}${r(0,1)?randIn(NAMES.EQUIP_NAME1_LIST):''}${r(0,4)?randIn(suffixList):''}`;
            break;
            case 2: // 22-
                res = `${randIn(NAMES.EQUIP_NAME2_LIST)}${r(0,1)?randIn(NAMES.EQUIP_NAME2_LIST):''}${r(0,4)?randIn(suffixList):''}`;
            break;
            case 3: // 11-
                res = `${randIn(NAMES.EQUIP_NAME1_LIST)}${randIn(NAMES.EQUIP_NAME1_LIST)}${randIn(suffixList)}`;
            break;
            case 4: // 1-
                res = `${randIn(NAMES.EQUIP_NAME1_LIST)}${randIn(suffixList)}`;
            break;
            case 5: // 2-
                res = `${randIn(NAMES.EQUIP_NAME2_LIST)}${randIn(suffixList)}`;
            break;
        }
        return res;
    }
    let suffixList = [
        melee==1?NAMES.MELEE_WEAPON_NAME_LIST:NAMES.RANGE_WEAPON_NAME_LIST,
        NAMES.HELMET_NAME_LIST,
        NAMES.ARMOR_NAME_LIST,
        NAMES.ACC_NAME_LIST,
        NAMES.SHOES_NAME_LIST,
    ][type-1];
    return regularName(suffixList);
}
export function genRoleName(gender=1){ // 生成角色名
    let givennames = gender==1?NAMES.MALE_NAME_LIST:NAMES.FEMALE_NAME_LIST;
    return `${randIn(SURNAMES)}${r(0,1)?randIn(givennames):''}${randIn(givennames)}`;
};
export function genSkillName({level=1,beni=0}){ // 生成技能名
    let res = ``;
    let prefix1List, prefix2List, suffixList;
    if(beni){ // 保护和强化
        prefix1List = NAMES.SKILL_NAME2_LIST;
        prefix2List = NAMES.BENI_SKILL_NAME_LIST;
        suffixList = NAMES.BENI_SKILL_LASTNAME_LIST;
    }
    else{ // 伤害和弱化
        prefix1List = NAMES.SKILL_NAME1_LIST;
        prefix2List = NAMES.SKILL_NAME2_LIST;
        suffixList = NAMES.HARM_SKILL_LASTNAME_LIST;
    }
    switch(r(1,9)){
        case 1: // 21-
            res = `${randIn(prefix1List)}${randIn(prefix2List)}${randIn(suffixList)}`;
        break;
        case 2: // 22-
            res = `${randIn(prefix2List)}${randIn(prefix2List)}${randIn(suffixList)}`;
        break;
        case 3: // 11-
            res = `${randIn(prefix1List)}${randIn(prefix1List)}${randIn(suffixList)}`;
        break;
        case 4: // 1-
            res = `${randIn(prefix1List)}${randIn(suffixList)}`;
        break;
        case 5: // 2-
            res = `${randIn(prefix2List)}${randIn(suffixList)}`;
        break;
        case 6: // 21
            res = `${randIn(prefix2List)}${randIn(prefix1List)}`;
        break;
        case 7: // 22
            res = `${randIn(prefix2List)}${randIn(prefix2List)}`;
        break;
        case 8: // 112
            res = `${randIn(prefix1List)}${randIn(prefix1List)}${randIn(prefix2List)}`;
        break;
        case 9: // 212
            res = `${randIn(prefix2List)}${randIn(prefix1List)}${randIn(prefix2List)}`;
        break;
    }
    return res;
}
export function genNickName(){ // 生成称谓
    return `高手`;
}

export function genRx(level,exponent=2){ // 随机生成补正数值
    let minRx = CONFIG.rxRangeMap[level-1][0]||1, maxRx = CONFIG.rxRangeMap[level-1][1]||1;
    let res = cl(exptr(minRx,maxRx*5,exponent));
    res = setInRange(res,1,Infinity);
    return res;
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
export function genAttack({level=1,melee=1,name='',isSkill=0}){ // 生成一个攻击方式
    let newAtk = {};
    let atkAll = 0; // 是否为全体攻击
    let r1Ratio = 0, r2Ratio = 0, rAllRatio = 0;
    let minAtk, maxAtk;
    if(isSkill){ // 用于技能
        minAtk = CONFIG.skillAtkRangeMap[level-1][0];
        maxAtk = CONFIG.skillAtkRangeMap[level-1][1];
        rAllRatio = 1;
    }
    else{ // 用于武器
        minAtk = CONFIG.weaponAtkRangeMap[level-1][0];
        maxAtk = CONFIG.weaponAtkRangeMap[level-1][1];
        atkAll = !r(0,4);
        rAllRatio = .25;
    }
    if(melee==1){ // 近战
        if(r(1,10)<=3){ // 纯近战
            r1Ratio = 2;
            r2Ratio = 0;
        }
        else{
            r1Ratio = 1;
            r2Ratio = 1;
        }
    }
    else{ // 远程
        if(r(1,10)<=9){ // 纯远程
            r1Ratio = 0;
            r2Ratio = 2;
        }
        else{
            r1Ratio = .4;
            r2Ratio = 1.6;
        }
    }
    newAtk = {
        n: name,
        d: cl(exptr(minAtk,maxAtk,1))+1,
        r1: cl(genRx(level)*r1Ratio*rAllRatio),
        r2: cl(genRx(level)*r2Ratio*rAllRatio),
        b: [],
        bl: [],
        s: 0,
        sl: 0,
        a: atkAll,
    };
    if(!isSkill){ // 用于武器
        if(!atkAll){ // 如果不是全体攻击
            // 添加buff
            let buffCount = exptr(0,2,3);
            let sfdBuffs = shuffle(CONFIG.badBuffs);
            for(let i=0;i<buffCount;i++){
                let buffId = sfdBuffs[i].id;
                let buffLvl = r(1,level);
                newAtk.b.push(buffId);
                newAtk.bl.push(buffLvl);
            }
            // 添加特殊效果
            if(r(1,10)<=3){
                newAtk.s = r(1,6);
                newAtk.sl = r(1,level);
            }
        }
        else if(atkAll){ // 全体攻击，减少攻击力
            newAtk.d -= cl(newAtk.d*.6);
            newAtk.r1 -= cl(newAtk.r1*.6);
            newAtk.r2 -= cl(newAtk.r2*.6);
        }
    }
    newAtk.c = calcWeaponAtkConsume(newAtk); // 攻击体耗
    newAtk.c = setInRange(newAtk.c,1,Infinity);
    return newAtk;
}

export function genUnit({id,game,name,nickname='',gender=r(1,2),age=genRandomAge(),tms=0,level=1,rel=0,}){ // 生成一个角色
    let genAtr = (flexible) =>{
        let res = 1;
        let min=CONFIG.attrRangeMap[level-1][0], max=CONFIG.attrRangeMap[level-1][1];
        if(flexible){
            let mid=cl((min+max)/3), fact=[-1,1][r(0,1)], rag=cl((max-min)*flexible);
            res = mid+r(0,rag)*fact;
        }
        else{
            res = exptr(min,max,3);
        }
        res = setInRange(res,1,Infinity);
        return res;
    }
    if(!name){
        name = genRoleName(gender);
    }
    let epo = 1.5; // 属性分布指数
    let res = {
        id,
        l: level,
        nm: name,
        nk: nickname,
        gd: gender,
        age,
        tms,
        rel,
        as: [
            exptr(CONFIG.hpRangeMap[level-1][0],CONFIG.hpRangeMap[level-1][1],3), // 血量
            exptr(CONFIG.engRangeMap[level-1][0],CONFIG.engRangeMap[level-1][1],3), // 精力
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
    if(level>5){ // 设置定力最小值
        res.as[8] = setInRange(res.as[8],pow(level)+r(pow(level,1.8),pow(level,2.2)+5),Infinity);
    }
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
        n: '',
        l: level,
        t: type,
        a: [],
        d: 25,
        v: 0,
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
    }
    else if(type==2){ // 头
        aRange = [0,3,8,];
        rRange = [1,2,4,5,6,7,9,10,];
        dRange = [2,125];
    }
    else if(type==3){ // 身体
        aRange = [0,3,8,9,];
        rRange = [1,2,6,7,10,];
        dRange = [20,450];
    }
    else if(type==4){ // 配饰
        aRange = [2,];
        rRange = [3,4,5,6,7,8,9,10,];
        dRange = [1,40];
    }
    else if(type==5){ // 脚
        aRange = [0,3,8,];
        rRange = [1,2,4,5,6,7,9,10,];
        dRange = [1,135];
    }
    name = genEquipName(type,melee);
    // 设置必有属性
    for(let i=0;i<aRange.length;i++){
        let newAttr = [0,0,];
        newAttr[0] = aRange[i];
        newAttr[1] = genAttrVal(aRange[i]);
        res.a.push(newAttr);
    }
    // 设置可有属性
    let rCount = exptr(0,5,1);
    if(type==4){
        rCount = exptr(0,7,1);
    }
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
    // 属性排序
    res.a = bulbsort(res.a,0,0);

    // 武器添加攻击方式
    if(type==1){
        let atkCount = exptr(1,3,3); // 攻击方式的数量
        // let atkCount = 3; // 攻击方式的数量
        let atkNames = shuffle(melee==1?NAMES.ATTACK_NAME_MELEE_LIST:NAMES.ATTACK_NAME_RANGE_LIST);
        res.k = [];
        for(let i=0;i<atkCount;i++){ // 循环生成攻击方式
            let name = atkNames[i];
            let newAtk = genAttack({level,melee,name,});
            res.k.push(newAtk);
        }
        // 调整每个攻击方式的体力消耗
        let sortedK = bulbsort(res.k,'c',1);
        if(sortedK.length==3){
            sortedK[0].c += cl(sortedK[0].c*.3);
            sortedK[1].c += cl(sortedK[1].c*.15);
        }
        else if(sortedK.length==2){
            sortedK[0].c += cl(sortedK[0].c*.15);
        }
    }

    // 设置存在感
    res.d = cl(r(dRange[0],dRange[1])*25);
    res.d = setInRange(res.d,0,10000);

    // 根据已有数据计算价值
    res.v = calcEquipValue(res);
    res.v = setInRange(res.v,1,Infinity);

    res.n = name;

    return res;
}
export function genSkill({id,game,level=1,beni,melee}){ // 生成一个技能
	/*id: 11,
	l: 1,
	n: '治愈术',
	t: 1, // 1自己 2我方单体 3敌方单体
	el: [{
        t: 3, // 技能效果数组【 1攻击 2添加状态 3减弱一个状态 4恢复生命 5改变护甲 6改变潜能 7改变心防 8改变存在感 】
        d: 7, // 攻击方式{d:5,r1:24,r2:17}，添加的状态-等级数组{ b:[1,2], bl:[3,4],}，固疗和百分疗 { h:100, rx:35},心防固伤和智力补正 { d:100, rx:35 }
    },],
	c: 6, // 体力消耗
	d: 1200, // 存在感
	v: 133, // 价值
    */
    let res = {
        id,
        l: level,
        n: '',
        t: 1, // 目标
        el: [], // 技能效果数组
        c: 1, // 体力消耗
        d: 25, // 固有存在感
        v: 0, // 价值
        // td: [0,0,0,0,], // 倾向【保护，强化，伤害，弱化】
    };
    let sfdBuffs; // 可能拥有的buff数组，洗乱
    // 参数倾向
    if(beni===undefined){ // 是增益技能
        beni = r(0,1);
    }
    if(!melee){ // 力准倾向
        melee = r(1,2);
    }
    // 根据倾向设置基础变量
    let target;
    let fact; // 乘积因子：-1或1
    let skillEffectList;
    if(beni==1){ // 保护和强化
        res.t = [1,1,1,2,2,][r(0,4)];
        sfdBuffs = shuffle(CONFIG.goodBuffs);
        fact = 1;
        skillEffectList = BENI_SKILL_EFFECT_LIST;
        res.n = genSkillName({level,beni:1});
    }
    else{ // 伤害和弱化
        res.t = 3;
        sfdBuffs = shuffle(CONFIG.badBuffs);
        fact = -1;
        skillEffectList = HARM_SKILL_EFFECT_LIST;
        res.n = genSkillName({level,beni:0});
    }
    // 技能效果
    let eCount = exptr(1,3,5); // 效果数量
    let sfdSkillEffectList = []; // 可能拥有的效果数组
    let _sfdSkillEffectList = [];
    for(let e of skillEffectList){
        for(let i=0;i<SKILL_EFFECT_MAP[e-1];i++){
            _sfdSkillEffectList.push(e);
        }
    }
    _sfdSkillEffectList = shuffle(_sfdSkillEffectList); // 洗乱
    for(let e of _sfdSkillEffectList){ // 去重
        if(arrContains(sfdSkillEffectList,e)==-1){
            sfdSkillEffectList.push(e);
        }
    }

    // TODO
    eCount = 1;
    sfdSkillEffectList = [1]; // 【 1攻击 2添加状态 3减弱一个状态 4恢复生命 5改变护甲 6改变潜能 7改变心防 8改变存在感 】

    let hasAttack = 0;
    for(let i=0;i<eCount;i++){ // 逐个添加效果
        let newEffect = {
            t: sfdSkillEffectList[i],
        }
        switch(sfdSkillEffectList[i]){ // 【 1攻击 2添加状态 3减弱一个状态 4恢复生命 5改变护甲 6改变潜能 7改变心防 8改变存在感 】
            case 1: // 攻击
                let d=0, r1=0, r2=0;
                let atkCount = 1;
                for(let i=0;i<atkCount;i++){
                    let newAttack = genAttack({level,melee,isSkill:1});
                    d += newAttack.d;
                    r1 += newAttack.r1;
                    r2 += newAttack.r2;
                }
                newEffect.d = { d, r1, r2, };
                hasAttack = 1;
            break;
            case 2: // 添加状态
                newEffect.d = { b:[], bl:[],};
                let buffCount = exptr(1,3,5); // buff数量
                for(let j=0;j<buffCount;j++){
                    newEffect.d.b.push(sfdBuffs[j].id); // 随机buffId
                    newEffect.d.bl.push(r(1,level)); // 随机buff等级
                }
            break;
            case 3: // 减弱一个状态
                newEffect.d = r(1,level);
            break;
            case 4: // 治疗
                newEffect.d = { h:0, rx:0, };
                newEffect.d.h = exptr(1,cl(CONFIG.hpRangeMap[level-1][1]/100+20),2)+cl(pow(level,r(20,35)/10)); // 固定数值治疗
                if(level>=r(4,5)){ // 施法者的智力补正
                    newEffect.d.rx = genRx(level);
                }
            break;
            case 5: // 改变护甲
                // newEffect.d = (exptr(1,cl(CONFIG.defRangeMap[level-1][1]/10+20),3)+5)*fact;
            break;
            case 6: // 改变潜能
                newEffect.d = { d:0, rx:0, };
                newEffect.d.d = (1000+exptr(10,level*27,1)*25)*fact;
                newEffect.d.d = setInRange(newEffect.d.d,-10000,10000);
                if(beni&&level>=r(2,4)){ // 目标单位的爆发补正
                    newEffect.d.rx = genRx(level);
                }
            break;
            case 7: // 改变心防
                newEffect.d = { d:0, rx1:0, rx2:0,};
                newEffect.d.d = cl((5+exptr(5,level*10,1))*fact);
                if(beni&&level>=r(2,4)){ // 目标单位的定力补正
                    newEffect.d.rx1 = genRx(level);
                }
                else if(!beni&&level>=r(4,5)){ // 施法者的智力补正
                    newEffect.d.rx2 = genRx(level);
                }
            break;
            case 8: // 改变存在感
                newEffect.d = { d:0, rx:0, };
                if(beni){
                    newEffect.d.d = exptr(80,100+level*15,1)*25*(-fact);
                }
                else{
                    newEffect.d.d = exptr(80,100+level*30,1)*25*(-fact);
                }
                newEffect.d.d = setInRange(newEffect.d.d,-10000,10000);
                if(beni&&level>=r(2,4)){ // 目标单位的隐蔽补正
                    newEffect.d.rx = genRx(level);
                }
            break;
        }
        res.el.push(newEffect);
    }
    // 固有存在感
    res.d = cl(r(1,200)*25);
    if(hasAttack){
        res.d += cl(r(5,50)*25);
    }
    res.d = setInRange(res.d,0,10000); // set in range
    // 计算价值
    res.v = calcSkillValue(res);
    res.v = setInRange(res.v,10,Infinity);
    // 根据价值计算体力消耗
    res.c = cl(res.v*.006+5);
    res.c = setInRange(res.c,1,Infinity);

    return res;
}


/* 计算 */
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
    btd.attrs = cloneObj(_unit.as); // 11维属性 [0血量,1精力,2体力,3防御, 4力量,5精准,6速度,7智力,8定力,0隐蔽,10潜能]
    btd.oattrs = cloneObj(_unit.as); // 战斗初始的11维属性
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
    //             benis: [20,0,0,0],
    //         }
    //     }
    //     else{
    //         buff = {
    //             id: i+100,
    //             name: '破绽',
    //             desc: '受到的伤害增加',
    //             level: r(1,3),
    //             good: 0,
    //             benis: [0,0,20,0],
    //         }
    //     }
    //     btd.buffs.push(buff);
    // }

    return btd;
}
export function awaFormat(val){ // 存在感格式
    if(val<10000&&val>=9900){
        return 99;
    }
    else if(val<=100&&val>0){
        return 1;
    }
    else{
        return Math.round(val/100);
    }
}
export function moneyFormat(money,dollar){ // 金币格式
    let res = '';
    let s_money = money+'';
    let arr_money = s_money.split('');
    if(money>9999){
        let thousandTreashold = arr_money.length-4;
        for(let i=0;i<arr_money.length;i++){
            let char = arr_money[i];
            if(i<thousandTreashold){
                res += `<span style="transform:scale(1.2);display:inline-block;margin-right: 1px;text-decoration:underline;">${char}</span>`;
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
export function getStyleTip(style){ // 获取角色性格介绍
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
export function genRXString(val){ // 生成补正等级描述文本
    return val; // TODO
    if(val<=0){
        return `-`;
    }
    if(val>150){
        return `?`;
    }
    let name = ``, suffix = ``;
    for(let i=0;i<REJUST_LEVELS_MAP.length;i++){
        let l = REJUST_LEVELS_MAP[i];
        let n = l[0], max = l[1];
        if(val<=max){ // 8<9
            name = n;
            let diff = max - REJUST_LEVELS_MAP[i-1][1]; // 3
            let mod = max - val; // 1
            let div = Math.round(mod/diff*100); // 33
            if(div<50){
                suffix = `+`;
            }
            break;
        }
    }
    let res = `${name}${suffix}`;
    return res;
};

export function calcAtkValue(atk){ // 计算攻击方式的价值
    let score = 100, res = 0;
    score += cl(pow(atk.d,1.34)*33);
    score += cl(pow(atk.r1,1.34)*65);
    score += cl(pow(atk.r2,1.34)*65);

    for(let i=0;i<atk.bl.length;i++){
        score += cl(pow(atk.bl[i],1.34)*1500);
    }
    score += cl(pow(atk.sl,1.34)*2500);
    if(atk.a){
        score *= 1.5;
    }
    res = cl(score/2);
    res = setInRange(res,1,Infinity);
    return res;
}
export function calcWeaponAtkConsume(atk){ // 计算武器攻击方式的体力消耗
    let score = 0, res = 0;
    score += cl(pow(atk.d,1)*7.5);
    score += cl(pow(atk.r1,1)*8);
    score += cl(pow(atk.r2,1)*8);

    for(let i=0;i<atk.bl.length;i++){
        score += cl(pow(atk.bl[i],1.44)*50);
    }
    score += cl(pow(atk.sl,1.44)*30);
    if(atk.a){
        score *= 1.5;
    }
    res = 2+cl(score/100);
    res = setInRange(res,1,Infinity);
    return res
}
export function calcSkillValue(skill){ // 计算技能价值
    /*id: 11,
	l: 1,
	n: '治愈术',
	t: 1, // 1自己 2我方单体 3敌方单体
	el: [{
        t: 3, // 技能效果数组【 1攻击 2添加状态 3减弱一个状态 4恢复生命 5改变护甲 6改变潜能 7改变心防 8改变存在感 】
        d: 7, // 攻击方式{d:5,r1:24,r2:17}，添加的状态-等级数组{ b:[1,2], bl:[3,4],}，固疗和百分疗 { h:100, rx:35},心防固伤和智力补正 { d:100, rx:35 }
    },],
	c: 6, // 体力消耗
	d: 1200, // 存在感
	v: 133, // 价值
	td: [100,200,0,0,] // 技能倾向数组 【保护，强化，伤害，弱化】
    */
    let res = 0;
    let level = skill.l;
    let beni = skill.t!=3;
    for(let i=0;i<skill.el.length;i++){ // 遍历每个效果
        let effect = skill.el[i];
        let { t, d, } = effect;
        switch(t){ // 【 1攻击 2添加状态 3减弱一个状态 4恢复生命 5改变护甲 6改变潜能 7改变心防 8改变存在感 】
            case 1: // 攻击
                res += cl(pow(d.d,1.15))*26;
                res += cl(pow(d.r1,1.15))*22;
                res += cl(pow(d.r2,1.15))*22;
            break;
            case 2: // 添加状态
                for(let j=0;j<d.bl.length;j++){
                    res += 750;
                    res += d.bl[j]*1000;
                }
            break;
            case 3: // 减弱一个状态
                res += 1000 + cl(pow(d,1.25))*1500;
            break;
            case 4: // 治疗
                res += 100 + d.h*20; // 固定值
                res += d.rx*75; // 补正
            break;
            case 6: // 改变潜能
                if(beni){ // 技能倾向为利好
                    res += cl(pow(Math.abs(d.d)/1000,1.33)*2500); // 固定值
                    res += cl(pow(Math.abs(d.rx),1.44)*19); // 补正
                }
                else{ // 技能倾向为伤害
                    res += cl(pow(Math.abs(d.d)/1000,1.33)*2000); // 固定值
                }
            break;
            case 7: // 改变心防
                res += cl(pow(Math.abs(d.d),1.39)*42); // 固定值
                if(d.rx1){ // 技能倾向为利好
                    res += cl(pow(Math.abs(d.rx1),1.44)*25); // 定力补正
                }
                if(d.rx2){ // 技能倾向为伤害
                    res += cl(pow(Math.abs(d.rx2),1.34)*45); // 智力补正
                }
            break;
            case 8: // 改变存在感
                if(beni){ // 技能倾向为利好
                    res += 100 + cl(pow(Math.abs(d.d)/1000,1.31)*650); // 固定值
                    res += cl(pow(Math.abs(d.rx),1.28)*9); // 补正
                }
                else{ // 技能倾向为伤害
                    res += 250 + cl(pow(Math.abs(d.d)/1000,1.91)*170); // 固定值
                }
            break;
        }
    }
    if(!beni){
        res -= cl(skill.d/(12-level));
    }
    res = cl(res);
    res = setInRange(res,10,Infinity);
    return res;
}
export function calcEquipValue(equip){ // 计算装备的价值
    let score = 0;
    for(let attr of equip.a){
        switch(attr[0]){
            case 0: // 血量
                score += cl(attr[1]*.7);
            break;
            case 1: // 精力
                score += cl(attr[1]*1.1);
            break;
            case 2: // 体力
                score += cl(attr[1]*367);
            break;
            case 3: // 防御
                score += cl(attr[1]*29);
            break;
            case 4: // 属性
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
            case 10:
                score += cl(attr[1]*63);
            break;
        }
    }
    if(equip.k){
        for(let atk of equip.k){
            score += calcAtkValue(atk);
        }
    }
    // let awaReduce = cl(equip.d/10);
    // if(awaReduce<score){
    //     score -= awaReduce;
    // }
    return score;
}
export function calcUnitScore(unit,game){ // 计算单位战力 TODO
    let res = 0;
    return res;
}


















//

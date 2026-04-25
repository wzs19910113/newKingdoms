import { DEBUG, CONFIG } from '../config/config';
import { cl, query, r, rr, avg, exptr, setInRange, bulbsort, cloneObj, shuffle, getParentNode, getMatchList, removeFromList, arrContains, removeFromNumberList, } from '../tools/utils';
import * as NAMES from '../tools/namestock';

let _sns = [];
for(let sno of NAMES.SURNAME_LIST){
    for(let i=0;i<sno.c;i++){
        _sns.push(sno.n);
    }
}
const SURNAMES = _sns;
const BUFF_LIST = [...CONFIG.goodBuffs,...CONFIG.badBuffs];
const BENI_SKILL_EFFECT_LIST = [2,5,7,8,9,];
const HARM_SKILL_EFFECT_LIST = [1,2,7,8,9,];
const SKILL_EFFECT_MAP = [ // 技能效果类型的数量分布【 1攻击 2添加状态 3减弱增益状态 4减弱减益状态 5恢复生命 6改变护甲 7改变潜能 8改变心防 9改变存在感 】
    3, // 攻击
    1, // 添加状态
    1, // 减弱增益状态 @test
    1, // 减弱减益状态 @test
    2, // 治疗
    0, // 改变护甲
    1, // 改变潜能
    1, // 改变心防
    1, // 改变存在感
];
const REJUST_LEVELS_MAP = [ // 补正等级描述表
    [``,0,],
    [`F`,5,],
    [`E`,10,],
    [`D`,20,],
    [`C`,40,],
    [`B`,70,],
    [`A`,110,],
    [`S`,160,],
    [`SS`,225,],
    [`SSS`,300,],
];

function pow(n,p=2){
    return Math.pow(n,p);
}
function randIn(arr){
    return arr[r(0,arr.length-1)];
}

/* ---------------------------- 生成 ---------------------------- */
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
export function calcIconSrc(unit){ // 计算单位的icon地址
    let res = `icon-`;
    res += unit.gd==1?`male-`:`female-`;
    res += unit.i;
    res += '.png';
    return res;
}

export function genRx(level,exponent=1){ // 随机生成补正数值
    let minRx = CONFIG.rxRangeMap[level-1][0]||1, maxRx = CONFIG.rxRangeMap[level-1][1]||1;
    let res = cl(exptr(minRx,maxRx*10,exponent));
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
export function genAttack({level=1,melee=1,names=[],skillId=0,equipId=0}){ // 生成一个攻击方式
    let newAtk = {};
    let atkAll = 0; // 是否为全体攻击
    let r1Ratio = 0, r2Ratio = 0, rAllRatio = 0;
    let minAtk, maxAtk;
    let name,aniType;
    let spRange = []; // 特殊攻击效果范围
    if(skillId){ // 用于技能
        minAtk = CONFIG.skillAtkRangeMap[level-1][0];
        maxAtk = CONFIG.skillAtkRangeMap[level-1][1];
        rAllRatio = 1;
    }
    else if(equipId){ // 用于武器
        minAtk = CONFIG.weaponAtkRangeMap[level-1][0];
        maxAtk = CONFIG.weaponAtkRangeMap[level-1][1];
        atkAll = !r(0,4);
        rAllRatio = .75;
    }
    if(melee==1){ // 近战
        if(r(1,10)<=3){ // 纯近战
            r1Ratio = 1;
            r2Ratio = 0;
        }
        else{
            r1Ratio = .9;
            r2Ratio = .7;
        }
        aniType = [1,2,][r(0,1)];
        spRange = [1,2,7,];
    }
    else{ // 远程
        if(r(1,10)<=8){ // 纯远程
            r1Ratio = 0;
            r2Ratio = 1;
        }
        else{
            r1Ratio = .7;
            r2Ratio = .9;
        }
        aniType = [3,4,5,6,][r(0,3)];
        spRange = [3,4,5,6,];
    }
    // 生成名字
    let availableNames = []; // 可选的名字数组
    let attackNameList = NAMES.ATTACK_NAME_LIST[aniType-1];
    for(let n of attackNameList){
        if(arrContains(names,n)==-1){
            availableNames.push(n);
        }
    }
    name = randIn(availableNames);

    // 赋值
    newAtk = {
        n: name,
        d: cl(exptr(minAtk,maxAtk,1))+1,
        r1: 0,
        r2: 0,
        sid: 0,
        et: aniType,

        eid: 0,
        b: [],
        bl: [],
        s: 0,
        sl: 0,
        a: atkAll,
    };

    // 力量和精准补正
    newAtk.r1 = cl(genRx(level,1)*r1Ratio*rAllRatio);
    newAtk.r2 = cl(genRx(level,1)*r2Ratio*rAllRatio);

    if(equipId){ // 属于武器
        newAtk.eid = equipId;
        if(!atkAll){ // 如果不是全体攻击
            if(level>=3){
                // 添加buff
                let buffCount = exptr(0,2,2);
                let sfdBuffs = shuffle(CONFIG.badBuffs);
                for(let i=0;i<buffCount;i++){
                    let buffId = sfdBuffs[i].id;
                    let buffLvl = r(1,level);
                    newAtk.b.push(buffId);
                    newAtk.bl.push(buffLvl);
                }
            }
            // 添加特殊效果
            newAtk.s = randIn(spRange);
            newAtk.sl = r(1,level);
        }
    }
    else if(skillId){ // 属于技能
        newAtk.sid = skillId;
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
    let res = {
        id,
        l: level,
        nm: name,
        nk: nickname,
        gd: gender,
        g: 1000,
        age,
        tms,
        rel,
        as: [
            exptr(CONFIG.hpRangeMap[level-1][0],CONFIG.hpRangeMap[level-1][1],3), // 血量
            exptr(CONFIG.engRangeMap[level-1][0],CONFIG.engRangeMap[level-1][1],3), // 精力
            exptr(level,level*2+1,1), // 体力
            exptr(1,3,5), // 防御

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
        b: [],
        i: r(1,3),
    };
    // 设置定力最小值
    if(level>5){
        res.as[8] = setInRange(res.as[8],pow(level)+r(pow(level,1.8),pow(level,2.2)+5),Infinity);
    }
    // 当前状态
    res.st = [res.as[0],res.as[1],];
    // 性格
    res.sty = genRandomPersonalities(res.gd,res.age);
    // 给7维属性限定范围
    for(let i=4;i<11;i++){
        res.as[i] = setInRange(res.as[i],1,9999);
    }
    // 检查是否能拥有称谓 @test
    let score = 1;
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
                res = cl(exptr(CONFIG.attrRangeMap[level-1][0],CONFIG.attrRangeMap[level-1][1],3)/2)+r(2,level*3);
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
        let atkCount = exptr(1,3,2); // 攻击方式的数量
        let names = []; // 已有的攻击名字数组
        // let atkCount = 3; // 攻击方式的数量
        res.k = [];
        for(let i=0;i<atkCount;i++){ // 循环生成攻击方式
            let newAtk = genAttack({level,melee,names,equipId:res.id});
            res.k.push(newAtk);
            names.push(newAtk.n);
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
	el: [{ // 技能效果数组
        t: 3, // 效果类型【 1攻击 2添加状态 3减弱一个增益状态 4削减一个减益状态 5恢复生命 6改变护甲 7改变潜能 8改变心防 9改变存在感】
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
        if(level>4){
            skillEffectList.push(4);
        }
        res.n = genSkillName({level,beni:1});
    }
    else{ // 伤害和弱化
        res.t = 3;
        sfdBuffs = shuffle(CONFIG.badBuffs);
        fact = -1;
        skillEffectList = HARM_SKILL_EFFECT_LIST;
        if(level>4){
            skillEffectList.push(3);
        }
        res.n = genSkillName({level,beni:0});
    }
    // 技能效果
    let eCount = exptr(1,3,1); // 效果数量
    if(level<3){
        eCount = r(1,level);
    }
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
    // eCount = 1;
    // sfdSkillEffectList = [4]; //  1攻击 2添加状态 3减弱增益状态 4减弱减益状态 5恢复生命 6改变护甲 7改变潜能 8改变心防 9改变存在感

    let hasAttack = 0;
    for(let i=0;i<eCount;i++){ // 逐个添加效果
        let newEffect = {
            t: sfdSkillEffectList[i],
        }
        switch(sfdSkillEffectList[i]){ // 1攻击 2添加状态 3减弱增益状态 4减弱减益状态 5恢复生命 6改变护甲 7改变潜能 8改变心防 9改变存在感
            case 1: // 攻击
                let newAttack = genAttack({level,melee,skillId:res.id});
                newEffect.d = newAttack;
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
            case 3: // 减弱一个增益状态
            case 4: // 减弱一个减益状态
                newEffect.d = r(1,level);
            break;
            case 5: // 治疗
                newEffect.d = { h:0, rx:0, };
                newEffect.d.h = 5+exptr(1,cl(CONFIG.hpRangeMap[level-1][1]/100+20),2)+cl(pow(level,r(20,35)/10)); // 固定数值治疗
                if(level>=r(4,5)){ // 施法者的智力补正
                    newEffect.d.rx = genRx(level);
                }
            break;
            case 6: // 改变护甲
                // newEffect.d = (exptr(1,cl(CONFIG.defRangeMap[level-1][1]/10+20),3)+5)*fact;
            break;
            case 7: // 改变潜能
                newEffect.d = { d:0, rx:0, };
                newEffect.d.d = (500+exptr(3,level*9,1)*(fact?25:50))*fact;
                newEffect.d.d = setInRange(newEffect.d.d,-10000,10000);
                if(beni&&level>=r(3,6)){ // 目标单位的爆发补正
                    newEffect.d.rx = genRx(level,5);
                }
            break;
            case 8: // 改变心防
                newEffect.d = { d:0, rx1:0, rx2:0,};
                newEffect.d.d = cl((5+exptr(5,level*10,1))*fact);
                if(beni&&level>=r(4,6)){ // 目标单位的定力补正
                    newEffect.d.rx1 = genRx(level);
                }
                else if(!beni&&level>=r(4,6)){ // 施法者的智力补正
                    newEffect.d.rx2 = genRx(level);
                }
            break;
            case 9: // 改变存在感
                newEffect.d = { d:0, rx:0, };
                if(beni){ // 增益效果，设置隐蔽补正
                    newEffect.d.rx = genRx(level);
                }
                else{ // 减益效果，设置存在感提升值
                    newEffect.d.d = exptr(80,100+level*30,1)*25*(-fact);
                    newEffect.d.d = setInRange(newEffect.d.d,-10000,10000);
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


/* ---------------------------- 计算 ---------------------------- */
export function getUnitBtd(unit,game){ // 获取单位战斗数据
    let equips = [], weaponList = [], skillList = [], btd = {}, _unit = cloneObj(unit);
    let awa = 0;
    let score = 0, attrScore = 0, equipScore = 0, skillScore = 0; // 单位战斗分数
    for(let i=0,j=0;i<unit.es.length&&j<6;i++,j++){
        let equipId = unit.es[i];
        let equip = getMatchList(game.allEquips,[['id',equipId]])[0];
        if(equip){
            equips.push(cloneObj(equip));
            if(equip.t==1){
                weaponList.push(cloneObj(equip));
            }
            equipScore += equip.v*.12;
        }
    }
    for(let i=0,j=0;i<unit.ss.length&&j<6;i++,j++){
        let skillId = unit.ss[i];
        let skill = getMatchList(game.allSkills,[['id',skillId]])[0];
        if(skill){
            skillList.push(cloneObj(skill));
            skillScore += skill.v*.17;
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

    btd.hp = [btd.attrs[0],btd.attrs[0],]; // 血
    btd.def = [btd.attrs[3],btd.attrs[3],], // 护甲
    btd.eng = [btd.attrs[1],btd.attrs[1],], // 精力
    btd.phy = [btd.attrs[2],btd.attrs[2],], // 体力

    btd.dge = cl(awa*(1-calcDodgeRate(btd.attrs[9]))); // 隐蔽

    btd.mov = 0; // 行动
    btd.mdef = btd.attrs[8]*25+250; // 心理防御
    // btd.mdef = 0; // 心理防御
    btd.ptc = btd.attrs[10]*5; // 潜能
    btd.alive = 1; // 存活
    btd.teamSeq = _unit.tms;
    btd.buffList = [];
    btd.weaponList = weaponList;
    btd.skillList = skillList;
    btd.money = unit.g;
    btd.roundTotal = 1;

    // weapon 名字
    btd.weaponName1 = weaponList[0]?weaponList[0].n:'';
    btd.weaponName2 = weaponList[1]?weaponList[1].n:'';

    btd.isPlayer = btd.teamSeq>0?1:0; // 可操控角色

    // 添加默认攻击方式
    let strBase = btd.attrs[4]>=btd.attrs[5];
    let defaultR1=0,defaultR2=0;
    if(strBase){
        defaultR1 = cl(btd.attrs[4]/30);
    }
    else{
        defaultR2 = cl(btd.attrs[5]/30);
    }
    btd.defaultAttack = {
		n: strBase?'挥拳':'扔石',
		d: 1, // 基础伤害
		r1: defaultR1, // 力量补正
		r2: defaultR2, // 精准补正
		b: [], // buff制造表（buff id）
		bl: [], // buff等级表（1-9）
		s: strBase?1:5, // SP效果 1压制 2破盾 3气溃 4精溃 5锁敌 6攻心 7偷窃
		sl: 1, // SP效果等级
		a: 0, // 目标是否为全体
		c: 1, // 体力消耗
		et: strBase?2:3, // 特效类型 1劈砍 2钝击 3子弹 4飞刀 5火炮 6雷击
		sid: 0, // 所属的技能id
		eid: 0, // 所属的武器id
    }

    // 设置数值范围
    btd.ptc = setInRange(btd.ptc,0,10000);
    btd.dge = setInRange(btd.dge,0,10000);

    // 计算分数
    attrScore += btd.hp[1];
    attrScore += btd.def[1]*5.5;
    attrScore += btd.eng[1]*3;
    attrScore += btd.phy[1]*10;
    for(let i=4;i<=10;i++){
        attrScore += btd.attrs[i]*2;
    }

    btd.equipScore = cl(equipScore);
    btd.skillScore = cl(skillScore);
    btd.attrScore = cl(attrScore);
    btd.score = cl(attrScore+equipScore+skillScore);

    // @test
    /* let allBuffs = shuffle([...CONFIG.goodBuffs,...CONFIG.badBuffs]);
    // for(let i=0;i<5;i++){
    //     let newBuff = cloneObj(allBuffs[i]);
    //     newBuff.level = i+1;
    //     btd.buffList.push(newBuff);
    // }*/

    // if(unit.id!=4){
    //     return btd;
    // }
    //
    // let buffId = 121;
    // let newBuff1 = cloneObj(CONFIG.badBuffs[buffId-101]);
    // newBuff1.level = 3;
    // btd.buffList.push(newBuff1);
    // let newBuff2 = cloneObj(CONFIG.badBuffs[14]);
    // newBuff2.level = 7;
    // btd.buffList.push(newBuff2);
    // let newBuff3 = cloneObj(CONFIG.goodBuffs[6]);
    // newBuff3.level = 4;
    // btd.buffList.push(newBuff3);
    // let newBuff4 = cloneObj(CONFIG.goodBuffs[8]);
    // newBuff4.level = 9;
    // btd.buffList.push(newBuff4);

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
    // return val; // @test
    if(val<=0){
        return `-`;
    }
    if(val>REJUST_LEVELS_MAP[9][1]){
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
export function getSpeed(unit){ // 获取真实速度
    let res = 0, buff;
    res = Math.sqrt([unit.btd.attrs[6]]);

    // 迅捷bufff
    if(buff=getBuff(unit,15)){
        res = res*buff.construction[buff.level-1];
    }

    // 迟钝bufff
    if(buff=getBuff(unit,113)){
        res = res*buff.construction[buff.level-1];
    }

    return res;
}

export function calcAttackValue(atk){ // 计算攻击方式的价值
    let score = 100, res = 0;
    score += cl(pow(atk.d,1.34)*33);
    score += cl(pow(atk.r1,1.34)*65);
    score += cl(pow(atk.r2,1.34)*65);

    for(let i=0;i<atk.bl.length;i++){
        score += cl(pow(atk.bl[i],1.34)*1500);
    }
    score += cl(pow(atk.sl,1.34)*2500);
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
        t: 3, // 技能效果数组【 1攻击 2添加状态 3减弱正面状态 4减弱负面状态 5恢复生命 6改变护甲 7改变潜能 8改变心防 9改变存在感 】
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
            case 3: // 减弱正面状态
            case 4: // 减弱负面状态
                res += 600 + cl(pow(d,1.25))*490;
            break;
            case 5: // 治疗
                res += 100 + d.h*20; // 固定值
                res += d.rx*75; // 补正
            break;
            case 6: // 护甲（弃用）
            break;
            case 7: // 改变潜能
                if(beni){ // 技能倾向为利好
                    res += cl(pow(Math.abs(d.d)/1000,1.33)*5000); // 固定值
                    res += cl(pow(Math.abs(d.rx),1.44)*38); // 补正
                }
                else{ // 技能倾向为伤害
                    res += cl(pow(Math.abs(d.d)/1000,1.33)*4000); // 固定值
                }
            break;
            case 8: // 改变心防
                res += cl(pow(Math.abs(d.d),1.39)*42); // 固定值
                if(d.rx1){ // 技能倾向为利好
                    res += cl(pow(Math.abs(d.rx1),1.44)*25); // 定力补正
                }
                if(d.rx2){ // 技能倾向为伤害
                    res += cl(pow(Math.abs(d.rx2),1.34)*45); // 智力补正
                }
            break;
            case 9: // 改变存在感
                if(beni){ // 技能倾向为利好
                    // res += 100 + cl(pow(Math.abs(d.d)/1000,1.31)*650); // 固定值
                    res += cl(pow(Math.abs(d.rx),1.28)*9); // 补正
                }
                else{ // 技能倾向为伤害
                    res += 250+cl(pow(Math.abs(d.d)/1000,1.91)*87); // 固定值
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
            score += calcAttackValue(atk);
        }
    }
    // let awaReduce = cl(equip.d/10);
    // if(awaReduce<score){
    //     score -= awaReduce;
    // }
    return score;
}

export function calcDodgeRate(dodge){ // 计算躲避因素
    let res;
    res = dodge/CONFIG.dodgeDeno;
    return res;
}
export function isCrumble(unit){ // 判断是否已心理崩溃
    return unit.btd.mdef<=0;
}

/* ---------------------------- 战斗相关 ---------------------------- */
export function calcConsume({type,unit,data,}){ // 计算体力消耗 type 1攻击 2技能 3防御 4躲避 5追踪 6调息 7集气 8爆气 9话术 10撤离
    let res = 0;
    let buff,rateFactor = 1;

    // 屏息bufff
    if(unit&&(buff=getBuff(unit,4))){
        rateFactor -= buff.construction[buff.level-1];
    }

    // 紊乱bufff
    if(unit&&(buff=getBuff(unit,105))){
        rateFactor += buff.construction[buff.level-1];
    }

    if(type==1){ // 攻击，data就是attack
        res = cl(data.c*rateFactor);
    }
    else if(type==2){ // 技能，data就是skill
        res = cl(data.c*rateFactor);
    }
    else{
        res = CONFIG.baseConsumeList[type-3]||0;
    }
    return res;
}
export function canConsume({unit,consume,}){ // 检查体力
    let res = 0;
    let remain = unit.btd.phy[0]+unit.btd.eng[0];
    res = consume<=remain;
    return res;
}
export function calcHit({caster,target,}){ // 计算是否命中
    let res = 0;
    let cbtd = caster.btd, tbtd = target.btd;
    if(cbtd.isPlayer!=tbtd.isPlayer){ // 不同阵营，根据概率判断是否命中
        let rand = r(1,10000);
        if(rand<=tbtd.dge){
            res = 1;
        }
    }
    else{ // 同阵营直接命中
        res = 1;
    }
    // res = 1;
    return res;
}
export function calcAttackDmg({caster,attack,}){ // 计算攻击的伤害
    let res = 0, buff;
    let strRx = caster.btd.attrs[4], acrRx = caster.btd.attrs[5];

    // 猛攻bufff
    if(buff=getBuff(caster,13)){
        strRx = cl(strRx*buff.construction[buff.level-1]);
    }
    // 乏力bufff
    if(buff=getBuff(caster,111)){
        strRx = cl(strRx*buff.construction[buff.level-1]);
    }
    // 鹰眼bufff
    if(buff=getBuff(caster,14)){
        acrRx = cl(acrRx*buff.construction[buff.level-1]);
    }
    // 模糊bufff
    if(buff=getBuff(caster,112)){
        acrRx = cl(acrRx*buff.construction[buff.level-1]);
    }

    let strDmg = cl(strRx*attack.r1/100);
    let acrDmg = cl(acrRx*attack.r2/100);
    res = attack.d + strDmg + acrDmg;
    res = setInRange(res,1,Infinity);
    return res;
}
export function calcPain({unit,dmg,}){ // 计算def和hp各自承受的伤害，返回 { defPain, hpPain, }
    let res = {}, buff;
    let defPain = 0, hpPain = 0;

    // 护盾bufff
    if(buff=getBuff(unit,2)){
        dmg = cl(dmg*buff.construction[buff.level-1]);
    }
    // 易伤bufff
    if(buff=getBuff(unit,101)){
        dmg = cl(dmg*buff.construction[buff.level-1]);
    }

    dmg = setInRange(dmg,1,Infinity);

    let diff = unit.btd.def[0] - dmg;
    if(diff<0){ // 破防，掉血
        defPain = unit.btd.def[0];
        hpPain = -diff;
    }
    else{
        defPain = dmg;
    }
    res = { defPain, hpPain, };
    return res;
}
export function calcCure({caster,target,data,}){ // 计算治疗值 data={h:100,rx:35}
    let res = 0;
    res += data.h;
    res += cl(calcIntDeno(caster)*data.rx/100);

    // 止痛bufff
    let relieveBuff = getBuff(target,1);
    if(relieveBuff&&res>0){
        res = cl(res*relieveBuff.construction[relieveBuff.level-1]);
    }

    // 剧痛bufff
    let acheBuff = getBuff(target,104);
    if(acheBuff&&res>0){
        res = cl(res*acheBuff.construction[acheBuff.level-1]);
    }

    res = setInRange(res,1,Infinity);

    return res;
}
export function calcPotencyAlteration({target,data,}){ // 计算潜能增减值 data={d:100,rx:35}
    let res = 0,buff;
    res += data.d;

    // 如果是提高潜能的增益效果
    if(data.d>0){
        res += cl(target.btd.attrs[10]/CONFIG.ptcDeno*data.rx/100*.075);
        // 涣散bufff
        if(buff=getBuff(target,106)){
            res = cl(res*buff.construction[buff.level-1]);
        }
    }

    return res;
}
export function calcMentalAlteration({caster,target,data,}){ // 计算心理伤害增减值 data={d:100,rx1:35,rx2:0}
    let res = 0,buff;
    res += data.d;
    if(data.d<0){ // 削减心理防御
        let mdmg = calcIntDeno(caster)*data.rx2/100*1000; // 计算 caster 的智力补正攻击力
        let mdef = target.btd.attrs[8]/CONFIG.intDeno; // 计算 target 的定力补正防御力
        res -= cl(mdmg*(1-mdef));

        // 迷惑bufff
        if(buff=getBuff(target,120)){
            res = cl(res*buff.construction[buff.level-1]);
        }

    }
    else{ // 提升心理防御
        res += cl(target.btd.attrs[8]/CONFIG.intDeno*data.rx1/100*20); //  计算 target 的定力补正
    }
    return res;
}
export function calcDodgeAlteration({target,data,}){ // 计算存在感伤害增减值 data={d:100,rx:35}
    let res = 0,buff;
    if(data.d>0){ // 减益
        res = data.d;
    }
    else{ // 增益
        res = -cl(1000+calcDodgeRate(target.btd.attrs[9])*data.rx/100*2.5*10000);
        // 暴露bufff
        if(buff=getBuff(target,107)){
            res = 0;
        }
    }
    return res;
}
function calcIntDeno(unit){ // 计算智力补正系数
    let res = 0,buff;
    res = unit.btd.attrs[7]/CONFIG.intDeno;

    // 失智bufff
    if(buff=getBuff(unit,121)){
        res = res*buff.construction[buff.level-1];
    }

    return res;
}

/* 基础操作 */
export function calcBreathValue({caster,}){ // 计算调息恢复的体力
    let res = 0,buff;
    res = caster.btd.phy[1] - caster.btd.phy[0];

    // 缺氧bufff
    if(buff=getBuff(caster,110)){
        res = cl(res*buff.construction[buff.level-1]);
    }

    // 如果心理崩溃，则最多恢复1点
    if(isCrumble(caster)){
        res = setInRange(res,0,1);
    }

    return res;
}
export function calcConcentrate({caster,}){ // 计算集气值
    let res = 0,buff;
    res += cl(caster.btd.attrs[10]/CONFIG.ptcDeno*1250);

    res = cl(res*1000/(res+1000));

    // 涣散bufff
    if(buff=getBuff(caster,106)){
        res = cl(res*buff.construction[buff.level-1]);
    }

    return res;
}
export function calcPersuade({caster,target,}){ // 计算话术值
    let res = 0,buff;
    let mdmg = calcIntDeno(caster)*250;
    let mdef = target.btd.attrs[8]/CONFIG.intDeno;
    res += cl(mdmg*(1-mdef));

    // 迷惑bufff
    if(buff=getBuff(target,120)){
        res = cl(res*buff.construction[buff.level-1]);
    }

    res = setInRange(res,1,Infinity);
    return res;
}
export function calcDodge({caster,}){ // 计算躲避值
    let res = 0,buff;
    res += cl(1000+calcDodgeRate(caster.btd.attrs[9])*2.5*2000);

    // 暴露bufff
    if(buff=getBuff(caster,107)){
        res = 0;
    }

    return res;
}
export function calcDef({caster,}){ // 计算防御力恢复值
    let res = 0,buff;
    res = caster.btd.def[1];

    // 失衡bufff
    if(buff=getBuff(caster,109)){
        res = cl(res*buff.construction[buff.level-1]);
    }

    return res;
}
export function calcPotencyByConsume({unit,consume,}){ // 日常体力消耗带来的潜能增长
    let res = 0,buff;
    res = cl(consume*50*unit.btd.attrs[10]/CONFIG.ptcDeno);

    // 涣散bufff
    if(buff=getBuff(unit,106)){
        res = cl(res*buff.construction[buff.level-1]);
    }

    return res;
}
export function calcDefRecover({unit,}){ // 计算单位回合开始前的防御回升
    let res = 0, btd = unit.btd, buff;
    res = Math.round(btd.def[1]*btd.hp[0]/btd.hp[1]*CONFIG.defAutoRecoverFactor);

    // 失衡bufff
    if(buff=getBuff(unit,109)){
        res = 0;
    }

    return res;
}

/* sp攻击特效 */
function hurtRate(unit){ // 获取一个单位的血量损耗程度
    return (1-unit.btd.hp[0]/unit.btd.hp[1])+0.5;
}
export function calcQuellSpDmg({caster,target,attack,dmg,}){ // 计算压制带来的行动力减值
    let res = 0;
    let dmgRate = dmg/target.btd.hp[0];
    dmgRate = setInRange(dmgRate,0,1);
    res = cl(dmgRate*CONFIG.spLevelMap[0][attack.sl-1]+500);
    return res;
}
export function calcPotencySpDmg({target,attack,dmg,}){ // 计算气溃带来的潜能减值
    let res = 0;
    let dmgRate = dmg/target.btd.hp[0];
    let hr = hurtRate(target);
    dmgRate = setInRange(dmgRate,0,1);
    res = cl(dmgRate*CONFIG.spLevelMap[2][attack.sl-1]*hr+300);
    return res;
}
export function calcEnergySpDmg({target,attack,}){ // 计算精溃带来的精力减值
    let res = 0;
    let hr = hurtRate(target);
    res = cl(CONFIG.spLevelMap[3][attack.sl-1]*hr);
    return res;
}
export function calcMentalSpDmg({caster,target,dmg,}){ // 计算攻心带来的心理伤害
    let res = 0,buff;
    let hr = hurtRate(target);
    res = cl(calcIntDeno(caster)*dmg*hr);

    // 迷惑bufff
    if(buff=getBuff(target,120)){
        res = cl(res*buff.construction[buff.level-1]);
    }

    return res;
}
export function calcGoldSpDmg({target,attack,dmg,}){ // 计算偷窃带来的金币伤害
    let res = 0;
    let hr = hurtRate(target);
    res = cl(CONFIG.spLevelMap[6][attack.sl-1]*dmg/1000*hr);
    return res;
}

/* buff效果 */
function calcCommonBuff({buff,}){ // 通用bufff计算方式
    let res = 0;
    res = buff.construction[buff.level-1];
    return res;
}
export function calcPotencyBuff({caster,buff,}){ // 蓄能bufff
    let res = 0;
    res = cl(caster.btd.attrs[10]/CONFIG.ptcDeno*5*buff.construction[buff.level-1]);
    return res;
}
export function calcStealBuff({buff,}){ // 财迷bufff
    return calcCommonBuff({buff,});
}
export function calcPoseBuff({target,buff,}){ // 架势bufff
    let res = 0, rate = buff.construction[buff.level-1];
    res = cl(target.btd.def[1]*rate);
    return res;
}
export function calcAuraBuff({target,buff,}){ // 内息bufff
    let res = 0, rate = buff.construction[buff.level-1];
    res = cl(target.btd.phy[1]*rate);
    return res;
}
export function calcRageBuff({buff,}){ // 狂暴bufff
    return calcCommonBuff({buff,});
}
export function calcRebounceBuff({dmg,buff,}){ // 反伤bufff
    let res = 0;
    res = cl(dmg*buff.construction[buff.level-1]);
    return res;
}
export function calcDrainingBuff({dmg,buff,}){ // 嗜血bufff
    let res = 0;
    res = cl(dmg*buff.construction[buff.level-1]);
    return res;
}
export function calcExcitedBuff({buff,}){ // 亢奋bufff
    return calcCommonBuff({buff,});
}
export function calcHideBuff({caster,buff,}){ // 隐匿bufff
    let res = 0;
    res = cl(caster.btd.attrs[9]/CONFIG.dodgeDeno*5*buff.construction[buff.level-1]);
    return res;
}
export function calcMoraleBuff({buff,}){ // 战气bufff
    return calcCommonBuff({buff,});
}
export function calcAweBuff({buff,}){ // 霸气bufff
    return calcCommonBuff({buff,});
}
export function calcMenaceBuff({caster,buff,}){ // 威慑bufff
    let res = 0;
    res = cl(calcIntDeno(caster)*5*buff.construction[buff.level-1]);
    return res;
}
export function calcFocusBuff({dmg,buff,}){ // 专注bufff
    let res = 0;
    res = cl(dmg*buff.construction[buff.level-1]);
    return res;
}
export function calcHealBuff({caster,buff,}){ // 疗愈bufff
    let res = 0, rate = buff.construction[buff.level-1];
    res = cl(caster.btd.hp[1]*rate);
    return res;
}
export function calcBleedBuff({caster,buff,}){ // 出血bufff
    let res = 0, rate = buff.construction[buff.level-1];
    res = cl(5+caster.btd.hp[0]*rate);
    return res;
}
export function calcBountyBuff({dmg,buff,}){ // 悬赏bufff
    let res = 0;
    res = cl(dmg*buff.construction[buff.level-1]);
    return res;
}
export function calcOpeningBuff({caster,buff,}){ // 破绽bufff
    let res = 0, rate = buff.construction[buff.level-1];
    res = cl(caster.btd.def[1]*rate);
    return res;
}
export function calcKiBreakBuff({buff,}){ // 破气bufff
    return calcCommonBuff({buff,});
}
export function calcFearBuff({buff,}){ // 恐惧bufff
    return calcCommonBuff({buff,});
}
export function calcHasteBuff({buff,}){ // 促息bufff
    return calcCommonBuff({buff,});
}
export function calcParalysisBuff({buff,}){ // 麻痹bufff
    return calcCommonBuff({buff,});
}
export function calcFixPoisonBuff({buff,}){ // 干毒bufff
    return calcCommonBuff({buff,});
}
export function calcPctPoisonBuff({caster,buff,}){ // 湿毒bufff
    let res = 0, rate = buff.construction[buff.level-1];
    res = cl(caster.btd.hp[0]*rate);
    return res;
}

export function calcEnviorDamage(roundCount){ // 计算战意流失 @返回 mentalDmg造成的心理伤害值，eDmgCount第几次战意流失，happen是否触发
    let res = {
        eDmgCount: 0,
        mentalDmg: 0,
        happen: false,
    };
    const itv = CONFIG.enviorDamageInterval;
    const baseDmg = CONFIG.enviorDamageBase;

    if(roundCount>0&&(roundCount%itv==0)){
        res.eDmgCount = Math.floor(roundCount/itv);
        res.mentalDmg = Math.pow(2,res.eDmgCount-1)*baseDmg;
        res.happen = true;
    }

    return res;
}

export function getBuff(unit,id,){ // 根据 buffId 获取单位当前的 buff
    let res;
    res = cloneObj(getMatchList(unit.btd.buffList,[['id',id]])[0]||{});
    if(res.id){
        return res;
    }
    else{
        return null;
    }
}
export function getConfigBuff(buffId){ // 获取buff原始数据
    let buffList = [...CONFIG.goodBuffs,...CONFIG.badBuffs];
    return cloneObj(getMatchList(buffList,[['id',buffId]])[0]);
}
export function addBuffTo({buffId,buffLevel,unit,}){ // 给单位添加buff
    let btd = unit.btd;
    let newBuff = getConfigBuff(buffId);
    newBuff.level = buffLevel;
    let oBuff = getMatchList(btd.buffList,[['id',newBuff.id]])[0];
    if(!oBuff){ // 如果没有该类型buff
        btd.buffList.push(newBuff);
    }
    else if(oBuff&&(oBuff.level<newBuff.level)){ // 如果已有该类型buff，但旧 buff 的等级低于新 buff
        oBuff.level = newBuff.level;
    }
}
export function weakenBuffFrom({buffId,buffLevel,unit,}){ // 削减单位的buff
    let btd = unit.btd;
    let removeBuff;
    for(let buff of btd.buffList){
        if(buff.id==buffId){
            buff.level -= buffLevel;
            if(buff.level<=0){
                removeBuff = buff;
            }
        }
    }
    if(removeBuff&&removeBuff.id){ // 如果状态的强度等级<=0，则直接从单位身上删除这个状态
        btd.buffList = removeFromList(removeBuff.id,'id',btd.buffList);
    }
}

export function calcAttackDodgeup({unit,}){ // 计算攻击时的存在感上升值
    let res = 0;
    let rate = 1-calcDodgeRate(unit.btd.attrs[9]);

    // 潜行bufff
    if(getBuff(unit,6)){
        return res;
    }

    let suffixReduction = (1000-unit.btd.attrs[9]);
    suffixReduction = setInRange(suffixReduction,0,Infinity);
    for(let weapon of unit.btd.weaponList){
        res += weapon.d;
    }
    res = cl(res*rate+suffixReduction);
    return res;
}
export function calcSkillDodgeup({unit,skill,}){ // 计算发动技能时的存在感上升值
    let res = 0;
    let rate = 1-calcDodgeRate(unit.btd.attrs[9]);

    // 潜行bufff
    if(getBuff(unit,6)){
        return res;
    }

    let suffixReduction = (1000-unit.btd.attrs[9]);
    suffixReduction = setInRange(suffixReduction,0,Infinity);
    res = cl(skill.d*rate+suffixReduction);
    return res;
}
export function calcPersuadeDodgeup({unit,}){ // 计算攻心时的存在感上升值
    let res = 0;
    let rate = 1-calcDodgeRate(unit.btd.attrs[9]);

    // 潜行bufff
    if(getBuff(unit,6)){
        return res;
    }

    res = cl(CONFIG.persuadeDodgeup*rate);
    return res;
}

function saveChanges(unit,changesName){
    let btd = unit.btd;
    let changes = btd[changesName];
    let val = 0;
    if(changes.hp!=0){ // 血
        val = changes.hp;
        btd.hp[0] += val;
        btd.alive = btd.hp[0]>0;
    }
    if(changes.def!=0){ // 防御
        val = changes.def;
        btd.def[0] += val;
    }
    if(changes.eng!=0){ // 精力
        val = changes.eng;
        btd.eng[0] += val;
    }
    if(changes.phy!=0){ // 体力
        val = changes.phy;
        btd.phy[0] += val;
    }
    if(changes.dge!=0){ // 存在感
        val = changes.dge;
        btd.dge += val;
    }
    if(changes.mov!=0){ // 行动力
        val = changes.mov;
        btd.mov += val;
    }
    if(changes.ptc!=0){ // 潜能
        val = changes.ptc;
        btd.ptc += val;
    }
    if(changes.mdef!=0){ // 心理防御
        val = changes.mdef;
        btd.mdef += val;
    }
    if(changes.money!=0){ // 金币
        val = changes.money;
        btd.money += val;
    }

    btd.hp[0] = setInRange(btd.hp[0],0,btd.hp[1]);
    btd.def[0] = setInRange(btd.def[0],0,btd.def[1]);
    btd.eng[0] = setInRange(btd.eng[0],0,btd.eng[1]);
    btd.phy[0] = setInRange(btd.phy[0],0,btd.phy[1]);
    btd.dge = setInRange(btd.dge,0,10000);
    btd.mov = setInRange(btd.mov,0,10000);
    btd.ptc = setInRange(btd.ptc,0,10000);
    btd.mdef = setInRange(btd.mdef,-999999,999999);
    btd.money = setInRange(btd.money,0,999999);

    if(btd.alive){
        // 添加 buff
        if(changes.buffList&&changes.buffList.length>0){
            for(let buff of changes.buffList){
                addBuffTo({buffId:buff.id,buffLevel:buff.level,unit,});
            }
        }
        // 削减 buff
        if(changes.weakenBuff){
            weakenBuffFrom({buffId:changes.weakenBuff.id,buffLevel:changes.weakenBuff.level,unit});
        }
    }
    // console.log(btd.name, JSON.stringify(changes));
}
export function saveUnitChanges(unit){ // 结算 changes，即根据 changes 获得改变后的 unit 数据
    saveChanges(unit,'changes');
}
export function saveUnitFollowChanges(unit){ // 结算 followChanges，即根据 followChanges 获得改变后的 unit 数据
    saveChanges(unit,'followChanges');
}

/* ---------------------------- 其他 ---------------------------- */
export function _q(){ // ???
    let res;
    return res;
}

















//

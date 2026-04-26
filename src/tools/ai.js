import { DEBUG, CONFIG } from '../config/config';
import { query, r, rr, cl, avg, exptr, setInRange, bulbsort, cloneObj, shuffle, getParentNode, getMatchList, getSubMatchList, removeFromList, arrContains, removeFromNumberList, } from '../tools/utils';
import * as common from '../tools/common';
import * as NAMES from '../tools/namestock';

const ACTION_TYPE_NAMES = [`攻击`,`技能`,`防御`,`躲避`,`追踪`,`调息`,`集气`,`爆气`,`话术`,];
const BURST_NAMES = [`力量`,`精准`,`速度`,`智力`,`定力`,`隐蔽`,`爆发`,];

export function getWeakenBuff({caster,target,buffList,reduceLevel=0}){ // 选择要削减强度的buff
    let res;
    let copyBuffList = cloneObj(buffList);
    let scoreBuffList = [];

    for(let i=0;i<copyBuffList.length;i++){
        let buff = copyBuffList[i];
        let newScoreBuff = cloneObj(buff);
        newScoreBuff.score = reduceLevel;
        if(buff.level<newScoreBuff.score){
            newScoreBuff.score = buff.level;
        }
        scoreBuffList.push(newScoreBuff);
    }

    scoreBuffList = bulbsort(scoreBuffList,'score',);

    res = getMatchList(buffList,[['id',scoreBuffList[0].id]])[0];
    return res;
}

export function genAction({unit,meTeam,youTeam,isFleeing,}){ // 生成 AI 动作
    /*
        返回 { caster, type, targetUnitList, burstAttr, skill, attack, score, consume, }
        type: 1, // 动作类型 1攻击 2技能 3防御 4躲避 5追踪 6调息 7集气 8爆气 9话术
        burstAttr: 1, // 4力量 5精准 6速度 7智力 8定力 9隐蔽 10爆发
        score: 105, // 动作的执行价值，越高越倾向于执行
    */
    let res = {};

    let copyUnit = cloneObj(unit);
    let copyAliveYouTeam = cloneObj(getSubMatchList(youTeam,[['out',0]],'btd'));
    let copyAliveMeTeam = cloneObj(getSubMatchList(meTeam,[['out',0]],'btd'));

    let actionList = getActionList({copyUnit,copyAliveYouTeam,copyAliveMeTeam,});

    for(let action of actionList){
        action.score = calcActionScore({action,isFleeing,copyAliveYouTeam,copyAliveMeTeam,});
    }

    // 从所有可执行的行动中选择一个
    actionList = bulbsort(actionList,'score',);

    let minRange = 1;
    let firstActionScore = actionList[0].score;
    for(let i=1;i<actionList.length;i++){
        let action = actionList[i];
        if(action.score>=firstActionScore*.35){
            minRange += 1;
        }
        else{
            break;
        }
    }
    res = actionList[r(0,minRange-1)];

    // console.log(actionList);
    // console.log(res,attackActionList);
    // let actionDesc = getActionDesc(res);
    // if(unit.id==14){
    //     for(let action of actionList){
    //         console.log(getActionDesc(action));
    //     }
    //     console.log(`============================================================================`);
    // }

    return res;
}

function getActionList({copyUnit,copyAliveMeTeam,copyAliveYouTeam,}){ // 获得可执行的动作数组
    let actionList;
    let attackActionList = [], skillActionList = [], defAction, dodgeAction, traceAction, breathAction, concentrateAction, burstActionList = [], persuadeActionList = [];
    let consume;

    let cbtd = copyUnit.btd;
    let myAttackList = [cbtd.defaultAttack];
    let mySkillList = cbtd.skillList;

    // 生成 myAttackList
    for(let weapon of cbtd.weaponList){
        for(let attack of weapon.k){
            myAttackList.push(attack);
        }
    }

    // 生成攻击行动数组
    for(let attack of myAttackList){
        consume = common.calcConsume({type:1,unit:copyUnit,data:attack}); // 本攻击的消耗
        if(common.canConsume({unit:copyUnit,consume,})){ // 如果体力足够
            if(attack.a){ // 全体攻击
                let newAttackAction = { caster:copyUnit, type:1, targetUnitList:copyAliveYouTeam, attack, score:0, consume, };
                attackActionList.push(newAttackAction);
            }
            else{ // 单体攻击
                for(let youUnit of copyAliveYouTeam){
                    let newAttackAction = { caster:copyUnit, type:1, targetUnitList:[youUnit], attack, score:0, consume, };
                    attackActionList.push(newAttackAction);
                }
            }
        }
    }

    // 生成技能行动数组
    for(let skill of mySkillList){
        consume = common.calcConsume({type:2,unit:copyUnit,data:skill}); // 本技能的消耗
        if(common.canConsume({unit:copyUnit,consume,})){ // 如果体力足够
            if(skill.t==1){ // 目标为自己
                let newSkillAction = { caster:copyUnit, type:2, targetUnitList:[copyUnit], skill, score:0, consume, };
                skillActionList.push(newSkillAction);
            }
            else if(skill.t==2){ // 目标为友方单体
                for(let youUnit of copyAliveMeTeam){
                    if(youUnit.id!=copyUnit.id){
                        let newSkillAction = { caster:copyUnit, type:2, targetUnitList:[youUnit], skill, score:0, consume, };
                        skillActionList.push(newSkillAction);
                    }
                }
            }
            else if(skill.t==3){ // 目标为敌方单体
                for(let youUnit of copyAliveYouTeam){
                    let newSkillAction = { caster:copyUnit, type:2, targetUnitList:[youUnit], skill, score:0, consume, };
                    skillActionList.push(newSkillAction);
                }
            }
        }
    }

    // 生成防御行动
    consume = common.calcConsume({type:3,unit:copyUnit,}); // 防御的消耗
    if(!common.isCrumble(copyUnit)&&common.canConsume({unit:copyUnit,consume,})){ // 若单位未崩溃，同时体力足够
        defAction = { caster:copyUnit, type:3, score:0, consume, };
    }

    // 生成躲避行动
    consume = common.calcConsume({type:4,unit:copyUnit,}); // 躲避的消耗
    if(!common.isCrumble(copyUnit)&&common.canConsume({unit:copyUnit,consume,})){ // 若单位未崩溃，同时体力足够
        dodgeAction = { caster:copyUnit, type:4, score:0, consume, };
    }

    // 生成追踪行动
    consume = common.calcConsume({type:5,unit:copyUnit,}); // 追踪的消耗
    if(common.canConsume({unit:copyUnit,consume,})){ // 若单位体力足够
        traceAction = { caster:copyUnit, type:5, score:0, consume, };
    }

    // 生成调息行动
    consume = common.calcConsume({type:6,unit:copyUnit,}); // 调息的消耗
    if(common.canConsume({unit:copyUnit,consume,})){ // 若单位体力足够
        breathAction = { caster:copyUnit, type:6, score:0, consume, };
    }

    // 生成集气行动
    consume = common.calcConsume({type:7,unit:copyUnit,}); // 集气的消耗
    if(common.canConsume({unit:copyUnit,consume,})){ // 若单位体力足够
        concentrateAction = { caster:copyUnit, type:7, score:0, consume, };
    }

    // 生成爆气行动
    consume = common.calcConsume({type:8,unit:copyUnit,}); // 爆气的消耗
    if(common.canConsume({unit:copyUnit,consume,})){ // 若单位体力足够
        for(let i=4;i<11;i++){
            let newBurstAction = { caster:copyUnit, type:8, score:0, consume, burstAttr:i, };
            burstActionList.push(newBurstAction);
        }
    }

    // 生成话术行动
    consume = common.calcConsume({type:9,unit:copyUnit,}); // 话术的消耗
    if(!common.isCrumble(copyUnit)&&common.canConsume({unit:copyUnit,consume,})){ // 若单位未崩溃，同时体力足够
        for(let youUnit of copyAliveYouTeam){
            let newPersuadeAction = { caster:copyUnit, type:9, score:0, consume, targetUnitList:[youUnit], };
            persuadeActionList.push(newPersuadeAction);
        }
    }

    // 集成所有行动
    actionList = [
        ...burstActionList,
        ...persuadeActionList,
        ...attackActionList,
        ...skillActionList,
    ];
    if(breathAction){
        actionList.push(breathAction);
    }
    if(defAction){
        actionList.push(defAction);
    }
    if(traceAction){
        actionList.push(traceAction);
    }
    if(dodgeAction){
        actionList.push(dodgeAction);
    }
    if(concentrateAction){
        actionList.push(concentrateAction);
    }

    // 至少可以调息
    // actionList.push({
    //     caster: copyUnit,
    //     type: 6,
    //     score: 0,
    //     consume: 0,
    // });

    return actionList;
}
function calcActionScore({action,isFleeing,copyAliveYouTeam,}){ // 计算一个 action 的分数
    /*
        action = { caster, type, targetUnitList, burstAttr, skill, attack, score, consume, }
        type: 1, // 动作类型 1攻击 2技能 3防御 4躲避 5追踪 6调息 7集气 8爆气 9话术
        burstAttr: 1, // 4力量 5精准 6速度 7智力 8定力 9隐蔽 10爆发
        score: 105, // 动作的执行价值，越高越倾向于执行
    */
    let score = 0;
    let { caster, targetUnitList, attack, consume, burstAttr, } = action;
    let btd = caster.btd;

    if(action.type==1){ // 攻击
        score = calcAttackScore(action,isFleeing);
    }
    else if(action.type==2){ // 技能
        score = calcSkillScore(action,isFleeing);
    }
    else if(action.type==3&&!isFleeing){ // 防御
        let defDiff = btd.def[1]-btd.def[0];
        let defRatio = btd.def[0]/btd.def[1];
        let hpRatio = btd.hp[0]/btd.hp[1];

        score = defDiff*(1-defRatio)*(2-hpRatio)*1.05;
    }
    else if(action.type==4&&!isFleeing){ // 躲避
        let hpRatio = btd.hp[0]/btd.hp[1];
        let dodgeReduction = common.calcDodge({caster,});
        dodgeReduction = setInRange(dodgeReduction,0,btd.dge);

        score = (dodgeReduction/10000)*(1.2-hpRatio)*scoreFactor(caster)*5;
    }
    else if(action.type==5){ // 追踪
        let traceScore = 0;
        let expList = getExplosiveTargetList(copyAliveYouTeam);
        for(let target of expList){
            let hr = hitRate(target);
            let tValue = 115*(1-hr*hr);
            traceScore += tValue/expList.length;
        }

        score = traceScore;

        if(isFleeing){ // 敌人正在逃跑
            score *= 5;
        }
    }
    else if(action.type==6){ // 调息
        let phyRecover = common.calcBreathValue({caster,});
        let phyRatio = btd.phy[0]/btd.phy[1];
        let engRatio = btd.eng[0]/btd.eng[1];
        if(phyRatio<.85){
            score = phyRecover*(1-phyRatio)*(2-engRatio*engRatio);
        }
        if(phyRecover==1){ // 心理奔溃
            score = 1;
        }
    }
    else if(action.type==7&&!isFleeing){ // 集气
        score = btd.attrs[10]/10;
    }
    else if(action.type==8&&!isFleeing){ // 爆气
        let ptcRatio = btd.ptc/10000;
        let attrVal = btd.attrs[burstAttr];
        let otherAttrTotal = 0; // 其他属性的总和
        for(let i=4;i<=10;i++){
            if(i!=burstAttr&&i!=8&&i!=7){
                otherAttrTotal += btd.attrs[i];
            }
        }
        if(ptcRatio>.01&&burstAttr!=7&&burstAttr!=8&&attrVal<(otherAttrTotal*2)){
            score = ((ptcRatio+1)*ptcRatio)*scoreFactor(caster)*attrVal*.01;
        }
    }
    else if(action.type==9){ // 话术
        let target = targetUnitList[0];
        let hr = hitRate(target);
        if(hr>.5){
            let mentalDmg = common.calcPersuade({caster,target,});
            let mentalDmgRatio = mentalDmg/target.btd.mdef;
            let mentalScore = mentalDmg*mentalDmgRatio*10*hr;
            if(mentalScore>0){
                score = mentalScore;
            }
        }
    }
    return cl(score);
}

function getActionDesc(action){
    let res = ``;
    res += `${action.score} - `;
    res += `${action.caster.btd.name}【${ACTION_TYPE_NAMES[action.type-1]}`;
    if(action.type==1){
        res += `:${action.attack.n}`;
    }
    else if(action.type==2){
        res += `:${action.skill.n}！`;
    }
    else if(action.burstAttr){
        res += `:${BURST_NAMES[action.burstAttr-4]}`;
    }
    res += `（${action.consume}）】`;
    if(action.targetUnitList&&action.targetUnitList.length>0){
        res += `：`;
        for(let i=0;i<action.targetUnitList.length;i++){
            let target = action.targetUnitList[i];
            res += target.btd.name;
            if(i<action.targetUnitList.length-1){
                res += `，`;
            }
        }
    }
    return res;
}
function hitRate(unit){ // 获得命中率
    return unit.btd.dge/10000;
}
function scoreFactor(unit){ // 获取单位的战斗价值系数
    return unit.btd.score*.0035;
}
function checkOverflow(unit,consume,score){ // 消耗过载 @返回 执行完成后的score
    let res = score;
    let overflowConsume = consume - unit.btd.phy[0];
    if(overflowConsume>0){ // 消耗过载
        res = score*(1-overflowConsume/unit.btd.eng[0]);
    }
    return res;
}
function getExplosiveTargetList(targetUnitList){ // 获取最醒目的敌方单位数组
    let res = [];
    let maxUnit = {btd:{dge:0}};
    for(let target of targetUnitList){
        if(maxUnit.btd.dge<target.btd.dge){
            maxUnit = target;
        }
    }
    for(let target of targetUnitList){
        if(target.btd.dge==maxUnit.btd.dge){
            res.push(target);
        }
    }
    return res;
}

function calcAttackScore(action,isFleeing,){ // 计算攻击行动的分数
    let res = 0;
    let { caster, targetUnitList, attack, consume, } = action;
    let btd = caster.btd;

    let singleDmg = common.calcAttackDmg({caster,attack,});
    let totalDmgScore = 0; // 期望总伤害分数
    for(let target of targetUnitList){
        let dodgeRatio = hitRate(target); // 0-1
        let targetAttackScore = 0;
        let { defPain, hpPain,} = common.calcPain({unit:target,dmg:singleDmg,});
        if(attack.s==5){ // 锁敌SP
            dodgeRatio += .01;
        }
        if(dodgeRatio>.3||attack.s==5){
            let buffFactor = 0;
            if(hpPain>0){ // 如果可以上buff
                for(let i=0;i<attack.bl.length;i++){
                    let dupBuff = getMatchList(target.btd.buffList,[['id',attack.b[i]]])[0];
                    if(!dupBuff){
                        buffFactor += attack.bl[i];
                    }
                }
            }
            buffFactor = 1+buffFactor/5;
            targetAttackScore += defPain*.5;
            targetAttackScore += hpPain*5*buffFactor*(hpPain/target.btd.hp[0]);
            targetAttackScore *= Math.sqrt(dodgeRatio);
            totalDmgScore += targetAttackScore;
        }
    }

    res = totalDmgScore;

    res = checkOverflow(caster,consume,res);

    if(isFleeing){ // 敌人正在逃跑
        res *= 5;
    }

    return res;
}
function calcSkillScore(action,isFleeing,){ // 计算技能行动的分数
    let score = 0;
    let { caster, targetUnitList, skill, consume, } = action;
    let target = targetUnitList[0];
    let dodgeRatio = hitRate(target); // 0-1
    let consumeFactor = 1-consume/(caster.btd.phy[0]+caster.btd.eng[0]);

    for(let effect of skill.el){
        let { t, d, } = effect;
        // console.log(caster.btd.name,skill.n,targetUnitList[0].btd.name,effect)
        if(t==1){ // 攻击
            let attack = d;
            let targetAttackScore = 0;
            let singleDmg = common.calcAttackDmg({caster,attack,});
            let { defPain, hpPain,} = common.calcPain({unit:target,dmg:singleDmg,});
            if(dodgeRatio>.4){
                targetAttackScore += defPain*.5;
                targetAttackScore += hpPain*5*(hpPain/target.btd.hp[0]);
                targetAttackScore *= Math.sqrt(dodgeRatio);
                targetAttackScore *= consumeFactor;
                if(isFleeing){ // 敌人正在逃跑
                    targetAttackScore *= 2;
                }
                score += targetAttackScore;
            }
        }
        else if(t==2){ // 添加状态
            let { b, bl, } = d;
            let targetBuffList = target.btd.buffList;
            if(dodgeRatio>.5){
                for(let i=0;i<b.length;i++){ // 遍历每个buff
                    let buffLevelDiff = 0; // buff的等级差
                    let dupBuff = getMatchList(targetBuffList,[['id',b[i]]])[0];
                    if(dupBuff){ // 如果有重复的buff
                        buffLevelDiff = bl[i]-dupBuff.level;
                    }
                    else{
                        buffLevelDiff = bl[i];
                    }
                    if(buffLevelDiff<0){
                        buffLevelDiff = 0;
                    }
                    score += buffLevelDiff*(target.btd.hp[1]+target.btd.def[1])*.3*dodgeRatio*consumeFactor;
                }
            }
        }
        else if(t==3||t==4){ // 减弱一个增益状态&削减一个减益状态
            let targetBuffList = getMatchList(target.btd.buffList,[['good',t==3?1:0]]);
            let reduceBuffScoreList = [];
            if(dodgeRatio>.7){
                for(let buff of targetBuffList){
                    let buffLevelDiff; // 能够削减的强度数值
                    if(buff.level<d){
                        buffLevelDiff = buff.level;
                    }
                    else{
                        buffLevelDiff = d;
                    }
                    reduceBuffScoreList.push({
                        score: buffLevelDiff*(target.btd.hp[0]+target.btd.def[0])*.38*Math.sqrt(dodgeRatio),
                        ...buff,
                    });
                }
                let redScore = avg(reduceBuffScoreList,'score')*consumeFactor;
                score += redScore;
            }
        }
        else if(t==5){ // 恢复生命
            let cureVolumn = common.calcCure({caster,target,data:d,});
            if(cureVolumn+target.btd.hp[0]>target.btd.hp[1]){
                cureVolumn = target.btd.hp[1]-target.btd.hp[0];
            }
            score += cureVolumn*5*consumeFactor;
        }
        else if(t==7){ // 改变潜能
            let ptcDmg = common.calcPotencyAlteration({target,data:d,});
            if(ptcDmg<0){ // 削减潜能
                ptcDmg = setInRange(ptcDmg,-target.btd.ptc,0);
            }
            else{ // 提升潜能
                ptcDmg = setInRange(ptcDmg,0,10000-target.btd.ptc);
            }
            score += (Math.abs(ptcDmg)*.45+target.btd.attrs[10]*.2)*dodgeRatio*consumeFactor;
        }
        else if(t==8){ // 改变心防
            let mentalAlt = common.calcMentalAlteration({caster,target,data:d,});
            let emergencyVolumn = 0; // 紧急补充值
            if(mentalAlt<0){ // 削减心防
                mentalAlt = -mentalAlt;
                if(target.btd.mdef>mentalAlt){
                    emergencyVolumn = mentalAlt*mentalAlt/target.btd.mdef;
                }
            }
            else{ // 提升心防
                if(target.btd.mdef<mentalAlt){
                    emergencyVolumn = (mentalAlt-target.btd.mdef)*1.35;
                }
            }
            score += (mentalAlt+emergencyVolumn)*dodgeRatio*consumeFactor;
        }
        else if(t==9){ // 改变存在感
            let dodgeAlt = common.calcDodgeAlteration({target,data:d,});
            let hr = hitRate(target);
            let factor = scoreFactor(target);
            let volumn = 0;
            if(dodgeAlt>0){ // 提升存在感
                volumn += 150*(1-hr);
            }
            else{ // 减少存在感
                volumn += 4*hr;
                dodgeAlt = -dodgeAlt;
            }
            score += volumn*(dodgeAlt*.0001)*factor*consumeFactor;
        }
    }

    score = checkOverflow(caster,consume,score);

    return score;
}





























//

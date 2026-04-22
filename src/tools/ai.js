import { DEBUG, CONFIG } from '../config/config';
import { query, r, rr, exptr, setInRange, bulbsort, cloneObj, shuffle, getParentNode, getMatchList, getSubMatchList, removeFromList, arrContains, removeFromNumberList, } from '../tools/utils';
import * as common from '../tools/common';
import * as NAMES from '../tools/namestock';

const ACTION_TYPE_NAMES = [`攻击`,`技能`,`防御`,`躲避`,`追踪`,`呼吸`,`集气`,`爆气`,`话术`,];
const BURST_NAMES = [`力量`,`精准`,`速度`,`智力`,`定力`,`隐蔽`,`爆发`,];

export function getWeakenBuff({caster,target,buffList}){ // 选择要削减强度的buff TODO
    let res;
    res = buffList[r(0,buffList.length-1)];
    return res;
}

export function genAction({unit,meTeam,youTeam,}){ // 生成 AI 动作 TODO
    /*
        返回 { caster, type, targetUnitList, burstAttr, skill, attack, score, }
        type: 1, // 动作类型 1攻击 2技能 3防御 4躲避 5追踪 6呼吸 7集气 8爆气 9话术
        burstAttr: 1, // 4力量 5精准 6速度 7智力 8定力 9隐蔽 10爆发
        score: 105, // 动作的执行价值，越高越倾向于执行
    */
    let res = {};

    let copyUnit = cloneObj(unit);
    let copyAliveYouTeam = cloneObj(getSubMatchList(youTeam,[['alive',1]],'btd'));
    let copyAliveMeTeam = cloneObj(getSubMatchList(meTeam,[['alive',1]],'btd'));

    let cbtd = copyUnit.btd;
    let actionList = [];
    let attackActionList = [], skillActionList = [], defAction, dodgeAction, traceAction, breathAction, concentrateAction, burstActionList = [], persuadeActionList = [];
    let consume;

    let myAttackList = [cbtd.defaultAttack];
    let mySkillList = cbtd.skillList;

    for(let weapon of cbtd.weaponList){ // 生成 myAttackList
        for(let attack of weapon.k){
            myAttackList.push(attack);
        }
    }

    // 生成攻击行动数组
    /*{
        n: '挥砍',
        d: 99, // 基础伤害
        r1: 15, // 力量补正
        r2: 7, // 精准补正
        b: [103,105,], // buff制造表（buff id）
        bl: [4,3], // buff等级表（1-9）
        s: 4, // SP效果 1压制 2破盾 3气溃 4精溃 5锁敌 6攻心 7摸金
        sl: 2, // SP效果等级
        a: 0, // 目标是否为全体
        c: 4, // 体力消耗
        et: 1, // 特效类型 1劈砍 2钝击 3子弹 4飞刀 5火炮 6雷击
        sid: 1, // 所属的技能id
        eid: 1, // 所属的武器id
    },*/
    for(let attack of myAttackList){
        consume = common.calcConsume({type:1,unit:copyUnit,data:attack}); // 本攻击的消耗
        if(common.canConsume({unit:copyUnit,consume,})){ // 如果体力足够
            if(attack.a){ // 全体攻击
                let newAttackAction = { caster:copyUnit, type:1, targetUnitList:copyAliveYouTeam, attack, score:0, };
                attackActionList.push(newAttackAction);
            }
            else{ // 单体攻击
                for(let youUnit of copyAliveYouTeam){
                    let newAttackAction = { caster:copyUnit, type:1, targetUnitList:[youUnit], attack, score:0, };
                    attackActionList.push(newAttackAction);
                }
            }
        }
    }

    // 生成技能行动数组
    /*{
        id: 11,
    	l: 1,
    	n: '治愈术',
    	t: 1, // 1自己 2我方单体 3敌方单体
    	el: [{ // 技能效果数组
            t: 3, // 效果类型【 1攻击 2添加状态 3减弱一个增益状态 4削减一个减益状态 5恢复生命 6改变护甲 7改变潜能 8改变心防 9改变存在感】
    		// 攻击方式{...attack}，添加的状态-等级数组{ b:[1,2], bl:[3,4],}，
    		// 固疗和百分疗 { h:100, rx:35, }，心防固伤和智力补正 { d:100, rx1:0, rx2:44, }
    		// 潜能补正 { d:100, rx:35, }，存在感 { d:100, rx:35, }
    		d: 7,
        },],
    	c: 6, // 体力消耗
    	d: 1200, // 存在感
    	v: 133, // 价值
    },*/
    for(let skill of mySkillList){
        consume = common.calcConsume({type:2,unit:copyUnit,data:skill}); // 本技能的消耗
        if(common.canConsume({unit:copyUnit,consume,})){ // 如果体力足够
            if(skill.t==1){ // 目标为自己
                let newSkillAction = { caster:copyUnit, type:2, targetUnitList:[copyUnit], skill, score:0, };
                skillActionList.push(newSkillAction);
            }
            else if(skill.t==2){ // 目标为友方单体
                for(let youUnit of copyAliveMeTeam){
                    if(youUnit.id!=unit.id){
                        let newSkillAction = { caster:copyUnit, type:2, targetUnitList:[youUnit], skill, score:0, };
                        skillActionList.push(newSkillAction);
                    }
                }
            }
            else if(skill.t==3){ // 目标为敌方单体
                for(let youUnit of copyAliveYouTeam){
                    let newSkillAction = { caster:copyUnit, type:2, targetUnitList:[youUnit], skill, score:0, };
                    skillActionList.push(newSkillAction);
                }
            }
        }
    }

    // 生成防御行动
    consume = common.calcConsume({type:3,unit:copyUnit,}); // 防御的消耗
    if(!common.isCrumble(copyUnit)&&common.canConsume({unit:copyUnit,consume,})){ // 若单位未崩溃，同时体力足够
        defAction = { caster:copyUnit, type:3, score:0, };
    }

    // 生成躲避行动
    consume = common.calcConsume({type:4,unit:copyUnit,}); // 躲避的消耗
    if(!common.isCrumble(copyUnit)&&common.canConsume({unit:copyUnit,consume,})){ // 若单位未崩溃，同时体力足够
        dodgeAction = { caster:copyUnit, type:4, score:0, };
    }

    // 生成追踪行动
    consume = common.calcConsume({type:5,unit:copyUnit,}); // 追踪的消耗
    if(common.canConsume({unit:copyUnit,consume,})){ // 若单位体力足够
        traceAction = { caster:copyUnit, type:5, score:0, };
    }

    // 生成呼吸行动
    consume = common.calcConsume({type:6,unit:copyUnit,}); // 呼吸的消耗
    if(common.canConsume({unit:copyUnit,consume,})){ // 若单位体力足够
        breathAction = { caster:copyUnit, type:6, score:0, };
    }

    // 生成集气行动
    consume = common.calcConsume({type:7,unit:copyUnit,}); // 集气的消耗
    if(common.canConsume({unit:copyUnit,consume,})){ // 若单位体力足够
        concentrateAction = { caster:copyUnit, type:7, score:0, };
    }

    // 生成爆气行动
    consume = common.calcConsume({type:8,unit:copyUnit,}); // 爆气的消耗
    if(common.canConsume({unit:copyUnit,consume,})){ // 若单位体力足够
        for(let i=4;i<11;i++){
            let newBurstAction = { caster:copyUnit, type:8, score:0, burstAttr:i, };
            burstActionList.push(newBurstAction);
        }
    }

    // 生成话术行动
    consume = common.calcConsume({type:9,unit:copyUnit,}); // 话术的消耗
    if(!common.isCrumble(copyUnit)&&common.canConsume({unit:copyUnit,consume,})){ // 若单位未崩溃，同时体力足够
        for(let youUnit of copyAliveYouTeam){
            let newPersuadeAction = { caster:copyUnit, type:9, score:0, targetUnitList:[youUnit], };
            persuadeActionList.push(newPersuadeAction);
        }
    }

    // 集成所有行动
    actionList = [
        // ...burstActionList,
        // ...persuadeActionList,
        // ...attackActionList,
        ...skillActionList,
    ];
    if(breathAction){
        actionList.push(breathAction);
    }
    // if(defAction){
    //     actionList.push(defAction);
    // }
    // if(traceAction){
    //     actionList.push(traceAction);
    // }
    // if(dodgeAction){
    //     actionList.push(dodgeAction);
    // }
    // if(concentrateAction){
    //     actionList.push(concentrateAction);
    // }

    // 从所有可执行的行动中选择一个
    console.log(actionList);
    actionList = bulbsort(actionList,'score',);

    let minRange = 9999;
    if(minRange>actionList.length){
        minRange = actionList.length;
    }
    res = actionList[r(0,minRange-1)];

    // console.log(actionList);
    // console.log(res,attackActionList);
    let actionDesc = getActionDesc(res);
    console.log(actionDesc);

    return res;
}

export function getActionDesc(action){
    let res = ``;
    res += `${action.caster.btd.name}执行动作【${ACTION_TYPE_NAMES[action.type-1]}`;
    if(action.type==1){
        res += `:${action.attack.n}`;
    }
    else if(action.type==2){
        res += `:${action.skill.n}`;
    }
    else if(action.burstAttr){
        res += `:${BURST_NAMES[action.burstAttr-4]}`;
    }
    res += `】`;
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





























//

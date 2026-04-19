import { DEBUG, CONFIG } from '../config/config';
import { query, r, rr, exptr, setInRange, bulbsort, cloneObj, shuffle, getParentNode, getMatchList, removeFromList, arrContains, removeFromNumberList, } from '../tools/utils';
import * as NAMES from '../tools/namestock';

export function getWeakenBuff({caster,target,buffList}){ // 选择要削减强度的buff TODO
    let res;
    res = buffList[r(0,buffList.length-1)];
    return res;
}

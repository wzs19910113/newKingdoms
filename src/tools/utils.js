import { DEBUG, CONFIG } from '../config/config';
/*
  获取随机整数
  random(3,8) 的随机区间为 3-8
 */
export function r(min,max){
    return Math.floor(Math.random()*(min-max-1)+max+1);
}
export function exptr(min,max,exp){ // 指数随机
    let v = r(min,max-1);
    return Math.round((v-min)*Math.pow(v/(max-min),exp||1)+min+r(0,1));
}
/*
  冒泡排序
  @Param arr {Array} 要进行排序的数组 [{val:30,...},{val:10,...},{val:20,...},...]
  @Param valname? {String} 索引变量名（默认为'val'）
  @Return arr {Array} 排好序的数组

  Example:
  let oldarr = [{
        vote: 30, id: 'A',
    },{
        vote: 10, id: 'B',
    },{
        vote: 20, id: 'C',
    }];
    let newarr = bulbsort(oldarr,'vote');
 */
export function bulbsort(arr,valname='val',type=1){
    let res = [...arr];
    for(let i=0;i<res.length-1;i++){
        for(let j=0;j<res.length-1-i;j++){
            if(type){
                if((res[j][valname]<res[j+1][valname])){
                    let temp=res[j];
                    res[j] = res[j+1];
                    res[j+1] = temp;
                }
            }
            else{
                if((res[j][valname]>res[j+1][valname])){
                    let temp=res[j];
                    res[j] = res[j+1];
                    res[j+1] = temp;
                }
            }
        }
    }
    return res;
}
/* 随机排序 */
export function shuffle(arr){
    let res = [...arr];
    let len = res.length;
    for(let i=0;i<len-1;i++){
        let index = parseInt(Math.random()*(len-i));
        let temp = res[index];
        res[index] = res[len-i-1];
        res[len-i-1] = temp;
    }
    return res;
}
/*
 获取离元素ele最近的父级 tagname 标签
 */
export function getParentNode(ele,tagname='a'){
    if((ele&&((ele.nodeName||ele.tagName).toUpperCase())===tagname.toUpperCase()||ele.parentNode===null))
        return ele;
    else if(ele)
        return getParentNode(ele.parentNode,tagname);
    return false;
}
export function cloneObj(obj,und){ // 深度复制数据对象
    if(!obj){
        return und;
    }
    let newObj = {};
    if(obj instanceof Array){
       newObj = [];
    }
    for(let key in obj){
       let val = obj[key];
       newObj[key] = typeof val==='object'?cloneObj(val):val;
    }
    return newObj;
    // return JSON.parse(JSON.stringify(obj));
}
/*
 计算文本长度（汉字为2，英文和字符为1）
 */
export function getLength(str) {
    let realLength = 0,
        len = str.length,
        charCode = -1;
    for(let i=0;i<len;i++) {
        charCode = str.charCodeAt(i);
        if(charCode>=0&&charCode<=128) // 英文字符
            realLength+=1;
        else // 其他字符
            realLength+=2;
    }
    return realLength;
}
export function timestampToTime(timestamp) {
    let date = new Date(timestamp*1000);
    let Y = date.getFullYear() + '-';
    let M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    let D = (date.getDate() < 10 ? '0'+date.getDate() : date.getDate()) + ' ';
    let h = (date.getHours() < 10 ? '0'+date.getHours() : date.getHours()) + ':';
    let m = (date.getMinutes() < 10 ? '0'+date.getMinutes() : date.getMinutes()) + ':';
    let s = (date.getSeconds() < 10 ? '0'+date.getSeconds() : date.getSeconds());
    strDate = Y+M+D+h+m+s;
    return strDate;
}
export function getQueryVariable(variable){
    let query = window.location.search.substring(1);
    let vars = query.split('&');
    for (let i=0;i<vars.length;i++) {
           let pair = vars[i].split('=');
           if(pair[0] == variable){
               return pair[1];
           }
    }
    return false;
}
export function query(url,success,fail,type=0,data={}){ // 通用ajax请求
    $.ajax({
        url,
        type: type?'POST':'GET',
        data,
        success: function(result){
            if(result.code==0){
                success&&success(result);
            }
            else{
                console.error(result);
                fail&&fail(result||{msg:'请求失败'});
            }
        },
        error: function(e){
            console.error(e);
            fail&&fail(e);
        },
        complete: function(e){
        },
    });
    return true;
}
export function numFormat(number){ // 货币表达格式
    let abs = Math.abs(number),
        arr = (abs+'').split(''),
        tarr = [];
    for(let i=arr.length-1;i>=0;i--){
        tarr.push(arr[arr.length-i-1]);
        if(i%3==0&&i!=arr.length&&i!=0){
            tarr.push(',');
        }
    }
    if(number<0){
        tarr.unshift('-')
    }
    return tarr.join('');
    // return number;
}
export function avg(arr,valname){ // 数组平均值
    let total = 0;
    if(valname){
        for(let i of arr){
            total += i[valname];
        }
    }
    else{
        for(let i of arr){
            total += i;
        }
    }
    if(total==0)
        return 0;
    else
        return Math.ceil(total/arr.length);
}
export function percent(val,max){ // 百分比显示
    return Math.floor(val*100/max);
}

function genName(arr1,arr2,arr3){ // 生成名字
    let c1 = arr1[r(0,arr1.length-1)], c2 = '', c3 = '';
    if(arr2){
        c2 = arr2[r(0,arr2.length-1)];
    }
    if(arr3){
        c3 = arr3[r(0,arr3.length-1)];
    }
    return c1+c2+c3;
}
export function genRandomWorkerName(gender=1){ // 随机生成工人名字
    let givennames = [];
    if(gender==1){ // 男
        givennames = [...CONFIG.namespace.worker2,...CONFIG.namespace.worker3];
    }
    else{ // 女
        givennames = [...CONFIG.namespace.worker2,...CONFIG.namespace.worker4];
    }
    return `${CONFIG.namespace.worker1[r(0,CONFIG.namespace.worker1.length-1)]}${r(0,1)?givennames[r(0,givennames.length-1)]:''}${givennames[r(0,givennames.length-1)]}`;
}
export function genRandomRoomName(type){ // 随机生成房间名字
    return genName(CONFIG.namespace.common,CONFIG.namespace.common,CONFIG.namespace.room)+CONFIG.room_type_name_map[type];
}
export function genRandomFactoryName(){ // 随机生成工厂名字
    return genName(CONFIG.namespace.common,CONFIG.namespace.common,CONFIG.namespace.factory);
}
export function genRandomRoom(id,{fid,fname,power,durab,risk,auto,level,type,basicImage,avgPower,assignPower,order,group}={}){ // 随机生成房间
    type = (type||type==0)?type:r(0,3);
    return {
        id,
        fid: fid||0,
        fname: fname||'',
        name: genRandomRoomName(type),
        type,
        basicImage: (basicImage||basicImage==0)?basicImage:(r(1,100)<=CONFIG.randomRoomBasicImageProb?r(CONFIG.min_basicImage,CONFIG.max_basicImage):0),
        power: (power||power==0)?power:r(CONFIG.init.randmOtherRoomPowerRange[0],CONFIG.init.randmOtherRoomPowerRange[1]),
        durab: (durab||durab==0)?durab:r(CONFIG.init.randmOtherRoomDurabRange[0],CONFIG.init.randmOtherRoomDurabRange[1]),
        risk: (risk||risk==0)?risk:r(CONFIG.init.randmOtherRoomRiskRange[0],CONFIG.init.randmOtherRoomRiskRange[1]),
        auto: (auto||auto==0)?auto:r(CONFIG.init.randmOtherRoomAutoRange[0],CONFIG.init.randmOtherRoomAutoRange[1]),
        level: (level||level==0)?level:r(CONFIG.init.randmOtherRoomLevelRange[0],CONFIG.init.randmOtherRoomLevelRange[1]),
        avgPower: avgPower||1,
        assignPower: assignPower||0,
        order: order||1,
        group: group||0,
    }
}
export function genRandomWorker(id,{fid,fname,rid,rname,tid,initJob,boss,baseOn,trend}={}){ // 随机生成工人
    /*function rate(age){
        let a = r(0,4),
            z;
        if(a) z = r(1,50);
        else{
            z = Math.round(50/Math.pow(r(1,50),.3))+50;
            z += r(-22,22);
            if(z>100) z = Math.round(z/1.5);
            if(z>100) z = 100;
        }
        return z;
    }*/
    let age = r(16,35);
    let gender = r(0,1); // [0:女|1:男]
    if(boss){
        age = r(16,60);
    }
    function adjust(val){
        return Math.floor((100-val)/2)+val;
    }
    let str,int,com,img;
    // 体能
    str = r(1,gender?60:20);
    str += exptr(0,(100-str),gender?3:5);
    // 智力
    int = r(1,50);
    int += exptr(0,(100-int),4);
    // 交流
    com = r(1,age+14+(gender?-15:25));
    com += exptr(0,(100-com),gender?5:3);
    // 形象
    img = r(1,50+(gender?-20:20));
    img += exptr(0,(100-img),gender?8:3);
    let res = {
        id,
        fid: fid||0,
        fname: fname||'',
        rid: rid||0,
        rname: rname||'',
        tid: tid||0,
        tfid: 0,
        tfname: '',
        studyfid: 0,
        studyfname: '',
        gender,
        age,
        name: genRandomWorkerName(gender),
        str,
        int,
        com,
        img,
        job: initJob||0,
        boss: boss?true:false,
    };
    if(boss){
        if(r(0,1)){
            res.str = adjust(res.str);
            res.int = adjust(res.int);
        }
        else{
            res.com = adjust(res.com);
            res.img = adjust(res.img);
        }
    }
    if(baseOn){
        if(r(1,100)<=baseOn.str){
            res.str = adjust(res.str);
        }
        if(r(50,100)<=baseOn.str){
            res.str = adjust(res.str);
        }
        if(r(1,100)<=baseOn.int){
            res.int = adjust(res.int);
        }
        if(r(50,100)<=baseOn.int){
            res.int = adjust(res.int);
        }
        if(r(1,100)<=baseOn.com){
            res.com = adjust(res.com);
        }
        if(r(50,100)<=baseOn.com){
            res.com = adjust(res.com);
        }
        if(r(1,100)<=baseOn.img){
            res.img = adjust(res.img);
        }
        if(r(50,100)<=baseOn.img){
            res.img = adjust(res.img);
        }
    }
    if(trend&&trend.name){
        res.str = Math.round((res.str*2+trend.str)/3);
        res.int = Math.round((res.int*2+trend.int)/3);
        res.com = Math.round((res.com*2+trend.com)/3);
        res.img = Math.round((res.img*2+trend.img)/3);
    }
    res.str += r(-3,3);
    res.int += r(-3,3);
    res.com += r(-3,3);
    res.img += r(-3,3);
    if(res.str>100){
        res.str = 100;
    }
    if(res.str<1){
        res.str = 1;
    }
    if(res.int>100){
        res.int = 100;
    }
    if(res.int<1){
        res.int = 1;
    }
    if(res.com>100){
        res.com = 100;
    }
    if(res.com<1){
        res.com = 1;
    }
    if(res.img>100){
        res.img = 100;
    }
    if(res.img<1){
        res.img = 1;
    }
    return res;
}
export function genRandomPartner(id,{fid,fname,}={},bossAge,partnerCount){ // 随机生成同伴
    let age = r(bossAge-r(6,15),bossAge+r(-5,5));
    let gender = r(0,1); // [0:女|1:男]
    let str,int,com,img;
    let enhanceTime = 10-partnerCount;
    if(age<16){
        age = 16;
    }
    // 体能
    str = r(10,20);
    str += gender*20;
    // 智力
    int = r(10,20);
    // 交流
    com = r(5,10);
    com -= (gender-1)*5;
    com += age - 16;
    // 形象
    img = r(10,20);
    img -= (gender-1)*15;
    let res = {
        id,
        fid: fid||0,
        fname: fname||'',
        rid: 0,
        rname: '',
        tid: 0,
        tfid: 0,
        tfname: '',
        studyfid: 0,
        studyfname: '',
        gender,
        age,
        name: genRandomWorkerName(gender),
        str,
        int,
        com,
        img,
        job: 0,
        boss: false,
    };
    // 提升
    let abimap = ['str','int','com','img'];
    for(let i=0;i<enhanceTime;i++){
        let abi = abimap[r(0,3)];
        res[abi] += Math.round((100-res[abi])*.05*enhanceTime);
    }
    return res;
}
export function genRandomTask(id,{fid,fname,}={},day){ // 随机生成任务

}
export function getListByID(id,idname,arr){ // 根据ID获取列表
    let res = [];
    Array.from(arr,inst=>{
        if(inst[idname]==id){
            res.push(inst);
        }
    });
    return res;
}
export function getMatchList(arr,matchList){ // 根据匹配获取列表 matchList = [['id',1],['job',2]]
    let res = [];
    Array.from(arr,inst=>{
        let isMatch = true;
        for(let m of matchList){
            if(inst[m[0]]!=m[1]){
                isMatch = false;
                break;
            }
        }
        if(isMatch){
            res.push(inst);
        }
    });
    return res;
}
export function removeFromList(id,idname,arr){ // 根据字段名从列表中移除
    let res = [];
    Array.from(arr,inst=>{
        if(inst[idname]!=id){
            res.push(inst);
        }
    });
    return res;
}
export function releaseAllByJob(job,arr){ // 解除所有相关职务
    Array.from(arr,inst=>{
        if(inst.job==job){
            inst.job = 0;
        }
    });
}


























//

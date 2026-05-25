<template>
    <div class="main">
        <!--作弊-->
        <!-- <nut-drag direction="y" :style="{right:'0px',top:'75px',zIndex:'200'}" v-if="DEBUG">
            <a class="btn touch-dom" @click="onTapCheat">cheat</a>
        </nut-drag> -->
        <!-- 主体 -->
        <div class="panel" v-if="loadingResources">
            <div class="panel-loading">加载中...</div>
        </div>
        <div class="panel" v-if="!loadingResources">
            <!-- 顶部栏位 -->
            <div class="banner-wrap">
                <div class="day">
                    <b>第 {{game.day}} 天</b>
                </div>
                <div class="money-wrap">
                    <b class="money-preifx">金币</b>
                    &nbsp;
                    <b class="money" v-html="common.moneyFormat(calcTotalMoney())+' $'"></b>
                </div>
                <!-- 齿轮 -->
                <a class="btn btn-gear" @click.stop="onTapGear">系统</a>
            </div>
            <!-- 右上角系统菜单弹窗 -->
            <div class="pop-gear" v-show="showGearPop">
                <div class="pop-gear-bg"></div>
                <a class="btn btn-save" v-if="map.type==1" @click="onTapSave">存档</a>
                <a class="btn btn-guide" @click="onTapGuide">指引</a>
                <a class="btn btn-restart" @click="onTapExit">退出</a>
                <a class="btn btn-cheat" v-if="DEBUG" @click="onTapCheat">作弊</a>
            </div>
            <!-- 吊牌 -->
            <a class="brand" @click="onTapBrand()">
                <van-divider class="brand-title bartender-divider">当前位置</van-divider>
                <b class="brand-map">{{map.name}}</b>
            </a>
            <!-- 村落页面 -->
            <div class="page" v-if="state==1">
                <!-- 导航板块 -->
                <div class="nav-wrap" v-show="!showTarven">
                    <div class="nav-title">点击进入地牢：</div>
                    <a class="btn-nav" v-for="navi of navis" @click="onTapNavi(navi)">
                        <!-- <img class="btn-nav-bg" :src="require(`../assets/bg-battle-${navi.id-101}.png`)" /> -->
                        <label class="btn-nav-title" :class="`${navi.coreDefeat?'btn-nav-title-defeat':''}`">
                            {{navi.name}}
                            {{navi.coreDefeat?'（核心已击败）':''}}
                        </label>
                    </a>
                </div>
                <!-- 酒馆 -->
                <div class="pop-tarven" v-show="showTarven">
                    <SwipeTabs class="tarven-tabs-wrap" ref="tarven-wrap" :tabs="[{label:`商人酒保·${(bartender||{}).nm}`,},{label:`大厅（${inmateList.length}）`},{label:`悬赏榜`,}]">
                        <!-- 商人酒保 -->
                        <template #tab-0>
                            <div class="tarven-cot tarven-shop" v-if="viewingUnit&&bartender">
                                <div class="bartender">
                                    <a class="btn" @click="onTapChatButton">聊天</a>
                                    <a class="btn" v-if="game.day>1" @click="onTapSellButton">当卖</a>
                                    <a class="btn" v-if="game.day>1" @click="onTapBankButton">金库</a>
                                    <a class="btn" @click="onTapRestButton">住宿</a>
                                </div>
                                <van-divider class="bartender-divider">装备交易（{{calcShopRefreshRemainDays()}}天后更新）</van-divider>
                                <EquipList v-if="bartender.btd.bagList&&bartender.btd.bagList.length>0" ref="shop" :unit="bartender" :selectingEquipId="selectingEquipId" :viewingUnit="viewingUnit" :onTapEquip="onTapEquip" :showBuy="true" :onTapBuyEquip="onTapBuyEquip" :onTapSwitchViewingUnit="team.length>1?onTapSwitchMember:null" :discount="3" />
                                <div class="tarven-shop-empty" v-if="bartender.btd.bagList.length<=0">暂无商品</div>
                            </div>
                        </template>
                        <!-- 大厅 -->
                        <template #tab-1>
                            <div class="tarven-cot tarven-inmate" v-if="inmateList&&inmateList.length>0">
                                <UnitList :unitList="inmateList" :onTapUnit="onTapInmate" />
                            </div>
                        </template>
                        <!-- 悬赏榜 -->
                        <template #tab-2>
                            <div class="tarven-cot tarven-wanted" v-if="game.wantedList&&game.wantedList.length>0">
                                <div class="wanted" :class="`wanted-${wanted.s}`" v-if="wanted.s>0" v-for="(wanted,index) of game.wantedList">
                                    <div class="title">
                                        <p class="name">“{{wanted.n}}”·<b>{{wanted.t}}</b></p>
                                        <p class="expire" v-if="wanted.s!=2&&wanted.s!=4">截止日：第 <b>{{wanted.e}}</b> 天</p>
                                    </div>
                                    <div class="gold" v-if="wanted.s!=2">
                                        <p v-if="wanted.s==1">
                                            赏金<br/>
                                            <b class="money" v-html="common.moneyFormat(wanted.g)+' $'"></b>
                                        </p>
                                        <a class="btn btn-check-wanted" v-if="wanted.s==3" @click="onTapCheckWanted(wanted)">领取赏金<b class="money" v-html="common.moneyFormat(wanted.g)+' $'"></b></a>
                                        <p v-if="wanted.s==4">已领取 <b v-html="common.moneyFormat(wanted.g)+' $'"></b></p>
                                    </div>
                                    <div class="stamp" v-if="wanted.s==2">逾期</div>
                                    <div class="stamp" v-if="wanted.s==4">已领取</div>
                                </div>
                            </div>
                        </template>
                    </SwipeTabs>
                    <div class="tarven-bg"></div>
                </div>
            </div>
            <!-- 地牢页面 -->
            <div class="page" v-if="state==2">
                <Dungeon class="bg-pic-fade" :map="map"
                    :onTapGuard="onTapGuard"
                    :onTapCell="onTapCell"
                    :onTapLeave="onTapLeaveDungeon"
                    :onTapCore="onTapDungeonCore"
                    :onTapTemple="onTapTemple"
                    :onTapBattery="onTapBattery"
                />
                <div class="temple" v-if="showTemple&&viewingUnit">
                    <div class="temple-header">
                        <div class="temple-title">
                            神庙<span class="temple-desc">(等级{{map.level}})</span>
                        </div>
                        <a class="btn btn-close" @click="onTapCloseTemple">×</a>
                        <Bar1 class="temple-guard-bar" :type="5" :title="`剩余警戒值：`" :mode="2" :crt="map.guard" :max="100" />
                    </div>
                    <SwipeTabs class="temple-tabs-wrap" ref="temple-wrap" :tabs="[{label:`装备融合（${viewingUnit.nm}）`,},{label:`技能强化（${viewingUnit.nm}）`},]">
                        <!-- 装备融合 -->
                        <template #tab-0>
                            <div class="temple-tab-base-wrap smelter">
                                <div class="temple-tab-tip">熔炉中的装备：</div>
                                <div class="temple-tab-base-item">
                                    <Equip class="temple-equip" :equip="temple.baseEquip" v-if="temple.baseEquip"/>
                                    <a class="temple-base-btn" @click="onTapTempleRemoveEquip" v-if="temple.baseEquip">移出<br/>熔炉</a>
                                </div>
                            </div>
                            <div class="temple-tab-list-wrap">
                                <div class="temple-tab-tip">可融合的装备（{{temple.equipList.length}}）：</div>
                                <div class="temple-item" v-for="(equip,index) of temple.equipList">
                                    <Equip class="temple-equip" v-if="temple.baseEquip&&(temple.baseEquip.t==equip.t)" :compare="temple.baseEquip" :colorReverse="true" :equip="equip" :key="index" @onTap="onTapEquip" />
                                    <Equip class="temple-equip" v-else :equip="equip" :key="index" @onTap="onTapEquip" />
                                    <a class="temple-item-btn" @click="onTapTempleEquip(equip)">
                                        <span v-html="!temple.baseEquip?`加入<br/>熔炉`:`融合`"></span>
                                    </a>
                                </div>
                            </div>
                        </template>
                        <!-- 技能强化 -->
                        <template #tab-1>
                            <div class="temple-tab-base-wrap preview">
                                <div class="temple-tab-tip">强化后的技能效果：</div>
                                <div class="temple-tab-base-item">
                                    <Skill class="temple-skill" :skill="temple.previewSkill" v-if="temple.previewSkill"/>
                                    <a class="temple-base-btn" @click="onTapTempleUpgradeSkill" v-if="temple.previewSkill">强化</a>
                                </div>
                            </div>
                            <div class="temple-tab-list-wrap">
                                <div class="temple-tab-tip">可强化的技能（{{temple.skillList.length}}）：</div>
                                <div class="temple-item" v-for="(skill,index) of temple.skillList">
                                    <Skill class="temple-skill" :skill="skill" :key="index" @onTap="onTapSkill" />
                                    <a class="temple-item-btn" @click="onTapTempleViewSkill(skill,map.level)">预览</a>
                                </div>
                            </div>
                        </template>
                    </SwipeTabs>
                </div>
            </div>
            <!-- 啤酒按钮 -->
            <a class="beer" v-if="state==1" @click="onTapBeer()">
                <div class="beer-title">以太酒馆</div>
                <div class="beer-icon">酒</div>
                <!-- <img class="beer-icon" :src="require('../assets/icon-beer.png')" /> -->
            </a>
            <!-- 营地按钮 -->
            <a class="btn btn-bonfire" v-if="state==2" @click.stop="onTapBonfire">营</a>
            <!-- 背景 -->
            <div class="bg" v-if="!loadingResources">
                <!-- <img class="bg-pic" :class="state==2?'bg-pic-fade':''" :src="require(`../assets/${calcBgName()}.png`)" /> -->
            </div>
        </div>
        <!-- 队形板块 -->
        <div class="menu-wrap">
            <draggable class="unit-list-group" handle=".mover" :disabled="false" v-model="team" @end="onUnitDragEnd" animation="100">
                <div class="unit-item" :class="((viewingUnit&&team[index]&&(team[index].id==viewingUnit.id))?'unit-item-cur':'')" v-for="index in [0,1,2,3]" :key="index">
                    <a class="unit" v-if="team[index]">
                        <Avatar class="unit-avatar" :unit="team[index]" @onTap="onTapUnit(team[index])" />
                        <a class="anchor mover" v-if="team.length>1">拖移</a>
                        <Bar1 class="unit-bar" @onTap="onTapUnit(team[index])" :suffix="team[index].btd.def[1]?`${team[index].btd.def[1]}`:''" :type="1" :crt="team[index].btd.hp[0]" :max="team[index].btd.hp[1]" />
                        <Bar1 class="unit-bar" @onTap="onTapUnit(team[index])" :suffix="team[index].btd.phy[1]?`${team[index].btd.phy[1]}`:''" :type="2" :crt="team[index].btd.eng[0]" :max="team[index].btd.eng[1]" />
                        <div class="icon-arrow-down" v-if="viewingUnit&&!coverTip&&!showMoneyTrasferCover&&team[index]&&(team[index].id==viewingUnit.id)"></div>
                        <div class="me-xp" v-if="team[index].id==101&&game.xp>0">技能</div>
                    </a>
                    <div class="unit unit-empty" v-else></div>
                </div>
            </draggable>
        </div>
        <!-- 单位浏览弹窗 -->
        <Pop class="pop-unit" v-if="showUnitPop&&selectingUnit" ref="pop-content" :title="`${selectingUnit.btd.name}的${[`面板`,`装备`,`技能`,][popUnitTab-1]}${popUnitTab==3?`（${selectingUnit.btd.skillList.length}）`:``}`" :arrowTitle="`${[`装备`,`技能`,`面板`,][popUnitTab-1]}`" :showCloseButton="true" @onTapClose="onTapClosePop" @onTapArrow="onTapArrowPop">
            <!-- 角色面板 -->
            <div class="unit-info-pop unit-board" v-if="popUnitTab==1">
                <Unit1 :unit="selectingUnit" :game="game" :team="team" @onTapLeader="onTapLeader" :showTransferButton="team.length>1&&selectingUnit.rel==3" @onTapTransferMoney="onTapTransferMoney" @onTapAvatar="onTapAvatar" :mode="1" />
                <!-- 角色隶属操作栏 -->
                <div class="unit-board option-wrap" v-if="state==1">
                    <a class="btn" v-if="selectingUnit.id==me.id" @click="onTapLogout()">销号</a>
                    <a class="btn" v-if="selectingUnit.rel<3" @click="onTapChallenge(selectingUnit)">单挑</a>
                    <a class="btn" v-if="selectingUnit.rel==1&&selectingUnit.id!=1" @click="onTapHire(selectingUnit)">
                        雇佣&nbsp;&nbsp;<b class="money" v-html="`${common.moneyFormat(selectingUnit.btd.price)} $`"></b>
                    </a>
                    <a class="btn" v-if="selectingUnit.rel==2" @click="onTapJoinTeam(selectingUnit)">入队</a>
                    <a class="btn" v-if="selectingUnit.rel==3&&selectingUnit.id!=101" @click="onTapLeavTeam(selectingUnit)">离队</a>
                </div>
            </div>
            <!-- 角色装备表 -->
            <div class="unit-info-pop unit-equip-board" v-if="popUnitTab==2">
                <!-- 已着装备 -->
                <div class="unit-body">
                    <!-- <img class="unit-body-bg" :src="require(`../assets/outline-${selectingUnit.gd==1?'male':'female'}.png`)" /> -->
                    <a class="unit-body-equip-wrap" :class="`${selectingUnitBodyEquipIndex==(index-1)?'unit-body-equip-wrap-expand':''} unit-body-${[`weapon1`,`weapon2`,`accessory1`,`accessory2`,`armor`,`helmet`,`shoes`,][index-1]}`" v-for="index in 7" :key="index" @click.stop="onTapViewingBodyEquip(index-1)">
                        <Equip class="unit-body-equip" :class="" v-if="selectingUnit.btd.equipList[index-1]" :equip="selectingUnit.btd.equipList[index-1]" @onTap="onTapEquip" :mode="selectingUnitBodyEquipIndex==(index-1)?1:2" />
                        <div class="unit-body-equip-empty" v-else>{{[`武器`,`武器`,`配饰`,`配饰`,`衣着`,`头饰`,`鞋子`,][index-1]}}（空）</div>
                        <!-- 选中的已着装备操作栏，只有在队或同道才能显示 -->
                        <div class="unit-body-op" v-if="selectingUnitBodyEquipIndex==(index-1)&&selectingUnit.rel==3">
                            <a class="btn" @click.stop="onTapAllEquipOff(selectingUnit)">全卸下</a>
                            <!-- <a class="btn" v-if="selling" @click.stop="onTapSellEquip(selectingUnit.btd.equipList[index-1])">
                                售卖
                            </a> -->
                            <a class="btn" @click.stop="onTapEquipOff(selectingUnit.btd.equipList[index-1],selectingUnit)">卸下</a>
                        </div>
                    </a>
                </div>
                <!-- 背包 -->
                <div class="unit-bag equip-wrap">
                    <div class="unit-bag-title">
                        <div class="bag-title">背包（{{selectingUnit.btd.bagList.length}}）：</div>
                        <!-- 背包顶部操作栏，只有在队或同道才能显示 -->
                        <div class="bag-op" v-if="selectingUnit.rel==3">
                            <a class="btn btn-bag-title-sellAll" v-if="selling&&selectingUnit.btd.bagList.length>0" @click="onTapSellBag(selectingUnit.btd.bagList,selectingUnit)">
                                全售卖 <b class="money" v-html="`${common.moneyFormat(common.getSellAllPrice(selectingUnit,false))} $`"></b>
                            </a>
                            <a class="btn btn-bag-title-moveAll" v-if="selectingUnit.btd.bagList.length>1&&team.length>1" @click="onTapMoveBag(selectingUnit.btd.bagList)">全转移</a>
                        </div>
                    </div>
                    <EquipList ref="bag" :unit="selectingUnit" :team="team" :selectingEquipId="selectingEquipId" :viewingUnit="viewingUnit" :showSell="selling" :onTapSellEquip="onTapSellEquip" :onTapEquip="onTapEquip" :onTapEquipOn="onTapEquipOn" :onTapMoveEquip="onTapMoveEquip" :onTapHighLightEquip="onTapHighLightEquip" />
                </div>
            </div>
            <!-- 角色技能表 -->
            <div class="unit-info-pop unit-skill-board" v-if="popUnitTab==3">
                <div class="skill-x-wrap" v-if="selectingUnit.id==me.id&&(game.x>0||game.xp>0)">
                    <Bar1 class="skill-x" title="灵感指数" :mode="2" :type="4" :crt="game.x" :max="common.calcSkillXDemand(game.xl)" @onTap="onTapXPointBar" />
                    <a class="btn btn-skill-x" :class="`${game.xp>0?'btn-skill-x-active':''}`" @click="onTapXPointBar">{{game.xp}}</a>
                </div>
                <!-- <div class="skill-copy-wrap" v-if="selectingUnit.id==me.id&&showSkillCopy">
                    <div class="title">选择要复制的技能（{{skillCopyList.length}}）：</div>
                    <Skill class="skill" v-for="skill of skillCopyList" :key="skill.id" :skill="skill" :isOption="true" :mode="1" @onTap="onTapCopySkill" />
                </div> -->
                <draggable v-if="selectingUnit.btd.skillList.length>0" class="skill-list-group" handle=".mover" :disabled="false" v-model="selectingUnit.btd.skillList" @end="onSkillDragEnd" animation="100">
                    <div class="skill-wrap" v-for="skill of selectingUnit.btd.skillList" :key="skill.id">
                        <Skill class="skill" :skill="skill" :unit="selectingUnit" :me="me" :x="game.xp" :mode="1" @onTap="onTapSkill" />
                        <a class="anchor mover" v-if="selectingUnit.rel==3&&selectingUnit.btd.skillList.length>1">拖<br/>移<br/>↕</a>
                    </div>
                </draggable>
                <div class="skill-empty" v-else>没有技能</div>
            </div>
        </Pop>
        <!-- 结算弹窗 -->
        <div class="pop-checkout" v-if="award.show" @click="onTapClosePop">
            <div class="checkout-shadow">
                <div class="light"></div>
            </div>
            <div class="row row-title">
                ◆ {{award.title||'战斗结算'}} ◆
            </div>
            <div class="row row-money" v-if="award.gold">
                <label class="title">获得金币：</label>
                <span class="value money" v-html="`${common.moneyFormat(award.gold)} $`"></span>
            </div>
            <div class="row row-battery" v-if="award.battery">
                <label class="title">获得能量：</label>
                <span class="value battery">{{award.battery}}</span>
            </div>
            <div class="row row-equips" v-if="award.equipList.length>0">
                <label class="title">获得装备（{{award.equipList.length}}）：</label>
                <div class="row-equips-wrap">
                    <div class="equip" :class="`${equip.t==1?'weapon':''}`" v-for="equip of award.equipList">
                        <span class="type">{{[`🗡️`,`🎩`,`🧥`,`💍`,`🥾`,][equip.t-1]}}</span>
                        <span class="name">{{equip.n}}</span>
                    </div>
                </div>
            </div>
        </div>
        <!-- 金币转移遮罩 -->
        <Cover v-if="showMoneyTrasferCover" @onTap="onTapCover" tip="选取并转移金币给目标：">
            <div class="pop-money-transfer-wrap">
                <van-slider class="pop-money-transfer-slider" active-color="gold" v-model="transferringMoney" :step="100" :min="1" :max="selectingUnit.g" />
                <div class="pop-money-transfer-indicator" v-html="common.moneyFormat(transferringMoney)+' $'"></div>
                <a class="btn btn-money-transfer-all" @click.stop="onTapAllMoneyTransfer">全</a>
            </div>
        </Cover>
        <!-- 金库遮罩 -->
        <Cover v-if="showBankCover&&viewingUnit" @onTap="onTapCover">
            <div class="pop-bank-wrap">
                <div class="bank-row">金库余额：<b class="money" v-html="common.moneyFormat(game.bank)+' $'"></b></div>
                <div class="bank-row">
                    执行人：{{viewingUnit.nm}}（<b class="money" v-html="common.moneyFormat(viewingUnit.g)+' $'"></b>）
                </div>
                <div class="bank-row">
                    <a class="btn-bank-mode" :class="`${bank.mode==1?`btn-bank-mode-sel`:``}`" @click.stop="onTapSwitchBankMode(1)">存入</a>
                    <a class="btn-bank-mode" :class="`${bank.mode==2?`btn-bank-mode-sel`:``}`" @click.stop="onTapSwitchBankMode(2)">取出</a>
                </div>
                <!-- 存钱 -->
                <div class="pop-bank-mode" v-if="bank.mode==1">
                    <div v-if="viewingUnit.g>0">
                        <div class="bank-slider-wrap">
                            <van-slider class="pop-money-transfer-slider" active-color="gold" v-model="bank.saveMoney" :min="0" :max="viewingUnit.g" />
                            <div class="pop-money-transfer-indicator" v-html="common.moneyFormat(bank.saveMoney)+' $'"></div>
                            <a class="btn btn-money-transfer-all" @click.stop="onTapBankAllMoney(1)">全</a>
                        </div>
                        <a class="btn btn-bank-confirm" @click.stop="onTapBankConfirm(1)">确认存入</a>
                    </div>
                    <div v-else>{{viewingUnit.nm}} 没有可存入的金币。</div>
                </div>
                <!-- 取钱 -->
                <div class="pop-bank-mode" v-if="bank.mode==2">
                    <div v-if="game.bank>0">
                        <div class="bank-slider-wrap">
                            <van-slider class="pop-money-transfer-slider" active-color="gold" v-model="bank.drawMoney" :min="0" :max="game.bank" />
                            <div class="pop-money-transfer-indicator" v-html="common.moneyFormat(bank.drawMoney)+' $'"></div>
                            <a class="btn btn-money-transfer-all" @click.stop="onTapBankAllMoney(2)">全</a>
                        </div>
                        <a class="btn btn-bank-confirm" @click.stop="onTapBankConfirm(2)">确认取出</a>
                    </div>
                    <div v-else>没有可取出的金币。</div>
                </div>
            </div>
        </Cover>
        <!-- 普通提示遮罩 -->
        <Cover v-if="coverTip" @onTap="onTapCover" :tip="coverTip"></Cover>
        <!-- 头像数据遮罩 -->
        <Cover v-if="viewingAvatar" @onTap="onTapCover">
            <div class="avatar-wrap">
                <canvas class="avatar" :width="CVSLEN" :height="CVSLEN" ref="avatar_cvs" />
            </div>
        </Cover>
        <!-- 新手指引弹窗 -->
        <Pop class="pop-guide" v-if="showGuide" title="新手指引" :showCloseButton="true" @onTapClose="onTapClosePop">
            <div class="guide">
                <div class="guide-row">
                    <label class="guide-title">游戏介绍</label>
                    <p class="guide-para">积累装备和技能，召集队友，击杀所有悬赏目标。回合类战斗。高度肉鸽。</p>
                </div>
                <div class="guide-row">
                    <label class="guide-title">战斗属性介绍</label>
                    <p class="guide-para">
                        【生命】归零时退出战斗，可通过技能和住宿补充。<br/>
                        【防御】受到伤害时替代生命的损失。<br/>
                        【精力】进行动作时消耗，只能通过住宿补充。<br/>
                        【体力】替代精力消耗。<br/>
                        【行动力】涨满即可行动，增长率由“速度”决定。<br/>
                        【潜能】消耗体力时缓慢增长，一次性消耗所有潜能可临时提升自身的属性（仅当前战斗有效），增长率由“爆发”决定。<br/>
                        【存在感】被敌方命中的概率，由“隐蔽”和装备决定。<br/>
                        【心理防御】由“定力”决定，低于0时会进入奔溃状态：受到伤害增加，无法躲避和防御。<br/>
                    </p>
                </div>
                <div class="guide-row">
                    <label class="guide-title">缩写</label>
                    <p class="guide-para">
                        【X补】能力补正，意思是该能力越高，效果越强。如“力补”代表力量补正。<br/>
                    </p>
                </div>
                <div class="guide-row">
                    <label class="guide-title">其他战斗机制</label>
                    <p class="guide-para">
                        【屈服】对已经奔溃的敌人使用“话术”可使其立刻屈服败退，并加入到酒馆中。<br/>
                        【状态】通过武器攻击或技能，可对 <b style="color:#a5d3f9">‘非满生命值敌人’</b> 施加负面状态。<br/>
                        【暴击】当行动力高于 90%（95%）时，受到的伤害翻 2（3）倍。<br/>
                        【战意流失】每固定时间触发，我方集体心理防御下降。<br/>
                    </p>
                </div>
            </div>
        </Pop>
        <!-- alert -->
        <Toast ref="toast-alert" />
        <!-- confirm -->
        <Toast ref="toast-confirm" />
    </div>
</template>

<script>
import Unit1 from '../components/Unit1';
import Bar1 from '../components/Bar1';
import Bar2 from '../components/Bar2';
import Bar3 from '../components/Bar3';
import Equip from '../components/Equip';
import Skill from '../components/Skill';
import Toast from '../components/Toast';
import Pop from '../components/Pop';
import Dungeon from '../components/Dungeon';
import SwipeTabs from '../components/SwipeTabs';
import Cover from '../components/Cover';
import EquipList from '../components/EquipList';
import UnitList from '../components/UnitList';
import Avatar from '../components/Avatar';
import draggable from 'vuedraggable';
import { cl, query, r, exptr, setInRange, loadImages, shuffle, bulbsort, bulbsort2, getParentNode, cloneObj, numFormat, avg, percent, calcDistance, getMatchList, getSubMatchList, removeFromList, removeFromNumberList, arrContains, } from '../tools/utils';
import { genRandomAvatar, paintAvatar, genForeHairData, genBangsData, genBackHairData, } from '../tools/avatar';
import * as common from '../tools/common';
import * as ai from '../tools/ai';
import Vue from 'vue';
import { Slider } from 'vant-green';
import { Divider } from 'vant-green';
import { Switch } from 'vant-green';
import 'vant-green/lib/index.css';
Vue.use(Slider).use(Divider).use(Switch);

import { DEBUG, CONFIG, CACHE, ASSETS, } from '../config/config';

const BUFF_LIST = [...CONFIG.goodBuffs,...CONFIG.badBuffs];
const CVSLEN = (window.GLOBAL||{fontSize:7.5}).fontSize*14;

export default {
    name: 'Home',
    data(){
        return {
            loadingResources: true,
            banReactive: false,
            state: 0, // 1村落 2地牢

            game: {},

            team: [],
            me: null,
            navis: [], // 导航数据

            bartender: null, // 商人酒保单位
            inmateList: [], // 酒馆大厅单位数组
            selectingEquipId: 0, // 装备列表中，选中的装备ID

            award: { // 战斗结算奖励数据
                show: false,
                gold: 0,
                guard: 0,
                battery: 0,
                x: 0, // 技能经验
                equipList: [],
                // show: true,
                // gold: 47864,
                // guard: 0,
                // battery: 15,
                // x: 0,
                // equipList: [
                //     {t:1,n:'隆力奇'},
                //     {t:2,n:'蛇油膏帽子'},
                //     {t:3,n:'蛇油膏衣服'},
                //     {t:1,n:'超级隆力奇'},
                //     {t:4,n:'高温戒指'},
                //     {t:5,n:'愚蠢鞋子'},
                // ],
            },
            bank: { // 金库数据
                mode: 1, // 模式 1存 2取
                drawMoney: 0, // 预设取出的钱
                saveMoney: 0, // 预设存入的钱
            },
            temple:{ // 神庙数据
                tag: 1, // 1装备融合 2技能强化
                skillList: [],
                equipList: [],
                baseEquip: null,
                previewSkill: null,
            },

            popUnitTab: 1,
            viewingUnit: null, // 浏览者，只能是团队中的人
            selectingUnit: null, // 被浏览者，可以是团队中的人，也可以是NPC
            selectingUnitBodyEquipIndex: -1, // 单位弹窗-已着放大的装备 index

            /* 状态标识 */
            selling: false, // 售卖状态标识
            movingEquipList: [], // 正在转移的装备数组，用作状态标识
            transferringMoney: 0, // 正在转移的金币数

            showUnitPop: false, // 显示团队单位浏览弹窗
            showGearPop: false, // 显示系统弹窗
            showMoneyTrasferCover: false, // 显示金币转移遮罩
            showTarven: false, // 显示酒馆弹窗
            showSkillCopy: false, // 显示技能复制弹窗
            showGuide: false, // 显示指引弹窗
            skillCopyList: [], // 可复制的技能数组
            viewingAvatar: null, // 正在浏览的头像数据
            showBankCover: false, // 显示金库弹窗
            showTemple: false, // 显示神庙

            coverTip: '', // 阴影遮罩文本
            confirmTip: '', // 确认弹窗的文本

            unitDraggable: false,
            ctx: null,

            /*  地图数据
                map = {
                    bosses: [],
                    conquered: false,
                    floors: [],
                    id: 102,
                    level: 1,
                    links: [],
                    name: `活死人墓穴`,
                    size: 4,
                    type: 2,

                    cellList: [{ // 单元格数组
                        id: 1,
                        show: false,
                        flag: true,
                        core: false,
                        marked: false, // 是否显示路标或核心标识
                        enemy: 0, // 0无敌人 1+敌人数量
                    },...],
                    guard: 19, // 警戒值 0-100
                }
            */
            map: {},
            tempGame: null,

            common,
            CVSLEN,
            ASSETS,
            CONFIG,
            DEBUG,
        };

    },
    mounted(){
        if(window.GLOBAL&&window.GLOBAL.game){
            this.game = window.GLOBAL.game;
            this.init();
        }
        else{
            let _storage = localStorage.getItem(CACHE.sto);
            if(_storage){
                let storage = JSON.parse(_storage);
                this.game = storage;
                window.GLOBAL.game = this.game;
                // let urls = Array.from(ASSETS.image_urls,url=>{
                //     return require(url);
                // });
                // loadImages(ASSETS.image_urls).then(images=>{
                //     // this._alert(`成功加载 ${images.length} 张图片`);
                // });
                this.init();
            }
            else{
                this.$router.push('/');
            }
        }
    },
    methods: {
        init(ignoreBattleResult){ // 初始化
            // 如果从战斗场景回来，则先处理战斗结果数据
            if(!ignoreBattleResult&&window.GLOBAL.battleResult){
                this.battleResultProcess(window.GLOBAL.battleResult);
                window.GLOBAL.battleResult = null;
            }
            // 根据战斗结果数据决定地图
            if(!(this.map&&this.map.id)){
                this.map = getMatchList(CONFIG.mapConfigs,[['id',101]])[0]; // 龙虾村
            }
            // 初始化本地数据
            this.asynTeam();
            if(this.map.type==1){ // 如果当前位于村落
                this.asynBartender();
                this.asynInmates();
                this.initNavis();
                this.asynWanted();
            }
            this.state = this.map.type;
            this.viewingUnit = this.me;
            this.loadingResources = false;

            console.log(this.game);
        },
        save(showAlert){ // 保存数据到 local
            let storage = this.game;
            try{
                localStorage.setItem(CACHE.sto,JSON.stringify(storage));
                if(showAlert){
                    this._alert(`保存成功`);
                }
            }
            catch(err){
                this._alert(`游戏保存失败：${err.message}`);
                console.error(err);
            }
        },
        logout(callback){ // 删除 local 数据
            try{
                localStorage.removeItem(CACHE.sto);
                this._alert(`存档删除成功`);
                callback&&callback();
            }
            catch(err){
                this._alert(`存档删除失败：${err.message}`);
                console.error(err);
            }
        },

        initNavis(){ // 初始化导航数据
            let navis = [];
            let conqueredIDList = [];
            let conqueres = [];
            // conqueres = [101,102,103,104,105,106,107,108,109,110]; // @test
            // 获取已攻克地图的ID数组
            for(let map of this.game.mapList){
                if(arrContains(map.flagMarks,0)==-1){
                    conqueres.push(map.id);
                }
            }
            // 获取所有“已攻克”地图
            for(let mapConfig of CONFIG.mapConfigs){
                let newNav;
                if(arrContains(conqueres,mapConfig.id)!=-1){ // 如果已攻克
                    newNav = cloneObj(mapConfig);
                    newNav.conquered = true;
                    conqueredIDList.push(mapConfig.id);
                    if(mapConfig.id!=this.map.id){
                        navis.push(newNav);
                    }
                }
            }
            // 获取所有“可攻克”地图（ conqueredIDList = 目前为所有已攻克地图ID数组）
            for(let mapConfig of CONFIG.mapConfigs){
                let newNav;
                let canConquere = true; // 这个地图是否可攻克
                for(let link of mapConfig.links){
                    if(arrContains(conqueredIDList,link)==-1){ // 如果conqueredIDList不包含link
                        canConquere = false;
                        break;
                    }
                }
                if(canConquere&&(!getMatchList(navis,[['id',mapConfig.id]])[0])){
                    newNav = cloneObj(mapConfig);
                    newNav.conquered = false;
                    if(mapConfig.id!=this.map.id){
                        navis.push(newNav);
                    }
                }
            }
            // 为每个 navi 赋值 coreDefeat
            for(let navi of navis){
                let oMap = getMatchList(this.game.mapList,[['id',navi.id]])[0];
                navi.coreDefeat = oMap.coreDefeat;
            }
            this.navis = navis;
            // for(let i=0;i<this.navis.length;i++){
            //     console.log(this.navis[i].name,this.navis[i].id,this.navis[i].conquered);
            // }
        },
        backToShrimp(){ // 回到龙虾村
            this.map = getMatchList(CONFIG.mapConfigs,[['id',101]])[0];
            this.init(true);
            this.dayPass();
        },
        asynTeam(){ // 同步 team 数据到 home，并重新计算每个单位的 btd
            let team = [];
            let viewingUnitId, selectingUnitId;
            if(this.viewingUnit&&this.viewingUnit.id){
                viewingUnitId = this.viewingUnit.id;
            }
            if(this.selectingUnit&&this.selectingUnit.id){
                selectingUnitId = this.selectingUnit.id;
            }
            for(let unit of this.game.allUnits){
                if(unit.rel==3){
                    let btd = common.getUnitBtd(unit,this.game);
                    let cUnit = cloneObj(unit);
                    cUnit.btd = btd;
                    team.push(cUnit);
                }
            }
            this.team = bulbsort(team,'tms',0);
            // 设置我
            this.me = getMatchList(this.game.allUnits,[['id',101]])[0];
            this.me.btd = common.getUnitBtd(this.me,this.game);
            // 同步“单位浏览弹窗”中的单位数据
            if(viewingUnitId){
                this.viewingUnit = getMatchList(this.team,[['id',viewingUnitId]])[0];
                this.viewingUnit.btd = common.getUnitBtd(this.viewingUnit,this.game);
            }
            if(selectingUnitId){
                this.selectingUnit = getMatchList(this.game.allUnits,[['id',selectingUnitId]])[0];
                this.selectingUnit.btd = common.getUnitBtd(this.selectingUnit,this.game);
            }
            // 重置 EquipList 数据
            this.$nextTick(_=>{
                let bagDom = this.$refs[`bag`];
                if(bagDom){
                    bagDom.init();
                }
            })
        },
        asynBartender(){ // 同步酒保数据
            this.bartender = null;
            this.$nextTick(_=>{
                this.bartender = getMatchList(this.game.allUnits,[['id',1]])[0];
                this.bartender.btd = common.getUnitBtd(this.bartender,this.game);
            });
        },
        asynInmates(){ // 同步酒馆客人数据
            this.inmateList = [];
            this.$nextTick(_=>{
                let inmateList = [];
                for(let unit of this.game.allUnits){
                    if(unit.rel<3&&unit.rel>0){
                        let newInmate = cloneObj(unit);
                        newInmate.btd = common.getUnitBtd(newInmate,this.game);
                        inmateList.push(newInmate);
                    }
                }
                this.inmateList = inmateList;
            });
        },
        asynWanted(){ // 同步悬赏榜单数据
            for(let navi of this.navis){
                for(let boss of navi.bosses){
                    let oWanted = getMatchList(this.game.wantedList,[['id',boss.id]])[0];
                    if(oWanted&&oWanted.s==0){
                        oWanted.s = 1;
                    }
                }
            }
        },
        asynTemple(){ // 同步神庙数据
            let { b, ss, } = this.viewingUnit;
            let skillList = [], equipList = [];
            let baseEquip = this.temple.baseEquip;
            for(let equipId of b){
                let oEquip = getMatchList(this.game.allEquips,[['id',equipId]])[0];
                if(oEquip){
                    let showEquip = false;
                    if(!baseEquip){ // 若没有base装备
                        showEquip = true;
                    }
                    else if(oEquip.t==baseEquip.t&&oEquip.id!=baseEquip.id){ // 若熔炉中已有base装备，则判断装备类型，且避免显示同一件装备
                        showEquip = true;
                    }
                    if(showEquip){
                        equipList.push(oEquip);
                    }
                }
            }
            for(let skillId of ss){
                let oSkill = getMatchList(this.game.allSkills,[['id',skillId]])[0];
                skillList.push(oSkill);
            }
            this.temple.skillList = skillList;
            this.temple.equipList = equipList;
        },
        initTemple(){ // 初始化神庙数据
            this.temple.baseEquip = null;
            this.temple.previewSkill = null;
            this.asynTemple();
        },
        resetViewingUnitPopData(){ // 重置单位预览弹窗数据
            this.showUnitPop = false;
            this.selectingUnit = null;
            this.selectingUnitBodyEquipIndex = -1; // 单位弹窗-放大的装备 index
        },
        setViewingUnit(unit,showUnitPop,callback){ // 切换浏览者
            // 记录 tab-content 原有的滚动条位置
            let tarvenDom = this.$refs[`tarven-wrap`];
            let targetY = 0;
            if(tarvenDom){
                let domList = tarvenDom.$refs[`contentRef`];
                if(domList){
                    targetY = domList.scrollTop;
                }
            }

            this.viewingUnit = null;
            this.selectingUnit = null;
            this.selectingUnitBodyEquipIndex = -1;

            this.$nextTick(_=>{
                this.viewingUnit = unit;
                this.selectingUnit = unit;
                this.initTemple();
                if(showUnitPop&&!this.showBankCover&&!this.showTemple){
                    this.showUnitPop = true;
                }
                callback&&callback();
                this.$nextTick(_=>{
                    // shop初始化
                    let shopDom = this.$refs[`shop`];
                    if(shopDom){
                        shopDom.init();
                    }
                    // 设置 tab-content 的滚动条到原有位置
                    this.$nextTick(_=>{
                        let tarvenDom = this.$refs[`tarven-wrap`];
                        if(tarvenDom){
                            let domList = tarvenDom.$refs[`contentRef`];
                            if(domList){
                                domList.scrollTop = targetY;
                            }
                        }
                    });
                });
            });
        },
        dayPass(){ // 经历一天
            this.game.day++;
            // 悬赏令状态更新
            for(let wanted of this.game.wantedList){
                if(this.game.day>=wanted.e+1&&wanted.s!=3){ // 如果超过期限，则设为逾期
                    wanted.s = 2;
                }
            }
            // 判断是否更新酒馆商品
            if(this.game.day%CONFIG.shopRefreshInterval==0){
                // 更新酒馆商品
                common.unregisterEquips({equipIdList:this.game.allUnits[0].b,game:this.game}); // 注销商人背包的全部装备
                this.game.allUnits[0].b = [];
                let shopItemCount = 6+Math.floor(this.game.day/7);
                let level = Math.ceil(this.game.day/5+.01);
                if(shopItemCount>10){
                    shopItemCount = 10;
                }
                if(level>9){
                    level = 9;
                }
                for(let i=1;i<=shopItemCount;i++){
                    let type = 1;
                    if(i>1){
                        type = r(2,5);
                    }
                    let newEquip = common.genEquipData({id:this.game.equipIndex++,level,type,game:this.game,});
                    this.game.allUnits[0].b.push(newEquip.id); // 放入商人酒保的背包
                    this.game.allEquips.push(newEquip);
                }
                this.asynTeam();
                this.asynBartender();
            }
            this._alert(`一天过去了...`);
            // 第二天
            if(this.game.day==3){
                // 注册 3 个客人
                let tempUnitList = [], tempEquipList = [], tempSkillList = [];
                for(let i=2;i<5;i++){
                    let unit = common.genUnit({
                        id: i,
                        game: this.game,
                        level: 1,
                        nickname: `酒馆客人`,
                        equipList: tempEquipList,
                        skillList: tempSkillList,
                        rel: 1,
                    });
                    unit.g = 0;
                    unit.b = [];
                    unit.es = [unit.es[0],0,0,0,0,0,0,];
                    tempUnitList.push(unit);
                }
                for(let unit of tempUnitList){
                    let newUnit = common.registerUnit({
                        unit,
                        game: this.game,
                        equipList: tempEquipList,
                        skillList: tempSkillList,
                    });
                    common.recoverUnit(newUnit,this.game);
                }
                this._alert(`酒馆里来了新的客人`,7);
            }
        },
        goBattle({mode=1,playerTeamIds=[],enemyTeamIds=[],game=cloneObj(this.game)}){ // 进入战斗
            let field;
            if(mode<3){
                field = this.map.id-101;
            }
            else{
                field = 0;
            }
            this.map.tempGame = cloneObj(game);
            window.GLOBAL.battle={
                mode, // 战斗模式【1:普通|2：BOSS|3：切磋|4：营地】
                field, // 战场 0-9
                map: this.map, // 当前所在地图数据
                playerTeamIds,
                enemyTeamIds,
            }
            this.$router.push('battle');
        },
        battleResultProcess(battleResult){ // 处理战斗结果数据
            /*window.GLOBAL.battleResult = { // 输出：战斗结果数据
                battle: {...}, // 战斗参数
                result: 1, // 结果 0离开营地 1获胜 2战败 3撤离成功
                playerTeam: [],
                enemyTeam: [],
                bonusRate: 1, // 额外金币奖励比率
                roundCount: 56, // 战斗的回合数
            }*/
            let { battle, result, playerTeam, enemyTeam, bonusRate, roundCount, } = battleResult;
            let { mode, field, map, } = battle;
            let setAllUnits = _ =>{ // 所有单位赋值
                for(let player of playerTeam){
                    let btd = player.btd;
                    let oUnit = getMatchList(this.game.allUnits,[['id',player.id]])[0];
                    oUnit.st[1] = btd.eng[0];
                    oUnit.g = btd.money;
                    if(btd.out!=0){ // 若战退或屈服
                        oUnit.st[0] = 1;
                    }
                    else{
                        oUnit.st[0] = btd.hp[0];
                    }
                }
            }
            this.map = map;
            this.asynTeam();
            if(mode==3){ // 切磋模式

            }
            else{
                setAllUnits();
                if(result==3){ // 撤离成功
                    this.map.guard -= 10;
                    this.map.guard = setInRange(this.map.guard,0,100);
                }
                else if(result==2){ // 战败
                    // 惩罚：所有人金币归零
                    let goldLose = 0;
                    for(let player of playerTeam){
                        let oUnit = getMatchList(this.game.allUnits,[['id',player.id]])[0];
                        goldLose += oUnit.g;
                        oUnit.g = 0;
                    }
                    this._alert(`总共损失金币：${goldLose} $`,5);
                    // 惩罚：回到龙虾村
                    this.backToShrimp();
                }
                else if(result==1){ // 获胜
                    let oLeader, autoGather = false; // 自动集结金币
                    if(this.game.leaderIndex==0){
                        oLeader = getMatchList(this.game.allUnits,[['id',101]])[0]; // 队长是我本人
                    }
                    else{
                        let leader = this.team[this.game.leaderIndex-1];
                        oLeader = getMatchList(this.game.allUnits,[['id',leader.id]])[0];
                        autoGather = true;
                    }

                    // 奖励金币、随机装备、灵感指数和警戒值
                    let award = {
                        show: true,
                        gold: 0,
                        guard: 0,
                        battery: 0,
                        x: 0,
                        equipList: [],
                    }

                    // 普通对战
                    if(mode==1){
                        // 改变地图数据
                        let cell = this.map.cellList[this.map.curCellIndex];
                        cell.enemy = 0;
                        for(let enemyUnit of enemyTeam){
                            // 金币
                            award.gold += Math.ceil(enemyUnit.g*.1);
                            // 警戒值
                            let floor = this.map.floors[enemyUnit.it];
                            award.guard += floor.guard;
                            // 能量点数
                            award.battery += enemyUnit.it*enemyUnit.it+1;
                            // 灵感指数
                            award.x += Math.ceil(enemyUnit.btd.score*.03);
                            // 服饰装备
                            if(enemyUnit.it<=0&&r(1,100)<this.map.guard){
                                let newEquip = common.genEquipData({game:this.game,level:enemyUnit.l,inten:enemyUnit.it,type:r(2,5),});
                                common.registerEquip({equip:newEquip,game:this.game,});
                                award.equipList.push(newEquip);
                            }
                            // 武器
                            if(enemyUnit.it>0){
                                let newWeapon = common.genEquipData({game:this.game,level:enemyUnit.l,inten:enemyUnit.it,type:r(1,5),});
                                common.registerEquip({equip:newWeapon,game:this.game,});
                                award.equipList.push(newWeapon);
                            }
                        }
                    }

                    // BOSS战
                    if(mode==2){
                        // 改变地图
                        let oMap = getMatchList(this.game.mapList,[['id',this.map.id]])[0];
                        oMap.coreDefeat = true;
                        oMap.coreIndex = -1;
                        for(let cell of this.map.cellList){
                            cell.show = 1;
                            cell.enemy = 0;
                            delete cell.core;
                        }
                        for(let enemyUnit of enemyTeam){
                            // 改变 wanted
                            let wanted = getMatchList(this.game.wantedList,[['id',enemyUnit.id]])[0];
                            if(wanted&&(wanted.s==1||wanted.s==0)){ // 若悬赏中，则设置为已领取
                                wanted.s = 3;
                            }
                            // 警戒值
                            award.guard = -this.map.guard;
                            // 灵感指数
                            award.x += Math.ceil(enemyUnit.btd.score*.05);
                            // 服饰装备
                            for(let i=0;i<3;i++){
                                let newEquip = common.genEquipData({game:this.game,level:enemyUnit.l+1,type:r(2,5),});
                                common.registerEquip({equip:newEquip,game:this.game,});
                                award.equipList.push(newEquip);
                            }
                            // 武器
                            let newWeapon = common.genEquipData({game:this.game,level:enemyUnit.l+1,type:1,});
                            common.registerEquip({equip:newWeapon,game:this.game,});
                            award.equipList.push(newWeapon);
                        }
                        award.title = `击败核心`;
                    }

                    // 屈服的敌人加入酒馆
                    for(let enemyUnit of enemyTeam){
                        if(common.isCrumble(enemyUnit)){
                            common.registerUnit({
                                unit:enemyUnit,
                                equipList: map.tempGame.allEquips,
                                skillList: map.tempGame.allSkills,
                                goTarven: true,
                                game: this.game,
                            });
                        }
                    }

                    // award 赋值
                    this.map.guard += award.guard;
                    this.map.guard = setInRange(this.map.guard,0,100);
                    if(this.map.battery){
                        this.map.battery[0] += award.battery;
                        this.map.battery[0] = setInRange(this.map.battery[0],0,this.map.battery[1]);
                    }
                    oLeader.g += award.gold;
                    oLeader.g = setInRange(oLeader.g,0,Infinity);
                    if(autoGather){ // 自动集结金币给leader
                        for(let unit of this.team){
                            if(unit.id!=oLeader.id){
                                let oUnit = getMatchList(this.game.allUnits,[['id',unit.id]])[0];
                                let gold = oUnit.g;
                                oUnit.g -= gold;
                                oLeader.g += gold;
                            }
                        }
                    }
                    common.skillXIncrease(award.x,this.game);
                    for(let equip of award.equipList){
                        oLeader.b.push(equip.id);
                    }

                    this.award = award;
                }
                else if(result==0){ // 离开营地

                }
            }
        },

        equipOn(equip,unit,seq){ // 装上装备
            let type = equip.t, slotIndex;
            if(type==1){ // 手
                slotIndex = seq-1;
            }
            else if(type==4){ // 首饰
                slotIndex = seq+1;
            }
            else{ // 头、身体、脚
                slotIndex = [0,0,5,4,0,6,][type];
            }
            let oUnit = getMatchList(this.game.allUnits,[['id',unit.id]])[0];
            let oldEquipId = oUnit.es[slotIndex];
            if(oldEquipId>0){ // 如果原来的槽位上有其他装备，则把这个装备放入背包
                oUnit.b.push(oUnit.es[slotIndex]);
            }
            oUnit.es[slotIndex] = equip.id;
            oUnit.b = removeFromNumberList(equip.id,oUnit.b);
            this.asynTeam();
            this.asynInmates();
        },
        equipOff(equip,unit){ // 卸下装备
            let oUnit = getMatchList(this.game.allUnits,[['id',unit.id]])[0];
            let oldSlot;//装备原先所在 es 中的槽位
            for(let i=0;i<oUnit.es.length;i++){
                if(oUnit.es[i]==equip.id){
                    oldSlot = i;
                    break;
                }
            }
            oUnit.es[oldSlot] = 0;
            oUnit.b.push(equip.id);
            this.asynTeam();
            this.asynInmates();
        },
        moveEquipList(toUnit,fromUnit,equipList){ // 转移装备数组
            let oTo = getMatchList(this.game.allUnits,[['id',toUnit.id]])[0];
            let oFrom = getMatchList(this.game.allUnits,[['id',fromUnit.id]])[0];
            for(let equip of equipList){
                oFrom.b = removeFromNumberList(equip.id,oFrom.b);
                oTo.b.push(equip.id);
            }
        },

        calcTotalMoney(){ // 计算总金币数
            let res = 0;
            for(let unit of this.team){
                res += unit.g;
            }
            return res;
        },
        calcShopRefreshRemainDays(){ // 计算商品更新剩余天数
            let res;
            res = CONFIG.shopRefreshInterval-this.game.day%CONFIG.shopRefreshInterval;
            return res;
        },
        calcBgName(){ // 计算背景图片名
            let res = '';
            if(this.state==1){
                res = `bg-town-1`;
            }
            else if(this.state==2){
                res = `bg-battle-${this.map.id-101}`;
            }
            return res;
        },

        onUnitDragEnd(e){ // 当单位拖拽结束
            for(let i=0;i<this.team.length;i++){
                let member = this.team[i];
                let oUnit = getMatchList(this.game.allUnits,[['id',member.id]])[0];
                if(oUnit){
                    oUnit.tms = i+1;
                }
            }
            this.asynTeam();
        },
        onSkillDragEnd(e){ // 当技能拖拽结束
            let skillList = this.selectingUnit.btd.skillList;
            for(let i=0;i<skillList.length;i++){
                let skill = skillList[i];
                let oSkill = getMatchList(this.game.allSkills,[['id',skill.id]])[0];
                if(oSkill){
                    oSkill.o = i+1;
                }
            }
        },

        onTapUnit(unit){ // 点击【单位】
            if(this.banReactive) return;
            if(this.selectingUnit&&this.movingEquipList.length>0){ // 如果正在转移装备
                if(unit.id!=this.selectingUnit.id){ // 点击的不是本人
                    this.moveEquipList(unit,this.selectingUnit,this.movingEquipList);
                    this.movingEquipList = [];
                    this.coverTip = ``;
                    this.asynTeam();
                    this.asynInmates();
                }
            }
            else if(this.showMoneyTrasferCover){ // 如果正在转移金币
                if(this.transferringMoney==0){
                    this._alert(`请先选择金币数量`);
                }
                else if(this.selectingUnit.id==unit.id){

                }
                else{
                    let oFrom = getMatchList(this.game.allUnits,[['id',this.selectingUnit.id]])[0];
                    let oTo = getMatchList(this.game.allUnits,[['id',unit.id]])[0];
                    oTo.g += this.transferringMoney;
                    oFrom.g -= this.transferringMoney;
                    this.showMoneyTrasferCover = false;
                    this.transferringMoney = 0;
                    this.asynTeam();
                    this.asynInmates();
                }
            }
            else{ // 普通点击
                this.setViewingUnit(unit,1);
            }
        },
        onTapInmate(unit){ // 点击【酒馆客人】
            if(this.banReactive) return;
            let btd = common.getUnitBtd(unit,this.game);
            this.selectingUnit = unit;
            this.selectingUnit.btd = btd;
            this.showUnitPop = true;
        },
        onTapSkill(data){ // 点击【技能】
            if(this.banReactive) return;
            let { flag, skill, buffId, buffLevel, text, } = data;
            if(flag==1){ //

            }
            else if(flag==2&&buffId&&buffLevel){ // 点击buff
                this.onTapBuff(buffId,buffLevel);
            }
            else if(flag==3&&text){ // 发送说明弹窗
                this._alert(text);
            }
            else if(flag==4){ // 学习技能
                console.log(`学习技能`,skill);
                this._confirm(`确定要复制技能 “${skill.n}” 吗？`,_=>{
                    if(this.game.xp>0){
                        let oMe = getMatchList(this.game.allUnits,[['id',this.me.id]])[0];
                        oMe.ss.push(skill.id);
                        this.game.xp -= 1;
                        if(this.game.xp<=0){
                            this.showSkillCopy = false;
                        }
                        this.asynTeam();
                        this.asynInmates();
                        this._alert(`${this.me.nm} 复制了技能 “${skill.n}”`,5);
                    }
                    else{
                        this._alert(`灵感点数不够`);
                    }
                });
            }
        },
        onTapEquip(data){ // 点击【装备】
            if(this.banReactive) return;
            let { flag, equip, buffId, buffLevel, sp, spLevel, } = data;
            if(equip&&equip.id){
                this.selectingEquipId = equip.id;
            }
            if(flag==1){ //
                // console.log(equip);
            }
            else if(flag==2){ // 点击buff
                this.onTapBuff(buffId,buffLevel);
            }
            else if(flag==3){ // 点击SP
                this._alert(`${CONFIG.spAttackList[sp-1]}：${CONFIG.spAttackDescList[sp-1]}`,5);
            }
        },
        onTapBuff(id,level){ // 点击【buff】
            if(this.banReactive) return;
            let buff = getMatchList(BUFF_LIST,[['id',id]])[0]||{};
            this._alert(`给予${buff.good?'':'失防'}目标：${buff.name}（强度${level}）- ${buff.desc}`,5);
        },
        onTapBrand(){ // 点击【标牌】
            if(this.banReactive) return;
            this.showTarven = false;
            this.onTapCloseTemple();
        },
        onTapBeer(){ // 点击【啤酒】
            if(this.banReactive) return;
            this.showTarven = !this.showTarven;
            this.selling = this.showTarven;
            this.showUnitPop = false;
        },
        onTapSwitchMember(equip){ // 点击【切换队员】
            if(this.banReactive) return;
            let index;
            if(this.viewingUnit&&this.viewingUnit.id){
                for(let i=0;i<this.team.length;i++){
                    if(this.team[i].id==this.viewingUnit.id){
                        index = i;
                    }
                }
            }
            index++;
            if(index>this.team.length-1){
                index = 0;
            }

            this.setViewingUnit(this.team[index]);
        },
        onTapNavi(navi){ // 点击【导航】
            if(this.banReactive) return;
            let { id, size, floors, } = navi;
            let { flagIndexes, flagMarks, coreIndex, coreMark, } = getMatchList(this.game.mapList,[['id',id]])[0];
            let map = cloneObj(navi);
            /*  地图数据
                map = {
                    bosses: [],
                    conquered: false,
                    floors: [],
                    id: 102,
                    level: 1,
                    links: [],
                    name: `活死人墓穴`,
                    size: 4,
                    type: 2,

                    cellList: [{ // 单元格数组
                        id: 1,
                        show: false,
                        flag: true,
                        core: false,
                        marked: false, // 是否显示路标或核心标识
                        enemy: 0, // 0无敌人 1+敌人数量
                    },...],
                    guard: 19, // 警戒值 0-100
                }
            */

            // 生成 cellList
            let cellCount = size*size, cellList = [];
            for(let i=0;i<cellCount;i++){
                let newCell = {
                    id: i+1,
                    show: false,
                }
                let flagIndex = arrContains(flagIndexes,i);
                if(flagIndex!=-1){ // 路标
                    newCell.flag = true;
                    if(flagMarks[flagIndex]){
                        newCell.marked = true;
                    }
                }
                if(coreIndex==i){ // 核心
                    newCell.core = true;
                    if(coreMark){
                        newCell.marked = true;
                    }
                }
                cellList.push(newCell);
            }
            // 生成敌人配置
            let enemyCount = cellCount/2+r(0,size);
            let enemyDistributionList = [];
            for(let i=0;i<cellCount;i++){
                enemyDistributionList.push(i);
            }
            enemyDistributionList = shuffle(enemyDistributionList);
            for(let i=0;i<enemyCount;i++){
                if(!cellList[enemyDistributionList[i]].core){
                    cellList[enemyDistributionList[i]].enemy = r(1,(navi.level<3)?3:4);
                }
            }
            // 配备电池
            let battery = cellCount*15;
            map.battery = [battery,battery]

            map.cellList = cellList;
            map.guard = CONFIG.initGuard;
            this.map = map;
            this.state = 2;
            this.dayPass();
        },

        onTapTransferMoney(){ // 点击【转移金币】
            if(this.banReactive) return;
            if(this.selectingUnit.g<1||this.team.length<2){
                this._alert(`无法转移`);
            }
            else{
                this.showMoneyTrasferCover = true;
                this.transferringMoney = 1;
            }
        },
        onTapArrowPop(){ // 点击【弹窗-箭头】
            if(this.banReactive) return;
            this.popUnitTab = [2,3,1,][this.popUnitTab-1];
        },
        onTapViewingBodyEquip(equipIndex){ // 点击【弹窗-单位-已着装备】
            if(this.banReactive) return;
            let equip = this.selectingUnit.btd.equipList[equipIndex];
            if(equip&&equip.id){
                this.selectingUnitBodyEquipIndex = (this.selectingUnitBodyEquipIndex!=-1)?-1:equipIndex;
                // 滚动条置顶
                let pcDom = this.$refs[`pop-content`].$refs[`pop`];
                if(pcDom){
                    pcDom.scroll({
                        top: 0,
                        behavior: 'smooth',
                    });
                }
            }
            else{
                this.selectingUnitBodyEquipIndex = -1;
            }
        },
        onTapAllMoneyTransfer(){ // 点击【弹窗-金币转移-全部】
            if(this.banReactive) return;
            this.transferringMoney = this.selectingUnit.g;
        },

        onTapEquipOff(equip,unit){ // 点击【卸下装备】
            if(this.banReactive) return;
            if(this.selectingUnitBodyEquipIndex>=0){
                this.selectingUnitBodyEquipIndex = -1;
            }
            this.equipOff(equip,unit);
        },
        onTapAllEquipOff(unit){ // 点击【全卸下】
            if(this.banReactive) return;
            let equipList = unit.es;
            if(this.selectingUnitBodyEquipIndex>=0){
                this.selectingUnitBodyEquipIndex = -1;
            }
            for(let equipId of equipList){
                let equip = getMatchList(this.game.allEquips,[['id',equipId]])[0];
                if(equip){
                    this.equipOff(equip,unit);
                }
            }
        },
        onTapEquipOn(equip,unit,seq){ // 点击【装上装备】
            if(this.banReactive) return;
            this.equipOn(equip,unit,seq);
        },
        onTapMoveEquip(equip){ // 点击【转移装备】
            if(this.banReactive) return;
            this.movingEquipList = [equip];
            this.coverTip = `请选择转移目标：`;
        },
        onTapMoveBag(equipList){ // 点击【全转移】
            if(this.banReactive) return;
            this.movingEquipList = equipList;
            this.coverTip = `共 ${equipList.length} 件装备，请选择转移目标：`;
        },
        onTapSellEquip(equip,seller){ // 点击【售卖装备】
            if(this.banReactive) return;
            let oSeller = getMatchList(this.game.allUnits,[['id',seller.id]])[0];
            let buyer = this.bartender;
            let price = common.getSellPrice(equip);
            this.moveEquipList(buyer,seller,[equip]);
            oSeller.g += price;
            this.asynTeam();
            this.asynBartender();
            this.asynInmates();
            this._alert(`已售卖 ${equip.n}`);
        },
        onTapSellBag(equipList,seller){ // 点击【全售卖】
            if(this.banReactive) return;
            let opEquipList = [];
            for(let equip of equipList){
                if(!equip.hl){
                    opEquipList.push(equip);
                }
            }
            this._confirm(`确定售卖全部未标记装备吗？<br/>（共 ${opEquipList.length} 个）`,_=>{
                let oSeller = getMatchList(this.game.allUnits,[['id',seller.id]])[0];
                let buyer = this.bartender;
                let price = common.getSellAllPrice(seller,false);
                this.moveEquipList(buyer,seller,opEquipList);
                oSeller.g += price;
                this.asynTeam();
                this.asynBartender();
                this.asynInmates();
                this._alert(`已售卖 ${opEquipList.length} 个装备`);
            });
        },
        onTapBuyEquip(equip,price,seller,buyer){ // 点击【购买装备】
            if(this.banReactive) return;
            let money = buyer.g;
            if(money>=price){
                let oBuyer = getMatchList(this.game.allUnits,[['id',buyer.id]])[0];
                let oSeller = getMatchList(this.game.allUnits,[['id',seller.id]])[0];
                oSeller.b = removeFromNumberList(equip.id,oSeller.b);
                oBuyer.b.push(equip.id);
                oBuyer.g -= price;
                oSeller.g += price;
                this.asynTeam();
                this.asynBartender();
                this._alert(`${equip.n} 已进入 ${buyer.nm} 的背包中`,5);
            }
            else{
                this._alert(`${buyer.nm} 的金币不足`);
            }
            // console.log(`点击【购买装备】`,equip,price,seller,buyer);
        },
        onTapHighLightEquip(equip,unit){ // 点击【高亮装备】
            if(this.banReactive) return;
            let oEquip = getMatchList(this.game.allEquips,[['id',equip.id]])[0];
            oEquip.hl = [1,0][oEquip.hl];
            this.asynTeam();
            this.asynInmates();
        },
        onTapLogout(){ // 点击【销号】
            if(this.banReactive) return;
            this._confirm(`确定删除本次游戏所有存档吗？`,_=>{
                this.logout();
            });
        },
        onTapAvatar(unit){ // 点击【头像】
            let avatarTemplate = common.calcAvatarData(unit);
            this.viewingAvatar = JSON.parse(avatarTemplate);
            this.$nextTick(_=>{
                let cvs = this.$refs.avatar_cvs;
                if(cvs){
                    this.ctx = cvs.getContext(`2d`);
                    if(this.ctx&&this.viewingAvatar){
                        paintAvatar(this.ctx,this.viewingAvatar,CVSLEN,CVSLEN);
                    }
                }
            });
        },
        onTapChallenge(unit){ // 点击【单挑】
            if(this.banReactive) return;
            let playerTeamIds = [this.me.id];
            let enemyTeamIds = [unit.id];
            this.goBattle({mode:3,playerTeamIds,enemyTeamIds,});
        },
        onTapHire(unit){ // 点击【雇佣】
            if(this.banReactive) return;
            let employer = getMatchList(this.game.allUnits,[['id',this.viewingUnit.id]])[0];
            let oUnit = getMatchList(this.game.allUnits,[['id',unit.id]])[0];
            let price = unit.btd.price;
            if(employer.g>=price){
                this._confirm(`确定雇佣 ${oUnit.nm} 吗？`,_=>{
                    oUnit.rel = 2;
                    employer.g -= price;
                    this.asynTeam();
                    this.asynInmates();
                    this._alert(`欢迎新队友：${oUnit.nm} ！`,5);
                });
            }
            else{
                this._alert(`${employer.nm} 的金币不足`);
            }
        },
        onTapJoinTeam(unit){ // 点击【入队】
            if(this.banReactive) return;
            let oUnit = getMatchList(this.game.allUnits,[['id',unit.id]])[0];
            if(this.team.length<4){
                oUnit.rel = 3;
                oUnit.tms = 99;
                this.showUnitPop = false;
                this.asynTeam();
                this.asynInmates();
            }
            else{
                this._alert(`队伍人数已满`);
            }
        },
        onTapLeavTeam(unit){ // 点击【离队】
            if(this.banReactive) return;
            let oUnit = getMatchList(this.game.allUnits,[['id',unit.id]])[0];
            oUnit.rel = 2;
            if(this.viewingUnit.id==unit.id){
                this.showUnitPop = false;
                this.viewingUnit = this.me;
            }
            this._alert(`${unit.nm} 已回到酒馆`,5);
            this.asynTeam();
            this.asynInmates();
        },
        onTapLeader(unit,teamIndex){ // 点击【Leader】
            if(this.banReactive) return;
            if(teamIndex==this.game.leaderIndex-1){ // 取消leader
                this.game.leaderIndex = 0;
            }
            else{ // 设为leader
                this.game.leaderIndex = teamIndex+1;
            }
            this.asynTeam();
        },
        onTapChatButton(){ // 点击【聊天】
            if(this.banReactive) return;
            this.coverTip = `酒保·${this.bartender.nm}：`+CONFIG.bartenderChats[r(0,CONFIG.bartenderChats.length-1)];
        },
        onTapRestButton(){ // 点击【住宿】
            if(this.banReactive) return;
            this._confirm(`是否消耗 1 天的时间休息，完全恢复生命和精力？`,_=>{
                this.dayPass();
                for(let unit of this.game.allUnits){
                    common.recoverUnit(unit,this.game);
                }
                this.asynTeam();
                this.asynBartender();
                this.asynInmates();
                this._alert(`所有人状态恢复`);
            });
        },
        onTapBankButton(){ // 点击【存取】
            if(this.banReactive) return;
            this.showBankCover = !this.showBankCover;
        },
        onTapSwitchBankMode(flag){ // 点击【金库-模式切换】
            this.bank.mode = flag;
        },
        onTapBankAllMoney(flag){ // 点击【金库-全】
            if(this.banReactive) return;
            if(flag==1){ // 存入
                this.bank.saveMoney = this.viewingUnit.g;
            }
            else{ // 取出
                this.bank.drawMoney = this.game.bank;
            }
        },
        onTapBankConfirm(flag){ // 点击【金库-确认】
            if(this.banReactive) return;
            let oUnit = getMatchList(this.game.allUnits,[['id',this.viewingUnit.id]])[0];
            if(flag==1&&this.bank.saveMoney>0){ // 存入
                oUnit.g -= this.bank.saveMoney;
                this.game.bank += this.bank.saveMoney;
                this.bank.saveMoney = 0;
                this._alert(`金币已入库`);
            }
            else if(flag==2&&this.bank.drawMoney>0){ // 取出
                oUnit.g += this.bank.drawMoney;
                this.game.bank -= this.bank.drawMoney;
                this.bank.drawMoney = 0;
                this._alert(`金币已出库`);
            }
            this.asynTeam();
        },
        onTapSellButton(){ // 点击【当卖】
            if(this.banReactive) return;
            this.showUnitPop = true;
            let viewingUnit = this.viewingUnit||this.me;
            this.setViewingUnit(viewingUnit,true,_=>{
                this.popUnitTab = 2;
            });
        },
        onTapCheckWanted(wanted){ // 点击【领取赏金】
            if(this.banReactive) return;
            let oWanted = getMatchList(this.game.wantedList,[['id',wanted.id]])[0];
            if(oWanted&&oWanted.s==3){
                let award = oWanted.g;
                this.me.g += award;
                oWanted.s = 4;
                this.asynTeam();
                this._alert(`${this.me.nm}获得赏金 ${common.moneyFormat(award)} $`);
            }
        },
        onTapXPointBar(){ // 点击【灵感进度条】
            if(this.banReactive) return;
            this._alert(`每次战斗后积累，槽满后可复制非敌对角色的一个技能`,5);
        },
        onTapClosePop(){ // 点击【弹窗-关闭】
            if(this.banReactive) return;
            this.resetViewingUnitPopData();
            this.showGuide = false;
            this.award = {
                show: false,
                gold: 0,
                guard: 0,
                equipList: [],
            }
        },

        onTapGear(){ // 点击【齿轮】
            if(this.banReactive) return;
            this.showGearPop = !this.showGearPop;
        },
        onTapSave(){ // 点击【齿轮-存档】
            if(this.banReactive) return;
            this.save(1);
        },
        onTapGuide(){ // 点击【齿轮-指引】
            if(this.banReactive) return;
            this.showGuide = !this.showGuide;
        },
        onTapExit(){ // 点击【齿轮-回到主界面】
            if(this.banReactive) return;
            if(this.state==2){
                this._confirm(`游戏数据将回到上一次存档，确定退出吗？`,_=>{
                    this.$router.push('/');
                });
            }
            else{
                this.$router.push('/');
            }
        },
        onTapCover(){ // 点击【遮罩层】
            if(this.banReactive) return;
            this.coverTip = ``;
            this.viewingAvatar = null;
            this.movingEquipList = [];
            this.transferringMoney = 0;
            this.showMoneyTrasferCover = false;
            this.showBankCover = false;
            this.bank = {
                mode:1,
                drawMoney:0,
                saveMoney:0,
            }
        },

        /* 地牢 */
        onTapGuard(){ // 点击【警戒栏位】
            if(this.banReactive) return;
            this._alert(`警戒值越高，敌人越强大，装备掉落率也越高`,10);
        },
        onTapCell(cell,index){ // 点击【单元格】
            if(this.banReactive) return;
            cell.show = true;
            // 同步这张地图的路标与核心数据的标记状态
            let gameMap = getMatchList(this.game.mapList,[['id',this.map.id]])[0];
            let remainEnemyCellCount = 0;
            for(let cellIndex=0;cellIndex<this.map.cellList.length;cellIndex++){
                let tCell = this.map.cellList[cellIndex];
                if(tCell.show){
                    let flagMarkIndex = arrContains(gameMap.flagIndexes,cellIndex); //
                    if(flagMarkIndex>-1){
                        gameMap.flagMarks[flagMarkIndex] = 1;
                    }
                    if(gameMap.coreIndex==cellIndex){
                        gameMap.coreMark = 1;
                    }
                }
                if(tCell.enemy){
                    remainEnemyCellCount++;
                }
            }
            // 如果有敌人
            if(cell.enemy){
                let playerTeamIds = Array.from(this.team,unit=>{
                    return unit.id;
                });
                // 如果是地图最后一个敌对单元格，则强化敌人
                if(remainEnemyCellCount==1){
                    cell.enemy = 4;
                }
                // 生成随机敌人数据（unit, equips, skills），并保存至 battle.tempGame 中
                let enemyTeamIds = [];
                let { guard, level, floors, } = this.map;
                let tempGame = cloneObj(this.game);
                let guardLevel = common.calcGuardLevel(this.map);
                let enemyList = [];
                for(let i=0;i<cell.enemy;i++){
                    let inten = 0;
                    if(remainEnemyCellCount==1){ // 如果是地图最后一个敌对单元格，则强化敌人
                        inten = guardLevel;
                    }
                    else{
                        inten = r(0,guardLevel);
                    }
                    let enemy = common.genUnit({
                        id: tempGame.unitIndex++,
                        game: tempGame,
                        level,
                        nickname: floors[inten].title,
                        inten,
                        equipList: tempGame.allEquips,
                        skillList: tempGame.allSkills,
                    });
                    // 设置金币
                    let gold = this.map.floors[inten].award*10;
                    gold = cl(gold+r(0,gold*.33));
                    enemy.g = gold;
                    // 属性调整
                    if(this.map.level==1){ // 1级地图
                        if(inten==0){ // 流浪者没有装备和技能
                            enemy.b = [];
                            enemy.es = [];
                            enemy.ss = [];
                        }
                        else if(inten==1){ // 盗墓贼没有技能
                            enemy.ss = [];
                        }
                    }
                    enemyList.push(enemy);
                }
                for(let enemy of enemyList){
                    let newEnemy = common.registerUnit({
                        unit: enemy,
                        game: tempGame,
                        equipList: tempGame.allEquips,
                        skillList: tempGame.allSkills,
                    });
                    common.recoverUnit(newEnemy,tempGame);
                    enemyTeamIds.push(newEnemy.id);
                }
                this.map.curCellIndex = index;

                this.banReactive = true;
                setTimeout(_=>{
                    this.banReactive = false;
                    this.goBattle({playerTeamIds,enemyTeamIds,game:tempGame});
                },400);
            }
        },
        onTapLeaveDungeon(){ // 点击【离开地牢】
            if(this.banReactive) return;
            this._confirm(`确定返回龙虾村吗？`,_=>{
                this.backToShrimp();
            });
        },
        onTapDungeonCore(){ // 点击【进入核心】
            if(this.banReactive) return;
            this._confirm(`确定迎战本地牢的BOSS吗？`,_=>{
                let playerTeamIds = Array.from(this.team,unit=>{
                    return unit.id;
                });
                // 生成BOSS数据
                let enemyTeamIds = [];
                let { guard, level, floors, bosses, } = this.map;
                let tempGame = cloneObj(this.game);
                let enemyList = [];
                for(let i=0;i<bosses.length;i++){
                    let oBoss = getMatchList(this.game.allUnits,[['id',bosses[i].id]])[0];
                    let boss = cloneObj(oBoss);
                    enemyList.push(boss);
                }
                for(let enemy of enemyList){
                    let newEnemy = common.registerUnit({
                        unit: enemy,
                        game: tempGame,
                        equipList: tempGame.allEquips,
                        skillList: tempGame.allSkills,
                    });
                    common.recoverUnit(newEnemy,tempGame);
                    enemyTeamIds.push(newEnemy.id);
                }
                this.goBattle({playerTeamIds,enemyTeamIds,game:tempGame,mode:2});
            });
        },
        onTapBonfire(){ // 点击【营地】
            if(this.banReactive) return;
            this._confirm(`进入营地会消耗 5 点能源，是否进入？`,_=>{
                let playerTeamIds = Array.from(this.team,unit=>{
                    return unit.id;
                });
                this.map.battery[0] -= 5;
                this.map.battery[0] = setInRange(this.map.battery[0],0,this.map.battery[1]);
                this.goBattle({mode:4,playerTeamIds,});
            });
        },
        onTapBattery(){ // 点击【电池】
            if(this.banReactive) return;
            this._alert(`每次行动都会消耗能源储备，能源枯竭后自动判定全队战败`,10);
        },
        onTapTemple(){ // 点击【神庙】
            if(this.banReactive) return;
            if(this.viewingUnit){
                this.initTemple();
                this.showTemple = true;
            }
        },
        onTapCloseTemple(){ // 点击【关闭神庙】
            if(this.banReactive) return;
            this.showTemple = false;
            this.temple = {
                tag: 1,
                skillList: [],
                equipList: [],
                baseEquip: null,
                previewSkill: null,
            };
        },
        onTapTempleRemoveEquip(){ // 点击【神秘-移出熔炉】
            if(this.banReactive) return;
            this.temple.baseEquip = null;
            this.asynTemple();
        },
        onTapTempleEquip(equip){ // 点击【神庙-装备】
            if(this.banReactive) return;
            if(!this.temple.baseEquip){ // 加入熔炉
                this.temple.equipList = [];
                this.$nextTick(_=>{
                    this.temple.baseEquip = equip;
                    this.asynTemple();
                    // 设置 tab-content 的滚动条到原有位置
                    this.$nextTick(_=>{
                        let tarvenDom = this.$refs[`temple-wrap`];
                        if(tarvenDom){
                            let domList = tarvenDom.$refs[`contentRef`];
                            if(domList){
                                domList.scrollTo({
                                    top: 0,
                                    behavior: 'smooth'  // 平滑滚动
                                });
                                setTimeout(_=>{
                                    domList.scrollTop = 0;
                                },100);
                            }
                        }
                    });
                });
            }
            else{ // 融合
                this._confirm(`确定要融合 ${equip.n} 的属性到 ${this.temple.baseEquip.n} 上吗（消耗警戒值50）？`,_=>{
                    if(this.map.guard>=50){
                        common.fuseEquip({baseEquip:this.temple.baseEquip,equip,unit:this.viewingUnit,game:this.game,});
                        this.map.guard -= 50;
                        this.map.guard = setInRange(this.map.guard,0,100);
                        this._alert(`融合成功！`);
                        this.asynTeam();
                        this.$nextTick(_=>{
                            this.initTemple();
                        });
                    }
                    else{
                        this._alert(`警戒值不足`);
                    }
                });
            }
        },
        onTapTempleViewSkill(skill,level){ // 点击【神庙-预览技能】
            if(this.banReactive) return;
            let previewSkill = common.genUpgradeSkillData({skill,level,game:this.game,});
            this.temple.previewSkill = null;
            this.$nextTick(_=>{
                this.temple.previewSkill = previewSkill;
            });
        },
        onTapTempleUpgradeSkill(){ // 点击【神庙-强化技能】
            if(this.banReactive) return;
            this._confirm(`确定强化 ${this.temple.previewSkill.n} 吗（消耗警戒值50）？`,_=>{
                if(this.map.guard>=50){
                    let oSkill = getMatchList(this.game.allSkills,[['id',this.temple.previewSkill.id]])[0];
                    for(let i=0;i<this.game.allSkills.length;i++){
                        if(this.game.allSkills[i].id==this.temple.previewSkill.id){
                            this.game.allSkills[i] = cloneObj(this.temple.previewSkill);
                        }
                    }
                    this.map.guard -= 50;
                    this.map.guard = setInRange(this.map.guard,0,100);
                    this._alert(`强化成功！`);
                    this.asynTeam();
                    this.$nextTick(_=>{
                        this.initTemple();
                    });
                }
                else{
                    this._alert(`警戒值不足`);
                }
            });
        },


        _alert(text,time){ // 显示提示
            this.$refs['toast-alert'].trigger(text,time);
        },
        _confirm(confirmTip,onTapConfirm){ // 显示确认文本
            this.$refs['toast-confirm'].showConfirm({ confirmTip, onTapConfirm, });
        },

        onTapCheat(){ // 点击【作弊】按钮
            let me = this.game.allUnits[1];
            me.g += 11123;
            this.map.guard += 50;
            this.map.guard = setInRange(this.map.guard,0,100);
            // common.skillXIncrease(55000,this.game);
            // for(let map of this.game.mapList){
            //     map.flagMarks = Array.from(map.flagMarks,_=>{
            //         return 1;
            //     });
            // }
            this.asynTeam();
        },
    },
    components:{
        Bar1,
        Bar2,
        Bar3,
        Equip,
        Skill,
        Toast,
        SwipeTabs,
        EquipList,
        UnitList,
        Unit1,
        Avatar,
        draggable,
        Pop,
        Dungeon,
        Cover,
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    @import '../style/home/main.css';
    @import '../style/home/banner.css';
    @import '../style/home/navis.css';
    @import '../style/home/guide.css';
    @import '../style/home/tarven.css';
    @import '../style/home/temple.css';
    @import '../style/home/team.css';
    @import '../style/home/pop.css';
    @import '../style/home/pop-board.css';
    @import '../style/home/pop-equip.css';
    @import '../style/home/pop-skill.css';
    @import '../style/home/pop-checkout.css';
</style>

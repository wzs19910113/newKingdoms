<template>
    <div class="main" v-if="game.factoryList">
        <!--系统操作-->
        <nut-drag direction="y" :style="{right:'0px',top:'24px'}">
            <a class="touch-dom" @click="showSystemMenu=true">系统<br/>菜单</a>
        </nut-drag>
        <!--作弊-->
        <nut-drag direction="y" :style="{right:'0px',top:'75px'}" v-if="DEBUG">
            <a class="touch-dom" @click="onTapCheat">CHEAT</a>
        </nut-drag>
        <!--页面内容-->
        <div class="panel">
            <div class="block">
                <!--工厂-->
                <div class="tab-panel" v-show="state==1">
                    <div class="row no-margin">
                        <h1 class="factory-name"><span>{{game.factoryList[0].name}} <a class="btn btn-edit" @click="showEditFactoryName=true">修改</a></span></h1>
                        <h4 class="my-name">董事长：<a class="orange" @click="jump(4,game.workerList[0].id)">{{game.workerList[0].name}}</a></h4>
                    </div>
                    <div class="row no-margin">
                        <div class="index">
                            <div class="index-cell left"><b>总资金: {{numFormat(game.factoryList[0].money)}} $</b></div>
                            <div class="index-cell left"><b>工厂形象: {{game.factoryList[0].image}}</b></div>
                            <div class="index-cell left"><b>房间搜索点数: {{game.factoryList[0].rrp}}</b></div>
                            <div class="index-cell left"><b>人力搜索点数: {{game.factoryList[0].hrp}}</b></div>
                            <div class="index-cell">
                                <b>
                                    形象代言人:
                                    <span v-if="tempData.imageAgent.name">
                                        <a class="orange" @click="jump(4,tempData.imageAgent.id)">{{tempData.imageAgent.name}}</a>
                                        <i>({{tempData.imageAgent.img}})</i>
                                    </span>
                                    <a class="btn btn-icon" @click="onTapAddWorker(1)">+</a>
                                    <a v-if="tempData.imageAgent.name" class="btn btn-icon" @click="onTapRemoveWorker(1)">-</a>
                                    <a v-if="tempData.imageAgent.name&&!game.factoryList[0].imageProped" class="btn" @click="onTapProp">形象宣传</a>
                                </b>
                            </div>
                        </div>
                    </div>
                    <div class="row" v-show="tempData.viewType==0">
                        <List title="房间列表" type="room" remark="双击查看" ref="roomList" option="工位情况" @onTapOption="tempData.viewType=1" :data="tempData.myRoomList" :columns="ROOM_LIST_COLUMN" @onDoubleTap="onDoubleTapRoom" :showTip="tip1" />
                    </div>
                    <div class="row" v-show="tempData.viewType==1">
                        <List title="房间列表" type="room" remark="双击查看" ref="roomList2" option="基本情况" @onTapOption="tempData.viewType=0" :data="tempData.myRoomList2" :columns="ROOM_LIST_5_COLUMN" @onDoubleTap="onDoubleTapRoom" :showTip="tip1" />
                    </div>
                    <div class="row" v-if="tempData.myAgentRoomList.length>0">
                        <List title="备用房间列表" type="room" ref="roomList3" :data="tempData.myAgentRoomList" :columns="ROOM_LIST_6_COLUMN" @onDoubleTap="onDoubleTapRoom" />
                    </div>
                    <div class="row" v-if="tempData.myAutoServiceRoomList.length>0">
                        <List title="自营房间列表" type="room" ref="roomList4" :data="tempData.myAutoServiceRoomList" :columns="ROOM_LIST_7_COLUMN" @onDoubleTap="onDoubleTapRoom" />
                    </div>
                </div>
                <!--房间-->
                <div class="tab-panel" v-if="tempData.room" v-show="state==2">
                    <div class="row no-margin">
                        <h2 class="room-name">{{tempData.room.name}}[ID{{tempData.room.id}}]<span> 等级{{tempData.room.level}}</span> <a class="btn btn-edit" @click="showEditRoom=true">操作</a></h2>
                    </div>
                    <div class="row no-margin">
                        <div class="index">
                            <div class="index-cell">
                                <b>电力: {{tempData.room.power}}</b>
                                <a class="btn btn-edit" @click="showAssignPower=true" v-if="tempData.room.power>0">分配</a>
                            </div>
                            <div class="index-cell"><b>策略: {{config.risk_name_map[tempData.room.risk-1]}}</b></div>
                            <div class="index-cell left">
                                <b>管理员:
                                    <span v-if="tempData.room.manager">
                                        <a class="orange" @click="jump(4,tempData.room.manager.id)">{{tempData.room.manager.name}}</a>
                                        <i>({{tempData.room.manager.com}})</i>
                                    </span>
                                    <a class="btn btn-icon" @click="onTapAddWorker(2)">+</a>
                                    <a v-if="tempData.room.manager" class="btn btn-icon" @click="onTapRemoveWorker(2)">-</a>
                                </b>
                            </div>
                            <div class="index-cell">
                                <b>维护工人:
                                    <span v-if="tempData.room.maintainer">
                                        <a class="orange" @click="jump(4,tempData.room.maintainer.id)">{{tempData.room.maintainer.name}}</a>
                                        <i>({{tempData.room.maintainer.str}})</i>
                                    </span>
                                    <a class="btn btn-icon" @click="onTapAddWorker(3)">+</a>
                                    <a v-if="tempData.room.maintainer" class="btn btn-icon" @click="onTapRemoveWorker(3)">-</a>
                                </b>
                            </div>
                            <!-- <div class="index-cell left"><b>老化: {{percent(tempData.room.durab,config.max_durab)}}%</b></div> -->
                            <div class="index-cell" v-if="tempData.room.level>=2">
                                <b>门面 <span v-if="tempData.room.basicImage>0">(基础门面+{{tempData.room.basicImage}})</span>:
                                <span v-if="tempData.room.imageAgent">
                                    <a class="orange" @click="jump(4,tempData.room.imageAgent.id)">{{tempData.room.imageAgent.name}}</a>
                                    <i>({{tempData.room.imageAgent.img}})</i>
                                </span>
                                <a class="btn btn-icon" @click="onTapAddWorker(4)">+</a>
                                <a v-if="tempData.room.imageAgent" class="btn btn-icon" @click="onTapRemoveWorker(4)">-</a>
                            </b></div>
                            <div class="index-cell" v-if="tempData.room.level>=3">
                                <b>工程师:
                                <span v-if="tempData.room.autoWorker">
                                    <a class="orange" @click="jump(4,tempData.room.autoWorker.id)">{{tempData.room.autoWorker.name}}</a>
                                    <i>({{tempData.room.autoWorker.int}})</i>
                                </span>
                                <a class="btn btn-icon" @click="onTapAddWorker(5)">+</a>
                                <a v-if="tempData.room.autoWorker" class="btn btn-icon" @click="onTapRemoveWorker(5)">-</a>
                            </b></div>
                            <div></div>
                            <div class="index-cell pct-wrap">
                                <b class="lab-name">协调:</b>
                                <div class="pct">
                                    <nut-progress :text-inside="true" :percentage="tempData.room.balance"></nut-progress>
                                </div>
                            </div>
                            <div class="index-cell pct-wrap">
                                <b class="lab-name">老化:</b>
                                <div class="pct">
                                    <nut-progress :text-inside="true" :percentage="percent(tempData.room.durab,config.max_durab)"></nut-progress>
                                </div>
                            </div>
                            <div class="index-cell pct-wrap" v-if="tempData.room.level>=3">
                                <b class="lab-name">自动化:</b>
                                <div class="pct">
                                    <nut-progress :text-inside="true" :percentage="percent(tempData.room.auto,config.max_auto)"></nut-progress>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <List title="终端列表" remark="双击查看" ref="terminalList" :vScroll="true" :data="tempData.myTerminalList" :columns="TERMINAL_LIST_COLUMN" @onDoubleTap="onDoubleTapTerminal" :showTip="tip2" />
                    </div>
                    <div class="row">
                        <List title="房间人员" remark="双击查看" ref="roomWorkerList" :data="tempData.myRoomWorkerList" :columns="WORKER_LIST_3_COLUMN" @onDoubleTap="onDoubleTapRoomWorker" />
                    </div>
                </div>
                <!--终端-->
                <div class="tab-panel" v-if="tempData.terminal" v-show="state==3">
                    <div class="row no-margin">
                        <!-- <h2 class="room-name">{{tempData.terminal.room.name}}的终端[ID{{tempData.terminal.id}}] <a class="btn btn-edit" @click="showEditTerminal=true">操作</a></h2> -->
                        <h2 class="room-name">{{tempData.terminal.room.name}}的终端[ID{{tempData.terminal.id}}]</h2>
                    </div>
                    <div class="row">
                        <div class="index">
                            <div class="index-cell">
                                <b>操作员:
                                    <span v-if="tempData.terminal.operator&&tempData.terminal.operator.id">
                                        <a class="orange" @click="jump(4,tempData.terminal.operator.id)">{{tempData.terminal.operator.name}}</a>
                                        <i v-if="tempData.terminal.operator[['str','int','com','str'][tempData.terminal.operator.job-1]]">({{tempData.terminal.operator[['str','int','com','str'][tempData.terminal.operator.job-1]]}})</i>
                                    </span>
                                    <a class="btn btn-icon" @click="onTapAddWorker(6)">+</a>
                                    <a v-if="tempData.terminal.operator&&tempData.terminal.operator.id" class="btn btn-icon" @click="onTapRemoveWorker(6)">-</a>
                                </b>
                            </div>
                            <div class="index-cell">
                                <b>执行:
                                    <span>{{tempData.terminal.job||'-'}}</span>
                                    <a v-if="tempData.terminal.operator&&tempData.terminal.operator.id" class="btn btn-icon" @click="onTapAddJob(tempData.terminal)">+</a>
                                </b>
                            </div>
                            <!-- <div class="index-cell"><b>老化: {{percent(tempData.terminal.durab,config.max_durab)}}%</b></div> -->
                            <div class="index-cell pct-wrap"><b>老化:</b>&nbsp;<div class="pct"><nut-progress :text-inside="true" :percentage="percent(tempData.terminal.durab,config.max_durab)"></nut-progress></div></div>
                            <div class="index-cell index-lg">
                                <b>供电等级:</b>
                                <span class="level-bar" :class="`level-bar-${tempData.terminal.powerLevel}`" v-for="i in tempData.terminal.powerLevel"></span>
                                <span class="level-text">{{tempData.terminal.powerLevel}}</span>
                                <a class="btn btn-lvlup" v-if="tempData.terminal.powerLevel<config.max_terminal_level" @click="onTapTerminalLevelUp('power')">升级（{{config.power_levelup_cost[tempData.terminal.powerLevel-1]}} $）</a>
                            </div>
                            <div class="index-cell index-lg">
                                <b>挖矿等级:</b>
                                <span class="level-bar" :class="`level-bar-${tempData.terminal.digLevel}`" v-for="i in tempData.terminal.digLevel"></span>
                                <span class="level-text">{{tempData.terminal.digLevel}}</span>
                                <a class="btn btn-lvlup" v-if="tempData.terminal.digLevel<config.max_terminal_level" @click="onTapTerminalLevelUp('dig')">升级（{{config.dig_levelup_cost[tempData.terminal.digLevel-1]}} $）</a>
                            </div>
                            <div class="index-cell index-lg">
                                <b>交易等级:</b>
                                <span class="level-bar" :class="`level-bar-${tempData.terminal.tradeLevel}`" v-for="i in tempData.terminal.tradeLevel"></span>
                                <span class="level-text">{{tempData.terminal.tradeLevel}}</span>
                                <a class="btn btn-lvlup" v-if="tempData.terminal.tradeLevel<config.max_terminal_level" @click="onTapTerminalLevelUp('trade')">升级（{{config.trade_levelup_cost[tempData.terminal.tradeLevel-1]}} $）</a>
                            </div>
                        </div>
                    </div>
                </div>
                <!--人员-->
                <div class="tab-panel" v-if="tempData.myWorkerList" v-show="state==4">
                    <div class="row no-margin">
                        <h2 class="room-name">人员管理<!--<a class="btn btn-edit" @click="showEditWorkerPage=true">操作</a>--></h2>
                    </div>
                    <div class="row no-margin">
                        <div class="index filter">
                            <a class="btn" :class="{'select':filter==1&&searchingWorkerID==0}" @click="onTapWorkerListFilter(1)">所有人员</a>
                            <a class="btn" :class="{'select':filter==8&&searchingWorkerID==0}" @click="onTapWorkerListFilter(8)">空闲</a><br/>
                            <a class="btn" :class="{'select':filter==2&&searchingWorkerID==0}" @click="onTapWorkerListFilter(2)">发电</a>
                            <a class="btn" :class="{'select':filter==3&&searchingWorkerID==0}" @click="onTapWorkerListFilter(3)">挖矿</a>
                            <a class="btn" :class="{'select':filter==4&&searchingWorkerID==0}" @click="onTapWorkerListFilter(4)">交易</a>
                            <a class="btn" :class="{'select':filter==5&&searchingWorkerID==0}" @click="onTapWorkerListFilter(5)">终端维护</a><br/>
                            <a class="btn" :class="{'select':filter==11&&searchingWorkerID==0}" @click="onTapWorkerListFilter(11)">管理员</a>
                            <a class="btn" :class="{'select':filter==12&&searchingWorkerID==0}" @click="onTapWorkerListFilter(12)">房间维护</a>
                            <a class="btn" :class="{'select':filter==13&&searchingWorkerID==0}" @click="onTapWorkerListFilter(13)">门面</a>
                            <a class="btn" :class="{'select':filter==14&&searchingWorkerID==0}" @click="onTapWorkerListFilter(14)">自动化</a><br/>
                            <a class="btn" :class="{'select':filter==6&&searchingWorkerID==0}" @click="onTapWorkerListFilter(6)">房间搜索</a>
                            <a class="btn" :class="{'select':filter==7&&searchingWorkerID==0}" @click="onTapWorkerListFilter(7)">人力搜索</a>
                            <a v-if="game.factoryList[0].canViewRelation" class="btn" :class="{'select':filter==9&&searchingWorkerID==0}" @click="onTapWorkerListFilter(9)">外交员</a>
                            <a v-if="game.factoryList[0].canViewRelation" class="btn" :class="{'select':filter==10&&searchingWorkerID==0}" @click="onTapWorkerListFilter(10)">间谍</a>
                        </div>
                    </div>
                    <div class="row">
                        <List title="人员列表" remark="双击查看" ref="workerList" :data="tempData.myWorkerList" :columns="WORKER_LIST_2_COLUMN" @onDoubleTap="onDoubleTapWorker" />
                    </div>
                </div>
                <!--市场-->
                <div class="tab-panel" v-show="state==5">
                    <div class="row no-margin">
                        <h2 class="room-name">市场</h2>
                    </div>
                    <div class="row no-margin">
                        <div class="index">
                            <div class="index-cell"><b>房间搜索点数: <span :class="`${game.factoryList[0].rrp>=CONFIG.searchRoomPointCost?'':'index-cell-grey'}`">{{game.factoryList[0].rrp}}</span> / {{CONFIG.searchRoomPointCost}}</b>
                                <a class="btn btn-small" @click="onTapSearch(1,1)">搜索房间</a>
                                <a class="btn btn-small" @click="onTapSearch(1)">搜索全部房间</a>
                            </div>
                            <div class="index-cell"><b>人力搜索点数: <span :class="`${game.factoryList[0].hrp>=CONFIG.searchWorkerPointCost?'':'index-cell-grey'}`">{{game.factoryList[0].hrp}}</span> / {{CONFIG.searchWorkerPointCost}}</b>
                                <a class="btn btn-small" @click="onTapSearch(2,1)">搜索人员</a>
                                <a class="btn btn-small" @click="onTapSearch(2)">搜索全部人员</a>
                            </div>
                            <div class="index-cell">
                                <b>
                                    资源管理员:
                                    <span v-if="tempData.resourceManager.name">
                                        <a class="orange" @click="jump(4,tempData.resourceManager.id)">{{tempData.resourceManager.name}}</a>
                                        <span>( {{tempData.resourceManager.str}}，{{tempData.resourceManager.int}}，{{tempData.resourceManager.com}}，{{tempData.resourceManager.img}} )</span>
                                    </span>
                                    <a class="btn btn-icon" @click="onTapAddWorker(11)">+</a>
                                    <a v-if="tempData.resourceManager.name" class="btn btn-icon" @click="onTapRemoveWorker(11)">-</a>
                                </b>
                            </div>
                        </div>
                    </div>
                    <div class="row flex">
                        <div class="row-column">
                            <List title="房间搜索人员" ref="rrList" :simple="true" option="+" :largeOption="true" :data="tempData.myRRList" :columns="WORKER_LIST_4_COLUMN" @onDoubleTap="onDoubleTapWorker" @onTapOption="onTapAddWorker(7)" />
                        </div>
                        <div class="row-column">
                            <List title="人力搜索人员" ref="hrList" :simple="true" option="+" :largeOption="true" :data="tempData.myHRList" :columns="WORKER_LIST_5_COLUMN" @onDoubleTap="onDoubleTapWorker" @onTapOption="onTapAddWorker(8)" />
                        </div>
                    </div>
                    <div class="no-margin">
                        <div class="index market">
                            <a class="btn" :class="{'select':marketType==1}" @click="onTapMarketType(1)">房间市场</a>
                            <a class="btn" :class="{'select':marketType==2}" @click="onTapMarketType(2)">人员市场</a>
                        </div>
                    </div>
                    <div class="row" v-if="marketType==1">
                        <List title="市场房间列表" type="room" remark="双击购买" ref="marketRoomList" :data="tempData.marketRoomList" :columns="ROOM_LIST_2_COLUMN" @onDoubleTap="onDoubleTapMarketRoom" />
                    </div>
                    <div class="row" v-if="marketType==2">
                        <List title="市场人员列表" remark="双击购买" option="购买全部" v-if="tempData.marketWorkerList.length>1" @onTapOption="onTapBuyAllWorkers" ref="marketWorkerList" :data="tempData.marketWorkerList" :columns="WORKER_LIST_6_COLUMN" @onDoubleTap="onDoubleTapMarketWorker" />
                        <List title="市场人员列表" remark="双击购买" v-else ref="marketWorkerList" :data="tempData.marketWorkerList" :columns="WORKER_LIST_6_COLUMN" @onDoubleTap="onDoubleTapMarketWorker" />
                    </div>
                </div>
                <!--外交-->
                <div class="tab-panel" v-if="tempData.relationList" v-show="state==6">
                    <div class="row no-margin">
                        <h2 class="room-name">外交</h2>
                    </div>
                    <div class="row flex">
                        <List title="世界工厂列表" remark="双击查看" ref="relationList" :showTip="tip3" :large="true" :data="tempData.relationList" :columns="RELATION_LIST_COLUMN" @onDoubleTap="onDoubleTapRelation" />
                    </div>
                </div>
                <!--工厂-->
                <div class="tab-panel" v-if="tempData.factory" v-show="state==7">
                    <div class="row no-margin">
                        <h1 class="room-name">{{tempData.factory.name}}
                            <a class="btn btn-edit" @click="onTapEditFactory">执行策略</a>
                            <!-- <a class="btn btn-edit" @click="onTapStudy">深造派遣<span v-if="tempData.studyWorker">（{{tempData.studyWorker.name}}）</span></a> -->
                            <a class="btn btn-edit" @click="onTapTab(6)">离开</a>
                        </h1>
                        <h4 class="my-name">董事长：{{tempData.factory.boss.name}}</h4>
                    </div>
                    <div class="row no-margin">
                        <div class="index">
                            <div class="index-cell left"><b>总资金: {{tempData.factory.money}} $</b></div>
                            <div class="index-cell left"><b>形象: {{tempData.factory.image}}</b></div>
                            <div class="index-cell left"><b>投资: {{tempData.relation.invest}} $</b></div>
                            <div class="index-cell left pct-wrap"><b>支持率:</b>&nbsp;<div class="pct"><nut-progress :text-inside="true" :percentage="percent(tempData.relation.support,config.max_support)"></nut-progress></div></div>
                            <div class="index-cell">
                                <b>
                                    外交员:
                                    <span v-if="tempData.joint&&tempData.joint.name">
                                        <a class="orange" @click="jump(4,tempData.joint.id)" v-if="tempData.joint.name">{{tempData.joint.name}}</a>
                                        <i>({{tempData.joint.com}})</i>
                                    </span>
                                    <a class="btn btn-icon" @click="onTapAddWorker(9)">+</a>
                                    <a v-if="tempData.joint&&tempData.joint.name" class="btn btn-icon" @click="onTapRemoveWorker(9)">-</a>
                                </b>
                            </div>
                            <div class="row-column">
                                <List title="间谍列表" ref="spyList" :simple="true" option="+" :largeOption="true" :data="tempData.mySpyList" :columns="WORKER_LIST_8_COLUMN" @onDoubleTap="onDoubleTapWorker" @onTapOption="onTapAddWorker(10)" />
                            </div>
                            <div class="row-column" style="vertical-align:top;height:.5rem;line-height:.5rem;">
                                <a class="orange" @click="onTapChangeSpies" v-if="tempData.mySpyList.length>1">全体转移</a><br/>
                                <a class="orange" @click="onTapRemoveSpies" v-if="tempData.mySpyList.length>1">全体撤职</a>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <List title="房间列表" type="room" remark="双击偷取" ref="factoryRoomList" :data="tempData.factoryRoomList" :columns="ROOM_LIST_4_COLUMN" @onDoubleTap="onDoubleTapFactoryRoom" />
                    </div>
                    <div class="row">
                        <List title="人员列表" remark="双击偷取" ref="factoryWorkerList" :data="tempData.factoryWorkerList" :columns="WORKER_LIST_7_COLUMN" @onDoubleTap="onDoubleTapFactoryWorker" />
                    </div>
                </div>
                <!--深造-->
                <div class="tab-panel" v-if="tempData.factory" v-show="state==8">
                    <div class="row no-margin">
                        <h1 class="room-name">在{{tempData.factory.name}}进行能力深造</h1>
                        <h4 class="my-name">派遣员工来此公司进行深造，以提升能力</h4>
                    </div>
                    <div class="row no-margin">

                    </div>
                </div>
                <!--报表-->
                <div class="tab-panel" v-show="state==99">
                    <div class="row no-margin">
                        <h2 class="room-name">经营报表</h2>
                        <div class="my-name" v-if="dayLimit-day>=0">当前第 <b>{{day}}</b> 天，共 <b>{{dayLimit}}</b> 天，还剩 <b>{{dayLimit-day}}</b> 天</div>
                    </div>
                    <div class="row log">
                        <nut-timeline>
                            <nut-timelineitem v-for="(item,index) in game.logList" :key="index">
                                <div class="title" slot="title">{{item.title}}</div>
                                <div class="sub-title btn" @click="onTapLog(item.id)">{{item.subTitle}}</div>
                            </nut-timelineitem>
                        </nut-timeline>
                        <!-- <List ref="logList" :data="game.logList" :onlyList="true" :columns="LOG_COLUMN" @onDoubleTap="onDoubleTapLog" /> -->
                    </div>
                </div>
            </div>
            <!--底部导航-->
            <div class="tab-wrap">
                <a class="btn btn-tab" :class="{'active':state==1}" @click="onTapTab(1)">工厂</a>
                <a class="btn btn-tab" :class="{'active':state==2,'btn-tab-ban':!calcRoomLockStat()}" @click="onTapTab(2)">房间</a>
                <a class="btn btn-tab" :class="{'active':state==3,'btn-tab-ban':!calcTerminalLockStat()}" @click="onTapTab(3)">终端</a>
                <a class="btn btn-tab" :class="{'active':state==4}" @click="onTapTab(4)">人员</a>
                <a class="btn btn-tab" :class="{'active':state==5}" @click="onTapTab(5)">市场</a>
                <a class="btn btn-tab" :class="{'active':state==6||state==7||state==8,'btn-tab-ban':!calcRelationLockStat()}" @click="onTapTab(6)">外交</a>
                <a class="btn btn-tab" :class="{'active':state==99}" @click="onTapTab(99)">报表</a>
            </div>
        </div>
        <!--脚部-->
        <div class="footer" v-if="dayLimit-day+1>0">
            <div class="fact">
                <div class="fact-item">总资金：{{numFormat(game.factoryList[0].money)}} $</div>
                <div class="fact-item">工厂形象：{{game.factoryList[0].image}}</div>
            </div>
            <nut-button class="btn btn-go" @click="onTapGo"><p>第 {{day}} 天结束</p><small>共 {{dayLimit}} 天</small></nut-button>
        </div>
        <div class="footer" v-else>
            <div class="gameover">游戏结束</div>
        </div>
        <!--弹出层-->
        <nut-popup class="pop pop-system-menu" :round="true" v-model="showSystemMenu">
            <!-- <div class="switch">
                <label>自动存档</label>
                <nut-switch :active.sync="autoSave" @change="onChangeAutoSave"></nut-switch>
            </div> -->
            <a class="menu-item" @click="onTapDrag(1)">存档</a>
            <a class="menu-item" @click="onTapDrag(2)">删档</a>
            <a class="menu-item" @click="onTapDrag(3)">新手指导</a>
            <a class="menu-item" @click="onTapDrag(4)">{{['首','房间','终端','人员','市场','外交','外交工厂','报表'][this.state-1]}}页操作指南</a>
            <a class="menu-item" @click="onTapDrag(5)">返回初始界面</a>
        </nut-popup>
        <nut-popup v-model="showEditFactoryName">
            <nut-textinput class="input" v-model="game.factoryList[0].name" placeholder="工厂名字" :disabled="false"/>
        </nut-popup>
        <nut-popup v-model="showEditRoom">
            <div class="row room-board" v-if="tempData.room">
                <div class="row room-level">
                    <div class="main-level">
                        <h3>房间等级 {{tempData.room.level}}</h3>
                        <a class="btn" v-if="tempData.room.level<config.max_room_level" @click="onTapRoomLevelUp">房间升级（{{config.room_levelup_cost[tempData.room.level-1]}} $）</a>
                    </div>
                    <div class="order-con">
                        排序：
                        <div class="counter">
                            <a class="btn" :class="{'active':tempData.room.order>1}" @click="onTapOrder(-1)">-</a><span>{{tempData.room.order}}</span><a class="btn" :class="{'active':tempData.room.order<9}" @click="onTapOrder(1)">+</a>
                        </div>
                    </div>
                    <div class="all-level" v-if="tempData.powerLevelUpCost>0||tempData.digLevelUpCost>0||tempData.tradeLevelUpCost>0">
                        <a class="risk-item btn-small" @click="onTapAllTerminalLevelUp(1)" v-if="tempData.powerLevelUpCost>0">所有终端发电升级（{{tempData.powerLevelUpCost}} $）</a>
                        <a class="risk-item btn-small" @click="onTapAllTerminalLevelUp(2)" v-if="tempData.digLevelUpCost>0">所有终端挖矿升级（{{tempData.digLevelUpCost}} $）</a>
                        <a class="risk-item btn-small" @click="onTapAllTerminalLevelUp(3)" v-if="tempData.tradeLevelUpCost>0">所有终端交易升级（{{tempData.tradeLevelUpCost}} $）</a>
                    </div>
                    <div class="clr"></div>
                </div>
                <div class="row risk">
                    <h3>策略:</h3>
                    <a class="risk-item" :class="{'select':tempData.room.risk==index}" v-for="index in [1,2,3]" @click="onTapRiskLevel(index)">{{config.risk_name_map[index-1]}}</a>
                    <p class="tip">{{[`收益减少，老化速度为零`,`收益和老化速度正常`,`收益提升，耗电提升，老化速度大幅提升；若房间有管理员，收益会根据房间类型和管理员能力值固定大幅提升`][tempData.room.risk-1]}}</p>
                </div>
                <div class="row risk">
                    <div class="risk-side risk-side-border">
                        <h3>参与均分电力:</h3>
                        <nut-switch :active.sync="tempData.room.avgPower==1" @change="onChangeAvgPower"></nut-switch>
                        <p class="tip">当其他房间均匀分配电力时，该房间接受电力分配</p>
                    </div>
                    <div class="risk-side">
                        <h3>智能输出电力:</h3>
                        <nut-switch :active.sync="tempData.room.assignPower==1" @change="onChangeAssignPower"></nut-switch>
                        <p class="tip">当有房间电力过低时自动为其输送电力</p>
                    </div>
                </div>
                <div class="row risk">
                    <h3>全体终端人员命令:</h3>
                    <a class="risk-item orange" v-for="index in [0,1,2,3,4,5,6]" @click="onTapEntireOrder(index)">{{['待命','发电','挖矿','交易','维护','离开终端','离开房间'][index]}}</a>
                </div>
                <div class="row btn-group">
                    <a class="risk-item btn" @click="onTapAssembleFreeWorker">所有空闲人员调至此房间</a>
                    <a class="risk-item btn" @click="onTapAutoAssignTaskInRoom">自动安排空闲人员</a>
                </div>
                <div class="row sell">
                    <a class="risk-item" @click="onTapBackup" v-if="tempData.room.group==0">加入备用</a>
                    <a class="risk-item" @click="onTapAutoService" v-if="tempData.room.group==0">加入自营</a>
                    <a class="risk-item" @click="onTapReuse" v-if="tempData.room.group!=0">回归管理</a>
                    <a class="risk-item" @click="onTapSellRoom">出售</a>
                </div>
            </div>
        </nut-popup>
        <nut-popup v-model="showAssignPower">
            <div class="row pop-room-list" v-if="tempData.myPopRoomList&&tempData.room">
                <div class="row level">
                    <h3><p>分配电力至<br/>其他房间</p><p>{{Math.floor(tempData.room.power*tempData.assignPowerPct/100)}}（{{tempData.assignPowerPct}}%）</p></h3>
                    <nut-slider class="input" v-model="tempData.assignPowerPct" :range="[0,100]" :showLabel="true" :stage="10" ></nut-slider>
                </div>
                <div class="row">
                    <List title="双击选择房间" type="room" ref="roomListPop" option="均匀分配" :data="tempData.myPopRoomList" :columns="ROOM_LIST_3_COLUMN" @onDoubleTap="onDoubleTapPopRoom" @onTapOption="onTapAvgAssign" />
                </div>
            </div>
        </nut-popup>
        <nut-popup v-model="showEditTerminal">
            <div class="row room-board" v-if="tempData.terminal">
                <div class="row level">
                    <h3>供电等级 {{tempData.terminal.powerLevel}}</h3><a class="btn" v-if="tempData.terminal.powerLevel<config.max_terminal_level" @click="onTapTerminalLevelUp('power')">升级（{{config.power_levelup_cost[tempData.terminal.powerLevel-1]}} $）</a>
                </div>
                <div class="row level">
                    <h3>挖矿等级 {{tempData.terminal.digLevel}}</h3><a class="btn" v-if="tempData.terminal.digLevel<config.max_terminal_level" @click="onTapTerminalLevelUp('dig')">升级（{{config.dig_levelup_cost[tempData.terminal.digLevel-1]}} $）</a>
                </div>
                <div class="row level">
                    <h3>交易等级 {{tempData.terminal.tradeLevel}}</h3><a class="btn" v-if="tempData.terminal.tradeLevel<config.max_terminal_level" @click="onTapTerminalLevelUp('trade')">升级（{{config.trade_levelup_cost[tempData.terminal.tradeLevel-1]}} $）</a>
                </div>
            </div>
        </nut-popup>
        <nut-popup v-model="showJobPop">
            <div class="row job room-board">
                <div class="row risk">
                    <h3>选择职能: <span class="small" v-if="tempData.room&&tempData.room.type!=0">（本房间{{config.job_name_map[tempData.room.type]}}收益加成）</span></h3>
                    <a class="risk-item btn" :class="{'select':(tempData.terminal||{}).job==index}" v-for="index in [1,2,3,4]" @click="onTapJob(index)">{{config.job_name_map[index]}}</a>
                </div>
            </div>
        </nut-popup>
        <nut-popup v-model="showWorkerPop">
            <div class="row worker-board" v-if="tempData.myWorker">
                <div class="title">
                    <h3>{{tempData.myWorker.name}} [ID{{tempData.myWorker.id}}]
                        <span v-if="tempData.myWorker.boss">董事长</span>
                        <span>({{tempData.myWorker.gender?'男':'女'}} {{tempData.myWorker.age}})</span>
                    </h3>
                </div>
                <div class="item">
                    <h3>体能:</h3><span><b>{{tempData.myWorker.str}}</b><Bar :data="tempData.myWorker.str" /></span>
                </div>
                <div class="item">
                    <h3>智力:</h3><span><b>{{tempData.myWorker.int}}</b><Bar :data="tempData.myWorker.int" /></span>
                </div>
                <div class="item">
                    <h3>交流:</h3><span><b>{{tempData.myWorker.com}}</b><Bar :data="tempData.myWorker.com" /></span>
                </div>
                <div class="item">
                    <h3>形象:</h3><span><b>{{tempData.myWorker.img}}</b><Bar :data="tempData.myWorker.img" /></span>
                </div>
                <div class="item">
                    <h3>所属:</h3><span>{{tempData.myWorker.fname||'-'}} {{tempData.myWorker.rname||''}}</span>
                </div>
                <div class="item">
                    <h3>目标工厂:</h3><span>{{tempData.myWorker.tfname||'-'}}</span>
                </div>
                <div class="item">
                    <h3>职能:</h3><span>{{config.job_name_map[tempData.myWorker.job]||'-'}}</span>
                </div>
                <div class="item sell">
                    <a class="risk-item" v-if="tempData.myWorker.fid==game.factoryList[0].id&&tempData.myWorker.job!=0" @click="onTapRelease">解除职务</a>
                    <a class="risk-item" v-if="tempData.myWorker.rid!=0" @click="onTapLeaveRoom">撤出房间</a>
                    <a class="risk-item" v-if="tempData.myWorker.id!=game.workerList[0].id&&tempData.myWorker.fid==game.factoryList[0].id" @click="onTapSellWorker">出售</a>
                </div>
            </div>
        </nut-popup>
        <nut-popup v-model="showWorkerList">
            <div class="row pop-worker-list">
                <div class="row-tip" v-if="popTip"><p>{{popTip}}<a class="btn" @click="showRule=true">更多</a></p></div>
                <List title="双击选择人员" ref="workerListPop" :data="tempData.myPopWorkerList" :columns="WORKER_LIST_COLUMN" :flag="'cho'" @onDoubleTap="onDoubleTapPopWorker" />
            </div>
        </nut-popup>
        <nut-popup v-model="showConfirmSellRoom">
            <div class="row room-board" v-if="tempData.room">
                <div class="row level">
                    <a class="btn" @click="onTapConfirmSellRoom">确认出售房间：{{tempData.room.name}}（{{tempData.room.sell||0}} $）</a>
                </div>
            </div>
        </nut-popup>
        <nut-popup v-model="showConfirmSellWorker">
            <div class="row room-board" v-if="tempData.myWorker">
                <div class="row level">
                    <a class="btn" @click="onTapConfirmSellWorker">确认出售人员：{{tempData.myWorker.name}}（{{tempData.myWorker.sell||0}} $）</a>
                </div>
            </div>
        </nut-popup>
        <nut-popup v-model="showConfirmBuyWorker">
            <div class="row worker-board" v-if="tempData.buyWorker">
                <div class="title">
                    <h3>
                        {{tempData.buyWorker.name}}
                        <span>({{tempData.buyWorker.gender?'男':'女'}} {{tempData.buyWorker.age}})</span>
                    </h3>
                </div>
                <div class="item">
                    <h3>体能:</h3><span><b>{{tempData.buyWorker.str}}</b><Bar :data="tempData.buyWorker.str" /></span>
                </div>
                <div class="item">
                    <h3>智力:</h3><span><b>{{tempData.buyWorker.int}}</b><Bar :data="tempData.buyWorker.int" /></span>
                </div>
                <div class="item">
                    <h3>交流:</h3><span><b>{{tempData.buyWorker.com}}</b><Bar :data="tempData.buyWorker.com" /></span>
                </div>
                <div class="item">
                    <h3>形象:</h3><span><b>{{tempData.buyWorker.img}}</b><Bar :data="tempData.buyWorker.img" /></span>
                </div>
                <div class="item sell">
                    <a class="risk-item" @click="onTapBuyWorker">购买（{{tempData.buyWorker.price}} $）</a>
                </div>
            </div>
        </nut-popup>
        <nut-popup v-model="showConfirmBuyAllWorker">
            <div class="row worker-board">
                <div class="title">
                    确认要购买所有人员吗？<br/>（共 {{tempData.marketWorkerList.length}} 人）
                </div>
                <div class="item sell">
                    <a class="risk-item" @click="onTapConfirmBuyAllWorkers">购买（{{tempData.totalCost}} $）</a>
                </div>
            </div>
        </nut-popup>
        <nut-popup v-model="showConfirmBuyRoom">
            <div class="row worker-board" v-if="tempData.buyRoom">
                <div class="title">
                    <h3>{{tempData.buyRoom.name}}</h3>
                </div>
                <div class="item">
                    <h3>基础门面:</h3><span>{{tempData.buyRoom.basicImage}}</span>
                </div>
                <div class="item">
                    <h3>老化:</h3><span>{{percent(tempData.buyRoom.durab,config.max_durab)}}%</span>
                </div>
                <div class="item sell">
                    <a class="risk-item" @click="onTapBuyRoom">购买（{{tempData.buyRoom.price}}$）</a>
                </div>
            </div>
        </nut-popup>
        <nut-popup v-model="showStealRoom">
            <div class="row worker-board" v-if="tempData.stealRoom">
                <div class="title">
                    <h3>{{tempData.stealRoom.name}}</h3>
                </div>
                <div class="item">
                    <h3>电力:</h3><span>{{tempData.stealRoom.power}}</span>
                </div>
                <div class="item">
                    <h3>基础门面:</h3><span>{{tempData.stealRoom.basicImage}}</span>
                </div>
                <div class="item">
                    <h3>老化:</h3><span>{{percent(tempData.stealRoom.durab,config.max_durab)}}%</span>
                </div>
                <div class="item">
                    <h3>自动化:</h3><span>{{percent(tempData.stealRoom.auto,config.max_auto)}}%</span>
                </div>
                <div class="item">
                    <h3>等级:</h3><span>LV.{{tempData.stealRoom.level}}</span>
                </div>
                <div class="item sell">
                    <a class="risk-item" @click="onTapStealRoom">偷取房间</a>
                </div>
            </div>
        </nut-popup>
        <nut-popup v-model="showStealWorker">
            <div class="row worker-board" v-if="tempData.stealWorker">
                <div class="title">
                    <h3>{{tempData.stealWorker.name}}
                        <span v-if="tempData.stealWorker.boss">董事长</span>
                        <span>({{tempData.stealWorker.gender?'男':'女'}} {{tempData.stealWorker.age}})</span>
                    </h3>
                </div>
                <div class="item">
                    <h3>体能:</h3><span><b>{{tempData.stealWorker.str}}</b><Bar :data="tempData.stealWorker.str" /></span>
                </div>
                <div class="item">
                    <h3>智力:</h3><span><b>{{tempData.stealWorker.int}}</b><Bar :data="tempData.stealWorker.int" /></span>
                </div>
                <div class="item">
                    <h3>交流:</h3><span><b>{{tempData.stealWorker.com}}</b><Bar :data="tempData.stealWorker.com" /></span>
                </div>
                <div class="item">
                    <h3>形象:</h3><span><b>{{tempData.stealWorker.img}}</b><Bar :data="tempData.stealWorker.img" /></span>
                </div>
                <div class="item sell" v-if="!tempData.stealWorker.boss">
                    <a class="risk-item" @click="onTapStealWorker">偷取人员</a>
                </div>
            </div>
        </nut-popup>
        <nut-popup v-model="showEditFactory">
            <div class="row room-board" v-if="tempData.factory">
                <div class="row btn">
                    <a class="risk-item" @click="onTapInvest"><b>投资</b></a>
                </div>
                <div class="row btn" v-if="!tempData.factory.damaged">
                    <a class="risk-item" @click="showConfirmDamage=true"><b>形象破坏</b></a>
                </div>
                <div class="row btn" v-if="!tempData.factory.sanctioned">
                    <a class="risk-item" @click="onTapSanction"><b>经济制裁</b></a>
                </div>
                <div class="row btn">
                    <a class="risk-item" @click="showConfirmBuyFactory=true"><b>收购</b></a>
                </div>
            </div>
        </nut-popup>
        <nut-popup v-model="showConfirmDamage">
            <div class="row room-board" v-if="tempData.factory">
                <div class="row level">
                    <a class="btn" @click="onTapConfirmDamage">对{{tempData.factory.name}}执行一次形象破坏（100万 $）</a>
                </div>
            </div>
        </nut-popup>
        <nut-popup v-model="showSanction">
            <div class="row room-board" v-if="tempData.factory">
                <div class="row level">
                    <a class="btn" @click="onTapConfirmSanction">对{{tempData.factory.name}}执行一次经济制裁（100万 $）</a>
                </div>
            </div>
        </nut-popup>
        <nut-popup v-model="showConfirmBuyFactory">
            <div class="row room-board" v-if="tempData.factory">
                <div class="row level">
                    <a class="btn" @click="onTapConfirmBuyFactory">确认收购{{tempData.factory.name}}（{{tempData.factory.sell}} $）</a>
                </div>
            </div>
        </nut-popup>
        <nut-popup v-model="showInvest">
            <div class="row room-board" v-if="tempData.factory">
                <div class="row">
                    <nut-textinput :placeholder="`最大投资金额：${CONFIG.max_investment-game.investedMoney}`" v-model="tempData.investMoney" />
                    <nut-numberkeyboard :visible="showKeyborad" v-model="tempData.investMoney" maxlength="8" @close="showKeyborad=false"></nut-numberkeyboard>
                </div>
                <div class="row sell">
                    <a class="risk-item" @click="onTapConfirmInvest">确认投资</a>
                </div>
            </div>
        </nut-popup>
        <nut-popup v-model="showProp">
            <div class="row room-board">
                <div class="row level">
                    <h3><p>投入资金</p><p>{{Math.floor(config.max_image_prop_money*tempData.propMoneyPct/100)}} $</p><p>（{{tempData.propMoneyPct}}%）</p></h3>
                    <nut-slider class="input" v-model="tempData.propMoneyPct" :range="[0,100]" :showLabel="true" :stage="10" ></nut-slider>
                </div>
                <div class="row sell">
                    <a class="risk-item" @click="onTapConfirmProp">进行一次形象宣传</a>
                </div>
            </div>
        </nut-popup>
        <nut-popup v-model="showLog">
            <div class="row log-board" v-if="tempData.log&&tempData.log.content">
                <div class="title">
                    <h3>日报表：{{tempData.log.title}}</h3>
                </div>
                <div class="para">
                    <div class="p1">
                        <h3>总收入：{{tempData.log.content.moneyIncome}} $</h3>
                        <h3>形象提升：{{tempData.log.content.imageIncome}}</h3>
                        <h3>房间搜索点数获得：{{tempData.log.content.rrpIncome}} &nbsp;&nbsp;&nbsp;&nbsp;人力搜索点数获得：{{tempData.log.content.hrpIncome}}</h3>
                        <h3>电力产余：{{tempData.log.content.totalPowerProduce-tempData.log.content.totalPowerConsume}}（产出 {{tempData.log.content.totalPowerProduce}}，消耗 {{tempData.log.content.totalPowerConsume}}） </h3>
                    </div>
                    <div class="p1" v-for="invest in tempData.log.content.investList">
                        <h4>{{invest.name}}的投资回报：<span>{{invest.income}} $</span></h4>
                    </div>
                    <div class="p1" v-for="room in tempData.log.content.roomList">
                        <h4>{{room.name}}<span v-if="room.group==1">（备用）</span><span v-if="room.group==2">（自营）</span></h4>
                        <div class="p2">
                            <span>资金收入：{{room.moneyIncome-room.moneyConsume}} $（+{{room.moneyIncome}}，-{{room.moneyConsume}}）</span>
                        </div>
                        <div class="p2">
                            <span>生产电力：{{room.powerIncome-room.powerConsume}}（+{{room.powerIncome}}，-{{room.powerConsume}}）</span>
                        </div>
                        <div class="p2">
                            <span>形象提升：{{room.imageIncome}}</span>
                        </div>
                    </div>
                    <div class="p1" v-if="tempData.log.content.suffix" v-html="tempData.log.content.suffix"></div>
                </div>
            </div>
        </nut-popup>
        <nut-popup v-model="showConfirmGo">
            <div class="row room-board">
                <div class="row" v-if="tipList.length>0">
                    <span class="board-tip">提示：{{tipList[tipList.length-1]}}</span>
                </div>
                <div class="row">
                    <a class="btn" @click="onTapConfirmGo(1)">结束本日</a>
                </div>
                <div class="row">
                    <a class="btn" @click="onTapConfirmGo(2)">结束本旬（剩余 {{10-(day-1)%10}} 日）</a>
                </div>
            </div>
        </nut-popup>
        <nut-popup v-model="showSpyTargets">
            <div class="row factory-board">
                <List title="世界工厂列表" remark="选择目标工厂" ref="relationList2" :simple="true" :data="tempData.relationList" :columns="RELATION_LIST_COLUMN" @onDoubleTap="onDoubleTapRelationOnPop" />
            </div>
        </nut-popup>
        <nut-popup v-model="showTasks">
            <div class="row task-board">
            </div>
        </nut-popup>
        <!-- <nut-popup v-model="showEditWorkerPage">
            <div class="row room-board">
                <div class="row">
                    <a class="risk-item btn" @click="onTapReleaseAll">全体待命</a>
                </div>
                <div class="row">
                    <a class="risk-item btn" @click="onTapRandomAssignToRoom">随机派发空闲人员至房间</a>
                </div>
                <div class="row">
                    <a class="risk-item btn" @click="onTapAutoAssignTask">自动安排空闲人员任务</a>
                </div>
            </div>
        </nut-popup> -->
        <div class="rule heavy-shadow" :class="{'rule-hide':!showGuide}" @click="showGuide=false">
            <div class="rule-board">
                <div class="row">
                    <h3><label>新手指导</label></h3>
                    <p>
                        你是工厂的董事长。你的目的很简单：在规定时间内收购所有其他工厂，垄断整个行业。<br/>
                        收购工厂前你需要对其进行经济制裁，这需要消耗你厂的「资金」和「工厂形象」，因此你必须先提高你厂的实力。<br/>
                    </p>
                </div>
                <div class="row">
                    <h3><label>提升实力</label></h3>
                    <p>
                        形象方面，你可以通过任命工厂的「形象代言人」以稳定提升工厂形象，同时每个房间的门面担当也会帮助你厂提高形象。<br/><br/>
                        资金方面，你可以任命房间内的工厂人员通过终端进行「挖矿」和「交易」的工作来获取资金；同时也要另外安排终端人员进行「发电」工作以提供房间电力，否则房间内的终端将无法产生资金收益。<br/><br/>
                        房间和终端都会老化，请注意定期维护（消耗资金）。<br/>
                    </p>
                </div>
                <div class="row">
                    <h3><label>扩大规模</label></h3>
                    <p>
                        你需要更多的人员和房间，你可以在市场购买它们。<br/><br/>
                        人员和房间是不需要支付工资的，它们只是商品而已，但你得先派人去市场搜集一定数量的「搜索点数」才能找到新的商品。<br/><br/>
                        好的工厂形象能帮助你更快地找到新的人员。<br/>
                    </p>
                </div>
                <div class="row">
                    <h3><label>外交</label></h3>
                    <p>
                        当游戏进入后期，你厂具备了一定实力，你可以对其他工厂进行外交。<br/><br/>
                        把其他工厂搞到负债，就可以直接收购它了。<br/>
                    </p>
                </div>
            </div>
        </div>
        <div class="rule" :class="{'rule-hide':!showRule}" @click="showRule=false">
            <div class="rule-board" v-show="state==1">
                <div class="row">
                    <h3><label>总资金</label></h3>
                    <p>用来升级、购买房间，购买人员，升级终端，等等；<br/>前期可通过安排房间内的终端人员进行挖矿或交易获取；<br/>后期可通过投资其他工厂获取。</p>
                </div>
                <div class="row">
                    <h3><label>工厂形象</label></h3>
                    <p>工厂形象越高，人力搜索点数提升越快；<br/>可通过形象代言人和各房间门面人员获取。</p>
                </div>
                <div class="row">
                    <h3><label>房间搜索点数</label></h3>
                    <p>用来在市场中搜索新的房间；<br/>可通过安排人员在市场中进行搜索获取。</p>
                </div>
                <div class="row">
                    <h3><label>人力搜索点数</label></h3>
                    <p>用来在市场中搜索新的人员；<br/>可通过安排人员在市场中进行搜索获取。</p>
                </div>
                <div class="row">
                    <h3><label>形象代言人</label></h3>
                    <p>累积增加工厂形象；<br/>建议选个「形象」高的人员来担任。</p>
                    <div class="sub-row">
                        <h3><label class="orange">形象宣传</label></h3>
                        <p>花一次钱提升工厂形象；<br/>收益与投入金额和代言人形象值相关；<br/>每旬（10天）只能宣传一次。</p>
                    </div>
                </div>
                <div class="row">
                    <h3><label>房间列表</label></h3>
                    <p>双击房间可以进入对应房间的详情页。</p>
                </div>
            </div>
            <div class="rule-board" v-show="state==2">
                <div class="row">
                    <h3><label>房间类型</label></h3>
                    <p>看房间名字判断该房间的类型；<br/>房间类型有四种：</p>
                    <div class="sub-row">
                        <h3><label>通用房</label></h3>
                        <p>各收益项目均衡。</p>
                    </div>
                    <div class="sub-row">
                        <h3><label>发电站</label></h3>
                        <p>发电收益提升 30%，挖矿和交易收益减少 30%。</p>
                    </div>
                    <div class="sub-row">
                        <h3><label>挖矿厂</label></h3>
                        <p>挖矿收益提升 30%，发电和交易收益减少 30%。</p>
                    </div>
                    <div class="sub-row">
                        <h3><label>交易所</label></h3>
                        <p>交易收益提升 30%，发电和挖矿收益减少 30%。</p>
                    </div>
                </div>
                <div class="row">
                    <h3><label>电力</label></h3>
                    <p>电力通过任命终端人员发电获取，收益与人员「体能」值相关；<br/>挖矿、交易和提升自动化都会消耗电力，请确保每个房间的电力足够。</p>
                </div>
                <div class="row">
                    <h3><label>策略</label></h3>
                    <div class="sub-row">
                        <h3><label>保护</label></h3>
                        <p>发电、挖矿和交易收益减少 50%，老化速度下降至 0。</p>
                    </div>
                    <div class="sub-row">
                        <h3><label>常规</label></h3>
                        <p>收益和消耗都为 100%。</p>
                    </div>
                    <div class="sub-row">
                        <h3><label>高强</label></h3>
                        <p>发电、挖矿和交易收益提升至 200-250%，耗电量提升至 200%，老化速度提升至 300%。</p>
                    </div>
                </div>
                <div class="row">
                    <h3><label>协调</label></h3>
                    <p>房间最终收益为其终端收益总和的协调值百分比，因此协调值越高越好；<br/>当只有一个人员工作时，协调值为 100%；当有多个人员工作时，协调值为其「交流」能力值的平均值。</p>
                    <div class="sub-row">
                        <h3><label>管理员</label></h3>
                        <p>如果安排了管理员，不论房间内有多少人员工作，房间的协调值固定为管理员的「交流」能力值；<br/><br/>如果安排了管理员，在高强模式下，房间的总收益将取决于管理员对应不同房间类型的能力值（体能-发电站，智力-挖矿厂，交流-交易所，平均值-通用房）；<br/><br/>比如当房间类型为挖矿厂，管理员的智力为 100 时，房间的总收益将固定提升 150%。</p>
                    </div>
                </div>
                <div class="row">
                    <h3><label>老化</label></h3>
                    <p>当有终端工作时，房间和该终端会持续老化；<br/>老化值越高，房间和终端的整体收益越低；老化值达到 50% 时，收益会急剧下降。</p>
                    <div class="sub-row">
                        <h3><label>维护工人</label></h3>
                        <p>安排维护工人可以降低房间老化，同时小幅降低每个终端的老化；<br/>维护不会消耗电力，但会消耗资金；<br/>维护的效果取决于维护工人的「体能」值。</p>
                    </div>
                </div>
                <div class="row">
                    <h3><label>终端列表</label></h3>
                    <p>双击终端可以进入对应终端的详情页。</p>
                </div>
                <div class="row">
                    <h3><label>房间等级</label></h3>
                    <p>房间最高为 3 级；<br/>提升等级可以增加房间内的终端数量，也可以增加每个终端的收益；<br/>2 级房间能解锁门面工位；<br/>3 级房间能解锁自动化功能。</p>
                </div>
                <div class="row">
                    <h3><label>门面（2级房间解锁）</label></h3>
                    <p>安排门面工作人员可以提高工厂形象；<br/>收益取决于门面人员的「形象」值。</p>
                    <div class="sub-row">
                        <h3><label>基础门面</label></h3>
                        <p>有的房间拥有基础门面，只要安排了人员负责门面就能额外固定增加形象收益</p>
                    </div>
                </div>
                <div class="row">
                    <h3><label>自动化（3级房间解锁）</label></h3>
                    <p>自动化程度越高，房间和终端的老化速度越慢；<br/>当房间的自动化达到 100% 时，房间和房间里的终端都将永不老化。</p>
                    <div class="sub-row">
                        <h3><label>工程师</label></h3>
                        <p>消耗资金以提升房间的自动化；<br/>提升速度取决于工程师的「智力」值。</p>
                    </div>
                </div>
                <div class="row">
                    <h3><label>加入备用</label></h3>
                    <p>将暂时用不到的房间加入备用以方便其他房间的管理。</p>
                </div>
                <div class="row">
                    <h3><label>加入自营</label></h3>
                    <p>让房间进入托管状态；<br/>自营房间中的员工所有属性均视为50；系统每天将自动安排所有空闲人员的调控和工作。</p>
                </div>
            </div>
            <div class="rule-board" v-show="state==3">
                <div class="row">
                    <h3><label>安排人员</label></h3>
                    <p>安排人员在终端工作。</p>
                    <div class="sub-row">
                        <h3><label>发电</label></h3>
                        <p>为房间提供电力；<br/>收益取决于人员「体能」值和终端的发电等级。</p>
                    </div>
                    <div class="sub-row">
                        <h3><label>挖矿</label></h3>
                        <p>为工厂提供资金收入；<br/>收益取决于人员「智力」值和终端的挖矿等级。</p>
                    </div>
                    <div class="sub-row">
                        <h3><label>交易</label></h3>
                        <p>为工厂提供资金收入，并提升对其他配有对接员的工厂的支持率；<br/>收益取决于人员「交流」能力值和终端的交易等级。</p>
                    </div>
                    <div class="sub-row">
                        <h3><label>终端维护</label></h3>
                        <p>降低终端的老化；<br/>收益取决于人员「体能」值。</p>
                    </div>
                </div>
                <div class="row">
                    <h3><label>老化</label></h3>
                    <p>当有人员在终端工作时，终端会老化；<br/>老化值低于 50% 不会有任何影响；达到 50% 时，终端收益会根据老化值按比例减少。</p>
                </div>
                <div class="row">
                    <h3><label>发电、挖矿和交易等级</label></h3>
                    <p>最高等级都为 3 级。</p>
                </div>
            </div>
            <div class="rule-board" v-show="state==4">
                <div class="row">
                    <h3><label>人员列表</label></h3>
                    <p>双击人员可查看人员详情；<br/>单击表头可以进行排序。</p>
                </div>
            </div>
            <div class="rule-board" v-show="state==5">
                <div class="row">
                    <h3><label>房间搜索点数</label></h3>
                    <p>安排人员进行房间搜索可增加房间搜索点数；<br/>增加值取决于进行搜索的人员数量，以及每个搜索人员的「体能」和「智力」中最高的一项。</p>
                    <div class="sub-row">
                        <h3><label>花费点数搜索新房间</label></h3>
                        <p>消耗 1000 点房间搜索点数，在房间市场中生成一个新的房间作为商品供我厂选购；<br/>请注意，每旬（10日）结束时，市场里的商品（房间和人员）将全部清空。</p>
                    </div>
                </div>
                <div class="row">
                    <h3><label>人力搜索点数</label></h3>
                    <p>安排人员进行房间搜索可增加人力搜索点数；<br/>增加值取决于进行搜索的人员数量，每个搜索人员的「交流」和「形象」中最高的一项，以及我厂总形象值在世界所有工厂总形象值中的占比。</p>
                    <div class="sub-row">
                        <h3><label>花费点数搜索新人员</label></h3>
                        <p>消耗 1000 点人力搜索点数，在人员市场中生成一个新的人员作为商品供我厂选购。</p>
                    </div>
                </div>
                <div class="row">
                    <h3><label>搜索人员列表</label></h3>
                    <p>双击人员可查看人员详情；<br/>搜索人员越多，每天获得的搜索点数越多，但收益增量会减少。</p>
                </div>
            </div>
            <div class="rule-board" v-show="state==6">
                <div class="row">
                    <h3><label>工厂列表</label></h3>
                    <p>双击工厂可查看工厂详情；<br/>单击表头可以进行排序。</p>
                </div>
            </div>
            <div class="rule-board" v-show="state==7">
                <div class="row">
                    <h3><label>支持率</label></h3>
                    <p>你对此工厂的支持率；<br/>支持率可以增加你对此工厂的投资收益，也可以通过消耗支持率来偷人和偷房；<br/>通过派选「交流」能力高的人员作为对此工厂的外交员来缓慢提升支持率；<br/>增加你厂中进行交易工作的人员数量，也可以提高支持率的增速。</p>
                </div>
                <div class="row">
                    <h3><label>间谍</label></h3>
                    <p>安排间谍可以持续对此工厂的形象造成随机的破坏；<br/>效果取决于每个间谍的「智力」和对方工厂人员的「智力」；<br/>每个间谍每天都会消耗大量的资金。</p>
                </div>
                <div class="row">
                    <h3><label>投资</label></h3>
                    <p>投资此工厂，可以获得稳定的收益；<br/>投资收益取决于此工厂的规模增量和形象，以及你对此工厂的支持率；<br/>投资一般都有很高的回报，但不要投入太多，因为被投资的工厂本身的收入也会提升，这会导致其后期实力过强而难以收购。</p>
                </div>
                <div class="row">
                    <h3><label>形象破坏</label></h3>
                    <p>消耗 70万 $ 资金让此工厂的形象减半；<br/>每十天可执行一次。</p>
                </div>
                <div class="row">
                    <h3><label>经济制裁</label></h3>
                    <p>消耗 100万 $ 资金让此工厂损失大量资金；<br/>两厂的形象差距越大，此工厂损失的资金越多；<br/>执行制裁后，你厂的形象将减少，减少量为此工厂的形象值；<br/>每十天可执行一次。</p>
                </div>
                <div class="row">
                    <h3><label>偷取和收购</label></h3>
                    <p>将此工厂的资源变为自己的资源；<br/>偷取将消耗大量支持率和你厂形象；<br/>只有资金量为负的工厂才能被收购。</p>
                </div>
            </div>
            <div class="rule-board" v-show="state==99">
                <div class="row">
                    <h3><label>日报表</label></h3>
                    <p>点击列表可查看报表详情。</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import List from '../components/List';
import Bar from '../components/Bar';
import { query, r, bulbsort, getParentNode, cloneObj, numFormat, avg, percent, getListByID, getMatchList, removeFromList, genRandomWorkerName, genRandomRoomName, genRandomFactoryName, genRandomRoom, genRandomWorker, genRandomTerminal, releaseAllByJob } from '../tools/utils';
import { DEBUG, CONFIG, CACHE, } from '../config/config';
export default {
    name: 'Home',
    data(){
        return {
            loading: false,
            dragActive: false,
            state: 1,
            day: 0,
            dayLimit: 0,
            game: {},
            filter: 1, // 人员列表页过滤器
            marketType: 1, // 市场页搜索类型
            tipList: [], // 提示条目
            popTip: '', // 弹窗说明
            tempData: {
                myFactoryList: [],
                // 首页
                myRoomList: [],
                myRoomList2: [],
                myRoomList3: [],
                imageAgent: {},
                resourceManager: {},
                viewType: 0,
                propMoneyPct: 0,

                // 房间页
                room: null,
                myPopRoomList: [],
                assignPowerPct: 0,
                myTerminalList: [],
                myRoomWorkerList: [],
                powerLevelUpCost: 0,
                digLevelUpCost: 0,
                tradeLevelUpCost: 0,

                // 终端页
                terminal: null,

                // 员工页
                myWorkerList: [],

                // 员工详情弹窗
                myWorker: null,

                // 弹窗员工列表
                myPopWorkerList: [],

                // 市场
                marketRoomList: [],
                marketWorkerList: [],
                myRRList: [],
                myHRList: [],
                buyRoom: null,
                buyWorker: null,
                totalCost: 0,

                // 外交
                relationList: [],
                relation: null,

                // 工厂
                factory: null,
                joint: null,
                mySpyList: [],
                factoryRoomList: [],
                factoryWorkerList: [],
                stealRoom: null,
                stealWorker: null,
                investMoney: '',
                studyWorker: null,

                // 报表
                log: {},

                workListPopMode: 0,
            },
            config: CONFIG,

            searchingRoomID: '', // 当前搜索的房间ID
            searchingTerminalID: '', // 当前搜索的终端ID
            searchingWorkerID: '', // 当前搜索的人员ID
            searchingFactoryID: '', // 当前搜索的工厂ID

            autoSave: false,
            tip1: false,
            tip2: false,
            tip3: false,

            // 弹出层
            showSystemMenu: false,
            showEditFactoryName: false,
            showEditRoom: false,
            showAssignPower: false,
            showEditTerminal: false,
            showWorkerList: false,
            showJobPop: false,
            showWorkerPop: false,
            showConfirmSellRoom: false,
            showConfirmSellWorker: false,
            showConfirmBuyRoom: false,
            showConfirmBuyWorker: false,
            showConfirmBuyAllWorker: false,
            showConfirmBuyFactory: false,
            showEditFactory: false,
            showStealRoom: false,
            showStealWorker: false,
            showInvest: false,
            showSanction: false,
            showConfirmDamage: false,
            showConfirmSanction: false,
            showLog: false,
            showKeyborad: false,
            showConfirmGo: false,
            showEditWorkerPage: false,
            showProp: false,
            showRule: false,
            showGuide: false,
            showSpyTargets: false,
            showTasks: false,

            // const
            ROOM_LIST_COLUMN: [ // 首页房间列表基本情况
                {name:'name',title:'房间名',width:'35%',format:(name,room)=>`${room.order} ${name}`,},
                {name:'power',title:'电力',isPower:true,width:'12%',},
                {name:'basicImage',title:'门面',width:'10%',},
                {name:'durab',title:'老化',isRoomDurab:true,width:'12%',format:v=>`${percent(v,CONFIG.max_durab)}%`,},
                {name:'risk',title:'策略',isMode:true,width:'8%',format:v=>`${CONFIG.risk_name_map[v-1]}`,},
                {name:'auto',title:'自动化',isAuto:true,width:'13%',format:v=>`${percent(v,CONFIG.max_auto)}%`,},
                {name:'level',title:'等级',isLevel:true,width:'10%',format:v=>`LV.${v}`,},
            ],
            ROOM_LIST_2_COLUMN: [ // 市场页房间列表
                {name:'id',title:'ID',width:'0',},
                {name:'name',title:'房间名',width:'25%',},
                {name:'basicImage',title:'基础门面',width:'25%',},
                {name:'durab',title:'老化',width:'25%',isRoomDurab:true,format:v=>`${percent(v,CONFIG.max_durab)}%`,},
                {name:'price',title:'售价',width:'25%',format:v=>`${v} $`,},
            ],
            ROOM_LIST_3_COLUMN: [ // 房间页弹出房间列表
                {name:'name',title:'房间名',width:'50%',},
                {name:'power',title:'电力',isPower:true,width:'25%',},
                {name:'avgPower',title:'参与分配',width:'25%',format:v=>`${v?'参与':'否'}`,},
            ],
            ROOM_LIST_4_COLUMN: [ // 工厂页房间列表
                {name:'name',title:'房间名',width:'30%',},
                {name:'power',title:'电力',isPower:true,width:'15%',},
                {name:'basicImage',title:'门面',width:'15%',},
                {name:'durab',title:'老化',isRoomDurab:true,width:'15%',format:v=>`${percent(v,CONFIG.max_durab)}%`,},
                {name:'auto',title:'自动化',isAuto:true,width:'15%',format:v=>`${percent(v,CONFIG.max_auto)}%`,},
                {name:'level',title:'等级',isLevel:true,width:'10%',format:v=>`LV.${v}`,},
            ],
            ROOM_LIST_5_COLUMN: [ // 首页页房间列表工位情况
                {name:'managerName',title:'管理员',width:'16%',},
                {name:'maintainerName',title:'维护工',width:'16%',},
                {name:'imageAgentName',title:'门面',width:'16%',},
                {name:'autoWorkerName',title:'工程师',width:'16%',},
                // {name:'freeTerminalCount',title:'空置',width:'12%',},
                // {name:'workerCount',title:'人数',width:'12%',},
                {name:'terminalOccupies',title:'终端灯位',width:'24%',},
                {name:'freeWorkerCount',title:'空闲',width:'12%',},
            ],
            ROOM_LIST_6_COLUMN: [ // 首页备用房间列表
                {name:'name',title:'房间名',width:'29%',},
                {name:'power',title:'电力',isPower:true,width:'12%',},
                {name:'basicImage',title:'门面',width:'10%',},
                {name:'durab',title:'老化',isRoomDurab:true,width:'12%',format:v=>`${percent(v,CONFIG.max_durab)}%`,},
                {name:'imageAgentName',title:'门面',width:'14%',},
                {name:'auto',title:'自动化',isAuto:true,width:'13%',format:v=>`${percent(v,CONFIG.max_auto)}%`,},
                {name:'level',title:'等级',isLevel:true,width:'10%',format:v=>`LV.${v}`,},
            ],
            ROOM_LIST_7_COLUMN: [ // 首页自营房间列表
                {name:'name',title:'房间名',width:'27%',},
                {name:'power',title:'电力',isPower:true,width:'12%',},
                {name:'basicImage',title:'门面',width:'10%',},
                {name:'durab',title:'老化',isRoomDurab:true,width:'12%',format:v=>`${percent(v,CONFIG.max_durab)}%`,},
                {name:'risk',title:'策略',isMode:true,width:'8%',format:v=>`${CONFIG.risk_name_map[v-1]}`,},
                {name:'auto',title:'自动化',isAuto:true,width:'13%',format:v=>`${percent(v,CONFIG.max_auto)}%`,},
                {name:'workerCount',title:'人数',width:'8%',},
                {name:'level',title:'等级',isLevel:true,width:'10%',format:v=>`LV.${v}`,},
            ],
            TERMINAL_LIST_COLUMN: [ // 房间设备列表
                {name:'powerLevel',title:'供电Lv',isLevel:true,width:'1.3rem',format:v=>`LV.${v}`,},
                {name:'digLevel',title:'挖矿Lv',isLevel:true,width:'1.3rem',format:v=>`LV.${v}`,},
                {name:'tradeLevel',title:'交易Lv',isLevel:true,width:'1.3rem',format:v=>`LV.${v}`,},
                {name:'durab',title:'老化',width:'.7rem',isDurab:true,format:v=>`${percent(v,CONFIG.max_durab)}%`,},
                {name:'workerName',title:'工人',width:'1rem',format:v=>`${v||'-'}`},
                {name:'jobName',title:'运行',width:'1rem',format:v=>`${v||'-'}`},
                {name:'str',title:'体能',width:'1rem',showAbi:true,format:v=>`${v||'-'}`},
                {name:'int',title:'智力',width:'1rem',showAbi:true,format:v=>`${v||'-'}`},
                {name:'com',title:'交流',width:'1rem',showAbi:true,format:v=>`${v||'-'}`},
                {name:'img',title:'形象',width:'1rem',showAbi:true,format:v=>`${v||'-'}`},
            ],
            WORKER_LIST_COLUMN: [ // 弹窗人员列表
                {name:'name',title:'名字',width:'15%',},
                // {name:'abi-chart',title:'能力图形',width:'24%',},
                {name:'str',title:'体能',width:'10%',},
                {name:'int',title:'智力',width:'10%',},
                {name:'com',title:'交流',width:'10%',},
                {name:'img',title:'形象',width:'10%',},
                {name:'rname',title:'房间',width:'30%',format:v=>`${v||'-'}`,},
                {name:'job',title:'职能',width:'15%',format:v=>`${CONFIG.job_name_map[v]}`,},
            ],
            WORKER_LIST_2_COLUMN: [ // 人员列表
                {name:'name',title:'名字',width:'23%',format:(name,worker)=>`${name} (${worker.gender?'男':'女'} ${worker.age})`,},
                {name:'str',title:'体能',width:'8%',},
                {name:'int',title:'智力',width:'8%',},
                {name:'com',title:'交流',width:'8%',},
                {name:'img',title:'形象',width:'8%',},
                {name:'rname',title:'房间',width:'30%',format:v=>`${v||'-'}`,},
                {name:'job',title:'职能',width:'15%',format:v=>`${CONFIG.job_name_map[v]}`,},
            ],
            WORKER_LIST_3_COLUMN: [ // 房间人员列表
                {name:'id',title:'ID',width:'0',},
                {name:'name',title:'名字',width:'50%',format:(name,worker)=>`${name} (${worker.gender?'男':'女'} ${worker.age})`,},
                {name:'job',title:'职能',width:'50%',format:v=>`${CONFIG.job_name_map[v]}`,},
            ],
            WORKER_LIST_4_COLUMN: [ // 房间搜索人员列表
                {name:'id',title:'ID',width:'0',},
                {name:'name',title:'名字',width:'50%',},
                {name:'str',title:'体能',width:'25%',},
                {name:'int',title:'智力',width:'25%',},
            ],
            WORKER_LIST_5_COLUMN: [ // 人力搜索人员列表
                {name:'id',title:'ID',width:'0',},
                {name:'name',title:'名字',width:'50%',},
                {name:'com',title:'交流',width:'25%',},
                {name:'img',title:'形象',width:'25%',},
            ],
            WORKER_LIST_6_COLUMN: [ // 市场页人员列表
                {name:'id',title:'ID',width:'0',},
                {name:'name',title:'名字',width:'26%',format:(name,worker)=>`${name} (${worker.gender?'男':'女'} ${worker.age})`,},
                {name:'str',title:'体能',width:'12%',},
                {name:'int',title:'智力',width:'12%',},
                {name:'com',title:'交流',width:'12%',},
                {name:'img',title:'形象',width:'12%',},
                {name:'price',title:'售价',width:'26%',format:v=>`${v} $`,},
            ],
            WORKER_LIST_7_COLUMN: [ // 工厂页人员列表
                {name:'name',title:'名字',width:'28%',format:(name,worker)=>`${name} (${worker.gender?'男':'女'} ${worker.age})`,},
                {name:'str',title:'体能',width:'18%',},
                {name:'int',title:'智力',width:'18%',},
                {name:'com',title:'交流',width:'18%',},
                {name:'img',title:'形象',width:'18%',},
            ],
            WORKER_LIST_8_COLUMN: [ // 工厂页间谍列表
                {name:'name',title:'名字',width:'50%',},
                {name:'int',title:'智力',width:'50%',},
            ],
            RELATION_LIST_COLUMN: [ // 外交关系列表
                {name:'toName',title:'工厂名',width:'15%',},
                {name:'money',title:'总资金',width:'20%',format:v=>`${numFormat(v)} $`,},
                {name:'image',title:'形象',width:'12.5%',},
                {name:'invest',title:'投资',width:'15%',},
                {name:'support',title:'支持率',width:'12.5%',format:v=>`${percent(v,CONFIG.max_support)}%`,},
                {name:'jointName',title:'外交员',width:'12.5%',format:v=>`${v||'-'}`,},
                {name:'spyCount',title:'间谍数',width:'12.5%',},
            ],

            CONFIG,
            DEBUG,
        };

    },
    mounted(){
        if(window.GLOBAL&&window.GLOBAL.game){
            this.game = window.GLOBAL.game;
            this.day = window.GLOBAL.day;
            this.dayLimit = window.GLOBAL.dayLimit;
            this.asynHomePage();
            if(!localStorage.getItem(CACHE.not_show_guide)){
                this.showGuide = true;
                localStorage.setItem(CACHE.not_show_guide,1);
            }
            let autoSave = localStorage.getItem('AS'),
                no_tip1 = localStorage.getItem(CACHE.tip1),
                no_tip2 = localStorage.getItem(CACHE.tip2),
                no_tip3 = localStorage.getItem(CACHE.tip3);
            if(!autoSave){
                this.autoSave = true;
            }
            else{
                this.autoSave = autoSave=='true';
            }
            if(!no_tip1){
                this.tip1 = true;
            }
            if(!no_tip2){
                this.tip2 = true;
            }
            if(!no_tip3&&this.game.factoryList[0].image>=CONFIG.relation.joint_image_threshold){
                this.tip3 = true;
            }
        }
        else{
            this.$router.push('/');
        }
    },
    methods: {
        numFormat(num){
            return numFormat(num);
        },
        save(tip){ // 存档
            if(this.loading) return;
            let code = localStorage.getItem(CACHE.code)||'';
            if(!code){
                this.$toast.text('获取存档代码错误');
                return ;
            }
            this.loading = true;
            this.loading = this.$toast.loading();
            window.GLOBAL.game = this.game;
            window.GLOBAL.day = this.day;
            let _storageList = localStorage.getItem(CACHE.list)||'[]';
            let storageList = JSON.parse(_storageList);
            // 遍历存档
            let savedStorage;
            for(let storage of storageList){
                if(storage.code==code){
                    savedStorage = storage;
                    break;
                }
            }
            if(savedStorage){ // 已有存档
                try{
                    savedStorage.data = window.GLOBAL;
                    _storageList = JSON.stringify(storageList);
                    localStorage.setItem(CACHE.list,_storageList);
                    tip&&this.$toast.text('存储成功');
                }
                catch(err){
                    tip&&this.$toast.text(`存储失败（${err}）`);
                }
            }
            else{ // 没有该存档
                try{
                    let newStorage = {
                        code,
                        data: window.GLOBAL,
                    }
                    storageList.push(newStorage);
                    _storageList = JSON.stringify(storageList);
                    localStorage.setItem(CACHE.list,_storageList);
                    tip&&this.$toast.text('存储成功');
                }
                catch(err){
                    tip&&this.$toast.text(`存储失败（${err}）`);
                }
            }
            this.loading.hide();
            this.loading = null;
            /*query(DEBUG?'http://darkmirror.cn/api/monopoly_save.php':'../../api/monopoly_save.php',rdata=>{ // 覆盖存档
                this.loading.hide();
                this.loading = null;
                tip&&this.$toast.text(rdata.msg);
            },edata=>{
                this.loading.hide();
                this.loading = null;
                this.$toast.text(edata.msg);
                this.showSystemMenu = false;
            },1,{
                code,
                data: JSON.stringify(window.GLOBAL),
            });*/
        },
        deleteSave(){ // 删除存档
            if(this.loading) return;
            let code = localStorage.getItem(CACHE.code)||'';
            if(!code){
                this.$toast.text('获取存档代码错误');
                return ;
            }
            this.loading = true;
            this.loading = this.$toast.loading();
            let _storageList = localStorage.getItem(CACHE.list)||'[]';
            let storageList = JSON.parse(_storageList);
            // 遍历存档
            let savedStorage;
            for(let storage of storageList){
                if(storage.code==code){
                    savedStorage = storage;
                    break;
                }
            }
            if(savedStorage){
                try{
                    let newStorageList = removeFromList(code,'code',storageList);
                    _storageList = JSON.stringify(newStorageList);
                    localStorage.setItem(CACHE.list,_storageList);
                    this.$toast.text('存档已删除');
                }
                catch(err){
                    this.$toast.text(`存档删除失败（${err}）`);
                }
            }
            else{
                this.$toast.text('存档代码失效，找不到该存档');
            }
            this.loading.hide();
            this.loading = null;
            /*query(DEBUG?'http://darkmirror.cn/api/monopoly_delete.php':'../../api/monopoly_delete.php',rdata=>{
                this.loading.hide();
                this.loading = null;
                this.$toast.text(rdata.msg);
                this.showSystemMenu = false;
                localStorage.removeItem('NSG');
            },edata=>{
                this.loading.hide();
                this.loading = null;
                this.$toast.text(edata.msg);
            },1,{
                code,
            });*/
        },
        releaseWorker(worker,stayRoom){ // 解除职务
            if(worker){
                worker.job = 0;
                worker.tid = 0;
                if(!stayRoom){
                    worker.rid = 0;
                    worker.rname = '';
                }
                worker.tfid = 0;
                worker.ftname = '';
            }
        },
        calcBalance(room,myRoomWorkerList){ // 计算协调
            let manager, // 房间管理员
                myWorkerList = []; // 房间内正在终端工作的人员列表
            for(let worker of myRoomWorkerList){
                if(worker.job==1||worker.job==2||worker.job==3||worker.job==4){
                    myWorkerList.push(worker);
                }
                else if(worker.job==7){
                    manager = worker;
                }
            }
            let balance = 0;
            if(myWorkerList.length==1){
                balance = 100;
            }
            else if(manager&&myWorkerList.length>1){
                if(room.group==2){ // 如果是自营房间，则视管理员的交流值为 50
                    balance = 50;
                }
                else{
                    balance = manager.com;
                }
            }
            else if(myWorkerList.length>1){
                balance = avg(myWorkerList,'com');
            }
            return balance;
        },
        percent(val,max){ // 百分比显示
            return percent(val,max);
        },
        calcRoomValue(room){ // 计算房间价格
            let terminalList = getListByID(room.id,'rid',this.game.terminalList),
                terminalLevelValueMap = [500,CONFIG.power_levelup_cost[0]+500,CONFIG.power_levelup_cost[1]+500],
                roomLevelValueMap = [10000,CONFIG.room_levelup_cost[0]+10000,CONFIG.room_levelup_cost[1]+10000],
                sum = 1000;
            for(let terminal of terminalList){
                sum += terminalLevelValueMap[terminal.powerLevel-1];
                sum += terminalLevelValueMap[terminal.digLevel-1];
                sum += terminalLevelValueMap[terminal.tradeLevel-1];
                sum -= 300*terminal.durab/CONFIG.max_durab;
            }
            sum += roomLevelValueMap[room.level-1];
            sum -= 6500*room.durab/CONFIG.max_durab;
            sum += 90*room.basicImage;
            sum += 500*room.auto/CONFIG.max_auto;
            sum += .8*room.power;
            if(room.type==0){
                sum = Math.round(sum/2);
            }
            return Math.round(Math.round(sum/100)*100);
        },
        calcWorkerValue(worker){ // 计算人员价格
            let sum = 100;
            let attrList = [
                {'val':worker.str},
                {'val':worker.int},
                {'val':worker.com},
                {'val':worker.img},
            ];
            let sortedAttrList = bulbsort(attrList,'val');
            sum += sortedAttrList[0].val*30;
            sum += sortedAttrList[1].val*5;
            sum += sortedAttrList[2].val*2;
            return Math.round(Math.round(sum/25)*25);
        },
        calcFactoryValue(factory){ // 计算工厂价格
            let workerList = getListByID(factory.id,'fid',this.game.workerList),
                roomList = getListByID(factory.id,'fid',this.game.roomList),
                relation = getListByID(factory.id,'to',this.game.relationList)[0],
                sum = 20000;
            for(let worker of workerList){
                sum += this.calcWorkerValue(worker);
            }
            for(let room of roomList){
                sum += this.calcRoomValue(room);
            }
            if(factory.money>0)
                sum += factory.money*1.5;
            if(factory.image>0)
                sum += factory.image*2;
            if(relation.invest>0)
                sum += relation.invest/5;
            return Math.round(sum);
        },

        calcRoomLockStat(){ // 判断房间按钮状态
            return this.tempData.room;
        },
        calcTerminalLockStat(){ // 判断终端按钮状态
            return this.tempData.terminal;
        },
        calcRelationLockStat(){ // 判断外交解锁状态
            return this.day>10;
        },
        acquireRoom(room){ // 收纳房间
            let myFactory = this.game.factoryList[0],
                troom = getListByID(room.id,'id',this.game.roomList)[0],
                terminalList = getListByID(troom.id,'rid',this.game.terminalList),
                workerList = getListByID(troom.id,'rid',this.game.workerList);
            for(let terminal of terminalList){
                terminal.fid = myFactory.id;
                terminal.rid = troom.id;
            }
            for(let worker of workerList){
                worker.rid = 0;
                worker.rname = '';
                worker.tid = 0;
                worker.job = 0;
            }
            troom.fid = myFactory.id;
            troom.fname = myFactory.name;
        },
        acquireWorker(worker){ // 收纳人员
            let myFactory = this.game.factoryList[0],
                tworker = getListByID(worker.id,'id',this.game.workerList)[0];
            tworker.fid = myFactory.id;
            tworker.fname = myFactory.name;
            tworker.rid = 0;
            tworker.rname = '';
            tworker.tid = 0;
            tworker.tfid = 0;
            tworker.tfname = '';
            tworker.job = 0;
            tworker.boss = false;
        },
        /*randomAssignToRoom(){ // 分配空闲人员到随机房间
            let myFactory = this.game.factoryList[0],
                myWorkerList = getListByID(myFactory.id,'fid',this.game.workerList),
                myFreeWorkerList = getMatchList(myWorkerList,[['job',0],['rid',0]]),
                myRoomList = getListByID(myFactory.id,'fid',this.game.roomList),
                roomIsFull = room =>{ // 判断一个房间里的人员数是否已满
                    let workerList = getListByID(room.id,'rid',this.game.workerList),
                        occupyCount = [2,3,4][room.level-1]+CONFIG.terminal_count_distribution[room.level-1];
                    return workerList.length>=occupyCount;
                };
            let _myFreeWorkerList = [...myFreeWorkerList], // 空闲人员列表
                _myFreeRoomList = [...myRoomList]; // 有空房间列表
            while(_myFreeWorkerList.length>0&&_myFreeRoomList.length>0){
                let targetWorker = _myFreeWorkerList[r(0,_myFreeWorkerList.length-1)],
                    targetRoom = _myFreeRoomList[r(0,_myFreeRoomList.length-1)];
                if(roomIsFull(targetRoom)){ // 房间已满，将此房间移出有空房间列表
                    _myFreeRoomList = removeFromList(targetRoom.id,'id',_myFreeRoomList);
                }
                else{ // 房间未满，将人员放入此房间
                    targetWorker.rid = targetRoom.id;
                    targetWorker.rname = targetRoom.name;
                    _myFreeWorkerList = removeFromList(targetWorker.id,'id',_myFreeWorkerList);
                }
            }
            for(let worker of _myFreeWorkerList){
                let rand = r(0,myRoomList.length-1),
                    targetRoom = myRoomList[rand];
                worker.rid = targetRoom.id;
                worker.rname = targetRoom.name;
            }
        },*/
        randomAssignToASRoom(workerList){ // 分配人员到随机自营房间
            let myFactory = this.game.factoryList[0];
            let myASRoomList = getMatchList(this.game.roomList,[['fid',myFactory.id],['group',2]]);
            let _myFreeASRoomList = []; // 有空自营房间列表
            for(let room of myASRoomList){
                if(!this.calcRoomIsFull(room)){
                    _myFreeASRoomList.push(room);
                }
            }
            while(workerList.length>0&&_myFreeASRoomList.length>0){
                let targetWorker = workerList[r(0,workerList.length-1)];
                let targetRoom = _myFreeASRoomList[r(0,_myFreeASRoomList.length-1)];
                if(this.calcRoomIsFull(targetRoom)){ // 房间已满，将此房间移出有空房间列表
                    _myFreeASRoomList = removeFromList(targetRoom.id,'id',_myFreeASRoomList);
                }
                else{ // 房间未满，将人员放入此房间
                    targetWorker.rid = targetRoom.id;
                    targetWorker.rname = targetRoom.name;
                    workerList = removeFromList(targetWorker.id,'id',workerList);
                }
            }
            for(let worker of workerList){
                let targetRoom = _myFreeASRoomList[r(0,_myFreeASRoomList.length-1)];
                if(targetRoom){
                    worker.rid = targetRoom.id;
                    worker.rname = targetRoom.name;
                }
            }
        },
        calcRoomIsFull(room){ // 判断一个房间里的人员数是否已满
            let workerList = getListByID(room.id,'rid',this.game.workerList);
            let occupyCount = [2,3,4][room.level-1]+CONFIG.terminal_count_distribution[room.level-1];
            return workerList.length>=occupyCount;
        },
        /*calcFreeTerminalCount(room){ // 计算一个房间内的空置终端数量
            let terminalList = getListByID(room.id,'rid',this.game.terminalList),
                workerList = getListByID(room.id,'rid',this.game.workerList),
                count = 0;
            for(let terminal of terminalList){
                let worker = getListByID(terminal.id,'tid',workerList)[0];
                if(!worker||worker.job==0)
                    count += 1;
            }
            return count;
        },*/
        calcFreeWorkerCount(room){ // 计算一个房间内的空置人员数量
            let workerList = getListByID(room.id,'rid',this.game.workerList),
                count = 0;
            for(let worker of workerList){
                if(worker.job==0)
                    count += 1;
            }
            return count;
        },
        calcTerminalOccupies(room){ // 计算房间的终端占用情况
            let res = [];
            let terminalList = getListByID(room.id,'rid',this.game.terminalList);
            let workerList = getListByID(room.id,'rid',this.game.workerList);
            for(let terminal of terminalList){
                let worker = getListByID(terminal.id,'tid',workerList)[0];
                if(!worker||worker.job==0){
                    res.push(0);
                }
                else{
                    res.push(1);
                }
            }
            return res;
        },
        arrangeRoom(room){ // 自动安排房间内部人员工位
            let factory = getListByID(room.fid,'id',this.game.factoryList)[0],
                _roomFreeWorkerList = [...getMatchList(this.game.workerList,[['rid',room.id],['job',0]])],
                _roomTerminalList = [...getListByID(room.id,'rid',this.game.terminalList)],
                _roomWorkerList = getListByID(room.id,'rid',this.game.workerList),
                omanager = getListByID(7,'job',_roomWorkerList)[0],
                oimageAgent = getListByID(8,'job',_roomWorkerList)[0],
                omaintainer = getListByID(6,'job',_roomWorkerList)[0],
                oautoWorker = getListByID(5,'job',_roomWorkerList)[0],
                manager,imageAgent,maintainer,autoWorker;
            if(!oimageAgent&&room.level>=2&&(_roomFreeWorkerList.length>2||room.basicImage>0)){
                imageAgent = bulbsort(_roomFreeWorkerList,'img')[0];
                if(imageAgent)
                    _roomFreeWorkerList = removeFromList(imageAgent.id,'id',_roomFreeWorkerList);
            }
            if(!oautoWorker&&room.level>=3&&room.auto<CONFIG.max_auto&&factory.money>CONFIG.room.auto_money_consume&&room.power>CONFIG.room.auto_power_consume){
                autoWorker = bulbsort(_roomFreeWorkerList,'int')[0];
                if(autoWorker)
                    _roomFreeWorkerList = removeFromList(autoWorker.id,'id',_roomFreeWorkerList);
            }
            if(!omaintainer&&room.durab>0&&factory.money>0){
                maintainer = bulbsort(_roomFreeWorkerList,'str')[0];
                if(maintainer)
                    _roomFreeWorkerList = removeFromList(maintainer.id,'id',_roomFreeWorkerList);
            }
            if(!omanager&&_roomFreeWorkerList.length>1){
                manager = bulbsort(_roomFreeWorkerList,'com')[0];
                if(manager)
                    _roomFreeWorkerList = removeFromList(manager.id,'id',_roomFreeWorkerList);
            }
            if(room.type>=1){
                _roomTerminalList = bulbsort(_roomTerminalList,['powerLevel','digLevel','tradeLevel'][room.type-1]);
                _roomFreeWorkerList = bulbsort(_roomFreeWorkerList,['str','int','com'][room.type-1]);
            }
            for(let ti=0;ti<_roomTerminalList.length;ti++){
                let terminal = _roomTerminalList[ti],
                    oworker = getListByID(terminal.id,'tid',_roomWorkerList)[0],
                    worker;
                if(room.type==0){
                    worker = _roomFreeWorkerList[r(0,_roomFreeWorkerList.length-1)];
                }
                else{
                    worker = _roomFreeWorkerList[0];
                }
                if(worker&&!oworker){
                    if(terminal.durab>=(CONFIG.terminal.durab_threshold-10)){ // 维护
                        worker.job = 4;
                    }
                    else{ // 发电|挖矿|交易
                        if(room.type>=1&&worker[['str','int','com'][room.type-1]]>=10){ // 特殊房间且人员相关能力值>=10
                            worker.job = room.type;
                        }
                        else{
                            if(worker.str>=worker.int&&worker.str>=worker.com){
                                worker.job = 1;
                            }
                            else if(worker.int>worker.str&&worker.int>worker.com){
                                worker.job = 2;
                            }
                            else if(worker.com>worker.str&&worker.com>worker.int){
                                worker.job = 3;
                            }
                            else{
                                worker.job = r(1,3);
                            }
                        }
                    }
                    worker.tid = terminal.id;
                    _roomFreeWorkerList = removeFromList(worker.id,'id',_roomFreeWorkerList);
                }
            }
            if(manager){
                manager.job = 7;
            }
            if(imageAgent){
                imageAgent.job = 8;
            }
            if(autoWorker){
                autoWorker.job = 5;
            }
            if(maintainer){
                maintainer.job = 6;
            }
        },
        autoServiceRoom(room){ // 自动管理房间
            let factory = getListByID(room.fid,'id',this.game.factoryList)[0],
                _roomWorkerList = getListByID(room.id,'rid',this.game.workerList), // 房间里的人员
                _roomTerminalList = [...getListByID(room.id,'rid',this.game.terminalList)],
                _roomFreeWorkerList = [], // 房间里的空闲人员
                omanager = getListByID(7,'job',_roomWorkerList)[0],
                manager,imageAgent,maintainer,autoWorker;
            // 清空岗位
            for(let worker of _roomWorkerList){
                if(worker.job!=7){
                    worker.tid = 0;
                    worker.job = 0;
                    _roomFreeWorkerList.push(worker);
                }
            }
            let oimageAgent = getListByID(8,'job',_roomWorkerList)[0];
            let omaintainer = getListByID(6,'job',_roomWorkerList)[0];
            let oautoWorker = getListByID(5,'job',_roomWorkerList)[0];

            // 安排岗位
            if(!oimageAgent&&room.level>=2&&(_roomFreeWorkerList.length>2||room.basicImage>0)){
                imageAgent = bulbsort(_roomFreeWorkerList,'img')[0];
                if(imageAgent)
                    _roomFreeWorkerList = removeFromList(imageAgent.id,'id',_roomFreeWorkerList);
            }
            if(!oautoWorker&&room.level>=3&&room.auto<CONFIG.max_auto&&factory.money>CONFIG.room.auto_money_consume&&room.power>CONFIG.room.auto_power_consume){
                autoWorker = bulbsort(_roomFreeWorkerList,'int')[0];
                if(autoWorker)
                    _roomFreeWorkerList = removeFromList(autoWorker.id,'id',_roomFreeWorkerList);
            }
            if(!omaintainer&&room.durab>3000&&factory.money>0){
                maintainer = bulbsort(_roomFreeWorkerList,'str')[0];
                if(maintainer){
                    omaintainer = maintainer;
                    _roomFreeWorkerList = removeFromList(maintainer.id,'id',_roomFreeWorkerList);
                }
            }
            if(!omanager&&_roomFreeWorkerList.length>1){
                manager = bulbsort(_roomFreeWorkerList,'com')[0];
                if(manager)
                    _roomFreeWorkerList = removeFromList(manager.id,'id',_roomFreeWorkerList);
            }
            if(room.type>=1){
                _roomTerminalList = bulbsort(_roomTerminalList,['powerLevel','digLevel','tradeLevel'][room.type-1]);
                _roomFreeWorkerList = bulbsort(_roomFreeWorkerList,['str','int','com'][room.type-1]);
            }
            for(let ti=0;ti<_roomTerminalList.length;ti++){
                let terminal = _roomTerminalList[ti],
                    oworker = getListByID(terminal.id,'tid',_roomWorkerList)[0],
                    worker;
                if(room.type==0){
                    worker = _roomFreeWorkerList[r(0,_roomFreeWorkerList.length-1)];
                }
                else{
                    worker = _roomFreeWorkerList[0];
                }
                if(worker&&!oworker){
                    if(terminal.durab>=(CONFIG.terminal.durab_threshold-10)){ // 维护
                        worker.job = 4;
                    }
                    else{ // 发电|挖矿|交易
                        if(room.power<=0){
                            worker.job = 1;
                        }
                        else if(room.type>=1&&worker[['str','int','com'][room.type-1]]>=10){ // 特殊房间且人员相关能力值>=10
                            worker.job = room.type;
                        }
                        else{
                            if(worker.str>=worker.int&&worker.str>=worker.com){
                                worker.job = 1;
                            }
                            else if(worker.int>worker.str&&worker.int>worker.com){
                                worker.job = 2;
                            }
                            else if(worker.com>worker.str&&worker.com>worker.int){
                                worker.job = 3;
                            }
                            else{
                                worker.job = r(1,3);
                            }
                        }
                    }
                    worker.tid = terminal.id;
                    _roomFreeWorkerList = removeFromList(worker.id,'id',_roomFreeWorkerList);
                }
            }
            if(!omaintainer&&_roomFreeWorkerList.length>0&&room.durab>0&&factory.money>0){
                maintainer = bulbsort(_roomFreeWorkerList,'str')[0];
                if(maintainer)
                    _roomFreeWorkerList = removeFromList(maintainer.id,'id',_roomFreeWorkerList);
            }
            if(manager){
                manager.job = 7;
            }
            if(imageAgent){
                imageAgent.job = 8;
            }
            if(autoWorker){
                autoWorker.job = 5;
            }
            if(maintainer){
                maintainer.job = 6;
            }
            // 设置策略
            if(room.durab>=CONFIG.max_durab&&room.auto<CONFIG.max_auto){
                room.risk = 1;
            }
            else if(room.auto>=CONFIG.max_auto&&room.power>=1000){
                room.risk = 3;
            }
            else{
                room.risk = 2;
            }
            return _roomFreeWorkerList;
        },
        endOneDay(){ // 一天的数据计算
            let logContent = {},
                logSuffix = '',
                logRoomList = [],
                logInvestList = [],

                moneyIncome = 0,
                imageIncome = 0,
                rrpIncome = 0,
                hrpIncome = 0,
                supportIncome = 0,
                myFactory = this.game.factoryList[0],
                myRoomList = getListByID(myFactory.id,'fid',this.game.roomList),
                relationList = getListByID(myFactory.id,'from',this.game.relationList),
                workerList = getListByID(myFactory.id,'fid',this.game.workerList),
                imageAgent = getListByID(11,'job',workerList)[0],
                calcFade = x =>{
                    return 2-(2*x/(x+1));
                },
                calcRoomIncome = (room,income,riskImpact,roomWorkerList,abi) =>{
                    let balance = this.calcBalance(room,roomWorkerList);
                    let durabImpact = 1;
                    if(room.durab>0&&room.durab<1000){
                        durabImpact = .98;
                    }
                    else if(room.durab>=1000&&room.durab<2000){
                        durabImpact = .96;
                    }
                    else if(room.durab>=2000&&room.durab<3000){
                        durabImpact = .94;
                    }
                    else if(room.durab>=3000&&room.durab<4000){
                        durabImpact = .92;
                    }
                    else if(room.durab>=4000&&room.durab<CONFIG.room.durab_threshold){
                        durabImpact = .9;
                    }
                    else if(room.durab>=CONFIG.room.durab_threshold){
                        durabImpact = 1-room.durab/CONFIG.max_durab;
                    }
                    if(abi&&abi>0){ // 重新计算 riskImpact
                        if(room.risk==3){ // 高强
                            riskImpact = 2+.5*abi/CONFIG.max_worker_ability;
                        }
                    }
                    return Math.round(income*durabImpact*(balance/100)*riskImpact);
                };
            let myAutoServiceRoomList = getMatchList(myRoomList,[['group',2]]);

            let totalPowerProduce = 0; // 总电力产出
            let totalPowerConsume = 0; // 总电力消耗
            let calcMaxPowerRoom = roomList =>{ // 计算房间列表中电量最多的房间
                    let res;
                    let max = 0;
                    for(let room of roomList){
                        if(max<room.power&&room.power>=10){
                            max = room.power;
                            res = room;
                        }
                    }
                    return res;
                };
            // myAutoServiceRoomList = bulbsort(myAutoServiceRoomList,'level');
            for(let room of myAutoServiceRoomList){ // 自营房间自动安排工作
                // let roomFreeWorkerList = this.autoServiceRoom(room);
                let freeWorkerList = getMatchList(this.game.workerList,[['job',0],['fid',this.game.factoryList[0].id]]);
                if(freeWorkerList.length>0){ // 自动分配空闲员工
                    this.randomAssignToASRoom(freeWorkerList);
                }
                if(room.power<=0){ // 如果没电了，自动选择自营房间中电力最高的房间，分配一半电力过来
                    let maxPowerRoom = calcMaxPowerRoom(myAutoServiceRoomList)||{power:0};
                    let transferPower = Math.round(maxPowerRoom.power/2);
                    maxPowerRoom.power -= transferPower;
                    room.power += transferPower;
                }
            }
            for(let room of myAutoServiceRoomList){ // 再一次自营房间自动安排工作
                this.autoServiceRoom(room);
            }
            myRoomList = bulbsort(myRoomList,'group',0);
            for(let room of myRoomList){ // 演算每个房间
                let myTerminalList = getListByID(room.id,'rid',this.game.terminalList),
                    roomWorkerList = getListByID(room.id,'rid',this.game.workerList),
                    oManager = getListByID(7,'job',roomWorkerList)[0],
                    oMaintainer = getListByID(6,'job',roomWorkerList)[0],
                    oAutoWorker = getListByID(5,'job',roomWorkerList)[0],
                    roomImageAgent = getListByID(8,'job',roomWorkerList)[0],
                    roomPowerIncome = 0,
                    roomMoneyIncome = 0,
                    roomImageIncome = 0,
                    roomSupportIncome = 0,
                    roomAutoIncome = 0,
                    roomDurabReduce = 0,
                    roomDurabIncrease = 0,
                    roomPowerConsume = 0,
                    roomMoneyConsume = 0,
                    roomLog = {},
                    workingWorkerCount = 0; // 房间内正在终端工作（发电、挖矿和交易）的人员数
                let manager = cloneObj(oManager);
                let maintainer = cloneObj(oMaintainer);
                let autoWorker = cloneObj(oAutoWorker);
                if(room.group==2){ // 如果是自营房间，则视房间内所有员工的体力、智力和交流均为 50
                    if(oManager){
                        manager.str = 50;
                        manager.int = 50;
                        manager.com = 50;
                    }
                    if(oMaintainer){
                        maintainer.str = 50;
                        maintainer.int = 50;
                        maintainer.com = 50;
                    }
                    if(oAutoWorker){
                        autoWorker.str = 50;
                        autoWorker.int = 50;
                        autoWorker.com = 50;
                    }
                }
                roomLog.name = room.name;
                roomLog.terminalList = [];
                for(let terminal of myTerminalList){ // 演算每个终端
                    let oMyWorker = getListByID(terminal.id,'tid',this.game.workerList)[0],
                        terminalPowerIncome = 0,
                        terminalMoneyIncome = 0,
                        terminalDurabReduce = 0,
                        terminalDurabIncrese = 0,
                        terminalSupportIncome = 0,
                        terminalPowerConsume = 0,
                        terminalMoneyConsume = 0;
                    let myWorker = cloneObj(oMyWorker);
                    if(oMyWorker&&room.group==2){ // 如果是自营房间，则视房间内所有员工的体力、智力和交流均为 50
                        myWorker.str = 50;
                        myWorker.int = 50;
                        myWorker.com = 50;
                    }
                    if(myWorker&&myWorker.job){ // 如果该终端有正在工作的工人
                        let durabImpact = 1,
                            roomLevelImpact = room.level+CONFIG.room.base,
                            typeImpact = CONFIG.room.type_normal_factor;
                        if(terminal.durab>0&&terminal.durab<1000){
                            durabImpact = .98;
                        }
                        else if(terminal.durab>=1000&&terminal.durab<2000){
                            durabImpact = .96;
                        }
                        else if(terminal.durab>=2000&&terminal.durab<3000){
                            durabImpact = .94;
                        }
                        else if(terminal.durab>=3000&&terminal.durab<4000){
                            durabImpact = .92;
                        }
                        else if(terminal.durab>=4000&&terminal.durab<CONFIG.terminal.durab_threshold){
                            durabImpact = .9;
                        }
                        else if(terminal.durab>CONFIG.terminal.durab_threshold){
                            durabImpact = 1-terminal.durab/CONFIG.max_durab;
                        }
                        switch(myWorker.job){
                            case 1: // 发电
                                if(room.type==1)
                                    typeImpact = CONFIG.room.type_increase_factor;
                                else if(room.type!=0)
                                    typeImpact = CONFIG.room.type_decrease_factor;
                                terminalPowerIncome = Math.round(myWorker.str*(CONFIG.terminal.base+terminal.powerLevel)*roomLevelImpact*durabImpact*CONFIG.terminal.power_factor*typeImpact);
                                terminalDurabIncrese = CONFIG.terminal.durab_increase*(1-room.auto/CONFIG.max_auto);
                                workingWorkerCount += 1;
                            break;
                            case 2: // 挖矿
                                if(room.power>0){
                                    if(room.type==2)
                                        typeImpact = CONFIG.room.type_increase_factor;
                                    else if(room.type!=0)
                                        typeImpact = CONFIG.room.type_decrease_factor;
                                    terminalMoneyIncome = Math.round(myWorker.int*(CONFIG.terminal.base+terminal.digLevel)*roomLevelImpact*durabImpact*CONFIG.terminal.dig_factor*typeImpact);
                                    terminalPowerConsume = CONFIG.terminal.dig_power_consume_base+terminal.digLevel*CONFIG.terminal.dig_power_consume_factor;
                                    terminalDurabIncrese = CONFIG.terminal.durab_increase*(1-room.auto/CONFIG.max_auto);
                                    workingWorkerCount += 1;
                                }
                            break;
                            case 3: // 交易
                                if(room.power>0){
                                    if(room.type==3)
                                        typeImpact = CONFIG.room.type_increase_factor;
                                    else if(room.type!=0)
                                        typeImpact = CONFIG.room.type_decrease_factor;
                                    terminalMoneyIncome = Math.round(myWorker.com*(CONFIG.terminal.base+terminal.tradeLevel)*roomLevelImpact*durabImpact*CONFIG.terminal.trade_money_factor*typeImpact);
                                    terminalSupportIncome = Math.round(myWorker.com*(CONFIG.terminal.base+terminal.tradeLevel)*roomLevelImpact*durabImpact*CONFIG.terminal.trade_support_factor*typeImpact);
                                    terminalPowerConsume = CONFIG.terminal.trade_power_consume_base+terminal.tradeLevel*CONFIG.terminal.trade_power_consume_factor;
                                    terminalDurabIncrese = CONFIG.terminal.durab_increase*(1-room.auto/CONFIG.max_auto);
                                    workingWorkerCount += 1;
                                }
                            break;
                            case 4: // 终端维护
                                if(myFactory.money>0){
                                    terminalDurabReduce = Math.round(myWorker.str*CONFIG.terminal.durab_factor);
                                    terminalMoneyConsume = terminalDurabReduce*CONFIG.terminal.durab_consume_factor;
                                }
                            break;
                        }
                        if(room.risk==1){ // 如果房间处于保护模式
                            terminalDurabIncrese = 0;
                        }
                        else if(room.risk==3){ // 如果房间处于高强模式
                            terminalDurabIncrese = terminalDurabIncrese*3;
                        }
                    }
                    // 终端数据赋值
                    terminal.durab += terminalDurabIncrese-terminalDurabReduce;
                    if(terminal.durab<0)
                        terminal.durab = 0;
                    else if(terminal.durab>CONFIG.max_durab)
                        terminal.durab = CONFIG.max_durab;
                    // 计算房间数据
                    roomDurabIncrease += terminalDurabIncrese*CONFIG.room.durab_increase_factor;
                    roomPowerIncome += terminalPowerIncome;
                    roomMoneyIncome += terminalMoneyIncome;
                    roomSupportIncome += terminalSupportIncome;
                    roomPowerConsume += terminalPowerConsume;
                    roomMoneyConsume += terminalMoneyConsume;
                }

                // 计算房间数据
                let roomRiskImpact = 1, durabImpact = 1;
                if(room.risk==1){ // 保护
                    durabImpact = 0;
                    roomRiskImpact = .5;
                }
                else if(room.risk==3){ // 高强
                    durabImpact = 3;
                    roomRiskImpact = 2;
                }
                let abi = 0;
                if(manager){
                    if(room.type>0){
                        abi = manager[['str','int','com'][room.type-1]];
                    }
                    else{
                        abi = Math.round(avg([manager.str,manager.int,manager.com]));
                    }
                }
                roomPowerIncome = calcRoomIncome(room,roomPowerIncome,roomRiskImpact,roomWorkerList,abi);
                roomMoneyIncome = calcRoomIncome(room,roomMoneyIncome,roomRiskImpact,roomWorkerList,abi);
                roomSupportIncome = calcRoomIncome(room,roomSupportIncome,roomRiskImpact,roomWorkerList,abi);
                if(manager){ // 房间管理员

                }
                if(roomImageAgent){ // 房间门面
                    roomImageIncome = Math.round((roomImageAgent.img+room.basicImage)*CONFIG.room.image_increse_factor+CONFIG.room.image_increse_base);
                }
                if(myFactory.money>0&&maintainer){ // 房间维护
                    roomDurabReduce = Math.round(maintainer.str*CONFIG.room.durab_factor);
                    roomMoneyConsume += Math.round(roomDurabReduce*CONFIG.room.durab_consume_factor);
                    for(let terminal of myTerminalList){ // 演算每个终端
                        let terminalDurabReduce = roomDurabReduce*CONFIG.room.durab_terminal_factor;
                        terminal.durab -= Math.round(terminalDurabReduce);
                        if(terminal.durab<0)
                            terminal.durab = 0;
                        else if(terminal.durab>CONFIG.max_durab)
                            terminal.durab = CONFIG.max_durab;
                    }
                }
                if(myFactory.money>0&&room.power>0&&autoWorker){ // 房间自动化
                    roomAutoIncome = Math.round(autoWorker.int*CONFIG.room.auto_factor);
                    roomMoneyConsume += CONFIG.room.auto_money_consume;
                    roomPowerConsume += CONFIG.room.auto_power_consume;
                }

                // 房间数据赋值
                roomPowerConsume = roomPowerConsume*(room.risk!=3?roomRiskImpact:(roomRiskImpact+1));
                room.power += Math.round(roomPowerIncome-roomPowerConsume);
                roomDurabIncrease = roomDurabIncrease*calcFade(workingWorkerCount);
                roomDurabIncrease = Math.round((roomDurabIncrease+CONFIG.room.durab_fix)*durabImpact*(1-room.auto/CONFIG.max_auto));
                room.durab += roomDurabIncrease-roomDurabReduce;
                if(room.durab<0)
                    room.durab = 0;
                else if(room.durab>CONFIG.max_durab)
                    room.durab = CONFIG.max_durab;
                room.auto += roomAutoIncome;
                if(room.auto>CONFIG.max_auto)
                    room.auto = CONFIG.max_auto;

                // 累加工厂数据
                moneyIncome += Math.round(roomMoneyIncome-roomMoneyConsume);
                supportIncome += Math.round(roomSupportIncome);
                imageIncome += Math.round(roomImageIncome);

                // 生成房间报表
                roomLog = {
                    name: room.name,
                    group: room.group,
                    powerIncome: Math.round(roomPowerIncome),
                    moneyIncome: Math.round(roomMoneyIncome),
                    imageIncome: Math.round(roomImageIncome),
                    supporrtIncome: Math.round(roomSupportIncome),
                    powerConsume: Math.round(roomPowerConsume),
                    moneyConsume: Math.round(roomMoneyConsume),
                }
                totalPowerProduce += roomLog.powerIncome;
                totalPowerConsume += roomLog.powerConsume;
                logRoomList.push(roomLog);
            }

            // 计算我的工厂数据
            if(imageAgent){
                let imgBase = Math.pow(imageAgent.img,2)/60;
                imageIncome += Math.round(imageAgent.img*CONFIG.factory.image_increse_factor)+CONFIG.factory.image_increse_base;
            }
            let searchRoomWorkerList = getListByID(10,'job',workerList),
                searchWorkerWorkerList = getListByID(9,'job',workerList);
            for(let worker of searchRoomWorkerList){
                rrpIncome += Math.round((Math.max(worker.str,worker.int))*CONFIG.factory.rrp_factor)+CONFIG.factory.hrp_fix;
            }
            if(myFactory.image>0){
                let myImagePct = 0, // 我的工厂形象占比
                    totalImage = 0,
                    avgImage = 0;
                for(let factory of this.game.factoryList){
                    if(factory.image>0){
                        totalImage += factory.image;
                    }
                }
                if(totalImage>0){
                    avgImage = totalImage/this.game.factoryList.length;
                    myImagePct = myFactory.image/avgImage;
                }
                for(let worker of searchWorkerWorkerList){
                    hrpIncome += Math.round((myImagePct*CONFIG.factory.image_hrp_factor)*(Math.max(worker.com,worker.img))*CONFIG.factory.hrp_factor+CONFIG.factory.hrp_fix);
                }
            }

            rrpIncome = Math.round(rrpIncome*calcFade(searchRoomWorkerList.length));
            hrpIncome = Math.round(hrpIncome*calcFade(searchWorkerWorkerList.length));

            // 智能输送电力
            for(let froom of myRoomList){
                if(froom.assignPower){
                    let toRoomList = []; // 需要输送的房间列表
                    for(let troom of myRoomList){
                        if(troom.avgPower&&troom.power<=froom.power){
                            toRoomList.push(troom);
                        }
                    }
                    let ind = 0;
                    let assignPower = Math.floor(froom.power/2);
                    let avgPower = Math.round(assignPower/toRoomList.length);
                    if(toRoomList.length>0){ // 进行输送
                        froom.power -= assignPower;
                        for(;ind<toRoomList.length-1;ind++){
                            toRoomList[ind].power += avgPower;
                            assignPower -= avgPower;
                        }
                        toRoomList[ind].power += assignPower;
                    }
                }
            }

            // 还债
            let remainDays = this.dayLimit-this.day+1;
            if(remainDays<=0&&this.game.factoryList.length>1){
                moneyIncome -= 50000+Math.abs(remainDays*1000);
                imageIncome -= 5000+Math.abs(remainDays*100);
                rrpIncome -= 500+Math.abs(remainDays*10);
                hrpIncome -= 500+Math.abs(remainDays*1);
                let loseWorkerCount = r(0,3);
                for(let i=0;i<loseWorkerCount;i++){
                    let myWorkerList = getListByID(this.game.factoryList[0].id,'fid',this.game.workerList),
                        loseWorker = myWorkerList[r(0,myWorkerList.length-1)];
                    if(loseWorker&&!loseWorker.boss){
                        this.game.workerList = removeFromList(loseWorker.id,'id',this.game.workerList);
                    }
                }
            }

            // 我的工厂数据赋值 1
            myFactory.rrp += rrpIncome;
            myFactory.hrp += hrpIncome;

            // 计算外交数据&赋值
            for(let relation of relationList){
                let youFactory = getListByID(relation.to,'id',this.game.factoryList)[0],
                    joint = getMatchList(workerList,[['tfid',relation.to],['job',12]])[0],
                    spyList = getMatchList(workerList,[['tfid',relation.to],['job',13]]);
                // 外交员
                if(joint&&myFactory.image>0){
                    let supportIncrease = Math.round(CONFIG.relation.support_increase_fix+CONFIG.relation.support_joint_increase_factor*joint.com)+Math.round(supportIncome*CONFIG.relation.support_trade_increase_factor);
                    relation.support += supportIncrease;
                    logSuffix += `<p><span style="color:green">▲</span> 我厂对${youFactory.name}的支持率提升了</p>`;
                }
                else{
                    if(relation.support>0){
                        logSuffix += `<p><span style="color:red">▼</span> 我厂对${youFactory.name}的支持率下降了</p>`;
                    }
                    relation.support -= CONFIG.relation.support_decrease_fix;
                }
                if(relation.support<0)
                    relation.support = 0;
                else if(relation.support>CONFIG.max_support)
                    relation.support = CONFIG.max_support;
                // 间谍
                if(spyList.length>0&&myFactory.money>0){
                    let sortedMySpyList = bulbsort(spyList,'int');
                    let _youWorkerList = getListByID(youFactory.id,'fid',this.game.workerList);
                    let youWorkerList = [];
                    for(let worker of _youWorkerList){ // boss不参与识破工作
                        if(!worker.boss){
                            youWorkerList.push(worker);
                        }
                    }
                    let sortedYouWorkerList = bulbsort(youWorkerList,'int');
                    let youTopWorker = sortedYouWorkerList[0];
                    let youTopInt = youTopWorker?youTopWorker.int:0;
                    for(let i=0;i<sortedMySpyList.length;i++){
                        let mySpy = sortedMySpyList[i],
                            myInt = mySpy?mySpy.int:0,
                            imageDamage = 0,
                            spyConsume = myInt*5-(100-youTopInt)*4+CONFIG.relation.image_decrease_consume_fix;
                        if(mySpy&&myInt>youTopInt){
                            imageDamage = Math.round(myInt*1.8+15-youTopInt/4);
                            youFactory.imageDamaged = true;
                            youFactory.image -= imageDamage;
                            moneyIncome -= spyConsume;
                            logSuffix += `<p><span style="color:green">▲</span> ${mySpy.name}（${myInt}）的间谍工作对${youFactory.name}造成了 <b>${imageDamage}</b> 的形象损失（我厂消耗 <b>${spyConsume}</b> $）</p>`;
                        }
                        else if(mySpy&&youTopWorker){
                            moneyIncome -= spyConsume;
                            logSuffix += `<p><span style="color:red">▼</span> ${mySpy.name}（${myInt}）的间谍工作被 ${youTopWorker.name}（${youTopWorker.name}）识破了，没有造成任何效果（我厂消耗 <b>${spyConsume}</b> $）</p>`;
                        }
                    }
                }
            }

            // 其他工厂行动（AI）
            let totalMoney = 0, // 其他工厂的资金总和
                totalImage = 0; // 其他工厂的形象总和
            for(let youFactory of this.game.factoryList){
                if(youFactory.id!=myFactory.id){
                    totalMoney += youFactory.money;
                    totalImage += youFactory.image;
                }
            }
            for(let youFactory of this.game.factoryList){
                if(youFactory.id!=myFactory.id){
                    let youMoneyIncome = 0,
                        youMoneyIncomeImpact = 0,
                        youImageIncome = 0,
                        youImageIncomeImpact = 0,
                        youWorkerList = getListByID(youFactory.id,'fid',this.game.workerList),
                        youRoomList = getListByID(youFactory.id,'fid',this.game.roomList),
                        commonRoomList = getListByID(0,'type',youRoomList),
                        powerRoomList = getListByID(1,'type',youRoomList),
                        digRoomList = getListByID(2,'type',youRoomList),
                        tradeRoomList = getListByID(3,'type',youRoomList),
                        relation = getListByID(youFactory.id,'to',this.game.relationList)[0],
                        rand = 0,
                        youBoss = getMatchList(this.game.workerList,[['fid',youFactory.id,'boss',true]])[0];
                    for(let worker of youWorkerList){
                        let moneyImp = worker.str*powerRoomList.length+worker.int*digRoomList.length+worker.com*tradeRoomList.length+45*commonRoomList.length,
                            imageImp = worker.img;
                        youMoneyIncomeImpact += moneyImp;
                        youImageIncomeImpact += imageImp;
                    }
                    youMoneyIncomeImpact = Math.floor(youMoneyIncomeImpact*.4);
                    youImageIncomeImpact = Math.floor(youImageIncomeImpact*.2);
                    youMoneyIncome = r(Math.floor(youMoneyIncomeImpact/3),youMoneyIncomeImpact);
                    if(!youFactory.imageDamaged){
                        youImageIncome = r(Math.floor(youImageIncomeImpact/4),youImageIncomeImpact);
                    }
                    youMoneyIncome = Math.round(youMoneyIncome*youFactory.image*0.00008);
                    if(relation.invest>0){ // 结算彼此投资收益
                        let supportPct = relation.support/CONFIG.max_support,
                            investIncome = youMoneyIncome*supportPct+relation.invest*supportPct*.0008,
                            infract = relation.invest/youFactory.money*5;
                        if(infract>10)
                            infract = 10;
                        investIncome = Math.round(investIncome*infract);
                        if(investIncome<0){
                            investIncome = 0;
                        }
                        moneyIncome += investIncome;
                        youMoneyIncome += Math.round(investIncome*.125);
                        logInvestList.push({
                            name: youFactory.name,
                            income: investIncome,
                        });
                    }
                    youFactory.money += youMoneyIncome;
                    youFactory.image += youImageIncome;
                    if(this.day%CONFIG.period==0){
                        // 随机添加房间
                        rand = r(0,totalMoney*10);
                        if(rand<youFactory.money){
                            let newRoom = genRandomRoom(window.GLOBAL.accRoomID++,{fid:youFactory.id,fname:youFactory.name,});
                            this.game.roomList.push(newRoom);
                            for(let i=0;i<CONFIG.terminal_count_distribution[newRoom.level-1];i++){ // 生成新的终端
                                let newTerminal = {
                                    id: window.GLOBAL.accTerminalID++,
                                    fid: newRoom.fid,
                                    rid: newRoom.id,
                                	durab: CONFIG.init.terminalDurab,
                                	powerLevel: CONFIG.init.terminalPowerLevel,
                                	digLevel: CONFIG.init.terminalDigLevel,
                                	tradeLevel: CONFIG.init.terminalTradeLevel,
                                };
                                this.game.terminalList.push(newTerminal);
                            }
                        }
                        // 随机添加人员
                        rand = r(0,totalImage*2);
                        if(rand<youFactory.image){
                            this.game.workerList.push(genRandomWorker(window.GLOBAL.accWorkerID++,{
                                fid: youFactory.id,
                                fname: youFactory.name,
                                boss: false,
                                baseOn: youBoss,
                            }));
                        }
                    }
                }
            }

            // 我的工厂数据赋值 2
            moneyIncome = Math.round(moneyIncome);
            imageIncome = Math.round(imageIncome);
            myFactory.money += moneyIncome;
            myFactory.image += imageIncome;
            if(myFactory.image>=CONFIG.relation.joint_image_threshold&&!myFactory.canViewRelation){
                myFactory.canViewRelation = true;
                let no_tip3 = localStorage.getItem(CACHE.tip3);
                if(!no_tip3){
                    this.tip3 = true;
                }
                logSuffix += `<p>- 外交系统已解锁 -</p>`;
            }

            // 其他
            if(this.day!=1&&this.day%CONFIG.period==0){ // 每隔 period 日
                this.game.roomList = removeFromList(0,'fid',this.game.roomList);
                this.game.workerList = removeFromList(0,'fid',this.game.workerList);
                for(let factory of this.game.factoryList){
                    factory.damaged = false;
                    factory.sanctioned = false;
                    factory.imageDamaged = false;
                    factory.imageProped = false;
                }
                logSuffix += `<p>- 搜索资源已清空 -</p>`;
            }
            if(this.day%365==0){ // 过年
                for(let worker of this.game.workerList){
                    worker.age += 1;
                }
            }

            // 生产工厂报表
            logContent = {
                moneyIncome,
                imageIncome,
                rrpIncome,
                hrpIncome,
                totalPowerProduce,
                totalPowerConsume,
                roomList: logRoomList,
                investList: logInvestList,
                suffix: logSuffix,
            }
            this.game.logList.unshift({ title: `第 ${this.day} 天`, id: this.day, content: logContent, subTitle: `收入 ${moneyIncome} $，形象提升 ${imageIncome}` });
            this.day += 1;
            this.tipList = [];
        },

        onChangeAutoSave(status){ // 修改【自动存档】
            this.autoSave = status;
            localStorage.setItem('AS',status);
        },
        onChangeAvgPower(status){ // 修改【参与平分电力】
            let room = getListByID(this.tempData.room.id,'id',this.game.roomList)[0];
            room.avgPower = status?1:0;
            this.asynAllPages();
        },
        onChangeAssignPower(status){ // 修改【智能输送电力】
            let room = getListByID(this.tempData.room.id,'id',this.game.roomList)[0];
            room.assignPower = status?1:0;
            this.asynAllPages();
        },

        onTapCheat(){ // 点击【作弊】按钮
            console.log(this.game.factoryList[0]);
            this.game.factoryList[0].rrp = 10000;
            this.game.factoryList[0].hrp = 50000;
            this.game.factoryList[0].money = 2400000;
            this.game.factoryList[0].image = 30000;
            this.asynAllPages();
        },

        onTapDrag(index){ // 点击【悬浮拖拽】按钮
            if(this.loading) return;
            switch(index){
                case 1: // 手动存档
                    this.save(1);
                break;
                case 2: // 删除存档
                    let _this = this;
                    this.$dialog({
                        title: '确定删除此存档？',
                        content: '若误删可立即点击【存档】按钮保存当前游戏',
                        onOkBtn: function(){
                            _this.deleteSave();
                            this.close();
                        }
                    });
                break;
                case 3: // 新手指导
                    this.showSystemMenu = false;
                    this.showGuide = true;
                break;
                case 4: // 当前页面操作指南
                    this.showSystemMenu = false;
                    this.showRule = true;
                break;
                case 5: // 退出游戏
                    this.$router.push('/');
                break;
            }
        },
        onTapGo(){ // 点击【结束】按钮
            let myWorkerList = getListByID(this.game.factoryList[0].id,'fid',this.game.workerList),
                myRoomList = getListByID(this.game.factoryList[0].id,'fid',this.game.roomList),
                hasLazyWorker = false,
                hasNoPowerRoom = false;
            let myMainRoomList = getMatchList(myRoomList,[['group',0]]);
            for(let worker of myWorkerList){
                if(!worker.boss&&worker.job==0){
                    hasLazyWorker = true;
                    break;
                }
            }
            for(let room of myMainRoomList){
                if(room.power<=0&&room.avgPower==1){
                    hasNoPowerRoom = true;
                    break;
                }
            }
            this.tipList = [];
            if(this.day%CONFIG.period==0)
                this.tipList.push('明日市场资源将清空');
            if(hasLazyWorker)
                this.tipList.push('有空闲的员工');
            if(hasNoPowerRoom)
                this.tipList.push('有房间电力不足');
            this.showConfirmGo = true;
        },
        onTapConfirmGo(type){ // 点击【确认结束】按钮
            try{
                this.showConfirmGo = false;
                if(type==1){
                    this.endOneDay();
                }
                else if(type==2){ // 快进至本旬结束
                    while(this.day%CONFIG.period){
                        this.endOneDay();
                    }
                    this.endOneDay();
                }
                this.jump(99);
                this.onTapLog(this.day-1);
                if(this.autoSave){
                    if(!((this.day-1)%CONFIG.period)){
                        this.save();
                    }
                }
                let remainDays = this.dayLimit-this.day+1;
                if((remainDays==200||remainDays==100||remainDays==50||remainDays==40||remainDays==30||remainDays==20||remainDays==10)&&this.game.factoryList.length>1){
                    this.$dialog({
                        title: '请注意',
                        textAlign: 'center',
                        content: `你还剩 ${remainDays} 天的时间，请尽快收购所有工厂。`,
                        noCancelBtn: true,
                        noOkBtn: true,
                    });
                }
                else if(remainDays==0&&this.game.factoryList.length>1){
                    this.$dialog({
                        title: '游戏失败',
                        content: `你未在规定时间内垄断整个行业。`,
                        noCancelBtn: true,
                        noOkBtn: true,
                    });
                }
            }
            catch(e){
                window.alert(e);
            }
        },

        onTapTab(index){ // 点击【标签页码】
            if((index==2&&!this.calcRoomLockStat())||(index==3&&!this.calcTerminalLockStat())){
                return ;
            }

            if(index==2&&this.searchingRoomID){
                this.jump(index,this.searchingRoomID);
            }
            else if(index==3&&this.searchingTerminalID){
                this.jump(index,this.searchingTerminalID);
            }
            else if(index==4&&this.searchingWorkerID){
                this.jump(index,this.searchingWorkerID);
            }
            else{
                this.jump(index);
            }
        },
        onTapEditFactoryName(){ // 点击【编辑工厂名】按钮
            this.showEditFactoryName = true;
        },
        onTapRoomLevelUp(){ // 点击【房间升级】按钮
            let rid = (this.tempData.room||{}).id,
                tid = (this.tempData.terminal||{}).id,
                room = getListByID(rid,'id',this.game.roomList)[0],
                cost = this.config.room_levelup_cost[room.level-1];
            if(room.level<this.config.max_room_level){
                if(this.game.factoryList[0].money>=cost){
                    this.game.factoryList[0].money -= cost;
                    room.level += 1;
                    let addition = CONFIG.terminal_count_distribution[room.level-1]-this.tempData.myTerminalList.length;
                    for(let i=0;i<addition;i++){
                        this.game.terminalList.push({
                            id: window.GLOBAL.accTerminalID++,
                            fid: this.game.factoryList[0].id,
                            rid: room.id,
                        	durab: CONFIG.init.terminalDurab,
                        	powerLevel: CONFIG.init.terminalPowerLevel,
                        	digLevel: CONFIG.init.terminalDigLevel,
                        	tradeLevel: CONFIG.init.terminalTradeLevel,
                        });
                    }
                    this.asynAllPages();
                }
                else{
                    this.$toast.text('资金不足');
                }
            }
        },
        onTapTerminalLevelUp(type){ // 点击【终端升级】按钮
            let rid = this.tempData.terminal.room.id,
                tid = this.tempData.terminal.id,
                terminal = getListByID(tid,'id',this.game.terminalList)[0];
            if(terminal){
                let level = terminal[type+'Level'];
                if(level<this.config.max_terminal_level){
                    let cost = this.config[type+'_levelup_cost'][level-1];
                    if(this.game.factoryList[0].money>=cost){
                        this.game.factoryList[0].money -= cost;
                        terminal[type+'Level'] += 1;
                        this.asynAllPages();
                    }
                    else{
                        this.$toast.text('资金不足');
                    }
                }
            }
        },
        onTapRiskLevel(index){ // 点击【策略等级】按钮
            let room = this.tempData.room;
            room.risk = index;
            let aroom = getListByID(room.id,'id',this.game.roomList)[0];
            if(aroom)
                aroom.risk = room.risk;
            this.asynAllPages();
        },
        onTapAddWorker(mode){ // 点击【+】按钮
            this.tempData.workListPopMode = mode;
            this.showWorkerList = true;
            switch(mode){
                case 1: // 形象代言人
                    this.popTip = `选择「形象」高的人，持续提升工厂形象`;
                break;
                case 2: // 房间管理员
                    this.popTip = `选择「交流」能力高的人来固定房间的协调值`;
                break;
                case 3: // 房间维护工人
                    this.popTip = `选择「体能」高的人，降低房间老化，同时小幅降低每个终端的老化，同时会持续消耗资金`;
                break;
                case 4: // 房间门面
                    this.popTip = `选择「形象」高的人，持续提升工厂形象`;
                break;
                case 5: // 房间工程师
                    this.popTip = `选择「智力」高的人，消耗资金以提升房间的自动化程度`;
                break;
                case 6: // 终端工人
                    this.popTip = `发电和维护需要「体能」，挖矿需要「智力」，交易需要「交流」能力`;
                break;
                case 7: // 房间搜索点数
                    this.popTip = `房间搜索点数的增量取决于搜索人员的「体能」和「智力」中最高的一项，可任命多人`;
                break;
                case 8: // 人力搜索点数
                    this.popTip = `人力搜索点数的增量取决于搜索人员的「交流」和「形象」中最高的一项，可任命多人`;
                break;
                case 9: // 外交员
                    this.popTip = `派选「交流」能力高的人来持续提升对此工厂的支持率`;
                break;
                case 10: // 间谍
                    this.popTip = `派选「智力」高的人对此工厂的形象造成持续的损耗，同时会持续大量消耗我厂资金，可任命多人`;
                break;
                case 11: // 资源管理员
                    this.popTip = `令市场倾向于出现与资源管理员能力相近的新人`;
                break;
                default:
                    this.popTip = '';
            }
            this.asynAllPages();
        },
        onTapRemoveWorker(mode){ // 点击【-】按钮
            let rid = (this.tempData.room||{}).id,
                tid = (this.tempData.terminal||{}).id,
                roomWorkerList = [];
            if(rid){
                roomWorkerList = getListByID(rid,'rid',this.game.workerList);
            }
            switch(mode){
                case 1: // 形象总代言
                    releaseAllByJob(11,getListByID(this.game.factoryList[0].id,'fid',this.game.workerList));
                break;
                case 2: // 房间-管理员
                    releaseAllByJob(7,roomWorkerList);
                break;
                case 3: // 房间-维护工人
                    releaseAllByJob(6,roomWorkerList);
                break;
                case 4: // 房间-公关
                    releaseAllByJob(8,roomWorkerList);
                break;
                case 5: // 房间-工程师
                    releaseAllByJob(5,roomWorkerList);
                break;
                case 6: // 终端-操作员
                    if(tid){
                        let worker = getListByID(tid,'tid',this.game.workerList)[0];
                        if(worker){
                            worker.job = 0;
                            worker.tid = 0;
                        }
                    }
                break;
                case 9: // 工厂-对接员
                    if(this.tempData.factory){
                        let oworker = getMatchList(this.game.workerList,[['tfid',this.tempData.factory.id],['job',12],['fid',this.game.factoryList[0].id]])[0];
                        if(oworker){
                            oworker.job = 0;
                            oworker.tfid = 0;
                            oworker.tfname = '';
                        }
                    }
                break;
                case 10: // 工厂-间谍
                    if(this.tempData.factory){
                        let oworker = getMatchList(this.game.workerList,[['tfid',this.tempData.factory.id],['job',13],['fid',this.game.factoryList[0].id]])[0];
                        if(oworker){
                            oworker.job = 0;
                            oworker.tfid = 0;
                            oworker.tfname = '';
                        }
                    }
                break;
                case 11: // 资源管理员
                    releaseAllByJob(14,getListByID(this.game.factoryList[0].id,'fid',this.game.workerList));
                break;
            }
            this.asynAllPages();
        },
        onTapAddJob(){ // 点击【职能+】按钮
            this.showJobPop = true;
        },
        onTapSellRoom(){ // 点击【出售房间】按钮
            this.tempData.room.sell = Math.round(this.calcRoomValue(this.tempData.room)*CONFIG.sell_factor);
            this.showConfirmSellRoom = true;
        },
        onTapBackup(){ // 点击【加入备用】按钮
            let room = getListByID(this.tempData.room.id,'id',this.game.roomList)[0];
            room.group = 1;
            room.risk = 1;
            room.avgPower = 0;
            this.asynAllPages();
            this.$toast.text('该房间已禁用');
        },
        onTapAutoService(){ // 点击【加入自营】按钮
            let room = getListByID(this.tempData.room.id,'id',this.game.roomList)[0];
            room.group = 2;
            room.avgPower = 0;
            this.asynAllPages();
            this.$toast.text('该房间已托管');
        },
        onTapReuse(){ // 点击【回归管理】按钮
            let room = getListByID(this.tempData.room.id,'id',this.game.roomList)[0];
            room.group = 0;
            this.asynAllPages();
        },
        onTapSellWorker(){ // 点击【出售人员】按钮
            this.tempData.myWorker.sell = Math.round(this.calcWorkerValue(this.tempData.myWorker)*CONFIG.sell_factor);
            this.showConfirmSellWorker = true;
        },
        onTapConfirmSellRoom(){ // 点击【确认出售房间】按钮
            let room = getListByID(this.tempData.room.id,'id',this.game.roomList)[0],
                terminalList = getListByID(room.id,'rid',this.game.terminalList),
                workerList = getListByID(room.id,'rid',this.game.workerList);
            room.fid = 0;
            room.fname = '';
            for(let i=0;i<terminalList.length;i++){ // 解除该房间内所有终端
                let terminal = terminalList[i];
                terminal.fid = 0;
            }
            for(let i=0;i<workerList.length;i++){ // 解除该房间内所有员工的职务
                let worker = workerList[i];
                this.releaseWorker(worker);
            }
            this.game.factoryList[0].money += this.tempData.room.sell;
            this.showEditRoom = false;
            this.showConfirmSellRoom = false;
            if(this.searchingRoomID==room.id){
                this.searchingRoomID = 0;
            }
            this.searchingTerminalID = 0;
            this.asynAllPages();
            this.jump(1);
        },
        onTapConfirmSellWorker(){ // 点击【确认出售人员】按钮
            let worker = getListByID(this.tempData.myWorker.id,'id',this.game.workerList)[0];
            worker.fid = 0;
            worker.fname = '';
            this.releaseWorker(worker);
            this.game.factoryList[0].money += this.tempData.myWorker.sell;
            this.filter = 1;
            this.asynAllPages();
            this.showWorkerPop = false;
            this.showConfirmSellWorker = false;
        },
        onTapJob(index){ // 点击【职能】按钮
            let tid = (this.tempData.terminal||{}).id,
                worker = getListByID(tid,'tid',this.game.workerList)[0];
            if(worker){
                let myFactory = this.game.factoryList[0];
                worker.job = index;
                if(this.tempData.room&&this.tempData.room.power<=0){
                    if(worker.job==2||worker.job==3){
                        this.$toast.text('房间电力不足，职能将无法产生收益',{duration:3000});
                    }
                }
                if(myFactory.money<=0&&worker.job==4){
                    this.$toast.text('资金不足，职能将无法产生收益',{duration:3000});
                }
            }
            this.asynAllPages();
            this.showJobPop = false;
        },
        onTapEntireOrder(index){ // 点击【房间全体命令】按钮
            let target = [0,1,2,3,4,5,6][index]||0,
                rid = (this.tempData.room||{}).id,
                tid = (this.tempData.terminal||{}).id,
                roomWorkerList = getListByID(rid,'rid',this.game.workerList),
                myRoomWorkerList = [...roomWorkerList];
            if(target<=4){
                for(let worker of myRoomWorkerList){
                    if(worker.tid!=0)
                        worker.job = target;
                }
            }
            else if(target==5){ // 离开终端
                for(let worker of myRoomWorkerList){
                    if(worker.job<5){
                        worker.tid = 0;
                        worker.job = 0;
                    }
                }
            }
            else if(target==6){ // 离开房间
                for(let worker of myRoomWorkerList){
                    if(worker.job<5){
                        worker.rid = 0;
                        worker.rname = '';
                        worker.tid = 0;
                        worker.job = 0;
                    }
                }
            }
            this.showEditRoom = false;
            this.asynAllPages();
        },
        onTapRelease(){ // 点击【解除职务】按钮
            let worker = getListByID(this.tempData.myWorker.id,'id',this.game.workerList)[0];
            this.releaseWorker(worker,1);
            this.filter = 1;
            this.asynAllPages();
            this.showWorkerPop = false;
        },
        onTapWorkerListFilter(mode){ // 点击【人员列表过滤】按钮
            let workerList = getListByID(this.game.factoryList[0].id,'fid',this.game.workerList),
                tempWorkerList = [...workerList],
                myWorkerList;
            this.filter = mode;
            this.searchingWorkerID = 0;
            if(mode!=1){
                myWorkerList = getListByID([1,2,3,4,10,9,0,12,13,7,6,8,5][mode-2],'job',tempWorkerList);
                this.tempData.myWorkerList = myWorkerList;
                setTimeout(e=>{
                    this.$refs.workerList&&this.$refs.workerList.asyn();
                },1000*.1);
            }
            else{
                this.asynAllPages();
            }
        },
        onTapMarketType(type){ // 点击【市场类型】按钮
            this.marketType = type;
            this.asynAllPages();
        },
        onTapSearch(type,precount){ // 点击【搜索】按钮
            let factory = this.game.factoryList[0];
            if(type==1){ // 搜索房间
                let point = factory.rrp;
                if(point<CONFIG.searchRoomPointCost){
                    this.$toast.text(`搜索点数不够`);
                }
                else{ // 生成新房间
                    let count = precount||Math.floor(point/CONFIG.searchRoomPointCost);
                    for(let i=0;i<count;i++){
                        let typeList = [0,1,2,3,];
                        let newRoom = genRandomRoom(window.GLOBAL.accRoomID++,{fid:0,type:typeList[r(0,typeList.length-1)],risk:2,power:0,level:1,auto:r(CONFIG.randmNewRoomAutoRange[0],CONFIG.randmNewRoomAutoRange[1]),durab:r(CONFIG.randmNewRoomDurabRange[0],CONFIG.randmNewRoomDurabRange[1])});
                        this.game.roomList.push(newRoom);
                        for(let t=0;t<CONFIG.terminal_count_distribution[newRoom.level-1];t++){ // 生成新终端
                            this.game.terminalList.push({
                                id: window.GLOBAL.accTerminalID++,
                                fid: newRoom.fid,
                                rid: newRoom.id,
                            	durab: CONFIG.init.terminalDurab,
                            	powerLevel: CONFIG.init.terminalPowerLevel,
                            	digLevel: CONFIG.init.terminalDigLevel,
                            	tradeLevel: CONFIG.init.terminalTradeLevel,
                            });
                        }
                        factory.rrp -= CONFIG.searchRoomPointCost;
                    }
                }
            }
            else if(type==2){ // 搜索人员
               let point = factory.hrp;
               if(point<CONFIG.searchWorkerPointCost){
                   this.$toast.text(`搜索点数不够`);
               }
               else{ // 生成新人员
                   let count = precount||Math.floor(point/CONFIG.searchWorkerPointCost);
                   for(let i=0;i<count;i++){
                       this.game.workerList.push(genRandomWorker(window.GLOBAL.accWorkerID++,{fid:0,trend:this.tempData.resourceManager,}));
                       factory.hrp -= CONFIG.searchWorkerPointCost;
                   }
               }
            }
            this.marketType = type;
            this.asynAllPages();
        },
        onTapBuyRoom(){ // 点击【购买房间】按钮
            let factory = this.game.factoryList[0],
                buyRoom = getListByID(this.tempData.buyRoom.id,'id',this.game.roomList)[0];
            if(factory.money>=this.tempData.buyRoom.price){
                buyRoom.fid = factory.id;
                buyRoom.fname = factory.name;
                this.game.factoryList[0].money -= this.tempData.buyRoom.price;
                this.showConfirmBuyRoom = false;
                this.asynAllPages();
            }
            else{
                this.$toast.text('资金不足');
            }
        },
        onTapBuyWorker(){ // 点击【购买人员】按钮
            let factory = this.game.factoryList[0],
                buyWorker = getListByID(this.tempData.buyWorker.id,'id',this.game.workerList)[0];
            if(factory.money>=this.tempData.buyWorker.price){
                buyWorker.fid = factory.id;
                buyWorker.fname = factory.name;
                this.game.factoryList[0].money -= this.tempData.buyWorker.price;
                this.showConfirmBuyWorker = false;
                this.asynAllPages();
            }
            else{
                this.$toast.text('资金不足');
            }
        },
        onTapBuyAllWorkers(){ // 点击【购买全部人员】按钮
            let factory = this.game.factoryList[0];
            let totalCost = 0;
            for(let worker of this.tempData.marketWorkerList){
                totalCost += worker.price;
            }
            this.tempData.totalCost = totalCost;
            this.showConfirmBuyAllWorker = true;
        },
        onTapConfirmBuyAllWorkers(){ // 点击【确认购买全部人员】按钮
            let factory = this.game.factoryList[0];
            if(factory.money>=this.tempData.totalCost){
                for(let worker of this.tempData.marketWorkerList){
                    let buyWorker = getListByID(worker.id,'id',this.game.workerList)[0];
                    buyWorker.fid = factory.id;
                    buyWorker.fname = factory.name;
                }
                this.game.factoryList[0].money -= this.tempData.totalCost;
                this.showConfirmBuyAllWorker = false;
                this.asynAllPages();
            }
            else{
                this.$toast.text('资金不足');
            }
        },
        onTapLog(id){ // 点击【报表】按钮
            this.tempData.log = getListByID(id,'id',this.game.logList)[0];
            this.showLog = true;
        },
        onTapAvgAssign(){ // 点击【均匀分配电力】按钮
            let myRoomList = getListByID(this.game.factoryList[0].id,'fid',this.game.roomList);
            let fromRoom = getListByID(this.tempData.room.id,'id',myRoomList)[0];
            let toRoomList = [];
            let myMainRoomList = getMatchList(myRoomList,[['group',0]]);
            for(let room of myMainRoomList){
                if(room.avgPower){
                    toRoomList.push(room);
                }
            }
            let ind = 0;
            let assignPowerPct = this.tempData.assignPowerPct;
            let assignPower = Math.floor(fromRoom.power*assignPowerPct/100);
            let avgPower = Math.round(assignPower/toRoomList.length);
            if(toRoomList.length>0){
                fromRoom.power -= assignPower;
                for(;ind<toRoomList.length-1;ind++){
                    toRoomList[ind].power += avgPower;
                    assignPower -= avgPower;
                }
                toRoomList[ind].power += assignPower;
            }
            this.asynAllPages();
        },
        onTapEditFactory(){ // 点击【操作】按钮
            this.tempData.factory.sell = Math.round(this.calcFactoryValue(this.tempData.factory)*CONFIG.sell_factor);
            this.showEditFactory = true;
        },
        onTapStealRoom(){ // 点击【偷取房间】按钮
            if(this.tempData.relation.support<CONFIG.steal_room_support_threshold){
                this.$toast.text(`偷取房间需要 ${Math.floor(CONFIG.steal_room_support_threshold*100/CONFIG.max_support)}% 的支持率`);
                return ;
            }
            let value = this.calcRoomValue(this.tempData.stealRoom),
                myFactory = this.game.factoryList[0],
                youFactory = this.tempData.factory,
                imageCost = 0,
                supportCost = CONFIG.steal_room_support_cost,
                relation = this.tempData.relation;
            if(myFactory.image<=0){
                this.$toast.text(`我厂形象必须为正`);
                return ;
            }
            imageCost = Math.round(value*.05)+1000;
            myFactory.image -= imageCost;
            relation.support -= supportCost;
            // 变更房间数据
            this.acquireRoom(this.tempData.stealRoom);
            this.asynAllPages();
            this.showStealRoom = false;
            this.$dialog({
                title: '结果报告',
                textAlign: 'left',
                content: `偷取到了 <b>${this.tempData.stealRoom.name}</b><br/>损失了 <b>${Math.round(supportCost*100/CONFIG.max_support)}%</b> 的支持率<br/>${imageCost>=0?'损失':'提升'}了 <b>${Math.abs(imageCost)}</b> 的形象`,
                noCancelBtn: true,
                noOkBtn: true,
            });
        },
        onTapStealWorker(){ // 点击【偷取人员】按钮
            if(this.tempData.relation.support<CONFIG.steal_worker_support_threshold){
                this.$toast.text(`偷取人员需要至少 ${Math.floor(CONFIG.steal_worker_support_threshold*100/CONFIG.max_support)}% 的支持率`);
                return ;
            }
            let value = this.calcWorkerValue(this.tempData.stealWorker),
                myFactory = this.game.factoryList[0],
                youFactory = this.tempData.factory,
                imageCost = 0,
                supportCost = CONFIG.steal_worker_support_cost,
                relation = this.tempData.relation;
            if(myFactory.image<=0){
                this.$toast.text(`我厂形象必须为正`);
                return ;
            }
            imageCost = Math.round(value*.5)+1000;
            if(imageCost>10000)
                imageCost = 10000;
            myFactory.image -= imageCost;
            relation.support -= supportCost;
            // 变更人员数据
            this.acquireWorker(this.tempData.stealWorker);
            this.asynAllPages();
            this.showStealWorker = false;
            this.$dialog({
                title: '结果报告',
                textAlign: 'left',
                content: `偷取到了 <b>${this.tempData.stealWorker.name}</b><br/>损失了 <b>${Math.round(supportCost*100/CONFIG.max_support)}%</b> 的支持率<br/>${imageCost>=0?'损失':'提升'}了 <b>${Math.abs(imageCost)}</b> 的形象`,
                noCancelBtn: true,
                noOkBtn: true,
            });
        },
        onTapInvest(){ // 点击【投资】按钮
            if(this.tempData.relation.support<CONFIG.invest_support_threshold){
                this.$toast.text(`投资需要至少 ${Math.floor(CONFIG.invest_support_threshold*100/CONFIG.max_support)}% 的支持率`);
                return ;
            }
            this.showEditFactory = false;
            this.showInvest = true;
        },
        onTapStudy(){ // 点击【深造派遣】按钮
            this.showEditFactory = false;
            this.jump(8);
        },
        onTapSanction(){ // 点击【经济制裁】按钮
            this.showEditFactory = false;
            this.showSanction = true;
        },
        onTapConfirmDamage(){ // 点击【确认形象破坏】按钮
            let factory = getListByID(this.tempData.factory.id,'id',this.game.factoryList)[0],
                myFactory = this.game.factoryList[0];
            if(myFactory.image<=0){
                this.$toast.text(`我厂形象必须为正`);
                return ;
            }
            if(factory.image<=0){
                this.$toast.text(`对方工厂形象必须为正`);
                return ;
            }
            if(factory.damaged){
                this.$toast.text(`已经破坏过了`);
                return ;
            }
            if(myFactory.money<CONFIG.damage_money_cost){
                this.$toast.text(`资金不足`);
                return ;
            }
            let damage = Math.round(factory.image/2);
            myFactory.money -= CONFIG.damage_money_cost;
            factory.image -= damage;
            factory.damaged = true;
            this.showConfirmDamage = false;
            this.asynAllPages();
            this.tempData.factory.sell = Math.round(this.calcFactoryValue(this.tempData.factory)*CONFIG.sell_factor);
            this.$dialog({
                title: '形象破坏结果报告',
                textAlign: 'left',
                content: `${factory.name}的形象减少了<b>${damage} $</b><br/>我厂共花费 <b>100 万 $</b>`,
                noCancelBtn: true,
                noOkBtn: true,
            });
        },
        onTapConfirmSanction(){ // 点击【确认经济制裁】按钮
            let factory = getListByID(this.tempData.factory.id,'id',this.game.factoryList)[0],
                myFactory = this.game.factoryList[0];
            if(myFactory.image<=0){
                this.$toast.text(`我厂形象必须为正`);
                return ;
            }
            if(factory.sanctioned){
                this.$toast.text(`10 日内不能重复制裁`);
                return ;
            }
            if(myFactory.money<CONFIG.saction_money_cost){
                this.$toast.text(`资金不足`);
                return ;
            }
            let damage = Math.floor(CONFIG.saction_money_cost/2);
            let imageCost = factory.image;
            let imageDiff = Math.abs(myFactory.image-factory.image); // 两工厂形象差值
            damage = Math.round(damage*(imageDiff/100000));
            myFactory.money -= CONFIG.saction_money_cost;
            myFactory.image -= imageCost;
            factory.money -= damage;
            factory.sanctioned = true;
            this.showSanction = false;
            this.asynAllPages();
            this.tempData.factory.sell = Math.round(this.calcFactoryValue(this.tempData.factory)*CONFIG.sell_factor);
            this.$dialog({
                title: '经济制裁结果报告',
                textAlign: 'left',
                content: `${factory.name}的总资金减少了 <b>${numFormat(damage)} $</b><br/>我厂共花费 <b>100 万 $</b><br/>我厂形象${imageCost>=0?'下降':'提升'}了 <b>${Math.abs(imageCost)}</b>`,
                noCancelBtn: true,
                noOkBtn: true,
            });
        },
        onTapConfirmBuyFactory(){ // 点击【确认收购工厂】按钮
            if(this.tempData.relation.support<CONFIG.buy_factory_support_threshold){
                this.$toast.text(`收购工厂需要 ${Math.floor(CONFIG.buy_factory_support_threshold*100/CONFIG.max_support)}% 的支持率`);
                return ;
            }
            if(this.tempData.factory.money>=0){
                this.$toast.text(`收购工厂需要对方工厂资金低于 0`);
                return ;
            }
            let myFactory = this.game.factoryList[0];
            if(myFactory.money<this.tempData.factory.sell){
                this.$toast.text(`资金不足`);
                return ;
            }
            // 变更工厂数据
            let roomList = getListByID(this.tempData.factory.id,'fid',this.game.roomList),
                workerList = getListByID(this.tempData.factory.id,'fid',this.game.workerList),
                myWorkerList = getListByID(this.game.factoryList[0].id,'fid',this.game.workerList),
                myJoint = getMatchList(myWorkerList,[['job',12],['tfid',this.tempData.factory.id]])[0],
                mySpyList = getMatchList(myWorkerList,[['job',13],['tfid',this.tempData.factory.id]]),
                imageIncrease = Math.round(this.tempData.factory.sell*.085);
            for(let room of roomList){
                this.acquireRoom(room);
            }
            for(let worker of workerList){
                this.acquireWorker(worker);
            }
            if(myJoint){
                this.releaseWorker(myJoint);
            }
            for(let mySpy of mySpyList){
                this.releaseWorker(mySpy);
            }
            this.game.relationList = removeFromList(this.tempData.factory.id,'to',this.game.relationList);
            this.game.factoryList = removeFromList(this.tempData.factory.id,'id',this.game.factoryList);
            this.showEditFactory = false;
            this.showConfirmBuyFactory = false;
            this.searchingFactoryID = 0;
            myFactory.money -= this.tempData.factory.sell;
            myFactory.image += imageIncrease;
            this.$dialog({
                title: '结果报告',
                textAlign: 'left',
                content: `我厂共花费 <b>${this.tempData.factory.sell} $</b> 收购了 <b>${this.tempData.factory.name}</b><br/>共 <b>${roomList.length}</b> 个房间， <b>${workerList.length}</b> 个人员<br/>并获得了 <b>${imageIncrease}</b> 的工厂形象`,
                noCancelBtn: true,
                noOkBtn: true,
                closeCallback: e=>{
                    if(this.game.factoryList.length==1){ // 获胜
                        this.$dialog({
                            title: '游戏获胜',
                            content: `恭喜 <h3>${this.game.workerList[0].name}</h3> 带领 <h3>${this.game.factoryList[0].name}</h3> 在 ${this.day} 天内垄断了整个挖矿行业`,
                            noCancelBtn: true,
                            noOkBtn: true,
                        });
                    }
                }
            });
            this.jump(1);
        },
        onTapConfirmInvest(){ // 点击【确认投资】按钮
            let investMoney = parseInt(this.tempData.investMoney)||0,
                myFactory = this.game.factoryList[0];
            if(investMoney<=0){
                return ;
            }
            if(investMoney>CONFIG.max_investment-this.game.investedMoney){
                this.$toast.text(`投资不能超过最大额度（${CONFIG.max_investment-this.game.investedMoney}）`);
                return ;
            }
            if(myFactory.image<=0){
                this.$toast.text(`我厂形象必须为正`);
                return ;
            }
            if(investMoney<=myFactory.money){
                let relation = getListByID(this.tempData.relation.id,'id',this.game.relationList)[0];
                relation.invest += investMoney;
                myFactory.money -= investMoney;
                this.game.investedMoney += investMoney;
                this.asynAllPages();
                this.investMoney = '';
                this.showInvest = false;
            }
            else{
                this.$toast.text(`资金不足`);
            }
        },
        onTapReleaseAll(){ // 点击【全体待命】按钮
            let myFactory = this.game.factoryList[0],
                myWorkerList = getListByID(myFactory.id,'fid',this.game.workerList);
            for(let worker of myWorkerList){
                this.releaseWorker(worker);
            }
            this.asynAllPages();
            this.showEditWorkerPage = false;
        },
        /*onTapAutoAssignTask(){ // 点击【自动安排空闲人员】按钮
            let myFactory = this.game.factoryList[0],
                myRoomList = getListByID(myFactory.id,'fid',this.game.roomList);
            this.randomAssignToRoom();
            for(let room of myRoomList){
                this.arrangeRoom(room);
            }
            this.asynAllPages();
            this.showEditWorkerPage = false;
        },*/
        /*onTapRandomAssignToRoom(){ // 点击【随机派发空闲人员至各房间】按钮
            this.randomAssignToRoom();
            this.asynAllPages();
            this.showEditWorkerPage = false;
        },*/
        onTapAutoAssignTaskInRoom(){ // 点击【房间的自动安排空闲人员】按钮
            let room = getListByID(this.tempData.room.id,'id',this.game.roomList)[0],
                roomWorkerList = getListByID(room.id,'rid',this.game.workerList);
            // 让所有无职能员工离开终端
            for(let worker of roomWorkerList){
                if(worker.job==0){
                    worker.tid = 0;
                }
            }
            // 重新安排房间工位配置
            this.arrangeRoom(this.tempData.room);
            this.asynAllPages();
            this.showEditRoom = false;
        },
        onTapAssembleFreeWorker(){ // 点击【所有空闲人员调至此房间】按钮
            let myFactory = this.game.factoryList[0],
                room = getListByID(this.tempData.room.id,'id',this.game.roomList)[0],
                myWorkerList = getListByID(myFactory.id,'fid',this.game.workerList),
                myFreeWorkerList = getMatchList(myWorkerList,[['job',0]]);
            for(let worker of myFreeWorkerList){
                worker.rid = room.id;
                worker.rname = room.name;
            }
            this.asynAllPages();
            if(myFreeWorkerList.length>0){
                this.$toast.text(`已调配 ${myFreeWorkerList.length} 个人员至本房间`);
            }
            else{
                this.$toast.text(`无空闲人员`);
            }
        },
        onTapProp(){ // 点击【形象宣传】按钮
            this.showProp = true;
        },
        onTapConfirmProp(){ // 点击【确认形象宣传】按钮
            let myFactory = this.game.factoryList[0],
                workerList = getListByID(myFactory.id,'fid',this.game.workerList),
                imageAgent = getListByID(11,'job',workerList)[0],
                propMoney = Math.floor(CONFIG.max_image_prop_money*this.tempData.propMoneyPct/100);
            if(myFactory.money<propMoney){ // 资金不足
                this.$toast.text(`资金不足`);
            }
            else if(!imageAgent){ // 缺少形象宣传代言人
                this.$toast.text(`缺少形象代言人`);
            }
            else if(myFactory.imageProped){ // 每旬只能进行一次形象宣传
                this.$toast.text(`每旬只能进行一次形象宣传`);
            }
            else if(propMoney>0){
                let imageInc = Math.round(propMoney*imageAgent.img*CONFIG.image_prop_factor);
                myFactory.image += imageInc;
                myFactory.money -= propMoney;
                myFactory.imageProped = true;
                this.asynAllPages();
                this.$toast.text(`工厂形象提升了 ${imageInc}`);
                this.showProp = false;
            }
        },
        onTapAllTerminalLevelUp(type){ // 点击【所有终端全部升级】按钮
            let myFactory = this.game.factoryList[0],
                room = getListByID(this.tempData.room.id,'id',this.game.roomList)[0],
                terminalList = getListByID(room.id,'rid',this.game.terminalList),
                targetValueName = ['power','dig','trade'][type-1];
            let effectCount = 0;
            if(room&&targetValueName){
                for(let terminal of terminalList){
                    let level = terminal[`${targetValueName}Level`];
                    if(level<3){
                        let cost = CONFIG[`${targetValueName}_levelup_cost`][level-1];
                        if(myFactory.money>=cost){
                            myFactory.money -= cost;
                            terminal[`${targetValueName}Level`] += 1;
                            effectCount += 1;
                        }
                    }
                }
            }
            if(effectCount==0){
                this.$toast.text(`资金不足`);
            }
            this.asynAllPages();
        },
        onTapLeaveRoom(){ // 点击【撤出房间】按钮
            let worker = getListByID(this.tempData.myWorker.id,'id',this.game.workerList)[0];
            this.releaseWorker(worker);
            this.asynAllPages();
            this.showWorkerPop = false;
        },
        onTapChangeSpies(){ // 点击间谍【全体转移】按钮
            this.showSpyTargets = true;
        },
        onTapRemoveSpies(){ // 点击间谍【全体撤职】按钮
            let mySpyList = this.tempData.mySpyList;
            for(let spy of mySpyList){
                let ospy = getMatchList(this.game.workerList,[['id',spy.id]])[0];
                if(ospy){
                    this.releaseWorker(ospy);
                }
            }
            this.showSpyTargets = false;
            this.asynAllPages();
        },
        onTapOrder(val){ // 点击【房间排序】按钮
            let room = getListByID(this.tempData.room.id,'id',this.game.roomList)[0];
            let nextVal = room.order+val;
            if(nextVal<10&&nextVal>0){
                room.order = nextVal;
                this.asynAllPages();
            }
        },
        onDoubleTapRoom(id){ // 双击【房间】按钮
            localStorage.setItem(CACHE.tip1,1);
            this.tip1 = false;
            this.jump(2,id);
        },
        onDoubleTapRoomWorker(id){ // 双击【房间员工】按钮
            let worker = getListByID(id,'id',this.game.workerList)[0];
            if(worker)
                this.tempData.myWorker = {...worker};
            this.showWorkerPop = true;
        },
        onDoubleTapPopRoom(id){ // 双击【弹窗房间】按钮
            let assignPowerPct = this.tempData.assignPowerPct,
                fromRoom = getListByID(this.tempData.room.id,'id',this.game.roomList)[0],
                toRoom = getListByID(id,'id',this.game.roomList)[0],
                assignPower = Math.floor(fromRoom.power*assignPowerPct/100);
            fromRoom.power -= assignPower;
            toRoom.power += assignPower;
            this.tempData.assignPowerPct = 0;
            this.asynAllPages();
        },
        onDoubleTapTerminal(id){ // 双击【终端】按钮
            localStorage.setItem(CACHE.tip2,1);
            this.tip2 = false;
            this.jump(3,id);
        },
        onDoubleTapPopWorker(id){ // 双击【弹窗工人】按钮
            // console.log('任职',id);
            let worker = getListByID(id,'id',this.game.workerList)[0],
                rid = (this.tempData.room||{}).id,
                tid = (this.tempData.terminal||{}).id,
                myFactory = this.game.factoryList[0],
                roomWorkerList = [];
            if(rid){
                roomWorkerList = getListByID(rid,'rid',this.game.workerList);
            }
            // 解除该员工原有的职务
            this.releaseWorker(worker);
            switch(this.tempData.workListPopMode){
                case 1: // 形象总代言
                    releaseAllByJob(11,getListByID(myFactory.id,'fid',this.game.workerList));
                    worker.job = 11;
                break;
                case 2: // 房间-管理员
                    releaseAllByJob(7,roomWorkerList);
                    worker.job = 7;
                    worker.rid = rid||0;
                    worker.rname = this.tempData.room.name||'';
                break;
                case 3: // 房间-维护工人
                    releaseAllByJob(6,roomWorkerList);
                    worker.job = 6;
                    worker.rid = rid||0;
                    worker.rname = this.tempData.room.name||'';
                    if(myFactory.money<=0){
                        this.$toast.text(`资金不足，职能将无法产生收益`);
                    }
                break;
                case 4: // 房间-公关
                    releaseAllByJob(8,roomWorkerList);
                    worker.job = 8;
                    worker.rid = rid||0;
                    worker.rname = this.tempData.room.name||'';
                break;
                case 5: // 房间-工程师
                    releaseAllByJob(5,roomWorkerList);
                    worker.job = 5;
                    worker.rid = rid||0;
                    worker.rname = this.tempData.room.name||'';
                    if(myFactory.money<=0){
                        this.$toast.text(`资金不足，职能将无法产生收益`);
                    }
                    else if(this.tempData.room.power<=0){
                        this.$toast.text(`房间电力不足，职能将无法产生收益`);
                    }
                break;
                case 6: // 终端-操作员
                    let oworker = getListByID(tid,'tid',this.game.workerList)[0]; // 该终端原来的操作员
                    if(oworker){
                        oworker.job = 0;
                        oworker.tid = 0;
                    }
                    worker.job = 0;
                    worker.tid = tid||0;
                    worker.rid = this.tempData.terminal.room.id;
                    worker.rname = this.tempData.terminal.room.name;
                    this.showJobPop = true;
                break;
                case 7: // 首页-房间资源搜索
                    worker.job = 10;
                break;
                case 8: // 首页-人力资源搜索
                    worker.job = 9;
                    if(myFactory.image<=0){
                        this.$toast.text(`工厂形象不足，职能将无法产生收益`);
                    }
                break;
                case 9: // 工厂页-外交
                    if(this.tempData.factory){
                        let oworker = getMatchList(this.game.workerList,[['tfid',this.tempData.factory.id],['job',12],['fid',myFactory.id]])[0];
                        if(oworker){
                            oworker.job = 0;
                            oworker.tfid = 0;
                            oworker.tfname = '';
                        }
                        worker.job = 12;
                        worker.tfid = this.tempData.factory.id;
                        worker.tfname = this.tempData.factory.name;
                        if(myFactory.image<CONFIG.relation.joint_image_threshold){
                            this.$toast.text(`工厂形象不足，职能将无法产生收益（需${CONFIG.relation.joint_image_threshold}）`,{duration:3000});
                        }
                    }
                break;
                case 10: // 工厂页-间谍
                    if(this.tempData.factory){
                        worker.job = 13;
                        worker.tfid = this.tempData.factory.id;
                        worker.tfname = this.tempData.factory.name;
                        if(myFactory.money<=0){
                            this.$toast.text(`资金不足，职能将无法产生收益`);
                        }
                    }
                break;
                case 11: // 资源管理员
                    releaseAllByJob(14,getListByID(myFactory.id,'fid',this.game.workerList));
                    worker.job = 14;
                break;
            }
            this.asynAllPages();
            this.showWorkerList = false;
        },
        onDoubleTapWorker(id){ // 双击【人员】按钮
            let worker = getListByID(id,'id',this.game.workerList)[0];
            if(worker)
                this.tempData.myWorker = {...worker};
            this.showWorkerPop = true;
        },
        onDoubleTapMarketRoom(id){ // 双击【市场房间】按钮
            let room = getListByID(id,'id',this.game.roomList)[0];
            if(room)
                this.tempData.buyRoom = {...room,price:this.calcRoomValue(room)};
            this.showConfirmBuyRoom = true;
        },
        onDoubleTapMarketWorker(id){ // 双击【市场人员】按钮
            let worker = getListByID(id,'id',this.game.workerList)[0];
            if(worker)
                this.tempData.buyWorker = {...worker,price:this.calcWorkerValue(worker)};
            this.showConfirmBuyWorker = true;
        },
        onDoubleTapRelation(id){ // 双击【外交关系】按钮
            if(!this.game.factoryList[0].canViewRelation){
                this.$toast.text(`工厂形象达到 ${CONFIG.relation.joint_image_threshold} 才能访问其他工厂`);
                return ;
            }
            let relation = getListByID(id,'id',this.game.relationList)[0];
            this.tempData.relation = relation;
            localStorage.setItem(CACHE.tip3,1);
            this.tip3 = false;
            this.jump(7,relation.to);
        },
        onDoubleTapFactoryRoom(id){ // 双击【其他工厂房间】按钮
            let room = getListByID(id,'id',this.game.roomList)[0];
            if(room)
                this.tempData.stealRoom = {...room};
            this.showStealRoom = true;
        },
        onDoubleTapFactoryWorker(id){ // 双击【其他工厂房间人员】按钮
            let worker = getListByID(id,'id',this.game.workerList)[0];
            if(worker)
                this.tempData.stealWorker = {...worker};
            this.showStealWorker = true;
        },
        onDoubleTapRelationOnPop(id){ // 双击间谍【全体转移】目标按钮
            let relation = getListByID(id,'id',this.game.relationList)[0];
            let factoryID = relation.to;
            let factory = getListByID(factoryID,'id',this.game.factoryList)[0];
            let mySpyList = this.tempData.mySpyList;
            for(let spy of mySpyList){
                let ospy = getMatchList(this.game.workerList,[['id',spy.id]])[0];
                if(ospy){
                    ospy.job = 13;
                    ospy.tfid = factoryID;
                    ospy.tfname = factory.name;
                }
            }
            this.showSpyTargets = false;
            this.asynAllPages();
        },

        jump(state,id=0){ // 点击【跳转】按钮
            // console.log(`跳转至${['首页','房间','终端','人员','市场','外交','工厂','报表'][state-1]} ID=${id}`);
            let canJump = true;
            switch(state){
                case 1: // 首页
                break;
                case 2: // 房间
                    this.searchingRoomID = id||0;
                break;
                case 3: // 终端
                    this.searchingTerminalID = id||0;
                break;
                case 4: // 人员
                    this.searchingWorkerID = id||0;
                break;
                case 6: // 外交
                    // if(!this.game.factoryList[0].canViewRelation){
                    //     this.$toast.text(`工厂形象达到 ${CONFIG.relation.joint_image_threshold} 解锁外交系统`);
                    //     canJump = false;
                    // }
                    if(!this.calcRelationLockStat()){
                        this.$toast.text(`外交功能将在 ${11-this.day} 天后解锁`);
                        canJump = false;
                    }
                break;
                case 7: // 工厂
                    this.searchingFactoryID = id||0;
                break;
            }
            if(canJump){
                this.asynAllPages();
                this.filter = 1;
                this.state = state;
            }
        },

        asynAllPages(){ // 刷新所有页面temp数据
            this.asynHomePage();
            this.asynRoomPage();
            this.asynTerminalPage();
            this.asynWorkerPage();
            this.asynMarketPage();
            this.asynRelationPage();
            this.asynFactoryPage();
            setTimeout(e=>{
                this.$refs.roomList&&this.$refs.roomList.asyn();
                this.$refs.roomList2&&this.$refs.roomList2.asyn();
                this.$refs.roomList3&&this.$refs.roomList3.asyn();
                this.$refs.roomList4&&this.$refs.roomList4.asyn();
                this.$refs.terminalList&&this.$refs.terminalList.asyn();
                this.$refs.workerListPop&&this.$refs.workerListPop.asyn();
                this.$refs.roomListPop&&this.$refs.roomListPop.asyn();
                this.$refs.workerList&&this.$refs.workerList.asyn();
                this.$refs.roomWorkerList&&this.$refs.roomWorkerList.asyn();
                this.$refs.rrList&&this.$refs.rrList.asyn();
                this.$refs.hrList&&this.$refs.hrList.asyn();
                this.$refs.marketRoomList&&this.$refs.marketRoomList.asyn();
                this.$refs.marketWorkerList&&this.$refs.marketWorkerList.asyn();
                this.$refs.relationList&&this.$refs.relationList.asyn();
                this.$refs.relationList2&&this.$refs.relationList2.asyn();
                this.$refs.factoryRoomList&&this.$refs.factoryRoomList.asyn();
                this.$refs.factoryWorkerList&&this.$refs.factoryWorkerList.asyn();
                this.$refs.spyList&&this.$refs.spyList.asyn();
            },1000*.1);
            this.save();
        },
        asynHomePage(){ // 刷新首页temp数据
            let roomList = getListByID(this.game.factoryList[0].id,'fid',this.game.roomList),
                workerList = getListByID(this.game.factoryList[0].id,'fid',this.game.workerList),
                rrList = getListByID(10,'job',workerList),
                hrList = getListByID(9,'job',workerList),
                myRoomList =  [...roomList],
                myWorkerList =  [...workerList],
                myRRList =  [...rrList],
                myHRList =  [...hrList];
            let myMainRoomList = getMatchList(myRoomList,[['group',0]]);
            let myAgentRoomList = getMatchList(myRoomList,[['group',1]]);
            let myAutoServiceRoomList = getMatchList(myRoomList,[['group',2]]);
            this.tempData.myRoomList = bulbsort(myMainRoomList,'order',0);
            this.tempData.myAgentRoomList = myAgentRoomList;
            this.tempData.myAutoServiceRoomList = myAutoServiceRoomList;
            this.tempData.myPopWorkerList = myWorkerList;
            this.tempData.myWorkerList = myWorkerList;
            this.tempData.myRRList = myRRList;
            this.tempData.myHRList = myHRList;
            this.tempData.imageAgent = {};
            this.tempData.resourceManager = {};
            for(let worker of myWorkerList){
                if(worker.job==11){
                    this.tempData.imageAgent = worker;
                }
                if(worker.job==14){
                    this.tempData.resourceManager = worker;
                }
            }
            // 工位情况列表
            let myRoomList2 = bulbsort(myMainRoomList,'order',0);
            this.tempData.myRoomList2 = myRoomList2;
            for(let room of myRoomList2){
                let roomWorkerList = getListByID(room.id,'rid',this.game.workerList);
                let manager = getListByID(7,'job',roomWorkerList)[0];
                let imageAgent = getListByID(8,'job',roomWorkerList)[0];
                let maintainer = getListByID(6,'job',roomWorkerList)[0];
                let autoWorker = getListByID(5,'job',roomWorkerList)[0];
                // room.freeTerminalCount = this.calcFreeTerminalCount(room);
                room.freeWorkerCount = this.calcFreeWorkerCount(room);
                room.terminalOccupies = this.calcTerminalOccupies(room);
                room.workerCount = roomWorkerList.length;
                room.managerName = manager?manager.name:'-';
                room.imageAgentName = imageAgent?imageAgent.name:'-';
                room.maintainerName = maintainer?maintainer.name:'-';
                room.autoWorkerName = autoWorker?autoWorker.name:'-';
            }
            // 备用房间列表
            for(let room of myAgentRoomList){
                let roomWorkerList = getListByID(room.id,'rid',this.game.workerList);
                let imageAgent = getListByID(8,'job',roomWorkerList)[0];
                room.imageAgentName = imageAgent?imageAgent.name:'-';
            }
            // 自营房间列表
            for(let room of myAutoServiceRoomList){
                let roomWorkerList = getListByID(room.id,'rid',this.game.workerList);
                room.workerCount = roomWorkerList.length;
            }
        },
        asynRoomPage(){ // 刷新房间页temp数据
            let id = this.searchingRoomID;
            if(!id){
                this.tempData.room = null;
                return;
            }
            let room = getListByID(id,'id',this.game.roomList)[0],
                terminalList = getListByID(id,'rid',this.game.terminalList),
                roomList = getListByID(this.game.factoryList[0].id,'fid',this.game.roomList),
                roomWorkerList = getListByID(room.id,'rid',this.game.workerList),
                myRoom = {...room},
                myTerminalList = [...terminalList],
                myRoomList = [...roomList],
                myRoomWorkerList = [...roomWorkerList],
                getWorkerByJob = job=>{
                    for(let worker of myRoomWorkerList){
                        if(worker.job==job)
                            return worker;
                    }
                    return '';
                },
                manager = getWorkerByJob(7),
                maintainer = getWorkerByJob(6),
                imageAgent = getWorkerByJob(8),
                autoWorker = getWorkerByJob(5),
                powerLevelUpCost = 0,
                digLevelUpCost = 0,
                tradeLevelUpCost = 0;
            let myMainRoomList = getMatchList(myRoomList,[['group',0]]);
            for(let terminal of myTerminalList){
                let worker = getListByID(terminal.id,'tid',this.game.workerList)[0],
                    myWorker = {...worker};
                if(myWorker){
                    terminal.workerName = myWorker.name;
                    terminal.str = myWorker.str;
                    terminal.int = myWorker.int;
                    terminal.com = myWorker.com;
                    terminal.img = myWorker.img;
                    terminal.jobName = ['发电','挖矿','交易','维护'][myWorker.job-1]||'-';
                    terminal.job = myWorker.job;
                }
                if(terminal.powerLevel<=2){
                    powerLevelUpCost += CONFIG.power_levelup_cost[terminal.powerLevel-1];
                }
                if(terminal.digLevel<=2){
                    digLevelUpCost += CONFIG.dig_levelup_cost[terminal.digLevel-1];
                }
                if(terminal.tradeLevel<=2){
                    tradeLevelUpCost += CONFIG.trade_levelup_cost[terminal.tradeLevel-1];
                }
            }
            myRoom.balance = this.calcBalance(myRoom,myRoomWorkerList);
            this.tempData.room = {
                manager,maintainer,imageAgent,autoWorker,
                ...myRoom,
            }
            this.tempData.powerLevelUpCost = powerLevelUpCost;
            this.tempData.digLevelUpCost = digLevelUpCost;
            this.tempData.tradeLevelUpCost = tradeLevelUpCost;
            this.tempData.myPopRoomList = bulbsort(myMainRoomList,'order',0);
            this.tempData.myTerminalList = myTerminalList;
            this.tempData.myRoomWorkerList = myRoomWorkerList;
        },
        asynTerminalPage(){ // 刷新终端页temp数据
            let id = this.searchingTerminalID;
            if(!id){
                this.tempData.terminal = null;
                return;
            }
            let terminal = getListByID(id,'id',this.game.terminalList)[0]||{},
                room = getListByID(terminal.rid,'id',this.game.roomList)[0],
                worker = getListByID(id,'tid',this.game.workerList)[0],
                myTerminal = {...terminal},
                myRoom = {...room},
                myWorker = {...worker};
            this.tempData.terminal = {
                ...myTerminal,
                operator: myWorker,
                job: (myWorker&&myWorker.job>0)?(['发电','挖矿','交易','终端维护'][myWorker.job-1]):'',
                room,
            }
        },
        asynWorkerPage(){ // 刷新人员页temp数据
            let id = this.searchingWorkerID;
            if(id){
                let worker = getListByID(id,'id',this.game.workerList)[0],
                    myWorker = {...worker};
                this.tempData.myWorkerList = [myWorker];
            }
            else{
                let workerList = getListByID(this.game.factoryList[0].id,'fid',this.game.workerList),
                    myWorkerList = [...workerList];
                this.tempData.myWorkerList = myWorkerList;
            }
        },
        asynMarketPage(){ // 刷新市场页temp数据
            let marketRoomList = getListByID(0,'fid',this.game.roomList),
                marketWorkerList = getListByID(0,'fid',this.game.workerList),
                myMarketRoomList = [...marketRoomList],
                myMarketWorketList = [...marketWorkerList];
            this.tempData.marketRoomList = Array.from(myMarketRoomList,room=>{
                return {
                    price: this.calcRoomValue(room),
                    ...room,
                }
            });
            this.tempData.marketWorkerList = Array.from(myMarketWorketList,worker=>{
                return {
                    price: this.calcWorkerValue(worker),
                    ...worker,
                }
            });
        },
        asynRelationPage(){ // 刷新外交页temp数据
            let factoryList = this.game.factoryList,
                relationList = getListByID(factoryList[0].id,'from',this.game.relationList);
            this.tempData.relationList = Array.from(relationList,relation=>{
                let factory = getListByID(relation.to,'id',factoryList)[0],
                    joint = getMatchList(this.game.workerList,[['tfid',factory.id],['job',12],['fid',this.game.factoryList[0].id]])[0]||{},
                    spyList = getMatchList(this.game.workerList,[['tfid',factory.id],['job',13],['fid',this.game.factoryList[0].id]])||[];
                return {
                    ...relation,
                    money: factory.money,
                    image: factory.image,
                    jointName: joint.name,
                    spyCount: spyList.length,
                }
            });
        },
        asynFactoryPage(){ // 刷新工厂页temp数据
            let id = this.searchingFactoryID;
            if(id){
                let factoryList = this.game.factoryList,
                    factory = getListByID(id,'id',factoryList)[0],
                    factoryRoomList = getListByID(id,'fid',this.game.roomList),
                    factoryWorkerList = getListByID(id,'fid',this.game.workerList),
                    joint = getMatchList(this.game.workerList,[['tfid',factory.id],['job',12],['fid',this.game.factoryList[0].id]])[0],
                    spyList = getMatchList(this.game.workerList,[['tfid',factory.id],['job',13],['fid',this.game.factoryList[0].id]]),
                    studyWorker = getMatchList(this.game.workerList,[['studyfid',this.game.factoryList[0].id]])[0],
                    myFactory = {...factory},
                    myJoint = {...joint},
                    mySpyList = [...spyList],
                    myFactoryRoomList = [...factoryRoomList],
                    myFactoryWorkerList = [...factoryWorkerList];
                this.tempData.factory = myFactory;
                this.tempData.factory.boss = getMatchList(factoryWorkerList,[['boss',true]])[0];
                this.tempData.joint = myJoint;
                this.tempData.mySpyList = mySpyList;
                this.tempData.studyWorker = studyWorker;
                this.tempData.factoryRoomList = myFactoryRoomList;
                this.tempData.factoryWorkerList = myFactoryWorkerList;
            }
            else{
                this.tempData.factory = null;
                this.tempData.joint = null;
                this.tempData.mySpyList = [];
                this.tempData.studyWorker = null;
                this.tempData.factoryRoomList = [];
                this.tempData.factoryWorkerList = [];
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
    .main{
        text-align: center;
        width: 100%;
        height: 100%;
        color: #4a4a4a;
        font-size: .24rem;
    }
    .orange{
        color: #ff4f18;
    }
    .panel{
        position: relative;
        width: 100%;
        height: calc( 100% - 1.2rem );
    }
    .clr{
        clear: both;
    }
    .block{
        height: 100%;
        width: 100%;
        overflow-x: hidden;
        overflow-y: scroll;
        padding-bottom: 1.5rem;
    }
    .pop{
        background-color: #fff;
        width: 3rem;
    }
    .pop-system-menu .menu-item,
    .pop-system-menu .switch{
        display: block;
        width: 3rem;
        height: .8rem;
        line-height: .8rem;
        font-size: .28rem;
        white-space: nowrap;
        word-break: keep-all;
        text-align: center;
    }
    .pop-system-menu .switch{
        display: flex;
        justify-content: space-around;
        align-items: center;
    }
    .pop-system-menu .switch label{

    }
    .tab-panel{
        padding: 0 .12rem;
    }
    .tab-panel .row{
        min-height: 1rem;
        margin-bottom: .3rem;
    }
    .tab-panel .no-margin{
        margin-bottom: 0;
    }
    .row .label,.row. .input{

    }
    .flex{
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
    }
    .row .row-column{
        width: 49%;
        display: inline-block;
    }
    .row .label{
        width: 2.5rem;
        white-space: nowrap;
        word-break: keep-all;
        text-align: right;
        padding-right: .1rem;
    }
    .row .input{
        width: 4rem;
    }
    .row-tip,.tip{
        font-size: .2rem;
        line-height: .3rem;
        margin: .14rem 0;
        color: #777;
    }
    .row-tip p{
        text-align: left;
    }
    .row-tip .btn{
        margin-left: .1rem;
        text-align: center;
        white-space: nowrap;
        word-break: keep-all;
    }
    .row-tip p::before{
        content: '';
        display: inline-block;
        vertical-align: middle;
        width: .08rem;
        height: .08rem;
        background-color: #ff4f18;
        margin-right: .12rem;
    }
    .btn{
        color: #ff4f18;
    }
    .btn-icon{
        display: inline-block;
        color: #ff4f18;
        text-align: center;
        font-size: .33rem;
        width: .26rem;
    }
    .btn-go{
        color: #fff;
    }
    .btn-go p,
    .btn-go small{
        word-break: keep-all;
        white-space: nowrap;
    }
    .btn-small{
        margin-left: .2rem;
        font-size: .22rem;
    }
    .small{
        font-size: .2rem;
        font-weight: normal;
    }
    .touch-dom{
        display: block;
        padding-left: .2rem;
        width: 1.2rem;
        height: .8rem;
        line-height: .4rem;
        font-size: .24rem;
        word-break: break-all;
        color: #fff;
        border-top-left-radius: .4rem;
        border-bottom-left-radius: .4rem;
        background: linear-gradient(315deg, #ff4f18 0%, #f20000 100%);
        border: .02rem solid #fff;
        border-right: 0;
    }
    .factory-name{
        position: relative;
        width: 100%;
        height: 1.05rem;
        line-height: 1.05rem;
        text-align: left;
        font-size: .5rem;
    }
    .factory-name >span{
        display: block;
        height: 1rem;
        border-bottom: 1px solid #414141;
    }
    .btn-edit{
        color: #ff4f18;
        display: inline-block;
        font-size: .2rem;
    }
    .my-name{
        display: flex;
        justify-content: flex-start;
        align-items: center;
        height: .46rem;
        line-height: .46rem;
        font-weight: normal;
        text-align: left;
    }
    .my-name >b{
        display: inline-block;
        margin: 0 .04rem;
    }
    .room-name{
        height: .9rem;
        line-height: .9rem;
        text-align: left;
        border-bottom: 1px solid #414141;
    }
    .room-name >span{
        font-weight: normal;
        font-size: .28rem;
    }
    .tab-wrap{
        position: absolute;
        z-index: 999;
        bottom: 0;
        left: 0;
        right: 0;
        width: 100%;
        height: 1rem;
        line-height: 1rem;
        display: flex;
        justify-content: space-around;
        align-items: center;
        background-color: #fff;
        /* border-top: .01rem solid #ff4f18; */
        box-shadow: 0 0 .2rem .03rem grey;
    }
    .tab-wrap .btn{
        width: 1.5rem;
        font-size: .26rem;
        white-space: nowrap;
        word-break: keep-all;
    }
    .tab-wrap .btn-tab-ban{
        background-color: #ccc;
        color: #eaeaea;
    }
    .tab-wrap .active{
        background: linear-gradient(315deg, #ff4f18 0%, #f20000 100%);
        color: #fff;
    }
    .index{
        text-align: left;
        padding: .12rem 0;
        margin-bottom: .18rem;
    }
    .index::after{
        content: '';
        display: block;
        width: 100%;
        clear: both;
    }
    .index-cell{
        height: .5rem;
        line-height: .5rem;
        font-size: .26rem;
        display: inline-block;
        width: 100%;
        white-space: nowrap;
        word-break: keep-all;
    }
    .index-cell-grey{
        font-weight: normal;
        color: #777;
    }
    .index-lg{
        margin-top: 35px;
    }
    .pct-wrap b{
        width: 35%;
    }
    .index .pct{
        display: inline-block;
        width: calc( 60% - .12rem );
        margin-left: .12rem;
    }
    .index-cell b{
        padding-left: .1rem;
        border-left: .06rem solid #ff4f18;
    }
    .index-cell .lab-name{
        display: inline-block;
        width: 1rem;
    }
    .index .left{
        float: left;
        width: 50%;
    }
    .index .right{
        float: right;
        width: 50%;
    }
    .filter{
        padding: .1rem 0;
        margin: 0;
        line-height: .5rem;
    }
    .filter .select,
    .market .select{
        font-weight: bold;
        text-decoration: underline;
    }
    .filter .btn,
    .market .btn{
        display: inline-block;
        width: 1.2rem;
        font-size: .26rem;
        text-align: left;
    }
    .market{
        padding: 0;
        margin: 0;
        height: .6rem;
        line-height: .6rem;
    }
    .market .btn{
        width: 49%;
        font-size: .3rem;
    }
    .market .select{
        border-bottom: .01rem solid #ff4f18;
        font-size: .3rem;
    }
    .footer{
        position: absolute;
        z-index: 999;
        bottom: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 1.2rem;
        width: 100%;
        background: white;
    }
    .footer .fact{
        padding: 0 .23rem;
        width: 4.2rem;
        text-align: center;
        height: 1.2rem;
        border-top: .01rem solid #ccc;
    }
    .footer .fact .fact-item{
        width: 4.2rem;
        height: .6rem;
        line-height: .6rem;
        text-align: left;
        font-size: .34rem;
    }
    .footer .btn{
        width: 3.3rem;
        height: 1.2rem;
        font-size: .32rem;
    }
    .gameover{
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 30px;
        background-color: #aaa;
        color: #fff;
    }
    /* 弹窗 */
    .room-board{
        width: 6.5rem;
        padding: 0 .2rem;
    }
    .room-board .btn{
        text-align: center;
        font-size: .24rem;
    }
    .room-board .row{
        padding: .3rem 0;
        border-bottom: .01rem solid #ccc;
    }
    .room-board .level{
        display: flex;
        justify-content: space-around;
        align-items: center;
        height: 1.5rem;
    }
    .room-board .room-level{
        padding-bottom: 0;
    }
    .room-board .room-level .btn{
        font-weight: bold;
        font-size: .3rem;
    }
    .room-board .room-level .main-level{
        display: flex;
        justify-content: space-around;
        align-items: center;
        height: 1rem;
    }
    .room-board .level .btn{
        font-weight: bold;
        font-size: .3rem;
    }
    .room-board .order-con{
        display: flex;
        justify-content: space-between;
        align-items: center;
        float: left;
        width: 2rem;
        height: .4rem;
        line-height: .4rem;
    }
    .counter{
        display: flex;
        justify-content: space-around;
        align-items: center;
        font-size: .3rem;
        width: 1.2rem;
    }
    .counter .btn{
        height: .4rem;
        width: .4rem;
        color: #a4a4a4;
        border: .01rem solid #a4a4a4;
    }
    .counter .active{
        color: #ff4f18;
        border: .01rem solid #ff4f18;
    }
    .counter span{
        display: inline-block;
        width: .4rem;
    }
    .room-board .room-level .all-level{
        text-align: left;
        float: right;
    }
    .room-board .room-level .all-level .btn-small{
        height: .4rem;
        line-height: .4rem;
        font-size: .22rem;
        color: #ff4f18;
        display: block;
        margin-bottom: 10px;
    }
    .room-board .risk{
        text-align: left;
        min-height: 2rem;
    }
    .room-board .risk h3{
        height: .6rem;
        line-height: .6rem;
    }
    .room-board .risk .risk-side{
        display: inline-block;
        width: 49%;
        padding: 0 4px;
    }
    .room-board .risk .risk-side-border{
        border-right: 1px solid #ccc;
    }
    .room-board .risk .select{
        color: #ff4f18;
    }
    .room-board .risk .risk-item{
        display: inline-block;
        margin-right: .2rem;
    }
    .room-board .sell{
        color: #ff4f18;
        font-size: .3rem;
        font-weight: bold;
        text-align: right;
    }
    .room-board .sell a{
        display: inline-block;
        margin: 0 6px;
    }
    .btn-group{
        display: flex;
        justify-content: space-around;
        align-items: center;
    }
    .btn-group a{
        width: 3rem;
    }
    .worker-board{
        width: 5rem;
        padding: 0 .2rem;
        padding-bottom: .3rem;
        text-align: left;
    }
    .worker-board .title{
        min-height: .8rem;
        line-height: .8rem;
        margin-bottom: .2rem;
        font-size: .3rem;
        border-bottom: .01rem solid #ccc;
    }
    .worker-board .title span{
        font-size: .2rem;
        font-weight: normal;
    }
    .worker-board .item{
        display: flex;
        justify-content: flex-start;
        align-items: center;
    }
    .worker-board .item h3{
        width: 35%;
        text-align: left;
        height: .58rem;
        line-height: .58rem;
        white-space: nowrap;
        word-break: keep-all;
    }
    .worker-board .item span{
        width: 60%;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        text-align: left;
        white-space: nowrap;
        word-break: keep-all;
    }
    .worker-board .item span b{
        width: .65rem;
    }
    .worker-board .sell{
        color: #ff4f18;
        font-size: .3rem;
        font-weight: bold;
        justify-content: flex-end;
    }
    .worker-board .sell .risk-item{
        height: .72rem;
        line-height: .72rem;
        margin-left: .24rem;
    }
    .pop-worker-list{
        width: 7.2rem;
        padding: .1rem;
        height: 6.2rem;
        overflow-y: scroll;
        overflow-x: hidden;
    }
    .pop-room-list{
        width: 7.2rem;
        padding: .3rem;
        height: 6.2rem;
        overflow: scroll;
    }
    .pop-room-list h3{
        width: 2.5rem;
    }
    .pop-room-list h3 >p{
        white-space: nowrap;
        word-break: keep-all;
    }
    .pop-room-list .level{
        display: flex;
        align-items: center;
        justify-content: flex-start;
        height: 1.5rem;
    }
    .log{
        padding: .2rem;
    }
    .log .title{
        text-align: left;
        font-size: .26rem;
    }
    .log .sub-title{
        font-size: .26rem;
    }
    .log-board{
        width: 7rem;
        height: 10rem;
        max-height: 90%;
        padding: .2rem;
        text-align: left;
        overflow-y: scroll;
    }
    .log-board .title{
        font-size: .32rem;
        border-bottom: .01rem solid #ccc;
    }
    .para{
        font-size: .24rem;
        line-height: .4rem;
    }
    .para .p1{
        padding: .16rem 0;
        border-bottom: .01rem solid #ccc;
    }
    /* 规则 */
    .rule{
        position: absolute;
        top: 0;
        right: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
        color: #fff;
        overflow-x: hidden;
        overflow-y: scroll;
        background-color: rgba(0,0,0,.7);
        transition: all .2s;
    }
    .rule-hide{
        top: 42px;
        right: 22px;
        width: 0;
        height: 0;
    }
    .rule-board{
        width: 100%;
        padding: .8rem .35rem;
    }
    .rule-board .row,
    .rule-board .sub-row{
        text-align: left;
    }
    .rule-board .row{
        margin-bottom: .2rem;
        padding: 0 .12rem;
        padding-bottom: .2rem;
        background-color: rgba(0,0,0,.5);
    }
    .heavy-shadow .row{
        background-color: rgba(0,0,0,.75);
    }
    .rule-board .sub-row{
        padding-left: .2rem;
    }
    .rule-board .row h3,
    .rule-board .sub-row h3{
        height: .5rem;
        line-height: .5rem;
        white-space: nowrap;
        word-break: keep-all;
        font-size: .26rem;
    }
    .rule-board .sub-row h3{
        margin-top: .1rem;
        height: .4rem;
        line-height: .4rem;
    }
    .rule-board .row h3 >label{
        padding-left: .12rem;
        border-left: .06rem solid #ff4f18;
    }
    .rule-board .sub-row h3 label{
        padding-left: .12rem;
        border-left: none;
    }
    .rule-board .sub-row h3 label::before{
        content: '';
        display: inline-block;
        vertical-align: middle;
        width: .08rem;
        height: .08rem;
        background-color: #ff4f18;
        margin-right: .12rem;
    }
    .rule-board .row p,
    .rule-board .sub-row p{
        font-size: .26rem;
        padding: 0 .2rem;
    }
    .rule-board .sub-row p{
        padding-left: .32rem;
    }
    .level-bar{
        display: inline-block;
        height: .2rem;
        line-height: .2rem;
        width: 1rem;
        margin-right: .04rem;
    }
    .level-bar-1{
        background-color: #ccc;
    }
    .level-bar-2{
        background-color: #5EC0FF;
    }
    .level-bar-3{
        background-color: #0E56FF;
    }
    .level-text{
        font-weight: bold;
    }

    .btn-lvlup{
        display: inline-block;
        margin-left: 10px;
        font-weight: bold;
    }

    .factory-board{
        width: 7rem;
        padding: .2rem .1rem;
    }
</style>

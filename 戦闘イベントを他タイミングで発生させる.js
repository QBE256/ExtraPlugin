/*---------------------------------
	戦闘イベントを他タイミングで発生させる ver 1.0

■作成者
キュウブ

■概要
このスクリプトを導入すると以下のタイミングで戦闘時イベントが発生するようになります。
・戦闘画面の暗転前

※他のタイミングも後々対応予定

■使い方
ユニットの戦闘時イベントを設定し、
詳細情報->カスタムパラメータにて以下のカスパラを記入するだけでOK。
battleEventType: 0


■更新履歴
ver 1.0 (2021/6/25)
公開 

■対応バージョン
SRPG Studio Version:1.161

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。
・クレジット明記無し　OK (明記する場合は"キュウブ"でお願いします)
・再配布、転載　OK (バグなどがあったら修正できる方はご自身で修正版を配布してもらっても構いません)
・wiki掲載　OK
・SRPG Studio利用規約は遵守してください。

--------------------------------------------------------------------------*/

(function(){
	var _RealBattleTable__pushFlowEntriesBattleStart = RealBattleTable._pushFlowEntriesBattleStart;
	RealBattleTable._pushFlowEntriesBattleStart = function(straightFlow) {
		_RealBattleTable__pushFlowEntriesBattleStart.call(this, straightFlow);
		straightFlow.insertFlowEntry(BeforeBattleUnitEventFlowEntry, 0);
	};

	var _EasyBattleTable__pushFlowEntriesBattleStart = EasyBattleTable._pushFlowEntriesBattleStart;
	EasyBattleTable._pushFlowEntriesBattleStart = function(straightFlow) {
		_EasyBattleTable__pushFlowEntriesBattleStart.call(this, straightFlow);
		straightFlow.insertFlowEntry(BeforeBattleUnitEventFlowEntry, 0);
	};

	TransitionStartFlowEntry._isStart = false;
	var _TransitionStartFlowEntry_moveFlowEntry = TransitionStartFlowEntry.moveFlowEntry;
	TransitionStartFlowEntry.moveFlowEntry = function() {
		if (!this._isStart) {
			this._isStart = true;
			MediaControl.soundDirect('attackstart');
		}
		return _TransitionStartFlowEntry_moveFlowEntry.call(this);
	};

	var _EasyMapUnit_moveMapUnit = EasyMapUnit.moveMapUnit;
	EasyMapUnit.moveMapUnit = function() {
		if (this.getCycleMode() === MapUnitMode.NONE) {
			this._xPixel = LayoutControl.getPixelX(this._unit.getMapX());
			this._yPixel = LayoutControl.getPixelY(this._unit.getMapY());
		}
		return _EasyMapUnit_moveMapUnit.call(this);
	};
})();

// 戦闘前イベントが流れている時に暗転音が流れてしまうため、この処理は削除する
CoreAttack._playAttackStartSound = function() {
};

var battleEventType = {
	BEFORE_BATTLE: 0
};

UnitEventType.EXTEND_EVENT = 201;

var ExtendBattleEventFlowEntry = defineObject(BaseFlowEntry,
{
	_capsuleEvent: null,
	
	enterFlowEntry: function(battleTable) {
		this._prepareMemberData(battleTable);
		return this._completeMemberData(battleTable);
	},
	
	moveFlowEntry: function() {
		var result = MoveResult.CONTINUE;

		if (this._capsuleEvent.moveCapsuleEvent() !== MoveResult.CONTINUE) {
			return MoveResult.END;
		}
		
		return result;
	},
	
	_prepareMemberData: function(battleTable) {
		this._capsuleEvent = createObject(CapsuleEvent);
	},
	
	_completeMemberData: function(battleTable) {
		var battleObject = battleTable.getBattleObject();
		var battleEventData = UnitEventChecker.getUnitExtendBattleEventData(
									battleObject.getActiveBattler().getUnit(),
									battleObject.getPassiveBattler().getUnit(),
									this._getBattleType()
								);

		if (battleEventData === null) {
			return EnterResult.NOTENTER;
		}

		this._capsuleEvent.setBattleUnit(battleEventData.unit);
		return this._capsuleEvent.enterCapsuleEvent(battleEventData.event, true);
	},

	_getBattleType: function() {
		return 	battleEventType.BEFORE_BATTLE;
	}
}
);

var BeforeBattleUnitEventFlowEntry = defineObject(ExtendBattleEventFlowEntry,
{
	_getBattleType: function() {
		return 	battleEventType.BEFORE_BATTLE;
	}
}
);	

UnitEventChecker.getUnitExtendBattleEventData = function(unit, targetUnit, battleEventType) {
	var event = this._getExtendBattleEvent(unit, targetUnit, battleEventType);
		
	if (event !== null) {
		return {
			event: event,
			unit: targetUnit
		};
	}
	
	event = this._getExtendBattleEvent(targetUnit, unit, battleEventType);
	if (event !== null) {
		return {
			event: event,
			unit: unit
		};
	}
		
	return null;
};

UnitEventChecker._getExtendBattleEvent = function(unit, targetUnit, battleEventType) {
	var i, event, info;
	var count = unit.getUnitEventCount();
	for (i = 0; i < count; i++) {
		event = unit.getUnitEvent(i);
		info = event.getUnitEventInfo();
		if (
			info.getUnitEventType() === UnitEventType.BATTLE &&
			event.custom.battleEventType === battleEventType &&
			event.isBattleEvent(targetUnit)
		) {
			return event;
		}
	}
	return null;
};

UnitEventChecker._getEvent = function(unit, targetUnit, unitEventType) {
	var i, event, info;
	var count = unit.getUnitEventCount();
		
	for (i = 0; i < count; i++) {
		event = unit.getUnitEvent(i);
		if (('battleEventType' in event.custom)) {
			continue;
		}
		info = event.getUnitEventInfo();
		if (info.getUnitEventType() === unitEventType) {
			if (unitEventType === UnitEventType.BATTLE) {
				if (event.isBattleEvent(targetUnit)) {
					return event;
				}
			}
			else {
				if (event.isEvent()) {
					return event;
				}
			}
		}
	}
		
	return null;
};
/*
ワープコマンドスキル ver1.0

■作成者
キュウブ

■概要
このスキルを持ったユニットはユニットコマンドでワープが使用できるようになります。
ワープで任意の位置に移動してから、通常移動や各種コマンドの実行が可能になります。

■使い方
1.ワープアイテムの設定
このスキルはコマンド選択時にダミーのワープアイテムを一時的に生成して対象ユニットが使用する仕組みになっています。
なのでダミーで扱うためのワープアイテムを設定する必要があります。

アイテムの設定は以下のようにしてください
・取得経験値は0にする事(コマンドを使用する度に経験値を取得させたい場合はその限りではありません)
・フィルタは「自軍」である事
・範囲の設定は「単体」である事

また、アイテム名がコマンド名になります


2.スキルの設定
カスタムスキルで
カスタムキーワードを"Teleporation"
カスタムパラメータで
{teleportationItemId: <1番で設定したアイテムのID>}
と設定します。
例えばアイテムIDが10番であったら
{teleportationItemId: 10}
と設定してください。

※発動率はCPUに限り有効になります。50%と設定した場合はCPUユニットは50%の確率でしかワープを使用しなくなります。

※※このスキルの仕様※※
プレイヤーユニット側の仕様
・ワープコマンドはまだ1マスも移動してない場合のみ出現します
・ワープ後にキャンセルを押しても元の位置に戻る事はできません
・ワープコマンドは1ターンに1度しか使えません。行動回復などを用いても次ターンにならないと使用できません。

CPUユニット側の仕様
・CPUは行動型の場合のみこのスキルを使用します。（「範囲内のみ行動する」の設定の有無は関係無し）
・ワープの行動ロジックはSRPGStudioのワープ時のAIに依存します。
  - 射程範囲に敵勢力ユニットがいる場合にその位置までワープしようとします
  - したがって、射程範囲にいないとワープは行わず通常移動だけ行います
  - ワープアイテムの射程はゲームバランスを壊さない範囲で長めにとっておく事を推奨します

更新履歴
ver 1.0 2022/03/29
初版

■対応バージョン
SRPG Studio Version:1.161

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。
・クレジット明記無し　OK (明記する場合は"キュウブ"でお願いします)
・再配布、転載　OK (バグなどがあったらプルリクエストしてくださると嬉しいです)
・wiki掲載　OK
・SRPG Studio利用規約は遵守してください。

*/

AutoActionBuilder.buildTeleporationAction = function(unit, autoActionArray) {
	var combination = CombinationManager.getTeleportationCombination(unit);
	unit.custom.usedTeleportation = true;
	unit.setOrderMark(OrderMarkType.FREE);

	if (combination === null) {
		return this._buildEmptyAction();
	}
	else {
		this._pushTeleportation(unit, autoActionArray, combination);
	}

	return true;
};

AutoActionBuilder._pushTeleportation = function (
	unit,
	autoActionArray,
	combination
) {
	var autoAction = createObject(ItemAutoAction);

	autoAction.setAutoActionInfo(unit, combination);
	autoActionArray.push(autoAction);
};

CombinationManager.getTeleportationCombination = function (unit) {
	var combinationArray, combinationIndex, combination;
	var simulator = root.getCurrentSession().createMapSimulator();
	var misc = CombinationBuilder.createMisc(unit, simulator);

	simulator.startSimulation(unit, 0);

	combinationArray = CombinationBuilder.createTeleportationCombinationArray(misc);
	if (combinationArray.length === 0) {
		return null;
	}

	combinationIndex = CombinationSelector.getCombinationIndex(
		unit,
		combinationArray
	);
	if (combinationIndex < 0) {
		return null;
	}

	combination = combinationArray[combinationIndex];

	combination.cource = [];

	return combination;
};

CombinationBuilder.createTeleportationCombinationArray = function (misc) {
	var i, count, builder;
	var groupArray = [];
	groupArray.appendObject(CombinationCollector.Teleportation);
	this._resetMisc(misc);
	groupArray[0].collectCombination(misc);

	return misc.combinationArray;
};

CombinationCollector.Teleportation = defineObject(CombinationCollector.Item, {
	collectCombination: function (misc) {
		var obj, actionTargetType, itemId, baseItem;
		var unit = misc.unit;
		var skill = SkillControl.getPossessionCustomSkill(unit, 'Teleporation');

		if (!skill || typeof skill.custom.teleportationItemId !== 'number') {
			return;
		}
		itemId = skill.custom.teleportationItemId;

		baseItem = root.getBaseData().getItemList().getDataFromId(itemId);

		if (!this._isItemEnabled(unit, baseItem, misc)) {
			return;
		}
		obj = ItemPackageControl.getItemAIObject(baseItem);
		if (obj === null) {
			return;
		}
		actionTargetType = obj.getActionTargetType(unit, baseItem);

		misc.item = root.duplicateItem(baseItem);
		misc.actionTargetType = actionTargetType;

		this._setCombination(misc);
	},

	_isItemEnabled: function (unit, item, misc) {
		return (
			item.getItemType() === ItemType.TELEPORTATION &&
			item.getRangeType() === SelectionRangeType.SELFONLY &&
			ItemControl.isItemUsable(unit, item)
		);
	}
});

EnemyTurn._invocationTeleporation = function() {
	var skill;
	if (this._orderUnit.custom.usedTeleportation) {
		return false;
	}
	skill = SkillControl.getPossessionCustomSkill(this._orderUnit, 'Teleporation');
	if (!skill || typeof skill.custom.teleportationItemId !== 'number') {
		return false;
	}
	return Probability.getInvocationProbabilityFromSkill(this._orderUnit, skill);
};

UnitCommand._canRollbackPosition = true;
UnitCommand.canRollbackPosition = function() {
	return this._canRollbackPosition;
};

UnitCommand.setRollbackPosition = function(flag) {
	this._canRollbackPosition = flag;
};

var TeleportationCommandMode = {
	SELECTION: 0,
	USE: 1
};

UnitCommand.Teleportation = defineObject(UnitListCommand,
{
	_itemUse: null,
	_itemSelection: null,
	_baseItem: null,
	
	openCommand: function() {
		this._prepareCommandMemberData();
		this._completeCommandMemberData();
	},
	
	moveCommand: function() {
		var mode = this.getCycleMode();
		var result = MoveResult.CONTINUE;
		
		if (mode === TeleportationCommandMode.SELECTION) {
			result = this._moveSelection();
		}
		else if (mode === TeleportationCommandMode.USE) {
			result = this._moveUse();
		}
		
		return result;
	},
	
	drawCommand: function() {
		var mode = this.getCycleMode();
		
		if (mode === TeleportationCommandMode.SELECTION) {
			this._drawSelection();
		}
		else if (mode === TeleportationCommandMode.USE) {
			this._drawUse();
		}
	},
	
	isCommandDisplayable: function() {
		var skill;
		var unit = this.getCommandTarget();
		var isMoved = unit.getMostResentMov() !== 0;
		if (isMoved) {
			return false;
		}
		var isUsedTeleportation = unit.custom.usedTeleportation;
		if (isUsedTeleportation) {
			return false;
		}
		skill = SkillControl.getPossessionCustomSkill(unit, 'Teleporation');
		if (!skill) {
			return false;
		}
		if (typeof skill.custom.teleportationItemId !== 'number') {
			return false;
		}
		var item = root.getBaseData().getItemList().getDataFromId(skill.custom.teleportationItemId);
		var isSelfTeleporationItem = item.getItemType() === ItemType.TELEPORTATION && item.getRangeType() === SelectionRangeType.SELFONLY;
		if (!isSelfTeleporationItem) {
			return false;
		}
		return ItemControl.isItemUsable(unit, item);
	},
	
	getCommandName: function() {
		var skill = SkillControl.getPossessionCustomSkill(this.getCommandTarget(), 'Teleporation');
		var item = root.getBaseData().getItemList().getDataFromId(skill.custom.teleportationItemId);
		return item.getName();
	},
	
	isRepeatMoveAllowed: function() {
		return false;
	},
	
	_prepareCommandMemberData: function() {
		this._itemUse = null;
		this._itemSelection = null;
	},
	
	_completeCommandMemberData: function() {
		var unit = this.getCommandTarget();
		var skill = SkillControl.getPossessionCustomSkill(this.getCommandTarget(), 'Teleporation');
		this._baseItem = root.getBaseData().getItemList().getDataFromId(skill.custom.teleportationItemId);
		this._itemSelection = ItemPackageControl.getItemSelectionObject(this._baseItem);
		this._itemSelection.enterItemSelectionCycle(unit, this._baseItem);
		this.changeCycleMode(TeleportationCommandMode.SELECTION);
	},

	_moveSelection: function() {
		if (this._itemSelection.moveItemSelectionCycle() !== MoveResult.CONTINUE) {
			if (this._itemSelection.isSelection()) {
				this._useItem();
				this.changeCycleMode(TeleportationCommandMode.USE);
			}
			else {
				return MoveResult.END;
			}
		}
		
		return MoveResult.CONTINUE;
	},
	
	_moveUse: function() {
		if (this._itemUse.moveUseCycle() !== MoveResult.CONTINUE) {
			this.endCommandAction(this);
			return MoveResult.END;
		}
		
		return MoveResult.CONTINUE;
	},
	
	_drawSelection: function() {
		this._itemSelection.drawItemSelectionCycle();
	},
	
	_drawUse: function() {
		this._itemUse.drawUseCycle();
	},
	
	_useItem: function() {
		var itemTargetInfo;
		var virtualItem = root.duplicateItem(this._baseItem);
		
		this._itemUse = ItemPackageControl.getItemUseParent(virtualItem);
		itemTargetInfo = this._itemSelection.getResultItemTargetInfo();
		
		itemTargetInfo.unit = this.getCommandTarget();
		itemTargetInfo.item = virtualItem;
		itemTargetInfo.isPlayerSideCall = true;
		this._itemUse.enterUseCycle(itemTargetInfo);
	},

	endCommandAction: function(command) {
		this.getCommandTarget().custom.usedTeleportation = true;
		this._listCommandManager.setRollbackPosition();
		this._listCommandManager.endCommandAction(this);
	}
}
);

(function(){
	var _EnemyTurn__createAutoAction = EnemyTurn._createAutoAction;
	EnemyTurn._createAutoAction = function() {
		var patternType = this._orderUnit.getAIPattern().getPatternType();
		this._autoActionArray = [];
		
		if (patternType === PatternType.APPROACH && this._invocationTeleporation()) {
			AutoActionBuilder.buildTeleporationAction(this._orderUnit, this._autoActionArray);
			this._orderUnit.custom.usedTeleportation = true;
			this._orderUnit.setOrderMark(OrderMarkType.FREE);
		} else {
			delete this._orderUnit.custom.usedTeleportation;
			return _EnemyTurn__createAutoAction.apply(this, arguments);
		}
		return true;
	};

	var _UnitCommand_configureCommands = UnitCommand.configureCommands;
	UnitCommand.configureCommands = function(groupArray) {
		groupArray.appendObject(UnitCommand.Teleportation);
		_UnitCommand_configureCommands.apply(this, arguments);
	};

	var _MapSequenceCommand__doLastAction = MapSequenceCommand._doLastAction;
	MapSequenceCommand._doLastAction = function() {
		var i;
		var unit = null;
		var list = PlayerList.getSortieList();
		var count = list.getCount();
		
		for (i = 0; i < count; i++) {
			if (this._targetUnit === list.getData(i)) {
				unit = this._targetUnit;
				break;
			}
		}

		if (unit !== null) {
			if (!this._unitCommandManager.canRollbackPosition()) {
				return 2;
			}
		}

		return _MapSequenceCommand__doLastAction.apply(this, arguments);
	};

	var _TurnChangeStart_doLastAction = TurnChangeStart.doLastAction;
	TurnChangeStart.doLastAction = function() {
		var turnType = root.getCurrentSession().getTurnType();
		if (turnType === TurnType.PLAYER) {
			var playerList = PlayerList.getMainList();
			var count = playerList.getCount();
			for (var index = 0; index < count; index++) {
				var unit = playerList.getData(index);
				delete unit.custom.usedTeleportation;
			}
		}
		_TurnChangeStart_doLastAction.apply(this, arguments);
	};
})();
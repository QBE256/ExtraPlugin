/*--------------------------------------------------------------------------
　自動中断セーブ機能 ver2.0

■作成者
キュウブ

■概要
ユニットが待機する度に自動で中断セーブが行われます。
また、
1.敵ターン中でも自動セーブは行われます。ロードした場合は敵ターンから始まります。
2.自軍ユニットの戦闘時にも自動セーブが行われます。ロードした場合は戦闘直前から強制的に始まります(ver2.0新規機能)
※2の機能については他スクリプトの攻撃コマンド経由だとうまく動かない可能性があります。
※気になる場合は2の機能を排除した旧版スクリプトをご利用ください。

■事前準備
■■ 必須設定1
system-intteruption(自動中断セーブスクリプト用).jsと併用するか、
公式に配布されているsystem-intteruption.jsを下記のように修正してください
--------------------------------------------------------
TitleCommand.Interruption.openCommandの
root.getLoadSaveManager().loadInterruptionFile();の直前に

AutoSavedControl.setCustomParameter();
を追加する
---------------------------------------------------------
■■ 必須設定2
待機イベントでマップクリアが設定されていた場合、
そのイベント内で「イベントの状態変更」で自身の実行済み解除も行うようにしてください。
※エンディングイベント発生直後にゲームを終了して中断データをロードすると、エンディングが発生せずにクリア不能になるため

■■ 推奨設定(乱数初期化設定だった場合)
乱数固定化以外、全く同じ設定の難易度を用意します
※絶対に満たせない表示条件にして、NewGame時に選択不能にしておく分にはOKです
※中断セーブロード直後に戦闘を開始しても全く同じ乱数結果を引くためにスクリプト内に使用します

ゲームで使用している難易度のカスタムパラメータに下記のような設定を行います。
{autoSaveId:<今回作った難易度のID>}

もともとのゲームの難易度が一種類しかなければ、作成する難易度も一つで十分です。
ノーマル、ハードと複数種類ある場合は、その数分だけ同じ設定の難易度を用意してカスパラを設定する必要があります。

■■ 可能であればやってほしい事(スクリプト製作者向け)
他のスクリプトで拡張された攻撃コマンド経由の戦闘では自動セーブが行われない可能性があります。
その場合は各自スクリプトを編集していただくしかありません…


■更新履歴
ver 2.0 2022/03/19
戦闘再開機能を追加

ver 1.0 2017/07/19
初版

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

------------------------------------------------------*/

PlayerTurnMode.RESTARTCOMMAND = 1024;
PlayerTurn._restartMapSequenceCommand = null;
PlayerTurn._historyParam = null;
PlayerTurn.setRestartCommand = function (historyParam) {
	var unit, unitListCount;
	var unitLists = FilterControl.getListArray(UnitFilterFlag.PLAYER | UnitFilterFlag.ENEMY | UnitFilterFlag.ALLY);
	this._historyParam = historyParam;
	for (var filterIndex = 0; filterIndex < 3; filterIndex++) {
		unitListCount = unitLists[filterIndex].getCount();
		for (var unitIndex = 0; unitIndex < unitListCount; unitIndex++) {
			unit = unitLists[filterIndex].getData(unitIndex);
			if (unit.getId() === this._historyParam.activeUnitId) {
				this._targetUnit = unit;
				this._targetUnit.setMostResentMov(this._historyParam.resentMov);
				this._restartMapSequenceCommand.openSequence(this);
				this.changeCycleMode(PlayerTurnMode.RESTARTCOMMAND);
				return;
			}
		}
	}
	this.changeCycleMode(PlayerTurnMode.MAP);
};

PlayerTurn.getHistoryParam = function () {
	return this._historyParam;
};

PlayerTurn._moveRestartCommand = function () {
	var result = this._restartMapSequenceCommand.moveSequence();

	if (result === MapSequenceCommandResult.COMPLETE) {
		this._restartMapSequenceCommand.resetCommandManager();
		MapLayer.getMarkingPanel().updateMarkingPanelFromUnit(this._targetUnit);
		this._changeEventMode();
	} else if (result === MapSequenceCommandResult.CANCEL) {
		this._restartMapSequenceCommand.resetCommandManager();
		this.changeCycleMode(PlayerTurnMode.MAP);
	}

	return MoveResult.CONTINUE;
};

PlayerTurn._drawRestartommand = function () {
	MapLayer.drawUnitLayer();
	this._restartMapSequenceCommand.drawSequence();
};

var RestartMapSequenceCommand = defineObject(MapSequenceCommand, {
	_prepareSequenceMemberData: function (parentTurnObject) {
		MapSequenceCommand._prepareSequenceMemberData.apply(this, arguments);
		this._unitCommandManager = createObject(RestartUnitCommand);
	},

	_completeSequenceMemberData: function (parentTurnObject) {
		MapSequenceCommand._completeSequenceMemberData.apply(this, arguments);
		this._unitCommandManager.specifyCommand(parentTurnObject);
		this.changeCycleMode(MapSequenceCommandMode.COMMAND);
	}
});

var RestartUnitCommand = defineObject(UnitCommand, {
	specifyCommand: function (parentTurnObject) {
		var historyParam = parentTurnObject.getHistoryParam();
		for (var index = 0; index < this._commandScrollbar.getObjectCount(); index++) {
			this._commandScrollbar.setIndex(index);
			if (this._commandScrollbar.getObjectFromIndex(index).getCommandName() === historyParam.commandName) {
				this._commandScrollbar.setIndex(index);
				break;
			}
		}
		this._commandScrollbar.getObject().restartOpenCommand(historyParam);
		this.changeCycleMode(ListCommandManagerMode.OPEN);
	}
});

UnitListCommand.restartOpenCommand = function (restartParam) {
	this.openCommand();
};

UnitCommand.Attack.restartOpenCommand = function (restartParam) {
	var unit, rivalUnit, unitLists, unitListCount;
	this.openCommand();
	this._startSelection(ItemControl.getEquippedWeapon(this.getCommandTarget()));
	unitLists = FilterControl.getListArray(UnitFilterFlag.PLAYER | UnitFilterFlag.ENEMY | UnitFilterFlag.ALLY);
	for (var filterIndex = 0; filterIndex < 3; filterIndex++) {
		unitListCount = unitLists[filterIndex].getCount();
		for (var unitIndex = 0; unitIndex < unitListCount; unitIndex++) {
			unit = unitLists[filterIndex].getData(unitIndex);
			if (unit.getId() === restartParam.rivalUnitId) {
				this._targetUnit = unit;
				this._posSelector.restartSelect(this._targetUnit);
			}
		}
	}
	this.changeCycleMode(AttackCommandMode.SELECTION);
};

UnitCommand.Attack.autoSave = function (attackParam) {
	var customParameter = {
		turnType: root.getCurrentSession().getTurnType(),
		commandHistory: {
			activeUnitId: attackParam.unit.getId(),
			rivalUnitId: attackParam.targetUnit.getId(),
			commandName: this.getCommandName(),
			resentMov: attackParam.unit.getMostResentMov()
		}
	};
	AutoSavedControl.register(customParameter);
};

PosSelector._isRestartMode = false;
PosSelector.restartSelect = function (targetUnit) {
	this._isRestartMode = true;
	this._posMenu.changePosTarget(targetUnit);
};

var AutoSavedControl = {
	_customParameter: {
		turnType: null,
		commandHistory: null,
		originalDifficultlyId: null
	},

	register: function (customParameter) {
		var difficultyLists;
		var metaSession = root.getMetaSession();
		var currentDifficulty = metaSession.getDifficulty();
		var isChangeDifficulty = typeof currentDifficulty.custom.autoSaveId === "number";

		if (isChangeDifficulty) {
			difficultyLists = root.getBaseData().getDifficultyList();
			customParameter.originalDifficultlyId = currentDifficulty.getId();
			metaSession.setDifficulty(
				difficultyLists.getDataFromId(currentDifficulty.custom.autoSaveId)
			);
		}

		root.getLoadSaveManager().saveInterruptionFile(
			root.getBaseScene(),
			root.getCurrentSession().getCurrentMapInfo().getId(),
			customParameter
		);

		if (isChangeDifficulty) {
			metaSession.setDifficulty(currentDifficulty);
		}
	},

	rollbackDificcultly: function () {
		if (typeof this._customParameter.originalDifficultlyId === "number") {
			difficultyLists = root.getBaseData().getDifficultyList();
			root.getMetaSession().setDifficulty(
				difficultyLists.getDataFromId(this._customParameter.originalDifficultlyId)
			);
			this.deleteOriginalDifficultlyId();
		}
	},

	loadTurnType: function () {
		if (typeof this._customParameter.turnType === "number") {
			root.getCurrentSession().setTurnType(this._customParameter.turnType);
			this.deleteTurnType();
		}
	},

	setCustomParameter: function () {
		var saveFileInfo = root.getLoadSaveManager().getInterruptionFileInfo();
		if (typeof saveFileInfo.custom.turnType === "number") {
			this._customParameter.turnType = saveFileInfo.custom.turnType;
		}
		if (typeof saveFileInfo.custom.commandHistory === "object") {
			this._customParameter.commandHistory = {
				activeUnitId: saveFileInfo.custom.commandHistory.activeUnitId,
				rivalUnitId: saveFileInfo.custom.commandHistory.rivalUnitId,
				commandName: saveFileInfo.custom.commandHistory.commandName,
				resentMov: saveFileInfo.custom.commandHistory.resentMov
			};
		}
		if (typeof saveFileInfo.custom.originalDifficultlyId === "number") {
			this._customParameter.originalDifficultlyId = saveFileInfo.custom.originalDifficultlyId;
		}
	},

	getCustomParameter: function () {
		return this._customParameter;
	},

	resetCustomParameter: function () {
		this._customParameter = {
			turnType: null,
			commandHistory: null,
			originalDifficultlyId: null
		};
	},

	deleteTurnType: function () {
		this._customParameter.turnType = null;
	},

	deleteCommandHistory: function () {
		this._customParameter.commandHistory = null;
	},

	deleteOriginalDifficultlyId: function () {
		this._customParameter.originalDifficultlyId = null;
	}
};

(function () {
	var _PlayerTurn__prepareTurnMemberData = PlayerTurn._prepareTurnMemberData;
	PlayerTurn._prepareTurnMemberData = function () {
		_PlayerTurn__prepareTurnMemberData.apply(this, arguments);
		this._restartMapSequenceCommand = createObject(RestartMapSequenceCommand);
	};

	var _PlayerTurn__completeTurnMemberData = PlayerTurn._completeTurnMemberData;
	PlayerTurn._completeTurnMemberData = function () {
		var restartParam = {};
		var autoSaveCustomParameter = AutoSavedControl.getCustomParameter();

		_PlayerTurn__completeTurnMemberData.apply(this, arguments);
		if (
			root.getSceneController().isActivatedFromSaveFile() &&
			autoSaveCustomParameter.commandHistory && 
			typeof autoSaveCustomParameter.commandHistory === "object"
		) {
			restartParam.activeUnitId = autoSaveCustomParameter.commandHistory.activeUnitId;
			restartParam.rivalUnitId = autoSaveCustomParameter.commandHistory.rivalUnitId;
			restartParam.commandName = autoSaveCustomParameter.commandHistory.commandName;
			restartParam.resentMov = autoSaveCustomParameter.commandHistory.resentMov;
			this.setRestartCommand(restartParam);
			AutoSavedControl.deleteCommandHistory();
		}
	};

	var _PlayerTurn_moveTurnCycle = PlayerTurn.moveTurnCycle;
	PlayerTurn.moveTurnCycle = function () {
		var mode = this.getCycleMode();
		var result = MoveResult.CONTINUE;

		if (mode === PlayerTurnMode.RESTARTCOMMAND) {
			result = this._moveRestartCommand();
		} else {
			return _PlayerTurn_moveTurnCycle.apply(this, arguments);
		}

		if (this._checkAutoTurnEnd()) {
			return MoveResult.CONTINUE;
		}

		return result;
	};

	var _PlayerTurn_drawTurnCycle = PlayerTurn.drawTurnCycle;
	PlayerTurn.drawTurnCycle = function () {
		var mode = this.getCycleMode();

		if (mode === PlayerTurnMode.RESTARTCOMMAND) {
			this._drawRestartommand();
		} else {
			_PlayerTurn_drawTurnCycle.apply(this, arguments);
		}
	};

	var _PosSelector_movePosSelector = PosSelector.movePosSelector;
	PosSelector.movePosSelector = function () {
		if (this._isRestartMode) {
			this._isRestartMode = false;
			return PosSelectorResult.SELECT;
		}
		return _PosSelector_movePosSelector.apply(this, arguments);
	};

	var _UnitCommand_Attack__createAttackParam = UnitCommand.Attack._createAttackParam;
	UnitCommand.Attack._createAttackParam = function () {
		var attackParam = _UnitCommand_Attack__createAttackParam.apply(this, arguments);
		this.autoSave(attackParam);
		return attackParam;
	};

	var _UnitCommand_Attack__createMultipleAttackParam = UnitCommand.Attack._createMultipleAttackParam;
	UnitCommand.Attack._createMultipleAttackParam = function () {
		var attackParam = this._createAttackParam.apply(this, arguments);
		this.autoSave(attackParam);
		return _UnitCommand_Attack__createMultipleAttackParam.apply(this, arguments);
	};

	var _UnitCommand_Attack_endCommandAction = UnitCommand.Attack.endCommandAction;
	UnitCommand.Attack.endCommandAction = function () {
		_UnitCommand_Attack_endCommandAction.apply(this, arguments);
		AutoSavedControl.rollbackDificcultly();
	};

	FreeAreaScene._completeSceneMemberData = function () {
		var handle, type, map;

		if (root.getSceneController().isActivatedFromSaveFile()) {
			AutoSavedControl.loadTurnType();

			SceneManager.resetCurrentMap();
			SceneManager.setEffectAllRange(false);

			map = root.getCurrentSession().getCurrentMapInfo();
			type = root.getCurrentSession().getTurnType();
			if (type === TurnType.PLAYER) {
				handle = map.getPlayerTurnMusicHandle();
				this.getTurnObject().setAutoCursorSave(true);
			} else if (type === TurnType.ALLY) {
				handle = map.getAllyTurnMusicHandle();
			} else {
				handle = map.getEnemyTurnMusicHandle();
			}

			MediaControl.clearMusicCache();
			MediaControl.musicPlayNew(handle);

			this._processMode(FreeAreaMode.MAIN);
		} else {
			this._processMode(FreeAreaMode.TURNSTART);
		}
	};

	var _PlayerTurn__doEventEndAction = PlayerTurn._doEventEndAction;
	PlayerTurn._doEventEndAction = function () {
		_PlayerTurn__doEventEndAction.apply(this, arguments);
		if (!GameOverChecker.isGameOver()) {
			var customParameter = {
				turnType: root.getCurrentSession().getTurnType()
			};
			AutoSavedControl.register(customParameter);
		}
	};

	EnemyTurn._moveAutoAction = function () {
		if (this._autoActionArray[this._autoActionIndex].moveAutoAction() !== MoveResult.CONTINUE) {
			if (!this._countAutoActionIndex()) {
				var customParameter = {
					turnType: root.getCurrentSession().getTurnType()
				};
				AutoSavedControl.register(customParameter);
				this._changeIdleMode(EnemyTurnMode.TOP, this._getIdleValue());
			}
		}
		return MoveResult.CONTINUE;
	};

	// ある程度古いバージョン用の処理
	var _UnitCommand_Attack__startSelection = UnitCommand.Attack._startSelection;
	UnitCommand.Attack._startSelection = function (weapon) {
		if (root.getScriptVersion() > 1161) {
			_UnitCommand_Attack__startSelection.apply(this, arguments);
		}

		var unit = this.getCommandTarget();
		var filter = this._getUnitFilter();
		var indexArray = this._getIndexArray(unit, weapon);

		ItemControl.setEquippedWeapon(unit, weapon);

		this._posSelector.setUnitOnly(unit, weapon, indexArray, PosMenuType.Attack, filter);
		this._posSelector.setFirstPos();

		this.changeCycleMode(AttackCommandMode.SELECTION);
	};

	var _ScriptCall_Reset = ScriptCall_Reset;
	ScriptCall_Reset = function() {
		AutoSavedControl.resetCustomParameter();
		_ScriptCall_Reset.apply(this, arguments);
	};
})();

/*--------------------------------------------------------------------------
　ユニット選択、コマンド選択、出撃準備で自動イベント発火 ver 1.3

■作成者
キュウブ

■概要
このスクリプトを導入すると以下のタイミングで自動イベントが発生するようになります。
・マップでユニットを摘まんだ時
・ユニットを移動させてユニットコマンドが出現した時
・マップでマップコマンドを開いた時
・出撃準備コマンドが開いた時
・ユニットのステータス画面を開いた時

■使い方
起こしたい自動イベント->詳細情報->カスタムパラメータにて
以下のカスパラを記入するだけでOK。

autoEventType:<起こしたいイベントタイプの値>

イベントタイプの値は以下の通りです。
ユニットを摘まんだ時に起こしたいイベント: 0
ユニットが移動してコマンドが開いた時に起こしたいイベント: 1
出撃準備コマンドを開いた時に起こしたいイベント: 2
マップコマンドを開いた時に起こしたいイベント: 3
ユニットのステータス画面を開いた時に起こしたいイベント: 4

例えば、
autoEventType: 0
としておけばユニットを摘まんだ時に対象イベントが発生します。
※別途"ユニットを掴んだ瞬間にアクティブ化させる"プラグインを導入すれば
実行条件にアクティブ状態-ナッシュといった設定を付加して、ナッシュを摘まんだ時だけ発生するイベントを設定できます。


※※※※※※2021/3/4追記※※※※※※
ユニットのステータス画面を開いた時にもイベントが実行されるようになりました。
autoEventType: 4 で設定可能です。

さらに特定のユニットのステータス画面を開いた場合にのみイベントを起こしたい場合は、
targetUnitId: <ユニットのID>
をカスパラに追加してください。
ユニットIDはエディタに表示されているものではなく、実際のゲーム画面上で設定されているIDとなります。
自軍ユニットの場合はエディタ上のIDで問題ありませんが、
敵軍、同盟軍、ゲストなどの場合はエディタのIDに65536*nの分だけ加算する必要があります(例えば、0番の敵IDは65536、0番の同盟IDは196608となっています)。
IDを知りたい場合は"ユニット概要"コマンドでチェックしてください。

また、実行条件が何も設定されていない場合は出撃準備時にステータス画面を開いてもイベントが起こせてしまいます。
避けたい場合は「自軍ターン-1ターン目以上」といった条件を付加しておくと良いでしょう。

■更新履歴
ver 1.3 (2021/3/4)
ユニットのステータス画面を開いた時にも自動開始イベントが起こせるように対応

ver 1.2 (2021/2/24)
敵、同盟軍を掴んだ時はイベントが発火しないよう修正

※ ユニット掴んだ瞬間にアクティブ化させるプラグインでは想定外のイベントを発生を避けるため、敵、同盟をアクティブ化は制限している。
※ よって、自軍ユニットがアクティブ状態のままとなるので、敵同盟軍を掴んだ時に自軍ユニット-アクティブのイベントが発生する可能性がある。それを防止するための措置。
※ これらの制限を解除したい場合は両プラグインを改変する事。

ver 1.1 (2021/2/20)
readme更新

ver 1.0 (2021/2/19)
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
	MapSequenceAreaMode.AUTOEVENTCHECK = 200;
	MapSequenceArea._eventChecker = null;

	var alias1 = MapSequenceArea._prepareSequenceMemberData;
	MapSequenceArea._prepareSequenceMemberData = function(parentTurnObject) {
		alias1.call(this, parentTurnObject);
		this._eventChecker = createObject(UnitSelectEventChecker);
	};

	var alias2 = MapSequenceArea._completeSequenceMemberData;
	MapSequenceArea._completeSequenceMemberData = function(parentTurnObject) {
		alias2.call(this, parentTurnObject);
		this._changeEventMode();
	};

	var alias3 = MapSequenceArea.moveSequence;
	MapSequenceArea.moveSequence = function() {
		var result;
		var mode = this.getCycleMode();
		
		if (mode === MapSequenceAreaMode.AUTOEVENTCHECK) {
			result = this._moveAutoEventCheck();
		}
		else {
			result = alias3.call(this);
		}
		return result;
	};

	var alias4 = MapSequenceArea.drawSequence;
	MapSequenceArea.drawSequence = function() {
		var mode = this.getCycleMode();
		
		if (mode === MapSequenceAreaMode.AUTOEVENTCHECK) {
			this._drawAutoEventCheck();
		}
		else {
			alias4.call(this);
		}
	};

	MapSequenceArea._drawAutoEventCheck = function() {
		this._drawArea();
	};

	MapSequenceArea._moveAutoEventCheck = function() {
		if (this._eventChecker.moveEventChecker() !== MoveResult.CONTINUE) {
			this._doEventEndAction();
			MapLayer.getMarkingPanel().updateMarkingPanel();
			this.changeCycleMode(MapSequenceAreaMode.AREA);
		}
		
		return MoveResult.CONTINUE;
	};

	// スクリプトエラー対策のセーブはここで行ってはならない
	// よって、parentTurnObjectの_doEventEndActionは呼び出さずに独自で定義する
	MapSequenceArea._doEventEndAction = function() {
		if (GameOverChecker.isGameOver()) {
			GameOverChecker.startGameOver();
		}
	};

	MapSequenceArea._changeEventMode = function() {
		var result;

		if (this._targetUnit.getUnitType() !== UnitType.PLAYER) {
			this.changeCycleMode(MapSequenceAreaMode.AREA);
			return;
		}
		result = this._eventChecker.enterEventChecker(root.getCurrentSession().getAutoEventList(), EventType.AUTO);
		if (result === EnterResult.NOTENTER) {
			this._doEventEndAction();
			this.changeCycleMode(MapSequenceAreaMode.AREA);
		}
		else {
			this.changeCycleMode(MapSequenceAreaMode.AUTOEVENTCHECK);
		}
	};

	MapSequenceCommandMode.AUTOEVENTCHECK = 200;
	MapSequenceCommand._eventChecker = null;

	var alias5 = MapSequenceCommand._prepareSequenceMemberData;
	MapSequenceCommand._prepareSequenceMemberData = function(parentTurnObject) {
		alias5.call(this, parentTurnObject);
		this._eventChecker = createObject(UnitCommandEventChecker);
	};

	var alias6 = MapSequenceCommand._completeSequenceMemberData;
	MapSequenceCommand._completeSequenceMemberData = function(parentTurnObject) {
		alias6.call(this, parentTurnObject);
		this._changeEventMode();
	};

	var alias7 = MapSequenceCommand.moveSequence;
	MapSequenceCommand.moveSequence = function() {
		var result;
		var mode = this.getCycleMode();
		
		if (mode === MapSequenceAreaMode.AUTOEVENTCHECK) {
			result = this._moveAutoEventCheck();
		}
		else {
			result = alias7.call(this);
		}
		return result;
	};

	var alias8 = MapSequenceCommand.drawSequence;
	MapSequenceCommand.drawSequence = function() {
		var mode = this.getCycleMode();
		if (mode === MapSequenceAreaMode.AUTOEVENTCHECK) {
			this._unitCommandManager.drawListCommandManager();
		}
		else {
			alias8.call(this);
		}
	};

	MapSequenceCommand._moveAutoEventCheck = function() {
		if (this._eventChecker.moveEventChecker() !== MoveResult.CONTINUE) {
			this._doEventEndAction();
			MapLayer.getMarkingPanel().updateMarkingPanel();
			this.changeCycleMode(MapSequenceCommandMode.COMMAND);
		}
		
		return MoveResult.CONTINUE;
	};

	// スクリプトエラー対策のセーブはここで行ってはならない
	MapSequenceCommand._doEventEndAction = function() {
		if (GameOverChecker.isGameOver()) {
			GameOverChecker.startGameOver();
		}
	};

	MapSequenceCommand._changeEventMode = function() {
		var result;

		result = this._eventChecker.enterEventChecker(root.getCurrentSession().getAutoEventList(), EventType.AUTO);
		if (result === EnterResult.NOTENTER) {
			this._doEventEndAction();
			this.changeCycleMode(MapSequenceCommandMode.COMMAND);
		}
		else {
			this.changeCycleMode(MapSequenceCommandMode.AUTOEVENTCHECK);
		}
	};

	ListCommandManagerMode.AUTOEVENTCHECK = 200;
	SetupCommand._eventChecker = null;
	var alias9 = SetupCommand.openListCommandManager;
	SetupCommand.openListCommandManager = function() {
		alias9.call(this);
		this._eventChecker = createObject(SetupCommandEventChecker);
		this._changeEventMode();
	};

	var alias10 = SetupCommand.moveListCommandManager;
	SetupCommand.moveListCommandManager = function() {
		var result;
		var mode = this.getCycleMode();

		if (mode === ListCommandManagerMode.AUTOEVENTCHECK) {
			result = this._moveAutoEventCheck();
		}
		else {
			result = alias10.call(this);
		}
		
		return result;
	};

	var alias11 = SetupCommand.drawListCommandManager;
	SetupCommand.drawListCommandManager = function() {
		var mode = this.getCycleMode();
		
		if (mode === ListCommandManagerMode.AUTOEVENTCHECK) {
			this._drawAutoEventCheck();
		}
		else {
			alias11.call(this);
		}
	};

	SetupCommand._moveAutoEventCheck = function() {
		if (this._eventChecker.moveEventChecker() !== MoveResult.CONTINUE) {
			this._doEventEndAction();
			MapLayer.getMarkingPanel().updateMarkingPanel();
			this.changeCycleMode(ListCommandManagerMode.TITLE);

		}

		return MoveResult.CONTINUE;
	};

	SetupCommand._drawAutoEventCheck = function() {
		this._drawTitle();
	};

	SetupCommand._changeEventMode = function() {
		var result;

		result = this._eventChecker.enterEventChecker(root.getCurrentSession().getAutoEventList(), EventType.AUTO);

		if (result === EnterResult.NOTENTER) {
			this._doEventEndAction();
			this.changeCycleMode(ListCommandManagerMode.TITLE);
		}
		else {
			this.changeCycleMode(ListCommandManagerMode.AUTOEVENTCHECK);
		}
	};

	// レアケースだと思われるが、出撃準備でユニットを全滅させるような特殊なイベントを起こす人のためにここも定義しておく
	SetupCommand._doEventEndAction = function() {
		if (GameOverChecker.isGameOver()) {
			GameOverChecker.startGameOver();
		}
	};

	MapCommand._eventChecker = null;
	var alias12 = MapCommand.openListCommandManager;
	MapCommand.openListCommandManager = function() {
		alias12.call(this);
		this._eventChecker = createObject(MapCommandEventChecker);
		this._changeEventMode();
	};

	var alias13 = MapCommand.moveListCommandManager;
	MapCommand.moveListCommandManager = function() {
		var result;
		var mode = this.getCycleMode();

		if (mode === ListCommandManagerMode.AUTOEVENTCHECK) {
			result = this._moveAutoEventCheck();
		}
		else {
			result = alias13.call(this);
		}
		
		return result;
	};

	var alias14 = SetupCommand.drawListCommandManager;
	MapCommand.drawListCommandManager = function() {
		var mode = this.getCycleMode();
		
		if (mode === ListCommandManagerMode.AUTOEVENTCHECK) {
			this._drawAutoEventCheck();
		}
		else {
			alias14.call(this);
		}
	};

	MapCommand._moveAutoEventCheck = function() {
		if (this._eventChecker.moveEventChecker() !== MoveResult.CONTINUE) {
			this._doEventEndAction();
			MapLayer.getMarkingPanel().updateMarkingPanel();
			this.changeCycleMode(ListCommandManagerMode.TITLE);

		}

		return MoveResult.CONTINUE;
	};

	MapCommand._drawAutoEventCheck = function() {
		this._drawTitle();
	};

	MapCommand._changeEventMode = function() {
		var result;

		result = this._eventChecker.enterEventChecker(root.getCurrentSession().getAutoEventList(), EventType.AUTO);

		if (result === EnterResult.NOTENTER) {
			this._doEventEndAction();
			this.changeCycleMode(ListCommandManagerMode.TITLE);
		}
		else {
			this.changeCycleMode(ListCommandManagerMode.AUTOEVENTCHECK);
		}
	};

	// スクリプトエラー対策のセーブはここで行ってはならない
	MapCommand._doEventEndAction = function() {
		if (GameOverChecker.isGameOver()) {
			GameOverChecker.startGameOver();
		}
	};

	EventChecker._checkEvent = function() {
		var i, count, event, result;
		
		count = this._eventArray.length;
		for (i = this._eventIndex; i < count; i++) {
			this._eventIndex++;
			event = this._eventArray[i];
			
			if (
				event !== null &&
				this._isTargetAutoEventType(event) &&
				event.isEvent() &&
				event.getExecutedMark() === EventExecutedType.FREE
			) {
				if (this._isAllSkipEnabled) {
					root.setEventSkipMode(true);
				}

				// 1.161より後のいずれかのバージョンから_isSessionEnabledが加わっているので一応こう書いておく
				// ここでエラー起きてたらこのif文全部消しといてください
				if (root.getScriptVersion() > 1161 && !this._isSessionEnabled()) {
					continue;
				}
				
				result = this._capsuleEvent.enterCapsuleEvent(event, true);
				if (result === EnterResult.OK) {
					return EnterResult.OK;
				}
			}
		}
		
		return EnterResult.NOTENTER;
	};

	UnitMenuMode.AUTOEVENTCHECK = 200;
	UnitMenuScreen._eventChecker = null;
	var alias15 = UnitMenuScreen._prepareScreenMemberData;
	UnitMenuScreen._prepareScreenMemberData = function(screenParam) {
		this._eventChecker = createObject(UnitMenuEventChecker);
		alias15.call(this, screenParam);
	};

	var alias16 = UnitMenuScreen._completeScreenMemberData;
	UnitMenuScreen._completeScreenMemberData = function(screenParam) {
		alias16.call(this, screenParam);
		this._changeEventMode();
	};

	var alias17 = UnitMenuScreen.moveScreenCycle;
	UnitMenuScreen.moveScreenCycle = function() {
		var mode = this.getCycleMode();
		var result = MoveResult.CONTINUE;

		if (mode === UnitMenuMode.AUTOEVENTCHECK) {
			this._moveAnimation();
			result = this._moveAutoEventCheck();
		}
		else {
			result = alias17.call(this);
		}
		
		return result;
	};

	var alias18 = UnitMenuScreen._setNewTarget;
	UnitMenuScreen._setNewTarget = function(unit) {
		alias18.call(this, unit);
		this._changeEventMode();
	};

	UnitMenuScreen._moveAutoEventCheck = function() {
		if (this._eventChecker.moveEventChecker() !== MoveResult.CONTINUE) {
			this._doEventEndAction();
			MapLayer.getMarkingPanel().updateMarkingPanel();
			this.changeCycleMode(UnitMenuMode.TOP);
		}

		return MoveResult.CONTINUE;
	};

	// スクリプトエラー対策のセーブはここでは行わない
	// 念の為、ゲームオーバー判定を入れるがここのイベントでユニットロスト処理を入れる事は望ましくない
	UnitMenuScreen._doEventEndAction = function() {
		if (GameOverChecker.isGameOver()) {
			GameOverChecker.startGameOver();
		}
	};

	UnitMenuScreen._changeEventMode = function() {
		var result;

		this._eventChecker.setTargetUnit(this._unit);
		result = this._eventChecker.enterEventChecker(root.getCurrentSession().getAutoEventList(), EventType.AUTO);

		if (result === EnterResult.NOTENTER) {
			this._doEventEndAction();
			this.changeCycleMode(UnitMenuMode.TOP);
		}
		else {
			this.changeCycleMode(UnitMenuMode.AUTOEVENTCHECK);
		}
	};
})();

var AutoEventType = {
	UNIT_SELECT: 0,
	UNIT_COMMAND: 1,
	SETUP_COMMAND: 2,
	MAP_COMMAND: 3,
	UNITMENU_COMMAND: 4
};

EventChecker._isTargetAutoEventType = function(event) {
	return !('autoEventType' in event.custom);
};

var UnitSelectEventChecker = defineObject(EventChecker,
{
	_isTargetAutoEventType: function(event) {
		return event.custom.autoEventType === AutoEventType.UNIT_SELECT;
	}
}
);

var UnitCommandEventChecker = defineObject(EventChecker,
{
	_isTargetAutoEventType: function(event) {
		return event.custom.autoEventType === AutoEventType.UNIT_COMMAND;
	}
}
);

var SetupCommandEventChecker = defineObject(EventChecker,
{
	_isTargetAutoEventType: function(event) {
		return event.custom.autoEventType === AutoEventType.SETUP_COMMAND;
	}
}
);

var MapCommandEventChecker = defineObject(EventChecker,
{
	_isTargetAutoEventType: function(event) {
		return event.custom.autoEventType === AutoEventType.MAP_COMMAND;
	}
}
);

var UnitMenuEventChecker = defineObject(EventChecker,
{
	_targetUnit: null,

	setTargetUnit: function(unit) {
		this._targetUnit = unit;
	},

	_isTargetAutoEventType: function(event) {
		var isTargetUnit = true;

		if (typeof event.custom.targetUnitId === 'number' && this._targetUnit) {
			isTargetUnit = this._targetUnit.getId() === event.custom.targetUnitId;
		}

		return isTargetUnit && event.custom.autoEventType === AutoEventType.UNITMENU_COMMAND;
	}
}
);
/*--------------------------------------------------------------------------
　ユニット選択スクリプト ver 1.0

■作成者
キュウブ

■概要
ユニット一覧画面が出る。
ユニットを選択すると変数にユニットIDが放り込まれる。

■使い方
1.SelectedUnitIdVariableSettingにユニットIDを保存するための変数を設定する
2.イベントコマンド->スクリプトの実行で"UnitSelectCommand"を実行する


■更新履歴
ver 1.0 (2022/5/21)
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

// ユニットIDを格納するための変数
var SelectedUnitIdVariableSetting = {
	TABLE_INDEX: 5, // 一番右端のID用のテーブル
	ID: 0 // ここに変数のIDを入れる
};

(function () {
	var alias1 = ScriptExecuteEventCommand._configureOriginalEventCommand;
	ScriptExecuteEventCommand._configureOriginalEventCommand = function (
		groupArray
	) {
		alias1.call(this, groupArray);
		groupArray.appendObject(UnitSelectCommand);
	};

	var UnitSelectCommand = defineObject(BaseEventCommand, {
		_unitSelectScreen: null,
		_isSelection: null,
		_effectiveIndex: -1,

		enterEventCommandCycle: function () {
			this._prepareEventCommandMemberData();
			return this._completeEventCommandMemberData();
		},

		moveEventCommandCycle: function () {
			var targetUnitList;

			if (this._unitSelectScreen.moveScreenCycle() === MoveResult.END) {
				this._setUnit(this._unitSelectScreen.getResurrectionUnit());

				return MoveResult.END;
			}

			return MoveResult.CONTINUE;
		},

		_setUnit: function (targetUnit) {
			variableTable = root
				.getMetaSession()
				.getVariableTable(SelectedUnitIdVariableSetting.TABLE_INDEX);
			variableTable.setVariable(
				variableTable.getVariableIndexFromId(
					SelectedUnitIdVariableSetting.ID
				),
				targetUnit.getId()
			);
		},

		drawEventCommandCycle: function () {
			this._unitSelectScreen.drawScreenCycle();
		},

		getEventCommandName: function () {
			return "UnitSelectCommand";
		},

		getEventCommmandName: function () {
			return "UnitSelectCommand";
		},
		isEventCommandSkipAllowed: function () {
			return false;
		},

		_prepareEventCommandMemberData: function () {
			this._unitSelectScreen = createObject(UnitSelectCommandScreen);
		},

		_completeEventCommandMemberData: function () {
			var screenParam = this._createScreenParam();
			this._unitSelectScreen.setScreenData(screenParam);
			return EnterResult.OK;
		},

		_createScreenParam: function () {
			var screenParam = ScreenBuilder.buildResurrection();
			screenParam.effectiveIndex = this._effectiveIndex;
			return screenParam;
		}
	});

	var UnitSelectCommandScreen = defineObject(ResurrectionScreen, {
		_effectiveIndex: -1,

		_combineDeathList: function (screenParam) {
			var arr = PlayerList.getAliveList();
			var list = StructureBuilder.buildDataList();
			list.setDataArray(arr);
			return list;
		},

		_prepareScreenMemberData: function (screenParam) {
			this._unitList = PlayerList.getAliveList();
			this._selectUnit = null;
			this._leftWindow = createWindowObject(UnitSelectCommandWindow, this);
			this._unitMenuTopWindow = createWindowObject(UnitMenuTopWindow, this);
			this._unitMenuBottomWindow = createWindowObject(
				UnitMenuBottomWindow,
				this
			);
			this._questionWindow = createWindowObject(QuestionWindow, this);
			this._infoWindow = createWindowObject(InfoWindow, this);
			this._effectiveIndex = screenParam.effectiveIndex;
		},

		_completeScreenMemberData: function (screenParam) {
			if (this._unitList.getCount() > 0) {
				this._leftWindow.setResurrectionList(this._unitList);
				this._questionWindow.setQuestionMessage("このユニットを選択しますか？");
				this._unitMenuTopWindow.setUnitMenuData();
				this._unitMenuBottomWindow.setUnitMenuData();
				this._setMenuUnit(0);

				this.changeCycleMode(ResurrectionScreenMode.TOP);
			}
		},

		_moveTop: function () {
			var recentlyInput;
			var result = MoveResult.CONTINUE;
			var input = this._leftWindow.moveWindow();

			if (input === ScrollbarInput.SELECT) {
				this._leftWindow.enableSelectCursor(false);
				this._questionWindow.setQuestionActive(true);
				this._unitMenuBottomWindow.lockTracing(true);
				this.changeCycleMode(ResurrectionScreenMode.CHECK);
			} else if (input === ScrollbarInput.NONE) {
				recentlyInput = this._leftWindow.getRecentlyInputType();
				if (
					recentlyInput === InputType.LEFT ||
					recentlyInput === InputType.RIGHT
				) {
					this._setHelpMode();
				} else {
					if (this._leftWindow.isIndexChanged()) {
						this._setMenuUnit(this._leftWindow.getUnitListIndex());
					}
				}
			}

			return result;
		}
	});

	var UnitSelectCommandWindow = defineObject(ResurrectionListWindow, {
		_scrollbar: null,
		_unitList: null,

		setResurrectionList: function (unitList) {
			this._unitList = unitList;

			this._scrollbar = createScrollbarObject(
				UnitSelectCommandListScrollbar,
				this
			);
			this._scrollbar.setScrollFormation(1, 9);
			this._scrollbar.setDataList(unitList);
			this._scrollbar.setActive(true);
		}
	});

	var UnitSelectCommandListScrollbar = defineObject(ResurrectionListScrollbar, {
		playSelectSound: function () {
			MediaControl.soundDirect("commandselect");
		}
	});
})();

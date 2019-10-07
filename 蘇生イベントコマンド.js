/*--------------------------------------------------------------------------
　蘇生イベントコマンド ver 1.0

■作成者
キュウブ

■概要
イベントコマンドから蘇生を実行できるようになります。

■仕様
・アイテム版とは異なり、蘇生されたユニットは非出撃ユニットとして控えに移動します(OP,EDイベントなどでの使用も検討した結果)
・蘇生画面に移動したらキャンセルはできません。誰かを必ず蘇生させる事になります。キャンセルを有効にしたい場合は121-146行目の_moveTopを消してください。

■使い方
イベントコマンド->スクリプト実行->イベントコマンド呼び出し　で
オブジェクト名に"ResurrectionCommand"と記載する。


■更新履歴
ver 1.0 (2019/10/7)

初版作成
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

(function() {
	var alias1 = ScriptExecuteEventCommand._configureOriginalEventCommand;
	ScriptExecuteEventCommand._configureOriginalEventCommand = function(groupArray) {
		alias1.call(this, groupArray);
		groupArray.appendObject(ResurrectionCommand);
	};

	var ResurrectionCommand = defineObject(BaseEventCommand,
	{
		_resurrectionScreen: null,
		_isSelection: null,
		_targetUnit: null, 

		enterEventCommandCycle: function() {
			this._prepareEventCommandMemberData();
		
			if (!this._checkEventCommand()) {
				return EnterResult.NOTENTER;
			}
		
			return this._completeEventCommandMemberData();
		},

		moveEventCommandCycle: function() {
			var targetUnit;

			if (this._resurrectionScreen.moveScreenCycle() === MoveResult.END) {
				targetUnit = this._resurrectionScreen.getResurrectionUnit();
			
				if (targetUnit !== null) {
					targetUnit.setAliveState(AliveType.ALIVE);
					targetUnit.setHp(ParamBonus.getMhp(targetUnit));
				}

				return MoveResult.END;
			}

			return MoveResult.CONTINUE;
		},

		drawEventCommandCycle: function() {
			this._resurrectionScreen.drawScreenCycle();
		},
	
		getEventCommmandName: function() {
			return 'ResurrectionCommand';
		},
		isEventCommandSkipAllowed: function() {
			return false;
		},

		_prepareEventCommandMemberData: function() {
			this._resurrectionScreen = createObject(ResurrectionCommandScreen);
		},

		_checkEventCommand: function() {
			return true;
		},
	
		_completeEventCommandMemberData: function() {
			var screenParam = this._createScreenParam();

			this._resurrectionScreen.setScreenData(screenParam);
			return EnterResult.OK;
		},
	
		_createScreenParam: function() {
			var screenParam = ScreenBuilder.buildResurrection();
			return screenParam;
		}	
	}
	);

	var ResurrectionCommandScreen = defineObject(ResurrectionScreen,
	{
		_combineDeathList: function(screenParam) {
			var arr = ResurrectionControl.getPlayerTargetArray();
			var list = StructureBuilder.buildDataList();
		
			list.setDataArray(arr);
		
			return list;
		},

		// 蘇生キャンセルを消去(キャンセル機能を消去したくない時は_moveTopを丸ごと消せばよい)
		_moveTop: function() {
			var recentlyInput;
			var result = MoveResult.CONTINUE;
			var input = this._leftWindow.moveWindow();
		
			if (input === ScrollbarInput.SELECT) {
				this._leftWindow.enableSelectCursor(false);
				this._questionWindow.setQuestionActive(true);

				this._unitMenuBottomWindow.lockTracing(true);
				this.changeCycleMode(ResurrectionScreenMode.CHECK);
			}
			else if (input === ScrollbarInput.NONE) {
				recentlyInput = this._leftWindow.getRecentlyInputType();
				if (recentlyInput === InputType.LEFT || recentlyInput === InputType.RIGHT) {
					this._setHelpMode();
				}
				else {
					if (this._leftWindow.isIndexChanged()) {
						this._setMenuUnit(this._leftWindow.getUnitListIndex());
					}
				}
			}
		
			return result;
		}
	}
	);

	// getTargetArray を使用するアイテムやユニットが無くても動作するように修正したもの 
	ResurrectionControl.getPlayerTargetArray = function() {
		var i, j, count, list, targetUnit;
		var filter = FilterControl.getBestFilter(UnitType.PLAYER, UnitFilterFlag.PLAYER);
		var listArray =  FilterControl.getDeathListArray(filter);
		var listCount = listArray.length;
		var arr= [];
		
		for (i = 0; i < listCount; i++) {
			list = listArray[i];
			count = list.getCount();
			for (j = 0; j < count; j++) {
				targetUnit = list.getData(j);		
				arr.push(targetUnit);
			}
		}
		
		return arr;
	}
})();
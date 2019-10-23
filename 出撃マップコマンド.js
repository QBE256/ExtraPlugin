/*--------------------------------------------------------------------------
自軍出撃マップコマンド ver1.0

■作成者
キュウブ

■概要
特定のマス目でマップコマンドから追加でユニットを出撃させる事ができるようになります。
要は聖戦っぽい出撃方式になる。

■使い方
・マップコマンドを追加したい地形に対してカスパラで"reinforce_request_command:true"を設定しておく
・あとは設定した地形を配置するだけ


■更新履歴
ver1.0 2019/10/23
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

(function() {

	var alias1 = MapCommand.configureCommands;
	MapCommand.configureCommands = function(groupArray) {
		alias1.call(this, groupArray);
	
		groupArray.insertObject(MapCommand.ReinforcementRequest, groupArray.length - 1);
	};

	MapCommand.ReinforcementRequest = defineObject(BaseListCommand,
	{
		_resurrectionScreen: null,
	
		openCommand: function() {
			var screenParam = this._createScreenParam();

			this._resurrectionScreen = createObject(ReinforcementRequestScreen);
			SceneManager.addScreen(this._resurrectionScreen, screenParam);
		},
	
		moveCommand: function() {
			if (SceneManager.isScreenClosed(this._resurrectionScreen)) {
				if (this._resurrectionScreen.getResurrectionUnit()) {
					var unit = this._resurrectionScreen.getResurrectionUnit();
					unit.setSortieState(SortieType.SORTIE);
					unit.setMapX(root.getCurrentSession().getMapCursorX());
					unit.setMapY(root.getCurrentSession().getMapCursorY());
					
					this._listCommandManager.rebuildCommandEx();
				}
				return MoveResult.END;
			}

			return MoveResult.CONTINUE;
		},

        isCommandDisplayable: function() {
        	var cursorX = root.getCurrentSession().getMapCursorX();
        	var cursorY = root.getCurrentSession().getMapCursorY();
			var terrain = PosChecker.getTerrainFromPos(cursorX, cursorY);
			var unit = PosChecker.getUnitFromPos(cursorX, cursorY);

			if (terrain.custom.reinforce_request_command === true && !unit) {		
				return true;
			} 
			else {
				return false;
			}
        },
	
		drawCommand: function() {
		},
	
		getCommandName: function() {
			return '出撃選択';
		},

        _createScreenParam: function() {
			var screenParam = ScreenBuilder.buildResurrection();
		
			screenParam.filter = UnitFilterFlag.PLAYER;
		
			return screenParam;
        }
	}
	);

	var ReinforcementRequestScreen = defineObject(ResurrectionScreen,
	{
		getScreenTitleName: function() {
			return 'ユニット出撃';
		},
	
		_combineDeathList: function(screenParam) {
			var i, j, count, list;
			var listArray = FilterControl.getNotSortieListArray(screenParam.filter);
			var listCount = listArray.length;
			var arr = [];

			for (i = 0; i < listCount; i++) {
				list = listArray[i];
				count = list.getCount();
				for (j = 0; j < count; j++) {
					arr.push(list.getData(j));
				}
			}
	
			list = StructureBuilder.buildDataList();
			list.setDataArray(arr);
		
			return list;
		},

		_completeScreenMemberData: function(screenParam) {
			if (this._unitList.getCount() > 0) {
				this._leftWindow.setResurrectionList(this._unitList);
				this._questionWindow.setQuestionMessage("このユニットを出撃させますか？");
				this._unitMenuTopWindow.setUnitMenuData();
				this._unitMenuBottomWindow.setUnitMenuData();

				this._setMenuUnit(0);

				this.changeCycleMode(ResurrectionScreenMode.TOP);
			}
			else {
				this._infoWindow.setInfoMessage("控えのユニットがいません");
				this.changeCycleMode(ResurrectionScreenMode.EMPTY);
			}
		}	
	}
	);

	FilterControl.getNotSortieListArray = function(filter) {
		var listArray = [];

		if (filter & UnitFilterFlag.PLAYER) {
			listArray.push(PlayerList.getNotSortieList());
		}
		
		return listArray;	
	};

	PlayerList.getNotSortieList = function() {
		return AllUnitList.getNotSortieList(this.getMainList());
	};


	AllUnitList.getNotSortieList= function(list) {
		var funcCondition = function(unit) {
			return unit.getAliveState() === AliveType.ALIVE && unit.getSortieState() === SortieType.UNSORTIE;
		};
		
		return this.getList(list, funcCondition);
	};

})();
/*--------------------------------------------------------------------------
　カスタムパラメータ等の可視化 ver 1.0

■作成者
キュウブ

■概要
このプラグインを導入すると、以下の機能が追加されます。

1.ユニット概要コマンド上で決定キーを押すと、対象ユニットのカスタムパラメータが確認できるようになる

2.(テストプレイ時のみ)拠点、出撃準備、マップコマンドにおいて、下記のコマンドが加わる。
Env List: 環境パラメータ(環境ファイルに保存されるenvパラメータ)が確認できる
Global List: グローバルパラメータ(root.getMetaSession().global)が確認できる


各種パラメータがゲーム進行中に想定通りの値に更新されているか確認するためのプラグインとなります。

※武器、マップ、ステート等のカスタムパラメータはゲーム進行に応じて、更新するようなものではないと思われるので対応していません

■更新履歴
ver 1.0 (2021/02/12)
初版公開

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
	var alias1 = CommandMixer.mixCommand;
	CommandMixer.mixCommand = function(index, groupArray, baseObject) {
		alias1.call(this, index, groupArray, baseObject);

		if (index !== CommandLayoutType.TITLE) {
			this.pushCommand(MapCommand.ShowEnvParameter, CommandActionType.SHOWENVPARAMETER);
			this.pushCommand(MapCommand.ShowGlobalParameter, CommandActionType.SHOWGLOBALPARAMETER);

			groupArray.appendObject(this._getObjectFromActionType(CommandActionType.SHOWENVPARAMETER));
			groupArray[groupArray.length - 1].setScreenLauncher(EnvParameterScreenLauncher);
			groupArray.appendObject(this._getObjectFromActionType(CommandActionType.SHOWGLOBALPARAMETER));
			groupArray[groupArray.length - 1].setScreenLauncher(GlobalParameterScreenLauncher);
		}
	};

	var UnitSummaryWindowMode = {
		UNIT_LIST: 0,
		CUSTOM_PARAMETER_LIST: 1
	};

	UnitSummaryWindow._unitCustomParameterScrollbar = null;

	var alias2 = UnitSummaryWindow.setSummaryWindowData;
	UnitSummaryWindow.setSummaryWindowData = function() {
		this.changeCycleMode(UnitSummaryWindowMode.UNIT_LIST);
		this._unitCustomParameterScrollbar = createScrollbarObject(ObjectParameterScrollbar, this);
		this._unitCustomParameterScrollbar.setScrollFormation(1, 10);
		this._unitCustomParameterScrollbar.setActive(true);
		alias2.call(this);
	};

	var alias3 = UnitSummaryWindow.moveWindowContent;
	UnitSummaryWindow.moveWindowContent = function() {
		var mode = this.getCycleMode();
		var result = MoveResult.END;

		if (mode === UnitSummaryWindowMode.UNIT_LIST) {
			if (InputControl.isSelectAction()) {
				this.changeCycleMode(UnitSummaryWindowMode.CUSTOM_PARAMETER_LIST);
				this._createUnitCustomParameterScrollbar();
				result = MoveResult.CONTINUE;
			}
			else {
				result = alias3.call(this);
			}
		}
		else if (mode === UnitSummaryWindowMode.CUSTOM_PARAMETER_LIST) {
			this._unitCustomParameterScrollbar.moveInput();
			if (InputControl.isCancelAction()) {
				this.changeCycleMode(UnitSummaryWindowMode.UNIT_LIST);
			}

			result = MoveResult.CONTINUE;
		}

		return result;
	};

	var alias4 = UnitSummaryWindow.drawWindowContent;
	UnitSummaryWindow.drawWindowContent = function(x, y) {
		var mode = this.getCycleMode();
		if (mode === UnitSummaryWindowMode.UNIT_LIST) {
			alias4.call(this, x, y);
		}
		else if (mode === UnitSummaryWindowMode.CUSTOM_PARAMETER_LIST) {
			this._unitCustomParameterScrollbar.drawScrollbar(x, y);
		}
	};

	UnitSummaryWindow._createUnitCustomParameterScrollbar = function() {
		var unit = this._scrollbar.getObject();
		var data = [{key: "Name", value:unit.getName()}, {key:"custom", value:null}];
		createObjectEntryList(unit.custom, data, 1);
		this._unitCustomParameterScrollbar.setObjectArray(data);
	};

	var alias5 = UnitSummaryWindow.setSummaryPage;
	UnitSummaryWindow.setSummaryPage = function(unitList) {
		alias5.call(this, unitList);
		this._createUnitCustomParameterScrollbar();
	};
})();

CommandActionType.SHOWENVPARAMETER = 501;
CommandActionType.SHOWGLOBALPARAMETER = 502;

MapCommand.ShowEnvParameter = defineObject(BaseListCommand,
{
	_screen: null,
	openCommand: function() {
		if (root.getBaseScene() === SceneType.FREE) {
			this._saveCursor();
		}
		this._screen = createObject(EnvParameterScreen);
		SceneManager.addScreen(this._screen, {});
	},
	
	moveCommand: function() {
		if (SceneManager.isScreenClosed(this._screen)) {
			return MoveResult.END;
		}
		
		return MoveResult.CONTINUE;
	},
	
	isSelectable: function() {
		return root.isTestPlay();
	},
	
	_saveCursor: function() {
		var playerTurnObject = SceneManager.getActiveScene().getTurnObject();
		
		playerTurnObject.setAutoCursorSave(false);
	},

	getCommandName: function() {
		return "Env List";
	},

	setScreenLauncher: function(screenLauncher) {
		this._screenLauncher = createObject(screenLauncher);
	}
});

MapCommand.ShowGlobalParameter = defineObject(MapCommand.ShowEnvParameter,
{
	openCommand: function() {
		if (root.getBaseScene() === SceneType.FREE) {
			this._saveCursor();
		}
		this._screen = createObject(GlobalParameterScreen);
		SceneManager.addScreen(this._screen, {});
	},

	getCommandName: function() {
		return "Global List";
	}
});

var EnvParameterScreenLauncher = defineObject(BaseScreenLauncher,
{
	_getScreenObject: function() {
		return EnvParameterScreen;
	}
}
);

var GlobalParameterScreenLauncher = defineObject(BaseScreenLauncher,
{
	_getScreenObject: function() {
		return GlobalParameterScreen;
	}
}
);

var EnvParameterScreen = defineObject(BaseScreen,
{
	_window: null,
	
	setScreenData: function(screenParam) {
		this._prepareScreenMemberData(screenParam);
		this._completeScreenMemberData(screenParam);
	},
	
	moveScreenCycle: function() {
		return this._window.moveWindow();
	},
	
	drawScreenCycle: function() {
		var x = LayoutControl.getCenterX(-1, this._window.getWindowWidth());
		var y = LayoutControl.getCenterY(-1, this._window.getWindowHeight());
		
		this._window.drawWindow(x, y);
	},
	
	_prepareScreenMemberData: function(screenParam) {
		this._window = createWindowObject(ObjectParameterWindow, this);
	},
	
	_completeScreenMemberData: function(screenParam) {
		var data = [{key:"env", value:null}];
		createObjectEntryList(root.getExternalData().env, data, 0);
		this._window.setEnvParameterWindowData();
		this._window.setCustomParameter(data);
	}
}
);

var GlobalParameterScreen = defineObject(EnvParameterScreen,
{	
	_completeScreenMemberData: function(screenParam) {
		var data = [{key:"global", value: null}];
		createObjectEntryList(root.getMetaSession().global, data, 0);
		this._window.setEnvParameterWindowData();
		this._window.setCustomParameter(data);
	}
}
);

var ObjectParameterWindow = defineObject(BaseWindow,
{
	_scrollbar: null,
	
	setEnvParameterWindowData: function() {
		var count = LayoutControl.getObjectVisibleCount(DefineControl.getTextPartsHeight(), 12);
		this._scrollbar = createScrollbarObject(ObjectParameterScrollbar, this);
		this._scrollbar.setActive(true);
		this._scrollbar.setScrollFormation(1, count);
	},

	setCustomParameter: function(objectArray) {
		this._scrollbar.setObjectArray(objectArray);
	},
	
	moveWindowContent: function() {
		var input = this._scrollbar.moveInput();
		var result = MoveResult.CONTINUE;
		
		if (input === ScrollbarInput.CANCEL) {
			result = MoveResult.END;
		}
		
		return result;
	},
	
	drawWindowContent: function(x, y) {
		this._scrollbar.drawScrollbar(x, y);
	},
	
	getWindowWidth: function() {
		return this._scrollbar.getScrollbarWidth() + (this.getWindowXPadding() * 2);
	},
	
	getWindowHeight: function() {
		return this._scrollbar.getScrollbarHeight() + (this.getWindowYPadding() * 2);
	}
}
);

var ObjectParameterScrollbar = defineObject(BaseScrollbar,
{
	drawScrollContent: function(x, y, object, isSelect, index) {
		this._drawKey(x, y, object, isSelect, index);
		this._drawValue(x, y, object, isSelect, index);
	},
	
	getObjectWidth: function() {
		return 400;
	},
	
	getObjectHeight: function() {
		return DefineControl.getTextPartsHeight();
	},
	
	_drawKey: function(x, y, object, isSelect, index) {
		var length = this._getTextLength();
		var textui = this.getParentTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		
		x += GraphicsFormat.ICON_WIDTH;
		TextRenderer.drawKeywordText(x, y, object.key, length, color, font);
	},
	
	_drawValue: function(x, y, object, isSelect, index) {
		var textui = this.getParentTextUI();
		var color = ColorValue.KEYWORD;
		var font = textui.getFont();
		
		x += (this.getObjectWidth() - 100);
		TextRenderer.drawKeywordText(x, y, object.value, -1, color, font);
	},
	
	_getTextLength: function() {
		return this.getObjectWidth();
	}
}
);

var createObjectEntryList = function(object, data, pointer) {
	if (typeof object !== 'function' && (typeof object !== 'object' || object === null)) {
		// nullは描画時にエラーが発生してしまうのでString型にする
		data[pointer].value = object === null ? "null" : object;
		return;
	}

	var temp = data[pointer].key;
	var entries = Object.entries(object);

	if (entries.length <= 0) {
		// 何も定義されてない場合は"UNDEFINED"と描画する
		data[pointer].value = "UNDEFINED";
		return;
	}

	for (var index = 0; index < entries.length; index++) {
		if (entries[index]) {
			data[pointer].key += "." + entries[index][0];
			createObjectEntryList(entries[index][1], data, pointer);
		}
		else {
			// nullは描画時にエラーが発生してしまうのでString型にする
			data[pointer].value = object === null ? "null" : object;
		}

		if (index < entries.length - 1) {
			data.push({key: temp, value: "null"});
			pointer = data.length - 1;
		}
	}
};

// Object.keys poliyfil
// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
	Object.keys = (function() {
		var hasOwnProperty = Object.prototype.hasOwnProperty,
			hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
			dontEnums = [
				'toString',
				'toLocaleString',
				'valueOf',
				'hasOwnProperty',
				'isPrototypeOf',
				'propertyIsEnumerable',
				'constructor'
			],
			dontEnumsLength = dontEnums.length;

		return function(obj) {
			if (typeof obj !== 'function' && (typeof obj !== 'object' || obj === null)) {
				throw new TypeError('Object.keys called on non-object');
			}

			var result = [], prop, i;

			for (prop in obj) {
				if (hasOwnProperty.call(obj, prop)) {
					result.push(prop);
				}
			}

			if (hasDontEnumBug) {
				for (i = 0; i < dontEnumsLength; i++) {
					if (hasOwnProperty.call(obj, dontEnums[i])) {
						result.push(dontEnums[i]);
					}
				}
			}
			return result;
		};
	}());
}

// Object.entries poliyfil
// From https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Object/entries#polyfill
if (!Object.entries) {
	Object.entries = function( obj ) {
		var ownProps = Object.keys( obj ),
			i = ownProps.length,
			resArray = new Array(i); // preallocate the Array
		while (i--)
			resArray[i] = [ownProps[i], obj[ownProps[i]]];

		return resArray;
	};
}
/*--------------------------------------------------------------------------
　ユニット説明文をスクロールさせる ver 1.0

■作成者
キュウブ

■概要
ユニットの説明文が一行で収まりきらない程長い場合は
うまい具合に切り取ってスクロール表示してくれるようになります。

※ユニットの説明文だけでアイテムやスキルの説明文には対応しておりません。

■使い方
ユニットの紹介文に長い文章を入力すれば良いわけですが、
UIのオプション設定で上限を変える必要があります。

面倒な場合はユニットのカスパラに{extraDescription:<長い紹介文>}を設定してください。
カスパラで設定された文章が表示されるようになります。

■更新履歴
ver1.0 2020/06/12
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

--------------------------------------------------------------------------*/

(function(){
	UnitMenuScreen._helpTextScrollCounter = null;
	UnitMenuScreen._helpTextScrollStart = 0;
	UnitMenuScreen._isHelpTextScrollEnd = true;
	UnitMenuScreen._helpTextScrollStopCounter = null;
	var alias1 = UnitMenuScreen._prepareScreenMemberData;
	UnitMenuScreen._prepareScreenMemberData = function(screenParam) {
		alias1.call(this, screenParam);
		this._helpTextScrollCounter = createObject(CycleCounter);
		this._helpTextScrollCounter.setCounterInfo(20);
		this._helpTextScrollCounter.disableGameAcceleration();
		this._helpTextScrollStopCounter = createObject(CycleCounter);
		this._helpTextScrollStopCounter.setCounterInfo(60);
		this._helpTextScrollStopCounter.disableGameAcceleration();
		this._isHelpTextScrollEnd = true;
	};

	var alias2 = UnitMenuScreen.moveScreenCycle;
	UnitMenuScreen.moveScreenCycle = function() {
		if (this.getCycleMode() === UnitMenuMode.TOP) {
			if (this._isHelpTextScrollEnd === false && this._helpTextScrollCounter.moveCycleCounter() !== MoveResult.CONTINUE) {
				this._helpTextScrollStart++;
			}

			if (this._isHelpTextScrollEnd === true && this._helpTextScrollStopCounter.moveCycleCounter() !== MoveResult.CONTINUE) {
				if (this._helpTextScrollStart > 0) {
					this._helpTextScrollStart = 0;
				}
				else {
					this._isHelpTextScrollEnd = false;
				}
			}
		}

		return alias2.call(this);
	};

	UnitMenuScreen._initHelpTextScroll = function() {
		this._isHelpTextScrollEnd = true;
		this._helpTextScrollStart = 0;
		this._helpTextScrollCounter.resetCounterValue();	
		this._helpTextScrollStopCounter.resetCounterValue();
	};

	UnitMenuScreen.drawScreenBottomText = function(textui) {
		var text;
		var index = this._activePageIndex;
		
		if (this._topWindow.isTracingHelp()) {
			text = this._topWindow.getHelpText();
		}
		else if (this._bottomWindowArray[index].isHelpMode() || this._bottomWindowArray[index].isTracingHelp()) {
			text = this._bottomWindowArray[index].getHelpText();
		}
		else {
			text = typeof this._unit.custom.extraDescription === 'string' ? this._unit.custom.extraDescription : this._unit.getDescription();
		}

		TextRenderer.drawScreenBottomText(this._cutBottomText(text, textui), textui);
	};

	UnitMenuScreen._cutBottomText = function(text, textui) {
		var i, textLength, cutText;
		var drawMaxLength = UIFormat.SCREENFRAME_WIDTH - (65 * 2);

		textLength = root.getGraphicsManager().getTextWidth(text, textui.getFont());

		if (textLength > drawMaxLength) {
			for (i = text.length; i > 0; i--) {
				cutText = text.substr(this._helpTextScrollStart, i);
				if (root.getGraphicsManager().getTextWidth(cutText, textui.getFont()) <= drawMaxLength) {
					if (i === text.length) {
						this._isHelpTextScrollEnd = true;
					}
					return cutText;
				}
			}
		}

		return text;		
	};

	var alias3 = UnitMenuScreen._setNewTarget;
	UnitMenuScreen._setNewTarget = function(unit) {
		this._initHelpTextScroll();
		alias3.call(this, unit);
	};
})();
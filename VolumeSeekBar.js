/*--------------------------------------------------------------------------
　音量調節機能をバーに変更する ver 1.0

■作成者
キュウブ

■概要
このスクリプトを導入すると
環境設定のBGM、SE、ボイスの音量調節機能が5段階の選択式から101段階のバーに変更されます。

※注意※
デフォルトの音量75%が本スクリプトの音量99%、50%が98%、25%が97%、0%が96%に相当するので、
スクリプトを導入してから初めて環境設定を開いた場合は若干挙動が怪しくなるかもしれません

※仕様
マウスには対応していません。左右キーでのみ調節可能です。
(そのうち対応予定)

■更新履歴
ver 1.0 (2021/07/03)
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
ConfigItem.MusicPlay._gaugePic = null;
ConfigItem.MusicPlay.setupConfigItem = function() {
	var gaugeList = root.getBaseData().getUIResourceList(UIType.GAUGE, true);
	this._gaugePic = gaugeList.getDataFromId(1);
	this._scrollbar = createScrollbarObject(ConfigGaugeScrollbar, this);
	this._scrollbar.setScrollFormation(this.getFlagCount(), 1);
	this._scrollbar.setObjectArray(this.getObjectArray());
	this._scrollbar.setInitIndex(this.getFlagValue());
};

ConfigItem.MusicPlay.drawRight = function(x, y, isActive) {
	var textui = root.queryTextUI('default_window');
	var font = textui.getFont();
	TextRenderer.drawKeywordText(x + this.getLeftWidth(), y + 10, '小◀', -1, ColorValue.KEYWORD, font);
	ContentRenderer.drawReverseGaugeStretchParts(x + this.getLeftWidth() + 28, y + 16, ConfigItem.MusicPlay.getFlagValue(), 100, 1, 140, this._gaugePic);
	TextRenderer.drawKeywordText(x + this.getLeftWidth() + 172, y + 10, '▶大', -1, ColorValue.KEYWORD, font);
	this._scrollbar.drawScrollbar(x + this.getLeftWidth() - 16, y);
};

ConfigItem.MusicPlay.getObjectArray = function() {
	return new Array(101);
};

ConfigItem.MusicPlay.getVolumeArray = function() {
	var arr = [];
	for (var i = 0; i < 101; i++) {
		arr.push(100 - i);
	}
	return arr;
};

ConfigItem.MusicPlay.getFlagCount = function() {
	return 101;
};

ConfigItem.MusicPlay.selectFlag = function(index) {
	var volumeIndex = 100 - index; // デフォルト機能ではindexの値が小さい程が音量が大きいとされているため、反転させる
	root.getMetaSession().setDefaultEnvironmentValue(0, volumeIndex);
	root.getMediaManager().setMusicVolume(volumeIndex);
};

ConfigItem.MusicPlay.getFlagValue = function() {
	return 100 - root.getMetaSession().getDefaultEnvironmentValue(0);
};

ConfigItem.MusicPlay.getConfigItemDescription = function() {
	return StringTable.Config_MusicPlayDescription + '(左右キーでのみ調整可)';
};

ConfigItem.SoundEffect._gaugePic = null;
ConfigItem.SoundEffect.setupConfigItem = function() {
	var gaugeList = root.getBaseData().getUIResourceList(UIType.GAUGE, true);
	this._gaugePic = gaugeList.getDataFromId(1);
	this._scrollbar = createScrollbarObject(ConfigGaugeScrollbar, this);
	this._scrollbar.setScrollFormation(this.getFlagCount(), 1);
	this._scrollbar.setObjectArray(this.getObjectArray());
	this._scrollbar.setInitIndex(this.getFlagValue());
};

ConfigItem.SoundEffect.drawRight = function(x, y, isActive) {
	var textui = root.queryTextUI('default_window');
	var font = textui.getFont();
	TextRenderer.drawKeywordText(x + this.getLeftWidth(), y + 10, '小◀', -1, ColorValue.KEYWORD, font);
	ContentRenderer.drawReverseGaugeStretchParts(x + this.getLeftWidth() + 28, y + 16, ConfigItem.SoundEffect.getFlagValue(), 100, 1, 140, this._gaugePic);
	TextRenderer.drawKeywordText(x + this.getLeftWidth() + 172, y + 10, '▶大', -1, ColorValue.KEYWORD, font);
	this._scrollbar.drawScrollbar(x + this.getLeftWidth() - 16, y);
};

ConfigItem.SoundEffect.getObjectArray = function() {
	return new Array(101);
};

ConfigItem.SoundEffect.getVolumeArray = function() {
	var arr = [];
	for (var i = 0; i < 101; i++) {
		arr.push(100 - i);
	}
	return arr;
};

ConfigItem.SoundEffect.getFlagCount = function() {
	return 101;
};

ConfigItem.SoundEffect.selectFlag = function(index) {
	var volumeIndex = 100 - index; // デフォルト機能ではindexの値が小さい程が音量が大きいとされているため、反転させる
	root.getMetaSession().setDefaultEnvironmentValue(1, volumeIndex);
	root.getMediaManager().setSoundVolume(volumeIndex);
};

ConfigItem.SoundEffect.getFlagValue = function() {
	return 100 - root.getMetaSession().getDefaultEnvironmentValue(1);
};

ConfigItem.SoundEffect.getConfigItemDescription = function() {
	return StringTable.Config_SoundEffectDescription + '(左右キーでのみ調整可)';
};

ConfigItem.Voice._gaugePic = null;
ConfigItem.Voice.setupConfigItem = function() {
	var gaugeList = root.getBaseData().getUIResourceList(UIType.GAUGE, true);
	this._gaugePic = gaugeList.getDataFromId(1);
	this._scrollbar = createScrollbarObject(ConfigGaugeScrollbar, this);
	this._scrollbar.setScrollFormation(this.getFlagCount(), 1);
	this._scrollbar.setObjectArray(this.getObjectArray());
	this._scrollbar.setInitIndex(this.getFlagValue());
};

ConfigItem.Voice.drawRight = function(x, y, isActive) {
	var textui = root.queryTextUI('default_window');
	var font = textui.getFont();
	TextRenderer.drawKeywordText(x + this.getLeftWidth(), y + 10, '小◀', -1, ColorValue.KEYWORD, font);
	ContentRenderer.drawReverseGaugeStretchParts(x + this.getLeftWidth() + 28, y + 16, ConfigItem.Voice.getFlagValue(), 100, 1, 140, this._gaugePic);
	TextRenderer.drawKeywordText(x + this.getLeftWidth() + 172, y + 10, '▶大', -1, ColorValue.KEYWORD, font);
	this._scrollbar.drawScrollbar(x + this.getLeftWidth() - 16, y);
};

ConfigItem.Voice.getObjectArray = function() {
	return new Array(101);
};

ConfigItem.Voice.getVolumeArray = function() {
	var arr = [];
	for (var i = 0; i < 101; i++) {
		arr.push(100 - i);
	}
	return arr;
};

ConfigItem.Voice.getFlagCount = function() {
	return 101;
};

ConfigItem.Voice.selectFlag = function(index) {
	var volumeIndex = 100 - index; // デフォルト機能ではindexの値が小さい程が音量が大きいとされているため、反転させる
	root.getMetaSession().setDefaultEnvironmentValue(13, volumeIndex);
	root.getMediaManager().setVoiceVolume(volumeIndex);
};

ConfigItem.Voice.getFlagValue = function() {
	return 100 - root.getMetaSession().getDefaultEnvironmentValue(13);
};

ConfigItem.Voice.getConfigItemDescription = function() {
	return StringTable.Config_VoiceDescription + '(左右キーでのみ調整可)';
};

var ReverseRestrictLoopCommandCursor = defineObject(CommandCursor,
{
	_changeCursorIndex: function(d) {
		var prevIndex = this._index;

		this._index += d;
		if (
			(d < 0 && this._index < 0) ||
			(d > 0 && this._index > this._max - 1)
		) {	
				this._index = prevIndex;
		}
		if (prevIndex !== this._index) {
			this._playMoveCursorSound();
		}
	},

	_getIntervalValue: function(key) {
		if (this._type === 0) {
			if (key === InputType.LEFT) {
				return 1;
			}
			else if (key === InputType.RIGHT) {
				return -1;
			}
		}

		return CommandCursor._getIntervalValue.call(this, key);
	},

	setCommandCursorIndex: function(index, isInit) {
		if (isInit === true) {
			CommandCursor.setCommandCursorIndex.call(this, index);
			return;
		}
	}
}
);

var ConfigGaugeScrollbar = defineObject(ConfigTextScrollbar,
{
	_prevStateInputType: InputType.NONE,
	_inputStateFrame: 0,

	setScrollFormationInternal: function(col, showRowCount) {
		this._commandCursor = createObject(ReverseRestrictLoopCommandCursor);
		
		this._col = col;
		this._showRowCount = showRowCount;
		
		this._objectWidth = this.getObjectWidth();
		this._objectHeight = this.getObjectHeight();
		
		this._edgeCursor = createObject(EdgeCursor);
		this._edgeCursor.setEdgeRange(this.getScrollbarWidth(), this.getScrollbarHeight());
	},

	drawScrollContent: function(x, y, object, isSelect, index) {
		var range;
		var length = -1;
		var textui = root.queryTextUI('default_window');
		var color = textui.getColor();
		var font = textui.getFont();
		
		if (this.getParentInstance().getFlagValue() === index) {
			color = ColorValue.KEYWORD;
		}
		else {
			color = ColorValue.DISABLE;
		}
		
		range = createRangeObject(x, y, this.getObjectWidth(), this.getObjectHeight());
		TextRenderer.drawRangeText(range, TextFormat.CENTER, '', length, color, font);
	},

	moveInput: function() {
		// マウス非対応
		if (root.isMouseAction(MouseType.LEFT) || root.isMouseState(MouseType.LEFT)) {
			return ScrollbarInput.NONE;
		}
		// getDirectionStateやgetInputTypeを使えば
		// 可読性をより高くできるが正常に動作してないのであえて使っていない（最新版だと直っているかもしれない）
		if (root.isInputState(InputType.LEFT)) {
			if (this._prevStateInputType === InputType.LEFT) {
				this._inputStateFrame++;
			}
			else {
				this._prevStateInputType = InputType.LEFT;
				this._inputStateFrame = 0;
			}
		}
		else if (root.isInputState(InputType.RIGHT)) {
			if (this._prevStateInputType === InputType.RIGHT) {
				this._inputStateFrame++;
			}
			else {
				this._prevStateInputType = InputType.RIGHT;
				this._inputStateFrame = 0;
			}
		}
		else {
			this._prevStateInputType = InputType.NONE;
			this._inputStateFrame = 1;
			if (!root.isInputAction(InputType.LEFT) && !root.isInputAction(InputType.RIGHT)) {
				return ConfigTextScrollbar.moveInput.call(this);
			}
		}
		for (var index = 0; index < Math.ceil(this._inputStateFrame / 10); index++) {
			this.moveScrollbarCursor();
		}
		this.playSelectSound();
		return ScrollbarInput.SELECT;
	},

	getSpaceX: function() {
		return 0;
	},

	getObjectWidth: function() {
		return 1.345;
	},

	playSelectSound: function() {
	},

	drawScrollbar: function(xStart, yStart) {
		var i, j, x, y, isSelect, scrollableData;
		var isLast = false;
		var objectCount = this.getObjectCount();
		var width = this._objectWidth + this.getSpaceX();
		var height = this._objectHeight + this.getSpaceY();
		var index = (this._yScroll * this._col) + this._xScroll;
		
		xStart += this.getScrollXPadding();
		yStart += this.getScrollYPadding();
		
		// draw系でデータの更新はするべきではないが、move系での位置参照のため例外とする
		this.xRendering = xStart;
		this.yRendering = yStart;
		MouseControl.saveRenderingPos(this);

		for (i = 0; i < this._rowCount; i++) {
			y = yStart + (i * height);

			for (j = this._col - 1; j >= 0; j--) {
				x = xStart + j * width + 16;
				
				isSelect = index === this.getIndex();
				this.drawScrollContent(x, y, this._objectArray[index], isSelect, index);
				if (isSelect && this._isActive) {
					this.drawCursor(xStart, y, true);
				}
				
				if (index === this._forceSelectIndex) {
					this.drawCursor(xStart, y, false);
				}
				
				if (++index === objectCount) {
					isLast = true;
					break;
				}
			}
			if (isLast) {
				break;
			}
		}
	},

	_checkPage: function(inputType) {
	},

	setInitIndex: function(index) {
		this._commandCursor.setCommandCursorIndex(index, true);
	}
}
);

ContentRenderer.drawReverseGaugeStretchParts = function(x, y, curValue, maxValue, colorIndex, totalWidth, pic) {
	var per, perWidth, emptyWidth;
	var edgeWidth = UIFormat.GAUGE_WIDTH / 3;
	var leftEdgeWidth = edgeWidth - 3;
	var height = UIFormat.GAUGE_HEIGHT / 4;

	if (pic === null) {
		return;
	}
 	per = 1 - curValue / maxValue;
	if (per > 1) {
		per = 1;
	}
	else if (per < 0) {
		per = 0;
	}
	perWidth = Math.floor((totalWidth - leftEdgeWidth * 2) * per);
	perWidth = perWidth < 0 ? 0 : perWidth;
	emptyWidth = totalWidth - perWidth - edgeWidth - leftEdgeWidth;
	emptyWidth = emptyWidth < 0 ? 0 : emptyWidth;
	if (per === 0) {
		pic.drawParts(x, y, 0, 0, leftEdgeWidth, height);
	}
	else {
		pic.drawParts(x, y, 0, colorIndex * height, leftEdgeWidth, height);
	}
	pic.drawStretchParts(x + leftEdgeWidth, y, perWidth, height, edgeWidth + 1, colorIndex * height, edgeWidth, height);
	pic.drawStretchParts(x + leftEdgeWidth + perWidth, y, emptyWidth, height, edgeWidth + 1, 0, edgeWidth, height);	
	if (per === 1) {
		pic.drawParts(x + totalWidth - edgeWidth - 1, y, edgeWidth * 2, colorIndex * height, edgeWidth, height);
	}
	else {
		pic.drawParts(x + totalWidth - edgeWidth - 1, y, edgeWidth * 2, 0 * height, edgeWidth, height);
	}
};
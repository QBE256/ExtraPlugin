/*--------------------------------------------------------------------------
　会話でアイコンを表示 ver0.1

■作成者
キュウブ

■概要
テキスト中で制御文字を使用することでアイコン表記が可能になります。
試作版のため制限があります。

ランタイムアイコンの場合は
\rI[<リソースID>][<左から何番目か(一番左は0とする)>][<上から何番目か(一番上は0とする)>]
オリジナルアイコンの場合は
\oI[<リソースID>][<左から何番目か(一番左は0とする)>][<上から何番目か(一番上は0とする)>]
で指定可能です。

例えば、
\rI[0][0][2] と記入するとランタイムの弓アイコンが表示されます

※注意点
・会話テキスト中で他の制御文字を使ってフォント変更を行うと、アイコンがテキストと被ってしまう可能性があります。
・アイコンを並べて表示させる事はできません。
※"\rI[0][0][1] \rI[0][0][2]" と制御文字を並べてもアイコンが重なって表示されてしまいます
※"\rI[0][0][1] A \rI[0][0][2]" と制御文字の間に何かしら文字が入れば重なりません。

■更新履歴
ver 0.1 (2022/03/16)
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

ControlVariable.BaseIcon = defineObject(BaseControlVariable, {
	startParser: function (text, index, objectArray) {
		var key = this.getKey();
		var c = text.match(key);
		var obj = {};

		obj.index = index;
		obj.parentObject = this;
		obj.isDrawingObject = this.isDrawingObject();
		obj.handle = this._getHandle(Number(c[1]), Number(c[2]), Number(c[3]));
		objectArray.push(obj);

		return "     ";
	},

	checkDrawInfo: function (index, objectArray, drawInfo) {
		var obj;
		obj = this.getObjectFromIndex(index, objectArray, this);
		if (obj === null) {
			return;
		}

		if (drawInfo.currentIndex < obj.index - drawInfo.baseIndex) {
			return;
		}
		if (typeof drawInfo.icons !== "undefined") {
			drawInfo.icons.push(obj);
		} else {
			drawInfo.icons = [obj];
		}
	},

	isDrawingObject: function () {
		return true;
	},

	_getHandle: function (id, x, y) {
		var handle = root.createEmptyHandle();
		return handle;
	}
});

ControlVariable.RuntimeIcon = defineObject(ControlVariable.BaseIcon, {
	getKey: function () {
		var key = /\\rI\[(\d+)\]\[(\d+)\]\[(\d+)\]/;

		return key;
	},

	_getHandle: function (id, x, y) {
		var handle = root.createResourceHandle(true, id, 0, x, y);
		return handle;
	}
});

ControlVariable.OriginalIcon = defineObject(ControlVariable.BaseIcon, {
	getKey: function () {
		var key = /\\oI\[(\d+)\]\[(\d+)\]\[(\d+)\]/;

		return key;
	},

	_getHandle: function (id, x, y) {
		var handle = root.createResourceHandle(false, id, 0, x, y);
		return handle;
	}
});

(function () {
	var _TextParser__configureVariableObject = TextParser._configureVariableObject;
	TextParser._configureVariableObject = function (groupArray) {
		_TextParser__configureVariableObject.apply(this, arguments);
		groupArray.appendObject(ControlVariable.RuntimeIcon);
		groupArray.appendObject(ControlVariable.OriginalIcon);
	};

	CoreAnalyzer.drawCoreAnalyzer = function (xStart, yStart) {
		var i, j, adujstXPosition;
		var drawInfo, textLine, count2;
		var count = this._textLineArray.length;

		for (i = 0; i < count; i++) {
			textLine = this._textLineArray[i];
			if (textLine.formattedText === null) {
				root.getGraphicsManager().drawCharText(
					xStart,
					yStart,
					textLine.text,
					textLine.currentIndex,
					this._parserInfo.defaultColor,
					255,
					this._parserInfo.defaultFont
				);

				yStart += this.getCharSpaceHeight();
				continue;
			}

			textLine.formattedText.setValidArea(0, textLine.currentIndex);

			textLine.formattedText.setColorAlpha(0, textLine.currentIndex, this._parserInfo.defaultColor, 255);

			drawInfo = {};
			drawInfo.formattedText = textLine.formattedText;
			drawInfo.baseIndex = textLine.baseIndex;
			drawInfo.defaultColor = this._parserInfo.defaultColor;
			drawInfo.defaultFont = this._parserInfo.defaultFont;
			drawInfo.currentIndex = textLine.currentIndex;

			count2 = textLine.text.length + 1;
			for (j = 0; j < count2; j++) {
				this._textParser.checkDrawInfo(j + textLine.baseIndex, drawInfo);
			}
			textLine.formattedText.drawFormattedText(xStart, yStart, 0x0, 0);
			if (drawInfo.icons) {
				for (var iconIndex = 0; iconIndex < drawInfo.icons.length; iconIndex++) {
					adujstXPosition = root
						.getGraphicsManager()
						.getTextWidth(
							textLine.text.substr(0, drawInfo.icons[iconIndex].index - textLine.baseIndex),
							drawInfo.defaultFont
						);
					GraphicsRenderer.drawImage(
						xStart + adujstXPosition,
						yStart - 3,
						drawInfo.icons[iconIndex].handle,
						GraphicsType.ICON
					);
				}
			}
			yStart += this.getCharSpaceHeight();
		}
	};
})();

/*--------------------------------------------------------------------------
　会話でアイコンを表示 ver1.0

■作成者
キュウブ

■概要
テキスト中で制御文字を使用することでアイコン表記が可能になります。
※注意点
・会話テキスト中で他の制御文字を使ってフォント変更を行うと、アイコンがテキストと被ってしまう可能性があります。

■■ アイコン表示機能
※ver0.1とは仕様変更
ランタイムアイコンの場合は
\Ir<リソースID>[<左から何番目か(一番左は0とする)>][<上から何番目か(一番上は0とする)>]
オリジナルアイコンの場合は
\Io<リソースID>[<左から何番目か(一番左は0とする)>][<上から何番目か(一番上は0とする)>]
で指定可能です。

例えば、
\Ir0[0][2]と記入するとランタイムの弓アイコンが表示されます

■■ ブックマークアイコン表示機能
このスクリプトの最初の方にかかれているBookMarkDrawIconsの中を編集する事で
\I[<番号>]と記入するだけで指定したアイコンを表示する事ができます。
こちらの方がテキストで幅を取らないため、一行でいくつも表示させる事も可能になります。
※このファイルで設定管理を行う必要があるため、ご利用は最小限に留めておいた方が良いと思います。

■■■ 設定方法
設定は下記のように行いBookMarkDrawIconsに追加する必要があります。
---------------------------------------------------
{ 
  isRuntime: <ランタイムならtrue,オリジナルならfalse>, 
  id: <リソースID>, 
  x: <左から何番目か(一番左は0とする)>, 
  y: <上から何番目か(一番上は0とする)>
}
---------------------------------------------------
例えば、\I[2]の部分を下記のように編集すると、\I[2]でオリジナルのID2の左から3(2)番目、上から4(3)番目のアイコンが表示されるようになります。
-----------------------------------------------------------------------------
var BookMarkDrawIcons = [
	{ isRuntime: true, id: 0, x: 4, y: 9 }, // \I[0]でランタイムのハートアイコンを表示
	{ isRuntime: true, id: 0, x: 2, y: 16 }, // \I[1]でランタイムの睡眠アイコンを表示
	{ isRuntime: false, id: 2, x: 3, y: 4 }, // \I[2]でオリジナルID2のアイコン表示
-----------------------------------------------------------------------------


■更新履歴
ver 1.0 (2022/03/17)
・ver0.1とは制御文字の種類を変更 ※ver0.1から更新する場合は注意
・アイコンを連続表示できるように仕様変更
・ブックマークアイコン機能を追加

ver 0.1 (2022/03/16)
試作版公開

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

// ここで指定したアイコンは\I[n]で描画可能になる
// 制御文字が短い分、テキストに余裕ができる
// \I[0]と\I[1]の例を参考に各自編集してください
var BookMarkDrawIcons = [
	{ isRuntime: true, id: 0, x: 4, y: 9 }, // \I[0]でランタイムのハートアイコンを表示
	{ isRuntime: true, id: 0, x: 2, y: 16 }, // \I[1]でランタイムの睡眠アイコンを表示
	{ isRuntime: true, id: 0, x: 0, y: 0 }, // \I[2]
	{ isRuntime: true, id: 0, x: 0, y: 0 }, // \I[3]
	{ isRuntime: true, id: 0, x: 0, y: 0 }, // \I[4]
	{ isRuntime: true, id: 0, x: 0, y: 0 }, // \I[5]
	{ isRuntime: true, id: 0, x: 0, y: 0 }, // \I[6]
	{ isRuntime: true, id: 0, x: 0, y: 0 }, // \I[7]
	{ isRuntime: true, id: 0, x: 0, y: 0 }, // \I[8]
	{ isRuntime: true, id: 0, x: 0, y: 0 }, // \I[9]
	{ isRuntime: true, id: 0, x: 0, y: 0 } // \I[10]
];

ControlVariable.Icon = defineObject(BaseControlVariable, {
	startParser: function (text, index, objectArray) {
		var key = this.getKey();
		var c = text.match(key);
		var obj = {};

		obj.index = index;
		obj.parentObject = this;
		obj.isDrawingObject = this.isDrawingObject();
		obj.handle = this._getHandle(c[1] === "r", Number(c[2]), Number(c[3]), Number(c[4]));
		objectArray.push(obj);

		return "   ";
	},

	getKey: function () {
		var key = /\\I(r|o)(\d+)\[(\d+)\]\[(\d+)\]/;

		return key;
	},

	checkDrawInfo: function (index, objectArray, drawInfo) {
		var obj;
		obj = this.getObjectFromIndex(index, objectArray, this);
		if (obj === null) {
			return;
		}
		if (drawInfo.currentIndex < index - drawInfo.baseIndex) {
			return;
		}
		if (Array.isArray(drawInfo.icons)) {
			drawInfo.icons.push(obj);
		} else {
			drawInfo.icons = [obj];
		}
	},

	isDrawingObject: function () {
		return true;
	},

	_getHandle: function (isRuntime, id, x, y) {
		var handle = root.createResourceHandle(isRuntime, id, 0, x, y);
		return handle;
	}
});

ControlVariable.BookMarkIcon = defineObject(ControlVariable.Icon, {
	startParser: function (text, index, objectArray) {
		var key = this.getKey();
		var c = text.match(key);
		var obj = {};
		var bookMarkDrawIcon = BookMarkDrawIcons[Number(c[1])];

		obj.index = index;
		obj.parentObject = this;
		obj.isDrawingObject = this.isDrawingObject();
		obj.handle = this._getHandle(
			bookMarkDrawIcon.isRuntime,
			bookMarkDrawIcon.id,
			bookMarkDrawIcon.x,
			bookMarkDrawIcon.y
		);
		objectArray.push(obj);

		return "   ";
	},

	getKey: function () {
		var key = /\\I\[(\d+)\]/;

		return key;
	}
});

CoreAnalyzer.drawIcon = function (x, y, currentLineText, drawInfo) {
	var currentDrawText = "";
	var adujstXPosition = 0;
	var adujstYPosition = -3;
	// getTextWidthでテキストの長さを測定する際に末尾がスペースだと本来より短い値になってしまうため、
	// ダミーの文字を末尾に挿入して値を測定させる
	var dummyEndCharacter = "|";
	var dummyEndCharacterWidth = root.getGraphicsManager().getTextWidth(dummyEndCharacter, drawInfo.defaultFont);

	if (!Array.isArray(drawInfo.icons)) {
		return;
	}

	for (var index = 0; index < drawInfo.icons.length; index++) {
		currentDrawText = currentLineText.substr(0, drawInfo.icons[index].index - drawInfo.baseIndex);
		// 現在表示されているテキストの長さを計測する。長さの分だけx軸をずらしてアイコンを表示させる必要がある。
		// フォントはメッセージのデフォルトフォントとする。
		// したがって、他の制御文字でフォントの設定を変えている場合は正しい長さにはならない。
		adujstXPosition =
			root.getGraphicsManager().getTextWidth(currentDrawText + dummyEndCharacter, drawInfo.defaultFont) -
			dummyEndCharacterWidth;
		GraphicsRenderer.drawImage(
			x + adujstXPosition,
			y + adujstYPosition,
			drawInfo.icons[index].handle,
			GraphicsType.ICON
		);
	}
};

(function () {
	var _TextParser__configureVariableObject = TextParser._configureVariableObject;
	TextParser._configureVariableObject = function (groupArray) {
		_TextParser__configureVariableObject.apply(this, arguments);
		groupArray.appendObject(ControlVariable.Icon);
		groupArray.appendObject(ControlVariable.BookMarkIcon);
	};

	CoreAnalyzer.drawCoreAnalyzer = function (xStart, yStart) {
		var i, j;
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
			// アイコンを描画するべきかどうかの判定は
			// ControlVariable.Icon.checkDrawInfoで行わせるのが本来のメソッドの役割として望ましい
			// これを実現するために、drawInfoにcurrentIndexを追加する
			drawInfo.currentIndex = textLine.currentIndex;

			count2 = textLine.text.length + 1;
			for (j = 0; j < count2; j++) {
				this._textParser.checkDrawInfo(j + textLine.baseIndex, drawInfo);
			}
			textLine.formattedText.drawFormattedText(xStart, yStart, 0x0, 0);
			// アイコンの描画を行う
			this.drawIcon(xStart, yStart, textLine.text, drawInfo);
			yStart += this.getCharSpaceHeight();
		}
	};
})();

// Array.isArray pollyfill
// reference: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray#polyfill
if (!Array.isArray) {
	Array.isArray = function (arg) {
		return Object.prototype.toString.call(arg) === "[object Array]";
	};
}

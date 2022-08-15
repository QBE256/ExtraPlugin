/*--------------------------------------------------------------------------
　熟練度をアルファベット表記に変更する ver 1.0

■作成者
キュウブ

■概要
熟練度がF-Sもしくは☆表記に変更されるようになります。

■使い方
1.熟練度の上限値設定を行う
本プラグインでは熟練度の値は以下のように対応しています

0 -> F
1 -> E
2 -> D
3 -> C
4 -> B
5 -> A
6 -> S

したがって、熟練度の上限値は最大でも6になるようにコンフィグで設定してください

※最低ランクをEにしたいといった場合は、
武器の使用可能熟練度や各ユニットの初期値を全て1以上に設定し、0を用いないようにしてください

2.☆表記にしたい武器はカスタムパラメータを設定する
一部の専用武器などで使用可能熟練度表記を☆にしたい場合は、
対象武器に以下のカスタムパラメータを設定してください
isStarMarkDisplayable: true

■更新履歴
ver 1.0 2021/08/16

■対応バージョン
SRPG Studio Version:1.161

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。
・クレジット明記無し　OK (明記する場合は"キュウブ"でお願いします)
・再配布、転載　OK (バグなどがあったらプルリクどうぞ)
・wiki掲載　OK
・SRPG Studio利用規約は遵守してください。

--------------------------------------------------------------------------*/

(function () {
  var ALPHABET_RESOURCE_ID = 1;
  var WeaponLevels = ["F", "E", "D", "C", "B", "A", "S"];
  var AlphabetResourceIndex = {
    UNLIMIT: 0,
    S: 1,
    A: 2,
    B: 3,
    C: 4,
    D: 5,
    E: 6,
    F: 7,
    X: 8,
    Y: 9
  };

  ItemSentence.WeaponLevelAndWeight.drawItemSentence = function (x, y, item) {
    var text;
    var dx = 0;

    if (this._isWeaponLevelDisplayable(item)) {
      text = root.queryCommand("wlv_param");
      ItemInfoRenderer.drawKeyword(x, y, text);
      x += ItemInfoRenderer.getSpaceX();
      if (!!item.custom.isStarMarkDisplayable) {
        NumberRenderer.drawRightUnlimitColor(x, y, 0, 255);
      } else {
        NumberRenderer.drawRightAlphabetColor(x, y, item.getWeaponLevel(), 0, 255);
      }
      x += 42;
    }
    if (this._isWeightDisplayable(item)) {
      text = root.queryCommand("weight_capacity");
      ItemInfoRenderer.drawKeyword(x, y, text);
      x += ItemInfoRenderer.getSpaceX();
      NumberRenderer.drawRightNumber(x, y, item.getWeight());
    }
  };

  NumberRenderer.translateFromNumberToAlphabet = function (number) {
    if (number >= WeaponLevels.length) {
      return WeaponLevels[WeaponLevels.length - 1];
    } else if (number < 0) {
      return WeaponLevels[0];
    } else {
      return WeaponLevels[number];
    }
  };

  NumberRenderer.drawRightNumberColor = function (x, y, number, colorIndex, alpha, colorAlpha) {
    var pic = root.queryUI("number");
    var width = UIFormat.NUMBER_WIDTH / 10;
    var height = UIFormat.NUMBER_HEIGHT / 5;
    var ySrc = height * colorIndex;

    this._drawRightNumberInternal(x, y, number, pic, ySrc, width, height, alpha, colorAlpha);
  };

  NumberRenderer.drawRightAlphabetColor = function (x, y, number, colorIndex, alpha, colorAlpha) {
    var UIResources = root.getBaseData().getUIResourceList(UIType.NUMBER, true);
    var pic = UIResources.getDataFromId(ALPHABET_RESOURCE_ID);
    var width = UIFormat.NUMBER_WIDTH / 10;
    var height = UIFormat.NUMBER_HEIGHT / 5;
    var ySrc = height * colorIndex;
    var alphabet = this.translateFromNumberToAlphabet(number);
    var drawnValue = AlphabetResourceIndex[alphabet];

    this._drawRightNumberInternal(x, y, drawnValue, pic, ySrc, width, height, alpha, colorAlpha);
  };

  NumberRenderer.drawRightUnlimitColor = function (x, y, colorIndex, alpha, colorAlpha) {
    var UIResources = root.getBaseData().getUIResourceList(UIType.NUMBER, true);
    var pic = UIResources.getDataFromId(ALPHABET_RESOURCE_ID);
    var width = UIFormat.NUMBER_WIDTH / 10;
    var height = UIFormat.NUMBER_HEIGHT / 5;
    var ySrc = height * colorIndex;

    this._drawRightNumberInternal(
      x,
      y,
      AlphabetResourceIndex.UNLIMIT,
      pic,
      ySrc,
      width,
      height,
      alpha,
      colorAlpha
    );
  };

  NumberRenderer._drawRightNumberInternal = function (
    x,
    y,
    number,
    pic,
    ySrc,
    width,
    height,
    alpha,
    colorAlpha
  ) {
    var i, n;
    var count = 0;
    var digitArray = [];

    if (pic === null || number < 0) {
      return;
    }

    if (number === 0) {
      pic.drawParts(x, y, 0, ySrc, width, height);
      return;
    }

    while (number > 0) {
      n = Math.floor(number % 10);
      number = Math.floor(number / 10);
      digitArray[count] = n;
      count++;
    }

    for (i = count - 1; i >= 0; i--) {
      pic.setAlpha(alpha);
      if (colorAlpha) {
        pic.setColor(colorAlpha.color, colorAlpha.alpha);
      }
      pic.drawParts(x, y, digitArray[i] * width, ySrc, width, height);
      x += 9;
    }
  };

  var _StructureBuilder_buildStatusEntry = StructureBuilder.buildStatusEntry;
  StructureBuilder.buildStatusEntry = function () {
    var statusEntry = _StructureBuilder_buildStatusEntry.apply(this, arguments);
    statusEntry.isFlashRendering = false;
    return statusEntry;
  };

  StatusScrollbar.drawScrollContent = function (x, y, object, isSelect, index) {
    var statusEntry = object;
    var n = statusEntry.param;
    var text = statusEntry.type;
    var textui = this.getParentTextUI();
    var font = textui.getFont();
    var length = this._getTextLength();

    TextRenderer.drawKeywordText(x, y, text, length, ColorValue.KEYWORD, font);
    x += this._getNumberSpace();

    statusEntry.textui = textui;
    if (statusEntry.isRenderable) {
      ParamGroup.drawUnitParameter(x, y, statusEntry, isSelect, statusEntry.index);
      return;
    }

    if (n < 0) {
      n = 0;
    }
    if (statusEntry.index === ParamType.WLV) {
      NumberRenderer.drawRightAlphabetColor(x, y, n, 0, 255);
    } else {
      NumberRenderer.drawNumber(x, y, n);
    }

    if (statusEntry.bonus !== 0) {
      this._drawBonus(x, y, statusEntry);
    }
  };

  UnitStatusScrollbar._flashCounter = null;
  var _UnitStatusScrollbar_initialize = UnitStatusScrollbar.initialize;
  UnitStatusScrollbar.initialize = function () {
    this._flashCounter = createObject(CycleCounter);
    this._flashCounter.disableGameAcceleration();
    this._flashCounter.setCounterInfo(this._getTotalFlashFrame());
    _UnitStatusScrollbar_initialize.apply(this, arguments);
  };

  UnitStatusScrollbar._getTotalFlashFrame = function () {
    return 60;
  };

  UnitStatusScrollbar.moveScrollbar = function () {
    this._flashCounter.moveCycleCounter();
  };

  UnitStatusScrollbar._createStatusEntry = function (unit, index, weapon) {
    var statusEntry = StructureBuilder.buildStatusEntry();

    statusEntry.type = ParamGroup.getParameterName(index);
    statusEntry.param = ParamGroup.getLastValue(unit, index, weapon);
    statusEntry.bonus = 0;
    statusEntry.index = index;
    statusEntry.isRenderable = ParamGroup.isParameterRenderable(index);
    var realParameter =
      ParamGroup.getUnitValue(unit, index) + ParamGroup.getParameterBonus(unit.getClass(), index);
    if (statusEntry.index !== ParamType.WLV) {
      statusEntry.isFlashRendering = realParameter >= ParamGroup.getMaxValue(unit, index);
    } else {
      statusEntry.isFlashRendering = realParameter >= DataConfig.getMaxParameter(index);
    }

    return statusEntry;
  };

  UnitStatusScrollbar._getFlashAlpha = function () {
    var alpha = 0;
    var currentFrame = this._flashCounter.getCounter();
    var totalFrame = this._getTotalFlashFrame();
    var halfFrame = totalFrame / 2;
    var minAlpha = 60;
    var maxAlpha = 175;
    if (currentFrame < halfFrame) {
      alpha = minAlpha + Math.floor((currentFrame * (maxAlpha - minAlpha)) / halfFrame);
    } else {
      alpha =
        maxAlpha - Math.floor(((currentFrame - halfFrame) * (maxAlpha - minAlpha)) / halfFrame);
    }
    return alpha;
  };

  UnitStatusScrollbar.drawScrollContent = function (x, y, object, isSelect, index) {
    var statusEntry = object;
    var n = statusEntry.param;
    var text = statusEntry.type;
    var textui = this.getParentTextUI();
    var font = textui.getFont();
    var length = this._getTextLength();

    TextRenderer.drawKeywordText(x, y, text, length, ColorValue.KEYWORD, font);
    x += this._getNumberSpace();

    statusEntry.textui = textui;
    if (statusEntry.isRenderable) {
      ParamGroup.drawUnitParameter(x, y, statusEntry, isSelect, statusEntry.index);
      return;
    }

    if (n < 0) {
      n = 0;
    }
    var flashAlpha = {
      color: 0x00ff00,
      alpha: statusEntry.isFlashRendering ? this._getFlashAlpha() : 0
    };
    if (statusEntry.index === ParamType.WLV) {
      NumberRenderer.drawRightAlphabetColor(x, y, n, 0, 255, flashAlpha);
    } else {
      NumberRenderer.drawRightNumberColor(x, y, n, 0, 255, flashAlpha);
    }

    if (statusEntry.bonus !== 0) {
      this._drawBonus(x, y, statusEntry);
    }
  };

  var _UnitMenuBottomWindow_moveWindowContent = UnitMenuBottomWindow.moveWindowContent;
  UnitMenuBottomWindow.moveWindowContent = function () {
    this._statusScrollbar.moveScrollbar();
    return _UnitMenuBottomWindow_moveWindowContent.apply(this, arguments);
  };
})();

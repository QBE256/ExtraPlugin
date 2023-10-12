/*--------------------------------------------------------------------------
　移動先として選択可能なマスを制限するイベントコマンド ver 1.0

■作成者
キュウブ

■概要
このイベントコマンドを用いると、
指定したマス以外は移動時に決定ボタンを押しても反応しなくなります。
例えば、チュートリアルモードなどで移動先を強制させたい時に利用できます。4

※なお、選択可能マスはカーソルで表示されます。

■使い方
イベントコマンド"スクリプトの実行"にて、
オブジェクト名に"RestrictMoveCommand"と入力します。
次に1-3のいずれかの方法で移動可能マスの指定や設定削除を行います。

1.移動可能マスをダイレクトに指定したい場合、下記のような設定を加えます
・オリジナルデータのキーワードに"addDirect"と入力
・数値1にx座標(左端を0とする)、数値2にy座標(上端を0とする)を入力

2.特定のユニットの周囲xマスのみ移動可能としたい場合、下記のような設定を加えます
・オリジナルデータのキーワードに"addUnitDistance"と入力
・数値1に何マス分の距離まで移動可能としたいか入力

3.設定を解除したい場合
・オリジナルデータのキーワードに"reset"と入力

※※※※※注意※※※※※
用が済んだ場合、3の"reset"を実行して必ず設定を解除してください。
移動制限は自動では無効化されません。章を跨いでも継続します。


例.そのターンに特定の場所に移動させたい場合、下記の2つのイベントを用意しておく必要がある
1.ターン開始時にてスクリプトの実行"RestrictMoveCommand"-"addDirect"を実行し、他マスへの移動を制限する
2.特定の場所への待機イベントにてスクリプトの実行"RestrictMoveCommand"-"reset"を実行し、移動制限を解除する


ver 1.0 (2023/10/13)
公開 

■対応バージョン
SRPG Studio Version:1.287

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。
・クレジット明記無し　OK (明記する場合は"キュウブ"でお願いします)
・バグなどがあったらプルリク受け付けてます
・wiki掲載　OK
・SRPG Studio利用規約は遵守してください。

--------------------------------------------------------------------------*/

(function () {
  MapSequenceArea._focusCursorCounter = null;
  var _MapSequenceArea__prepareSequenceMemberData = MapSequenceArea._prepareSequenceMemberData;
  MapSequenceArea._prepareSequenceMemberData = function (parentTurnObject) {
    _MapSequenceArea__prepareSequenceMemberData.apply(this, arguments);
    this._focusCursorCounter = createObject(CycleCounter);
  };

  var _MapSequenceArea__completeSequenceMemberData = MapSequenceArea._completeSequenceMemberData;
  MapSequenceArea._completeSequenceMemberData = function (parentTurnObject) {
    this._focusCursorCounter.setCounterInfo(44);
    this._focusCursorCounter.disableGameAcceleration();
    return _MapSequenceArea__completeSequenceMemberData.apply(this, arguments);
  };

  var _MapSequenceArea__moveArea = MapSequenceArea._moveArea;
  MapSequenceArea._moveArea = function () {
    this._focusCursorCounter.moveCycleCounter();
    return _MapSequenceArea__moveArea.apply(this, arguments);
  };

  var _MapSequenceArea__drawArea = MapSequenceArea._drawArea;
  MapSequenceArea._drawArea = function () {
    var enablePositions = root.getMetaSession().global.enablePositions;
    if (Array.isArray(enablePositions)) {
      var session = root.getCurrentSession();
      var width = UIFormat.MAPCURSOR_WIDTH / 2;
      var height = UIFormat.MAPCURSOR_HEIGHT;
      var cursorPic = root.queryUI("lockoncursor");
      var mapCursorSrcIndex = this._focusCursorCounter.getCounter() <= 22;

      enablePositions.forEach(function (enablePosition) {
        var x = enablePosition.x * width - session.getScrollPixelX();
        var y = enablePosition.y * height - session.getScrollPixelY();
        cursorPic.drawParts(x, y, mapCursorSrcIndex * width, 0, width, height);
      });
    }
    _MapSequenceArea__drawArea.apply(this, arguments);
  };

  var _MapSequenceArea__isPlaceSelectable = MapSequenceArea._isPlaceSelectable;
  MapSequenceArea._isPlaceSelectable = function () {
    var enablePosition = true;
    var x = this._mapCursor.getX();
    var y = this._mapCursor.getY();
    var enablePositions = root.getMetaSession().global.enablePositions;
    if (Array.isArray(enablePositions)) {
      enablePosition = enablePositions.some(function (enablePosition) {
        return x === enablePosition.x && y === enablePosition.y;
      });
    }
    return enablePosition && _MapSequenceArea__isPlaceSelectable.apply(this, arguments);
  };

  var _ScriptExecuteEventCommand__configureOriginalEventCommand =
    ScriptExecuteEventCommand._configureOriginalEventCommand;
  ScriptExecuteEventCommand._configureOriginalEventCommand = function (groupArray) {
    _ScriptExecuteEventCommand__configureOriginalEventCommand.apply(this, arguments);
    groupArray.appendObject(RestrictMoveCommand);
  };

  var RestrictMoveCommand = defineObject(BaseEventCommand, {
    _originalContent: null,

    enterEventCommandCycle: function () {
      this._prepareEventCommandMemberData();
      return this._completeEventCommandMemberData();
    },

    moveEventCommandCycle: function () {
      return MoveResult.END;
    },

    getEventCommandName: function () {
      return "RestrictMoveCommand";
    },

    isEventCommandSkipAllowed: function () {
      return false;
    },

    _prepareEventCommandMemberData: function () {
      this._originalContent = root.getEventCommandObject().getOriginalContent();
      if (!Array.isArray(root.getMetaSession().global.enablePositions)) {
        root.getMetaSession().global.enablePositions = [];
      }
    },

    _completeEventCommandMemberData: function () {
      var keyword = this._originalContent.getCustomKeyword();
      if (keyword === "reset") {
        this._reset();
      } else if (keyword === "addDirect") {
        this._addDirect();
      } else if (keyword === "addUnitDistance") {
        this._addUnitDistance();
      }
      return EnterResult.OK;
    },

    _reset: function () {
      delete root.getMetaSession().global.enablePositions;
    },

    _addDirect: function () {
      root.getMetaSession().global.enablePositions.push({
        x: this._originalContent.getValue(0),
        y: this._originalContent.getValue(1)
      });
    },

    _addUnitDistance: function () {
      var unit = this._originalContent.getUnit();
      var distance = this._originalContent.getValue(0);
      var enableIndexs = IndexArray.getBestIndexArray(unit.getMapX(), unit.getMapY(), 0, distance);
      enableIndexs.forEach(function (enableIndex) {
        root.getMetaSession().global.enablePositions.push({
          x: CurrentMap.getX(enableIndex),
          y: CurrentMap.getY(enableIndex)
        });
      });
    }
  });
})();

// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
if (!Array.prototype["forEach"]) {
  Array.prototype.forEach = function (callback, thisArg) {
    if (this == null) {
      throw new TypeError("Array.prototype.forEach called on null or undefined");
    }

    var T, k;
    // 1. var O be the result of calling toObject() passing the
    // |this| value as the argument.
    var O = Object(this);

    // 2. var lenValue be the result of calling the Get() internal
    // method of O with the argument "length".
    // 3. var len be toUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If isCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== "function") {
      throw new TypeError(callback + " is not a function");
    }

    // 5. If thisArg was supplied, var T be thisArg; else var
    // T be undefined.
    if (arguments.length > 1) {
      T = thisArg;
    }

    // 6. var k be 0
    k = 0;

    // 7. Repeat, while k < len
    while (k < len) {
      var kValue;

      // a. var Pk be ToString(k).
      //    This is implicit for LHS operands of the in operator
      // b. var kPresent be the result of calling the HasProperty
      //    internal method of O with argument Pk.
      //    This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {
        // i. Let kValue be the result of calling the Get internal
        // method of O with argument Pk.
        kValue = O[k];

        // ii. Call the Call internal method of callback with T as
        // the this value and argument list containing kValue, k, and O.
        callback.call(T, kValue, k, O);
      }
      // d. Increase k by 1.
      k++;
    }
    // 8. return undefined
  };
}

// Array.isArray polyfill
// Reference:https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray#polyfill
if (!Array.isArray) {
  Array.isArray = function (value) {
    return Object.prototype.toString.call(value) === "[object Array]";
  };
}

// Production steps of ECMA-262, Edition 5, 15.4.4.17
// Reference: http://es5.github.io/#x15.4.4.17
// https://udn.realityripple.com/docs/Web/JavaScript/Reference/Global_Objects/Array/some
if (!Array.prototype.some) {
  Array.prototype.some = function (fun, thisArg) {
    "use strict";

    if (this == null) {
      throw new TypeError("Array.prototype.some called on null or undefined");
    }

    if (typeof fun !== "function") {
      throw new TypeError();
    }

    var t = Object(this);
    var len = t.length >>> 0;

    for (var i = 0; i < len; i++) {
      if (i in t && fun.call(thisArg, t[i], i, t)) {
        return true;
      }
    }

    return false;
  };
}

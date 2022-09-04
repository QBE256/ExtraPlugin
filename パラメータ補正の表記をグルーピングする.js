/*--------------------------------------------------------------------------
　パラメータ補正の表記をグルーピングする ver 1.1

■作成者
キュウブ

■概要
アイテム情報で同じ値のパラメータ補正をグルーピングして表記します。
例えば、力と技が+2、速さと幸運が+3である場合は

力,技 + 2
速さ,幸運 + 3

と2行で収まるようになります。

また、全パラメータに同等の補正が入っている場合は

全能力 + 1

と1行で表記が収まるようになります。

■使い方
基本的にスクリプトを導入するだけで良いのですが、
デフォルトではHP,移動,熟練度,体格を除いたパラメータに同等の補正が入っている場合に
全能力 + <補正値>
という表記が発生するようになっています。
この定義を変更したい場合は、51行目のAllSameBonusConditionの中を変更する必要があります。


■更新履歴
ver 1.1 2022/09/04 バグ修正
ver 1.0 2022/09/04

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

// "全能力"の定義を変えたい場合はここのtrue,falseの値を変更する
// ここでtrueと表記されているパラメータに対して全て同じ値の補正が入っている時は"全能力 + <補正値>"と表示される
// 下記の場合はHP,移動,熟練度,体格を除いたパラメータとなる
var AllSameBonusCondition = {
  MHP: false,// 最大HP
  POW: true, // 力
  MAG: true, // 魔力
  SKI: true, // 技
  SPD: true, // 速さ
  LUK: true, // 幸運
  DEF: true, // 守備
  MDF: true, // 魔防
  MOV: false,// 移動
  WLV: false,// 熟練度
  BLD: false // 体格
};

var MAX_GROUPING_COUNT = 3;
var ALL_BONUS_TEXT = '全能力';

(function () {
  var BonusType = {
    NONE: 0,
    NOMAL: 1,
    ALL_SAME: 2
  };

  // ハッシュマップと同等の使い方をする
  // key:<ボーナス値>, value: <パラメータインデックスの配列>という構造になる
  ItemSentence.Bonus._bonusesMap = [];
  ItemSentence.Bonus._bonusType = BonusType.NONE;

  ItemSentence.Bonus.setParentWindow = function (itemInfoWindow) {
    var item = itemInfoWindow.getInfoItem();
    var paramterCount = ParamGroup.getParameterCount();
    var isNoBonus = true;
    var isAllSameBonus = true;
    this._bonusesMap = [];

    for (var index = 0; index < paramterCount; index++) {
      var bonus = ParamGroup.getParameterBonus(item, index);
      if (bonus === 0) {
        continue;
      }
      if (!Array.isArray(this._bonusesMap[bonus])) {
        this._bonusesMap[bonus] = [];
      }
      this._bonusesMap[bonus].push(index);
    }
    isNoBonus = Object.keys(this._bonusesMap).length === 0;
    isAllSameBonus = this._isAllSameBonus();
    if (isNoBonus) {
      this._bonusType = BonusType.NONE;
    } else if (isAllSameBonus) {
      this._bonusType = BonusType.ALL_SAME;
    } else {
      this._bonusType = BonusType.NOMAL;
    }
  };

  ItemSentence.Bonus._isAllSameBonus = function () {
    var allSameBonusConditionKeys = Object.keys(AllSameBonusCondition);
    var bonusMapKeys = Object.keys(this._bonusesMap);
    var paramterCount = ParamGroup.getParameterCount();
    var noMultipleBonus = bonusMapKeys.length === 1;
    var bonusIndexs = noMultipleBonus ? this._bonusesMap[bonusMapKeys[0]] : [];
    var hasRequiredBonus = allSameBonusConditionKeys.every(function (key) {
      return !AllSameBonusCondition[key] || bonusIndexs.indexOf(ParamType[key]) !== -1;
    });
    return noMultipleBonus && hasRequiredBonus;
  };

  ItemSentence.Bonus.drawItemSentence = function (x, y, item) {
    if (this._bonusType === BonusType.NONE) {
      return;
    }
    ItemInfoRenderer.drawKeyword(x, y, root.queryCommand("support_capacity"));
    x += ItemInfoRenderer.getSpaceX();
    if (this._bonusType === BonusType.ALL_SAME) {
      ItemInfoRenderer.drawAllSameDoping(x, y, item, true);
    } else if (this._bonusType === BonusType.NOMAL) {
      ItemInfoRenderer.drawGroupDoping(x, y, item, this._bonusesMap, true);
    }
  };

  ItemSentence.Bonus.getItemSentenceCount = function (item) {
    var bonusMapKeys = Object.keys(this._bonusesMap);
    var count = 0;
    var that = this;
    if (this._bonusType === BonusType.ALL_SAME) {
      return 1;
    } else {
      bonusMapKeys.forEach(function (bonus) {
        count += Math.ceil(that._bonusesMap[bonus].length / MAX_GROUPING_COUNT);
      });
      return count;
    }
  };

  ItemInfoRenderer.drawGroupDoping = function (x, y, item, bonusesMap, isParameter) {
    var that = this;
    var xBase = x;
    var textui = this.getTextUI();
    var color = textui.getColor();
    var font = textui.getFont();
    var bonusMapKeys = Object.keys(bonusesMap);

    bonusMapKeys.forEach(function (bonus) {
      var parameterNames = [];
      bonusesMap[bonus].forEach(function (parameterIndex, valueIndex) {
        var nameIndex = Math.floor(valueIndex / MAX_GROUPING_COUNT);
        if (valueIndex % MAX_GROUPING_COUNT === 0) {
          parameterNames.push([]);
        }
        parameterNames[Math.floor(valueIndex / MAX_GROUPING_COUNT)].push(
          ParamGroup.getParameterName(parameterIndex)
        );
      });

      parameterNames.forEach(function (parameterName) {
        var text = parameterName.join(",");
        TextRenderer.drawKeywordText(x, y, text, -1, color, font);

        x += TextRenderer.getTextWidth(text, font);
        TextRenderer.drawSignText(x, y, bonus > 0 ? " + " : " - ");

        x += DefineControl.getNumberSpace();

        if (bonus < 0) {
          bonus *= -1;
        }
        NumberRenderer.drawRightNumber(x, y, bonus);
        x += 20;

        y += that.getSpaceY();

        x = xBase;
      });
    });
  };

  ItemInfoRenderer.drawAllSameDoping = function (x, y, item, isParameter) {
    var bonus, text;
    var xBase = x;
    var textui = this.getTextUI();
    var color = textui.getColor();
    var font = textui.getFont();
    var paramterCount = ParamGroup.getParameterCount();

    for (var index = 0; index < paramterCount; index++) {
      if (isParameter) {
        bonus = ParamGroup.getParameterBonus(item, index);
      } else {
        bonus = ParamGroup.getDopingParameter(item, index);
      }
      if (bonus !== 0) {
        break;
      }
    }

    if (bonus !== 0) {
      text = ALL_BONUS_TEXT;
      TextRenderer.drawKeywordText(x, y, text, -1, color, font);

      x += TextRenderer.getTextWidth(text, font) + 5;
      TextRenderer.drawSignText(x, y, bonus > 0 ? " + " : " - ");

      x += 10;
      x += DefineControl.getNumberSpace();

      if (bonus < 0) {
        bonus *= -1;
      }
      NumberRenderer.drawRightNumber(x, y, bonus);
      x += 20;

      y += this.getSpaceY();

      x = xBase;
    }
  };
})();

if (!Array.isArray) {
  Array.isArray = function (arg) {
    return Object.prototype.toString.call(arg) === "[object Array]";
  };
}

if (!Array.prototype.every) {
  Array.prototype.every = function (callbackfn, thisArg) {
    "use strict";
    var T, k;

    if (this == null) {
      throw new TypeError("this is null or not defined");
    }

    // 1. Let O be the result of calling ToObject passing the this
    //    value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal method
    //    of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If IsCallable(callbackfn) is false, throw a TypeError exception.
    if (
      typeof callbackfn !== "function" &&
      Object.prototype.toString.call(callbackfn) !== "[object Function]"
    ) {
      throw new TypeError();
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (arguments.length > 1) {
      T = thisArg;
    }

    // 6. Let k be 0.
    k = 0;

    // 7. Repeat, while k < len
    while (k < len) {
      var kValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal
      //    method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {
        var testResult;
        // i. Let kValue be the result of calling the Get internal method
        //    of O with argument Pk.
        kValue = O[k];

        // ii. Let testResult be the result of calling the Call internal method
        // of callbackfn with T as the this value if T is not undefined
        // else is the result of calling callbackfn
        // and argument list containing kValue, k, and O.
        if (T) testResult = callbackfn.call(T, kValue, k, O);
        else testResult = callbackfn(kValue, k, O);

        // iii. If ToBoolean(testResult) is false, return false.
        if (!testResult) {
          return false;
        }
      }
      k++;
    }
    return true;
  };
}

// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
if (!Array.prototype["forEach"]) {
  Array.prototype.forEach = function (callback, thisArg) {
    if (this == null) {
      throw new TypeError("Array.prototype.forEach called on null or undefined");
    }

    var T, k;
    // 1. Let O be the result of calling toObject() passing the
    // |this| value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get() internal
    // method of O with the argument "length".
    // 3. Let len be toUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If isCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== "function") {
      throw new TypeError(callback + " is not a function");
    }

    // 5. If thisArg was supplied, let T be thisArg; else let
    // T be undefined.
    if (arguments.length > 1) {
      T = thisArg;
    }

    // 6. Let k be 0
    k = 0;

    // 7. Repeat, while k < len
    while (k < len) {
      var kValue;

      // a. Let Pk be ToString(k).
      //    This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty
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
        return;
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
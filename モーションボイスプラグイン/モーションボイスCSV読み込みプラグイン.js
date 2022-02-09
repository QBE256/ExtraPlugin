/*

モーションボイス用CSVファイル読み込みプラグイン ver1.0
作成者:キュウブ

モーションボイスプラグインと併用してください。

■更新履歴
ver 1.0 (2022/2/9)
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
*/

var VoiceType = {
  FIGHTER_MOTION: "fighterMotion",
  ARCHER_MOTION: "archerMotion",
  MAGE_MOTION: "mageMotion",
  INVOCATION_MAGIC: "invocationMagic",
  ATTACK_MAGIC: "attackMagic"
};

var VoiceIndex = {
  REMARKS: 0,
  VOICE_TYPE: 1,
  CORRESPONDING_ID: 2,
  CONDITION_SWITCH_ID: 3,
  CONDITION_SWITCH_FLAG: 4,
  FIRST_VOICE_FILE: 5
};

var SwitchFlagType = {
  ON: "on",
  OFF: "off"
};

var UnitVoiceFolder = "UnitVoice";

var getVoiceExtension = function (index) {
  var extensions = ["ogg", "mp3", "wav"];
  return extensions[index];
};

var getCorrespondingRows = function (row) {
  var switchTable, switchIndex, switchFlag;
  var isSwitchCondition = true;
  if (typeof row[VoiceIndex.CONDITION_SWITCH_ID] === "number") {
    switchTable = root.getMetaSession().getGlobalSwitchTable();
    switchIndex = switchTable.getSwitchIndexFromId(row[VoiceIndex.CONDITION_SWITCH_ID]);
    switchFlag = switchTable.isSwitchOn(switchIndex);
    if (
      (row[VoiceIndex.CONDITION_SWITCH_FLAG] === SwitchFlagType.ON && switchFlag) ||
      (row[VoiceIndex.CONDITION_SWITCH_FLAG] === SwitchFlagType.OFF && !switchFlag)
    ) {
      isSwitchCondition = true;
    } else {
      isSwitchCondition = false;
    }
  }
  return isSwitchCondition && row[VoiceIndex.CORRESPONDING_ID] === this.correspondingId;
};

var getVoiceFiles = function (column, index) {
  return index >= VoiceIndex.FIRST_VOICE_FILE && typeof column === "string" && column;
};

var getVoices = function (unit, voiceType) {
  var voices;
  if (typeof unit.custom.voiceFile !== "string") {
    return [];
  }
  voices = readVoiceCSVFile(unit.custom.voiceFile);
  return voices.filter(function (voice) {
    return voice[VoiceIndex.VOICE_TYPE] === voiceType;
  });
};

var readVoiceCSVFile = function (file) {
  var csvString = root.getMaterialManager().getText(UnitVoiceFolder, file);
  var csvRows = csvString.split(/\r\n|\r|\n/);
  csvRows.splice(1);
  var csvColumns = [];

  csvRows.forEach(parseVoiceCSVRows, csvColumns);
  return csvColumns;
};

var parseVoiceCSVRows = function (row) {
  var columns = row.split(",");
  if (columns === undefined) {
    return;
  }
  this.push(columns.map(formattedColumn));
};

var formattedColumn = function (column) {
  var number = Number(column);
  return isNaN(number) || !column ? column : number;
};

// Array.filter poliyfill
// Reference:  https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/filter#polyfill
if (!Array.prototype.filter) {
  Array.prototype.filter = function (func, thisArg) {
    "use strict";
    if (!((typeof func === "Function" || typeof func === "function") && this)) throw new TypeError();

    var len = this.length >>> 0,
      res = new Array(len), // preallocate array
      t = this,
      c = 0,
      i = -1;

    var kValue;
    if (thisArg === undefined) {
      while (++i !== len) {
        // checks to see if the key was set
        if (i in this) {
          kValue = t[i]; // in case t is changed in callback
          if (func(t[i], i, t)) {
            res[c++] = kValue;
          }
        }
      }
    } else {
      while (++i !== len) {
        // checks to see if the key was set
        if (i in this) {
          kValue = t[i];
          if (func.call(thisArg, t[i], i, t)) {
            res[c++] = kValue;
          }
        }
      }
    }

    res.length = c; // shrink down array to proper size
    return res;
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

// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.io/#x15.4.4.19
if (!Array.prototype.map) {
  Array.prototype.map = function (callback /*, thisArg*/) {
    var T, A, k;

    if (this == null) {
      throw new TypeError("this is null or not defined");
    }

    // 1. Let O be the result of calling ToObject passing the |this|
    //    value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal
    //    method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== "function") {
      throw new TypeError(callback + " is not a function");
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (arguments.length > 1) {
      T = arguments[1];
    }

    // 6. Let A be a new array created as if by the expression new Array(len)
    //    where Array is the standard built-in constructor with that name and
    //    len is the value of len.
    A = new Array(len);

    // 7. Let k be 0
    k = 0;

    // 8. Repeat, while k < len
    while (k < len) {
      var kValue, mappedValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal
      //    method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {
        // i. Let kValue be the result of calling the Get internal
        //    method of O with argument Pk.
        kValue = O[k];

        // ii. Let mappedValue be the result of calling the Call internal
        //     method of callback with T as the this value and argument
        //     list containing kValue, k, and O.
        mappedValue = callback.call(T, kValue, k, O);

        // iii. Call the DefineOwnProperty internal method of A with arguments
        // Pk, Property Descriptor
        // { Value: mappedValue,
        //   Writable: true,
        //   Enumerable: true,
        //   Configurable: true },
        // and false.

        // In browsers that support Object.defineProperty, use the following:
        // Object.defineProperty(A, k, {
        //   value: mappedValue,
        //   writable: true,
        //   enumerable: true,
        //   configurable: true
        // });

        // For best browser support, use the following:
        A[k] = mappedValue;
      }
      // d. Increase k by 1.
      k++;
    }

    // 9. return A
    return A;
  };
}

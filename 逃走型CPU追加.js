/*--------------------------------------------------------------------------
　逃走型CPU追加 ver 1.0

■作成者
キュウブ

■概要
CPUに戦闘を極力避ける動きをする行動パターンを設定できるようになります。
本行動パターンは
・最低限の移動で戦闘を避けようとする
・避けられない場合は自分から戦闘を行うか、何もせずに待機する
という事しかしません。

したがって、用途としては
援軍を期待して持久戦をしている戦士のような、消極的に戦おうとする設定には向いていると思います。
一方で逃げ惑う市民といった設定には不向きです。

■注意点
本行動パターンでは戦闘だけでなくアイテムによる妨害も、戦闘とみなして避けるよう行動します。
敵勢力が自身に対してHPを回復させるといった利益しか及ぼさないような効果のアイテムも避けるようにします。

移動終了時点では戦闘を避けられる場所だったが、
直後に敵の進路を塞いでいた仲間が他の場所に移動してしまい、戦闘が避けられない地点になってしまうといった事は起こり得ます。
したがって、対象ユニットの行動順はなるべく最後尾にしておく事を推奨します。

■使い方
1.設定したいCPUの行動パターンをカスタムにして"avoidBattle"というキーワードを設定します。
2.設定したいCPUのカスタムパラメータの中に戦闘回避できない時の行動パターンを以下のように設定します。
※本パラメータの設定が無い場合はaの設定が適用されます。

a.自分から積極的に移動して戦闘させる場合
avoidBattleFailureType: AvoidBattleFailureType.APPROACH_BATTLE

b.その場で待機はするが、戦闘可能であれば戦闘させたい場合
avoidBattleFailureType: AvoidBattleFailureType.WAIT_BATTLE

c.その場で待機するだけで何もさせたくない場合
avoidBattleFailureType: AvoidBattleFailureType.WAIT_ONLY


■更新履歴
ver 1.0 2023/05/30
公開

■対応バージョン
SRPG Studio Version:1.161

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。
・クレジット明記無し　OK (明記する場合は"キュウブ"でお願いします)
・再配布、転載　OK (バグなどがあったらプルリクエストお願いします)
・SRPG Studio利用規約は遵守してください。

--------------------------------------------------------------------------*/

(function () {
  var _AutoActionBuilder_buildCustomAction =
    AutoActionBuilder.buildCustomAction;
  AutoActionBuilder.buildCustomAction = function (
    unit,
    autoActionArray,
    keyword
  ) {
    if (keyword === "avoidBattle") {
      return this.buildAvoidBattleAction(unit, autoActionArray);
    } else {
      return _AutoActionBuilder_buildCustomAction.apply(this, arguments);
    }
  };
})();

var AvoidBattleFailureType = {
  APPROACH_BATTLE: 0,
  WAIT_BATTLE: 1,
  WAIT_ONLY: 2
};

AutoActionBuilder.buildAvoidBattleAction = function (unit, autoActionArray) {
  var combination = CombinationManager.getAvoidBattleCombination(unit);
  var failureType =
    typeof unit.custom.avoidBattleFailureType === "number"
      ? unit.custom.avoidBattleFailureType
      : AvoidBattleFailureType.APPROACH_BATTLE;
  if (combination) {
    this._pushMove(unit, autoActionArray, combination);
  } else {
    if (failureType === AvoidBattleFailureType.APPROACH_BATTLE) {
      combination = CombinationManager.getApproachCombination(unit, true);
    } else if (failureType === AvoidBattleFailureType.WAIT_BATTLE) {
      combination = CombinationManager.getWaitCombination(unit);
    } else {
      combination = null;
    }
    if (combination) {
      this._pushGeneral(unit, autoActionArray, combination);
    } else {
      this._pushWait(unit, autoActionArray, combination);
    }
  }
  return true;
};

// 対象ユニットの戦闘可能な射程範囲を求める
// このスクリプトで言う「戦闘」とは武器による攻撃もしくは杖、アイテムによる妨害を指す
// 杖、アイテムに関しては敵対勢力が対象となっていれば射程範囲として考慮対象となる。
// ※利益を与えるような効果であっても場合も対象とする
UnitItemControl.getBattlableRange = function (unit) {
  var battlableRange = {
    min: 0,
    max: 0
  };
  var unitType = unit.getUnitType();
  var reverseUnitFilter = FilterControl.getReverseFilter(unitType);
  for (var index = 0; index < this.getPossessionItemCount(unit); index++) {
    var isBattlableItem = false;
    var item = this.getItem(unit, index);
    var isWeapon = item.isWeapon();
    if (!isWeapon) {
      isBattlableItem =
        item.getFilterFlag() | reverseUnitFilter &&
        ItemControl.isItemUsable(unit, item);
    } else {
      isBattlableItem = ItemControl.isWeaponAvailable(unit, item);
    }
    if (isBattlableItem) {
      var startRange, endRange;
      if (isWeapon) {
        startRange = item.getStartRange();
        endRange = item.getEndRange();
      } else {
        startRange = 0;
        endRange = item.getRangeValue();
      }
      if (battlableRange.min > startRange) {
        battlableRange.min = startRange;
      }
      if (battlableRange.max < endRange) {
        battlableRange.max = endRange;
      }
    }
  }
  return battlableRange;
};

CombinationManager.getAvoidBattleCombination = function (unit) {
  var that = this;
  var goalIndex, moveCource, combination;
  var unitPositionX = unit.getMapX();
  var unitPositionY = unit.getMapY();
  var minMoveValue = 500; //SRPGStudioでは500マス以上の移動は不可能なので500と設定
  var avoidableBattleIndexs = [];
  var unitMovableIndexs = [];
  var reverseUnitsBattlableIndexs = [];
  var unitMoveSimulator = root.getCurrentSession().createMapSimulator();
  var unitType = unit.getUnitType();
  var reverseUnitFilter = FilterControl.getReverseFilter(unitType);
  var unitAliveType = unit.getAliveState();
  var moveValue = ParamBonus.getMov(unit);
  var reverseUnitBattlableSimulator = root
    .getCurrentSession()
    .createMapSimulator();
  unitMoveSimulator.startSimulation(unit, moveValue);
  unitMovableIndexs = unitMoveSimulator.getSimulationIndexArray();
  // 本来は反対勢力に対してstartSimulationWeaponAllを使用して反対勢力の攻撃範囲を求めたい
  // しかし、ver1.161時点ではどのような引数を与えても、「敵軍」に関する計算しか行われない模様(バグと思われる)
  // 代替策としてユニット一体一体に対してstartSimulationWeaponを使用する
  unit.setAliveState(AliveType.ERASE);
  reverseUnitFilters = FilterControl.getListArray(reverseUnitFilter);
  reverseUnitFilters.forEach(function (reverseUnits) {
    // reverseUnitsは配列ではないためArrayの関数を使用できない
    // 可読性は下がるがfor文を使うことにする
    var reverseUnitsCount = reverseUnits.getCount();
    for (var index = 0; index < reverseUnitsCount; index++) {
      var reverseUnit = reverseUnits.getData(index);
      var reverseUnitMoveValue = ParamBonus.getMov(reverseUnit);
      var battlableRange = UnitItemControl.getBattlableRange(reverseUnit);
      reverseUnitBattlableSimulator.startSimulationWeapon(
        reverseUnit,
        reverseUnitMoveValue,
        battlableRange.min,
        battlableRange.max
      );
      var reverseUnitBattlableMoveIndexs =
        reverseUnitBattlableSimulator.getSimulationIndexArray();
      var reverseUnitBattlableWeaponIndexs =
        reverseUnitBattlableSimulator.getSimulationWeaponIndexArray();
      var reverseUnitBattlableIndexs = reverseUnitBattlableWeaponIndexs.concat(
        reverseUnitBattlableMoveIndexs
      );
      reverseUnitsBattlableIndexs = reverseUnitsBattlableIndexs.concat(
        reverseUnitBattlableIndexs
      );
    }
    unit.setAliveState(unitAliveType);
  });

  avoidableBattleIndexs = unitMovableIndexs.filter(function (movableIndex) {
    var avoidableBattle = reverseUnitsBattlableIndexs.every(function (
      reverseUnitsBattlableIndex
    ) {
      return reverseUnitsBattlableIndex !== movableIndex;
    });
    var positionX = CurrentMap.getX(movableIndex);
    var positionY = CurrentMap.getY(movableIndex);
    var waitable = that._getBlockUnit(unit, positionX, positionY) === null;
    return avoidableBattle && waitable;
  });

  if (avoidableBattleIndexs.length === 0) {
    return null;
  }

  goalIndex = avoidableBattleIndexs[0];
  // 戦闘回避可能なマスのうち、最も適切なマスを選択する
  // このスクリプトでは自信が最も移動する必要が無いマスを選択している
  // sort関数のpolyfillが見つからなかったのでforEachでどうにかする
  avoidableBattleIndexs.forEach(function (avoidableBattleIndex) {
    var avoidableBattlePositionX = CurrentMap.getX(avoidableBattleIndex);
    var avoidableBattlePositionY = CurrentMap.getY(avoidableBattleIndex);
    var distance =
      Math.abs(unitPositionX - avoidableBattlePositionX) +
      Math.abs(unitPositionY - avoidableBattlePositionY);
    if (minMoveValue > distance) {
      minMoveValue = distance;
      goalIndex = avoidableBattleIndex;
    }
  });

  moveCource = CourceBuilder.createExtendCource(
    unit,
    goalIndex,
    unitMoveSimulator
  );

  combination = StructureBuilder.buildCombination();
  combination.cource = moveCource;

  return combination;
};

// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
if (!Array.prototype["forEach"]) {
  Array.prototype.forEach = function (callback, thisArg) {
    if (this == null) {
      throw new TypeError(
        "Array.prototype.forEach called on null or undefined"
      );
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

// Array.filter poliyfill
// Reference: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/filter#polyfill
if (!Array.prototype.filter) {
  Array.prototype.filter = function (func, thisArg) {
    "use strict";
    if (!((typeof func === "Function" || typeof func === "function") && this))
      throw new TypeError();

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

// Array.every poliyfill
// Reference: https://udn.realityripple.com/docs/Web/JavaScript/Reference/Global_Objects/Array/every
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

/*--------------------------------------------------------------------------
　敵の攻撃を引き寄せるステート ver 1.0

■作成者
キュウブ

■概要
このステートをユニットに被せると
対象武器に関しては射程無視で全てのユニットから攻撃を受けるようになります。
また、他ユニットに狙いを定める事もできなくなります。

例:全敵ユニットの魔法が届いてしまうバッドステート

■注意点
> 他ユニットに狙いを定める事もできなくなります。
味方にこのステートを付与する場合は
敵が対象ユニット以外に手出しできなくなる事によって
ゲームバランスが壊れる可能性があるので注意

また、アイテムや杖には対応してません

■使い方
ステートのカスパラに以下のような設定を行います
forcedTargetWeapons:[
	{
		weaponCategoryTypeId: <対象武器カテゴリのID>,
		weaponTypeId: <対象武器タイプのID>
	}
	...
]

対象武器カテゴリのID
近接武器->0
弓->1
魔法->2
とします。
(定数でも良いので IDの部分は WeaponCategoryType.PHYSICS,WeaponCategoryType.SHOOT,WeaponCategoryType.MAGIC でも可)

例1.剣、槍だけ引き寄せたい場合
forcedTargetWeapons:[
	{
		weaponCategoryTypeId: 0,
		weaponTypeId: 0
	},
	{
		weaponCategoryTypeId: 0,
		weaponTypeId: 1
	}
]

例2.魔法だけ引き寄せたい場合
forcedTargetWeapons:[
	{
		weaponCategoryTypeId: 2,
		weaponTypeId: 0
	}
]

■更新履歴
ver 1.0 (2021/11/13)
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

StateControl.hasForcedTargetState = function(unit, weapon) {
	var state, isForcedTarget;
	var stateList = unit.getTurnStateList();
	var count = stateList.getCount();
	var weaponType = weapon.getWeaponType();
	var weaponCategoryTypeId = weaponType.getWeaponCategoryType();
	var weaponTypeId = weaponType.getId();

	for (var index = 0; index < count; index++) {
		state = stateList.getData(index).getState();
		if (!Array.isArray(state.custom.forcedTargetWeapons)) {
			continue;
		}
		isForcedTarget = state.custom.forcedTargetWeapons.some(
			function(forcedTargetWeapon) {
				return forcedTargetWeapon.weaponTypeId === weaponTypeId && 
					forcedTargetWeapon.weaponCategoryTypeId === weaponCategoryTypeId;
			}
		);
		if (isForcedTarget) {
			return true;
		}
	}
	return false;
};

AttackChecker.getForcedTargetUnitList = function(unit, weapon) {
	var unitType = unit.getUnitType();
	var reverseTypeFilter = FilterControl.getReverseFilter(unitType);
	var reverseUnitListArray = FilterControl.getListArray(reverseTypeFilter);
	var unitArray = [];
	var unitList = StructureBuilder.buildDataList();

	reverseUnitListArray.forEach(
		function(unitList){
			for (var index = 0; index < unitList.getCount(); index++) {
				var unit = unitList.getData(index);
				if (StateControl.hasForcedTargetState(unit, weapon)) {
					unitArray.push(unit);
					return;
				}
			}
		}
	);
	unitList.setDataArray(unitArray);

	return unitList;
};

(function(){
	var _AttackChecker_getAttackIndexArray = AttackChecker.getAttackIndexArray;
	AttackChecker.getAttackIndexArray = function(unit, weapon, isSingleCheck) {
		var targetUnit;
		var indexArray = [];
		var forcedTargetUnitList = AttackChecker.getForcedTargetUnitList(unit, weapon);
		var count = forcedTargetUnitList.getCount();
		if (count === 0) {
			return _AttackChecker_getAttackIndexArray.apply(this, arguments);
		}
		for (var index = 0; index < count; index++) {
			targetUnit = forcedTargetUnitList.getData(index);
			indexArray.push(CurrentMap.getIndex(targetUnit.getMapX(), targetUnit.getMapY()));
			if (isSingleCheck) {
				return indexArray;
			}
		}
		return indexArray;
	};

	var _CombinationCollector_Weapon__setUnitRangeCombination = CombinationCollector.Weapon._setUnitRangeCombination;
	CombinationCollector.Weapon._setUnitRangeCombination = function(misc, filter, rangeMetrics) {
		var targetUnit, score, combination;
		var unit = misc.unit;
		var unitMapX = unit.getMapX();
		var unitMapY = unit.getMapY();
		var forcedTargetUnitList = AttackChecker.getForcedTargetUnitList(unit, misc.item);
		var count = forcedTargetUnitList.getCount();
		if (count === 0) {
			_CombinationCollector_Weapon__setUnitRangeCombination.apply(this, arguments);
			return;
		}
		for (var index = 0; index < count; index++) {
			targetUnit = forcedTargetUnitList.getData(index);
			score = this._checkTargetScore(unit, targetUnit);
			if (score < 0) {
				continue;
			}
			misc.targetUnit = targetUnit;
			// 一歩も動く必要がないのでユニットの立ち位置のインデックスのみで構成される配列にする
			misc.indexArray = [CurrentMap.getIndex(unitMapX, unitMapY)];
			misc.rangeMetrics = rangeMetrics;		
			misc.costArray = this._createCostArray(misc);
			combination = this._createAndPushCombination(misc);
			combination.plusScore = score;
		}
	};

	var _AttackChecker__getFusionAttackIndexArray = AttackChecker.getFusionAttackIndexArray;
	AttackChecker.getFusionAttackIndexArray = function(unit, weapon, fusionData) {
		var targetUnit;
		var indexArray = [];
		var forcedTargetUnitList = AttackChecker.getForcedTargetUnitList(unit, weapon);
		var count = forcedTargetUnitList.getCount();
		if (count === 0) {
			return _AttackChecker__getFusionAttackIndexArray.apply(this, arguments);
		}
		for (var index = 0; index < count; index++) {
			targetUnit = forcedTargetUnitList.getData(index);
			indexArray.push(CurrentMap.getIndex(targetUnit.getMapX(), targetUnit.getMapY()));
			if (FusionControl.isAttackable(unit, targetUnit, fusionData) && FusionControl.isRangeAllowed(unit, targetUnit, fusionData)) {
				indexArray.push(CurrentMap.getIndex(targetUnit.getMapX(), targetUnit.getMapY()));
			}
		}
		return indexArray;
	}
})();

// ここから先は本スクリプトで使用しているポリフィル

// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18

if (!Array.prototype['forEach']) {

  Array.prototype.forEach = function(callback, thisArg) {

    if (this == null) { throw new TypeError('Array.prototype.forEach called on null or undefined'); }

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
    if (typeof callback !== "function") { throw new TypeError(callback + ' is not a function'); }

    // 5. If thisArg was supplied, let T be thisArg; else let
    // T be undefined.
    if (arguments.length > 1) { T = thisArg; }

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

// Production steps of ECMA-262, Edition 5, 15.4.4.17
// Reference: http://es5.github.io/#x15.4.4.17
if (!Array.prototype.some) {
  Array.prototype.some = function(fun, thisArg) {
    'use strict';

    if (this == null) {
      throw new TypeError('Array.prototype.some called on null or undefined');
    }

    if (typeof fun !== 'function') {
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

if (!Array.isArray) {
  Array.isArray = function(arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
  };
}
/*--------------------------------------------------------------------------
　特定状態のユニット数をイベントの条件に加える事ができる ver 1.1

■作成者
キュウブ

■概要
以下の条件のユニットの数を計算し、イベントの条件に加える事ができます。
・待機しているユニット数
・死亡したユニット数
・特定の状態異常を所持しているユニット数

例えば、
- 味方がX体行動済みの場合に発生するイベントやトラップ
- 敵ユニットがX体死亡すると発生するイベント
- 味方、敵問わず毒状態のユニットがX体になると発生するイベント
などが設定できるようになります。

■使い方
対象イベントの実行条件で
スクリプト->スクリプトを条件にする にて、

[1.待機しているユニット数を条件としたい場合]
SpecificStateUnitsCountCalculator.getWaitCount(<対象所属勢力>)
で待機ユニット数を受け取る事ができるので、これを用いて数値比較をします。
対象所属勢力は
自軍: UnitFilterFlag.PLAYER
敵軍: UnitFilterFlag.ENEMY
同盟群: 自軍: UnitFilterFlag.ALLY
となります。

例えば、
ex1-1.自軍ユニット2体以上の待機を条件としたい場合
SpecificStateUnitsCountCalculator.getWaitCount(UnitFilterFlag.PLAYER) >= 2;

ex1-2.敵軍ユニット3体の待機を条件としたい場合
SpecificStateUnitsCountCalculator.getWaitCount(UnitFilterFlag.ENEMY) === 3;
※ 等号3つ (===) を用います

ex1-3.同盟軍ユニット4体以下の待機を条件としたい場合
SpecificStateUnitsCountCalculator.getWaitCount(UnitFilterFlag.ALLY) <= 4;
というふうに記述します。


[2.死亡ユニット数を条件としたい場合]
SpecificStateUnitsCountCalculator.getDeathCount(<対象所属勢力>)
で死亡ユニット数を受け取る事ができるので、これを用いて数値比較をします。

例えば、
ex2-1.敵軍ユニット10体未満の死亡を条件としたい場合
SpecificStateUnitsCountCalculator.getDeathCount(UnitFilterFlag.ENEMY) < 10;

ex2-2.自軍ユニット5体以下の死亡を条件としたい場合
SpecificStateUnitsCountCalculator.getDeathCount(UnitFilterFlag.PLAYER) <= 5;
※自軍は負傷ではなく死亡数をカウントする事に注意

というふうに記述します。

[3.特定の状態異常を所持しているユニット数を条件としたい場合]
SpecificStateUnitsCountCalculator.getStateCount(<対象所属勢力>, <対象ステートID>)
でステート持ちのユニット数を受け取る事ができるので、これを用いて数値比較をします。

例えば、
ex3-1.敵軍ユニット3体以上がステートID:0(毒)である事を条件としたい場合
SpecificStateUnitsCountCalculator.getStateCount(UnitFilterFlag.ENEMY, 0) >= 3;


※ 下記のようにすれば複数勢力のユニット数をカウントする事ができます。
ex4-1.敵軍、同盟軍が合計30体死亡した事を条件としたい場合
SpecificStateUnitsCountCalculator.getDeathCount(UnitFilterFlag.ENEMY | UnitFilterFlag.ALLY) === 30;

ex4-2.自軍、敵軍、同盟軍で合計5体以上がステートID:0(毒)である事を条件としたい場合
SpecificStateUnitsCountCalculator.getStateCount(UnitFilterFlag.PLAYER | UnitFilterFlag.ENEMY | UnitFilterFlag.ALLY, 0) >= 5;

[注意点]
※待機状態は所属ターンが切り替わると解かれてしまいます。
よって、例えば「敵軍ターン時に味方ユニットの待機数がX体以上の時」といった条件を作る事はできません。

※自軍は最初のマップ～現在までの死亡数をカウントするのに対して、敵同盟軍は現在のマップ中での死亡数をカウントします。微妙に扱いが異なる事に注意してください。

ver 1.1 (2022/2/17)
カウント数が文字列になっていたバグを修正
※ver1.0では正しいカウントが全くできていませんでした。偶然うまく動いてただけの可能性があるので注意してください。

ver 1.0 (2021/7/1)
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

var SpecificStateUnitsCountCalculator = {
	getWaitCount: function (unitType) {
		var allWaitCount = 0;
		var filterList = FilterControl.getListArray(unitType);
		filterList.forEach(function (unitList) {
			var unit;
			var unitListCount = unitList.getCount();
			for (var index = 0; index < unitListCount; index++) {
				unit = unitList.getData(index);
				if (unit.isWait()) {
					allWaitCount++;
				}
			}
		});
		return allWaitCount;
	},

	getDeathCount: function (unitType) {
		var allDeathCount = 0;
		var filterList = FilterControl.getDeathListArray(unitType);
		filterList.forEach(function (unitList) {
			allDeathCount += unitList.getCount();
		});
		return allDeathCount;
	},

	getStateCount: function (unitType, stateId) {
		var filterList;
		var allStateCount = 0;
		var state = root.getBaseData().getStateList().getDataFromId(stateId);
		if (!state) {
			root.log("[WARN]SpecificStateUnitsCountCalculator.getStateCount");
			root.log("[WARN]State is not found");
			return 0;
		}
		filterList = FilterControl.getListArray(unitType);
		filterList.forEach(function (unitList) {
			var unit;
			var unitListCount = unitList.getCount();
			for (var index = 0; index < unitListCount; index++) {
				unit = unitList.getData(index);
				if (StateControl.getTurnState(unit, state)) {
					allStateCount++;
				}
			}
		});
		return allStateCount;
	}
};

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

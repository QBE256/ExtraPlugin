/*--------------------------------------------------------------------------
　反撃を封じるスキル ver1.0

■作成者
キュウブ

■概要
戦闘時に敵の反撃を封じるスキル:SealCounter
戦闘時に自分の反撃を封じるスキル:EndureCounter
となります。

カスタムスキルでカスタムキーワードを"SealCounter"、もしくは"EndureCounter"と設定します。

有効相手を設定する事も可能です。
例えば、EndureCounterスキルを使う事で「特定のキャラにのみ反撃できない敵」を作ったりする事も可

■更新履歴
ver 1.0 (2022/03/15)
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

(function () {
	var _AttackChecker_isCounterattack = AttackChecker.isCounterattack;
	AttackChecker.isCounterattack = function (unit, targetUnit) {
		var counterRestrictionSkills;
		counterRestrictionSkills = SkillControl.getDirectSkillArray(unit, SkillType.CUSTOM, "SealCounter");
		if (this._hasEnableCounterRestrictionSkill(targetUnit, counterRestrictionSkills)) {
			return false;
		}
		counterRestrictionSkills = SkillControl.getDirectSkillArray(targetUnit, SkillType.CUSTOM, "EndureCounter");
		if (this._hasEnableCounterRestrictionSkill(unit, counterRestrictionSkills)) {
			return false;
		}
		return _AttackChecker_isCounterattack.apply(this, arguments);
	};

	AttackChecker._hasEnableCounterRestrictionSkill = function (passiveUnit, counterRestrictionSkills) {
		var filterSkills = counterRestrictionSkills.filter(function (skillData) {
			return skillData.skill.getTargetAggregation().isCondition(passiveUnit);
		});
		return filterSkills.length > 0;
	};
})();

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

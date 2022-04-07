;/*
自ターン攻撃時に物理or魔法攻撃力を強化するスキル ver1.0

■作成者
キュウブ

自ターン攻撃時(つまり先制攻撃時)に指定のステータス分攻撃力を強化する

■使い方
カスタムキーワード"ActiveAttackEnhance"を設定
カスタムパラメータで以下を設定
{
	activeAttackEnhance:{
	 	isPhysics: <物理攻撃に反映したい場合はtrue,魔法攻撃に反映したい場合はfalse>
		value: <加算する値を指定>
	}
}

例えば、下記の場合は先制時に物理攻撃が6ダメージ増加する
{
	activeAttackEnhance:{
	 	isPhysics: true,
		value: 6
	}
}

更新履歴
ver 1.0 2022/04/07
初版

■対応バージョン
SRPG Studio Version:1.161

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。
・クレジット明記無し　OK (明記する場合は"キュウブ"でお願いします)
・再配布、転載　OK (バグなどがあったらプルリクエストしてくださると嬉しいです)
・wiki掲載　OK
・SRPG Studio利用規約は遵守してください。
*/


(function(){
	var _DamageCalculator_calculateAttackPower = DamageCalculator.calculateAttackPower;
	DamageCalculator.calculateAttackPower = function(active, passive, weapon, isCritical, totalStatus, trueHitValue) {
		var pow = _DamageCalculator_calculateAttackPower.apply(this, arguments);
		var turnType = root.getCurrentSession().getTurnType();
		var unitType = active.getUnitType();
		var skill = SkillControl.getPossessionCustomSkill(active, 'ActiveAttackEnhance');

		if (!skill) {
			return pow;
		}
		if (skill.custom.activeAttackEnhance.isPhysics !== Miscellaneous.isPhysicsBattle(weapon)) {
			return pow;
		}
		if (
			(unitType === UnitType.PLAYER && turnType === TurnType.PLAYER) ||
			(unitType === UnitType.ENEMY && turnType === TurnType.ENEMY) ||
			(unitType === UnitType.ALLY && turnType === TurnType.ALLY)
		) {
			pow += skill.custom.activeAttackEnhance.value;
		}
		return pow;
	};
})();
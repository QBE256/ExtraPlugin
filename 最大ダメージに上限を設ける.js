// ダメージの上限を設定します。それだけ。
var MAX_DAMAGE = 255;//ここにダメージ上限値を入力します
(function(){

	var alias = DamageCalculator.validValue;
	DamageCalculator.validValue = function(active, passive, weapon, damage) {
		var damage = alias.call(this, active, passive, weapon, damage);

		if (damage > MAX_DAMAGE) {
			damage = MAX_DAMAGE;
		}
		
		return damage;
	}
});
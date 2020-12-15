// 攻撃力20未満の時は1,20以上の時は(攻撃力÷10)+1 を通常攻撃の最低ダメージとする
// ※最小化攻撃やダメージ半減などの特殊効果を受ければ最低ダメージ未満にはなる

DamageCalculator.calculateDamage = function(active, passive, weapon, isCritical, activeTotalStatus, passiveTotalStatus, trueHitValue) {
	var pow, def, damage, minNormalDamage;
		
	if (this.isHpMinimum(active, passive, weapon, isCritical, trueHitValue)) {
		return -1;
	}
		
	pow = this.calculateAttackPower(active, passive, weapon, isCritical, activeTotalStatus, trueHitValue);
	def = this.calculateDefense(active, passive, weapon, isCritical, passiveTotalStatus, trueHitValue);
		
	damage = pow - def;
	minNormalDamage = this._calculateMinNormalDamage(pow);

	// 通常ダメージが最低ダメージを上回っていた場合は、ダメージ量を上書きする
	// その後のクリティカル補正やダメージ半減効果の処理は受ける
	if (damage < minNormalDamage) {
		damage = minNormalDamage;
	}

	if (this.isHalveAttack(active, passive, weapon, isCritical, trueHitValue)) {
		if (!this.isHalveAttackBreak(active, passive, weapon, isCritical, trueHitValue)) {
			damage = Math.floor(damage / 2);
		}
	}
		
	if (this.isCritical(active, passive, weapon, isCritical, trueHitValue)) {
		damage = Math.floor(damage * this.getCriticalFactor());
	}
		
	return this.validValue(active, passive, weapon, damage);
};

/*
 攻撃力20未満の時は1,20以上の時は(攻撃力÷10)+1 を通常攻撃の最低ダメージとする
 変更したい時はここの計算式をいじる
*/
DamageCalculator._calculateMinNormalDamage = function(pow) {
	if (pow < 20) {
		return 1;
	}
	else {
		return Math.floor(pow / 10) + 1;
	}
};
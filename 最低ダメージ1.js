// 最低ダメージが1になります 以上
DefineControl.getMinDamage = function () {
  return 1;
};

AttackEvaluator.ActiveAction._arrangePassiveDamage = function (
  virtualActive,
  virtualPassive,
  attackEntry
) {
  var minDamage;
  var damagePassive = attackEntry.damagePassive;
  var value = this._getDamageGuardValue(
    virtualActive,
    virtualPassive,
    attackEntry
  );

  if (value !== -1) {
    value = 100 - value;
    damagePassive = Math.floor(damagePassive * (value / 100));
    minDamage = DefineControl.getMinDamage();
    if (minDamage > damagePassive) {
      damagePassive = minDamage;
    }
  }

  if (virtualPassive.hp - damagePassive < 0) {
    damagePassive = virtualPassive.hp;
  } else {
    attackEntry.damagePassiveFull = damagePassive;
  }

  return damagePassive;
};
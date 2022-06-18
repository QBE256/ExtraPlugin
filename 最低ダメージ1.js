// 最低ダメージが1になります
// ダメージガードスキルは軽減率を100%にした場合0ダメージ
// 99%以下の場合は1ダメージが保障されます
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
    enableMinDamage = minDamage > damagePassive && value === 0;
    if (enableMinDamage) {
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
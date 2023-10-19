Calculator.calculateResurrectionValue = function (unit, info) {
  var type = info.getResurrectionType();
  if (type === ResurrectionType.MIN) {
    return 1;
  } else if (type === ResurrectionType.HALF) {
    return Math.floor(ParamBonus.getMhp(unit) / 2);
  } else {
    return ParamBonus.getMhp(unit);
  }
};

DamageCalculator.calculateWandDamage = function (active, passive, wand) {
  var itemType = wand.getItemType();

  if (itemType === ItemType.RECOVERY) {
    var plus = Calculator.calculateRecoveryItemPlus(active, passive, wand);
    var info = wand.getRecoveryInfo();
    var value = info.getRecoveryValue();
    var type = info.getRecoveryType();

    return -1 * Calculator.calculateRecoveryValue(passive, value, type, plus);
  } else if (itemType === ItemType.DAMAGE) {
    var plus = Calculator.calculateDamageItemPlus(active, passive, wand);
    var info = wand.getDamageInfo();
    var value = info.getDamageValue();
    var type = info.getDamageType();

    return Calculator.calculateDamageValue(passive, value, type, plus);
  } else if (itemType === ItemType.RESURRECTION) {
    var info = wand.getResurrectionInfo();

    return -1 * Calculator.calculateResurrectionValue(passive, info);
  }

  return 0;
};

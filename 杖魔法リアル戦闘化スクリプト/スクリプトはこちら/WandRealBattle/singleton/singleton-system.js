AttackChecker.getWandAttackStatusInternal = function (unit, wand, targetUnit) {
  if (!wand.isWand()) {
    return this.getNonStatus();
  }
  var attackStatuses = new Array(3);
  var itemType = wand.getItemType();
  if (itemType === ItemType.STATE) {
    attackStatuses[0] = 0;
    attackStatuses[1] = Probability.getAddStateWandInvocationPercent(unit, wand, targetUnit);
    attackStatuses[2] = 0;
  } else if (itemType === ItemType.DAMAGE) {
    attackStatuses[0] = Calculator.calculateDamageValue(
      targetUnit,
      wand.getDamageInfo().getDamageValue(),
      wand.getDamageInfo().getDamageType(),
      Calculator.calculateDamageItemPlus(unit, targetUnit, wand)
    );
    attackStatuses[1] = 100;
    attackStatuses[2] = 0;
  } else {
    attackStatuses = this.getNonStatus();
  }

  return attackStatuses;
};

Probability.getAddStateWandInvocationPercent = function (unit, wand, targetUnit) {
  var stateInvocation = wand.getStateInfo().getStateInvocation();
  var type = stateInvocation.getInvocationType();
  var value = stateInvocation.getInvocationValue();
  var percent = 100;

  if (type === InvocationType.HPDOWN) {
    var rate = value / 100;
    var currentHp = ParamBonus.getMhp(unit) * rate;
    if (unit.getHp() <= currentHp) {
      percent = Probability.getMaxPercent();
    } else {
      percent = 0;
    }
  } else if (type === InvocationType.ABSOLUTE) {
    percent = value;
  } else if (type === InvocationType.LV) {
    percent = unit.getLv() * value;
  } else {
    if (DataConfig.isSkillInvocationBonusEnabled()) {
      percent = ParamBonus.getBonus(unit, type) * value;
    } else {
      percent = unit.getParamValue(type) * value;
    }
  }

  if (percent > this.getMaxPercent()) {
    percent = this.getMaxPercent();
  } else if (percent < 0) {
    percent = 0;
  }
  return percent;
};

WeaponEffectControl.getWandAnime = function (unit, type) {
  var anime = null;
  var wand = BattlerChecker.getRealBattleWand(unit);
  var effects;

  if (!!wand) {
    if (WandAnimationValidatiors.isValidItemSetting(wand, WeaponEffectAnime.MAGICWEAPON)) {
      effects = root.getBaseData().getEffectAnimationList(wand.custom.real_setting.effect.runtime);
      anime = effects.getDataFromId(wand.custom.real_setting.effect.id);
    } else if (WandAnimationValidatiors.isValidItemSetting(wand, WeaponEffectAnime.MAGICINVOCATION)) {
      effects = root.getBaseData().getEffectAnimationList(wand.custom.real_setting.invocation.runtime);
      anime = effects.getDataFromId(wand.custom.real_setting.invocation.id);
    }

    if (!anime && type === WeaponEffectAnime.MAGICINVOCATION) {
      anime = root.queryAnime("magicinvocation");
    }
  }

  return anime;
};

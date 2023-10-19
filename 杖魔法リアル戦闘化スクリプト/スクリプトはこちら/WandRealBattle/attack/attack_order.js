var NormalWandOrderBuilder = defineObject(NormalAttackOrderBuilder, {
  _startVirtualAttack: function () {
    var virtualActive, virtualPassive;
    var unitSrc = this._attackInfo.unitSrc;
    var unitDest = this._attackInfo.unitDest;

    virtualActive = VirtualAttackControl.createVirtualWandUnit(unitSrc, unitDest, true, this._attackInfo);
    virtualPassive = VirtualAttackControl.createVirtualWandTargetUnit(unitDest, unitSrc, false, this._attackInfo);

    virtualActive.isWeaponLimitless = DamageCalculator.isWeaponLimitless(unitSrc, unitDest, virtualActive.weapon);
    virtualPassive.isWeaponLimitless = DamageCalculator.isWeaponLimitless(unitDest, unitSrc, virtualPassive.weapon);
    virtualActive.isInitiative = true;

    isFinal = this._setDamage(virtualActive, virtualPassive);
    this._endVirtualAttack(virtualActive, virtualPassive);
  },

  _setDamage: function (virtualActive, virtualPassive) {
    var attackEntry;
    attackEntry = this._createAndRegisterAttackEntry(virtualActive, virtualPassive);

    if (!virtualActive.isWeaponLimitless) {
      this._decreaseWeaponLimit(virtualActive, virtualPassive, attackEntry);
    }
    return attackEntry.isFinish;
  },

  _createAndRegisterAttackEntry: function (virtualActive, virtualPassive) {
    var that = this;

    var attackEntry = this._order.createAttackEntry();
    attackEntry.isSrc = virtualActive.isSrc;
    attackEntry.isFirstAttack = virtualActive.isFirstAttack;
    this._setInitialSkill(virtualActive, virtualPassive, attackEntry);
    this._evaluatorArray.forEach(function (evaluatorArray) {
      evaluatorArray.setParentOrderBuilder(that);
      evaluatorArray.evaluateAttackEntry(virtualActive, virtualPassive, attackEntry);
    });
    this._order.registerAttackEntry(attackEntry);
    virtualActive.isFirstAttack = false;

    return attackEntry;
  },

  _decreaseWeaponLimit: function (virtualActive, virtualPassive, attackEntry) {
    var weapon = virtualActive.weapon;
    if (!weapon) {
      return;
    }
    attackEntry.isItemDecrement = true;
    virtualActive.weaponUseCount++;
  },

  _setInitialSkill: function (virtualActive) {
    virtualActive.skillFastAttack = null;
    virtualActive.skillContinuousAttack = null;
  },

  _calculateExperience: function (virtualActive, virtualPassive) {
    var unit = virtualActive.unitSelf;
    if (unit.getUnitType() === UnitType.PLAYER) {
      var exp = virtualActive.weapon.getExp();
      return ExperienceCalculator.getBestExperience(unit, exp);
    } else {
      return 0;
    }
  },
  _isSealAttack: function () {
    return false;
  },
  _isSealAttackBreak: function () {
    return false;
  },
  _endVirtualAttack: function (virtualActive, virtualPassive) {
    var exp = this._calculateExperience(virtualActive, virtualPassive);
    var waitIdSrc = MotionIdControl.getWandWaitIdSrc(virtualActive.unitSelf, virtualActive.weapon);
    var waitIdDest = MotionIdControl.getWandWaitIdDest(
      virtualPassive.unitSelf,
      virtualPassive.weapon,
      virtualActive.weapon.getItemType()
    );

    this._order.registerExp(exp);
    this._order.registerBaseInfo(this._attackInfo, waitIdSrc, waitIdDest);
    if (isUsedWeaponLevelScript()) {
      this._calculateWeaponExp(virtualActive, virtualPassive);
    }
  },

  _configureEvaluator: function (groupArray) {
    groupArray.appendObject(AttackEvaluator.WandHitCritical);
    groupArray.appendObject(AttackEvaluator.ActiveWandAction);
    groupArray.appendObject(AttackEvaluator.PassiveWandAction);

    groupArray.appendObject(AttackEvaluator.TotalDamage);

    groupArray.appendObject(AttackEvaluator.AttackMotion);
    groupArray.appendObject(AttackEvaluator.WandDamageMotion);
  }
});

VirtualAttackControl.createVirtualWandUnit = function (unitSelf, targetUnit, isSrc, attackInfo) {
  var virtualAttackUnit = StructureBuilder.buildVirtualAttackUnit();

  virtualAttackUnit.unitSelf = unitSelf;
  virtualAttackUnit.hp = unitSelf.getHp();
  virtualAttackUnit.weapon = BattlerChecker.getRealBattleWand(unitSelf);
  virtualAttackUnit.isSrc = isSrc;
  virtualAttackUnit.isCounterattack = false;
  virtualAttackUnit.stateArray = [];
  virtualAttackUnit.totalStatus = SupportCalculator.createTotalStatus(unitSelf);

  this._setStateArray(virtualAttackUnit);

  virtualAttackUnit.attackCount = 1;
  virtualAttackUnit.roundCount = 1;

  return virtualAttackUnit;
};

VirtualAttackControl.createVirtualWandTargetUnit = function (unitSelf, targetUnit, isSrc, attackInfo) {
  var virtualAttackUnit = StructureBuilder.buildVirtualAttackUnit();

  virtualAttackUnit.unitSelf = unitSelf;
  virtualAttackUnit.hp = unitSelf.getHp();
  virtualAttackUnit.weapon = BattlerChecker.getRealBattleWeapon(unitSelf);
  virtualAttackUnit.isSrc = isSrc;
  virtualAttackUnit.isCounterattack = false;
  virtualAttackUnit.stateArray = [];
  virtualAttackUnit.totalStatus = SupportCalculator.createTotalStatus(unitSelf);

  this._setStateArray(virtualAttackUnit);

  virtualAttackUnit.attackCount = 0;
  virtualAttackUnit.roundCount = 0;

  return virtualAttackUnit;
};

AttackEvaluator.WandHitCritical = defineObject(AttackEvaluator.HitCritical, {
  evaluateAttackEntry: function (virtualActive, virtualPassive, attackEntry) {
    attackEntry.isHit = true;
    attackEntry.isCritical = false;
    attackEntry.damagePassive = this.calculateDamage(virtualActive, virtualPassive, attackEntry);

    if (virtualActive.weapon.getItemType() === ItemType.STATE) {
      this._checkStateAttack(virtualActive, virtualPassive, attackEntry);
    }
  },

  calculateDamage: function (virtualActive, virtualPassive, attackEntry) {
    return DamageCalculator.calculateWandDamage(virtualActive.unitSelf, virtualPassive.unitSelf, virtualActive.weapon);
  },

  _checkStateAttack: function (virtualActive, virtualPassive, attackEntry) {
    var state = null;
    var stateInfo = virtualActive.weapon.getStateInfo();

    if (!!stateInfo) {
      state = StateControl.checkStateInvocation(virtualActive.unitSelf, virtualPassive.unitSelf, stateInfo);
      if (!!state) {
        attackEntry.stateArrayPassive.push(state);
        virtualPassive.stateArray.push(state);
        attackEntry.isHit = true;
      } else {
        attackEntry.isHit = false;
      }
    }
  }
});

AttackEvaluator.WandDamageMotion = defineObject(AttackEvaluator.DamageMotion, {
  _getDamageMotionId: function (virtualActive, virtualPassive, attackEntry) {
    var midData = MotionIdControl.createMotionIdData(
      virtualPassive,
      virtualActive,
      attackEntry,
      virtualPassive.motionDamageCount
    );

    MotionIdControl.getWandDamageId(midData, virtualActive.weapon);

    virtualPassive.motionDamageCount++;

    return midData;
  }
});

AttackEvaluator.ActiveWandAction = defineObject(AttackEvaluator.ActiveAction, {
  _arrangePassiveDamage: function (virtualActive, virtualPassive, attackEntry) {
    var damagePassive = attackEntry.damagePassive;
    var restHp = virtualPassive.hp - damagePassive;
    var maxHp = ParamBonus.getMhp(virtualPassive.unitSelf);

    if (restHp < 0) {
      damagePassive = virtualPassive.hp;
    } else if (restHp > maxHp) {
      damagePassive = virtualPassive.hp - maxHp;
    }

    return damagePassive;
  },

  _isAbsorption: function (virtualActive, virtualPassive, attackEntry) {
    return false;
  }
});

AttackEvaluator.PassiveWandAction = defineObject(AttackEvaluator.PassiveAction, {
  evaluateAttackEntry: function (virtualActive, virtualPassive, attackEntry) {
    return;
  }
});

MotionIdControl.getMagicId = function (midData) {
  var collection;

  if (midData.weapon !== null && !midData.weapon.isWand()) {
    collection = midData.weapon.getMotionIdCollection();
    this._getMagicIdInternal(collection, midData);
  }

  if (midData.id === MotionIdValue.NONE || midData.weapon.isWand()) {
    collection = midData.cls.getMotionIdCollection();
    this._getMagicIdInternal(collection, midData);
  }
};

MotionIdControl.getWandWaitIdSrc = function (unit, wand) {
  var anime;
  var id = MotionIdValue.NONE;
  var cls = BattlerChecker.getRealBattleClass(unit, wand);
  var attackTemplateType = AttackTemplateType.MAGE;

  if (!!wand && wand.isWand()) {
    anime = cls.getClassAnime(attackTemplateType);
    id = this._getWandWaitIdInternal(anime, wand);
  }
  if (id === MotionIdValue.NONE) {
    id = this.getWaitId(unit, wand);
  }
  return id;
};

MotionIdControl._getWandWaitIdInternal = function (anime, weapon) {
  var id = MotionIdValue.NONE;

  if (WandAnimationValidatiors.isValidWandSetting(anime, true)) {
    id = anime.custom.wand_setting.wand.wait_id;
  }

  return id;
};

MotionIdControl.getWandWaitIdDest = function (unit, weapon, type) {
  var anime;
  var id = MotionIdValue.NONE;
  var cls = BattlerChecker.getRealBattleClass(unit, weapon);
  var attackTemplateType = BattlerChecker.findAttackTemplateType(cls, weapon);

  if (type === ItemType.RESURRECTION) {
    anime = cls.getClassAnime(attackTemplateType);
    id = this._getResurrectionWaitIdInternal(anime);
  } else if (type === ItemType.RESCUE) {
    anime = cls.getClassAnime(attackTemplateType);
    id = this._getRescueWaitIdInternal(anime);
  } else if (type === ItemType.QUICK) {
    anime = cls.getClassAnime(attackTemplateType);
    id = this._getQuickWaitIdInternal(anime);
  }

  if (id === MotionIdValue.NONE) {
    id = this.getWaitId(unit, weapon);
  }

  return id;
};
MotionIdControl._getResurrectionWaitIdInternal = function (anime) {
  var id = MotionIdValue.NONE;

  if (WandAnimationValidatiors.isValidWandSetting(anime, false, ItemType.RESURRECTION)) {
    id = anime.custom.wand_setting.resurrection.wait_id;
  }

  return id;
};

MotionIdControl._getRescueWaitIdInternal = function (anime) {
  var id = MotionIdValue.NONE;

  if (WandAnimationValidatiors.isValidWandSetting(anime, false, ItemType.RESCUE)) {
    id = anime.custom.wand_setting.rescue.wait_id;
  }

  return id;
};

MotionIdControl._getQuickWaitIdInternal = function (anime) {
  var id = MotionIdValue.NONE;

  if (WandAnimationValidatiors.isValidWandSetting(anime, false, ItemType.QUICK)) {
    id = anime.custom.wand_setting.quick.wait_id;
  }

  return id;
};

MotionIdControl.getWandDamageId = function (midData, wand) {
  var itemType = wand.getItemType();
  if (itemType === ItemType.DAMAGE) {
    this.getDamageId(midData);
  } else if (itemType === ItemType.RESURRECTION) {
    this.getResurrectionId(midData);
  } else if (itemType === ItemType.RESCUE) {
    this.getRescueId(midData);
  } else if (itemType === ItemType.TELEPORTATION) {
    this.getTeleportationId(midData);
  } else if (itemType === ItemType.QUICK) {
    this.getQuickId(midData);
  } else {
    midData.id = MotionIdValue.NONE;
    midData.type = -1;
  }
};

MotionIdControl.getResurrectionId = function (midData) {
  var anime;

  anime = midData.cls.getClassAnime(midData.attackTemplateType);
  this._getResurrectionIdInternal(anime, midData);
};

MotionIdControl.getRescueId = function (midData) {
  var anime;

  anime = midData.cls.getClassAnime(midData.attackTemplateType);
  this._getRescueIdInternal(anime, midData);
};

MotionIdControl.getTeleportationId = function (midData) {
  var anime;

  anime = midData.cls.getClassAnime(midData.attackTemplateType);
  this._getTeleportationIdInternal(anime, midData);
};

MotionIdControl.getQuickId = function (midData) {
  var anime;

  anime = midData.cls.getClassAnime(midData.attackTemplateType);
  this._getQuickIdInternal(anime, midData);
};

MotionIdControl._getResurrectionIdInternal = function (anime, midData) {
  if (WandAnimationValidatiors.isValidWandSetting(anime, false, ItemType.RESURRECTION)) {
    if (midData.attackTemplateType === AttackTemplateType.FIGHTER) {
      midData.type = MotionFighter.DAMAGE;
    } else if (midData.attackTemplateType === AttackTemplateType.ARCHER) {
      midData.type = MotionArcher.DAMAGE;
    } else if (midData.attackTemplateType === AttackTemplateType.MAGE) {
      midData.type = MotionMage.DAMAGE;
    }
    midData.id = anime.custom.wand_setting.resurrection.recovery_id;
  } else {
    midData.id = MotionIdValue.NONE;
    midData.type = -1;
  }
};

MotionIdControl._getRescueIdInternal = function (anime, midData) {
  if (WandAnimationValidatiors.isValidWandSetting(anime, false, ItemType.RESCUE)) {
    if (midData.attackTemplateType === AttackTemplateType.FIGHTER) {
      midData.type = MotionFighter.DAMAGE;
    } else if (midData.attackTemplateType === AttackTemplateType.ARCHER) {
      midData.type = MotionArcher.DAMAGE;
    } else if (midData.attackTemplateType === AttackTemplateType.MAGE) {
      midData.type = MotionMage.DAMAGE;
    }
    midData.id = anime.custom.wand_setting.rescue.rescue_id;
  } else {
    midData.id = MotionIdValue.NONE;
    midData.type = -1;
  }
};

MotionIdControl._getTeleportationIdInternal = function (anime, midData) {
  if (WandAnimationValidatiors.isValidWandSetting(anime, false, ItemType.TELEPORTATION)) {
    if (midData.attackTemplateType === AttackTemplateType.FIGHTER) {
      midData.type = MotionFighter.DAMAGE;
    } else if (midData.attackTemplateType === AttackTemplateType.ARCHER) {
      midData.type = MotionArcher.DAMAGE;
    } else if (midData.attackTemplateType === AttackTemplateType.MAGE) {
      midData.type = MotionMage.DAMAGE;
    }
    midData.id = anime.custom.wand_setting.teleportation.teleportation_id;
  } else {
    midData.id = MotionIdValue.NONE;
    midData.type = -1;
  }
};

MotionIdControl._getQuickIdInternal = function (anime, midData) {
  if (WandAnimationValidatiors.isValidWandSetting(anime, false, ItemType.QUICK)) {
    if (midData.attackTemplateType === AttackTemplateType.FIGHTER) {
      midData.type = MotionFighter.DAMAGE;
    } else if (midData.attackTemplateType === AttackTemplateType.ARCHER) {
      midData.type = MotionArcher.DAMAGE;
    } else if (midData.attackTemplateType === AttackTemplateType.MAGE) {
      midData.type = MotionMage.DAMAGE;
    }
    midData.id = anime.custom.wand_setting.quick.quick_id;
  } else {
    midData.id = MotionIdValue.NONE;
    midData.type = -1;
  }
};

(function () {
  var _MotionIdControl__getMagicIdInternal = MotionIdControl._getMagicIdInternal;
  MotionIdControl._getMagicIdInternal = function (collection, midData) {
    _MotionIdControl__getMagicIdInternal.apply(this, arguments);

    var anime = midData.cls.getClassAnime(AttackTemplateType.MAGE);
    if (midData.weapon.isWand() && WandAnimationValidatiors.isValidWandSetting(anime, true)) {
      midData.id = anime.custom.wand_setting.wand.attack_id;
    }
  };
})();

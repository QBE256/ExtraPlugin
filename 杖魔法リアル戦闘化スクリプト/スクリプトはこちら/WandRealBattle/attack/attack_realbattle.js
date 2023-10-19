var RealWandBattle = defineObject(RealBattle, {
  _prepareBattleMemberData: function (coreAttack) {
    RealBattle._prepareBattleMemberData.call(this, coreAttack);
    this._battleTable = createObject(RealWandTable);
    this._uiBattleLayout = createObject(UIWandBattleLayout);
  },

  _createBattler: function () {
    var unitSrc = this._attackInfo.unitSrc;
    var unitDest = this._attackInfo.unitDest;
    var isRight = Miscellaneous.isUnitSrcPriority(unitSrc, unitDest);
    var versusType = this._getVersusType(unitSrc, unitDest);

    if (isRight) {
      this._battlerRight = createObject(this._getWandBattlerObject(unitSrc));
      this._battlerLeft = createObject(this._getBattlerObject(unitDest));
      this._setBattlerData(this._battlerRight, unitSrc, true, true, versusType);
      this._setBattlerData(this._battlerLeft, unitDest, false, false, versusType);
    } else {
      this._battlerRight = createObject(this._getBattlerObject(unitDest));
      this._battlerLeft = createObject(this._getWandBattlerObject(unitSrc));
      this._setBattlerData(this._battlerRight, unitDest, false, true, versusType);
      this._setBattlerData(this._battlerLeft, unitSrc, true, false, versusType);
    }
  },

  _checkDamage: function (unit, damage, battler) {
    var order = this._order;
    var isCritical = order.isCurrentCritical();
    var isFinish = order.isCurrentFinish();

    if (damage > 0) {
      WeaponEffectControl.playDamageSound(unit, isCritical, isFinish);
    }

    this._uiBattleLayout.setDamage(battler, damage, isCritical, isFinish);
  },

  _setBattlerData: function (battler, unit, isSrc, isRight, versusType) {
    var attackInfo = this.getAttackInfo();

    if (unit === attackInfo.unitSrc) {
      var order = this.getAttackOrder();
      var motionParam = StructureBuilder.buildMotionParam();
      motionParam.animeData = unit.getClass().getClassAnime(WeaponCategoryType.MAGIC);
      motionParam.unit = unit;
      motionParam.isRight = isRight;
      motionParam.motionColorIndex = Miscellaneous.getMotionColorIndex(unit);
      motionParam.motionId = order.getWaitIdSrc();
      motionParam.versusType = versusType;
      var pos = BattlerPosChecker.getRealInitialPos(motionParam, isSrc, order);
      motionParam.x = pos.x;
      motionParam.y = pos.y;

      battler.setupRealBattler(motionParam, isSrc, this);
    } else {
      RealBattle._setBattlerData.apply(this, arguments);
    }
  },

  _getWandBattlerObject: function (unit) {
    var object = WandBattler;

    return object;
  }
});

var UIWandBattleLayout = defineObject(UIBattleLayout, {
  setBattlerAndParent: function (battlerRight, battlerLeft, realBattle) {
    UIBattleLayout.setBattlerAndParent.apply(this, arguments);
    if (battlerRight.isSrc()) {
      var unit = battlerRight.getUnit();
      this._itemRight = BattlerChecker.getRealBattleWand(unit);
    } else {
      var unit = battlerLeft.getUnit();
      this._itemLeft = BattlerChecker.getRealBattleWand(unit);
    }
  },

  _getAttackStatus: function (unit, targetUnit, isSrc) {
    var attackStatus;
    if (isSrc) {
      var wand = BattlerChecker.getRealBattleWand(unit);
      attackStatus = AttackChecker.getWandAttackStatusInternal(unit, wand, targetUnit);
    } else {
      attackStatus = AttackChecker.getNonStatus();
    }
    return attackStatus;
  },

  setDamage: function (battler, damage, isCritical, isFinish) {
    if (damage === 0) {
      return;
    } else {
      UIBattleLayout.setDamage.apply(this, arguments);
    }
  },

  _showDamageAnime: function (battler, isCritical, isFinish) {
    if (this._realBattle.getAttackOrder().getPassiveDamage() === 0) {
      return;
    }

    UIBattleLayout._showDamageAnime.apply(this, arguments);
  }
});

var WandBattler = defineObject(MagicBattler, {
  setupRealBattler: function (motionParam, isSrc, realBattle) {
    this._unit = motionParam.unit;
    this._isSrc = isSrc;
    this._motion = createObject(AnimeMotion);
    this._realBattle = realBattle;

    this._motion.setWandAttackMotionParam(motionParam);
    this._setWapon();

    this._isWaitLoopZone = this._checkNewFrame();
  },

  _createInvocationEffect: function () {
    var isRight, dx, pos;
    var anime = this._getInvocationAnime();
    var weapon = BattlerChecker.getRealBattleWand(this._unit);
    var cls = BattlerChecker.getRealBattleClass(this._unit, weapon);
    var clsAnime = cls.getClassAnime(WeaponCategoryType.MAGIC);

    if (!anime || clsAnime.isInvocationDisabled(this._motion.getMotionId())) {
      return;
    }

    isRight = this === this._realBattle.getBattler(true);
    dx = 50;
    pos = this.getEffectPos(anime);

    if (isRight) {
      dx *= -1;
    }
    this._invocationEffect = this._realBattle.createEffect(anime, pos.x + dx, pos.y + 10, isRight, false);
  },

  _getInvocationAnime: function () {
    return WeaponEffectControl.getWandAnime(this._unit, WeaponEffectAnime.MAGICINVOCATION);
  },

  _getMagicAnime: function () {
    return WeaponEffectControl.getWandAnime(this._unit, WeaponEffectAnime.MAGICWEAPON);
  }
});

var CoreWand = defineObject(CoreAttack, {
  _startNormalAttack: function () {
    var infoBuilder = createObject(NormalWandInfoBuilder);
    var orderBuilder = createObject(NormalWandOrderBuilder);
    var attackInfo = infoBuilder.createAttackInfo(this._attackParam);
    var attackOrder = orderBuilder.createAttackOrder(attackInfo);
    return this._startCommonAttack(attackInfo, attackOrder);
  },

  _prepareMemberData: function (attackParam) {
    CoreAttack._prepareMemberData.apply(this, arguments);
    this._attackFlow = createObject(WandFlow);
  },

  _setBattleTypeAndObject: function (attackInfo, attackOrder) {
    this._battleObject = createObject(RealWandBattle);
  }
});

var NormalWandInfoBuilder = defineObject(NormalAttackInfoBuilder, {
  createAttackInfo: function (attackParam) {
    var picBackground;
    var unitSrc = attackParam.unit;
    var unitDest = attackParam.targetUnit;
    var attackInfo = StructureBuilder.buildWandInfo();
    var mapInfo = root.getCurrentSession().getCurrentMapInfo();
    var terrain = PosChecker.getTerrainFromPosEx(unitDest.getMapX(), unitDest.getMapY());
    var terrainLayer = PosChecker.getTerrainFromPos(unitDest.getMapX(), unitDest.getMapY());
    var direction = PosChecker.getSideDirection(
      unitSrc.getMapX(),
      unitSrc.getMapY(),
      unitDest.getMapX(),
      unitDest.getMapY()
    );

    picBackground = terrainLayer.getBattleBackgroundImage(mapInfo.getMapColorIndex());
    if (!picBackground) {
      picBackground = terrain.getBattleBackgroundImage(mapInfo.getMapColorIndex());
    }

    attackInfo.unitSrc = unitSrc;
    attackInfo.unitDest = unitDest;
    attackInfo.terrainLayer = terrainLayer;
    attackInfo.terrain = terrain;
    attackInfo.picBackground = picBackground;
    attackInfo.isDirectAttack = direction !== DirectionType.NULL;
    attackInfo.isCounterattack = false;

    this._setMagicWeaponAttackData(attackInfo);

    attackInfo.battleType = EnvironmentControl.getBattleType();
    attackInfo.isPosBaseAttack = true;
    attackInfo.targetPos = attackParam.targetPos;
    attackInfo.targetClass = attackParam.targetClass;
    attackInfo.targetItem = attackParam.targetItem;
    attackInfo.targetMetamorphoze = attackParam.targetMetamorphoze;

    return attackInfo;
  }
});

BattlerChecker.getRealBattleWand = function (unit) {
  return ItemControl.getEquippedWand(unit);
};

BattlerChecker.findWandBattleAnimeFromUnit = function (unit) {
  var anime = unit.getClass().getClassAnime(WeaponCategoryType.MAGIC);
  if (WandAnimationValidatiors.isValidWandSetting(anime, true)) {
    return anime;
  }
  return null;
};

(function () {
  var _BattlerChecker_findAttackTemplateType = BattlerChecker.findAttackTemplateType;
  BattlerChecker.findAttackTemplateType = function (cls, weapon) {
    if (!weapon) {
      return _BattlerChecker_findAttackTemplateType.apply(this, arguments);
    }
    if (weapon.isWand()) {
      var classMotionFlag = cls.getClassMotionFlag();
      if (classMotionFlag & ClassMotionFlag.MAGE) {
        return AttackTemplateType.MAGE;
      }
      return 0;
    } else {
      return weapon.getWeaponCategoryType();
    }
  };
})();

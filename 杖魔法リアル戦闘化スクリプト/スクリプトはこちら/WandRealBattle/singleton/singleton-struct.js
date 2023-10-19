StructureBuilder.buildWandParam = function () {
  return {
    unit: null,
    targetUnit: null,
    attackStartType: 0,
    forceBattleObject: null,
    fusionAttackData: null,
    targetPos: null,
    targetClass: null,
    targetItem: null,
    targetMetamorphoze: null
  };
};

StructureBuilder.buildWandInfo = function () {
  return {
    unitSrc: null,
    unitDest: null,
    terrain: null,
    terrainLayer: null,
    battleType: BattleType.REAL,
    attackStartType: AttackStartType.NORMAL,
    isExperienceEnabled: false,
    isDirectAttack: false,
    isMagicWeaponAttackSrc: false,
    isMagicWeaponAttackDest: false,
    isCounterattack: false,
    isPosBaseAttack: false,
    picBackground: null,
    targetPos: null,
    targetClass: null,
    targetItem: null,
    targetMetamorphoze: null
  };
};

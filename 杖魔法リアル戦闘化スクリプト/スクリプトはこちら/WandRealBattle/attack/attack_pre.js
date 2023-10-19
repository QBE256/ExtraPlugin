var PreWand = defineObject(PreAttack, {
  _prepareMemberData: function (attackParam) {
    this._attackParam = attackParam;
    this._coreAttack = createObject(CoreWand);
    this._startStraightFlow = createObject(StraightFlow);
    this._endStraightFlow = createObject(StraightFlow);

    AttackControl.setPreAttackObject(this);
    BattlerChecker.setUnit(attackParam.unit, attackParam.targetUnit);
  },

  _pushFlowEntriesEnd: function (straightFlow) {
    straightFlow.pushFlowEntry(WandValidFlowEntry);
    straightFlow.pushFlowEntry(ImportantItemFlowEntry);
    straightFlow.pushFlowEntry(ReleaseFusionFlowEntry);
    straightFlow.pushFlowEntry(CatchFusionFlowEntry);
  },

  getTargetItem: function () {
    return this._attackParam.targetItem;
  }
});

var WandValidFlowEntry = defineObject(WeaponValidFlowEntry, {
  enterFlowEntry: function (preAttack) {
    this._checkWandDelete(preAttack.getActiveUnit());
    this._checkBrokenItemDelete(preAttack.getPassiveUnit(), preAttack.getTargetItem());

    return EnterResult.NOTENTER;
  },

  _checkWandDelete: function (unit) {
    var wand = ItemControl.getEquippedWand(unit);

    if (!wand) {
      return;
    }
    if (ItemControl.isItemBroken(wand)) {
      ItemControl.lostItem(unit, wand);
      if (unit.getUnitType() !== UnitType.PLAYER && DataConfig.isDropTrophyLinked()) {
        ItemControl.deleteTrophy(unit, wand);
      }
    }
  },

  _checkBrokenItemDelete: function (unit, item) {
    if (!item) {
      return;
    }
    if (ItemControl.isItemBroken(item)) {
      ItemControl.lostItem(unit, item);
      if (unit.getUnitType() !== UnitType.PLAYER && DataConfig.isDropTrophyLinked()) {
        ItemControl.deleteTrophy(unit, item);
      }
    }
  }
});

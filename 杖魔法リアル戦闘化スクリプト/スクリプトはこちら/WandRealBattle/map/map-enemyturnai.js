ItemAutoActionMode.REAL_BATTLE = 77;
ItemAutoAction._battleType = null;
ItemAutoAction._preWand = null;
ItemAutoAction._attackParam = null;
ItemAutoAction.setAutoActionInfo = function (unit, combination) {
  this._unit = unit;
  this._item = combination.item;
  this._targetUnit = combination.targetUnit;
  this._targetItem = combination.targetItem;
  this._targetPos = combination.targetPos;
  this._autoActionCursor = createObject(AutoActionCursor);

  this._setBattleType();

  this._itemUse = ItemPackageControl.getItemUseParent(this._item);
  if (this._battleType === BattleType.REAL) {
    this._attackParam = this._createAttackParam();
    this._preWand = createObject(PreWand);
  }

  if (this._item.isWand()) {
    ItemControl.setEquippedWeapon(this._unit, this._item);
  }
};

ItemAutoAction.enterAutoAction = function () {
  if (this.isSkipMode() || !this._isPosVisible()) {
    if (this._battleType === BattleType.REAL) {
      if (this._enterItemUse() === EnterResult.NOTENTER || this._enterWandRealBattle() === EnterResult.NOTENTER) {
        return EnterResult.NOTENTER;
      }
      this.changeCycleMode(ItemAutoActionMode.REAL_BATTLE);
    } else {
      if (this._enterItemUse() === EnterResult.NOTENTER) {
        return EnterResult.NOTENTER;
      }
      this.changeCycleMode(ItemAutoActionMode.ITEMUSE);
    }
  } else {
    if (this._targetPos !== null) {
      this._autoActionCursor.setAutoActionPos(this._targetPos.x, this._targetPos.y, false);
    } else {
      this._autoActionCursor.setAutoActionPos(this._targetUnit.getMapX(), this._targetUnit.getMapY(), false);
    }
    this.changeCycleMode(ItemAutoActionMode.CURSORSHOW);
  }

  return EnterResult.OK;
};

ItemAutoAction._enterWandRealBattle = function () {
  return this._preWand.enterPreAttackCycle(this._attackParam);
};

ItemAutoAction._moveCurosrShow = function () {
  if (this._autoActionCursor.moveAutoActionCursor() !== MoveResult.CONTINUE) {
    if (this._battleType === BattleType.REAL) {
      if (this._enterItemUse() === EnterResult.NOTENTER || this._enterWandRealBattle() === EnterResult.NOTENTER) {
        return MoveResult.END;
      }
      this.changeCycleMode(ItemAutoActionMode.REAL_BATTLE);
    } else {
      if (this._enterItemUse() === EnterResult.NOTENTER) {
        return MoveResult.END;
      }
      this.changeCycleMode(ItemAutoActionMode.ITEMUSE);
    }
  }

  return MoveResult.CONTINUE;
};

ItemAutoAction._setBattleType = function () {
  if (EnvironmentControl.getBattleType() === BattleType.EASY) {
    this._battleType = BattleType.EASY;
  } else {
    var isWand = this._item.isWand();
    var canDrawRealBattle =
      !this._isAnimeEmpty(this._unit, this._targetUnit) &&
      enabledWandByRealBattle(this._item) &&
      WandAnimationValidatiors.isRealBattleSettingItem(this._item);
    var isAllyUnitExists =
      this._unit.getUnitType() === UnitType.ALLY || this._targetUnit.getUnitType() === UnitType.ALLY;
    var isForceEasyBattle = DataConfig.isAllyBattleFixed() && isAllyUnitExists;
    var isSelfTarget = this._unit === this._targetUnit;
    this._battleType =
      isWand && canDrawRealBattle && !isForceEasyBattle && !isSelfTarget ? BattleType.REAL : BattleType.EASY;
  }
};

ItemAutoAction._backgroundAction = function () {
  var itemType = this._item.getItemType();
  var disabledItemTypes = [ItemType.RECOVERY, ItemType.DAMAGE, ItemType.STATE];
  if (!disabledItemTypes.includes(itemType)) {
    this._itemUse.setItemSkipMode(true);
    this._itemUse.disableItemDecrement();
    this._itemUse.moveUseCycle();
    this._itemUse.setItemSkipMode(false);
  }
};

ItemAutoAction._moveRealBattle = function () {
  if (this._preWand.movePreAttackCycle() !== MoveResult.CONTINUE) {
    this._backgroundAction();
    return MoveResult.END;
  }

  return MoveResult.CONTINUE;
};

ItemAutoAction._drawRealBattle = function () {
  this._preWand.isPosMenuDraw();
  this._preWand.drawPreAttackCycle();
};

ItemAutoAction._isAnimeEmpty = function (unitSrc, unitDest) {
  var animeSrc = null;
  var animeDest = null;

  if (!!unitSrc) {
    animeSrc = BattlerChecker.findWandBattleAnimeFromUnit(unitSrc);
  }

  if (!!unitDest) {
    animeDest = BattlerChecker.findBattleAnimeFromUnit(unitDest);
  }

  return !animeSrc || !animeDest;
};

ItemAutoAction.isSkipAllowed = function () {
  var mode = this.getCycleMode();
  if (mode === ItemAutoActionMode.REAL_BATTLE) {
    return false;
  }
  return true;
};

ItemAutoAction._createAttackParam = function () {
  var attackParam = StructureBuilder.buildWandParam();
  var targetPos = null;

  if (this._item.getItemType() === ItemType.TELEPORTATION) {
    targetPos = TeleportationControl.getTeleportationPos(this._unit, this._targetUnit, this._item);
  }

  attackParam.unit = this._unit;
  attackParam.targetUnit = this._targetUnit;
  attackParam.attackStartType = AttackStartType.NORMAL;
  attackParam.targetPos = targetPos;
  attackParam.targetClass = null;
  attackParam.targetItem = this._targetItem;
  attackParam.targetMetamorphoze = null;

  return attackParam;
};

(function () {
  var _ItemAutoAction_moveAutoAction = ItemAutoAction.moveAutoAction;
  ItemAutoAction.moveAutoAction = function () {
    var result = MoveResult.CONTINUE;
    var mode = this.getCycleMode();
    if (mode === ItemAutoActionMode.REAL_BATTLE) {
      result = this._moveRealBattle();
    } else {
      result = _ItemAutoAction_moveAutoAction.apply(this, arguments);
    }

    return result;
  };

  var _ItemAutoAction_drawAutoAction = ItemAutoAction.drawAutoAction;
  ItemAutoAction.drawAutoAction = function () {
    var mode = this.getCycleMode();

    if (mode === ItemAutoActionMode.REAL_BATTLE) {
      this._drawRealBattle();
    } else {
      _ItemAutoAction_drawAutoAction.apply(this, arguments);
    }
  };
})();

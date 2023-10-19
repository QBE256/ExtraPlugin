WandCommandMode.REAL = 77;

UnitCommand.Wand._preWand = null;
UnitCommand.Wand._battleType = null;
UnitCommand.Wand._wand = null;
UnitCommand.Wand._moveTop = function () {
  var item;
  var unit = this.getCommandTarget();
  var input = this._itemSelectMenu.moveWindowManager();

  if (input === ScrollbarInput.SELECT) {
    item = this._itemSelectMenu.getSelectWand();

    this._itemSelection = ItemPackageControl.getItemSelectionObject(item);
    ItemControl.setEquippedWeapon(unit, item);
    if (this._itemSelection !== null) {
      if (this._itemSelection.enterItemSelectionCycle(unit, item) === EnterResult.NOTENTER) {
        this._useItem();
        this.changeCycleMode(WandCommandMode.USE);
      } else {
        this.changeCycleMode(WandCommandMode.SELECTION);
      }
    }
  } else if (input === ScrollbarInput.CANCEL) {
    return MoveResult.END;
  }

  return MoveResult.CONTINUE;
};

UnitCommand.Wand._setBattleType = function () {
  if (EnvironmentControl.getBattleType() === BattleType.EASY) {
    this._battleType = BattleType.EASY;
  } else {
    var wand = ItemControl.getEquippedWand(this.getCommandTarget());
    var unit = this.getCommandTarget();
    var targetUnit = this._itemSelection.getResultItemTargetInfo().targetUnit;
    var canDrawRealBattle =
      !this._isAnimeEmpty(unit, targetUnit) &&
      enabledWandByRealBattle(wand) &&
      WandAnimationValidatiors.isRealBattleSettingItem(wand);
    var isAllyUnitExists = unit.getUnitType() === UnitType.ALLY || targetUnit.getUnitType() === UnitType.ALLY;
    var isForceEasyBattle = DataConfig.isAllyBattleFixed() && isAllyUnitExists;
    var isSelfTarget = unit === targetUnit;
    this._battleType = canDrawRealBattle && !isForceEasyBattle && !isSelfTarget ? BattleType.REAL : BattleType.EASY;
  }
};

UnitCommand.Wand._moveSelection = function () {
  if (this._itemSelection.moveItemSelectionCycle() !== MoveResult.CONTINUE) {
    if (this._itemSelection.isSelection()) {
      this._setBattleType();
      if (this._battleType === BattleType.REAL) {
        var attackParam = this._createAttackParam();
        this._wand = ItemControl.getEquippedWand(this.getCommandTarget());
        this._preWand = createObject(PreWand);
        this._preWand.enterPreAttackCycle(attackParam);
        this._useItem();
        this.changeCycleMode(WandCommandMode.REAL);
      } else {
        this._useItem();
        this.changeCycleMode(WandCommandMode.USE);
      }
    } else {
      this._itemSelectMenu.setMenuTarget(this.getCommandTarget());
      this.changeCycleMode(WandCommandMode.TOP);
    }
  }

  return MoveResult.CONTINUE;
};

UnitCommand.Wand._backgroundAction = function () {
  var itemType = this._wand.getItemType();
  var disabledItemTypes = [ItemType.RECOVERY, ItemType.DAMAGE, ItemType.STATE];
  if (!disabledItemTypes.includes(itemType)) {
    this._itemUse.setItemSkipMode(true);
    this._itemUse.disableItemDecrement();
    this._itemUse.moveUseCycle();
    this._itemUse.setItemSkipMode(false);
  }
};

UnitCommand.Wand._moveReal = function () {
  if (this._preWand.movePreAttackCycle() !== MoveResult.CONTINUE) {
    this._backgroundAction();
    this.endCommandAction();
    return MoveResult.END;
  }

  return MoveResult.CONTINUE;
};

UnitCommand.Wand._drawReal = function () {
  this._preWand.isPosMenuDraw();
  this._preWand.drawPreAttackCycle();
};

UnitCommand.Wand._getIndexArray = function (unit, weapon) {
  return AttackChecker.getAttackIndexArray(unit, weapon, false);
};

UnitCommand.Wand._getUnitFilter = function () {
  return FilterControl.getReverseFilter(this.getCommandTarget().getUnitType());
};

UnitCommand.Wand._isAnimeEmpty = function (unitSrc, unitDest) {
  var animeSrc, animeDest;

  if (!!unitSrc) {
    animeSrc = BattlerChecker.findWandBattleAnimeFromUnit(unitSrc);
  }
  if (!!unitDest) {
    animeDest = BattlerChecker.findBattleAnimeFromUnit(unitDest);
  }
  return !animeSrc || !animeDest;
};

UnitCommand.Wand._createAttackParam = function () {
  var attackParam = StructureBuilder.buildWandParam();
  var itemTargetInfo = this._itemSelection.getResultItemTargetInfo();

  attackParam.unit = this.getCommandTarget();
  attackParam.targetUnit = itemTargetInfo.targetUnit;
  attackParam.attackStartType = AttackStartType.NORMAL;
  attackParam.targetPos = itemTargetInfo.targetPos;
  attackParam.targetClass = itemTargetInfo.targetClass;
  attackParam.targetItem = itemTargetInfo.targetItem;
  attackParam.targetMetamorphoze = itemTargetInfo.targetMetamorphoze;

  return attackParam;
};

(function () {
  var _UnitCommand_Wand_moveCommand = UnitCommand.Wand.moveCommand;
  UnitCommand.Wand.moveCommand = function () {
    var mode = this.getCycleMode();
    var result = MoveResult.CONTINUE;
    if (mode === WandCommandMode.REAL) {
      result = this._moveReal();
    } else {
      result = _UnitCommand_Wand_moveCommand.apply(this, arguments);
    }

    return result;
  };

  var _UnitCommand_Wand_drawCommand = UnitCommand.Wand.drawCommand;
  UnitCommand.Wand.drawCommand = function () {
    var mode = this.getCycleMode();

    if (mode === WandCommandMode.REAL) {
      this._drawReal();
    } else {
      _UnitCommand_Wand_drawCommand.apply(this, arguments);
    }
  };
})();

/*--------------------------------------------------------------------------
　ワープ対象者の移動後の行動範囲を表示する ver 2.0

■作成者
キュウブ

■概要
このスクリプトを導入するとワープで移動先のマスにカーソルをあわせた際に、
対象ユニットの移動範囲や攻撃範囲が表示されるようになります。
※Vキー(ボタン4)を押すと、攻撃範囲->杖有効範囲->アイテム有効範囲->...と切り替わります

■更新履歴
ver 2.0 2023/06/05
仕様変更

ver 1.0 2023/06/04
公開

■対応バージョン
SRPG Studio Version:1.161

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。
・クレジット明記無し　OK (明記する場合は"キュウブ"でお願いします)
・再配布、転載　OK (バグなどがあったらプルリクエストお願いします)
・SRPG Studio利用規約は遵守してください。

--------------------------------------------------------------------------*/

(function () {
  TeleportationItemSelection._unitRangePanel = null;
  var _TeleportationItemSelection__enterItemSelectionCycle =
    TeleportationItemSelection.enterItemSelectionCycle;
  TeleportationItemSelection.enterItemSelectionCycle = function (unit, item) {
    this._unitRangeFadeLight = createObject(UnitRangeFadeFight);
    return _TeleportationItemSelection__enterItemSelectionCycle.apply(
      this,
      arguments
    );
  };

  var _TeleportationItemSelection__changePosSelect =
    TeleportationItemSelection._changePosSelect;
  TeleportationItemSelection._changePosSelect = function () {
    _TeleportationItemSelection__changePosSelect.apply(this, arguments);
    this._unitRangeFadeLight.setUnit(this._targetUnit);
  };

  TeleportationItemSelection._currentCursorPosition = { x: 0, y: 0 };
  var _TeleportationItemSelection__drawItemSelectionCycle =
    TeleportationItemSelection.drawItemSelectionCycle;
  TeleportationItemSelection.drawItemSelectionCycle = function () {
    var mode = this.getCycleMode();
    if (
      mode === ItemTeleportationSelectMode.POSSELECT &&
      this._targetUnit !== null
    ) {
      this._unitRangeFadeLight.drawRangePanel();
    }
    _TeleportationItemSelection__drawItemSelectionCycle.apply(this, arguments);
  };

  var _TeleportationItemSelection__movePosSelect =
    TeleportationItemSelection._movePosSelect;
  TeleportationItemSelection._movePosSelect = function () {
    var targetUnitPosition = createPos(
      this._targetUnit.getMapX(),
      this._targetUnit.getMapY()
    );
    var cursorPosition = this._posSelector.getSelectorPos(false);
    var isMoveCursor =
      cursorPosition.x !== this._currentCursorPosition.x ||
      cursorPosition.y !== this._currentCursorPosition.y;
    var enableSelect = this.isPosSelectable();
    var isTargetUnitPosition =
      cursorPosition.x === targetUnitPosition.x &&
      cursorPosition.y === targetUnitPosition.y;
    this._targetUnit.setMapX(cursorPosition.x);
    this._targetUnit.setMapY(cursorPosition.y);
    if (isMoveCursor) {
      if (enableSelect || isTargetUnitPosition) {
        this._unitRangeFadeLight.repeatSimulation();
      } else {
        this._unitRangeFadeLight.clearLight();
      }
      this._currentCursorPosition.x = cursorPosition.x;
      this._currentCursorPosition.y = cursorPosition.y;
    }
    this._unitRangeFadeLight.moveRangePanel();
    this._targetUnit.setMapX(targetUnitPosition.x);
    this._targetUnit.setMapY(targetUnitPosition.y);
    return _TeleportationItemSelection__movePosSelect.apply(this, arguments);
  };

  var MapChipFlashingLight = defineObject(MapChipLight, {
    _color: 0,
    _alpha: 0,
    _flashCounter: null,
    _flashTotalFrame: 60,

    initialize: function () {
      this.endLight();
      this._flashCounter = createObject(CycleCounter);
      this._flashCounter.disableGameAcceleration();
      this._flashCounter.setCounterInfo(this._flashTotalFrame);
    },

    moveLight: function () {
      this._flashCounter.moveCycleCounter();
      return MoveResult.CONTINUE;
    },

    drawLight: function () {
      root.drawFadeLight(this._indexArray, this._color, this._getAlpha());
    },

    setColor: function (color) {
      this._color = color;
    },

    _getAlpha: function () {
      var alpha = 0;
      var currentFrame = this._flashCounter.getCounter();
      var halfFrame = this._flashTotalFrame / 2;
      var minAlpha = 0;
      var maxAlpha = 120;
      if (currentFrame < halfFrame) {
        alpha =
          minAlpha +
          Math.floor((currentFrame * (maxAlpha - minAlpha)) / halfFrame);
      } else {
        alpha =
          maxAlpha -
          Math.floor(
            ((currentFrame - halfFrame) * (maxAlpha - minAlpha)) / halfFrame
          );
      }
      return alpha;
    }
  });

  var UnitRangeShowMode = {
    MOVE_ONLY: 0,
    WEAPON: 1,
    WAND: 2,
    ITEM: 3
  };

  var UnitRangeFadeFight = defineObject(UnitRangePanel, {
    _showRangeMode: UnitRangeShowMode.MOVE_ONLY,
    _mapChipLightWand: null,
    _mapChipLightItem: null,
    _moveColor: 0x0000ff,
    _weaponColor: 0xff0000,
    _wandColor: 0x00ff00,
    _itemColor: 0xffdc00,
    _enableWeaponRange: false,
    _enableWandRange: false,
    _enableItemRange: false,
    _unitRanges: null,

    initialize: function () {
      this._mapChipLight = createObject(MapChipFlashingLight);
      this._mapChipLightWeapon = createObject(MapChipFlashingLight);
      this._mapChipLightWand = createObject(MapChipFlashingLight);
      this._mapChipLightItem = createObject(MapChipFlashingLight);
      this._showRangeMode = UnitRangeShowMode.MOVE_ONLY;
      this._mapChipLight.setColor(this._moveColor);
      this._mapChipLightWeapon.setColor(this._weaponColor);
      this._mapChipLightWand.setColor(this._wandColor);
      this._mapChipLightItem.setColor(this._itemColor);
      this._simulator = root.getCurrentSession().createMapSimulator();
      this._simulator.disableRestrictedPass();
      this._enableWeaponRange = false;
      this._enableWandRange = false;
      this._enableItemRange = false;
      this._unitRanges = {
        startWeaponRange: 99,
        endWeaponRange: 0,
        startWandRange: 0,
        endWandRange: 0,
        startItemRange: 0,
        endItemRange: 0,
        mov: 0
      };
    },

    clearLight: function () {
      this._mapChipLight.endLight();
      this._mapChipLightWeapon.endLight();
      this._mapChipLightItem.endLight();
      this._mapChipLightWand.endLight();
    },

    _setLight: function () {
      this._mapChipLight.setLightType(MapLightType.NORMAL);
      this._mapChipLight.setIndexArray(
        this._simulator.getSimulationIndexArray()
      );
      if (this._enableWeaponRange) {
        this._mapChipLightWeapon.setLightType(MapLightType.NORMAL);
        this._mapChipLightWeapon.setIndexArray(
          this._simulator.getSimulationWeaponIndexArray()
        );
      } else {
        this._mapChipLightWeapon.endLight();
      }
      if (this._enableItemRange) {
        this._mapChipLightItem.setLightType(MapLightType.NORMAL);
        this._mapChipLightItem.setIndexArray(
          this._simulator.getSimulationWeaponIndexArray()
        );
      } else {
        this._mapChipLightItem.endLight();
      }
      if (this._enableWandRange) {
        this._mapChipLightWand.setLightType(MapLightType.NORMAL);
        this._mapChipLightWand.setIndexArray(
          this._simulator.getSimulationWeaponIndexArray()
        );
      } else {
        this._mapChipLightWand.endLight();
      }
    },

    moveRangePanel: function () {
      var currentShowRangeMode = this._showRangeMode;
      if (root.isInputAction(InputType.BTN4)) {
        this._showRangeMode =
          this._showRangeMode === UnitRangeShowMode.ITEM
            ? UnitRangeShowMode.MOVE_ONLY
            : this._showRangeMode + 1;
        if (
          this._showRangeMode === UnitRangeShowMode.WEAPON &&
          !this._enableWeaponRange
        ) {
          this._showRangeMode++;
        }
        if (
          this._showRangeMode === UnitRangeShowMode.WAND &&
          !this._enableWandRange
        ) {
          this._showRangeMode++;
        }
        if (
          this._showRangeMode === UnitRangeShowMode.ITEM &&
          !this._enableItemRange
        ) {
          this._showRangeMode = UnitRangeShowMode.MOVE_ONLY;
        }
      }
      if (currentShowRangeMode !== this._showRangeMode) {
        this._changeSimulation();
      }
      if (this._unit !== null) {
        this._mapChipLightWand.moveLight();
        this._mapChipLightItem.moveLight();
      }
      return UnitRangePanel.moveRangePanel.apply(this, arguments);
    },

    _changeSimulation: function () {
      if (this._showRangeMode === UnitRangeShowMode.MOVE_ONLY) {
        this._mapChipLight.setColor(this._moveColor);
      } else if (this._showRangeMode === UnitRangeShowMode.WEAPON) {
        this._mapChipLight.setColor(this._weaponColor);
        this._simulator.startSimulationWeapon(
          this._unit,
          this._unitRanges.mov,
          this._unitRanges.startWeaponRange,
          this._unitRanges.endWeaponRange
        );
      } else if (this._showRangeMode === UnitRangeShowMode.WAND) {
        this._mapChipLight.setColor(this._wandColor);
        this._simulator.startSimulationWeapon(
          this._unit,
          this._unitRanges.mov,
          this._unitRanges.startWandRange,
          this._unitRanges.endWandRange
        );
      } else {
        this._mapChipLight.setColor(this._itemColor);
        this._simulator.startSimulationWeapon(
          this._unit,
          this._unitRanges.mov,
          this._unitRanges.startItemRange,
          this._unitRanges.endItemRange
        );
      }
      this._setLight();
    },

    _setUnitRanges: function (unit) {
      var minStartWeaponRange = 99;
      var maxEndWeaponRange = 0;
      var maxEndWandRange = 0;
      var maxEndItemRange = 0;
      var count = UnitItemControl.getPossessionItemCount(unit);

      for (var index = 0; index < count; index++) {
        var item = UnitItemControl.getItem(unit, index);
        if (item.isWeapon()) {
          if (ItemControl.isWeaponAvailable(unit, item)) {
            var startWeaponRange = item.getStartRange();
            var endWeaponRange = item.getEndRange();
            minStartWeaponRange =
              startWeaponRange < minStartWeaponRange
                ? startWeaponRange
                : minStartWeaponRange;
            maxEndWeaponRange =
              endWeaponRange > maxEndWeaponRange
                ? endWeaponRange
                : maxEndWeaponRange;
          }
        } else {
          var isMultiRange = item.getRangeType() === SelectionRangeType.MULTI;
          var isUsable = ItemControl.isItemUsable(unit, item);
          if (isMultiRange && isUsable) {
            var endNotWeaponRange = item.getRangeValue();
            var isWand = item.isWand();
            if (isWand && maxEndWandRange < endNotWeaponRange) {
              maxEndWandRange = endNotWeaponRange;
            } else if (!isWand && maxEndItemRange < endNotWeaponRange) {
              maxEndItemRange = endNotWeaponRange;
            }
          }
        }
      }

      this._unitRanges.startWeaponRange = minStartWeaponRange;
      this._unitRanges.endWeaponRange = maxEndWeaponRange;
      this._unitRanges.startWandRange = 1;
      this._unitRanges.endWandRange = maxEndWandRange;
      this._unitRanges.startItemRange = 1;
      this._unitRanges.endItemRange = maxEndItemRange;
      this._unitRanges.mov = this._getRangeMov(unit);
    },

    setUnit: function (unit) {
      this._unit = unit;
      if (unit === null) {
        return;
      }

      this._x = unit.getMapX();
      this._y = unit.getMapY();

      this._setRangeData();
      this._showRangeMode = UnitRangeShowMode.MOVE_ONLY;
      this._changeSimulation();
    },

    repeatSimulation: function () {
      this._x = this._unit.getMapX();
      this._y = this._unit.getMapY();
      this._setRangeData();
    },

    _setRangeData: function () {
      this._setUnitRanges(this._unit);
      this._enableWeaponRange =
        this._unitRanges.endWeaponRange >= this._unitRanges.startWeaponRange;
      this._enableItemRange = this._unitRanges.endItemRange !== 0;
      this._enableWandRange = this._unitRanges.endWandRange !== 0;
      this._simulator.startSimulation(this._unit, this._unitRanges.mov);
      this._changeSimulation();
    },

    drawRangePanel: function () {
      if (this._unit === null) {
        return;
      }
      this._mapChipLight.drawLight();
      if (this._showRangeMode === UnitRangeShowMode.WEAPON) {
        this._mapChipLightWeapon.drawLight();
      } else if (this._showRangeMode === UnitRangeShowMode.WAND) {
        this._mapChipLightWand.drawLight();
      } else if (this._showRangeMode === UnitRangeShowMode.ITEM) {
        this._mapChipLightItem.drawLight();
      }
    }
  });
})();

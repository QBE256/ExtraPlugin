/*--------------------------------------------------------------------------
　ワープ対象者の移動後の行動範囲を表示する ver 1.0

■作成者
キュウブ

■概要
このスクリプトを導入するとワープで移動先のマスにカーソルをあわせた際に、
対象ユニットの移動範囲や攻撃範囲が表示されるようになります。
※Vキー(ボタン4)を押しっぱなしにしている間のみ、攻撃範囲が表示されるようになります

■更新履歴
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

  var _TeleportationItemSelection__drawItemSelectionCycle =
    TeleportationItemSelection.drawItemSelectionCycle;
  TeleportationItemSelection.drawItemSelectionCycle = function () {
    var targetUnitPosition, cursorPosition, unit;
    var mode = this.getCycleMode();
    if (
      mode === ItemTeleportationSelectMode.TARGETSELECT &&
      this.isPosSelectable()
    ) {
      cursorPosition = this._posSelector.getSelectorPos(false);
      unit = PosChecker.getUnitFromPos(cursorPosition.x, cursorPosition.y);
      this._unitRangeFadeLight.setUnit(unit);
      this._unitRangeFadeLight.drawRangePanel();
    } else if (
      mode === ItemTeleportationSelectMode.POSSELECT &&
      this._targetUnit !== null
    ) {
      unit = this._targetUnit;
      targetUnitPosition = createPos(unit.getMapX(), unit.getMapY());
      cursorPosition = this._posSelector.getSelectorPos(false);
      this._targetUnit.setMapX(cursorPosition.x);
      this._targetUnit.setMapY(cursorPosition.y);
      this._unitRangeFadeLight.setUnit(unit);
      this._unitRangeFadeLight.drawRangePanel();
      this._targetUnit.setMapX(targetUnitPosition.x);
      this._targetUnit.setMapY(targetUnitPosition.y);
    }
    _TeleportationItemSelection__drawItemSelectionCycle.apply(this, arguments);
  };

  var _TeleportationItemSelection__moveTargetSelect =
    TeleportationItemSelection._moveTargetSelect;
  TeleportationItemSelection._moveTargetSelect = function () {
    this._unitRangeFadeLight.moveRangePanel();
    return _TeleportationItemSelection__moveTargetSelect.apply(this, arguments);
  };

  var _TeleportationItemSelection__movePosSelect =
    TeleportationItemSelection._movePosSelect;
  TeleportationItemSelection._movePosSelect = function () {
    this._unitRangeFadeLight.moveRangePanel();
    return _TeleportationItemSelection__movePosSelect.apply(this, arguments);
  };

  TeleportationItemSelection._isShowWeaponRange = function() {
    return root.isInputState(InputType.BTN4);
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

  var UnitRangeFadeFight = defineObject(UnitRangePanel, {
    _isShowWeaponRange: false,

    initialize: function () {
      this._mapChipLight = createObject(MapChipFlashingLight);
      this._mapChipLightWeapon = createObject(MapChipFlashingLight);
      this._isShowWeaponRange = false;
      this._mapChipLight.setColor(0x0000ff);
      this._mapChipLightWeapon.setColor(0xff0000);
      this._simulator = root.getCurrentSession().createMapSimulator();
      this._simulator.disableRestrictedPass();
    },

    _setLight: function (isWeapon) {
      this._mapChipLight.setLightType(MapLightType.NORMAL);
      this._mapChipLight.setIndexArray(
        this._simulator.getSimulationIndexArray()
      );
      if (isWeapon) {
        this._mapChipLightWeapon.setLightType(MapLightType.NORMAL);
        this._mapChipLightWeapon.setIndexArray(
          this._simulator.getSimulationWeaponIndexArray()
        );
      } else {
        this._mapChipLightWeapon.endLight();
      }
    },

    moveRangePanel: function() {
      var currentIsShowWeaponRange = this._isShowWeaponRange;
      this._isShowWeaponRange = root.isInputState(InputType.BTN4);
      if (currentIsShowWeaponRange !== this._isShowWeaponRange) {
        if (this._isShowWeaponRange) {
          this._mapChipLight.setColor(0xff0000);
        } else {
          this._mapChipLight.setColor(0x0000ff);
        }
      }
      return UnitRangePanel.moveRangePanel.apply(this, arguments);
    },

    drawRangePanel: function() {
      if (this._unit === null) {
        return;
      }
      if (PosChecker.getUnitFromPos(this._x, this._y) !== this._unit) {
        return;
      }
      if (this._unit.isWait()) {
        return;
      }
      this._mapChipLight.drawLight();
      if (this._isShowWeaponRange) {
        this._mapChipLightWeapon.drawLight();
      }
    }
  });
})();

/*--------------------------------------------------------------------------
移動したマス目分だけ攻撃力を加算する ver 1.0

■作成者
キュウブ

■概要
移動した分の距離だけ、攻撃力が加算されるようになります。
※他で公開されている"消費移動量"の分だけ加算されるプラグインとは異なり、こちらは移動したマス目分だけ考慮されます。

■使い方
対象武器のカスタムパラメータに下記を設定してください。
moveBonusCorrection: <係数>

例1.
下記のように設定した武器で5マス移動した上で攻撃を行うと、
攻撃力が1×5=5の分だけ増加する
moveBonusCorrection: 1

例2.
下記のように設定した武器で5マス移動した上で攻撃を行うと、
攻撃力が3×5=15の分だけ増加する
moveBonusCorrection: 3

例3.
下記のように設定した武器で5マス移動した上で攻撃を行うと、
攻撃力が-1×5=-5、つまり5減少する
moveBonusCorrection: -1

■更新履歴
ver1.0 2024/04/07
初版

■対応バージョン
SRPG Studio Version:1.287

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。
・クレジット明記無しOK (明記する場合は"キュウブ"でお願いします)
・バグなどがあったらプルリクお願いします
・SRPG Studio利用規約は遵守してください。

--------------------------------------------------------------------------*/

(function () {
  MapSequenceArea._startMove = function () {
    var cource;
    var x = this._mapCursor.getX();
    var y = this._mapCursor.getY();
    var isCurrentPos = this._targetUnit.getMapX() === x && this._targetUnit.getMapY() === y;

    this._parentTurnObject.setCursorSave(this._targetUnit);

    // ユニットの現在位置を選択した場合は移動不要
    if (isCurrentPos) {
      this._simulateMove.noMove(this._targetUnit);
      this._playMapUnitSelectSound();
      return true;
    } else {
      // コースを作成して移動開始
      cource = this._simulateMove.createCource(this._targetUnit, x, y, this._unitRangePanel.getSimulator());
      this._targetUnit.custom.movementValue = cource.length;
      this._simulateMove.startMove(this._targetUnit, cource);
    }

    return false;
  };

  var _MapSequenceArea__doCancelAction = MapSequenceArea._doCancelAction;
  MapSequenceArea._doCancelAction = function () {
    var unit = this._mapCursor.getUnitFromCursor();
    delete unit.custom.movementValue;
    _MapSequenceArea__doCancelAction.apply(this, arguments);
  };

  var _MapSequenceCommand__doLastAction = MapSequenceCommand._doLastAction;
  MapSequenceCommand._doLastAction = function () {
    if (!!this._targetUnit) {
      delete this._targetUnit.custom.movementValue;
    }
    return _MapSequenceCommand__doLastAction.apply(this, arguments);
  };

  MoveAutoAction.enterAutoAction = function () {
    var isSkipMode = this.isSkipMode();
    this._unit.custom.movementValue = this._moveCource.length;
    if (isSkipMode) {
      this._simulateMove.skipMove(this._unit, this._moveCource);
      return EnterResult.NOTENTER;
    } else {
      this._simulateMove.startMove(this._unit, this._moveCource);
    }

    return EnterResult.OK;
  };

  var _WaitAutoAction_setAutoActionInfo = WaitAutoAction.setAutoActionInfo;
  WaitAutoAction.setAutoActionInfo = function (unit, combination) {
    delete unit.custom.movementValue;
    _WaitAutoAction_setAutoActionInfo.apply(this, arguments);
  };

  var _AbilityCalculator_getPower = AbilityCalculator.getPower;
  AbilityCalculator.getPower = function (unit, weapon) {
    var originalPower = _AbilityCalculator_getPower.apply(this, arguments);
    var fixedPower = originalPower;
    var enableMoveBonus = typeof weapon.custom.moveBonusCorrection === "number" && !!unit.custom.movementValue;
    if (!!enableMoveBonus) {
      fixedPower += unit.custom.movementValue * weapon.custom.moveBonusCorrection;
      fixedPower = Math.floor(fixedPower);
      fixedPower = fixedPower < 0 ? 0 : fixedPower;
    }
    return fixedPower;
  };

  var _PreAttack__doEndAction = PreAttack._doEndAction;
  PreAttack._doEndAction = function () {
    if (!!this._attackParam.unit) {
      delete this._attackParam.unit.custom.movementValue;
    }
    _PreAttack__doEndAction.apply(this, arguments);
  };
})();

/*--------------------------------------------------------------------------
移動したマス目分だけ攻撃力を加算する ver 1.4

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
ver 1.4 2024/04/11
CPUが移動するだけで攻撃に転じなかった時に
次の戦闘まで加算ボーナスが永続してしまう不具合を修正

ver 1.3 2024/04/09
再移動したときに次の戦闘まで加算ボーナスが永続してしまう不具合を修正

ver 1.2 2024/04/08
CPUに効果が適用されない不具合を修正

ver 1.1 2024/04/07
行動キャンセル時のエラーを解消
武器ウィンドウに表記を追加
その他細かい仕様変更

ver 1.0 2024/04/07
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
  ItemControl.hasMoveBonusWeapon = function (unit) {
    var count;

    if (!unit) {
      return null;
    }

    count = UnitItemControl.getPossessionItemCount(unit);

    for (var index = 0; index < count; index++) {
      var item = UnitItemControl.getItem(unit, index);
      if (!!item && this.isWeaponAvailable(unit, item) && typeof item.custom.moveBonusCorrection === "number") {
        return true;
      }
    }

    return false;
  };

  ItemSentence.AttackAndHit.drawItemSentence = function (x, y, item) {
    var text, moveBonusCorrection;
    var textui = root.queryTextUI("default_window");
    var color = textui.getColor();
    var font = textui.getFont();

    text = root.queryCommand("attack_capacity");
    ItemInfoRenderer.drawKeyword(x, y, text);
    moveBonusCorrection = item.custom.moveBonusCorrection;
    if (typeof moveBonusCorrection === "number") {
      var moveBonusSymbolPositionX = x + ItemInfoRenderer.getSpaceX() + 1;
      var moveBonusNumberPositionX = moveBonusSymbolPositionX + 12;
      var attackNumberPositionX = moveBonusSymbolPositionX - 14;
      NumberRenderer.drawNumber(attackNumberPositionX, y, item.getPow());
      if (moveBonusCorrection >= 0) {
        TextRenderer.drawText(moveBonusSymbolPositionX, y + 6, "+", -1, color, font);
      } else {
        TextRenderer.drawText(moveBonusSymbolPositionX, y + 6, "-", -1, color, font);
      }
      NumberRenderer.drawRightMoveBonusNumber(moveBonusNumberPositionX, y, moveBonusCorrection);
    } else {
      var attackNumberPositionX = x + ItemInfoRenderer.getSpaceX();
      NumberRenderer.drawRightNumber(attackNumberPositionX, y, item.getPow());
    }

    x += ItemInfoRenderer.getSpaceX() + 42;

    text = root.queryCommand("hit_capacity");
    ItemInfoRenderer.drawKeyword(x, y, text);
    x += ItemInfoRenderer.getSpaceX();
    NumberRenderer.drawRightNumber(x, y, item.getHit());
  };

  NumberRenderer.drawRightMoveBonusNumber = function (x, y, number) {
    var pic = root.queryUI("number");
    var textui = root.queryTextUI("default_window");
    var textColor = textui.getColor();
    var textFont = textui.getFont();
    var width = UIFormat.NUMBER_WIDTH / 10;
    var height = UIFormat.NUMBER_HEIGHT / 5;
    var ySrc = 0;
    var alpha = 255;

    if (pic === null || number < 0) {
      return;
    }

    if (number === 0) {
      pic.drawParts(x, y, 0, ySrc, width, height);
      return;
    } else if (number > 1 || number < -1) {
      var digitValue;
      var digitCount = 0;
      var targetNumber = number;
      var digitArray = [];
      while (targetNumber > 0) {
        digitValue = Math.floor(targetNumber % 10);
        targetNumber = Math.floor(targetNumber / 10);
        digitArray[digitCount] = digitValue;
        digitCount++;
      }

      for (var index = digitCount - 1; index >= 0; index--) {
        pic.setAlpha(alpha);
        pic.drawParts(x, y, digitArray[index] * width, ySrc, width, height);
        x += 9;
      }
      x += 3;
      TextRenderer.drawText(x, y + 6, "M", -1, textColor, textFont);
    } else {
      TextRenderer.drawText(x, y + 6, "M", -1, textColor, textFont);
    }
  };

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
      if (ItemControl.hasMoveBonusWeapon(this._targetUnit)) {
        this._targetUnit.custom.movementValue = cource.length;
      }
      if (!!this._movementLocus) {
        this._simulateMove.startMove(this._targetUnit, this._movementLocus.cource);
      } else {
        this._simulateMove.startMove(this._targetUnit, cource);
      }
    }

    return false;
  };

  var _MapSequenceCommand_moveSequence = MapSequenceCommand.moveSequence;
  MapSequenceCommand.moveSequence = function () {
    var result = _MapSequenceCommand_moveSequence.apply(this, arguments);
    var isEndCommand = result === MapSequenceCommandResult.CANCEL || result === MapSequenceCommandResult.COMPLETE;
    if (!!isEndCommand && !!this._targetUnit) {
      delete this._targetUnit.custom.movementValue;
    }
    return result;
  };

  MoveAutoAction.enterAutoAction = function () {
    var isSkipMode = this.isSkipMode();
    if (ItemControl.hasMoveBonusWeapon(this._unit)) {
      this._unit.custom.movementValue = this._moveCource.length;
    }
    if (isSkipMode) {
      this._simulateMove.skipMove(this._unit, this._moveCource);
      return EnterResult.NOTENTER;
    } else {
      this._simulateMove.startMove(this._unit, this._moveCource);
    }

    return EnterResult.OK;
  };

  var _WaitAutoAction_enterAutoAction = WaitAutoAction.enterAutoAction;
  WaitAutoAction.enterAutoAction = function () {
    var enterResult = _WaitAutoAction_enterAutoAction.apply(this, arguments);
    if (!enterResult && !!this._unit) {
      delete this._unit.custom.movementValue;
    }
    return enterResult;
  };

  // デフォルトでは必要ないが、待機直後に移動を行うようなロジックが追加された事を考慮して、
  // 待機直後処理の最後にも移動ボーナスのカスタムパラメータを削除する処理を入れる。
  var _WaitAutoAction_moveAutoAction = WaitAutoAction.moveAutoAction;
  WaitAutoAction.moveAutoAction = function () {
    var moveResult = _WaitAutoAction_moveAutoAction.apply(this, arguments);
    if (moveResult === MoveResult.END) {
      delete this._unit.custom.movementValue;
    }
    return moveResult;
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

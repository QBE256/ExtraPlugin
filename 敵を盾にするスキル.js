/*--------------------------------------------------------------------------
　敵を盾にするスキル ver 1.0

■作成者
キュウブ

■概要
隣にいる敵対勢力ユニットに攻撃を受けさせるスキルを設定できます。
隣接する敵対勢力ユニットが複数いた場合、盾にするユニットはランダムで選出されます。

■使い方
カスタムキーワードを"scapegoat"と設定したカスタムスキルを設定すればOK

■更新履歴
ver 1.0 2023/06/13
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
  AttackStartType.SCAPEGOAT = 233; // 他のスクリプトの定数と被らないように、中途半端な数値で設定しておく
  WeaponAutoAction._scapegoatUnit = null;
  WeaponAutoAction._scapegoatUnitPosX = -1;
  WeaponAutoAction._scapegoatUnitPosY = -1;
  var _WeaponAutoAction__createAttackParam =
    WeaponAutoAction._createAttackParam;
  WeaponAutoAction._createAttackParam = function () {
    var attackParam = _WeaponAutoAction__createAttackParam.apply(
      this,
      arguments
    );
    var unit = this._unit;
    var skill = SkillControl.getPossessionCustomSkill(
      this._targetUnit,
      "scapegoat"
    );
    if (skill) {
      var randomIndex;
      var posX = this._targetUnit.getMapX();
      var posY = this._targetUnit.getMapY();
      var targetUnit = this._targetUnit;
      var scapegoatUnits = [
        PosChecker.getUnitFromPos(posX + 1, posY),
        PosChecker.getUnitFromPos(posX - 1, posY),
        PosChecker.getUnitFromPos(posX, posY + 1),
        PosChecker.getUnitFromPos(posX, posY - 1)
      ].filter(function (adjacentUnit) {
        return (
          adjacentUnit &&
          unit !== adjacentUnit &&
          FilterControl.isReverseUnitTypeAllowed(targetUnit, adjacentUnit)
        );
      });
      if (scapegoatUnits.length > 0) {
        randomIndex = Math.floor(Math.random() * scapegoatUnits.length);
        this._scapegoatUnit = scapegoatUnits[randomIndex];
        attackParam.targetUnit = this._scapegoatUnit;
        attackParam.attackStartType = AttackStartType.SCAPEGOAT;
        this._scapegoatUnitPosX = this._scapegoatUnit.getMapX();
        this._scapegoatUnitPosY = this._scapegoatUnit.getMapY();
        this._scapegoatUnit.setMapX(posX);
        this._scapegoatUnit.setMapY(posY);
      } else {
        this._scapegoatUnit = null;
      }
    }
    return attackParam;
  };

  var _WeaponAutoAction__movePreAttack = WeaponAutoAction._movePreAttack;
  WeaponAutoAction._movePreAttack = function () {
    var moveResult = _WeaponAutoAction__movePreAttack.apply(this, arguments);
    if (moveResult === MoveResult.END && this._scapegoatUnit) {
      this._scapegoatUnit.setMapX(this._scapegoatUnitPosX);
      this._scapegoatUnit.setMapY(this._scapegoatUnitPosY);
    }
    return moveResult;
  };

  UnitCommand.Attack._scapegoatUnit = null;
  UnitCommand.Attack._scapegoatUnitPosX = -1;
  UnitCommand.Attack._scapegoatUnitPosY = -1;
  var _UnitCommand_Attack__createAttackParam =
    UnitCommand.Attack._createAttackParam;
  UnitCommand.Attack._createAttackParam = function () {
    var attackParam = _UnitCommand_Attack__createAttackParam.apply(
      this,
      arguments
    );
    var unit = this.getCommandTarget();
    var targetUnit = this._posSelector.getSelectorTarget(false);
    var skill = SkillControl.getPossessionCustomSkill(targetUnit, "scapegoat");
    if (skill) {
      var randomIndex;
      var posX = targetUnit.getMapX();
      var posY = targetUnit.getMapY();
      var scapegoatUnits = [
        PosChecker.getUnitFromPos(posX + 1, posY),
        PosChecker.getUnitFromPos(posX - 1, posY),
        PosChecker.getUnitFromPos(posX, posY + 1),
        PosChecker.getUnitFromPos(posX, posY - 1)
      ].filter(function (adjacentUnit) {
        return (
          adjacentUnit &&
          unit !== adjacentUnit &&
          FilterControl.isReverseUnitTypeAllowed(targetUnit, adjacentUnit)
        );
      });
      if (scapegoatUnits.length > 0) {
        randomIndex = Math.floor(Math.random() * scapegoatUnits.length);
        this._scapegoatUnit = scapegoatUnits[randomIndex];
        attackParam.targetUnit = this._scapegoatUnit;
        attackParam.attackStartType = AttackStartType.SCAPEGOAT;
        this._scapegoatUnitPosX = this._scapegoatUnit.getMapX();
        this._scapegoatUnitPosY = this._scapegoatUnit.getMapY();
        this._scapegoatUnit.setMapX(posX);
        this._scapegoatUnit.setMapY(posY);
      } else {
        this._scapegoatUnit = null;
      }
    }
    return attackParam;
  };

  var _UnitCommand_Attack_endCommandAction =
    UnitCommand.Attack.endCommandAction;
  UnitCommand.Attack.endCommandAction = function () {
    if (this._scapegoatUnit) {
      this._scapegoatUnit.setMapX(this._scapegoatUnitPosX);
      this._scapegoatUnit.setMapY(this._scapegoatUnitPosY);
    }
    _UnitCommand_Attack_endCommandAction.apply(this, arguments);
  };

  var ScapeGoatAttackInfoBuilder = defineObject(NormalAttackInfoBuilder, {
    createAttackInfo: function (attackParam) {
      var attackInfo = NormalAttackInfoBuilder.createAttackInfo.call(
        this,
        attackParam
      );

      attackInfo.battleType = EnvironmentControl.getBattleType();
      attackInfo.isCounterattack = false;

      return attackInfo;
    }
  });

  var _CoreAttack__checkAttack = CoreAttack._checkAttack;
  CoreAttack._checkAttack = function () {
    if (this._attackParam.attackStartType === AttackStartType.SCAPEGOAT) {
      this._startScapegoatAttack();
    }
    _CoreAttack__checkAttack.apply(this, arguments);
  };

  CoreAttack._startScapegoatAttack = function () {
    var infoBuilder = createObject(ScapeGoatAttackInfoBuilder);
    var orderBuilder = createObject(ScapeGoatAttackOrderBuilder);
    var attackInfo = infoBuilder.createAttackInfo(this._attackParam);
    var attackOrder = orderBuilder.createAttackOrder(attackInfo);

    return this._startCommonAttack(attackInfo, attackOrder);
  };

  var ScapeGoatAttackOrderBuilder = defineObject(NormalAttackOrderBuilder, {
    _endVirtualAttack: function (virtualActive, virtualPassive) {
      NormalAttackOrderBuilder._endVirtualAttack.apply(this, arguments);
      this._order.registerExp(0);
    }
  });
})();

// Array.filter poliyfill
// Reference: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/filter#polyfill
if (!Array.prototype.filter) {
  Array.prototype.filter = function (func, thisArg) {
    "use strict";
    if (!((typeof func === "Function" || typeof func === "function") && this))
      throw new TypeError();

    var len = this.length >>> 0,
      res = new Array(len), // preallocate array
      t = this,
      c = 0,
      i = -1;

    var kValue;
    if (thisArg === undefined) {
      while (++i !== len) {
        // checks to see if the key was set
        if (i in this) {
          kValue = t[i]; // in case t is changed in callback
          if (func(t[i], i, t)) {
            res[c++] = kValue;
          }
        }
      }
    } else {
      while (++i !== len) {
        // checks to see if the key was set
        if (i in this) {
          kValue = t[i];
          if (func.call(thisArg, t[i], i, t)) {
            res[c++] = kValue;
          }
        }
      }
    }

    res.length = c; // shrink down array to proper size
    return res;
  };
}
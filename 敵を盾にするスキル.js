/*--------------------------------------------------------------------------
　敵を盾にするスキル ver 1.1

■作成者
キュウブ

■概要
隣にいる敵対勢力ユニットに攻撃を受けさせるスキルを設定できます。
隣接する敵対勢力ユニットが複数いた場合、盾にするユニットはランダムで選出されます。

■使い方
カスタムキーワードを"scapegoat"と設定したカスタムスキルを設定すればOK

■更新履歴
ver 1.1 2023/06/14
わかりやすくなるようにスキル発動演出を追加
有効相手や発動率の設定に対応
※ただし、対象となるのは"盾にされるユニット"であり、"攻撃を行うユニット"ではありません。

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
  var MessageSkillNameCommand = defineObject(MessageTitleEventCommand, {
    _counter: 0,

    enterEventCommandCycle: function (skill, unit) {
      this._prepareEventCommandMemberData(skill, unit);
      return this._completeEventCommandMemberData();
    },

    moveEventCommandCycle: function () {
      if (this._counter.moveCycleCounter() !== MoveResult.CONTINUE) {
        this._counter.setCounterInfo(-1);
        return MoveResult.END;
      }

      return MoveResult.CONTINUE;
    },

    drawEventCommandCycle: function () {
      var x, y, pos;
      var textui = this._getTitleText();
      var pic = textui.getUIImage();
      var color = textui.getColor();
      var font = textui.getFont();
      TextRenderer.drawTitleText(
        this._xStart,
        this._yStart,
        this._text,
        color,
        font,
        TextFormat.CENTER,
        pic
      );
    },

    _prepareEventCommandMemberData: function (skill, unit) {
      var textui = this._getTitleText();
      var font = textui.getFont();
      this._counter = createObject(CycleCounter);
      this._text = skill.getName();
      this._textWidth = TextRenderer.getTextWidth(this._text, font);
      this._partsWidth = TitleRenderer.getTitlePartsWidth();
      this._partsHeight = TitleRenderer.getTitlePartsHeight();
      this._xStart =
        unit.getMapX() * GraphicsFormat.MAPCHIP_WIDTH +
        GraphicsFormat.MAPCHIP_WIDTH / 2 -
        root.getCurrentSession().getScrollPixelX() -
        ((TitleRenderer.getTitlePartsCount(skill.getName(), font) + 2) *
          this._partsWidth) /
          2;
      this._yStart =
        unit.getMapY() * GraphicsFormat.MAPCHIP_HEIGHT +
        GraphicsFormat.MAPCHIP_HEIGHT / 2 -
        root.getCurrentSession().getScrollPixelY();
      root.getCurrentSession().setActiveEventUnit(unit);
    },

    _completeEventCommandMemberData: function () {
      this._counter.setCounterInfo(36);
      this._playTitleSound();

      return EnterResult.OK;
    },

    _getTitleText: function () {
      return root.queryTextUI("itemuse_title");
    },

    _playTitleSound: function () {
      MediaControl.soundDirect("skillinvocation");
    }
  });

  var _SkillRandomizer_isCustomSkillInvokedInternal =
    SkillRandomizer.isCustomSkillInvokedInternal;
  SkillRandomizer.isCustomSkillInvokedInternal = function (
    active,
    passive,
    skill,
    keyword
  ) {
    if (keyword === "scapegoat") {
      return this._isSkillInvokedInternal(active, passive, skill);
    } else {
      return _SkillRandomizer_isCustomSkillInvokedInternal.apply(
        this,
        arguments
      );
    }
  };

  AttackStartType.SCAPEGOAT = 233; // 他のスクリプトの定数と被らないように、中途半端な数値で設定しておく
  WeaponAutoActionMode.INVOCATION_SKILL = 233;

  WeaponAutoAction._scapegoatUnit = null;
  WeaponAutoAction._scapegoatUnitPosX = -1;
  WeaponAutoAction._scapegoatUnitPosY = -1;
  WeaponAutoAction._showInvocationSkillName = false;
  WeaponAutoAction._skillNameMessage = null;

  var _WeaponAutoAction_setAutoActionInfo = WeaponAutoAction.setAutoActionInfo;
  WeaponAutoAction.setAutoActionInfo = function (unit, combination) {
    _WeaponAutoAction_setAutoActionInfo.apply(this, arguments);
    this._skillNameMessage = createObject(MessageSkillNameCommand);
  };

  var _WeaponAutoAction__moveCursorShow = WeaponAutoAction._moveCursorShow;
  WeaponAutoAction._moveCursorShow = function () {
    var isSkipMode = this.isSkipMode();
    var moveResult = _WeaponAutoAction__moveCursorShow.apply(this, arguments);
    var mode = this.getCycleMode();
    if (
      !isSkipMode &&
      moveResult === MoveResult.CONTINUE &&
      this._showInvocationSkillName &&
      mode === WeaponAutoActionMode.PREATTACK
    ) {
      this.changeCycleMode(WeaponAutoActionMode.INVOCATION_SKILL);
    }
    return moveResult;
  };

  var _WeaponAutoAction_moveAutoAction = WeaponAutoAction.moveAutoAction;
  WeaponAutoAction.moveAutoAction = function () {
    var result;
    var mode = this.getCycleMode();
    if (mode === WeaponAutoActionMode.INVOCATION_SKILL) {
      result = this._moveInvocationSkill();
    } else {
      result = _WeaponAutoAction_moveAutoAction.apply(this, arguments);
    }
    return result;
  };

  WeaponAutoAction._moveInvocationSkill = function () {
    if (
      this._skillNameMessage.moveEventCommandCycle() !== MoveResult.CONTINUE
    ) {
      this._showInvocationSkillName = false;
      this.changeCycleMode(WeaponAutoActionMode.PREATTACK);
    }
    return MoveResult.CONTINUE;
  };

  var _WeaponAutoAction_drawAutoAction = WeaponAutoAction.drawAutoAction;
  WeaponAutoAction.drawAutoAction = function () {
    var mode = this.getCycleMode();
    if (mode === WeaponAutoActionMode.INVOCATION_SKILL) {
      this._drawInvocationSkill();
    } else {
      _WeaponAutoAction_drawAutoAction.apply(this, arguments);
    }
  };

  WeaponAutoAction._drawInvocationSkill = function () {
    this._skillNameMessage.drawEventCommandCycle();
  };

  var _WeaponAutoAction__createAttackParam =
    WeaponAutoAction._createAttackParam;
  WeaponAutoAction._createAttackParam = function () {
    var attackParam = _WeaponAutoAction__createAttackParam.apply(
      this,
      arguments
    );
    var unit = this._unit;
    var targetUnit = this._targetUnit;
    var skill = SkillControl.getPossessionCustomSkill(
      this._targetUnit,
      "scapegoat"
    );
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
          FilterControl.isReverseUnitTypeAllowed(targetUnit, adjacentUnit) &&
          SkillRandomizer.isCustomSkillInvokedInternal(
            targetUnit,
            adjacentUnit,
            skill,
            "scapegoat"
          )
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
        if (!skill.isHidden()) {
          this._showInvocationSkillName = true;
          this._skillNameMessage.enterEventCommandCycle(skill, targetUnit);
        }
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
  UnitCommand.Attack._showInvocationSkillName = false;
  UnitCommand.Attack._skillNameMessage = null;
  var _UnitCommand_Attack__prepareCommandMemberData =
    UnitCommand.Attack._prepareCommandMemberData;
  UnitCommand.Attack._prepareCommandMemberData = function () {
    this._skillNameMessage = createObject(MessageSkillNameCommand);
    _UnitCommand_Attack__prepareCommandMemberData.apply(this, arguments);
  };

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
          FilterControl.isReverseUnitTypeAllowed(targetUnit, adjacentUnit) &&
          SkillRandomizer.isCustomSkillInvokedInternal(
            targetUnit,
            adjacentUnit,
            skill,
            "scapegoat"
          )
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
        if (!skill.isHidden()) {
          this._showInvocationSkillName = true;
          this._skillNameMessage.enterEventCommandCycle(skill, targetUnit);
        }
      } else {
        this._scapegoatUnit = null;
      }
    }
    return attackParam;
  };

  // 発動スキルの表示を行うための改変であるが、
  // 本来であればAttackCommandMode.INVOCATIONといった定数を用意し、
  // AttackCommandMode.SELECT->AttackCommandMode.INVOCATION->AttackCommandMode.RESULTと遷移させるのが適切である。
  // しかし、AttackCommandMode.SELECTからAttackCommandMode.INVOCATIONに移行させようとする際の、
  // 他スクリプトとの競合リスクを鑑みて、AttackCommandMode.RESULTの中に詰め込む事にした。
  // そのため、見通しの悪いコードになっている。
  var _UnitCommand_Attack__moveResult = UnitCommand.Attack._moveResult;
  UnitCommand.Attack._moveResult = function () {
    if (
      this._showInvocationSkillName &&
      this._skillNameMessage.moveEventCommandCycle() === MoveResult.CONTINUE
    ) {
      return MoveResult.CONTINUE;
    } else {
      this._showInvocationSkillName = false;
      return _UnitCommand_Attack__moveResult.apply(this, arguments);
    }
  };

  var _UnitCommand_Attack__drawResult = UnitCommand.Attack._drawResult;
  UnitCommand.Attack._drawResult = function () {
    if (this._showInvocationSkillName) {
      this._skillNameMessage.drawEventCommandCycle();
    } else {
      _UnitCommand_Attack__drawResult.apply(this, arguments);
    }
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

/*
  攻撃回数をスキル発動条件とする(FEHのカウント) ver 1.5

[概要]
スキルに以下のような発動条件を設定ができるようになります。
・攻撃した回数が一定数に達した時
・攻撃された回数が一定数に達した時
・攻撃を行った回数とされた回数の合計が一定数に達した時(FEHのカウントとほぼ同様)

使用例: 
・10回攻撃を受けた後に発動する即死
・5回攻撃する毎に発動する必殺
など

[制限]
・本スクリプトの発動条件を持つスキルは1ユニットにつき1つまでしか設定してはなりません。複数つけた場合正常な挙動は保障されません。

[設定の仕方]
1.スキルの設定
カスタムパラメータに下記のようなオブジェクトを加えます
attackCountCondition: {
	countConditionType: <発動条件タイプ>,
	value: <攻撃回数>
}
発動条件タイプには以下のような値を設定します。

攻撃した回数が一定数に達した時に発動 -> 312
攻撃された回数が一定数に達した時に発動 -> 313
攻撃を行った回数とされた回数の合計が一定数に達した時に発動 -> 314

設定例) 10回攻撃を受けた後に発動させたい場合
attackCountCondition: {
	countConditionType: 313,
	value: 10
}

2.攻撃回数リセットの設定(プレイヤーキャラに本スキルを設定する場合のみ必須)
この設定を行わないと章移行時に各プレイヤーキャラが前章の攻撃回数を引き継いでしまいます。
攻撃回数をリセットするにはマップ共有イベントのオープニングやエンディングイベントで
スクリプトの実行->イベントコマンドの呼び出し->"AttackCountSkillResetCommand" と設定して
このイベントコマンドを毎章呼び出すようにしてください。

3.残りの攻撃回数を表示する(かなり面倒くさいので表示させなくても良いならスルーで大丈夫です)
各クラスの条件表示で
キーワードを"SkillCount"、データ条件に本スクリプトの発動条件を持つ全てのスキルを"一致"で設定します。
これでスキルを持つユニットは左上に発動までの残り攻撃回数が表示されるようになります。
表示される数字の色は以下のように条件によって異なります。
・攻撃した回数が一定数に達した時 -> 青色
・攻撃された回数が一定数に達した時 -> 赤色
・攻撃を行った回数とされた回数の合計が一定数に達した時 -> 緑色

※ 他に条件表示を設定している場合はそちらが優先されて数字が表示されない可能性があります。

[推奨バージョン]
srpg studio ver 1.301

[製作者名]
キュウブ

[更新履歴]

[規約]
(C)2020 キュウブ
Released under the MIT license
https://opensource.org/licenses/mit-license.php
*/

InvocationType.ACTIVE_COUNT = 312;
InvocationType.PASSIVE_COUNT = 313;
InvocationType.ACTIVE_AND_PASSIVE_COUNT = 314;

SkillControl.initAttackCountSkill = function (unit) {
  unit.custom.attackCountSkill = {
    activeCount: 0,
    passiveCount: 0
  };
};

SkillControl.getAttackCountSkill = function (unit) {
  var weapon = ItemControl.getEquippedWeapon(unit);
  var arr = SkillControl.getSkillMixArray(unit, weapon, -1, "");

  for (var i = 0; i < arr.length; i++) {
    if (validateAttackCountConditionCustomParameter(arr[i].skill)) {
      return arr[i].skill;
    }
  }

  return null;
};

NormalAttackOrderBuilder._attackCountUp = function (active, passive) {
  if (typeof active.custom.attackCountSkill !== "object") {
    SkillControl.initAttackCountSkill(active);
  }

  if (active.custom.attackCountSkill.activeCount >= 0) {
    active.custom.attackCountSkill.activeCount++;
  }

  if (typeof passive.custom.attackCountSkill !== "object") {
    SkillControl.initAttackCountSkill(passive);
  }

  if (passive.custom.attackCountSkill.passiveCount >= 0) {
    passive.custom.attackCountSkill.passiveCount++;
  }
};

NormalAttackOrderBuilder._endCountSet = function (active, passive) {
  if (typeof active.custom.attackCountSkill !== "object") {
    SkillControl.initAttackCountSkill(active);
  }

  this._skillCountReset(active);

  if (typeof passive.custom.attackCountSkill !== "object") {
    SkillControl.initAttackCountSkill(passive);
  }

  this._skillCountReset(passive);
};

NormalAttackOrderBuilder._skillCountReset = function (unit) {
  if (unit.custom.attackCountSkill.activeCount === -1) {
    unit.custom.attackCountSkill.activeCount = 0;
  }

  if (unit.custom.attackCountSkill.passiveCount === -1) {
    unit.custom.attackCountSkill.passiveCount = 0;
  }
};

NormalAttackOrderBuilder._startVirtualAttack = function () {
  var i, j, isFinal, attackCount, src, dest;
  var virtualActive, virtualPassive, isDefaultPriority;
  var unitSrc = this._attackInfo.unitSrc;
  var unitDest = this._attackInfo.unitDest;

  src = VirtualAttackControl.createVirtualAttackUnit(unitSrc, unitDest, true, this._attackInfo);
  dest = VirtualAttackControl.createVirtualAttackUnit(unitDest, unitSrc, false, this._attackInfo);

  src.isWeaponLimitless = DamageCalculator.isWeaponLimitless(unitSrc, unitDest, src.weapon);
  dest.isWeaponLimitless = DamageCalculator.isWeaponLimitless(unitDest, unitSrc, dest.weapon);

  isDefaultPriority = this._isDefaultPriority(src, dest);
  if (isDefaultPriority) {
    src.isInitiative = true;
  } else {
    dest.isInitiative = true;
  }

  for (i = 0; ; i++) {
    // if文とelse文が交互に実行される。
    // これにより、こちらが攻撃をした後は、相手が攻撃のように順番が変わる。
    if (i % 2 === 0) {
      if (isDefaultPriority) {
        virtualActive = src;
        virtualPassive = dest;
      } else {
        virtualActive = dest;
        virtualPassive = src;
      }
    } else {
      if (isDefaultPriority) {
        virtualActive = dest;
        virtualPassive = src;
      } else {
        virtualActive = src;
        virtualPassive = dest;
      }
    }

    // 行動回数は残っているか
    if (VirtualAttackControl.isRound(virtualActive)) {
      VirtualAttackControl.decreaseRoundCount(virtualActive);

      attackCount = this._getAttackCount(virtualActive, virtualPassive);

      // 2回連続で攻撃するようなこともあるため、ループ処理
      for (j = 0; j < attackCount; j++) {
        isFinal = this._setDamage(virtualActive, virtualPassive);
        this._attackCountUp(virtualActive.unitSelf, virtualPassive.unitSelf);
        if (isFinal) {
          // ユニットが死亡したから、これ以上戦闘を継続しない
          virtualActive.roundCount = 0;
          virtualPassive.roundCount = 0;
          break;
        }
      }
    }

    if (virtualActive.roundCount === 0 && virtualPassive.roundCount === 0) {
      break;
    }
  }

  this._endCountSet(src.unitSelf, dest.unitSelf);

  this._endVirtualAttack(src, dest);
};

var validateAttackCountConditionCustomParameter = function (skill) {
  if (!skill) {
    return false;
  }
  if (typeof skill.custom.attackCountCondition !== "object") {
    return false;
  }

  if (!"countConditionType" in skill.custom.attackCountCondition || !"value" in skill.custom.attackCountCondition) {
    return false;
  }

  if (
    typeof skill.custom.attackCountCondition.countConditionType !== "number" ||
    typeof skill.custom.attackCountCondition.value !== "number"
  ) {
    return false;
  }

  if (
    skill.custom.attackCountCondition.countConditionType < InvocationType.ACTIVE_COUNT ||
    skill.custom.attackCountCondition.countConditionType > InvocationType.ACTIVE_AND_PASSIVE_COUNT ||
    skill.custom.attackCountCondition.value < 0
  ) {
    return false;
  }

  return true;
};

(function () {
  var temp1 = SkillRandomizer._isSkillInvokedInternal;
  SkillRandomizer._isSkillInvokedInternal = function (active, passive, skill) {
    var variableTable, index, result, variable, value, activeWeaponDrillLevel, passiveWeaponDrillLevel;

    if (!skill.getTargetAggregation().isCondition(passive)) {
      return false;
    }

    // 相手がスキルを無効化できる場合は、スキルを発動しない
    if (SkillControl.getBattleSkillFromFlag(passive, active, SkillType.INVALID, InvalidFlag.SKILL) !== null) {
      return false;
    }

    if (validateAttackCountConditionCustomParameter(skill)) {
      return Probability.getInvocationProbability(
        active,
        skill.custom.attackCountCondition.countConditionType,
        skill.custom.attackCountCondition.value
      );
    } else {
      return temp1.call(this, active, passive, skill);
    }
  };

  var temp2 = Probability.getInvocationProbability;
  Probability.getInvocationProbability = function (unit, type, value) {
    var result;

    if (type >= InvocationType.ACTIVE_COUNT && type <= InvocationType.ACTIVE_AND_PASSIVE_COUNT) {
      if (typeof unit.custom.attackCountSkill !== "object") {
        SkillControl.initAttackCountSkill(unit);
      }

      switch (type) {
        case InvocationType.ACTIVE_COUNT:
          result = unit.custom.attackCountSkill.activeCount >= value;
          unit.custom.attackCountSkill.activeCount = result === true ? -1 : unit.custom.attackCountSkill.activeCount;
          break;
        case InvocationType.PASSIVE_COUNT:
          result = unit.custom.attackCountSkill.passiveCount >= value;
          unit.custom.attackCountSkill.passiveCount = result === true ? -1 : unit.custom.attackCountSkill.passiveCount;
          break;
        case InvocationType.ACTIVE_AND_PASSIVE_COUNT:
          result = unit.custom.attackCountSkill.activeCount + unit.custom.attackCountSkill.passiveCount >= value;
          unit.custom.attackCountSkill.activeCount = result === true ? -1 : unit.custom.attackCountSkill.activeCount;
          unit.custom.attackCountSkill.passiveCount = result === true ? -1 : unit.custom.attackCountSkill.passiveCount;
          break;
        default:
          result = false;
          break;
      }
    } else {
      result = temp2.call(this, unit, type, value);
    }
    return result;
  };

  var temp3 = SkillInfoWindow._drawInvocationValue;
  SkillInfoWindow._drawInvocationValue = function (x, y, skill, length, color, font) {
    var text;

    if (validateAttackCountConditionCustomParameter(skill)) {
      text = InvocationRenderer.getInvocationAttackCountConditionCustomParameter(
        skill.custom.attackCountCondition.value,
        skill.custom.attackCountCondition.countConditionType
      );

      TextRenderer.drawKeywordText(x, y, "発動条件", length, ColorValue.KEYWORD, font);

      x += ItemInfoRenderer.getSpaceX();

      TextRenderer.drawKeywordText(x, y, text, -1, color, font);
    } else {
      temp3.call(this, x, y, skill, length, color, font);
    }
  };

  InvocationRenderer.getInvocationAttackCountConditionCustomParameter = function (value, type) {
    var text = "";
    if (type === InvocationType.ACTIVE_COUNT) {
      text = value + "回攻撃後";
    } else if (type === InvocationType.PASSIVE_COUNT) {
      text = value + "回攻撃された後";
    } else if (type === InvocationType.ACTIVE_AND_PASSIVE_COUNT) {
      text = value + "回攻防後";
    }

    return text;
  };

  var temp4 = CustomCharChipGroup._configureCustomCharChip;
  CustomCharChipGroup._configureCustomCharChip = function (groupArray) {
    temp4.call(this, groupArray);
    groupArray.appendObject(CustomCharChip.AttackCountSkill);
  };

  var temp5 = ScriptExecuteEventCommand._configureOriginalEventCommand;
  ScriptExecuteEventCommand._configureOriginalEventCommand = function (groupArray) {
    temp5.call(this, groupArray);
    groupArray.appendObject(AttackCountSkillResetCommand);
  };

  var AttackCountSkillResetCommand = defineObject(BaseEventCommand, {
    enterEventCommandCycle: function () {
      this._prepareEventCommandMemberData();

      if (!this._checkEventCommand()) {
        return EnterResult.NOTENTER;
      }

      return this._completeEventCommandMemberData();
    },

    moveEventCommandCycle: function () {
      return MoveResult.END;
    },

    drawEventCommandCycle: function () {},

    getEventCommandName: function () {
      return "AttackCountSkillResetCommand";
    },
    isEventCommandSkipAllowed: function () {
      return false;
    },

    _prepareEventCommandMemberData: function () {},

    _checkEventCommand: function () {
      var unitList = root.getCurrentSession().getPlayerList();
      var unitCount = unitList.getCount();

      for (var i = 0; i < unitCount; i++) {
        unit = unitList.getData(i);

        if (typeof unit.custom.attackCountSkill === "object") {
          unit.custom.attackCountSkill.activeCount = 0;
          unit.custom.attackCountSkill.passiveCount = 0;
        }
      }

      return true;
    },

    _completeEventCommandMemberData: function () {
      return EnterResult.OK;
    },

    _createScreenParam: function () {
      return true;
    }
  });
})();

UnitRenderer.drawCharChip = function (x, y, unitRenderParam) {
  var dx, dy, dxSrc, dySrc;
  var directionArray = [4, 1, 2, 3, 0];
  var handle = unitRenderParam.handle;
  var width = GraphicsFormat.CHARCHIP_WIDTH;
  var height = GraphicsFormat.CHARCHIP_HEIGHT;
  var xSrc = handle.getSrcX() * (width * 3);
  var ySrc = handle.getSrcY() * (height * 5);
  var pic = this._getGraphics(handle, unitRenderParam.colorIndex);
  var tileSize = this._getTileSize(unitRenderParam);

  if (pic === null) {
    return;
  }

  dx = Math.floor((width - tileSize.width) / 2);
  dy = Math.floor((height - tileSize.height) / 2);
  dxSrc = unitRenderParam.animationIndex;
  dySrc = directionArray[unitRenderParam.direction];
  pic.setAlpha(unitRenderParam.alpha);
  pic.setDegree(unitRenderParam.degree);
  pic.setReverse(unitRenderParam.isReverse);
  pic.drawStretchParts(x - dx, y - dy, width, height, xSrc + dxSrc * width, ySrc + dySrc * height, width, height);
};

CustomCharChip.AttackCountSkill = defineObject(BaseCustomCharChip, {
  _attackCountSkill: null,
  _preUnit: null,

  moveCustomCharChip: function () {
    return MoveResult.CONTINUE;
  },

  drawCustomCharChip: function (cpData) {
    var x = cpData.xPixel;
    var y = cpData.yPixel;
    var unitRenderParam = StructureBuilder.buildUnitRenderParam();
    var handle = cpData.unit.getCharChipResourceHandle();

    if (handle !== null || !handle.isNullHandle()) {
      unitRenderParam.handle = handle;
    }

    unitRenderParam.colorIndex = cpData.isWait ? 3 : this._getColorIndex(cpData);
    unitRenderParam.alpha = cpData.alpha;
    unitRenderParam.direction = cpData.unit.getDirection();
    unitRenderParam.animationIndex = cpData.animationIndex;
    unitRenderParam.direction = cpData.direction;

    unitRenderParam.isScroll = true;

    this._drawGround(cpData, x, y);
    UnitRenderer.drawCharChip(x, y, unitRenderParam);

    if (!this._preUnit || this._preUnit.getId() !== cpData.unit.getId()) {
      this._attackCountSkill = SkillControl.getAttackCountSkill(cpData.unit);
      this._preUnit = cpData.unit;

      if (typeof cpData.unit.custom.attackCountSkill !== "object") {
        SkillControl.initAttackCountSkill(cpData.unit);
      }
    }

    this._drawInfo(cpData, x, y);
  },

  drawMenuCharChip: function (cpData) {
    this.drawCustomCharChip(cpData);
  },

  _getColorIndex: function (cpData) {
    return cpData.unit.getUnitType();
  },

  _getAlpha: function () {
    return 0;
  },

  _drawGround: function (cpData, x, y) {
    if (cpData.isSymbol) {
      root.drawCharChipSymbol(x, y, cpData.unit);
    }
  },

  _drawInfo: function (cpData, x, y) {
    if (cpData.isHpVisible) {
      root.drawCharChipHpGauge(x, y, cpData.unit);
    }

    if (cpData.isStateIcon) {
      root.drawCharChipStateIcon(x, y, cpData.unit);
    }

    if (this._attackCountSkill) {
      this._drawCount(x, y, cpData.unit);
    }
  },

  _drawCount: function (x, y, unit) {
    var skillRestCount = 0;
    var color = 0;

    if (this._attackCountSkill.custom.attackCountCondition.countConditionType === InvocationType.ACTIVE_COUNT) {
      skillRestCount =
        this._attackCountSkill.custom.attackCountCondition.value - unit.custom.attackCountSkill.activeCount;
      color = 1;
    } else if (this._attackCountSkill.custom.attackCountCondition.countConditionType === InvocationType.PASSIVE_COUNT) {
      skillRestCount =
        this._attackCountSkill.custom.attackCountCondition.value - unit.custom.attackCountSkill.passiveCount;
      color = 3;
    } else if (
      this._attackCountSkill.custom.attackCountCondition.countConditionType === InvocationType.ACTIVE_AND_PASSIVE_COUNT
    ) {
      skillRestCount =
        this._attackCountSkill.custom.attackCountCondition.value -
        unit.custom.attackCountSkill.activeCount -
        unit.custom.attackCountSkill.passiveCount;
      color = 2;
    }

    if (skillRestCount <= 0) {
      NumberRenderer.drawNumberColor(x, y - 5, 0, color, 255);
    } else {
      NumberRenderer.drawNumberColor(x, y - 5, skillRestCount, color, 255);
    }
  },

  getKeyword: function () {
    return "SkillCount";
  }
});

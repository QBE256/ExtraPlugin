/*--------------------------------------------------------------------------
　戦闘後に自分か相手のHPを変動させるスキル ver 2.3

■作成者
キュウブ

■概要
戦闘後に自分のHPを回復、あるいは敵のHPを削るスキルを設定できます。

※ ver2.0にてPerimeterAttack(自分の周囲にいる敵のHPを削るスキル)を追加しました。
ただし他2種のスキルと異なり、
・先制戦闘時しか発動できない
・とどめを刺すことはできない
といった制約があります

■使い方
■■自分のHPを回復するスキル
1.カスタムスキルにカスタムキーワード"RecoveryHpAfterBattle"と設定
2.以下のようなカスタムパラメータを設定

recoveryHpAfterBattle: {
  type: <回復量のタイプ。固定値であれば0(RecoveryHpType.FIXED),最大HP割合であれば1(RecoveryHpType.RATE)>,
  value: <回復量>,
  effect: {
    isRuntime: <回復エフェクトアニメがランタイムであればtrue,オリジナルであればfalse>,
    id: <回復エフェクトアニメのID>
  },
  isFastAttack: <先制でのみ発動させる場合はtrue or 後攻で発動させたい場合はfalse, どちらでも発動させたい場合はこのパラメータは記載しない事>
}

例.戦闘後最大HP20%回復するスキル(エフェクトは光の輪)
recoveryHpAfterBattle: {
  type: RecoveryHpType.RATE,
  value: 0.2,
  effect: {
    isRuntime: true,
    id: 5
  }
}

例.戦闘後HPが5回復するスキル(エフェクトは闇の渦)
recoveryHpAfterBattle: {
  type: RecoveryHpType.FIXED,
  value: 5,
  effect: {
    isRuntime: true,
    id: 6
  }
}

■■ 敵にダメージ、もしくはステートを与えるスキル
1.カスタムスキルにカスタムキーワード"Pursuit"と設定
2.以下のようなカスタムパラメータを設定

pursuit: {
  type: <ダメージ量のタイプ。固定値であれば0(PursuitDamageType.FIXED),最大HP割合であれば1(PursuitDamageType.RATE)>,ステートを付与したい場合は2(PursuitDamageType.STATE)
  value: <ダメージ量、もしくは付与したいステートID>,
  effect: {
    isRuntime: <ダメージエフェクトアニメがランタイムであればtrue,オリジナルであればfalse>,
    id: <ダメージエフェクトアニメのID>
  },
  isFinish: <とどめをさす場合はtrue, ささない場合はfalse>
  isFastAttack: <先制でのみ発動させる場合はtrue or 後攻で発動させたい場合はfalse, どちらでも発動させたい場合はこのパラメータは記載しない事>,
  max: <ダメージ上限値, typeが1のときのみ有効。上限値が不要な場合はこのパラメータを記載する必要は無い>
}
※ステート付与の場合は、effect, isFinishはどんな値を入れても効果がありませんが。何かしら値を設定しておいてください。

例:戦闘後敵に最大HP10%分のダメージを与えるスキル(エフェクトは炎の渦、とどめはささず最低でもHPは1残る)
pursuit: {
  type: PursuitDamageType.RATE,
  value: 0.1,
  effect: {
    isRuntime: true,
    id: 8
  },
  isFinish: false
}

例:下記の場合は、上記に加えて、先手の場合しか発動しない上にダメージ上限が5になる
pursuit: {
  type: PursuitDamageType.RATE,
  value: 0.1,
  max: 5,
  effect: {
    isRuntime: true,
    id: 8
  },
  isFinish: false,
  isFastAttack: true
}

例:下記の場合は、ID0のステートを付与する。（エフェクトはeffectの設定を無視してID0ステートに設定されているものになる）
pursuit: {
  type: PursuitDamageType.STATE,
  value: 0,
  max: 1,
  effect: {
    isRuntime: true,
    id: 1
  },
  isFinish: false,
  isFastAttack: true
}

■■自分の周囲にいる敵のHPを削るスキル(ver2.0にて新規追加)
1.カスタムスキルにカスタムキーワード"PerimeterAttack"と設定
2.以下のようなカスタムパラメータを設定

perimeterAttack: {
  type: <ダメージ量のタイプ。固定値であれば0(PerimeterAttackDamageType.FIXED),最大HP割合であれば1(PerimeterAttackDamageType.RATE)>,
  value: <ダメージ量>,
  range: <射程距離>
  effect: {
    isRuntime: <ダメージエフェクトアニメがランタイムであればtrue,オリジナルであればfalse>,
    id: <ダメージエフェクトアニメのID>
  },
  max: <ダメージ上限値, typeが1のときのみ有効。上限値が不要な場合はこのパラメータを記載しなくてもよい>
}

例:先制で戦闘後周囲2マスの敵に最大HP20%分のダメージを与えるスキル(エフェクトは氷魔法、とどめはさせない)
perimeterAttack: {
  type: PerimeterAttackDamageType.RATE,
  value: 0.2,
  effect: {
    isRuntime: true,
    id: 17
  },
  range: 2
}

■更新履歴
ver 2.3 2024/08/25
・とどめをさせない設定のpursuitスキルでとどめをさしてしまう事があるバグを修正

ver 2.2 2024/08/24
・pursuitスキルとperimeterAttackにて命中率、有効相手の設定を有効化

var 2.1 2024/08/20
・pursuitスキルのみ複数スキル発動可能なように変更
・pursuitスキルでダメージではなくステート付与ができる設定を追加
※pursuit以外の2種類での実装は未定となります

ver 2.0 2022/06/24
自分の周囲にいる敵のHPを削るスキルを追加

ver 1.2 2022/04/24
ダメージ上限値と先制or後攻のみ発動可能になるパラメータを追加

ver 1.1 2021/12/09
カスパラ例が誤っていたので修正(コード部分には手を入れてないです)

ver 1.0 2021/11/20
公開

■対応バージョン
SRPG Studio Version:1.161

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。
・クレジット明記無し　OK (明記する場合は"キュウブ"でお願いします)
・再配布、転載　OK (バグなどがあったら修正できる方はご自身で修正版を配布してもらっても構いません)
・wiki掲載　OK
・SRPG Studio利用規約は遵守してください。

--------------------------------------------------------------------------*/
(function () {
  var _PreAttack__pushFlowEntriesEnd = PreAttack._pushFlowEntriesEnd;
  PreAttack._pushFlowEntriesEnd = function (straightFlow) {
    _PreAttack__pushFlowEntriesEnd.apply(this, arguments);
    straightFlow.pushFlowEntry(RecoveryHpFlowEntry);
    straightFlow.pushFlowEntry(PursuitFlowEntry);
    straightFlow.pushFlowEntry(PerimeterAttackFlowEntry);
  };

  var _SkillRandomizer_isCustomSkillInvokedInternal = SkillRandomizer.isCustomSkillInvokedInternal;
  SkillRandomizer.isCustomSkillInvokedInternal = function (active, passive, skill, keyword) {
    if (keyword === "Pursuit") {
      return this._isPursuit(active, passive, skill);
    } else if (keyword === "PerimeterAttack") {
      return this._isPerimeterAttack(active, passive, skill);
    }
    return _SkillRandomizer_isCustomSkillInvokedInternal.apply(this, arguments);
  };
})();

var RecoveryHpType = {
  FIXED: 0,
  RATE: 1
};

var PursuitDamageType = {
  FIXED: 0,
  RATE: 1,
  STATE: 2
};

var PerimeterAttackDamageType = {
  FIXED: 0,
  RATE: 1
};

SkillRandomizer._isPursuit = function (active, passive, skill) {
  if (!skill.getTargetAggregation().isCondition(passive)) {
    return false;
  }

  return Probability.getInvocationProbabilityFromSkill(active, skill);
};

SkillRandomizer._isPerimeterAttack = function (active, passive, skill) {
  if (!skill.getTargetAggregation().isCondition(passive)) {
    return false;
  }

  return Probability.getInvocationProbabilityFromSkill(active, skill);
};

var RecoveryHpFlowEntry = defineObject(BaseFlowEntry, {
  _dynamicEvent: null,

  enterFlowEntry: function (preAttack) {
    this._prepareMemberData(preAttack);
    return this._completeMemberData(preAttack);
  },

  moveFlowEntry: function () {
    return this._dynamicEvent.moveDynamicEvent();
  },

  _prepareMemberData: function (preAttack) {
    this._dynamicEvent = createObject(DynamicEvent);
  },

  _completeMemberData: function (preAttack) {
    var attackUnit = preAttack.getAttackParam().unit;
    var defenseUnit = preAttack.getAttackParam().targetUnit;
    var generator = this._dynamicEvent.acquireEventGenerator();
    this._setDynamicEvent(attackUnit, generator, true);
    this._setDynamicEvent(defenseUnit, generator, false);

    return this._dynamicEvent.executeDynamicEvent();
  },

  _setDynamicEvent: function (unit, generator, isFastAttack) {
    var effect;
    var skill = SkillControl.getPossessionCustomSkill(unit, "RecoveryHpAfterBattle");
    var enabledEvent = this._enabledSkill(unit, skill, isFastAttack);

    if (enabledEvent) {
      effect = this._getRecoveryEffect(skill);
      generator.locationFocus(unit.getMapX(), unit.getMapY(), true);
      generator.hpRecovery(unit, effect, this._getRecoveryValue(unit, skill), RecoveryType.SPECIFY, false);
    }
  },

  _getRecoveryEffect: function (skill) {
    var isRuntime = skill.custom.recoveryHpAfterBattle.effect.isRuntime;
    var id = skill.custom.recoveryHpAfterBattle.effect.id;

    return root.getBaseData().getEffectAnimationList(isRuntime).getDataFromId(id);
  },

  _getRecoveryValue: function (unit, skill) {
    var maxHp, rate;
    var recoveryValue = 0;

    if (skill.custom.recoveryHpAfterBattle.type === RecoveryHpType.FIXED) {
      recoveryValue = skill.custom.recoveryHpAfterBattle.value;
    } else if (skill.custom.recoveryHpAfterBattle.type === RecoveryHpType.RATE) {
      maxHp = ParamBonus.getMhp(unit);
      rate = skill.custom.recoveryHpAfterBattle.value;
      recoveryValue = Math.floor(maxHp * rate);
    }

    return recoveryValue;
  },

  _enabledSkill: function (unit, skill, isFastAttack) {
    if (!skill) {
      return false;
    } else if (!validateRecoveryHpAfterBattleSkill(skill)) {
      return false;
    } else if (unit.getAliveState() !== AliveType.ALIVE) {
      return false;
    } else if (!this._enabledRecovery(unit)) {
      return false;
    }

    if (skill.custom.recoveryHpAfterBattle.hasOwnProperty("isFastAttack")) {
      return skill.custom.recoveryHpAfterBattle.isFastAttack === isFastAttack;
    } else {
      return true;
    }
  },

  _enabledRecovery: function (unit) {
    return unit.getHp() < ParamBonus.getMhp(unit);
  }
});

var PursuitFlowEntry = defineObject(BaseFlowEntry, {
  _dynamicEvent: null,

  enterFlowEntry: function (preAttack) {
    this._prepareMemberData(preAttack);
    return this._completeMemberData(preAttack);
  },

  moveFlowEntry: function () {
    return this._dynamicEvent.moveDynamicEvent();
  },

  _prepareMemberData: function (preAttack) {
    this._dynamicEvent = createObject(DynamicEvent);
  },

  _completeMemberData: function (preAttack) {
    var attackUnit = preAttack.getAttackParam().unit;
    var defenseUnit = preAttack.getAttackParam().targetUnit;
    var generator = this._dynamicEvent.acquireEventGenerator();

    this._setDynamicEvent(attackUnit, defenseUnit, generator, true);
    this._setDynamicEvent(defenseUnit, attackUnit, generator, false);

    return this._dynamicEvent.executeDynamicEvent();
  },

  _setDynamicEvent: function (unit, targetUnit, generator, isFastAttack) {
    var skills = SkillControl.getDirectSkillArray(unit, SkillType.CUSTOM, "Pursuit");
    var enabledSkills = skills
      .map(function (skill) {
        return skill.skill;
      })
      .filter(function (skill) {
        if (!validatePursuitSkill(skill)) {
          return false;
        } else if (unit.getAliveState() !== AliveType.ALIVE) {
          return false;
        } else if (targetUnit.getAliveState() !== AliveType.ALIVE) {
          return false;
        }
        if (!SkillRandomizer.isCustomSkillInvokedInternal(unit, targetUnit, skill, "Pursuit")) {
          return false;
        }
        if (skill.custom.pursuit.hasOwnProperty("isFastAttack")) {
          return skill.custom.pursuit.isFastAttack === isFastAttack;
        } else {
          return true;
        }
      });

    var that = this;
    var currentTargetHp = targetUnit.getHp();
    enabledSkills.forEach(function (skill) {
      if (skill.custom.pursuit.type === PursuitDamageType.STATE) {
        var state = that._getState(skill);
        if (!!state) {
          generator.locationFocus(targetUnit.getMapX(), targetUnit.getMapY(), true);
          var stateInvocation = root.createStateInvocation(state.getId(), 100, IncreaseType.INCREASE);
          generator.unitStateAddition(targetUnit, stateInvocation, IncreaseType.INCREASE, unit, false);
        }
      } else {
        var damage = that._getDamageValue(targetUnit, skill, currentTargetHp);
        currentTargetHp -= damage;
        if (damage > 0) {
          var effect = that._getDamageEffect(skill);
          generator.locationFocus(targetUnit.getMapX(), targetUnit.getMapY(), true);
          generator.damageHit(targetUnit, effect, damage, DamageType.FIXED, unit, false);
        }
      }
    });
  },

  _getDamageEffect: function (skill) {
    var isRuntime = skill.custom.pursuit.effect.isRuntime;
    var id = skill.custom.pursuit.effect.id;

    return root.getBaseData().getEffectAnimationList(isRuntime).getDataFromId(id);
  },

  _getState: function (skill) {
    var state = root.getBaseData().getStateList().getDataFromId(skill.custom.pursuit.value);
    return state;
  },

  _getDamageValue: function (targetUnit, skill, currentTargetHp) {
    var maxHp, rate;
    var enabledFinish = skill.custom.pursuit.isFinish;
    var damage = 0;
    if (currentTargetHp === 0) {
      return 0;
    }
    if (skill.custom.pursuit.type === PursuitDamageType.FIXED) {
      damage = skill.custom.pursuit.value;
    } else if (skill.custom.pursuit.type === PursuitDamageType.RATE) {
      maxHp = ParamBonus.getMhp(targetUnit);
      rate = skill.custom.pursuit.value;
      damage = Math.floor(maxHp * rate);

      if (skill.custom.pursuit.hasOwnProperty("max") && skill.custom.pursuit.max < damage) {
        damage = skill.custom.pursuit.max;
      }
    }

    if (!enabledFinish && currentTargetHp - damage <= 0) {
      damage = currentTargetHp - 1;
    }

    return damage;
  }
});

var PerimeterAttackFlowEntry = defineObject(BaseFlowEntry, {
  _showDamageCycleCounter: null,
  _dynamicAnimationEvent: null,
  _damageEvents: null,

  enterFlowEntry: function (preAttack) {
    this._prepareMemberData(preAttack);
    return this._completeMemberData(preAttack);
  },

  moveFlowEntry: function () {
    // 実際のHP減少はイベント終了時に行う
    if (this._dynamicAnimationEvent.moveDynamicAnime() !== MoveResult.CONTINUE) {
      this._damageEvents.forEach(function (event) {
        event.unit.setHp(event.restHp);
      });
      return MoveResult.END;
    }

    // ダメージ数値の動きは1度ループが終わったら全体フレームを-1にしてストップさせる
    if (this._showDamageCycleCounter.moveCycleCounter() !== MoveResult.CONTINUE) {
      this._showDamageCycleCounter.setCounterInfo(-1);
    }

    return MoveResult.CONTINUE;
  },

  drawFlowEntry: function () {
    var moveAmount = 0;
    var showCounter = this._showDamageCycleCounter.getCounter();
    if (showCounter <= 10) {
      moveAmount = showCounter * 3;
    } else {
      moveAmount = (20 - showCounter) * 3;
    }
    this._dynamicAnimationEvent.drawDynamicAnime();
    // ダメージ値はイベントを介さず、直接描画する
    this._damageEvents.forEach(function (event) {
      var x = event.unit.getMapX() * GraphicsFormat.MAPCHIP_WIDTH;
      var y = event.unit.getMapY() * GraphicsFormat.MAPCHIP_HEIGHT - moveAmount;
      NumberRenderer.drawAttackNumberColor(x, y, event.damage, 3, 255);
    });
  },

  _prepareMemberData: function (preAttack) {
    this._dynamicAnimationEvent = createObject(DynamicAnime);
    this._showDamageCycleCounter = createObject(CycleCounter);
    this._showDamageCycleCounter.disableGameAcceleration();
    this._showDamageCycleCounter.setCounterInfo(20);
  },

  _completeMemberData: function (preAttack) {
    var unit = preAttack.getAttackParam().unit;
    this._damageEvents = [];
    this._setDynamicEvent(unit);
    return this._damageEvents.length > 0;
  },

  _setDynamicEvent: function (unit) {
    var effect, x, y, animePosition, generator;
    var skill = SkillControl.getPossessionCustomSkill(unit, "PerimeterAttack");
    var enabledSkill = this._enabledSkill(unit, skill);
    var reverseUnits = enabledSkill
      ? this._getSurroundingReverseUnits(unit, skill).filter(function (reverseUnit) {
          return SkillRandomizer.isCustomSkillInvokedInternal(unit, reverseUnit, skill, "PerimeterAttack");
        })
      : [];
    var that = this;

    if (reverseUnits.length > 0) {
      effect = this._getDamageEffect(skill);
      x = unit.getMapX();
      y = unit.getMapY();
      // 発動時は即時スキル使用者に視点を移動させておく
      generator = root.getEventGenerator();
      generator.locationFocus(x, y, true);
      generator.execute();
      // 発動エフェクトの設定
      animePosition = LayoutControl.getMapAnimationPos(LayoutControl.getPixelX(x), LayoutControl.getPixelY(y), effect);
      this._dynamicAnimationEvent.startDynamicAnime(effect, animePosition.x, animePosition.y);
      this._damageEvents = reverseUnits.map(function (reverseUnit) {
        var info = that._getEventInfo(reverseUnit, skill);
        return {
          unit: reverseUnit,
          damage: info.damage,
          restHp: info.restHp
        };
      });
    }
  },

  _getSurroundingReverseUnits: function (unit, skill) {
    var range, enabledIndexs, reverseUnits;

    if (!skill) {
      return [];
    }
    reverseUnits = [];
    range = skill.custom.perimeterAttack.range;
    enabledIndexs = IndexArray.getBestIndexArray(unit.getMapX(), unit.getMapY(), 1, range);

    enabledIndexs.forEach(function (index) {
      var isReverseType;
      var x = CurrentMap.getX(index);
      var y = CurrentMap.getY(index);
      var surroundingUnit = PosChecker.getUnitFromPos(x, y);

      if (surroundingUnit) {
        isReverseType = FilterControl.isReverseUnitTypeAllowed(unit, surroundingUnit);
        if (isReverseType) {
          reverseUnits.push(surroundingUnit);
        }
      }
    });

    return reverseUnits;
  },

  _getDamageEffect: function (skill) {
    var isRuntime = skill.custom.perimeterAttack.effect.isRuntime;
    var id = skill.custom.perimeterAttack.effect.id;

    return root.getBaseData().getEffectAnimationList(isRuntime).getDataFromId(id);
  },

  _getEventInfo: function (targetUnit, skill) {
    var maxHp, rate;
    var currentHp = targetUnit.getHp();
    var damage = 0;
    var restHp = 0;

    if (skill.custom.perimeterAttack.type === PerimeterAttackDamageType.FIXED) {
      damage = skill.custom.perimeterAttack.value;
    } else if (skill.custom.perimeterAttack.type === PerimeterAttackDamageType.RATE) {
      maxHp = ParamBonus.getMhp(targetUnit);
      rate = skill.custom.perimeterAttack.value;
      damage = Math.floor(maxHp * rate);
      if (skill.custom.perimeterAttack.hasOwnProperty("max") && skill.custom.perimeterAttack.max < damage) {
        damage = skill.custom.perimeterAttack.max;
      }
    }

    restHp = currentHp - damage;
    if (restHp <= 0) {
      damage = currentHp - 1;
      restHp = 1;
    }

    return {
      damage: damage,
      restHp: restHp
    };
  },

  _enabledSkill: function (unit, skill) {
    if (!skill) {
      return false;
    } else if (!validatePerimeterAttackSkill(skill)) {
      return false;
    } else if (unit.getAliveState() !== AliveType.ALIVE) {
      return false;
    }

    return true;
  }
});

var validateRecoveryHpAfterBattleSkill = function (skill) {
  if (typeof skill.custom.recoveryHpAfterBattle !== "object") {
    return false;
  }
  if (
    !skill.custom.recoveryHpAfterBattle.hasOwnProperty("type") ||
    !skill.custom.recoveryHpAfterBattle.hasOwnProperty("value") ||
    !skill.custom.recoveryHpAfterBattle.hasOwnProperty("effect")
  ) {
    root.log("invalid recoveryHpAfterBattle parameter");
    return false;
  }
  if (
    typeof skill.custom.recoveryHpAfterBattle.type !== "number" ||
    typeof skill.custom.recoveryHpAfterBattle.value !== "number" ||
    typeof skill.custom.recoveryHpAfterBattle.effect !== "object"
  ) {
    root.log("invalid recoveryHpAfterBattle parameter");
    return false;
  }
  if (
    !skill.custom.recoveryHpAfterBattle.effect.hasOwnProperty("isRuntime") ||
    !skill.custom.recoveryHpAfterBattle.effect.hasOwnProperty("id")
  ) {
    root.log("invalid recoveryHpAfterBattle parameter");
    return false;
  }
  if (
    typeof skill.custom.recoveryHpAfterBattle.effect.isRuntime !== "boolean" ||
    typeof skill.custom.recoveryHpAfterBattle.effect.id !== "number"
  ) {
    root.log("invalid recoveryHpAfterBattle parameter");
    return false;
  }
  return true;
};

var validatePursuitSkill = function (skill) {
  if (typeof skill.custom.pursuit !== "object") {
    return false;
  }
  if (
    !skill.custom.pursuit.hasOwnProperty("type") ||
    !skill.custom.pursuit.hasOwnProperty("value") ||
    !skill.custom.pursuit.hasOwnProperty("effect") ||
    !skill.custom.pursuit.hasOwnProperty("isFinish")
  ) {
    root.log("invalid pursuit parameter");
    return false;
  }
  if (
    typeof skill.custom.pursuit.type !== "number" ||
    typeof skill.custom.pursuit.value !== "number" ||
    typeof skill.custom.pursuit.effect !== "object" ||
    typeof skill.custom.pursuit.isFinish !== "boolean"
  ) {
    root.log("invalid pursuit parameter");
    return false;
  }
  if (!skill.custom.pursuit.effect.hasOwnProperty("isRuntime") || !skill.custom.pursuit.effect.hasOwnProperty("id")) {
    root.log("invalid pursuit parameter");
    return false;
  }
  if (
    typeof skill.custom.pursuit.effect.isRuntime !== "boolean" ||
    typeof skill.custom.pursuit.effect.id !== "number"
  ) {
    root.log("invalid pursuit parameter");
    return false;
  }
  return true;
};

var validatePerimeterAttackSkill = function (skill) {
  if (typeof skill.custom.perimeterAttack !== "object") {
    return false;
  }
  if (
    !skill.custom.perimeterAttack.hasOwnProperty("type") ||
    !skill.custom.perimeterAttack.hasOwnProperty("value") ||
    !skill.custom.perimeterAttack.hasOwnProperty("effect") ||
    !skill.custom.perimeterAttack.hasOwnProperty("range")
  ) {
    root.log("invalid perimeterAttack parameter");
    return false;
  }
  if (
    typeof skill.custom.perimeterAttack.type !== "number" ||
    typeof skill.custom.perimeterAttack.value !== "number" ||
    typeof skill.custom.perimeterAttack.effect !== "object" ||
    typeof skill.custom.perimeterAttack.range !== "number"
  ) {
    root.log("invalid perimeterAttack parameter");
    return false;
  }
  if (
    !skill.custom.perimeterAttack.effect.hasOwnProperty("isRuntime") ||
    !skill.custom.perimeterAttack.effect.hasOwnProperty("id")
  ) {
    root.log("invalid perimeterAttack parameter");
    return false;
  }
  if (
    typeof skill.custom.perimeterAttack.effect.isRuntime !== "boolean" ||
    typeof skill.custom.perimeterAttack.effect.id !== "number"
  ) {
    root.log("invalid perimeterAttack parameter");
    return false;
  }
  return true;
};

// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
if (!Array.prototype["forEach"]) {
  Array.prototype.forEach = function (callback, thisArg) {
    if (this == null) {
      throw new TypeError("Array.prototype.forEach called on null or undefined");
    }

    var T, k;
    // 1. Let O be the result of calling toObject() passing the
    // |this| value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get() internal
    // method of O with the argument "length".
    // 3. Let len be toUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If isCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== "function") {
      throw new TypeError(callback + " is not a function");
    }

    // 5. If thisArg was supplied, let T be thisArg; else let
    // T be undefined.
    if (arguments.length > 1) {
      T = thisArg;
    }

    // 6. Let k be 0
    k = 0;

    // 7. Repeat, while k < len
    while (k < len) {
      var kValue;

      // a. Let Pk be ToString(k).
      //    This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty
      //    internal method of O with argument Pk.
      //    This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {
        // i. Let kValue be the result of calling the Get internal
        // method of O with argument Pk.
        kValue = O[k];

        // ii. Call the Call internal method of callback with T as
        // the this value and argument list containing kValue, k, and O.
        callback.call(T, kValue, k, O);
      }
      // d. Increase k by 1.
      k++;
    }
    // 8. return undefined
  };
}

// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.io/#x15.4.4.19
if (!Array.prototype.map) {
  Array.prototype.map = function (callback /*, thisArg*/) {
    var T, A, k;

    if (this == null) {
      throw new TypeError("this is null or not defined");
    }

    // 1. Let O be the result of calling ToObject passing the |this|
    //    value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal
    //    method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== "function") {
      throw new TypeError(callback + " is not a function");
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (arguments.length > 1) {
      T = arguments[1];
    }

    // 6. Let A be a new array created as if by the expression new Array(len)
    //    where Array is the standard built-in constructor with that name and
    //    len is the value of len.
    A = new Array(len);

    // 7. Let k be 0
    k = 0;

    // 8. Repeat, while k < len
    while (k < len) {
      var kValue, mappedValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal
      //    method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {
        // i. Let kValue be the result of calling the Get internal
        //    method of O with argument Pk.
        kValue = O[k];

        // ii. Let mappedValue be the result of calling the Call internal
        //     method of callback with T as the this value and argument
        //     list containing kValue, k, and O.
        mappedValue = callback.call(T, kValue, k, O);

        // iii. Call the DefineOwnProperty internal method of A with arguments
        // Pk, Property Descriptor
        // { Value: mappedValue,
        //   Writable: true,
        //   Enumerable: true,
        //   Configurable: true },
        // and false.

        // In browsers that support Object.defineProperty, use the following:
        // Object.defineProperty(A, k, {
        //   value: mappedValue,
        //   writable: true,
        //   enumerable: true,
        //   configurable: true
        // });

        // For best browser support, use the following:
        A[k] = mappedValue;
      }
      // d. Increase k by 1.
      k++;
    }

    // 9. return A
    return A;
  };
}

// Array.filter poliyfill
// Reference: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/filter#polyfill
if (!Array.prototype.filter) {
  Array.prototype.filter = function (func, thisArg) {
    "use strict";
    if (!((typeof func === "Function" || typeof func === "function") && this)) throw new TypeError();

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

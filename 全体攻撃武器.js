/*--------------------------------------------------------------------------
　全体攻撃武器スクリプト ver 1.2

■作成者
キュウブ

■概要
射程範囲内の敵全員と戦闘を行う武器を作成できます
アイテムではなく武器なので全ての敵と戦闘が発生します。

■使い方
1.対象武器のカスパラに
isMultipleWeapon:true
と設定する

2.武器を一方向設定にし、武器耐久は無限にしておく（推奨設定）
3.対象武器には経験値を減少させるスキルを持たせておく（推奨設定）
自軍が使ったときのための「経験値減少スキル」と
敵軍が使ったときのための「敵側経験値補正スキル」どちらもつける事(同リポジトリ内に置いてあります)
https://github.com/QBE256/ExtraPlugin/blob/master/%E8%99%9A%E7%84%A1%E3%81%AE%E5%91%AA%E3%81%84%E3%82%B9%E3%82%AD%E3%83%AB.js

※注意点※
2の設定がなくても全体攻撃自体は可能ですが、
単に範囲内全員と戦闘を行うだけなので反撃で力尽きやすい、武器の消耗が激しく破損しやすい
といった難点があります。
途中で死亡、武器破損した場合はその時点で戦闘は打ち切りとなります。

3の設定も必要はありませんが一度に複数回戦闘を行う都合上、
経験値も手軽に大量に得られるのでゲームバランスに影響が出ると思います。

■更新履歴
ver 1.2 (2022/09/17)
戦闘終了後に動作させるスクリプトがエラーになる可能性がある箇所を修正
※エラーの発生原因を潰したというだけで、正常に動く保証はありません

ver 1.1 (2022/03/21)
連続戦闘時にエラー落ちすることがあるバグを改修
後発スクリプトで応用しやすいように微修正

ver 1.0 (2022/03/13)
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
  var _WeaponAutoAction_setAutoActionInfo =
    WeaponAutoAction.setAutoActionInfo;
  WeaponAutoAction.setAutoActionInfo = function (unit, combination) {
    _WeaponAutoAction_setAutoActionInfo.apply(this, arguments);
    if (combination.item.custom.isMultipleWeapon === true) {
      this._preAttack = createObject(PreMultipleAttack);
    }
  };

  var _WeaponAutoAction__enterAttack = WeaponAutoAction._enterAttack;
  WeaponAutoAction._enterAttack = function () {
    var multipleAttackParam;
    if (this._weapon.custom.isMultipleWeapon === true) {
      multipleAttackParam = this._createMultipleAttackParam();
      return this._preAttack.enterPreAttackCycle(multipleAttackParam);
    } else {
      return _WeaponAutoAction__enterAttack.apply(this, arguments);
    }
  };

  var _UnitCommand_Attack__moveSelection = UnitCommand.Attack._moveSelection;
  UnitCommand.Attack._moveSelection = function () {
    var multipleAttackParam, result;
    var weapon = this._weaponSelectMenu.getSelectWeapon();

    if (weapon.custom.isMultipleWeapon !== true) {
      return _UnitCommand_Attack__moveSelection.apply(this, arguments);
    }
    result = this._posSelector.movePosSelector();
    if (result === PosSelectorResult.SELECT) {
      if (this._isPosSelectable()) {
        this._posSelector.endPosSelector();
        multipleAttackParam = this._createMultipleAttackParam();
        this._preAttack = createObject(PreMultipleAttack);
        result =
          this._preAttack.enterPreAttackCycle(multipleAttackParam);
        if (result === EnterResult.NOTENTER) {
          this.endCommandAction();
          return MoveResult.END;
        }

        this.changeCycleMode(AttackCommandMode.RESULT);
      }
    } else if (result === PosSelectorResult.CANCEL) {
      this._posSelector.endPosSelector();
      this._weaponSelectMenu.setMenuTarget(this.getCommandTarget());
      this.changeCycleMode(AttackCommandMode.TOP);
    }

    return MoveResult.CONTINUE;
  };
})();
WeaponAutoAction._createMultipleAttackParam = function () {
  var attackParam;
  var multipleAttackParam = [];
  var indexArray = AttackChecker.getAttackIndexArray(
    this._unit,
    this._weapon,
    false
  );
  for (var index = 0; index < indexArray.length; index++) {
    attackParam = StructureBuilder.buildAttackParam();
    // ここのattackParam.unitは別ユニットを入れる事で他者との連携攻撃も可
    attackParam.unit = this._unit;
    attackParam.targetUnit = root
      .getCurrentSession()
      .getUnitFromPos(
        CurrentMap.getX(indexArray[index]),
        CurrentMap.getY(indexArray[index])
      );
    attackParam.attackStartType = AttackStartType.NORMAL;
    attackParam.isFirstBattle = index === 0;
    attackParam.isLastBattle = index === indexArray.length - 1;
    attackParam.weapon = ItemControl.getEquippedWeapon(attackParam.unit);
    multipleAttackParam.push(attackParam);
  }

  return multipleAttackParam;
};

UnitCommand.Attack._createMultipleAttackParam = function () {
  var multipleAttackParam = [];
  var attackParam;
  var indexArray = this._posSelector.getIndexArray();
  for (var index = 0; index < indexArray.length; index++) {
    attackParam = StructureBuilder.buildAttackParam();
    // ここのattackParam.unitは別ユニットを入れる事で他者との連携攻撃も可
    attackParam.unit = this.getCommandTarget();
    attackParam.targetUnit = root
      .getCurrentSession()
      .getUnitFromPos(
        CurrentMap.getX(indexArray[index]),
        CurrentMap.getY(indexArray[index])
      );
    attackParam.attackStartType = AttackStartType.NORMAL;
    attackParam.isFirstBattle = index === 0;
    attackParam.isLastBattle = index === indexArray.length;
    attackParam.weapon = ItemControl.getEquippedWeapon(attackParam.unit);
    multipleAttackParam.push(attackParam);
  }

  return multipleAttackParam;
};

var PreMultipleAttack = defineObject(PreAttack, {
  _currentAttackIndex: 0,

  enterPreAttackCycle: function (multipleAttackParam) {
    this._prepareMemberData(multipleAttackParam);
    return this._completeMemberData(multipleAttackParam[0]);
  },

  getAttackParam: function () {
    return this._attackParam;
  },

  isPosMenuDraw: function () {
    return (
      PreAttack.isPosMenuDraw.apply(this, arguments) &&
      this._currentAttackIndex === 0
    );
  },

  _prepareMemberData: function (multipleAttackParam) {
    this._multipleAttackParam = multipleAttackParam;
    this._attackParam = multipleAttackParam[0];
    this._currentAttackIndex = 0;
    this._coreAttack = createObject(CoreContinuousAttack);
    this._startStraightFlow = createObject(StraightFlow);
    this._endStraightFlow = createObject(StraightFlow);

    AttackControl.setPreAttackObject(this);
    BattlerChecker.setUnit(
      this._attackParam.unit,
      this._attackParam.targetUnit
    );
  },

  _moveEnd: function () {
    var currentWeapon, attackParam, count;
    if (this._endStraightFlow.moveStraightFlow() !== MoveResult.CONTINUE) {
      this._doEndAction();
      // お互いが生存してない場合は飛ばす
      this._currentAttackIndex++;
      count = this._multipleAttackParam.length;
      for (var index = this._currentAttackIndex; index < count; index++) {
        attackParam = this._multipleAttackParam[index];
        if (
          attackParam.unit.getAliveState() === AliveType.ALIVE &&
          attackParam.targetUnit.getAliveState() === AliveType.ALIVE
        ) {
          this._currentAttackIndex = index;
          this._attackParam = attackParam;
          // 武器が途中で破損している可能性があるので調べる
          currentWeapon = ItemControl.getEquippedWeapon(
            this._attackParam.unit
          );
          if (
            !currentWeapon ||
            currentWeapon.getId() !==
              this._attackParam.weapon.getId() ||
            currentWeapon.getLimit() === WeaponLimitValue.BROKEN
          ) {
            continue;
          }
          AttackControl.setPreAttackObject(this);
          BattlerChecker.setUnit(
            this._attackParam.unit,
            this._attackParam.targetUnit
          );
          this._doStartAction();
          this.changeCycleMode(PreAttackMode.START);
          return MoveResult.CONTINUE;
        }
      }

      // 一番最後の戦闘が何らかの理由で実施できなかった場合
      // BGMを戦闘曲からマップに戻すべき時は戻す
      if (BattleMusicControl.shouldForceBackMusic()) {
        MediaControl.musicStop(MusicStopType.BACK);
        MediaControl.resetSoundList();
      }
      return MoveResult.END;
    }
    return MoveResult.CONTINUE;
  }
});

var CoreContinuousAttack = defineObject(CoreAttack, {
  _setBattleTypeAndObject: function (attackInfo, attackOrder) {
    CoreAttack._setBattleTypeAndObject.apply(this, arguments);
    if (this._battleType === BattleType.REAL) {
      this._battleObject = createObject(RealContinuousBattle);
    } else {
      this._battleObject = createObject(EasyContinuousBattle);
    }
  },

  isFirstBattle: function () {
    return this._attackParam.isFirstBattle;
  },

  isLastBattle: function () {
    return this._attackParam.isLastBattle;
  }
});

var RealContinuousBattle = defineObject(RealBattle, {
  _isFirstBattle: false,
  _isLastBattle: false,
  _isFirstAttack: true,
  _isMagicContinuousBattler: false,
  _shouldContinueMusic: false,

  _getBattlerObject: function (unit) {
    var attackTemplateType =
      BattlerChecker.findAttackTemplateTypeFromUnit(unit);
    var weapon = ItemControl.getEquippedWeapon(unit);

    // 本当はAttackTemplateType.MAGEと直接比較したいが、
    // バージョンによってAttackTemplateType.MARGEになっている時があるので使用は避ける
    if (
      weapon &&
      weapon.custom.isMultipleWeapon === true &&
      attackTemplateType !== AttackTemplateType.FIGHTER &&
      attackTemplateType !== AttackTemplateType.ARCHER
    ) {
      this._isMagicContinuousBattler = true;
      return MagicContinuousBattler;
    }

    return RealBattle._getBattlerObject.apply(this, arguments);
  },

  _completeBattleMemberData: function (coreAttack) {
    RealBattle._completeBattleMemberData.apply(this, arguments);
    this._isFirstBattle = coreAttack.isFirstBattle();
    this._isLastBattle = coreAttack.isLastBattle();
    this._shouldContinueMusic = BattleMusicControl.isBattleContinueMusic(
      this._battleTable
    );
    if (!this._isFirstBattle && this._isMagicContinuousBattler) {
      this._autoScroll.setScrollX(this.getPassiveBattler().getFocusX());
    }
  },

  _changeBattle: function () {
    var battler = this.getActiveBattler();

    if (this._isFirstBattle && this._isFirstAttack) {
      RealBattle._changeBattle.apply(this, arguments);
      this._isFirstAttack = false;
    } else {
      this.getActiveBattler().startContinuousBattler();
      this._isMotionBaseScroll = true;
    }
  },

  endBattle: function () {
    if (this._isLastBattle) {
      if (!this._shouldContinueMusic) {
        this._battleTable.setMusicPlayFlag(true);
      }
      this._battleTable.endMusic();
    }
    this._uiBattleLayout.endBattleLayout();
    this._parentCoreAttack = null;
  }
});

var EasyContinuousBattle = defineObject(EasyBattle, {
  _isFirstBattle: false,
  _isLastBattle: false,
  _isFirstAttack: true,
  _isMagicContinuousBattler: false,
  _shouldContinueMusic: false,

  _completeBattleMemberData: function (coreAttack) {
    EasyBattle._completeBattleMemberData.apply(this, arguments);
    this._isFirstBattle = coreAttack.isFirstBattle();
    this._isLastBattle = coreAttack.isLastBattle();
    this._shouldContinueMusic = BattleMusicControl.isBattleContinueMusic(
      this._battleTable
    );
  },

  endBattle: function () {
    var rootEffect = root.getScreenEffect();
    rootEffect.resetEffect();
    this._enableDefaultCharChip(false);
    if (this._isLastBattle) {
      if (!this._shouldContinueMusic) {
        this._battleTable.setMusicPlayFlag(true);
      }
      this._battleTable.endMusic();
    }
    this._parentCoreAttack = null;
  }
});

BaseBattler.startContinuousBattler = function () {
  this.startBattler();
};

BaseBattler.setContinuousAttackState = function () {
  this.setAttackState();
};

var MagicContinuousBattler = defineObject(MagicBattler, {
  setContinuousAttackState: function () {
    var count;
    var motionId = this.getAttackMotionId();
    this._motion.setMotionId(motionId);
    this._invocationEffect = null;
    this._magicEffect = null;
    this._loopFrameIndex = 0;
    this._isLast = false;
    count = this._motion.getFrameCount();
    for (var index = 0; index < count; index++) {
      if (this._motion.isLoopStartFrame(motionId, index)) {
        this._loopFrameIndex = index;
        break;
      }
    }
    this._motion.setFrameIndex(this._loopFrameIndex, true);
    this._realBattle
      .getAutoScroll()
      .startScroll(this._realBattle.getPassiveBattler().getKeyX());
    this._realBattle
      .getAutoScroll()
      .skipScroll(this._realBattle.getPassiveBattler().getKeyX());
    this._startMagic();
  },

  checkForceScroll: function (isContinuous) {
    return false;
  },

  startContinuousBattler: function () {
    this.setContinuousAttackState();
  }
});

RealAutoScroll.skipScroll = function (xGoal) {
  this._xScroll = this._xGoal;
};

BattleMusicControl.isBattleContinueMusic = function (battleTable) {
  var handle;
  var handleActive = root.getMediaManager().getActiveMusicHandle();
  var battleObject = battleTable.getBattleObject();
  var attackInfo = battleObject.getAttackInfo();
  var unitSrc = attackInfo.unitSrc;
  var mapInfo = root.getCurrentSession().getCurrentMapInfo();
  if (unitSrc.getUnitType() === UnitType.PLAYER) {
    handle = mapInfo.getPlayerTurnMusicHandle();
  } else if (unitSrc.getUnitType() === UnitType.ALLY) {
    handle = mapInfo.getAllyTurnMusicHandle();
  } else {
    handle = mapInfo.getEnemyTurnMusicHandle();
  }
  return handle.isEqualHandle(handleActive);
};

BattleMusicControl.shouldForceBackMusic = function () {
  var handle;
  var handleActive = root.getMediaManager().getActiveMusicHandle();
  var mapInfo = root.getCurrentSession().getCurrentMapInfo();
  var turnType = root.getCurrentSession().getTurnType();
  if (turnType === UnitType.PLAYER) {
    handle = mapInfo.getPlayerTurnMusicHandle();
  } else if (turnType === UnitType.ALLY) {
    handle = mapInfo.getAllyTurnMusicHandle();
  } else {
    handle = mapInfo.getEnemyTurnMusicHandle();
  }
  return !handle.isEqualHandle(handleActive);
};

/*--------------------------------------------------------------------------
　倒れると発動する支援スキル ver 1.0

■作成者
キュウブ

■概要
死亡状態になると発動する支援スキルを設定できるようになります。
※プレイヤーユニットの場合は負傷状態でも発動します。死亡状態の場合は永続的に発動する事になります。
※rival_supportスクリプトも併用される場合は、該当スクリプトをver1.7以上に更新してください

■使い方
支援スキルのカスパラに
isDeadSupport: true
と設定すればOK

■仕様
射程設定は反映されません。全体に適用されます。

■更新履歴
ver 1.0 2023/07/07
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
  var _SupportCalculator_createTotalStatus =
    SupportCalculator.createTotalStatus;
  SupportCalculator.createTotalStatus = function (unit) {
    var totalStatus = _SupportCalculator_createTotalStatus.apply(
      this,
      arguments
    );
    if (this._isStatusDisabled()) {
      return totalStatus;
    }
    var unitType = unit.getUnitType();
    var playerList = PlayerList.getDownList();
    var enemyList = EnemyList.getDeathList();
    var allyList = AllyList.getDeathList();
    if (unitType === UnitType.PLAYER) {
      this._collectDeadSupportSkillStatus(unit, playerList, false, totalStatus);
      this._collectDeadSupportSkillStatus(unit, enemyList, true, totalStatus);
    } else if (unitType === UnitType.ENEMY) {
      this._collectDeadSupportSkillStatus(unit, playerList, true, totalStatus);
      this._collectDeadSupportSkillStatus(unit, enemyList, false, totalStatus);
      this._collectDeadSupportSkillStatus(unit, allyList, true, totalStatus);
    } else {
      this._collectDeadSupportSkillStatus(unit, enemyList, true, totalStatus);
      this._collectDeadSupportSkillStatus(unit, allyList, false, totalStatus);
    }

    return totalStatus;
  };

  SupportCalculator._collectDeadSupportSkillStatus = function (
    unit,
    list,
    isRival,
    totalStatus
  ) {
    var targetUnit;
    var count = list.getCount();
    for (var i = 0; i < count; i++) {
      targetUnit = list.getData(i);
      if (unit === targetUnit) {
        continue;
      }

      this._checkDeadSupportSkillStatus(targetUnit, unit, isRival, totalStatus);
    }
  };

  SupportCalculator._checkDeadSupportSkillStatus = function (
    unit,
    targetUnit,
    isRival,
    totalStatus
  ) {
    var skills = SkillControl.getDirectSkillArray(unit, SkillType.SUPPORT, "");
    root.log(skills.length);
    for (var i = 0; i < skills.length; i++) {
      var skill = skills[i].skill;
      var isTargetUnitType =
        (isRival && !!skill.custom.rival_support) ||
        (!isRival && !skill.custom.rival_support);
      root.log(skill.getName());
      root.log(isTargetUnitType);
      root.log(this._isDeadSupportable(unit, targetUnit, skill));
      if (
        isTargetUnitType &&
        this._isDeadSupportable(unit, targetUnit, skill)
      ) {
        this._addStatus(totalStatus, skill.getSupportStatus());
      }
    }
  };

  // 通常の支援で発動条件を満たさないように、isSupportableとは別で関数を設ける
  var _SupportCalculator__isSupportable = SupportCalculator._isSupportable;
  SupportCalculator._isSupportable = function (unit, targetUnit, skill) {
    return (
      !skill.custom.isDeadSupport &&
      _SupportCalculator__isSupportable.apply(this, arguments)
    );
  };

  SupportCalculator._isDeadSupportable = function (unit, targetUnit, skill) {
    return (
      !!skill.custom.isDeadSupport &&
      _SupportCalculator__isSupportable.apply(this, arguments)
    );
  };

  PlayerList.getDownList = function () {
    var list = this.getMainList();
    var funcCondition = function (unit) {
      var aliveState = unit.getAliveState();
      return aliveState === AliveType.DEATH || aliveState === AliveType.INJURY;
    };

    return AllUnitList.getList(list, funcCondition);
  };
})();

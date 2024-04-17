/*--------------------------------------------------------------------------
　スキル:リバイバル(復活) ver 1.2

■作成者
キュウブ

■概要
このスキルを持っている場合、HPが0になってもその場で復活するようになります。

■設定方法
1.カスタムキーワード:Revival のスキルを設定する
2.簡易アニメに発動時に流れるエフェクトを設定する

3.カスタムパラメータに使用回数上限を設定する
maxActivateCount:<回数>
で設定可能

4.もし、自軍ユニットにこのスキルを持たせて毎章使用回数をリセットさせたい場合は、
毎章、マップ共通イベントでスクリプト実行->コード実行でRevivalEventControl.resetActivateCount()を実行させてください。
全ての自軍ユニットにおいてこのスキルの使用回数がリセットされます。

※注意1
maxActivateCountは必ず設定してもらう必要があります。
よって、使用回数を無限にはできません。

※注意2
発動率などの細かい条件をつける事はできません。
スキルを所持している限り、必ず発動します。

■更新履歴
ver 1.2 (2024/04/18)
スリップダメージで死亡した場合に、スキル発動タイミングがズレたり台詞が表示されなくなるバグを修正

ver 1.1 (2022/01/13)
ユニットのHPが0でなくても発動してしまうバグを修正

ver 1.0 (2021/04/19)
初版公開

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
var RevivalEventControl = {
  _revivalUnit: null,
  _activateSkill: null,

  setRevivalUnit: function (unit) {
    var skill = SkillControl.getPossessionCustomSkill(unit, "Revival");
    if (!skill) {
      return;
    }
    if (typeof unit.custom.revivalSkillActivateCount !== "number") {
      unit.custom.revivalSkillActivateCount = 0;
    }
    if (unit.custom.revivalSkillActivateCount >= skill.custom.maxActivateCount) {
      return;
    }
    unit.custom.revivalSkillActivateCount++;
    this._activateSkill = skill;
    this._revivalUnit = unit;
  },

  getRevivalUnit: function () {
    return this._revivalUnit;
  },

  resetRevivalSetting: function () {
    this._revivalUnit = null;
    this._activateSkill = null;
  },

  getActivateSkill: function () {
    return this._activateSkill;
  },

  resetActivateCount: function () {
    var unit;
    var unitList = PlayerList.getAliveDefaultList();
    var unitListCount = unitList.getCount();

    for (var index = 0; index < unitListCount; index++) {
      unit = unitList.getData(index);
      if (unit) {
        unit.custom.revivalSkillActivateCount = 0;
      }
    }
  }
};

(function () {
  var _UnitDeathFlowEntry__completeMemberData = UnitDeathFlowEntry._completeMemberData;
  UnitDeathFlowEntry._completeMemberData = function (coreAttack) {
    // ユニットが死亡していないなどの場合、本処理は行わず
    // 元のUnitDeathFlowEntry._completeMemberDataに移行
    if (!coreAttack.getAttackFlow().isBattleUnitLosted()) {
      return _UnitDeathFlowEntry__completeMemberData.call(this, coreAttack);
    }
    if (DamageControl.isSyncope(this._passiveUnit)) {
      return _UnitDeathFlowEntry__completeMemberData.call(this, coreAttack);
    }

    RevivalEventControl.setRevivalUnit(this._passiveUnit);
    if (RevivalEventControl.getRevivalUnit()) {
      // リーダーユニットが倒れた場合ゲームオーバーになってしまうのを阻止するため、この時点で復活させる
      this._passiveUnit.setAliveState(AliveType.ALIVE);
      return EnterResult.NOTENTER;
    }
    return _UnitDeathFlowEntry__completeMemberData.call(this, coreAttack);
  };

  var _LoserMessageFlowEntry__completeMemberData = LoserMessageFlowEntry._completeMemberData;
  LoserMessageFlowEntry._completeMemberData = function (preAttack) {
    // ユニットが死亡していない場合、本処理は行わず
    // 元のLoserMessageFlowEntry._completeMemberDataに移行
    if (preAttack.getPassiveUnit().getHp() !== 0) {
      return _LoserMessageFlowEntry__completeMemberData.call(this, preAttack);
    }
    // UnitDeathFlowEntryで既に蘇生ユニットが設定されている可能性があるので確認
    if (RevivalEventControl.getRevivalUnit()) {
      return _LoserMessageFlowEntry__completeMemberData.call(this, preAttack);
    }
    // UnitDeathFlowEntryをスキップしている可能性があるので、ここでもう一度蘇生ユニットを設定
    RevivalEventControl.setRevivalUnit(preAttack.getPassiveUnit());
    if (RevivalEventControl.getRevivalUnit()) {
      // リーダーユニットが倒れた場合ゲームオーバーになってしまうのを阻止するため、この時点で復活させる
      preAttack.getPassiveUnit().setAliveState(AliveType.ALIVE);
      return EnterResult.NOTENTER;
    }
    return _LoserMessageFlowEntry__completeMemberData.call(this, preAttack);
  };

  var _MapSequenceCommand__pushFlowEntries = MapSequenceCommand._pushFlowEntries;
  MapSequenceCommand._pushFlowEntries = function (straightFlow) {
    straightFlow.pushFlowEntry(RevivalFlowEntry);
    _MapSequenceCommand__pushFlowEntries.call(this, straightFlow);
  };

  var _WaitAutoAction__pushFlowEntries = WaitAutoAction._pushFlowEntries;
  WaitAutoAction._pushFlowEntries = function (straightFlow) {
    straightFlow.pushFlowEntry(RevivalFlowEntry);
    _WaitAutoAction__pushFlowEntries.call(this, straightFlow);
  };

  var RevivalFlowMode = {
    SHOW_SKILL_NAME: 0,
    REVIVAL: 1
  };

  var RevivalFlowEntry = defineObject(BaseFlowEntry, {
    _revivalUnits: null,
    _activateSkill: null,
    _playerTurn: null,
    _dynamicEvent: null,
    _showSkillNameCounter: null,

    enterFlowEntry: function (playerTurn) {
      this._prepareMemberData(playerTurn);
      return this._completeMemberData(playerTurn);
    },

    moveFlowEntry: function () {
      var mode = this.getCycleMode();
      var result = MoveResult.END;

      if (mode === RevivalFlowMode.SHOW_SKILL_NAME) {
        result = this._moveShowSkillName();
      } else if (mode === RevivalFlowMode.REVIVAL) {
        result = this._moveRevival();
      }
      return result;
    },

    drawFlowEntry: function () {
      var mode = this.getCycleMode();

      if (mode === RevivalFlowMode.SHOW_SKILL_NAME) {
        result = this._drawShowSkillName();
      }
    },

    _moveShowSkillName: function () {
      var generator;

      if (this._showSkillNameCounter.moveCycleCounter() !== MoveResult.CONTINUE) {
        this._revivalUnit.setInvisible(false);
        generator = this._dynamicEvent.acquireEventGenerator();
        generator.hpRecovery(this._revivalUnit, this._activateSkill.getEasyAnime(), 0, RecoveryType.MAX, false);
        this._dynamicEvent.executeDynamicEvent();
        this.changeCycleMode(RevivalFlowMode.REVIVAL);
      }
      return MoveResult.CONTINUE;
    },

    _drawShowSkillName: function () {
      var x, y;
      var textui = root.queryTextUI("itemuse_title");
      var color = textui.getColor();
      var font = textui.getFont();
      var pic = textui.getUIImage();
      var text = this._activateSkill.getName();
      var width = (TitleRenderer.getTitlePartsCount(text, font) + 2) * TitleRenderer.getTitlePartsWidth();

      x = LayoutControl.getUnitCenterX(this._revivalUnit, width, 0);
      y = LayoutControl.getUnitBaseY(this._revivalUnit, TitleRenderer.getTitlePartsHeight()) - 20;

      TextRenderer.drawTitleText(x, y, text, color, font, TextFormat.CENTER, pic);
    },

    _moveRevival: function () {
      if (this._dynamicEvent.moveDynamicEvent() !== MoveResult.CONTINUE) {
        return MoveResult.END;
      }
      return MoveResult.CONTINUE;
    },

    _drawAnime: function () {
      this._dynamicEvent.drawDynamicAnime();
    },

    _prepareMemberData: function (playerTurn) {
      this._playerTurn = playerTurn;
      this._revivalUnit = RevivalEventControl.getRevivalUnit();
      this._activateSkill = RevivalEventControl.getActivateSkill();
      this._dynamicEvent = createObject(DynamicEvent);
      this._showSkillNameCounter = createObject(CycleCounter);
    },

    _completeMemberData: function (playerTurn) {
      var generator, anime, posAnime;

      if (!this._revivalUnit || !this._activateSkill) {
        RevivalEventControl.resetRevivalSetting();
        return EnterResult.NOTENTER;
      }
      this._showSkillNameCounter.setCounterInfo(36);
      generator = root.getEventGenerator();
      generator.locationFocus(this._revivalUnit.getMapX(), this._revivalUnit.getMapY(), true);
      generator.execute();
      this.changeCycleMode(RevivalFlowMode.SHOW_SKILL_NAME);
      MediaControl.soundDirect("skillinvocation");
      RevivalEventControl.resetRevivalSetting();
      return EnterResult.OK;
    }
  });

  var _DamageHitFlow__pushFlowEntries = DamageHitFlow._pushFlowEntries;
  DamageHitFlow._pushFlowEntries = function (straightFlow) {
    _DamageHitFlow__pushFlowEntries.call(this, straightFlow);
    straightFlow.pushFlowEntry(RevivalFlowEntry);
  };
})();

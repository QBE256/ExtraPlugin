var RealWandTable = defineObject(RealBattleTable, {
  _pushFlowEntriesBattleStart: function (straightFlow) {
    straightFlow.pushFlowEntry(WandTransitionStartFlowEntry);
    straightFlow.pushFlowEntry(WatchLoopFlowEntry);
    straightFlow.pushFlowEntry(RealStartFlowEntry);
  },

  _pushFlowEntriesActionStart: function (straightFlow) {
    straightFlow.pushFlowEntry(RealUnitCutinFlowEntry);
  }
});

var WandTransitionStartFlowEntry = defineObject(TransitionStartFlowEntry, {
  _checkMusic: function () {
    var isMusicPlay;

    if (this._battleTable.getStartBattleTransition().isSecondHalf()) {
      if (!this._battleTable.isBattleStart()) {
        isMusicPlay = BattleMusicControl.playWandBattleMusic(this._battleTable, true);
        this._battleTable.setMusicPlayFlag(isMusicPlay);
        this._battleTable.setBattleStartFlag(true);
      }
    }
  }
});

BattleMusicControl.playWandBattleMusic = function (battleTable, isForce) {
  var handleActive;
  var data = this._getWandBattleMusicData(battleTable);
  var handle = data.handle;
  var isMusicPlay = false;

  if (handle.isNullHandle()) {
    isMusicPlay = false;
  } else {
    handleActive = root.getMediaManager().getActiveMusicHandle();
    if (handle.isEqualHandle(handleActive)) {
      isMusicPlay = false;
    } else {
      if (data.isNew) {
        MediaControl.resetMusicList();
        MediaControl.musicPlayNew(handle);
        this._arrangeMapMusic(handle);
      } else if (isForce) {
        MediaControl.musicPlay(handle);
        isMusicPlay = true;
      }
    }
  }

  return isMusicPlay;
};

BattleMusicControl._getWandBattleMusicData = function (battleTable) {
  var handle, isNew;
  var battleObject = battleTable.getBattleObject();
  var attackInfo = battleObject.getAttackInfo();
  var unitSrc = attackInfo.unitSrc;
  var unitDest = attackInfo.unitDest;
  var handleUnitSrc = unitSrc.getBattleMusicHandle();
  var handleUnitDest = unitDest.getBattleMusicHandle();
  var mapInfo = root.getCurrentSession().getCurrentMapInfo();
  var isReverseUnitType = FilterControl.isReverseUnitTypeAllowed(unitSrc, unitDest);
  var isValidWandMusic = WandMusicValidatiors.isValid(mapInfo, isReverseUnitType);

  if (!handleUnitSrc.isNullHandle()) {
    handle = handleUnitSrc;
    isNew = unitSrc.isBattleMusicContinue();
  } else if (!handleUnitDest.isNullHandle()) {
    handle = handleUnitDest;
    isNew = unitDest.isBattleMusicContinue();
  } else if (isValidWandMusic) {
    var property = isReverseUnitType ? "rival" : "support";
    handle = root.createResourceHandle(
      mapInfo.custom.wand_music[property].runtime,
      mapInfo.custom.wand_music[property].id,
      0,
      0,
      0
    );
    isNew = false;
  } else if (unitSrc.getUnitType() === UnitType.PLAYER) {
    handle = mapInfo.getPlayerBattleMusicHandle();
    isNew = false;
  } else if (unitSrc.getUnitType() === UnitType.ALLY) {
    handle = mapInfo.getAllyBattleMusicHandle();
    isNew = false;
  } else {
    handle = mapInfo.getEnemyBattleMusicHandle();
    isNew = false;
  }

  return {
    handle: handle,
    isNew: isNew
  };
};

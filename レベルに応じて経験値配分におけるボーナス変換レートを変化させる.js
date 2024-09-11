/*--------------------------------------------------------------------------
　レベルに応じて経験値配分におけるボーナス変換レートを変化させる ver 1.0

■作成者
キュウブ

■概要
経験値配分において、レベルが高い程ボーナスを多く消費するような設定が可能になります。


■使い方
1.本プラグイン41行目のBASE_LV_CORRECTIONにレベル毎のボーナス増加量を設定する
var BASE_LV_CORRECTION = 2;
と設定し、
コンフィグでの経験値配分レートを10とした場合、
LV1の時は経験値を1得るためにボーナスを10(コンフィグ設定と同じ),
LV2の時は経験値を1得るためにボーナスを12(2×1増加),
LV3の時は経験値を1得るためにボーナスを14(2×2増加),
...
LV20の時は経験値を1得るためにボーナスを48消費(2×19増加)するようになる

2.クラスチェンジでLV1に戻る場合は、本プラグイン45行目のHIGH_CLASS_CORRECTIONにレベル補正値を設定する
例えば、
var HIGH_CLASS_CORRECTION = 20;
と設定すると、上級職LV1はLV21という扱いでレート計算が行われるようになる。
※クラスチェンジ時にLVが戻らない場合は0にしておくこと。

■更新履歴
ver 1.0 2024/09/12
公開

■対応バージョン
SRPG Studio Version:1.301

(C)2024 キュウブ
Released under the MIT license
https://opensource.org/licenses/mit-license.php

--------------------------------------------------------------------------*/
// ボーナス->経験値配分レートにおけるレベル毎のボーナス増加量
var BASE_LV_CORRECTION = 2;

// 上級職時のレベル補正値。例えば、ここの値を20にしておくと上級職LV1の時にLV21として計算されるようになる。
// 上級職時にレベルが1に戻る場合は設定推奨。
var HIGH_CLASS_CORRECTION = 0;

(function () {
  BonusInputWindow._currentBonusInput = null;
  BonusInputWindow._edgeCursor = null;
  var _BonusInputWindow_initialize = BonusInputWindow.initialize;
  BonusInputWindow.initialize = function () {
    _BonusInputWindow_initialize.apply(this, arguments);
    this._edgeCursor = createObject(EdgeCursor);
    this._edgeCursor.setEdgeRange(30, 30);
  };

  BonusInputWindow._getCurrentLvCorrection = function () {
    var currentLvCorrection = this._unit.getLv() - 1;

    if (this._unit.getClass().getClassRank() === ClassRank.HIGH) {
      currentLvCorrection += HIGH_CLASS_LV_CORRECTION;
    }
    return currentLvCorrection;
  };

  var _BonusInputWindow__getRate = BonusInputWindow._getRate;
  BonusInputWindow._getRate = function () {
    var currentLvCorrection = this._getCurrentLvCorrection();
    var baseRate = _BonusInputWindow__getRate.apply(this, arguments);
    return baseRate + currentLvCorrection * BASE_LV_CORRECTION;
  };

  BonusInputWindow._calculateMax = function (bonus, currentRate, currentExp) {
    var requiredLvUpExp = 100 - currentExp;
    var restBonus = bonus - requiredLvUpExp * currentRate;
    if (restBonus > 0) {
      var nextRate = currentRate + BASE_LV_CORRECTION;
      return this._calculateMax(restBonus, nextRate, 0) + requiredLvUpExp;
    } else {
      return Math.floor(bonus / currentRate);
    }
  };

  BonusInputWindow._setCurrentBonusInput = function () {
    var currentExp = this._unit.getExp();
    var currentLv = this._unit.getLv();
    var isLevelUp = this._exp + currentExp >= 100;
    var afterLv = isLevelUp ? currentLv + 1 : currentLv;
    var afterExp = isLevelUp ? this._exp + currentExp - 100 : this._exp + currentExp;
    var currentRate = isLevelUp ? this._getRate() + BASE_LV_CORRECTION : this._getRate();
    var requiredBonus = this._calculateRequiredBonus(this._exp, this._getRate(), currentExp);
    this._currentBonusInput = {
      currentRate: currentRate,
      requiredBonus: requiredBonus,
      currentExp: currentExp,
      currentLv: currentLv,
      afterExp: afterExp,
      afterLv: afterLv,
      isLevelUp: isLevelUp
    };
  };

  BonusInputWindow.setUnit = function (unit) {
    this._unit = unit;
    this._isMaxLv = this._unit.getLv() === Miscellaneous.getMaxLv(unit);
    var bonus = root.getMetaSession().getBonus();
    if (this._isExperienceValueAvailable()) {
      this._exp = 1;
      this._setCurrentBonusInput();
      this._max = this._calculateMax(bonus, this._currentBonusInput.currentRate, this._currentBonusInput.currentExp);
      if (this._max > DefineControl.getBaselineExperience()) {
        this._max = DefineControl.getBaselineExperience();
      }
      this.changeCycleMode(BonusInputWindowMode.INPUT);
    } else {
      this._exp = -1;
      this.changeCycleMode(BonusInputWindowMode.NONE);
    }
  };

  BonusInputWindow._calculateRequiredBonus = function (restExp, currentRate, currentExp) {
    var requiredLvUpExp = 100 - currentExp;
    root.log(restExp + "a" + requiredLvUpExp + "b" + currentRate);
    if (restExp > requiredLvUpExp) {
      var nextRate = currentRate + BASE_LV_CORRECTION;
      return this._calculateRequiredBonus(restExp - requiredLvUpExp, nextRate, 0) + currentRate * requiredLvUpExp;
    } else {
      return restExp * currentRate;
    }
  };

  BonusInputWindow._changeBonus = function () {
    var bonus = root.getMetaSession().getBonus();
    root.getMetaSession().setBonus(bonus - this._currentBonusInput.requiredBonus);
  };

  var _BonusInputWindow__moveInput = BonusInputWindow._moveInput;
  BonusInputWindow._moveInput = function () {
    var result = _BonusInputWindow__moveInput.apply(this, arguments);
    this._edgeCursor.moveCursor();
    if (result === MoveResult.CONTINUE) {
      this._setCurrentBonusInput();
    }
    return result;
  };

  BonusInputWindow._drawInput = function (x, y) {
    var descriptionPic = this.getDescriptionTextUI().getUIImage();
    var levelUpPic = root.queryUI("parameter_risecursor");
    var mainWindowTextFont = this.getWindowTextUI().getFont();
    var subWindowTextFont = this.getSubWindowTextUI().getFont();

    TitleRenderer.drawTitle(
      descriptionPic,
      x - 12,
      y - 24,
      TitleRenderer.getTitlePartsWidth(),
      TitleRenderer.getTitlePartsHeight(),
      8
    );
    var bonus = root.getMetaSession().getBonus();
    TextRenderer.drawText(x + 4, y, "残りボーナス", -1, ColorValue.KEYWORD, mainWindowTextFont);
    NumberRenderer.drawNumber(x + 154, y - 6, bonus - this._currentBonusInput.requiredBonus);
    TextRenderer.drawText(x + 178, y, "レート", -1, ColorValue.KEYWORD, mainWindowTextFont);
    NumberRenderer.drawNumber(x + 260, y - 6, this._currentBonusInput.currentRate);

    TextRenderer.drawText(x + 12, y + 55, "+", -1, ColorValue.DEFAULT, subWindowTextFont);
    NumberRenderer.drawAttackNumber(x + 50, y + 51, this._exp);

    TextRenderer.drawText(x + 150, y + 55, "Lv", -1, ColorValue.INFO, mainWindowTextFont);
    NumberRenderer.drawNumber(x + 190, y + 49, this._currentBonusInput.afterLv);
    if (levelUpPic !== null && this._currentBonusInput.isLevelUp) {
      var cursorIndex = this._edgeCursor._scrollCursorIndex;
      levelUpPic.drawParts(
        x + 190,
        y + 46,
        (UIFormat.RISECURSOR_WIDTH / 2) * cursorIndex,
        0,
        UIFormat.RISECURSOR_WIDTH / 2,
        UIFormat.RISECURSOR_HEIGHT / 2
      );
    }
    TextRenderer.drawText(x + 220, y + 55, "Ex", -1, ColorValue.INFO, mainWindowTextFont);
    NumberRenderer.drawNumber(x + 260, y + 49, this._currentBonusInput.afterExp);

    this._edgeCursor.drawVertCursor(x + 40, y + 50, true, false);
    this._edgeCursor._scrollCursorIndex = this._edgeCursor._scrollCursorIndex === 0 ? 1 : 0;
    this._edgeCursor.drawVertCursor(x + 40, y + 50, false, true);
    this._edgeCursor._scrollCursorIndex = this._edgeCursor._scrollCursorIndex === 0 ? 1 : 0;
  };

  var _BonusInputWindow__drawWindowInternal = BonusInputWindow._drawWindowInternal;
  BonusInputWindow._drawWindowInternal = function (x, y, width, height) {
    _BonusInputWindow__drawWindowInternal.apply(this, arguments);
    if (this.getCycleMode() !== BonusInputWindowMode.INPUT) {
      return;
    }
    var pic = null;
    var textui = this.getWindowTextUI();

    if (textui !== null) {
      pic = textui.getUIImage();
    }

    if (pic !== null) {
      WindowRenderer.drawStretchWindow(x + 12, y + 60, this.getSubWindowWidth(), this.getSubWindowHeight(), pic);
    }
  };

  BonusInputWindow.getWindowTextUI = function () {
    return root.queryTextUI("default_window");
  };

  BonusInputWindow.getSubWindowTextUI = function () {
    return root.queryTextUI("extraname_title");
  };

  BonusInputWindow.getWindowWidth = function () {
    return this.getCycleMode() === BonusInputWindowMode.INPUT ? 308 : 260;
  };

  BonusInputWindow.getSubWindowWidth = function () {
    return 120;
  };

  BonusInputWindow.getWindowHeight = function () {
    return 120;
  };

  BonusInputWindow.getSubWindowHeight = function () {
    return 40;
  };

  BonusInputWindow.getDescriptionTextUI = function () {
    return root.queryTextUI("description_title");
  };
})();

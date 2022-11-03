/*--------------------------------------------------------------------------
　自傷ダメージスキル、反射ダメージスキル ver 1.1

■作成者
キュウブ

■概要
攻撃時に攻撃側にダメージを与えるスキルを設定できます。
※ただしHP1未満にはなりません

■使い方
1.自傷ダメージスキル
カスタムキーワードに"recoil"を設定する
これで与えたダメージが自分にも跳ね返ってくるようになります。

2.反射ダメージスキル
2.1.カスタムキーワードに"reflect"を設定する
2.2カスタムパラメータに下記のように反射率(例:50%なら50と記入)を設定する
reflectRate:<反射率>
2.3.有効相手を設定する

■更新履歴
ver 1.1 (2022/11/03)
有効相手が正常に反映されないバグを修正

ver 1.0 (2022/11/03)
公開 

■対応バージョン
SRPG Studio Version:1.161

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。
・クレジット明記無し　OK (明記する場合は"キュウブ"でお願いします)
・SRPG Studio利用規約は遵守してください。

--------------------------------------------------------------------------*/

(function () {
  var tempFunctions = {
    AttackEvaluator: {
      ActiveAction: {
        _arrangeActiveDamage: AttackEvaluator.ActiveAction._arrangeActiveDamage
      }
    },
    UIBattleLayout: {
      setDamage: UIBattleLayout.setDamage
    },
    SkillRandomizer: {
      isCustomSkillInvokedInternal: SkillRandomizer.isCustomSkillInvokedInternal
    }
  };

  AttackEvaluator.ActiveAction._arrangeActiveDamage = function (
    virtualActive,
    virtualPassive,
    attackEntry
  ) {
    var max, tempDamage;
    var active = virtualActive.unitSelf;
    var damageActive = 0;
    var damagePassive = attackEntry.damagePassive;
    var recoilSkill = this._isRecoil(
      virtualActive,
      virtualPassive,
      attackEntry
    );
    var reflectSkill = this._isReflect(
      virtualActive,
      virtualPassive,
      attackEntry
    );

    if (recoilSkill) {
      damageActive += damagePassive;
    }

    if (reflectSkill) {
      if (typeof reflectSkill.custom.reflectRate === "number") {
        damageActive += Math.ceil(
          (damagePassive * reflectSkill.custom.reflectRate) / 100
        );
      }
    }

    if (virtualActive.hp - damageActive <= 0) {
      damageActive = virtualActive.hp - 1;
    }

    virtualActive.hp -= damageActive;
    tempDamage =
      tempFunctions.AttackEvaluator.ActiveAction._arrangeActiveDamage.apply(
        this,
        arguments
      );
    virtualActive.hp += damageActive;
    damageActive += tempDamage;

    return damageActive;
  };

  SkillRandomizer.isCustomSkillInvokedInternal = function (
    active,
    passive,
    skill,
    keyword
  ) {
    if (keyword === "recoil") {
      return this._isSkillInvokedInternal(active, passive, skill);
    } else if (keyword === "reflect") {
      return this._isSkillInvokedInternal(active, passive, skill);
    }

    return tempFunctions.SkillRandomizer.isCustomSkillInvokedInternal.apply(
      this,
      arguments
    );
  };

  UIBattleLayout.setDamage = function (battler, damage, isCritical, isFinish) {
    var gauge;

    if (battler === this._realBattle.getActiveBattler() && damage > 0) {
      if (battler === this._battlerRight) {
        gauge = this._gaugeRight;
      } else {
        gauge = this._gaugeLeft;
      }

      gauge.startMove(damage * -1);
      this._showReflectAnime(battler, isCritical, isFinish);
    } else {
      tempFunctions.UIBattleLayout.setDamage.apply(this, arguments);
    }
  };
})();

UIBattleLayout._showReflectAnime = function (battler, isCritical, isFinish) {
  var anime = root.queryAnime("realdamage");
  var pos = battler.getEffectPos(anime);
  var isRight = battler === this._realBattle.getBattler(true);

  this._realBattle.createEffect(anime, pos.x, pos.y, isRight, false);
};

AttackEvaluator.ActiveAction._isRecoil = function (
  virtualActive,
  virtualPassive,
  attackEntry
) {
  return SkillControl.checkAndPushCustomSkill(
    virtualActive.unitSelf,
    virtualPassive.unitSelf,
    attackEntry,
    true,
    "recoil"
  );
};

AttackEvaluator.ActiveAction._isReflect = function (
  virtualActive,
  virtualPassive,
  attackEntry
) {
  return SkillControl.checkAndPushCustomSkill(
    virtualPassive.unitSelf,
    virtualActive.unitSelf,
    attackEntry,
    false,
    "reflect"
  );
};

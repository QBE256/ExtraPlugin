/*--------------------------------------------------------------------------
3回目以降のモーションを追加する ver 1.0

■作成者
キュウブ

■概要
SRPGStudioは直接攻撃1,直接攻撃2というように、1種類の行動に2回分のモーションを設定する事ができます。
このスクリプトを導入すると3回目以降のモーションも設定する事が可能となります。
※ ver1.0時点では近接タイプの直接攻撃、クリティカル直接攻撃のみ対応しています。

■使い方
3回目以降のモーションを作成した後、対象アニメの詳細情報->カスパラに以下のような設定を付与すればOK
※武器固有の3回目以降のモーションを設定したい場合は対象武器のカスパラに設定する事
{
  aditionCountMotions: {
    normalDirectAttacks: <3回目以降の直接攻撃モーションのIDの配列>,
    criticalDirectAttacks: <3回目以降のクリティカル直接攻撃モーションのIDの配列>
  }
}

例1.
下記のような設定を行うと、
直接攻撃の3回目が102番、4回目が103番、5回目が104番のモーションになる。6回目は1回目の攻撃モーションに戻る。
クリティカル直接攻撃については設定がされてないので通常通りの挙動になる。
{
  aditionCountMotions: {
    normalDirectAttacks: [102, 103, 104]
  }
}

例2.
下記のような設定を行うと、
直接攻撃の3回目が102番のモーションになる。4回目は1回目の攻撃モーションに戻る。
クリティカル直接攻撃の3回目が103番、4回目が104番のモーションになる。5回目は1回目の攻撃モーションに戻る。
{
  aditionCountMotions: {
    normalDirectAttacks: [102],
    criticalDirectAttacks: [103, 104]
  }
}

■更新履歴
ver1.0 2023/11/04
初版

■対応バージョン
SRPG Studio Version:1.287

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。
・クレジット明記無しOK (明記する場合は"キュウブ"でお願いします)
・バグなどがあったらプルリクお願いします
・SRPG Studio利用規約は遵守してください。

--------------------------------------------------------------------------*/

(function () {
  var _MotionIdControl__getDirectAttackIdIdInternal = MotionIdControl._getDirectAttackIdIdInternal;
  MotionIdControl._getDirectAttackIdIdInternal = function (collection, midData) {
    var additionCountMotions = null;
    var anime = midData.cls.getClassAnime(midData.attackTemplateType);
    if (!!midData.weapon && typeof midData.weapon.custom.aditionCountMotions === "object") {
      additionCountMotions = midData.weapon.custom.aditionCountMotions;
    } else if (typeof anime.custom.aditionCountMotions === "object") {
      additionCountMotions = anime.custom.aditionCountMotions;
    }
    _MotionIdControl__getDirectAttackIdIdInternal.apply(this, arguments);
    if (!additionCountMotions) {
      return;
    }
    var targetMotions;
    if (
      midData.isCritical &&
      midData.type !== MotionFighter.CRITICALFINISHATTACK &&
      additionCountMotions.hasOwnProperty("criticalDirectAttacks")
    ) {
      targetMotions = additionCountMotions.criticalDirectAttacks;
    } else if (!midData.isCritical && additionCountMotions.hasOwnProperty("normalDirectAttacks")) {
      targetMotions = additionCountMotions.normalDirectAttacks;
    } else {
      return;
    }
    var totalAttackMotionCounts = targetMotions.length + 2;
    var currentCount = midData.count % totalAttackMotionCounts;
    if (currentCount < 2) {
      return;
    }
    midData.id = targetMotions[currentCount - 2];
  };
})();

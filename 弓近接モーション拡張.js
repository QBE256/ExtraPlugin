/*--------------------------------------------------------------------------
弓接近攻撃モーション追加 ver 2.0

■作成者
キュウブ

■概要
接近時に別の弓攻撃モーションを指定できます

■使い方
接近攻撃用のモーションを作った後は
詳細情報->カスパラから
{
  directBowAttacks: [
    {
      motionId: <接近時の通常攻撃用のモーションID>,
      attackType: MotionArcher.BOW
	  },
    {
      motionId: <接近時の通常攻撃用の2撃目のモーションID>,
      attackType: MotionArcher.BOW2
    },
    {
      motionId: <接近時のクリティカル攻撃用のモーションID>,
      attackType: MotionArcher.CRITICALBOW
    },
    {
      motionId: <接近時のとどめのクリティカル攻撃用のモーションID>,
      attackType: MotionArcher.CRITICALFINISH
    }
  ]
}

と設定する。
クリティカル用のモーションを用意していない場合は
全ての要素に通常攻撃用のモーションIDを指定しておけばOK

例.モーションID:100を接近通常攻撃(1,2回目共に同じモーション)、モーションID:101を接近クリティカル(とどめとクリティカル共に同じモーション)としたい時
directBowAttacks: [
  {
    motionId: 100,
    attackType: MotionArcher.BOW
  },
  {
    motionId: 100,
    attackType: MotionArcher.BOW2
  },
  {
    motionId: 101,
    attackType: MotionArcher.CRITICALBOW
  },
  {
    motionId: 101,
    attackType: MotionArcher.CRITICALFINISH
  }
]


■更新履歴
ver2.0 2023/11/3
最新版対応,パラメータ名変更
ver1.0 2017/10/29
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
  var _AttackEvaluator_AttackMotion__getAttackMotionId = AttackEvaluator.AttackMotion._getAttackMotionId;
  AttackEvaluator.AttackMotion._getAttackMotionId = function (virtualActive, virtualPassive, attackEntry) {
    var midData = MotionIdControl.createMotionIdData(
      virtualActive,
      virtualPassive,
      attackEntry,
      virtualActive.motionAttackCount
    );
    if (midData.attackTemplateType === AttackTemplateType.ARCHER && virtualActive.isApproach) {
      MotionIdControl.getDirectBowId(midData);
    }

    if (midData.id === MotionIdValue.NONE) {
      return _AttackEvaluator_AttackMotion__getAttackMotionId.apply(this, arguments);
    }

    virtualActive.motionAttackCount++;

    return midData;
  };

  MotionIdControl.getDirectBowId = function (midData) {
    var attackType = MotionArcher.BOW;
    var anime = midData.cls.getClassAnime(midData.attackTemplateType);
    if (!Array.isArray(anime.custom.directBowAttacks)) {
      midData.id = MotionIdValue.NONE;
      return;
    }
    if (midData.isCritical) {
      if (midData.isFinish) {
        attackType = MotionArcher.CRITICALFINISH;
      } else {
        attackType = MotionArcher.CRITICALBOW;
      }
    } else if (midData.count % 2 === 1) {
      attackType = MotionArcher.BOW2;
    }

    var targetDirectBowAttack =
      anime.custom.directBowAttacks.filter(function (directBowAttack) {
        return directBowAttack.attackType === attackType;
      })[0] || null;

    if (!!targetDirectBowAttack) {
      midData.id = targetDirectBowAttack.motionId;
      midData.type = targetDirectBowAttack.attackType;
    } else {
      midData.id = MotionIdValue.NONE;
    }
  };
})();

if (!Array.isArray) {
  Array.isArray = function (arg) {
    return Object.prototype.toString.call(arg) === "[object Array]";
  };
}

// Array.filter poliyfill
// Reference:  https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/filter#polyfill
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

/*
 CPUの行動順番割り込みAI ver1.1

 ■作成者
キュウブ

■概要
CPUが何らかのアクションが起こせるようになったタイミングで、
順番を無視して行動開始するようになります。

例えば、
行動順番が1番目となっている敵ヒーラーが、
後続の誰かが負傷したときに、行動を開始するようになります。

■使い方
1.対象ユニットのAIを行動型か待機型にします（行動型AIでヒーラーで無い場合は範囲内行動にチェックを入れる事を推奨）
2.対象ユニットに以下のカスタムパラメータを付与します
enabledInterruptOrder:true

■仕様
ユニットのアクティブイベントは順番が回ってきた時点で流れてしまいます。
この設定を付与するユニットにアクティブイベントを設定する事は推奨しません。

■更新履歴
ver1.1 2022/07/11
待機型にも対応

ver1.0 2022/07/11
初版

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
*/

(function () {
  var _EnemyTurn__checkNextOrderUnit = EnemyTurn._checkNextOrderUnit;
  EnemyTurn._checkNextOrderUnit = function () {
    var unit;
    var list = this._getActorList();
    var count = list.getCount();

    for (var index = 0; index < count; index++) {
      unit = list.getData(index);
      if (this._shouldInterruptOrder(unit)) {
        unit.setOrderMark(OrderMarkType.EXECUTED);
        return unit;
      }
    }

    return _EnemyTurn__checkNextOrderUnit.apply(this, arguments);
  };

  EnemyTurn._shouldInterruptOrder = function (unit) {
    var isWaitOnly;
    var combination = null;
    var patternType = unit.getAIPattern().getPatternType();
    var isOrderAllowed = this._isOrderAllowed(unit);
    var isInterruptOrderAI = !!unit.custom.enabledInterruptOrder;

    if (isOrderAllowed && isInterruptOrderAI) {
      if (patternType === PatternType.APPROACH) {
        combination = CombinationManager.getApproachCombination(unit, true);
      } else if (patternType === PatternType.WAIT) {
        isWaitOnly = unit.getAIPattern().getWaitPatternInfo().isWaitOnly();
        if (!isWaitOnly) {
          combination = CombinationManager.getWaitCombination(unit);
        }
      }
      return combination !== null;
    }
    return false;
  };
})();

/*--------------------------------------------------------------------------
　敵再行動時、挙動やパラメータを調整できるようにする ver 1.0

■作成者
キュウブ

■概要
再行動というのは非常に強い行動であり、
敵ユニットに使わせたくても、強くなりすぎるため設定しにくいという問題が起こりがちです。

このスクリプトでは、敵ユニット再行動発生～敵ターン終了まで特定のステートを付与します。
つまり、以下のような使い方をする事で、再行動時の敵の強さを調整する事ができるようになります。
- 攻撃力や移動力を下げるステートを付与して、理不尽にユニットが撃破されないように調整する
- 特別なデメリットスキルを持たせるステートを付与して、理不尽にユニットが撃破されないように調整する
- 付与したステートを条件として、別の行動パターンを取らせる

※このスクリプト自体は再行動に合わせてステートを付与するだけなので、別の使い道もあると思います

■使い方
調整用のステートを用意し、
カスタムパラメータのjsonの中に下記のパラメータを設定すればOK
isQuickAdjustmentState: true

■更新履歴
ver 1.0 2023/06/08
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
  StateControl.getQuickAdjustmentState = function () {
    var states = root.getBaseData().getStateList();
    var count = states.getCount();
    for (var index = 0; index < count; index++) {
      var state = states.getData(index);
      if (!!state.custom.isQuickAdjustmentState) {
        return state;
      }
    }
    return null;
  };

  var _ReactionFlowEntry__completeMemberData =
    ReactionFlowEntry._completeMemberData;
  ReactionFlowEntry._completeMemberData = function (playerTurn) {
    var isEnemyType = this._targetUnit.getUnitType() === UnitType.ENEMY;
    var enterResult = _ReactionFlowEntry__completeMemberData.apply(
      this,
      arguments
    );
    var state = StateControl.getQuickAdjustmentState();
    if (isEnemyType && state && enterResult === EnterResult.OK) {
      StateControl.arrangeState(this._targetUnit, state, IncreaseType.INCREASE);
    }
    return enterResult;
  };

  var _QuickItemUse_mainAction = QuickItemUse.mainAction;
  QuickItemUse.mainAction = function () {
    var state = StateControl.getQuickAdjustmentState();
    var targetUnit = this._itemUseParent.getItemTargetInfo().targetUnit;
    var isEnemyType = targetUnit.getUnitType() === UnitType.ENEMY;
    if (isEnemyType && state) {
      StateControl.arrangeState(targetUnit, state, IncreaseType.INCREASE);
    }
    _QuickItemUse_mainAction.apply(this, arguments);
  };

  var _EnemyTurn__moveEndEnemyTurn = EnemyTurn._moveEndEnemyTurn;
  EnemyTurn._moveEndEnemyTurn = function () {
    var state = StateControl.getQuickAdjustmentState();
    if (root.getCurrentSession().getTurnType() === TurnType.ENEMY && state) {
      var actorList = this._getActorList();
      var count = actorList.getCount();
      for (var index = 0; index < count; index++) {
        var unit = actorList.getData(index);
        StateControl.arrangeState(unit, state, IncreaseType.DECREASE);
      }
    }
    return _EnemyTurn__moveEndEnemyTurn.apply(this, arguments);
  };

  var _SkillAutoAction__enterQuick = SkillAutoAction._enterQuick;
  SkillAutoAction._enterQuick = function () {
    var isEnemyType = this._targetUnit.getUnitType() === UnitType.ENEMY;
    var state = StateControl.getQuickAdjustmentState();
    if (isEnemyType && state) {
      StateControl.arrangeState(this._targetUnit, state, IncreaseType.INCREASE);
    }
    return _SkillAutoAction__enterQuick.apply(this, arguments);
  };
})();

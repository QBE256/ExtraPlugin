/*--------------------------------------------------------------------------
　ステートを別ステートにアップデートする ver 1.0

■作成者
キュウブ

■概要
指定したステートを別のステートにアップデートできるようになります。
例えば、
・毒状態の相手にもう一度毒を付与して、猛毒状態に変化させる
・睡眠状態から回復すると寝ぼけ状態になる
といった使い方ができます。

■使い方
元のステートのカスタムパラメータに以下のようなパラメータを設定します。
{
  updateState: {
    type: <アップデートの種類>,
    id: <アップデート先のステートID>
  }
}

typeには0か1を設定します。下記のようにアップデートされるタイミングが変わります。
・0は元のステートを重ねがけした時
・1は元のステートが消去される時(イベントコマンドの"全解除"には対応しておりません)

例1.下記の場合は元のステートを重ねがけすると、ID1のステートに変化します。
{
  updateState: {
    type: 0,
    id: 1
  }
}

例2.下記の場合は元のステートが消去される時に、ID5のステートに変化します。
{
  updateState: {
    type: 1,
    id: 5
  }
}

■わかってる人向け
typeは定数で定義しており、
重ねがけで変化させたい場合はUpdateStateType.OVER_LAPPING
消去で変化させたい場合はUpdateStateType.DECREASEと記述しても動作します。

■更新履歴
ver 1.0 2023/06/15
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
  var UpdateStateType = {
    OVER_LAPPING: 0,
    DECREASE: 1
  };
  var isValidUpdateState = function (state) {
    if (!state) {
      return false;
    }
    if (typeof state.custom.updateState !== "object") {
      return false;
    }
    var updateState = state.custom.updateState;
    if (!updateState.hasOwnProperty("type")) {
      return false;
    }
    if (typeof updateState.type !== "number") {
      return false;
    }
    if (!updateState.hasOwnProperty("id")) {
      return false;
    }
    if (typeof updateState.id !== "number") {
      return false;
    }
    return true;
  };

  var _StateControl_arrangeState = StateControl.arrangeState;
  StateControl.arrangeState = function (unit, currentState, increaseType) {
    if (!isValidUpdateState(currentState)) {
      _StateControl_arrangeState.apply(this, arguments);
      return;
    }

    var isOverLapping =
      increaseType === IncreaseType.INCREASE &&
      currentState.custom.updateState.type === UpdateStateType.OVER_LAPPING;
    var isDecrease =
      increaseType === IncreaseType.DECREASE &&
      currentState.custom.updateState.type === UpdateStateType.DECREASE;

    if (!isOverLapping && !isDecrease) {
      _StateControl_arrangeState.apply(this, arguments);
      return;
    }

    var replacedStateId = currentState.custom.updateState.id;
    var states = root.getBaseData().getStateList();
    var replacedState = states.getDataFromId(replacedStateId);

    if (!replacedState) {
      root.log("[WARNING]ID:" + replacedStateId + "のステートは存在しません");
      _StateControl_arrangeState.apply(this, arguments);
      return;
    }

    var currentTurnState = this.getTurnState(unit, currentState);
    if (currentTurnState) {
      var list = unit.getTurnStateList();
      var editor = root.getDataEditor();
      editor.deleteTurnStateData(list, currentState);
      editor.addTurnStateData(list, replacedState);
    } else {
      _StateControl_arrangeState.apply(this, arguments);
    }
  };
})();

/*
 待機する度に残りターン数が減少するステート ver1.0

 ■作成者
キュウブ

■概要
このスクリプトを導入すると"味方ユニットが待機するだけで残りターンが減少するステート"を作成する事ができます。
例えば、味方が2回行動するまでステータスを大幅に下げるステート など

■使い方
1.ステートにカスタムパラメータを設定する
下記のカスタムパラメータで待機時に残りターン数が減少するようになります
enabledDecreaseByWait:true

2.味方の行動で敵に付与する場合は持続ターンを設定したいターン数+1で設定する
これは付与した直後の味方の待機で残りターン数が消費されてしまうためです
よって、持続を1行動としたい場合は2ターンと設定してください

※味方ユニットの行動を伴わないイベントで付与する場合は関係無し

3.自軍ターン終了時に強制解除させたい場合はイベント追加
自軍ターン終了時に該当ステートを強制解除させたい場合は
マップ共有イベントで毎ターン終了時にステートを強制解除させるイベントを設定してください。
※同ディレクトリのスクショ参考

■更新履歴
ver1.0 2022/07/16
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
  var _UnitWaitFlowEntry__completeMemberData = UnitWaitFlowEntry._completeMemberData;
  UnitWaitFlowEntry._completeMemberData = function (playerTurn) {
    var enterResult = _UnitWaitFlowEntry__completeMemberData.apply(this, arguments);
    var isEndAction = enterResult === EnterResult.NOTENTER;
    if (isEndAction) {
      var filterUnits = FilterControl.getListArray(
        UnitFilterFlag.PLAYER | UnitFilterFlag.ENEMY | UnitFilterFlag.ALLY
      );
      for (var index = 0; index < filterUnits.length; index++) {
        StateControl.decreaseWait(filterUnits[index]);
      }
    }
    return enterResult;
  };

  StateControl.decreaseWait = function (unitList) {
    for (var unitIndex = 0; unitIndex < unitList.getCount(); unitIndex++) {
      var unit = unitList.getData(unitIndex);
      var turnStates = unit.getTurnStateList();
      for (var stateIndex = 0; stateIndex < turnStates.getCount(); stateIndex++) {
        var turnState = turnStates.getData(stateIndex);
        var state = turnState.getState();
        var restTurn = turnState.getTurn();
        var isInfinity = restTurn <= 0;
        if (!!state.custom.enabledDecreaseByWait && !isInfinity) {
          restTurn--;
          turnState.setTurn(restTurn);
          if (restTurn === 0) {
            this.arrangeState(unit, state, IncreaseType.DECREASE);
          }
        }
      }
    }
  };
})();

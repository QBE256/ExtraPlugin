/*--------------------------------------------------------------------------
ターン終了時に混乱ユニットを行動させる ver1.2

■概要
混乱ユニットがターン開始時に行動する仕様を変更する

※recovery_support.jsを入れる場合はこちらのTurnChangeStart.pushFlowEntriesを消し、
※recovery_support.js側のTurnChangeStart.pushFlowEntriesの中を以下のように変更する事
//////////////////////////////////////////////////////////////////
TurnChangeStart.pushFlowEntries = function(straightFlow) {

  // ターン表示を先行させる
  if (this._isTurnAnimeEnabled()) {
    straightFlow.pushFlowEntry(TurnAnimeFlowEntry);
  }
  else {
    straightFlow.pushFlowEntry(TurnMarkFlowEntry);
  }
  straightFlow.pushFlowEntry(RecoveryAllFlowEntry);
  straightFlow.pushFlowEntry(MetamorphozeCancelFlowEntry);
  straightFlow.pushFlowEntry(StateTurnFlowEntry);
  straightFlow.insertFlowEntry(EntireRecoveryFlowEntry,1);
};
/////////////////////////////////////////////////////////////////

■更新履歴
ver 1.2 2022/09/15
最新版に対応

ver 1.1 2017/06/26
TurnChangeStart.pushFlowEntriesの処理が変わったので修正

ver 1.0 2017/06/06


■対応バージョン
　SRPG Studio Version:1.267


■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。どんどん改造してください。
・クレジット明記無し　OK
・再配布、転載　OK
・SRPG Studio利用規約は遵守してください。
  
--------------------------------------------------------------------------*/

(function () {
  // ターン開始時のイベント処理でBerserkFlowEntryを入力する処理を無効化する必要がある
  TurnChangeStart.pushFlowEntries = function (straightFlow) {
    // ターン表示を先行させる
    if (this._isTurnAnimeEnabled()) {
      straightFlow.pushFlowEntry(TurnAnimeFlowEntry);
    } else {
      straightFlow.pushFlowEntry(TurnMarkFlowEntry);
    }
    straightFlow.pushFlowEntry(RecoveryAllFlowEntry);
    straightFlow.pushFlowEntry(MetamorphozeCancelFlowEntry);
    //straightFlow.pushFlowEntry(BerserkFlowEntry);
    straightFlow.pushFlowEntry(StateTurnFlowEntry);
  };

  var _TurnChangeEnd_pushFlowEntries = TurnChangeEnd.pushFlowEntries;
  TurnChangeEnd.pushFlowEntries = function (straightFlow) 
    straightFlow.pushFlowEntry(BerserkFlowEntry);
    _TurnChangeEnd_pushFlowEntries.apply(this, arguments);
  };
})();

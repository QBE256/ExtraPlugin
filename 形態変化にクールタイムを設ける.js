/*
形態変化にクールタイムを設ける ver1.0

■作成者
キュウブ

■概要
形態変化解除後にしばらく変化できなくなるステートを付与します。
※形態変化アイテム、ユニットコマンドが使えないだけで、イベントコマンド経由での形態変化は有効なままです。
※デフォルトだと1ユニットにつきステートは6つまでしか付与されません。
多数のステートを付与するゲームの場合、他に不具合が起こる可能性があるので注意

■使い方
1.クールタイム用ステートを設定
下記のようなカスパラを設定したクールタイム用ステートを設定します。
設定されたターン数分だけクールタイムが発生します。
{
	isMetamorphozeCoolTime:true
}

2.該当の形態変化のカスタムパラメータに下記のような設定をします。
{
	coolTimeStateId: <1で設定したクールタイムステートのID>
}

※形態変化アイテム、ユニットコマンドが出現しなくなるだけで、イベントコマンド経由での形態変化は有効なままです。

更新履歴
ver 1.0 2022/03/30
初版

■対応バージョン
SRPG Studio Version:1.161

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。
・クレジット明記無し　OK (明記する場合は"キュウブ"でお願いします)
・再配布、転載　OK (バグなどがあったらプルリクエストしてくださると嬉しいです)
・wiki掲載　OK
・SRPG Studio利用規約は遵守してください。

*/

(function(){
	var _UnitCommand_Metamorphoze_isCommandDisplayable = UnitCommand.Metamorphoze.isCommandDisplayable;
	UnitCommand.Metamorphoze.isCommandDisplayable = function() {
		if (StateControl.isMetamorphozeCoolTime(this.getCommandTarget())) {
			return false;
		}
		return _UnitCommand_Metamorphoze_isCommandDisplayable.apply(this, arguments);
	};

	var _MetamorphozeControl_clearMetamorphoze = MetamorphozeControl.clearMetamorphoze;
	MetamorphozeControl.clearMetamorphoze = function(unit) {
		var state;
		var metamorphozeData = unit.getUnitStyle().getMetamorphozeData();
		if (metamorphozeData && typeof metamorphozeData.custom.coolTimeStateId === 'number') {
			state = root.getBaseData().getStateList().getDataFromId(metamorphozeData.custom.coolTimeStateId);
			StateControl.arrangeState(unit, state, IncreaseType.INCREASE);
		}
		_MetamorphozeControl_clearMetamorphoze.apply(this, arguments);
	};

	var _MetamorphozeItemAvailability_isItemAvailableCondition = MetamorphozeItemAvailability.isItemAvailableCondition;
	MetamorphozeItemAvailability.isItemAvailableCondition = function(unit, item) {
		if (StateControl.isMetamorphozeCoolTime(unit)) {
			return false;
		}
		return _MetamorphozeItemAvailability_isItemAvailableCondition.apply(this, arguments);
	};

	StateControl.isMetamorphozeCoolTime = function(unit) {
		var i, state;
		var turnStates = unit.getTurnStateList();
		var count = turnStates.getCount();
		
		for (var index = 0; index < count; index++) {
			state = turnStates.getData(index).getState();
			if (state.custom.isMetamorphozeCoolTime) {
				return true;
			}
		}
		
		return false;
	};

	// 形態変化の自然解除直後にクールタイムステートが減少してしまうのを防ぐため
	// ステート減少フローよりも形態解除フローを後ろに移動させる必要がある
	TurnChangeStart.pushFlowEntries = function(straightFlow) {
		if (this._isTurnAnimeEnabled()) {
			straightFlow.pushFlowEntry(TurnAnimeFlowEntry);
		}
		else {
			straightFlow.pushFlowEntry(TurnMarkFlowEntry);
		}
		straightFlow.pushFlowEntry(RecoveryAllFlowEntry);
		straightFlow.pushFlowEntry(BerserkFlowEntry);
		straightFlow.pushFlowEntry(StateTurnFlowEntry);
		straightFlow.pushFlowEntry(MetamorphozeCancelFlowEntry);
	};
})();
/*--------------------------------------------------------------------------
　情報ウィンドウコマンドでウェイトを入れる ver 1.0

■作成者
キュウブ

■概要
決定キー連打で
情報ウィンドウを読まずに進んでしまう事を防止するため、90フレームのウェイトを挟みます。
また、情報ウィンドウ表示に効果音も鳴るようになります。
※不要の場合は すぐ下のInfoWindowSoundSettingのidを-1にしてください。

■更新履歴
ver 1.0 (2021/05/22)
初版公開

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

--------------------------------------------------------------------------*/

var InfoWindowSoundSetting = {
	isRuntime: true,　// 鳴らす効果音がランタイムの場合はtrue,オリジナル素材の場合はfalseにする
	id: 235 // 鳴らす効果音のIDを記入する。音を鳴らしたくない場合は-1以下の値にしておくこと
};
(function(){
	InfoWindowEventCommand._waitCounter = null;
	InfoWindowEventCommand._isForceWait = true;
	var _InfoWindowEventCommand__prepareEventCommandMemberData = InfoWindowEventCommand._prepareEventCommandMemberData;
	InfoWindowEventCommand._prepareEventCommandMemberData = function() {
		_InfoWindowEventCommand__prepareEventCommandMemberData.call(this);
		this._waitCounter = createObject(CycleCounter);
		this._isForceWait = true;
	};
	var _InfoWindowEventCommand__completeEventCommandMemberData = InfoWindowEventCommand._completeEventCommandMemberData;
	InfoWindowEventCommand._completeEventCommandMemberData = function() {
		var soundHandle;
		if (InfoWindowSoundSetting.id >= 0) {
			soundHandle = root.createResourceHandle(InfoWindowSoundSetting.isRuntime, InfoWindowSoundSetting.id, 0, 0, 0);
			MediaControl.soundPlay(soundHandle);
		}
		this._waitCounter.disableGameAcceleration();
		this._waitCounter.setCounterInfo(90);
		return _InfoWindowEventCommand__completeEventCommandMemberData.call(this);
	};
	var _InfoWindowEventCommand_moveEventCommandCycle = InfoWindowEventCommand.moveEventCommandCycle;
	InfoWindowEventCommand.moveEventCommandCycle = function() {
		var result = _InfoWindowEventCommand_moveEventCommandCycle.call(this);
		if (!this._isForceWait) {
			return result;
		}
		else if (this._waitCounter.moveCycleCounter() !== MoveResult.CONTINUE) {
			this._isForceWait = false;
		}
		return MoveResult.CONTINUE;
	};
})();
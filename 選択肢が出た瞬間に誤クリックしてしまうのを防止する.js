/*--------------------------------------------------------------------------
　選択肢が出た瞬間に誤クリックしてしまうのを防止する ver 1.0

■作成者
キュウブ

■概要
会話イベントの途中で選択肢を挟むと
決定キーを連打してしまい、プレイヤーは想定外の選択肢を選んでしまう可能性がある。

このプラグインを導入すると下記のいずれかの条件を満たさない限り、
矢印が表示されず決定キーも有効にならなくなる。
・上下左右キーを一度以上入力する事
・マウスカーソルを動かした上で、選択肢の上に置く(あらかじめ選択肢の上にカーソルが置かれていても、動かさないと有効にならない)

このほかに選択肢イベントの直前に効果音を入れておくといった工夫をしておくと、
UXの向上につながると思います。

■更新履歴
ver 1.0 (2021/01/17)
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

--------------------------------------------------------------------------*/

var ChoiceShowEventMode = {
	INTERVAL: 0,
	SELECT: 1
};

(function(){
	var alias1 = ChoiceShowEventCommand.moveEventCommandCycle;
	ChoiceShowEventCommand.moveEventCommandCycle = function() {
		var mode = this.getCycleMode();

		if (mode === ChoiceShowEventMode.INTERVAL) {
			if (this._scrollbar.moveScrollbarCursor() !== InputType.NONE) {
				this._scrollbar.setActive(true);
				this.changeCycleMode(ChoiceShowEventMode.SELECT);
			}
		}
		else if (mode ===  ChoiceShowEventMode.SELECT) {
			return alias1.call(this);
		}

		return MoveResult.CONTINUE;
	};

	var alias2 = ChoiceShowEventCommand._completeEventCommandMemberData;
	ChoiceShowEventCommand._completeEventCommandMemberData = function() {
		var result = alias2.call(this);
		this.changeCycleMode(ChoiceShowEventMode.INTERVAL);
		this._scrollbar.setActive(false);

		return result;
	};
})();
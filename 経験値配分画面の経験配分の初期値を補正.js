/*--------------------------------------------------------------------------
　経験値配分画面で経験値配分の初期値を補正する ver 1.0

■作成者
キュウブ

■概要
経験値配分画面にて、経験配分の初期値が次のレベルアップに必要な分までの値になる。

■更新履歴
ver 1.0 (2022/04/01)
公開

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。
・クレジット明記無し　OK (明記する場合は"キュウブ"でお願いします)
・再配布、転載　OK (バグなどがあったら修正できる方はご自身で修正版を配布してもらっても構いません)
・wiki掲載　OK
・SRPG Studio利用規約は遵守してください。

--------------------------------------------------------------------------*/
(function(){
	var _BonusInputWindow_setUnit = BonusInputWindow.setUnit;
	BonusInputWindow.setUnit = function(unit) {
		_BonusInputWindow_setUnit.apply(this, arguments);
		if (this.getCycleMode() === BonusInputWindowMode.INPUT) {
			var nextLevelUpExp = 100 - unit.getExp();
			this._exp = nextLevelUpExp > this._max ? this._max : nextLevelUpExp; 
		}
	};
})();
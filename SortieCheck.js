/*--------------------------------------------------------------------------
　出撃選択画面でスペースキー入力時に出撃確認チェックを挟む ver 1.0

■作成者
キュウブ

■概要
デフォルトでは出撃選択画面でスペースを押すとマップ攻略フェーズへ移行されますが、
このスクリプトを導入すると出撃開始コマンドを選択した時と同様、
本当に出撃するかどうかの確認が挟まれるようになります。

■更新履歴
ver 1.0 (2021/6/19)
公開 

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

(function(){
	UnitSortieMode.CHECK_SORTIE = 21;
	var _UnitSortieScreen__prepareScreenMemberData = UnitSortieScreen._prepareScreenMemberData;
	UnitSortieScreen._prepareScreenMemberData = function(screenParam) {
		this._questionWindow = createWindowObject(QuestionWindow, this);
		this._questionWindow.setQuestionMessage(StringTable.UnitSortie_Question);
		_UnitSortieScreen__prepareScreenMemberData.call(this, screenParam);
	};

	var _UnitSortieScreen_moveScreenCycle = UnitSortieScreen.moveScreenCycle;
	UnitSortieScreen.moveScreenCycle = function() {
		var mode = this.getCycleMode();
		var result = MoveResult.CONTINUE;

		if (mode === UnitSortieMode.CHECK_SORTIE) {
			return this._moveCheckSortie();
		}
		
		return _UnitSortieScreen_moveScreenCycle.call(this);
	};

	UnitSortieScreen._moveCheckSortie = function() {
		if (this._questionWindow.moveWindow() !== MoveResult.CONTINUE) {
			if (this._questionWindow.getQuestionAnswer() === QuestionAnswer.YES) {
				this._resultCode = UnitSortieResult.START;
				return MoveResult.END;
			}
			this._questionWindow.setQuestionActive(false);
			this.changeCycleMode(UnitSortieMode.TOP);
		}	
		return MoveResult.CONTINUE;	
	};

	UnitSortieScreen._moveStart = function() {
		this.changeCycleMode(UnitSortieMode.CHECK_SORTIE);
		this._questionWindow.setQuestionActive(true);
		return MoveResult.CONTINUE;
	};

	var _UnitSortieScreen_drawScreenCycle = UnitSortieScreen.drawScreenCycle;
	UnitSortieScreen.drawScreenCycle = function() {
		var x = LayoutControl.getCenterX(-1, this._questionWindow.getWindowWidth());
		var y = LayoutControl.getCenterY(-1, this._questionWindow.getWindowHeight());

		_UnitSortieScreen_drawScreenCycle.call(this);
		if (this.getCycleMode() === UnitSortieMode.CHECK_SORTIE) {
			this._questionWindow.drawWindow(x, y);
		}
	};
})();
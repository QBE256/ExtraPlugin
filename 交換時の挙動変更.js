/*--------------------------------------------------------------------------
　交換時の挙動変更 ver1.0
■作成者
キュウブ

■概要
アイテム交換で交換元のアイテムを選択した時に
カーソルが交換先の空欄まで自動で移動するようになります
（SRPG Studio本来の挙動はカーソルを交換先へ移動させる手間がかかっていましたが、それが無くなります）

■更新履歴
ver1.0 2020/11/22
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

------------------------------------------------------*/

(function(){
	var alias = UnitItemTradeScreen._moveTradeSelect;
	UnitItemTradeScreen._moveTradeSelect = function() {
		var moveResult;

		if (this._isSelect) {
			return alias.call(this);
		}

		moveResult = alias.call(this);
		if (this._isSrcScrollbarActive) {
			this._setActive(false);
			this._isSrcScrollbarActive = false;
			this._itemListDest.setItemIndex(UnitItemControl.getPossessionItemCount(this._unitDest));
		}
		else {
			this._isSrcScrollbarActive = true;
			this._setActive(true);
			this._itemListSrc.setItemIndex(UnitItemControl.getPossessionItemCount(this._unitSrc));
		}

		return moveResult;
	};
})();
/*--------------------------------------------------------------------------
　交換時の挙動変更 ver1.2
■作成者
キュウブ

■概要
アイテム交換の挙動が以下のように変化します。
1.アイテム交換で交換元のアイテムを選択した時に、カーソルが交換先の空欄まで自動で移動
2.交換キャンセル時は、カーソルが交換元アイテムに自動で移動
3.左右キーを入力した時にカーソルが水平移動

ちなみに本来のSRPG studioの仕様では下記のような仕様になっております。
（UX向上を目的としたスクリプトですが、作品に導入して本当に向上するかのご判断はお任せします）
1.アイテム交換で交換元のアイテムを選択した時に、カーソルはその場から移動しない
2.交換キャンセル時は、カーソルがその場から移動しない
3.左右キーを入力した時は以前指していた位置に移動

■更新履歴
ver1.2 2020/11/23
キャンセル時に交換元アイテムにカーソルが戻る挙動を追加
左右キーを押した時に、水平移動する仕様を追加

ver1.1 2020/11/22
交換先がアイテムで埋まっている時にエラーになる不具合を修正

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
	var tempFunctions = {
		UnitItemTradeScreen: {
			_moveTradeSelect: UnitItemTradeScreen._moveTradeSelect,
			_moveTradeCancel: UnitItemTradeScreen._moveTradeCancel,
			_moveTradeNone: UnitItemTradeScreen._moveTradeNone
		}
	};

	UnitItemTradeScreen._moveTradeSelect = function() {
		var moveResult, tradeDestinationUnit, destinationIndex, destinationWindow;

		if (this._isSelect) {
			return tempFunctions.UnitItemTradeScreen._moveTradeSelect.call(this);
		}

		moveResult = tempFunctions.UnitItemTradeScreen._moveTradeSelect.call(this);
		if (this._isSrcScrollbarActive) {
			this._setActive(false);
			this._isSrcScrollbarActive = false;
			tradeDestinationUnit = this._unitDest;
			destinationWindow = this._itemListDest;
		}
		else {
			this._isSrcScrollbarActive = true;
			this._setActive(true);
			tradeDestinationUnit = this._unitSrc;
			destinationWindow = this._itemListSrc;
		}

		destinationIndex = UnitItemControl.getPossessionItemCount(tradeDestinationUnit);
		// 交換先がアイテムで埋まっている時は、交換元と同じインデックスに移動させる
		if (destinationIndex >= DataConfig.getMaxUnitItemCount()) {
			destinationIndex = this._selectIndex;
		}
		destinationWindow.setItemIndex(destinationIndex);

		return moveResult;
	};

	UnitItemTradeScreen._moveTradeCancel = function() {
		if (this._isSelect) {
			if (!this._isSrcSelect) {
				this._setActive(false);
				this._isSrcScrollbarActive = false;
				this._itemListDest.setItemIndex(this._selectIndex);
			}
			else {
				this._isSrcScrollbarActive = true;
				this._setActive(true);
				this._itemListSrc.setItemIndex(this._selectIndex);
			}
		}
		
		return tempFunctions.UnitItemTradeScreen._moveTradeCancel.call(this);
	};

	UnitItemTradeScreen._moveTradeNone = function() {
		var isHorz = InputControl.isInputAction(InputType.LEFT) || InputControl.isInputAction(InputType.RIGHT);

		if (isHorz) {
			if (this._isSrcScrollbarActive) {
				this._itemListDest.setItemIndex(this._itemListSrc.getItemIndex());
			}
			else {
				this._itemListSrc.setItemIndex(this._itemListDest.getItemIndex());
			}
		}

		return tempFunctions.UnitItemTradeScreen._moveTradeNone.call(this);
	}
})();
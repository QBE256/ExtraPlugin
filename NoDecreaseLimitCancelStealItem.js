/*
シーフ系アイテムで盗む前にキャンセルした場合は選択画面に戻る ver1.0

■作成者
キュウブ

■概要
シーフ系のアイテムは本来、
1.ターゲット選択
2.アイテム発動
3.交換画面で相手のアイテムを選択
というフローになっており、交換画面で何も行わずにキャンセルを押しても
ユニットは待機状態に移行し耐久が消費される仕組みになっています。

このスクリプトを導入した場合は、
1.ターゲット選択
2.交換画面で相手から盗む物を選択
3.盗む物を選択していればアイテム発動、選択せずにキャンセルした場合は1に戻る
というフローになり、何も選択しなかった場合は行動や耐久を消費せずに済むようになります。

■更新履歴
ver 1.0 (2021/05/25)
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
*/



UnitItemStealScreen.getStealFlag = function() {
	return this._resultCode;
};

var StealItemSelectMode = {
	TARGETSELECT: 0,
	STEALSCREEN: 1
};

StealItemSelection._unitItemStealScreen = null;
StealItemSelection._moveTargetSelect = function() {
	var targetUnit;
	var result = this._posSelector.movePosSelector();

	if (result === PosSelectorResult.SELECT) {
		if (this.isPosSelectable()) {
			targetUnit = this._posSelector.getSelectorTarget(false);
			if (targetUnit !== null) {
				this._targetUnit = targetUnit;
			}
			this._isSelection = true;
			this._posSelector.endPosSelector();
			this._unitItemStealScreen = createObject(UnitItemStealScreen);
			SceneManager.addScreen(this._unitItemStealScreen, this._createScreenParam());
			this.changeCycleMode(StealItemSelectMode.STEALSCREEN);
		}
	}
	else if (result === PosSelectorResult.CANCEL) {
		this._isSelection = false;
		this._posSelector.endPosSelector();
		return MoveResult.END;
	}

	return MoveResult.CONTINUE;
};

StealItemSelection._stealScreen = function() {
	if (SceneManager.isScreenClosed(this._unitItemStealScreen)) {
		if (this._unitItemStealScreen.getStealFlag() === UnitItemTradeResult.TRADEEND) {
			return MoveResult.END;
		}
		this._isSelection = false;
		this._targetUnit = null;
		this.changeCycleMode(StealItemSelectMode.TARGETSELECT);
	}

	return MoveResult.CONTINUE;
};

StealItemSelection.moveItemSelectionCycle = function() {
	var mode = this.getCycleMode();

	if (mode === StealItemSelectMode.TARGETSELECT) {
		result = this._moveTargetSelect();
	}
	else if (mode === StealItemSelectMode.STEALSCREEN) {
		result = this._stealScreen();
	}

	return result;
};

StealItemSelection._createScreenParam = function() {
	var screenParam = ScreenBuilder.buildUnitItemSteal();
		
	screenParam.unit = this._unit;
	screenParam.targetUnit = this._targetUnit;
	screenParam.stealFlag = this._item.getStealInfo().getStealFlag();
		
	return screenParam;
};

StealItemUse._isImmediately = function() {
	return true;
};
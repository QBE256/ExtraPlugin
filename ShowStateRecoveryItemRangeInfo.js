/*
	ステート回復アイテムの情報ウィンドウに射程を表示する ver1.0

	タイトルの通り。そのうちScript側で対応されると思われる。

	対応ver1.161
*/
(function(){
	StateRecoveryItemInfo.drawItemInfoCycle = function(x, y) {
		ItemInfoRenderer.drawKeyword(x, y, this.getItemTypeName(StringTable.ItemInfo_StateRecovery));
		y += ItemInfoRenderer.getSpaceY();
		this.drawRange(x, y, this._item.getRangeValue(), this._item.getRangeType());
		y += ItemInfoRenderer.getSpaceY();
		ItemInfoRenderer.drawState(x, y, this._item.getStateRecoveryInfo().getStateGroup(), true);
	};

	var _StateRecoveryItemInfo_getInfoPartsCount = StateRecoveryItemInfo.getInfoPartsCount;
	StateRecoveryItemInfo.getInfoPartsCount = function() {
		return _StateRecoveryItemInfo_getInfoPartsCount.call(this) + 1;
	};
})();
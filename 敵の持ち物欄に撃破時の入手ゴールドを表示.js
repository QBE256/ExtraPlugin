/*--------------------------------------------------------------------------
　敵の持ち物欄に撃破時の入手ゴールドを表示する ver 1.0

■作成者
キュウブ

■概要
※昔公開した"ドロップアイテムを取得する瞬間に消す"機能をブラッシュアップしたものです

このスクリプトを導入すると敵の持ち物欄に撃破時の入手ゴールドを表示する事が可能になります。

■使い方
1.ダミーアイテムの設定
アイテム欄に表示するダミーアイテムを設定します。
アイテム名は入手ゴールド量に変換されるのでなんでも構いません。
ただし、盗めたり使用する事がないように重要アイテム、交換禁止、使用不可能といった設定は入れておいてください。

アイテムのカスタムパラメータは下記のように設定しておきます。
{
	isGoldItem: true
}

2.敵ユニットにダミーアイテムを持たせる
ゴールドをドロップする敵ユニットにダミーアイテムを持たせておきます。

■更新履歴
ver 1.0 2022/04/03

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
	ItemDropListScrollbar._trophyGoldArray = null;
	var _ItemDropListScrollbar_resetDropMark = ItemDropListScrollbar.resetDropMark;
	ItemDropListScrollbar.resetDropMark = function() {
		var list, trophy;
		this._trophyGoldArray = [];
		for (var index = 0; index < this._objectArray.length; index++) {
			this._trophyGoldArray.push(-1);
		}

		if (this._unit !== null && this._unit.getUnitType() === UnitType.ENEMY) {
			list = this._unit.getDropTrophyList();
			for (var index = 0; index < list.getCount(); index++) {
				trophy = list.getData(index);
				if ((trophy.getFlag() & TrophyFlag.GOLD) && trophy.isImmediately()) {
					this._checkGoldDrop(trophy);
				}
			}
		}

		_ItemDropListScrollbar_resetDropMark.apply(this, arguments);
	};

	ItemDropListScrollbar._checkGoldDrop = function(trophy) {
		for (var index = 0; index < this._objectArray.length; index++) {
			if (this._objectArray[index].custom.isGoldItem === true && this._trophyGoldArray[index] < 0) {
				this._trophyGoldArray[index] = trophy.getGold();
				break;
			}
		}
	};

	var _ItemDropListScrollbar_drawScrollContent = ItemDropListScrollbar.drawScrollContent;
	ItemDropListScrollbar.drawScrollContent = function(x, y, object, isSelect, index) {
		var isAvailable, color, convertName;
		var textui = this.getParentTextUI();
		var font = textui.getFont();
		
		if (!object) {
			return;
		}

		if (this._isDropGold(index)) {
			convertName = String(this._trophyGoldArray[index]) + StringTable.CurrencySign_Gold;
			color = this._getTextColor(object, isSelect, index);
			ItemRenderer.drawItemConvertName(x, y, object, convertName, color, font, true, 255);
		} else {
			_ItemDropListScrollbar_drawScrollContent.apply(this, arguments);
		}
	};

	var _ItemDropListScrollbar__getTextColor = ItemDropListScrollbar._getTextColor;
	ItemDropListScrollbar._getTextColor = function(object, isSelect, index) {
		if (this._isDropGold(index)) {
			return ColorValue.LIGHT;
		}
		return _ItemDropListScrollbar__getTextColor.apply(this, arguments);
	};

	ItemDropListScrollbar._isDropGold = function(index) {
		if (this._unit !== null && this._unit.getUnitType() === UnitType.ENEMY) {
			return this._trophyGoldArray[index] >= 0;
		}
		
		return false;
	};

	ItemRenderer.drawItemConvertName = function(x, y, item, convertName, color, font, isDrawLimit, alpha) {
		var interval = this._getItemNumberInterval();
		var iconWidth = GraphicsFormat.ICON_WIDTH + 5;
		var length = this._getTextLength();
		var handle = item.getIconResourceHandle();
		var graphicsRenderParam = StructureBuilder.buildGraphicsRenderParam();
		
		graphicsRenderParam.alpha = alpha;
		GraphicsRenderer.drawImageParam(x, y, handle, GraphicsType.ICON, graphicsRenderParam);
		
		TextRenderer.drawAlphaText(x + iconWidth, y + 5, convertName, length, color, alpha, font);
		
		if (isDrawLimit) {
			this.drawItemLimit(x + iconWidth + interval, y, item, alpha);
		}
	};
})();
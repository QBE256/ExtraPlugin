/*--------------------------------------------------------------------------
　武器の情報ウィンドウに武器タイプを表示する ver 1.1

■作成者
キュウブ

■概要
このスクリプトを導入すると武器の情報ウィンドウに武器タイプが表示されるようになります。

■更新履歴
ver 1.1 2021/11/25
インデントが誤っていた箇所や無駄なスペースを修正
(挙動はver1.0と全く変わらないです)

ver 1.0 2021/11/24
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

ItemSentence.WeaponType = defineObject(BaseItemSentence,
{
	drawItemSentence: function(x, y, item) {
		var handle = item.getWeaponType().getIconResourceHandle();

		ItemInfoRenderer.drawKeyword(x, y, "タイプ");
		if (handle.isNullHandle()) {
			return;
		}
		x += ItemInfoRenderer.getSpaceX();
		GraphicsRenderer.drawImage(x, y, handle, GraphicsType.ICON);
	},
	
	getItemSentenceCount: function(item) {
		return 1;
	}
}
);

(function(){
	var _ItemInfoWindow__configureWeapon = ItemInfoWindow._configureWeapon;
	ItemInfoWindow._configureWeapon = function(groupArray) {
		groupArray.appendObject(ItemSentence.WeaponType);
		_ItemInfoWindow__configureWeapon.apply(this, arguments);
	};

	var _ItemInfoWindow__configureItem = ItemInfoWindow._configureItem;
	ItemInfoWindow._configureItem = function(groupArray) {
		groupArray.appendObject(ItemSentence.WeaponType);
		_ItemInfoWindow__configureItem.apply(this, arguments);
	};
})();
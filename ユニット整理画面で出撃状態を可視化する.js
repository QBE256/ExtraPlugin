/*--------------------------------------------------------------------------
　ユニット整理画面のユニットリストで出撃状態を可視化する ver 1.3

■作成者
キュウブ

■概要
出撃準備のユニット整理画面でユニットの出撃状態かどうか判別できるようになります。
対象ユニットはアイテム整理をしておく必要があるのか、しなくてもマップ攻略に影響がないのか一目でわかるようになります。

■仕様
リソースは表示名以外はストック交換画面の設定を流用します。

■更新履歴
ver 1.0 (2021/05/07)
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

(function(){
	var _UnitSelectScrollbar_drawScrollContent = UnitSelectScrollbar.drawScrollContent;
	UnitSelectScrollbar.drawScrollContent = function(x, y, object, isSelect, index) {
		var range;
		var unit = object;
		var alpha = 255;
		var dx = Math.floor((this.getObjectWidth() - GraphicsFormat.CHARCHIP_WIDTH) / 2) - 4;
		var dy = -10;
		var length = this._getTextLength();
		var textui = this.getParentTextUI();
		var font = this.getParentTextUI().getFont();
		
		_UnitSelectScrollbar_drawScrollContent.apply(this, arguments);
		if (unit.getSortieState() !== SortieType.SORTIE) {
			return;
		}
		if (this._selectableArray !== null && !this._selectableArray[index]) {
			alpha = 128;
		}
		range = createRangeObject(x + dx, y + dy, length, 40);
		TextRenderer.drawRangeAlphaText(range, TextFormat.CENTER, '出撃', length, 0x00ff00, alpha, font);
	};
})();
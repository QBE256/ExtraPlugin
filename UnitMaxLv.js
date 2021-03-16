/*--------------------------------------------------------------------------
　ユニット別にレベル上限値を定める ver 1.0

■作成者
キュウブ

■概要
ユニットのカスパラに
maxLv:<レベル最大値>
と記載するとクラスやコンフィグ2を無視してこの値がレベルの上限値になります。
つまり、ユニット別にレベルの上限を設定できるようになります。

■更新履歴
ver 1.0 (2021/03/17)
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
	var _Miscellaneous_getMaxLv = Miscellaneous.getMaxLv;
	Miscellaneous.getMaxLv = function(unit) {
		return typeof unit.custom.maxLv === 'number' ? unit.custom.maxLv : _Miscellaneous_getMaxLv.call(this, unit);
	};
})();
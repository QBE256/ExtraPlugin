/*--------------------------------------------------------------------------
　敵、同盟軍の所持品の耐久を無限にする ver 1.0

■作成者
キュウブ

■概要
敵、同盟軍の所持品の耐久が無限になります。
※注意事項
1.盗んだ場合は使用回数無限のまま手に入ってしまいます（ドロップアイテムの場合は通常の耐久に戻るので問題無し）
2.自軍ユニットに寝返った場合も使用回数無限のまま手に入ってしまいます
ユニットのカスパラに
isDisabledUnlimitedItem:true
と指定しておくと該当ユニットの所持品は通常の耐久値になるので、寝返り系ユニットには仕込んでおくことを推奨

■更新履歴
ver1.0 2021/4/5
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

--------------------------------------------------------------------------*/
(function(){
	var _UnitProvider_setupFirstUnit = UnitProvider.setupFirstUnit;
	UnitProvider.setupFirstUnit = function(unit) {
		var item, maxUnitItemCount;
		_UnitProvider_setupFirstUnit.call(this, unit);

		if (unit.getUnitType() === UnitType.PLAYER || unit.custom.isDisabledUnlimitedItem === true) {
			return;
		}

		maxUnitItemCount = DataConfig.getMaxUnitItemCount();
		for (var index = 0; index < maxUnitItemCount; index++) {
			if (item = UnitItemControl.getItem(unit, index)) {
				item.setLimit(0);
			}
		}
	};
})();
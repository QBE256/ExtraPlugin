/*--------------------------------------------------------------------------
　無音レベルアップを防止する ver 1.0

■作成者
キュウブ

■概要
レベルアップした時に最低でも一つだけパラメータが上昇するようになります。

■仕様
・HP,力,魔力,技,速さ,幸運,守備,魔防の8つのパラメータしか考慮しない（移動力や熟練度は参照しない）
・成長率0%のパラメータが存在する場合は結局上昇しない可能性がある
・カンストしているパラメータを上昇させようとして、実質上昇しない可能性がある

■使い方
導入するだけ

■更新履歴
ver 1.0 (2019/10/9)
初版作成

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

// HP,力,魔力,技,速さ,幸運,守備,魔防の8つのパラメータだけを参照して無音かどうか判定する 
var REFERENCE_PARAMETER_COUNT = 8;
(function(){
	var alias = ExperienceControl._createGrowthArray;
	ExperienceControl._createGrowthArray = function(unit) {
		var forceGrowthIndex, growthRate, weapon;
		var growthArray = alias.call(this, unit);

		for (var i = 0; i < REFERENCE_PARAMETER_COUNT; i++) {
			if (growthArray[i] !== 0) {
				return growthArray;
			}
		}

		forceGrowthIndex = root.getRandomNumber() % REFERENCE_PARAMETER_COUNT;
		weapon = ItemControl.getEquippedWeapon(unit);
		growthRate = ParamGroup.getGrowthBonus(unit, forceGrowthIndex) + ParamGroup.getUnitTotalGrowthBonus(unit, forceGrowthIndex, weapon);

		if (growthRate > 0) {
			growthArray[forceGrowthIndex] = 1;
		}

		return growthArray;
	};

})();
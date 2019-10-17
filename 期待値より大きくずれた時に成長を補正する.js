/*--------------------------------------------------------------------------
　期待値より大きくずれた時に成長を補正する ver 1.0

■作成者
キュウブ

■概要
レベルアップ時に期待値より大きく劣っているパラメータは確定で上昇、
大きく優っているパラメータは上昇しないように成長に補正をかけます。

※ 成長率が負の値になる場合は考慮していません
※ 期待値計算は 初期値 + ユニットの素の現成長率 * レベルアップ回数 でのみ算出されます。
   よって、クラス成長率や各種武器による成長率までは考慮しません。

■使い方
35行目のGROWTH_THRESHOLDの値を設定して導入するだけ
設定した値の分だけ期待値と実数値がずれると強制的に成長したり、止まったりします。



例:GROWTH_THRESHOLDが3で、
1.成長率が50%の時
実数値-期待値>=3であれば次のレベルアップでパラメータが確実に1上昇する
期待値-実数値<=3であれば次のレベルアップでパラメータが上昇しない

2.成長率が150%の時
実数値-期待値>=3であれば次のレベルアップでパラメータが確実に2上昇する
期待値-実数値<=3であれば次のレベルアップでパラメータが確実に1上昇する (※100%以上の場合は上昇はする)



■更新履歴
ver 1.0 (2019/10/18)
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
var GROWTH_THRESHOLD = 3;

(function(){
	var alias = ExperienceControl._createGrowthArray;
	ExperienceControl._createGrowthArray = function(unit) {
		var experienceValue, realValue, gapValue, growthBonusValue;
		var growthArray = alias.call(this, unit);
		var weapon = ItemControl.getEquippedWeapon(unit);
		var baseUnit = root.getBaseData().getPlayerList().getDataFromId(unit.getId());

		// カスタムパラメータを使ってユニットのレベルアップ回数を計測する
		if (typeof unit.custom.levelUpCount === 'number') {
			unit.custom.levelUpCount++;
		}
		else {
			// カスタムパラメータが無い場合は導入する
			unit.custom.levelUpCount = 0;
		}

		for (var i = 0; i < ParamGroup.getParameterCount(); i++) {

			experienceValue = unit.custom.levelUpCount * unit.getGrowthBonus().getAssistValue(i) / 100 + baseUnit.getParamValue(i);
			realValue = unit.getParamValue(i);
			gapValue = realValue - experienceValue;
			growthBonusValue = (ParamGroup.getGrowthBonus(unit, i) + ParamGroup.getUnitTotalGrowthBonus(unit, i, weapon)) / 100;

			if (gapValue >= GROWTH_THRESHOLD) {
				growthArray[i] = Math.floor(growthBonusValue);
			}
			else if (gapValue * -1 >= GROWTH_THRESHOLD) {
				growthArray[i] = Math.ceil(growthBonusValue);
			}
		}

		return growthArray;
	};

})();
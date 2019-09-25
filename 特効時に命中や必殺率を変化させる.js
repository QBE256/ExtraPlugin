/*--------------------------------------------------------------------------------
特効時に命中や必殺を変化させる ver 1.0

■作成者
キュウブ

■概要
特攻時に命中や必殺率が変化する武器を作成できます。

■使い方
対象武器のカスパラに
必殺補正はeffectiveCritical:<補正値>
命中補正はeffectiveHit:<補正値>
と記載する。

※攻撃力を変化させたくない時は特定の武器の特効係数を変化させるスクリプトを併用してください

■更新履歴
ver 1.0 (2019/9/22)
5chに晒す


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
	var alias1 = CriticalCalculator.calculateSingleCritical;
	CriticalCalculator.calculateSingleCritical = function(active, passive, weapon, totalStatus) {
		var effectiveCritical = 0;
		if (DamageCalculator.isEffective(active, passive, weapon, false, false) && typeof weapon.custom.effectiveCritical === 'number') {
			effectiveCritical = weapon.custom.effectiveCritical;
		}
		return alias1.call(this, active, passive, weapon, totalStatus) + effectiveCritical;
	}
	var alias2 = HitCalculator.calculateSingleHit;
	HitCalculator.calculateSingleHit = function(active, passive, weapon, totalStatus) {
		var effectiveHit = 0;
		if (DamageCalculator.isEffective(active, passive, weapon, false, false) && typeof weapon.custom.effectiveHit === 'number') {
			effectiveHit = weapon.custom.effectiveHit;
		}
		return alias2.call(this, active, passive, weapon, totalStatus) + effectiveHit;
	};
})();
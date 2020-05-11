/*
　杖の経験値でユニット同士のレベル差補正をかける ver1.0

[作成者]
キュウブ

[概要]
自分よりレベルの高いユニットに杖を使用すると取得経験値が多くなり、
低いユニットに使用すると減少するようになります。
補正の計算は敵を倒す時と同じです。

[補足]
杖魔法リアル戦闘スクリプト.jsのリアル戦闘化機能と併用される場合は
NormalWandOrderBuilder._calculateExperienceの返り値を
ExperienceCalculator.calculateItemExperience(virtualActive.unitSelf, virtualPassive.unitSelf,virtualActive.weapon.getExp());
に変更してください。

[更新履歴]
ver1.0 2020/5/11
公開

[対応バージョン]
SRPG Studio Version:1.161

[規約]
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。
・クレジット明記無し　OK (明記する場合は"キュウブ"でお願いします)
・再配布、転載　OK (バグなどがあったら修正できる方はご自身で修正版を配布してもらっても構いません)
・wiki掲載　OK
・SRPG Studio利用規約は遵守してください。


*/

ExperienceCalculator.calculateItemExperience = function(unit, targetUnit, exp) {
	var differentLevel, correction;
	
	differentLevel = targetUnit.getLv() - unit.getLv();

	if (differentLevel > 0) {
		correction = differentLevel * 4;
	}
	else {
		correction = differentLevel * 2;
	}

	exp += correction;

	if (unit.getClass().getClassRank() !== targetUnit.getClass().getClassRank()) {
		if (unit.getClass().getClassRank() === ClassRank.LOW) {
			exp = Math.floor(exp * (DataConfig.getLowExperienceFactor() / 100));
		}
		else {
			exp = Math.floor(exp * (DataConfig.getHighExperienceFactor() / 100));
		}
	}

	return ExperienceCalculator.getBestExperience(unit, exp);	
};

(function(){
	var alias = ItemExpFlowEntry._getItemExperience;
	ItemExpFlowEntry._getItemExperience = function(itemUseParent) {
		var itemTargetInfo = itemUseParent.getItemTargetInfo();
	
		if (itemTargetInfo.item.isWand() && itemTargetInfo.targetUnit) {
			return ExperienceCalculator.calculateItemExperience(itemTargetInfo.unit, itemTargetInfo.targetUnit, itemTargetInfo.item.getExp());
		}
		else {
			return alias.call(this, itemUseParent);
		}
	};
})();
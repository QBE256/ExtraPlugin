/*--------------------------------------------------------------------------
　相手を倒せなくなるスキル ver 1.0

■作成者
キュウブ

■概要
相手を倒せなくなるスキルを設定します。

理不尽な増援達に一瞬だけ持たせておくとか、イベント敵や特殊武器など用途は色々あるはず・・・

■設定の仕方
生き残りスキルに対して、{isActive:true}というカスパラを設定するだけでOK
※従来の生き残りスキルと同様、HP1で相手が耐えるのか、倒されそうな場合確定回避するのか選択できます。

■更新履歴
ver 1.0 (2020/06/25)
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
AttackEvaluator.PassiveAction._getSurvivalValue = function(virtualActive, virtualPassive, attackEntry) {
	var skill;
	var active = virtualActive.unitSelf;
	var passive = virtualPassive.unitSelf;
		
	if (passive.isImmortal()) {
		return SurvivalValue.AVOID;
	}
		
	skill = SkillControl.checkAndPushSkill(passive, active, attackEntry, false, SkillType.SURVIVAL);
	if (skill !== null && skill.custom.isActive !== true) {
		return skill.getSkillValue();
	}
	
	skill = SkillControl.checkAndPushSkill(active, passive, attackEntry, true, SkillType.SURVIVAL);
	if (skill !== null && skill.custom.isActive === true) {
		return skill.getSkillValue();
	}

	return -1;
};
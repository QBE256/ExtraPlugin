/*--------------------------------------------------------------------------
　スキル:虚無の呪い(敵側経験値補正スキル) ver 1.0

■作成者
キュウブ

■概要
FE暗夜の一部の敵が持ってた経験値を0に補正するスキルが作れます

■使い方
1.経験値上昇スキルのカスパラに下記のカスパラを設定する
isEnemyExperienceFactorSkill:true

2.経験値の上昇率を0%にする

※タイトルではわかりやすく虚無の呪いとしましたが、上昇率を200%などにするともらえる経験値が増えます。

■更新履歴
ver 1.0 (2019/11/11)
初版作成

■対応バージョン
SRPG Studio Version:1.206

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
	ExperienceCalculator._getEnemeyExperienceFactor = function(unit) {
		var skill;
		var factor = 100;

		skill = SkillControl.getBestPossessionSkill(unit, SkillType.GROWTH);
		if (skill !== null && skill.custom.isEnemyExperienceFactorSkill === true) {
			factor = skill.getSkillValue();
		}
		
		return factor / 100;
	};

	ExperienceCalculator._getExperienceFactor = function(unit) {
		var skill;
		var factor = 100;
		var option = root.getMetaSession().getDifficulty().getDifficultyOption();
		
		if (option & DifficultyFlag.GROWTH) {
			factor = 200;
		}
		
		skill = SkillControl.getBestPossessionSkill(unit, SkillType.GROWTH);
		if (skill !== null && skill.custom.isEnemyExperienceFactorSkill !== true) {
			factor = skill.getSkillValue();
		}
		
		return factor / 100;
	};

	ExperienceCalculator.calculateExperience = function(data) {
		var exp;
		
		if (data.passiveDamageTotal === 0) {
			exp = this._getNoDamageExperience(data);
		}
		else if (data.passiveHp <= 0) {
			exp = this._getVictoryExperience(data);
		}
		else {
			exp = this._getNormalValue(data);
		}
		
		return Math.floor(this.getBestExperience(data.active, exp) * this._getEnemeyExperienceFactor(data.passive));
	};

})();
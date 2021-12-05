/*
	敵の武器選択ロジックがランダムになる ver1.1

	■作成者
	キュウブ

	CPUのカスタムパラメータにisRandomSelect:trueと記しておくと
	攻撃時の武器を選択がランダムになる
	※コンフィグでダメージ0、命中率0を無視する設定だけは有効

	スコアは30点～80点のいずれかになる


*/
(function(){
	var _AIScorer_Weapon__getTotalScore = AIScorer.Weapon._getTotalScore;
	AIScorer.Weapon._getTotalScore = function(unit, combination) {
		if (unit.custom.isRandomSelect !== true) {
			return _AIScorer_Weapon__getTotalScore.apply(this, arguments);
		}
		if (
			!DataConfig.isAIDamageZeroAllowed() &&
			this._getDamageScore(unit, combination) === 0
		) {
			return -1;
		}
		if (
			!DataConfig.isAIHitZeroAllowed() &&
			this._getHitScore(unit, combination)
		) {
			return -1;
		}

		return root.getRandomNumber() % 50 + 30;
	};
})();
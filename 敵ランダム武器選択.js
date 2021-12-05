/*
	敵の武器選択ロジックがランダムになる

	■作成者
	キュウブ

	CPUスコア計算でダメージ量や命中率などを無視して、トータルスコアがランダムになる
	よって、どの武器を選択するかもランダムになる
	※コンフィグでダメージ0、命中率0を無視する設定だけは有効

	スコアは30点～80点のいずれかになる

	
*/
AIScorer.Weapon._getTotalScore = function(unit, combination) {
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
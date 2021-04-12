/*--------------------------------------------------------------------------
　敵AIを賢くする ver 1.0

■作成者
キュウブ

■概要
敵AIの挙動を色々変更します(自作用のを軽量化してアレンジしたもの)。

1.HPの割合だけでダメージ量を判断するようになる
デフォルトではコンフィグ2の最大HP上限に応じて、ダメージ量の重みが変わる仕様になっていますがこれを無視します。
・既に何%のダメージを受けているのか
・今後何%のダメージを受けるのか
この2点でダメージ量を判断するようになります。

2.死亡判定はダメージの期待値で判断するようになる
デフォルトではダメージ量だけで敵を倒せるかどうかの判定を行ない、狙いやすくなるよう補正がかかりますが、
命中率と必殺率を考慮したダメージの期待値量で判定を行うようにします。
つまり、低命中だが攻撃力が大幅に高い武器が選択されやすくなるという事はなくなります。

3.反撃を考慮するようになる
デフォルトでは反撃を考慮せずに使用する武器を選択してしまいますが、考慮するようにAIを変更します。
スコアが一定以下で反撃を受ける場合は、スコアを半減するようになります。
つまり、
・敵を追いつめるのが難しい場合は、反撃できない武器を選びやすくする
・押しきれそうな場合は、反撃上等で武器を選択する
というAIになります。

※ここらへんの細かい閾値はSCORE_SETTINGのCounterThresholdやCounterCorrectionで変更可能です。

4.ヘイト効果のある特殊ステート
カスタムパラメータに hateParameter:<値> が設定されたステートをユニットに付与しておくと
値の分だけ狙われやすくなります。
負の値にした場合は逆に狙われにくくなります。

さらに isEnableHidden:true というカスパラを含めておくと、
一定以上スコアが低い場合は単身で敵の目の前にいても狙われなくなります。

5.なるべくとどめをささないように行動するステート
カスタムパラメータに isImmortalAI:true が設定されたステートを敵ユニットに付与しておくと
期待値でとどめをさせそうな時にあえて狙う事をやめるようになります。
※あくまでも期待値なので、とどめをさせないと判定して攻撃しても上振れで倒してしまう可能性はあります。

■更新履歴
ver 1.0 (2021/04/13)
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
var SCORE_SETTING = {
	CounterThreshold: 70, // スコアがこの値より低い時に反撃を受け手しまう場合は
	CounterCorrection: 2, // CounterCorrectionの分だけスコアを除算する
	DeathBonus: 100       // ダメージ期待値で相手にとどめをさせる場合のスコアボーナス
};

AIScorer.Weapon.getScore = function(unit, combination) {
	var prevItemIndex;
	var score = 0;
		
	if (combination.item === null || !combination.item.isWeapon()) {
		return 0;
	}
		
	// combination.itemを一時的に装備する
	prevItemIndex = this._setTemporaryWeapon(unit, combination);
	if (prevItemIndex === -1) {
		return 0;
	}
		
	score = this._getTotalScore(unit, combination);

	// とどめをさせそうに無い時に反撃を受ける場合はスコアを半減する
	if (score < SCORE_SETTING.CounterThreshold && AttackChecker.isCounterattack(unit, combination.targetUnit)) {
		score = Math.floor(score / SCORE_SETTING.CounterCorrection);
	}
		
	// combination.itemの装備を解除する
	this._resetTemporaryWeapon(unit, combination, prevItemIndex);
		
	if (score < 0) {
		return AIValue.MIN_SCORE;
	}

	return score + this._getPlusScore(unit, combination);
};

AIScorer.Weapon._getTotalScore = function(unit, combination) {
	var totalScore = 0;
	var damageScore, hitScore, criticalScore, currentHpRate, stateScore, expectedDamage, hateState;

	currentHpRate = this._getCurrentHpRate(unit, combination);

	damageScore = this._getDamageScore(unit, combination);
	if (damageScore === 0 && !DataConfig.isAIDamageZeroAllowed()) {
		return AIValue.MIN_SCORE;
	}
		
	hitScore = this._getHitScore(unit, combination);
	if (hitScore === 0 && !DataConfig.isAIHitZeroAllowed()) {
		return AIValue.MIN_SCORE;
	}
		
	criticalScore = this._getCriticalScore(unit, combination);
	stateScore = this._getStateScore(unit, combination);
	// ダメージの期待値計算を行う。クリティカルヒットによる不確定要素も含む
	expectedDamageRate = damageScore * hitScore + 
						damageScore * (DataConfig.getCriticalFactor() / 100) * hitScore * criticalScore;
	// ダメージ期待値と既に受けているダメージ量が最大HPの100%を超える場合は敵を倒せる可能性が高いと判断する
	// よって、スコアを加算する
	// ただし、isImmortalAIというカスパラを持っているユニットである場合は、あえて対象の敵を狙うのをやめる
	if ((totalScore = expectedDamageRate + currentHpRate) >= 100) {
		if (StateControl.getImmortalAIState(unit)) {
			return AIValue.MIN_SCORE;
		}
		else {
			totalScore += SCORE_SETTING.DeathBonus;
		}
	}

	totalScore += stateScore;

	// 相手が挑発ステートを持っていた場合、その分だけスコアを加算する
	if (hateState = StateControl.getHateControlState(combination.targetUnit)) {
		totalScore += hateState.custom.hateParameter;

		// 挑発ステートにマイナス補正をかけている場合はスコアが負の値になる可能性があるので補正する
		// isEnableHiddenがtrueで負の値になった場合は潜伏可能状態となり、狙われる事がなくなる
		if (hateState.custom.isEnableHidden === true) {
			totalScore = totalScore < 0 ? AIValue.MIN_SCORE : totalScore;
		}
		else {
			totalScore = totalScore < 0 ? 0 : totalScore;
		}
	}
		
	return Math.floor(totalScore);
};

// 何%ダメージを受けるのか でダメージスコアを算出する
// ユニットの最大HPに対する割合で見るので、SRPGStudioのコンフィグ2のHP上限の大きさによって重みが変わる仕様を無視するようになる
AIScorer.Weapon._getDamageScore = function(unit, combination) {
	var damage = this._getDamage(unit, combination);
	var maxHp = ParamBonus.getMhp(combination.targetUnit);

	return damage / maxHp * 100;
};

// 現在何%ダメージを受けているのか算出する
// 既に受けているダメージがでかい程狙われやすくなる
AIScorer.Weapon._getCurrentHpRate = function(unit, combination) {
	var maxHp = ParamBonus.getMhp(combination.targetUnit);
	
	return (maxHp - combination.targetUnit.getHp()) / maxHp * 100;
};

// 命中スコアは命中率をそのまま返す
AIScorer.Weapon._getHitScore = function(unit, combination) {
	return HitCalculator.calculateHit(unit, combination.targetUnit, combination.item, null, null) / 100;
};

// クリティカルスコアはクリティカル率をそのまま返す
AIScorer.Weapon._getCriticalScore = function(unit, combination) {
	return CriticalCalculator.calculateCritical(unit, combination.targetUnit, combination.item, null, null) / 100;
};

StateControl.getHateControlState = function(unit) {
	var i, turnState;
	var list = unit.getTurnStateList();
	var count = list.getCount();

	for (i = 0; i < count; i++) {
		turnState = list.getData(i);
		if (typeof turnState.getState().custom.hateParameter === 'number') {
			return turnState.getState();
		}
	}

	return 0;
};

StateControl.getImmortalAIState = function(unit) {
	var i, turnState;
	var list = unit.getTurnStateList();
	var count = list.getCount();

	for (i = 0; i < count; i++) {
		turnState = list.getData(i);
		if (turnState.getState().custom.isImmortalAI === true) {
			return turnState.getState();
		}
	}

	return null;
};
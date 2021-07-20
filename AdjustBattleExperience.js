/*--------------------------------------------------------------------------
　戦闘回数が増える程、同じ敵からの未撃破取得経験値を減少させる ver 1.0

■作成者
キュウブ

■概要
このスクリプトを導入すると
戦闘回数が増えるほど同じ敵からの未撃破取得経験値が減少していきます(※撃破経験値は変化しません)。
特定の敵をわざと倒さずに戦闘を繰り返して、永続的に経験値を稼ぐ事ができなくなります。

■使い方
45行目のThresholdBattleCountを設定します。この戦闘回数分だけ未撃破経験値が得られるようになります。
経験値は (ThresholdBattleCount - 戦闘回数 + 1)÷ThresholdBattleCount 倍だけ変化します。

例えば、ThresholdBattleCount=5の時
特定の敵Aに対して未撃破経験値がナッシュが10、ランバートが20の時は、

ナッシュが敵Aと戦闘を行った時->1回目なので補正値は1。未撃破経験値は10*1=10
次にランバートが戦闘を行った時->2回目なので補正値は0.8。未撃破経験値は20*0.8=16
次にナッシュが戦闘を行った時->3回目なので補正値は0.6。未撃破経験値は10*0.6=6
次にナッシュが戦闘を行った時->4回目なので補正値は0.4。未撃破経験値は10*0.4=4
次にランバートが戦闘を行った時->5回目なので補正値は0.2。未撃破経験値は20*0.2=4
以降、補正値は0。誰が敵Aと戦闘しても撃破しない限り取得経験値は0
となります。

■更新履歴
ver 1.0 (2021/7/21)
公開 

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

var ThresholdBattleCount = 5;// 戦闘回数の閾値。この数値の回数分だけ戦闘をこなすと得られる経験値が0になる。

ExperienceCalculator.calculateExperience = function(data) {
	var exp;
		
	// activeHpとpassiveHpは、ユニットが死亡している場合にマイナスの値が設定されることもある。
	// つまり、0を超えて格納されることがある。
	if (data.passiveDamageTotal === 0) {
		exp = Math.floor(this._getNoDamageExperience(data) * this._getBattleCountCorrection(data));
	}
	else if (data.passiveHp <= 0) {
		exp = this._getVictoryExperience(data);
	}
	else {
		exp = Math.floor(this._getNormalValue(data) * this._getBattleCountCorrection(data));
	}
		
	return this.getBestExperience(data.active, exp);
};

ExperienceCalculator._getBattleCountCorrection = function(data) {
	var correction = 1;

	if (typeof data.passive.custom.battleCount !== 'number') {
		data.passive.custom.battleCount = 1;
	}
	else {
		data.passive.custom.battleCount++;
	}
	correction = (ThresholdBattleCount - (data.passive.custom.battleCount - 1)) / ThresholdBattleCount;
	return correction > 0 ? correction : 0;
};
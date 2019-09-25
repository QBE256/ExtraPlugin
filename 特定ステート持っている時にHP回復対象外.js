/*--------------------------------------------------------------------------
　特定ステート持っているとHP単体回復アイテム・杖が選択できなくなる ver 1.0

■作成者
キュウブ

■使い方
ステートのカスパラに
isIgnoreHpRecovery:true
と添えるだけ

■更新履歴
ver 1.0 (2017/10/18)
初版

■対応バージョン
SRPG Studio Version:1.158

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
	var tempFunctions = {
		RecoveryItemAvailability: {
			isItemAllowed: RecoveryItemAvailability.isItemAllowed
		},
		RecoveryItemAI: {
			_getScore: RecoveryItemAI._getScore
		}
	};

	RecoveryItemAvailability.isItemAllowed = function(unit, targetUnit, item) {
		return tempFunctions.RecoveryItemAvailability.isItemAllowed.call(this, unit, targetUnit, item) && StateControl.isIgnoreHpRecovery(targetUnit) === false;
	};

	RecoveryItemAI._getScore = function(unit, combination) {

		if (StateControl.isIgnoreHpRecovery(combination.targetUnit) === false) {
			return AIValue.MIN_SCORE;
		}

		return tempFunctions.RecoveryItemAI._getScore.call(this, unit, combination);
	};
})();

StateControl.isIgnoreHpRecovery = function(unit) {
	var list = unit.getTurnStateList();
	var count = list.getCount();
	var state;

	for (var index = 0; index < count; index++) {
		state = list.getData(index).getState();
		if (state.custom.isIgnoreHpRecovery === true) {
			return true;
		}		
	}
	return false;	
};
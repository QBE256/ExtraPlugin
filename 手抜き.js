// AIカスタムで"PriorityWait"をキーワードに設定する
// 移動後攻撃不可武器だけを持っている敵ならこのAIの方が向いている
// 待機時に攻撃できるなら待機したまま攻撃&できない時は移動して攻撃
AutoActionBuilder._buildPriorityWaitAction = function(unit, autoActionArray) {
	var combination;

	// 現在位置から攻撃可能なユニットの中で、最も優れた組み合わせを取得する
	combination = CombinationManager.getWaitCombination(unit);

	if (combination === null) {
		combination = CombinationManager.getApproachCombination(unit, true);
	}

	if (combination === null) {
		return this._buildEmptyAction();
	}
	else {
		this._pushGeneral(unit, autoActionArray, combination);
	}
		
	return true;
};

(function(){

	var alias = AutoActionBuilder.buildCustomAction;
	AutoActionBuilder.buildCustomAction = function(unit, autoActionArray, keyword) {

		if (keyword === 'PriorityWait') {
			return this._buildPriorityWaitAction(unit, autoActionArray);
		}
		else {
			return alias.call(this, unit, autoActionArray, keyword);
		}
	};
})();
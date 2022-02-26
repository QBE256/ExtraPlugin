// 使い方
// 1.持続99ターンで変化させたいステータスの補正値が-99、ターンボーナス減少値が1のステートを作る
// 2.カスタムパラメータで overlappingTurn:3 という数値を入れる
// 以上の設定を入れると
// 一度付与した時に 持続3ターン 補正値-3
// もう一度付与すると 持続残りターン数+3ターン 補正値 -3 + <残り補正値>
// といった挙動を行うステートが設定できる


(function() {
	var _StateControl_arrangeState = StateControl.arrangeState;
	StateControl.arrangeState = function(unit, state, increaseType) {
	var turnState, currentTurn;
	var list = unit.getTurnStateList();
	var count = list.getCount();
	var editor = root.getDataEditor();
		
	if (increaseType === IncreaseType.INCREASE && typeof state.custom.overlappingTurn === 'number') {
		turnState = this.getTurnState(unit, state);
		if (turnState !== null) {
			currentTurn = turnState.getTurn();
			turnState.setTurn(currentTurn + state.custom.overlappingTurn);
		}
		else {
			if (count < DataConfig.getMaxStateCount()) {
				editor.addTurnStateData(list, state);
				turnState = this.getTurnState(unit, state);
				turnState.setTurn(state.custom.overlappingTurn);
			}
		}
		return;
	}
	else {
		_StateControl_arrangeState.apply(this, arguments);
	}
};

})();
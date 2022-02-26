// カスパラにisOverlapping:trueと記したステートは重複させる事が可能になる
// ただし、1ユニットが持てるステートの上限数(6つ)を超えて持つことはできないので注意
StateControl.arrangeState = function(unit, state, increaseType) {
	var turnState;
	var list = unit.getTurnStateList();
	var count = list.getCount();
	var editor = root.getDataEditor();
		
	if (increaseType === IncreaseType.INCREASE) {
		turnState = this.getTurnState(unit, state);
		if (turnState.custom.isOverlapping !== true && turnState !== null) {
			// 既にステートが追加されている場合は、ターン数値を更新する
			turnState.setTurn(state.getTurn());
		}
		else {
			if (count < DataConfig.getMaxStateCount()) {
				editor.addTurnStateData(list, state);
			}
		}
	}
	else if (increaseType === IncreaseType.DECREASE) {
		editor.deleteTurnStateData(list, state);
	}
	else if (increaseType === IncreaseType.ALLRELEASE) {
		editor.deleteAllTurnStateData(list);
	}
};
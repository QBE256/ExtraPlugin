/*--------------------------------------------------------------------------
　盗めるアイテムが存在しない時は盗むコマンド非表示 ver1.0

■作成者
キュウブ

■概要
デフォルトでは速さの条件を満たしてさえいれば「盗む」コマンドが出現します。
このスクリプトを導入すると速さに加えて盗めるアイテムを対象が持ってない限りコマンドが出現しなくなります。

■更新履歴
ver 1.0 (2022/03/24)
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

(function () {
	UnitCommand.Steal._getTradeArray = function (unit) {
		var i, x, y, targetUnit, skill, stealFlag;
		var indexArray = [];

		skill = SkillControl.getBestPossessionSkill(unit, SkillType.STEAL);
		if (skill === null) {
			return indexArray;
		}

		// 「盗む」がアイテムスキルで生じている可能性もあり、
		// 交換後にスキルを取得できるとは限らないため変数に保存しておく。
		this._exp = skill.getSkillSubValue();

		for (i = 0; i < DirectionType.COUNT; i++) {
			x = unit.getMapX() + XPoint[i];
			y = unit.getMapY() + YPoint[i];
			targetUnit = PosChecker.getUnitFromPos(x, y);
			if (
				targetUnit !== null &&
				targetUnit.getUnitType() === UnitType.ENEMY
			) {
				stealFlag = skill.getSkillValue();
				if (
					Miscellaneous.isStealEnabled(unit, targetUnit, stealFlag) &&
					Miscellaneous.isStealableItem(unit, targetUnit, stealFlag)
				) {
					indexArray.push(CurrentMap.getIndex(x, y));
				}
			}
		}

		return indexArray;
	};

	var _StealItemSelection_isPosSelectable =
		StealItemSelection.isPosSelectable;
	StealItemSelection.isPosSelectable = function () {
		var targetUnit = this._posSelector.getSelectorTarget(true);

		if (targetUnit === null) {
			return false;
		}
		var isStealableUnitState = _StealItemSelection_isPosSelectable.apply(
			this,
			arguments
		);
		var isStealableItem = Miscellaneous.isStealableItem(
			this._unit,
			targetUnit,
			this._item.getStealInfo().getStealFlag()
		);
		return isStealableUnitState && isStealableItem;
	};
})();

// Miscellaneous.isStealEnabledは「盗む側」が盗みを実行できる状態にあるか?という判定に使われている
// こちらは相手側に盗み可能なアイテムが存在するか判定するための関数となる
Miscellaneous.isStealableItem = function (unit, targetUnit, value) {
	var itemCount = UnitItemControl.getPossessionItemCount(targetUnit);
	for (var index = 0; index < itemCount; index++) {
		var item = UnitItemControl.getItem(targetUnit, index);
		if (!Miscellaneous.isStealTradeDisabled(unit, item, value)) {
			return true;
		}
	}
	return false;
};

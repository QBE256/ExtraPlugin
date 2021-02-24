/*--------------------------------------------------------------------------
　自軍ターンで敵を操作できるステート ver 1.0

■作成者
キュウブ

■概要
自軍ターンで対象ステートを持った敵を自由に動かす事が可能になります。
つまり、暴走ステートとは異なりこちらの指示に従います。

ゲームバランスが崩壊しかねないのでコマンドは
・攻撃(同士討ちが可能。自軍、同盟軍と戦わせる事はできない)
・待機
の二つしか扱えないよう制限しています。
他のコマンドも扱えるようにしたい場合はこのプラグインを頑張って改変してください。

また、このステートは敵軍に与える事前提で作られており、
自軍、同盟軍側が持っていても一切効果がありません。

また、行動させると自軍ターンにも関わらず敵がアクティブユニットとして設定されます。
想定外のイベントを発生させないように注意してください。

■使い方
ステートのカスパラにisManipulate:trueと記入すればOK
※行動不能属性を入れると自軍ターンでも操作不能となってしまうので注意

■更新履歴
ver 1.0 (2021/2/24)
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

MapSequenceArea._isTargetMovable = function() {
	if (!StateControl.isTargetControllable(this._targetUnit) || this._targetUnit.isWait()) {
		return false;
	}
	else if (this._targetUnit.getUnitType() === UnitType.PLAYER) {
		return true;			
	}
	else {
		return StateControl.hasManipulateState(this._targetUnit);
	}
};

StateControl.hasManipulateState = function(unit) {
	var state, stateList, count;

	if (unit.getUnitType() !== UnitType.ENEMY) {
		return false;
	}
	stateList = unit.getTurnStateList();
	count = stateList.getCount();
	for (var index = 0; index < count; index++) {
		state = stateList.getData(index).getState();
		if (state.custom.isManipulate === true) {
			return true;
		}
	}
	return false;
};

// 元は自軍勢力前提の処理となっているので
// this._targetUnitが敵勢力だった場合の対応を追加
MapSequenceCommand._doLastAction = function() {
	var i, count;
	var unit = null;
	var unitType = this._targetUnit.getUnitType();

	if (unitType === UnitType.PLAYER) {
		list = PlayerList.getSortieList();
	}
	else {
		list = EnemyList.getAliveList();
	}
	count = list.getCount();
		
	// コマンドの実行によってユニットが存在しなくなる可能性も考えられるため確認
	for (i = 0; i < count; i++) {
		if (this._targetUnit === list.getData(i)) {
			unit = this._targetUnit;
			break;
		}
	}
		
	// ユニットが死亡などしておらず、依然として存在するか調べる
	if (unit !== null) {
		if (this._unitCommandManager.getExitCommand() !== null) {
			if (!this._unitCommandManager.isRepeatMovable()) {
				// 再移動が許可されていない場合は、再移動が発生しないようにする
				this._targetUnit.setMostResentMov(ParamBonus.getMov(this._targetUnit));
			}
				
			// ユニットは何らかの行動をしたため、待機状態にする
			this._parentTurnObject.recordPlayerAction(true);
			return 0;
		}
		else {
			// ユニットは行動しなかったため、位置とカーソルを戻す
			this._parentTurnObject.setPosValue(unit);
		}
			
		// 向きを正面にする
		unit.setDirection(DirectionType.NULL);
	}
	else {
		this._parentTurnObject.recordPlayerAction(true);
		return 1;
	}
		
	return 2;
};

// getAttackIndexArrayへの引数を追加
 AttackChecker.isUnitAttackable = function(unit) {
	var i, item, indexArray;
	var count = UnitItemControl.getPossessionItemCount(unit);
	
	for (i = 0; i < count; i++) {
		item = UnitItemControl.getItem(unit, i);
		if (item !== null && ItemControl.isWeaponAvailable(unit, item)) {
			indexArray = this.getAttackIndexArray(unit, item, true, StateControl.hasManipulateState(unit));
			if (indexArray.length !== 0) {
				return true;
			}
		}
	}
	return false;
};

// 第4引数にManipulateフラグを追加
AttackChecker.getAttackIndexArray = function(unit, weapon, isSingleCheck, isManipulate) {
	var i, index, x, y, targetUnit;
	var indexArrayNew = [];
	var indexArray = IndexArray.createIndexArray(unit.getMapX(), unit.getMapY(), weapon);
	var count = indexArray.length;
	
	isManipulate = isManipulate === undefined ? false : isManipulate;
		
	for (i = 0; i < count; i++) {
		index = indexArray[i];
		x = CurrentMap.getX(index);
		y = CurrentMap.getY(index);
		targetUnit = PosChecker.getUnitFromPos(x, y);
		if (targetUnit !== null && unit !== targetUnit) {
			if (
				(!isManipulate && FilterControl.isReverseUnitTypeAllowed(unit, targetUnit)) ||
				(isManipulate && FilterControl.isUnitTypeAllowed(unit, targetUnit))
			) {
				indexArrayNew.push(index);
				if (isSingleCheck) {
					return indexArrayNew;
				}
			}
		}
	}
		
	return indexArrayNew;
};

// getAttackIndexArrayへの引数を追加
WeaponSelectMenu._isWeaponAllowed = function(unit, item) {
	var indexArray;
		
	if (!ItemControl.isWeaponAvailable(unit, item)) {
		return false;
	}
	
	indexArray = AttackChecker.getAttackIndexArray(unit, item, true, StateControl.hasManipulateState(unit));
		
	return indexArray.length !== 0;
};

// getAttackIndexArrayへの引数を追加
UnitCommand.Attack._getIndexArray = function(unit, weapon) {

	return AttackChecker.getAttackIndexArray(unit, weapon, false, StateControl.hasManipulateState(unit));
};

(function(){
	var temp1 = UnitCommand.configureCommands;
	UnitCommand.configureCommands = function(groupArray) {
		if (StateControl.hasManipulateState(this.getListCommandUnit())) {
			groupArray.appendObject(UnitCommand.Attack);
			groupArray.appendObject(UnitCommand.Wait);
		}
		else {
			temp1.call(this, groupArray);
		}
	};

	var temp2 = PlayerTurn._checkAutoTurnEnd;
	PlayerTurn._checkAutoTurnEnd = function() {
		var unit;
		var list = EnemyList.getAliveList();
		var count = list.getCount();
		var isTurnEnd = true;

		for (var index = 0; index < count; index++) {
			unit = list.getData(index);
			if (!StateControl.hasManipulateState(unit)) {
				continue;
			}

			if (!StateControl.isTargetControllable(unit)) {
				continue;
			}
			
			if (!unit.isWait()) {
				isTurnEnd = false;
				break;
			}
		}

		return isTurnEnd && temp2.call(this);
	};

	var temp3 = EnemyTurn._isOrderAllowed;
	EnemyTurn._isOrderAllowed = function(unit) {
		if (StateControl.hasManipulateState(unit)) {
			return false;
		}
		else {
			return temp3.call(this, unit);
		}
	};
})();
/*--------------------------------------------------------------------------
　連携攻撃スクリプト ver 0.3

■作成者
キュウブ

■概要
特定のフュージョン状態の時に、フュージョン先のユニットと協力攻撃が可能になります。
※敵、同盟軍や全体攻撃には対応しておりません

■各機能
■■連携フュージョン
連携フュージョンコマンドを行うと対象ユニットに「キャッチされます」。
つまり、自分が救出される側になります。

■■フュージョンの交代
連携フュージョン状態では「交代」というコマンドが使用できます。
使用した場合は対象ユニットのフュージョンの親子関係が逆転します。

■■戦闘予測画面での連携情報表示
Vキーを押しっぱなしにすると連携先ユニットの攻撃情報が表示されます。

■■連携攻撃の発動率
発動率は (連携元ユニットと連携先ユニットの技の合計値) ÷ 2 となっております。
カスタムスキル"CooperateAttack"を連携先ユニットに持たせることで発動率を上昇させることができます。

■■連携攻撃
連携元ユニット戦闘終了後に連携先ユニットが連続で戦闘を仕掛けるような形で発生します。
また、連携先ユニットは反撃を受けないようになっています。

■使い方
1.全体攻撃武器スクリプトver1.1以降を導入する
本スクリプトは全体攻撃スクリプトの処理を一部流用します
https://github.com/QBE256/ExtraPlugin/blob/master/%E5%85%A8%E4%BD%93%E6%94%BB%E6%92%83%E6%AD%A6%E5%99%A8.js

2.対象のフュージョンのカスパラに
{isCooperateAttack: true}
と設定する。
フュージョンの種類は「通常」で「自軍」を対象としてください。

3.戦闘アニメの設定
連携攻撃は射程に関係なく行う仕様となっております。
例えば、射程1の近接武器しか持つことが想定されていないクラスでも、離れていれば遠距離モーションで攻撃を行います。
したがって、本来想定されていない距離の戦闘モーションも全て設定しておく必要があります。

4.発動率補正用のカスタムスキルの設定
カスタムキーワードが"CooperateAttack"のカスタムスキルをユニットに持たせることで
発動率の分だけ連携攻撃の発動率が上昇するようになります。

※発動率は絶対値以外で設定しないでください
※スキルの効果が発動するのは所持している本人が"連携先ユニットになっている場合"に限ります
例えば、ランバートにスキルを持たせている場合、ランバートが連携フュージョンの救出されている側である必要があります。

また、このスキルでは有効相手を設定することができます。
有効相手を"ナッシュ"としておくとナッシュと連携した時のみランバートの攻撃発動率が上がるようになります。

例えば、ナッシュ-ランバートで支援関係がある時に互いの発動率を高めたい場合は
有効相手をナッシュとしたスキルAをランバートに、
有効相手をランバートとしたスキルBをナッシュに付与しておくと良いでしょう。

5.基本発動率を変えたい場合
基本発動率の (連携元ユニットと連携先ユニットの技の合計値) ÷ 2を変更したい場合は、
本スクリプト内のAbilityCalculator.getCooperateAttackの中を改変してください。

■更新履歴
ver 0.3 (2022/11/11)
連携先のユニットがフュージョン状態でも連携できてしまうバグを修正
交代実行後にユニットが待機状態にならないように修正

ver 0.2 (2022/04/25)
ユニットコマンド説明スクリプトに対応

ver 0.1 (2022/03/22)
試作版公開

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
	var _PosMenu_createPosMenuWindow = PosMenu.createPosMenuWindow;
	PosMenu.createPosMenuWindow = function (unit, item, type) {
		var fusionUnit = FusionControl.getFusionChild(unit);

		if (CooperateAttackControl.isEnabledCooperateAttack(unit, fusionUnit) && type === PosMenuType.Attack) {
			this._cooperateUnit = fusionUnit;
			this._cooperateItem = ItemControl.getEquippedWeapon(fusionUnit);
			this._posWindowChangeLeft = createWindowObject(this._getObjectFromType(type), this);
			this._posWindowChangeRight = createWindowObject(this._getObjectFromType(type), this);
			this._posWindowTopLeft = createWindowObject(PosCooperateWindow, this);
		}
		_PosMenu_createPosMenuWindow.apply(this, arguments);
	};

	var _PosMenu_moveWindowManager = PosMenu.moveWindowManager;
	PosMenu.moveWindowManager = function () {
		var result = _PosMenu_moveWindowManager.apply(this, arguments);
		if (this._cooperateUnit) {
			return (
				result &&
				this._posWindowChangeLeft.moveWindow() &&
				this._posWindowTopLeft.moveWindow() &&
				this._posWindowChangeRight.moveWindow()
			);
		}
	};

	var _PosMenu_drawWindowManager = PosMenu.drawWindowManager;
	PosMenu.drawWindowManager = function () {
		var x, y;

		if (this._currentTarget === null) {
			_PosMenu_drawWindowManager.apply(this, arguments);
			return;
		}

		x = this.getPositionWindowX();
		y = this.getPositionWindowY();
		if (this._posWindowTopLeft) {
			this._posWindowTopLeft.drawWindow(x, y - this._posWindowTopLeft.getWindowHeight());
		}
		if (this._posWindowChangeLeft && root.isInputState(InputType.BTN4)) {
			this._posWindowChangeLeft.drawWindow(x, y);
			this._posWindowChangeRight.drawWindow(x + this._posWindowLeft.getWindowWidth() + this._getWindowInterval(), y);
		} else {
			_PosMenu_drawWindowManager.apply(this, arguments);
		}
	};

	var _PosMenu_changePosTarget = PosMenu.changePosTarget;
	PosMenu.changePosTarget = function (targetUnit) {
		var targetItem, cooperateAttackRate;

		_PosMenu_changePosTarget.apply(this, arguments);
		if (this._unit === null || !this._isTargetAllowed(targetUnit)) {
			return;
		}

		if (this._cooperateUnit) {
			targetItem = ItemControl.getEquippedWeapon(targetUnit);
			cooperateAttackRate = AbilityCalculator.getCooperateAttack(this._unit, this._cooperateUnit);
			this._posWindowChangeLeft.setPosTarget(this._cooperateUnit, this._cooperateItem, targetUnit, targetItem, true);
			this._posWindowChangeRight.setPosTarget(targetUnit, targetItem, this._cooperateUnit, this._cooperateItem, false);
			this._posWindowTopLeft.setPosInfo(this._cooperateUnit, cooperateAttackRate);
		}
	};

	var _UnitCommand_Attack__moveSelection = UnitCommand.Attack._moveSelection;
	UnitCommand.Attack._moveSelection = function () {
		var multipleAttackParam, result;
		var weapon = this._weaponSelectMenu.getSelectWeapon();
		this._cooperateAttackUnit = this._getCooperateAttackUnit();
		if (!this._cooperateAttackUnit) {
			return _UnitCommand_Attack__moveSelection.apply(this, arguments);
		}
		result = this._posSelector.movePosSelector();
		if (result === PosSelectorResult.SELECT) {
			if (this._isPosSelectable()) {
				this._posSelector.endPosSelector();
				multipleAttackParam = this._createCooperateAttackParam();
				this._preAttack = createObject(PreMultipleAttack);
				result = this._preAttack.enterPreAttackCycle(multipleAttackParam);
				if (result === EnterResult.NOTENTER) {
					this.endCommandAction();
					return MoveResult.END;
				}

				this.changeCycleMode(AttackCommandMode.RESULT);
			}
		} else if (result === PosSelectorResult.CANCEL) {
			this._posSelector.endPosSelector();
			this._weaponSelectMenu.setMenuTarget(this.getCommandTarget());
			this.changeCycleMode(AttackCommandMode.TOP);
		}

		return MoveResult.CONTINUE;
	};

	// このスクリプトを導入している場合、連携状態のフュージョンユニットには反撃できなくなる
	// フュージョンユニットに攻撃するようなスクリプトを導入している場合は注意
	var _AttackChecker_isCounterattack = AttackChecker.isCounterattack;
	AttackChecker.isCounterattack = function (unit, targetUnit) {
		var fusionData;
		var fusionUnit = FusionControl.getFusionParent(unit);
		if (fusionUnit) {
			fusionData = FusionControl.getFusionData(fusionUnit);
			if (fusionData && !!fusionData.custom.isCooperateAttack) {
				return false;
			}
		}
		return _AttackChecker_isCounterattack.apply(this, arguments);
	};

	// 連携カスタムパラメータを持ったフュージョンデータの場合、
	// UnitCommand.FusionRideクラスやUnitCommand.FusionUnitChangeを適用させる必要がある
	UnitCommand._appendFusionCommand = function (groupArray) {
		var i, count, arr;
		var unit = this.getListCommandUnit();
		var fusionData = FusionControl.getFusionData(unit);

		if (fusionData === null) {
			arr = FusionControl.getFusionArray(unit);
			count = arr.length;
			for (i = 0; i < count; i++) {
				fusionData = arr[i];
				if (fusionData.getFusionType() === FusionType.ATTACK) {
					groupArray.appendObject(UnitCommand.FusionAttack);
					groupArray[groupArray.length - 1].setFusionData(fusionData);
				} else if (!!fusionData.custom.isCooperateAttack) {
					groupArray.appendObject(UnitCommand.FusionRide);
					groupArray[groupArray.length - 1].setFusionData(fusionData);
				} else {
					groupArray.appendObject(UnitCommand.FusionCatch);
					groupArray[groupArray.length - 1].setFusionData(fusionData);
				}
			}

			for (i = 0; i < count; i++) {
				fusionData = arr[i];
				groupArray.appendObject(UnitCommand.FusionUnitTrade);
				groupArray[groupArray.length - 1].setFusionData(fusionData);
			}
		} else {
			groupArray.appendObject(UnitCommand.FusionRelease);
			groupArray[groupArray.length - 1].setFusionData(fusionData);

			groupArray.appendObject(UnitCommand.FusionUnitTrade);
			groupArray[groupArray.length - 1].setFusionData(fusionData);

			if (fusionData.custom.isCooperateAttack === true) {
				groupArray.appendObject(UnitCommand.FusionUnitChange);
				groupArray[groupArray.length - 1].setFusionData(fusionData);
			}
		}
	};

	var _PlayerTurn__moveUnitCommand = PlayerTurn._moveUnitCommand;
	PlayerTurn._moveUnitCommand = function () {
		this._targetUnit = this._mapSequenceCommand.getTargetUnit();
		return _PlayerTurn__moveUnitCommand.apply(this, arguments);
	};

	var _MapSequenceCommand__moveCommand = MapSequenceCommand._moveCommand;
	MapSequenceCommand._moveCommand = function () {
		this._targetUnit = this._unitCommandManager.getListCommandUnit();
		return _MapSequenceCommand__moveCommand.apply(this, arguments);
	};
})();

PosMenu._cooperateUnit = null;
PosMenu._cooperateItem = null;
PosMenu._posWindowChangeLeft = null;
PosMenu._posWindowChangeRight = null;
PosMenu._posWindowTopLeft = null;
var PosCooperateWindow = defineObject(BaseWindow, {
	_cooperateAttackRate: 0,
	_unit: null,

	moveWindowContent: function () {
		return MoveResult.CONTINUE;
	},

	drawWindowContent: function (x, y) {
		this.drawNotice(x, y);
	},

	drawNotice: function (xBase, yBase) {
		var adjustRatePositionX = 4;
		var x = xBase;
		var y = yBase - 6;
		var length = this._getTextLength();
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		var frontText = "連携率";
		var rearText = "% Vキーで情報切替";
		var frontTextWidth = root.getGraphicsManager().getTextWidth(frontText, font);

		TextRenderer.drawText(x, y, frontText, length, color, font);
		if (this._cooperateAttackRate < 10) {
			adjustRatePositionX += 16;
		} else if (this._cooperateAttackRate < 100) {
			adjustRatePositionX += 8;
		}
		NumberRenderer.drawRightNumber(x + frontTextWidth + adjustRatePositionX, y - 5, this._cooperateAttackRate);
		TextRenderer.drawText(x + frontTextWidth + 32, y, rearText, length, color, font);
	},

	setPosInfo: function (unit, cooperateAttackRate) {
		this._unit = unit;
		this._cooperateAttackRate = cooperateAttackRate;
	},

	getWindowHeight: function () {
		return 30;
	},

	getWindowWidth: function () {
		return 230;
	},

	getWindowTextUI: function () {
		return Miscellaneous.getColorWindowTextUI(this._unit);
	},

	_getTextLength: function () {
		return 190;
	}
});

MapSequenceCommand.getTargetUnit = function () {
	return this._targetUnit;
};

UnitCommand.Attack._cooperateAttackUnit = null;
UnitCommand.Attack._getCooperateAttackUnit = function () {
	var skills, fusionData, cooperateType;
	var unit = this.getCommandTarget();
	var fusionUnit = FusionControl.getFusionChild(unit);

	if (!CooperateAttackControl.isEnabledCooperateAttack(unit, fusionUnit)) {
		return null;
	}
	return CooperateAttackControl.isActivated(unit, fusionUnit) ? fusionUnit : null;
};

UnitCommand.Attack._createCooperateAttackParam = function () {
	var originalUnitAttackParam = this._createAttackParam();
	var cooperateUnitAttackParam = StructureBuilder.buildAttackParam();

	originalUnitAttackParam.weapon = ItemControl.getEquippedWeapon(originalUnitAttackParam.unit);
	cooperateUnitAttackParam.unit = this._cooperateAttackUnit;
	cooperateUnitAttackParam.targetUnit = originalUnitAttackParam.targetUnit;
	cooperateUnitAttackParam.attackStartType = AttackStartType.NORMAL;
	cooperateUnitAttackParam.weapon = ItemControl.getEquippedWeapon(this._cooperateAttackUnit);

	return [originalUnitAttackParam, cooperateUnitAttackParam];
};

AbilityCalculator.getCooperateAttack = function (unit, cooperateUnit) {
	var skill;
	var rate = Math.floor((RealBonus.getSki(unit) + RealBonus.getSki(cooperateUnit)) / 2);
	var skills = SkillControl.getDirectSkillArray(cooperateUnit, SkillType.CUSTOM, "CooperateAttack");
	for (var index = 0; index < skills.length; index++) {
		skill = skills[index].skill;
		if (skill.getTargetAggregation().isCondition(unit)) {
			rate += skill.getInvocationValue();
		}
	}
	if (rate > 100) {
		return 100;
	} else if (rate < 0) {
		return 0;
	}
	return rate;
};

var CooperateAttackControl = {
	isEnabledCooperateAttack: function (originalUnit, cooprateUnit) {
		var fusionData;
		// 協力ユニットが存在しない場合は攻撃禁止
		if (!cooprateUnit) {
			return false;
		}
		// 同じ勢力でない場合は攻撃禁止
		if (cooprateUnit.getUnitType() !== originalUnit.getUnitType()) {
			return false;
		}
		// 行動不能の場合は攻撃禁止
		if (StateControl.isBadStateOption(cooprateUnit, BadStateOption.NOACTION)) {
			return false;
		}
		// 装備武器が拾えない場合は禁止
		if (!ItemControl.getEquippedWeapon(cooprateUnit)) {
			return false;
		}
		// 連携フュージョン状態でないと禁止
		fusionData = cooprateUnit.getUnitStyle().getFusionData();
		return fusionData.custom.isCooperateAttack === true;
	},

	isActivated: function (originalUnit, cooprateUnit) {
		var rate = AbilityCalculator.getCooperateAttack(originalUnit, cooprateUnit);
		return Probability.getProbability(rate);
	}
};

UnitCommand.FusionRide = defineObject(UnitCommand.FusionCatch, {
	_addFusionEvent: function (generator) {
		var unit = this.getCommandTarget();
		var targetUnit = this._posSelector.getSelectorTarget(true);

		generator.unitFusion(targetUnit, unit, this._fusionData, DirectionType.NULL, FusionActionType.CATCH, false);
	},

	_getFusionIndexArray: function (unit) {
		var i, x, y, targetUnit;
		var indexArray = [];

		for (i = 0; i < DirectionType.COUNT; i++) {
			x = unit.getMapX() + XPoint[i];
			y = unit.getMapY() + YPoint[i];
			targetUnit = PosChecker.getUnitFromPos(x, y);
			if (
				targetUnit !== null &&
				FusionControl.isCatchable(targetUnit, unit, this._fusionData) &&
				!FusionControl.getFusionChild(targetUnit)
			) {
				indexArray.push(CurrentMap.getIndex(x, y));
			}
		}

		return indexArray;
	},

	getDescription: function () {
		return this._fusionData.custom.commandDescriptionText || "味方と連携します(一定確率で連携攻撃が可能になります)";
	}
});

UnitCommand.FusionUnitChange = defineObject(BaseFusionCommand, {
	_childUnit: null,

	getCommandName: function () {
		return "交代";
	},

	_doEndAction: function () {
		if (this._childUnit.isWait()) {
			this._childUnit.setWait(false);
		}
		this.rebuildCommand();
	},

	_completeCommandMemberData: function () {
		var parentUnit = this.getCommandTarget();
		this._childUnit = FusionControl.getFusionChild(parentUnit);
		this._changeAction();
		this.changeCycleMode(FusionCommandMode.ACTION);
	},

	_addFusionEvent: function (generator) {
		var unit = this.getCommandTarget();
		var targetUnit = FusionControl.getFusionChild(unit);

		generator.unitFusion(unit, {}, {}, DirectionType.NULL, FusionActionType.RELEASE, true);
		generator.unitFusion(targetUnit, unit, this._fusionData, DirectionType.NULL, FusionActionType.CATCH, true);

		this._listCommandManager.setListCommandUnit(targetUnit);
	},

	_getFusionIndexArray: function (unit) {
		return [CurrentMap.getIndex(unit.getMapX(), unit.getMapY())];
	},

	getDescription: function () {
		return "連携を交代します";
	}
});

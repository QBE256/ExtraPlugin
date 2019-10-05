/*--------------------------------------------------------------------------
　ポジションエクスチェンジの杖 ver 1.0

■作成者
キュウブ

■概要
対象ユニットを選んで互いの場所を交換できる杖、アイテムを設定できるようになります。
互いの移動先が移動不可地形になるようなユニットは選択できません。

■使い方
カスタム設定のアイテムでカスタムキーワードに"positionExchange"を設定するだけでおｋ

■更新履歴
ver 1.0 (2019/10/6)
初版作成

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
var POSITION_EXCHANGE_CUSTOM_KEYWORD = 'positionExchange';
var PositionExchangeItemSelection = defineObject(RescueItemSelection,
{
	_moveTargetSelect: function() {
		var result = this._posSelector.movePosSelector();
		
		if (result === PosSelectorResult.SELECT) {
			if (this.isPosSelectable()) {
				this._targetUnit = this._posSelector.getSelectorTarget(false);
				this._setTargetPos();
				if (this._targetPos === null) {
					this._targetUnit = null;
					return MoveResult.CONTINUE;
				}
				else {
					this._isSelection = true;
					this._posSelector.endPosSelector();
					return MoveResult.END;
				}
			}
		}
		else if (result === PosSelectorResult.CANCEL) {
			this._isSelection = false;
			this._posSelector.endPosSelector();
			return MoveResult.END;
		}
		
		return MoveResult.CONTINUE;
	},

	_setTargetPos: function() {
		if (PosChecker.getMovePointFromUnit(this._unit.getMapX(), this._unit.getMapY(), this._targetUnit) === 0
			|| PosChecker.getMovePointFromUnit(this._targetUnit.getMapX(), this._targetUnit.getMapY(), this._unit) === 0) {
			this._targetPos = null;
		}
		else {
			this._targetPos = createPos(this._unit.getMapX(), this._unit.getMapY());
		}
	}
}
);

var PositionExchangeItemUse = defineObject(RescueItemUse,
{
	_unit: null,

	enterMainUseCycle: function(itemUseParent) {
		var itemTargetInfo = itemUseParent.getItemTargetInfo();
		
		this._itemUseParent = itemUseParent;
		this._targetUnit = itemTargetInfo.targetUnit;
		this._targetPos = itemTargetInfo.targetPos;
		this._unit = itemUseParent.getItemTargetInfo().unit;
		
		if (this._targetPos === null) {
			this._targetPos = createPos(this._unit.getMapX(), this._unit.getMapY());
		}
		
		if (itemUseParent.isItemSkipMode()) {
			this.mainAction();
			return EnterResult.NOTENTER;
		}
		
		this.changeCycleMode(ItemRescueUseMode.SRC);
		
		return EnterResult.OK;
	},

	mainAction: function() {
		this._unit.setMapX(this._targetUnit.getMapX());
		this._unit.setMapY(this._targetUnit.getMapY());
		this._unit.setInvisible(false);
		RescueItemUse.mainAction.call(this);
	},

	_moveSrc: function() {
		this._showAnime(this._targetUnit.getMapX(), this._targetUnit.getMapY());
		this.changeCycleMode(ItemRescueUseMode.SRCANIME);
		
		return MoveResult.CONTINUE;
	}
}
);

var PositionExchangeItemInfo = defineObject(RescueItemInfo,
{
	drawItemInfoCycle: function(x, y) {
		ItemInfoRenderer.drawKeyword(x, y, this.getItemTypeName("場所交換"));
		y += ItemInfoRenderer.getSpaceY();
		this.drawRange(x, y, this._item.getRangeValue(), this._item.getRangeType());
	}
}
);

var PositionExchangeAvailability = defineObject(RescueItemAvailability,
{
}
);

var PositionExchangeItemAI = defineObject(RescueItemAI,
{
}
);

(function(){

	var alias1 = ItemPackageControl.getCustomItemSelectionObject;
	ItemPackageControl.getCustomItemSelectionObject = function(item, keyword) {
		if (keyword === POSITION_EXCHANGE_CUSTOM_KEYWORD) {
			return PositionExchangeItemSelection;
		}
		else {
			return alias1.call(this, item, keyword);
		}
	};

	var alias2 = ItemPackageControl.getCustomItemUseObject;
	ItemPackageControl.getCustomItemUseObject = function(item, keyword) {
		if (keyword === POSITION_EXCHANGE_CUSTOM_KEYWORD) {
			return PositionExchangeItemUse;
		}
		else {
			return alias2.call(this, item, keyword);
		}
	};

	var alias3 = ItemPackageControl.getCustomItemInfoObject;
	ItemPackageControl.getCustomItemInfoObject = function(item, keyword) {
		if (keyword === POSITION_EXCHANGE_CUSTOM_KEYWORD) {
			return PositionExchangeItemInfo;
		}
		else {
			return alias3.call(this, item, keyword);
		}
	};

	var alias4 = ItemPackageControl.getCustomItemAvailabilityObject;
	ItemPackageControl.getCustomItemAvailabilityObject = function(item, keyword) {
		if (keyword === POSITION_EXCHANGE_CUSTOM_KEYWORD) {
			return PositionExchangeAvailability;
		}
		else {
			return alias4.call(this, item, keyword);
		}
	};
	
	var alias5 = ItemPackageControl.getCustomItemAIObject;
	ItemPackageControl.getCustomItemAIObject = function(item, keyword) {
		if (keyword === POSITION_EXCHANGE_CUSTOM_KEYWORD) {
			return PositionExchangeItemAI;
		}
		else {
			return alias5.call(this, item, keyword);
		}
	};

})();
/*--------------------------------------------------------------------------
　パラメータを通貨にアイテムの売買を行える機能 ver 1.0

■作成者
キュウブ

■概要
特定のアイテムがお金ではなく、ユニットパラメータで買えるようになります。
例えば最大HPと引き換えに買える希少品などを設定できるようになります。

■注意点1
特定ユニットが店に訪問した場合のみ本機能は有効となります。
戦闘準備画面では "ユニット整理経由でなければ" 対象アイテムはお金で売買する事になってしまいます。

■注意点2
購入に使えるパラメータはクラス補正値やステート補正などを無視したユニットの素の値となります。
例えば、
対象ユニットの最大HPが12で内訳がクラス補正4+素の値8だった場合、
最大HP10で買えるアイテムは購入する事ができません。

■注意点3
売る場合はデフォルトの仕様に沿って値段の半分が持ち金に加算されます。本機能は買う場合のみ機能します。

■使い方
対象のアイテムに対して、以下のカスパラを設定してください
parameterCurrency: {
	type: <パラメータインデックス(HPなら0,力なら1,魔力なら2,技なら3 …)>,
	value: <売り値>
}

例えば下記の場合は、最大HPを2支払う事で対象アイテムが買えるようになります。
parameterCurrency: {
	type: 0,
	value: 2
}


■更新履歴
ver 1.0 (2021/12/24)
初版

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

// 通貨の表示を変更したい場合はこの文字列を変更する事
StringTable.UnitBaseParameterText = "基礎値";

ParamGroup.getParameterCurrencyLabel = function (parameterType) {
	return this._objectArray[parameterType].getSignal().toUpperCase();
};

ItemRenderer.drawShopItemByParameterCurrency = function (x, y, item, color, font, amount) {
	var text = ParamGroup.getParameterCurrencyLabel(item.custom.parameterCurrency.type);
	var font = TextRenderer.getDefaultFont();
	ItemRenderer.drawItem(x, y, item, color, font, false);
	this.drawAmount(x + 140, y, item, color, font, amount);
	ItemRenderer.drawItemLimit(x + 225, y, item, 255);
	NumberRenderer.drawNumber(x + 258, y, item.custom.parameterCurrency.value);
	TextRenderer.drawText(x + 270, y + 6, text, -1, 0xffffff, font);
};

ItemSale._changeParameter = function (unit, item) {
	var currentParameter = ParamGroup.getUnitValue(unit, item.custom.parameterCurrency.type);
	var afterParameter = currentParameter - item.custom.parameterCurrency.value;
	ParamGroup.setUnitValue(unit, item.custom.parameterCurrency.type, afterParameter);
	if (item.custom.parameterCurrency.type === ParamType.MHP) {
		var currentHp = unit.getHp();
		var maxHp = ParamBonus.getMhp(unit);
		if (currentHp > maxHp) {
			unit.setHp(maxHp);
		}
	}
	return -1 * item.custom.parameterCurrency.value;
};

var ShopParameterCurrencyWindow = defineObject(ShopCurrencyWindow, {
	_counter: null,
	_balancer: null,
	_parameterType: 0,

	getParameterType: function () {
		return this._parameterType;
	},

	setShopWindowData: function (parameterType, currentParameter) {
		this._counter = createObject(CycleCounter);
		this._counter.setCounterInfo(30);
		this._parameterType = parameterType;
		this._balancer = createObject(SimpleBalancer);
		this._balancer.setBalancerInfo(currentParameter, this.getMaxPrice());

		this.changeCycleMode(ShopCurrencyWindowMode.NONE);
	},

	startPriceCount: function (price) {
		this._balancer.startBalancerMove(price);
		this.changeCycleMode(ShopCurrencyWindowMode.TOP);
	},

	getMaxPrice: function () {
		return DataConfig.getMaxParameter(this._parameterType);
	},

	getCurrencySign: function (parameterType) {
		return ParamGroup.getParameterCurrencyLabel(this._parameterType) + StringTable.UnitBaseParameterText;
	}
});

ShopLayoutScreen._parameterCurrencyWindow = null;

ShopLayoutScreen.drawScreenCycle = function () {
	var width = this._getTopWindowWidth();
	var height = this._getTopWindowHeight();
	var xBase = LayoutControl.getCenterX(-1, width);
	var yBase = LayoutControl.getCenterY(-1, height);
	var item = this.getSelectItem();
	var unit = this._keeperWindow.drawWindow(xBase, yBase);
	this._activeSelectWindow.drawWindow(xBase + this._keeperWindow.getWindowWidth(), yBase);

	if (
		!this._targetUnit ||
		!item ||
		typeof item.custom.parameterCurrency !== "object" ||
		this._activeItemWindow !== this._buyItemWindow
	) {
		this._currencyWindow.drawWindow(
			xBase + this._keeperWindow.getWindowWidth(),
			yBase + this._activeSelectWindow.getWindowHeight()
		);
	} else {
		this._parameterCurrencyWindow.drawWindow(
			xBase + this._keeperWindow.getWindowWidth(),
			yBase + this._activeSelectWindow.getWindowHeight()
		);
	}

	if (this.getCycleMode() === ShopLayoutMode.VISITORSELECT) {
		this._visitorSelectWindow.drawWindow(
			xBase + this._keeperWindow.getWindowWidth(),
			yBase + this._activeSelectWindow.getWindowHeight()
		);
	}

	yBase += this._keeperWindow.getWindowHeight();
	width = this._activeItemWindow.getWindowWidth();
	this._itemInfoWindow.drawWindow(xBase + width, yBase);
	this._activeItemWindow.drawWindow(xBase, yBase);
};

ShopLayoutScreen._startSale = function (isBuy, isForceStock) {
	var cutIndex;
	var item = this._activeItemWindow.getShopSelectItem();
	var price = this._itemSale.startSale(isBuy, isForceStock, item);

	if (isBuy) {
		cutIndex = this._getCutIndex(item);
		if (cutIndex !== -1) {
			this._cutArrayData(cutIndex);
			this._buyItemWindow.updateItemArea();
		}
	}

	if (isBuy && this._targetUnit && typeof item.custom.parameterCurrency === "object") {
		this._parameterCurrencyWindow.startPriceCount(price);
	} else {
		this._currencyWindow.startPriceCount(price);
	}

	this._isSale = true;

	// 買ったときはアイテムを増やし、売ったときはアイテムを減らすから常に呼び出す
	this._sellItemWindow.updateItemArea();

	this._playSaleSound();
};

(function () {
	var _ShopLayoutScreen__prepareScreenMemberData = ShopLayoutScreen._prepareScreenMemberData;
	ShopLayoutScreen._prepareScreenMemberData = function (screenParam) {
		_ShopLayoutScreen__prepareScreenMemberData.apply(this, arguments);
		this._parameterCurrencyWindow = createWindowObject(ShopParameterCurrencyWindow, this);
	};

	var _ShopLayoutScreen__completeScreenMemberData = ShopLayoutScreen._completeScreenMemberData;
	ShopLayoutScreen._completeScreenMemberData = function (screenParam) {
		_ShopLayoutScreen__completeScreenMemberData.apply(this, arguments);
		var item = this.getSelectItem();
		if (this._targetUnit) {
			var parameterType =
				typeof item.custom.parameterCurrency === "object" ? item.custom.parameterCurrency.type : 0;
			var currentParameter = ParamGroup.getUnitValue(this._targetUnit, parameterType);
			this._parameterCurrencyWindow.setShopWindowData(parameterType, currentParameter);
		}
	};

	var _ShopLayoutScreen__moveAnimation = ShopLayoutScreen._moveAnimation;
	ShopLayoutScreen._moveAnimation = function () {
		var item = this.getSelectItem();
		if (this._targetUnit && item && typeof item.custom.parameterCurrency === "object") {
			this._parameterCurrencyWindow.moveWindow();
		}
		return _ShopLayoutScreen__moveAnimation.apply(this, arguments);
	};

	var _ShopLayoutScreen__moveBuy = ShopLayoutScreen._moveBuy;
	ShopLayoutScreen._moveBuy = function () {
		if (this._targetUnit) {
			var item = this.getSelectItem();
			if (
				typeof item.custom.parameterCurrency === "object" &&
				this._parameterCurrencyWindow.getParameterType() !== item.custom.parameterCurrency.type
			) {
				var currentParameter = ParamGroup.getUnitValue(this._targetUnit, item.custom.parameterCurrency.type);
				this._parameterCurrencyWindow.setShopWindowData(item.custom.parameterCurrency.type, currentParameter);
			}
		}
		return _ShopLayoutScreen__moveBuy.apply(this, arguments);
	};

	var _BuyQuestionWindow__isPriceOk = BuyQuestionWindow._isPriceOk;
	BuyQuestionWindow._isPriceOk = function () {
		var currentParameter;
		var unit = this.getParentInstance().getVisitor();
		var item = this.getParentInstance().getSelectItem();

		if (!unit || typeof item.custom.parameterCurrency !== "object") {
			return _BuyQuestionWindow__isPriceOk.apply(this, arguments);
		}

		currentParameter = ParamGroup.getUnitValue(unit, item.custom.parameterCurrency.type);
		return item.custom.parameterCurrency.type === ParamType.MHP ? currentParameter > item.custom.parameterCurrency.value : currentParameter >= item.custom.parameterCurrency.value;
	};

	BuyScrollbar.drawScrollContent = function (x, y, object, isSelect, index) {
		var textui = this.getParentTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		var item = object;
		var arr = this.getParentInstance().getParentInstance().getInventoryArray();
		var unit = this.getParentInstance().getParentInstance().getVisitor();
		var amount = arr[index].getAmount();

		if (!this._availableArray[index]) {
			// 条件を満たしていないアイテムを薄暗くする
			color = ColorValue.DISABLE;
		}

		if (unit && typeof item.custom.parameterCurrency === "object") {
			ItemRenderer.drawShopItemByParameterCurrency(x, y, item, color, font, amount);
		} else {
			ItemRenderer.drawShopItem(x, y, item, color, font, this._getPrice(item), amount);
		}
	};

	var _ItemSale_startSale = ItemSale.startSale;
	ItemSale.startSale = function (isBuy, isForceStock, item) {
		var unit = this._parentShopScreen.getVisitor();

		if (!unit || !isBuy || typeof item.custom.parameterCurrency !== "object") {
			return _ItemSale_startSale.apply(this, arguments);
		}

		this._pushBuyItem(item, isForceStock);
		return this._changeParameter(unit, item);
	};
})();

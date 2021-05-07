/*--------------------------------------------------------------------------
　ストックとユニット交換画面をまとめる ver 1.3

■作成者
キュウブ

■概要
出撃準備のユニット整理でストックとユニットのアイテム交換を同時に行う事（身支度コマンド）ができるようになります。

■仕様
リソースは表示名以外はストック交換画面の設定を流用します。

■更新履歴
ver 1.3 (2021/05/07)
出撃or未出撃ユニットの区別がつくようにした(未出撃ユニットは顔グラが薄く表示されます）

ver 1.2 (2020/05/18)
ユニット切り替え時にアイテムリストが更新されないバグを修正

ver 1.1 (2020/05/16)
最新版でも動くように修正
無理矢理だけどアイテムのカテゴリ切り替え時にアイテム情報が切り替わらないバグを修正してみた

ver 1.0 (2020/05/14)
初版公開

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
(function(){
	var alias = MarshalCommandWindow._configureMarshalItem;
	MarshalCommandWindow._configureMarshalItem = function(groupArray) {
		var isRest = root.getBaseScene() === SceneType.REST;
		
		if (isRest || root.getCurrentSession().isMapState(MapStateType.STOCKSHOW)) {
			groupArray.appendObject(MarshalCommand.StockAndUnitTrade);
		}

		alias.call(this, groupArray);
	}
})();

MarshalCommand.StockAndUnitTrade = defineObject(MarshalCommand.StockTrade,
{
	_stockItemTradeScreen: null,
	
	checkCommand: function() {
		var screenParam = this._createScreenParam();
			
		// ユニットが設定されていないということはキャンセルされたことを意味するため、処理を終了する
		if (screenParam.unit === null) {
			return false;
		}
		
		this._stockItemTradeScreen = createObject(CategoryStockAndUnitItemTradeScreen);
		SceneManager.addScreen(this._stockItemTradeScreen, screenParam);
		
		return true;
	},
	
	isMarshalScreenCloesed: function() {
		return SceneManager.isScreenClosed(this._stockItemTradeScreen);
	},
	
	getInfoWindowType: function() {
		return MarshalInfoWindowType.ITEM;
	},
	
	getCommandName: function() {
		return "身支度";
	},
	
	getMarshalDescription: function() {
		return "ストック内や他ユニットの持っているアイテムを取り出します";
	},
	
	_createScreenParam: function() {
		var screenParam = ScreenBuilder.buildStockItemTrade();
		
		screenParam.unit = this._unitSelectWindow.getFirstUnit();
		screenParam.unitList = this._parentMarshalScreen.getUnitList();
		
		return screenParam;
	}
}
);

var CategoryStockAndUnitItemTradeScreen = defineObject(CategoryStockItemTradeScreen,
{
	_prepareScreenMemberData: function(screenParam) {

		this._unit = screenParam.unit;
		this._unitList = screenParam.unitList;
		this._resultCode = StockItemTradeResult.TRADENO;
		this._isAction = false;
		this._unitItemWindow = createWindowObject(ItemListWindow, this);
		this._stockItemWindow = createWindowObject(StockAndUnitItemListWindow, this);
		this._itemOperationWindow = createWindowObject(ItemOperationWindow, this);
		this._itemInfoWindow = createWindowObject(ItemInfoWindow, this);
		this._infoWindow = createWindowObject(InfoWindow, this);
		this._stockCountWindow = createWindowObject(StockCountWindow, this);
		this._unitSimpleWindow = this._createSimpleWindow();
		this._dataChanger = createObject(VerticalDataChanger);

		this._stockCategory = createObject(StockCategory);
		this._stockCategory.setStockCategory(this._stockItemWindow);
	},

	_completeScreenMemberData: function(screenParam) {
		this._stockItemWindow.setExceptUnit(this._unit);
		CategoryStockItemTradeScreen._completeScreenMemberData.call(this, screenParam);
	},

	_moveExtract: function() {
		var item, object;
		var input = this._stockItemWindow.moveWindow();

		var index = this._stockCategory.checkStockCategory(this._stockItemWindow);
		
		if (index !== -1) {
			return MoveResult.CONTINUE;
		}
		
		if (input === ScrollbarInput.SELECT) {	
			object = this._stockItemWindow.getCurrentObject();

			if (object && object.unit && Miscellaneous.isTradeDisabled(object.unit, object.item)) {
				this._playOperationBlockSound();
				return MoveResult.CONTINUE;
			}

			// アイテムを取り出す
			this._extractItem();
			
			if (!this.isExtractAllowed()) {
				this._processMode(StockItemTradeMode.OPERATION);
				this._itemInfoWindow.setInfoItem(null);
			}
			
			// 一度でも交換を行った場合はtrueになる
			this._isAction = true;
		}
		else if (input === ScrollbarInput.CANCEL) {
			this._itemInfoWindow.setInfoItem(null);
			this._processMode(StockItemTradeMode.OPERATION);
		}
		else if (input === ScrollbarInput.NONE) {
			//if (this._stockItemWindow.isIndexChanged()) {
			item = this._stockItemWindow.getCurrentItem();
			this._itemInfoWindow.setInfoItem(item);
			//}
		}
		
		return MoveResult.CONTINUE;
	},
	
	_moveOperation: function() {
		var index;
		var input = this._itemOperationWindow.moveWindow();
		var result = MoveResult.CONTINUE;

		if (input === ScrollbarInput.SELECT) {
			index = this._itemOperationWindow.getOperationIndex();
			if (index === 0 && this.isExtractAllowed()) {
				this._processMode(StockItemTradeMode.EXTRACT);
			}
			else if (index === 1 && this.isStoreAllowed()) {
				this._processMode(StockItemTradeMode.STORE);
			}
			else if (index === 2 && this.isStoreAllowed()) {
				this._storeAllItem();
			}
		}
		else if (input === ScrollbarInput.CANCEL) {
			if (this._isAction) {
				// 何らかの交換を行った場合は、交換済みを示す値を返す
				this._resultCode = StockItemTradeResult.TRADEEND;
			}
			else {
				this._resultCode = StockItemTradeResult.TRADENO;
			}
			
			// アイテムの更新が終わった後の処理を行う
			ItemControl.updatePossessionItem(this._unit);
			
			result = MoveResult.END;
		}
		else if (input === ScrollbarInput.OPTION) {
			this._openMenu();
		}
		else if (this.getCycleMode() === StockItemTradeMode.OPERATION) {
			if (this._unitSimpleWindow === null || this._unitList === null) {
				return result;
			}
			
			index = this._dataChanger.checkDataIndex(this._unitList, this._unit); 
			if (index !== -1) {
				this._unit = this._unitList.getData(index);
				this._unitItemWindow.setUnitItemFormation(this._unit);
				this._unitSimpleWindow.setFaceUnitData(this._unit);
				this._stockItemWindow.setExceptUnit(this._unit);
				this._updateStockWindow();
			}
		}
		
		return result;
	},
	
	_extractItem: function() {
		var object = this._stockItemWindow.getCurrentObject();
		
		if (object === null) {
			return;
		}
		
		if (object.unit) {
			UnitItemControl.cutItem(object.unit, object.index);
			this._pushUnitItem(object.item);
		} 
		else {
			this._cutStockItem(object.index);
			this._pushUnitItem(object.item);
		}
		
		this._updateListWindow();
	},

	isExtractAllowed: function() {
		// ストックアイテムとユニットアイテムがなくなったため、これ以上引き出せない
		if (this._stockItemWindow.getItemCount() === 0) {
			return false;
		}
		
		// ユニットアイテムに空きがないため、これ以上引き出せない
		if (!UnitItemControl.isUnitItemSpace(this._unit)) {
			return false;
		}
		
		return true;
	},

	getScreenTitleName: function() {
		return "身支度";
	}
}
);

var StockAndUnitItemListWindow = defineObject(ItemListWindow,
{
	_exceptUnit: null,

	initialize: function() {
		this._scrollbar = createScrollbarObject(StockAndUnitItemListScrollbar, this);
	},

	getCurrentItem: function() {
		if (this._scrollbar.getObject()){
			return this._scrollbar.getObject().item;
		}
		else {
			return null;
		}
	},

	getCurrentObject: function() {
		return this._scrollbar.getObject();
	},

	setExceptUnit: function(unit) {
		this._exceptUnit = unit;
		this._scrollbar.setExceptUnit(unit);
	},

	getItemCount: function() {
		var item;
		var itemCount = StockItemControl.getStockItemCount();
		var unitList = PlayerList.getAliveDefaultList();
		var unitCount = unitList.getCount();
		var unitItemCount = DataConfig.getMaxUnitItemCount();

		for (var unitIndex = 0; unitIndex < unitCount; unitIndex++) {
			unit = unitList.getData(unitIndex);

			if (this._exceptUnit && this._exceptUnit.getId() === unit.getId()) {
				continue;
			}

			for (var unitItemIndex = 0; unitItemIndex < unitItemCount; unitItemIndex++) {
				item = UnitItemControl.getItem(unit, unitItemIndex);
				if (item !== null) {
					itemCount++;
				}
			}
		}
	}
}
);

var StockAndUnitItemListScrollbar = defineObject(ItemListScrollbar,
{
	_unit: null,

	_buildScrollbarObject: function(item, unit, index) {
		return {
			item: item,
			unit: unit,
			index: index
		};
	},

	setExceptUnit: function(unit) {
		this._unit = unit;
	},

	setStockItemFormationFromWeaponType: function(weapontype) {
		var i, item, unit;
		var stockCount = StockItemControl.getStockItemCount();
		var unitList = PlayerList.getAliveDefaultList();
		var unitCount = unitList.getCount();
		var unitItemCount = DataConfig.getMaxUnitItemCount();

		this.resetScrollData();

		for (var index = 0; index < stockCount; index++) {
			item = StockItemControl.getStockItem(index);
			if (item.getWeaponType() === weapontype) {
				this.objectSet(this._buildScrollbarObject(item, null, index));
			}
		}

		for (var unitIndex = 0; unitIndex < unitCount; unitIndex++) {
			unit = unitList.getData(unitIndex);

			if (this._unit && this._unit.getId() === unit.getId()) {
				continue;
			}

			for (var unitItemIndex = 0; unitItemIndex < unitItemCount; unitItemIndex++) {
				item = UnitItemControl.getItem(unit, unitItemIndex);
				if (item !== null && item.getWeaponType() === weapontype) {
					this.objectSet(this._buildScrollbarObject(item, unit, unitItemIndex));
				}
			}
		}
		
		this.objectSetEnd();
		
		this.resetAvailableData();
	},

	drawScrollContent: function(x, y, object, isSelect, index) {
		var isAvailable, textColor;
		var textui = this.getParentTextUI();
		var font = textui.getFont();
		var textAlpha = 120;
		var faceAlpha = 255;
		
		if (object === null) {
			return;
		}
		
		if (this._availableArray !== null) {
			isAvailable = this._availableArray[index];
		}
		else {
			isAvailable = true;
		}
		textColor = this._getTextColor(object, isSelect, index);

		if (object.unit) {
			if (
				root.getCurrentScene() === SceneType.BATTLESETUP &&
				object.unit.getSortieState() !== SortieType.SORTIE
			) {
				faceAlpha = 128;
			} 
			ContentRenderer.drawUnitPartFace(x + 120, y - 2, object.unit, false, faceAlpha);
		}
		
		if (isAvailable) {
			ItemRenderer.drawItem(x, y, object.item, textColor, font, true);
		}
		else {
			ItemRenderer.drawItemAlpha(x, y, object.item, textColor, font, true, textAlpha);
		}
	},

	resetAvailableData: function() {
		var i, object;
		var length = this._objectArray.length;
		
		this._availableArray = [];
		
		for (i = 0; i < length; i++) {
			object = this._objectArray[i];
			if (object !== null) {
				this._availableArray.push(this._isAvailable(object.item, false, i));
			}
		}
	}
}
);

ContentRenderer.drawUnitPartFace = function(x, y, unit, isReverse, alpha) {
	var handle = unit.getFaceResourceHandle();
	var pic = GraphicsRenderer.getGraphics(handle, GraphicsType.FACE);
	var xSrc, ySrc
	var destWidth = GraphicsFormat.FACE_WIDTH;
	var destHeight = 27;
	var srcWidth = destWidth;
	var srcHeight = GraphicsFormat.FACE_HEIGHT;	

	if (pic === null) {
		return;
	}
	pic.setReverse(isReverse);
	pic.setAlpha(alpha);	
	xSrc = handle.getSrcX() * srcWidth;
	ySrc = handle.getSrcY() * srcHeight + Math.floor(GraphicsFormat.FACE_HEIGHT / 3);
	pic.drawStretchParts(x, y, destWidth, destHeight, xSrc, ySrc, srcWidth, destHeight);
};
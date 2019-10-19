/*
使い方
1.対象の武器、アイテム用の変数を一つ用意しておく(初期値を0としておく事)
この変数に買った数を管理させます。

2.対象の武器、アイテムのカスパラに
{
	raise_price: {
		coefficient: <係数。2の場合は、1個買うと値段が2倍、2個買うと値段が4倍、3個買うと値段が8倍…となる>
		item_count_group: <対象変数グループインデックス。一番左の場合は0とする>
		item_count_id: <対象変数のID>
	}
}
と記入しておく。
*/

(function() {

	var getVariableItemCount = function(item) {
		if (typeof item.custom.raise_price === 'object' && 
		    typeof item.custom.raise_price.coefficient === 'number' &&
		    typeof item.custom.raise_price.item_count_group === 'number' &&
		    typeof item.custom.raise_price.item_count_id === 'number') {

			var gameVariables = root.getMetaSession().getVariableTable(item.custom.raise_price.item_count_group);
			return gameVariables.getVariable(gameVariables.getVariableIndexFromId(item.custom.raise_price.item_count_id));		
			
		} else {
			return -1;
		}	
	}

	var setVariableItemCount = function(item, set_count) {
		if (typeof item.custom.raise_price === 'object' && 
		    typeof item.custom.raise_price.coefficient === 'number' &&
		    typeof item.custom.raise_price.item_count_group === 'number' &&
		    typeof item.custom.raise_price.item_count_id === 'number') {

			var gameVariables = root.getMetaSession().getVariableTable(item.custom.raise_price.item_count_group);
			gameVariables.setVariable(gameVariables.getVariableIndexFromId(item.custom.raise_price.item_count_id), set_count);		
			
		}
	}

	ShopShelfScrollbar._getPrice = function(item) {
		var raisePriceCoefficient = 1;
		var item_count = getVariableItemCount(item);
		
		if (item_count >= 1) {	
			raisePriceCoefficient = Math.pow(item.custom.raise_price.coefficient, item_count);
		}

		return item.getGold() * raisePriceCoefficient;
	}

	ShopLayoutScreen.getGoldFromItem = function(item) {
		var raisePriceCoefficient = 1;
		var item_count = getVariableItemCount(item);
		
		if (item_count >= 1) {	
			raisePriceCoefficient = Math.pow(item.custom.raise_price.coefficient, item_count);
		}

		return item.getGold() * raisePriceCoefficient;
	};

	var alias1 = ItemSale._pushBuyItem;
	ItemSale._pushBuyItem = function(item, isForceStock) {

		var item_count = getVariableItemCount(item);

		if (item_count >= 0) {
			setVariableItemCount(item, item_count + 1);
		}

		alias1.call(this, item, isForceStock);
	};

	var alias2 = ItemSale._cutSellItem;
        ItemSale._cutSellItem = function(item) {

		var item_count = getVariableItemCount(item);

		if (item_count >= 1) {
			setVariableItemCount(item, item_count - 1);
		}
	
		alias2.call(this, item);
	};

})();
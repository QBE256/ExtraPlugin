/*--------------------------------------------------------------------------
　特定の武器やアイテムを使用不能にするステート ver 1.0

■作成者
キュウブ

■概要
特定の武器、アイテム群のみ使用禁止にするステートを設定できます。

■使い方
対象ステートに以下のようなカスパラを設定します。
{
	itemDisabled: {
		isWeapon: <武器であればtrue,杖アイテムであればfalse>,
		ids:[<対象アイテムのIDの配列>]
	}
}

例1.下記のように記述した場合はID16,17の武器のみ使用禁止するステートを設定できます
{
	itemDisabled: {
		isWeapon: true,
		ids: [16, 17]
	}
}

例2.下記のように記述した場合はID18の杖orアイテムのみ使用禁止するステートを設定できます
{
	itemDisabled: {
		isWeapon: false,
		ids: [18]
	}
}

■更新履歴
ver 1.0 2022/04/09

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
	var _ItemControl_isWeaponAvailable = ItemControl.isWeaponAvailable;
	ItemControl.isWeaponAvailable = function (unit, item) {
		var isAvailable = _ItemControl_isWeaponAvailable.apply(this, arguments);

		if (!isAvailable || !item.isWeapon()) {
			return isAvailable;
		}

		if (StateControl.hasItemDisabledState(unit, item)) {
			return false;
		}

		return true;
	};

	var _ItemControl_isItemUsable = ItemControl.isItemUsable;
	ItemControl.isItemUsable = function (unit, item) {
		var isUsable = _ItemControl_isItemUsable.apply(this, arguments);

		if (!isUsable || item.isWeapon()) {
			return isUsable;
		}

		if (StateControl.hasItemDisabledState(unit, item)) {
			return false;
		}

		return true;
	};

	StateControl.hasItemDisabledState = function (unit, item) {
		var i, state;
		var turnStates = unit.getTurnStateList();
		var count = turnStates.getCount();

		for (var index = 0; index < count; index++) {
			state = turnStates.getData(index).getState();
			if (!validateItemDisabledParameter(state)) {
				continue;
			}
			var containsItemDisabled =
				state.custom.itemDisabled.isWeapon === item.isWeapon() &&
				state.custom.itemDisabled.ids.indexOf(item.getId()) >= 0;
			if (containsItemDisabled) {
				return true;
			}
		}

		return false;
	};

	var validateItemDisabledParameter = function (state) {
		var param = state.custom.itemDisabled || {};
		if (!param.hasOwnProperty("isWeapon") || !param.hasOwnProperty("ids")) {
			return false;
		}
		if (typeof param.isWeapon !== "boolean" || !Array.isArray(param.ids)) {
			return false;
		}

		return true;
	};
})();

// Array.isArray polyfill
// reference: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray#polyfill
if (!Array.isArray) {
	Array.isArray = function (arg) {
		return Object.prototype.toString.call(arg) === "[object Array]";
	};
}

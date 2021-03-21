/*
	破損武器自体に値段が設定されていると、
	売る時にお金を支払う事になるバグが存在するのでその修正
	たぶん、報告次第直る案件だと思うので古いverを使っている人用

	対応ver1.161
	作成者:キュウブ
*/
(function(){
	var _Calculator_calculateSellPrice = Calculator.calculateSellPrice;
	Calculator.calculateSellPrice = function(item) {
		if (item.getLimit() === WeaponLimitValue.BROKEN) {
			return 0;
		}
		return _Calculator_calculateSellPrice.call(this, item);
	};
})();
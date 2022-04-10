(function(){
	Miscellaneous.isStealTradeDisabled = function(unit, item, value) {
		if (!(value & StealFlag.WEAPON) && item.isWeapon()) {
			return true;
		}
		if (value & StealFlag.WEIGHT) {
			if (ParamBonus.getBld(unit) < item.getWeight()) {
				return true;
			}
		}	
		return this.isTradeDisabled(unit, item);
	}
})();
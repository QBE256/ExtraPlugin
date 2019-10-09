(function(){
	var alias = AbilityCalculator.getCritical;
	AbilityCalculator.getCritical = function(unit, weapon) {
		if (weapon.custom.invalidCritical === true) {
			return 0;
		}
		else {
			return alias.call(this, unit, weapon);
		}
	}
})();
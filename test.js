UnitCommand.Metamorphoze.endCommandAction = function() {
	return;
};

(function(){
	var _UnitCommand_Metamorphoze_isCommandDisplayable = UnitCommand.Metamorphoze.isCommandDisplayable;
	UnitCommand.Metamorphoze.isCommandDisplayable = function() {
		if (this.getCommandTarget().getMostResentMov() > 0) {
			return false;
		}
		return _UnitCommand_Metamorphoze_isCommandDisplayable.apply(this, arguments);
	};
})();
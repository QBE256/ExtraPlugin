UnitCommand.Metamorphoze._changeEvent = function() {
	var unit = this.getCommandTarget();
	var exp = this._skill.getSkillSubValue();
	var isSkipMode = false;
	var generator = this._dynamicEvent.acquireEventGenerator();
	
	unit.custom.originalClassId = unit.getClass().getId();

	generator.unitMetamorphoze(unit, this._metamorphozeData, MetamorphozeActionType.CHANGE, isSkipMode);
		
	if (exp !== 0) {
		generator.experiencePlus(unit, ExperienceCalculator.getBestExperience(unit, exp), isSkipMode);
	}
		
	this._dynamicEvent.executeDynamicEvent();
		
	this.changeCycleMode(MetamorphozeCommandMode.EVENT);
};

UnitCommand.MetamorphozeCancel.isCommandDisplayable = function() {
	var isCommandDisplayable;
	var unit = this.getCommandTarget();
	var metamorphozeData = MetamorphozeControl.getMetamorphozeData(unit);
		
	if (metamorphozeData === null) {
		return false;
	}

	isCommandDisplayable = metamorphozeData.getCancelFlag() & MetamorphozeCancelFlag.MANUAL;

	if (
		isCommandDisplayable &&
		metamorphozeData.custom.isRestrictCannotMove === true &&
		typeof unit.custom.originalClassId === 'number' &&
		PosChecker.getMovePointFromClass(unit.getMapX(), unit.getMapY(), root.getBaseData().getClassList().getDataFromId(unit.custom.originalClassId)) === 0
	) {
		return false;
	}
		
	return isCommandDisplayable;
};

PosChecker.getMovePointFromClass = function(x, y, cls) {
	var terrain, movePoint;

	if (!CurrentMap.isMapInside(x, y)) {
		return 0;
	}
		
	terrain = this.getTerrainFromPos(x, y);
		
	movePoint = terrain.getMovePointFromMoveTypeId(cls.getClassType().getMoveTypeId());
	
	return movePoint;
};
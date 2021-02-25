UnitRangePanel.initialize = function() {
	this._mapChipLight = createObject(MapChipLight);
	this._mapChipLightWeapon = createObject(MapChipLight);
		
	this._simulator = root.getCurrentSession().createMapSimulator();
};
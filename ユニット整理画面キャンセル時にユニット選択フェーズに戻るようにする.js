MarshalBaseCommand._moveScreen = function() {
	if (this.isMarshalScreenCloesed()) {
		this.changeCycleMode(MarshalBaseMode.UNITSELECT);
		this._unitSelectWindow.setActive(true);
		this._closeCommand();
	}		
	return MoveResult.CONTINUE;
};
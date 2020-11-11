/*
イベントコマンドで"ClickCommand"とする事で決定ボタンを押さない限り先に進まなくなる
*/
(function() {

	var alias1 = ScriptExecuteEventCommand._configureOriginalEventCommand;
	ScriptExecuteEventCommand._configureOriginalEventCommand = function(groupArray) {
		alias1.call(this, groupArray);
	
		groupArray.appendObject(ClickCommand);
	};


	var ClickCommand = defineObject(BaseEventCommand,
	{

		enterEventCommandCycle: function() {
			this._prepareEventCommandMemberData();
		
			if (!this._checkEventCommand()) {
				return EnterResult.NOTENTER;
			}
		
			return this._completeEventCommandMemberData();
		},

		moveEventCommandCycle: function() {
			if (!InputControl.isSelectAction()) {
				return MoveResult.CONTINUE;
			}
			return MoveResult.END;
		},

		drawEventCommandCycle: function() {
		},
	
		getEventCommandName: function() {
			return 'ClickCommand';
		},

		isEventCommandSkipAllowed: function() {
			return false;
		},

		_prepareEventCommandMemberData: function() {
		},

		_checkEventCommand: function() {		
			return true;
		},
	
		_completeEventCommandMemberData: function() {	
			return EnterResult.OK;
		},
	
		_createScreenParam: function() {
			return true;
		}		
	}
	);
})();
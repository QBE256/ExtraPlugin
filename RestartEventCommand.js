/*--------------------------------------------------------------------------
RestartEventCommand ver1.0

The event will run again after it is over.

Author: Cube

How to use
Execute Script->Call Event Command
You write the following in the field above.
EventRestartCommand

This event is restart 


Copyright (c) 2022 Cube
This software is released under the MIT License.
http://opensource.org/licenses/mit-license.php

--------------------------------------------------------------------------*/

var EventRestartControl = {
	_restartEventType: -1,

	reset: function() {
		this._restartEventType = -1;
	},

	setRestartFlag: function(eventType) {
		this._restartEventType = eventType;
	},

	isRestart: function(event) {
		return this._restartEventType === event.getEventType();
	}
};

(function(){

	var _EventChecker_enterEventChecker = EventChecker.enterEventChecker;
	EventChecker.enterEventChecker = function(eventList, eventType) {
		EventRestartControl.reset();
		return _EventChecker_enterEventChecker.apply(this, arguments);
	};

	EventChecker._restartChecker = function() {
		var checkEventIndex = this._eventIndex - 1;
		if (checkEventIndex >= 0 && EventRestartControl.isRestart(this._eventArray[checkEventIndex])) {
			this._eventArray[checkEventIndex].setExecutedMark(EventExecutedType.FREE);
			this._eventIndex = checkEventIndex;
			EventRestartControl.reset();
		}
	};

	EventChecker.moveEventChecker = function() {
		if (this._capsuleEvent === null) {
			EventCommandManager.setActiveEventChecker(null);
			return MoveResult.END;
		}

		if (this._capsuleEvent.moveCapsuleEvent() !== MoveResult.CONTINUE) {
			this._restartChecker();
			if (this._checkEvent() === EnterResult.NOTENTER) {
				EventCommandManager.setActiveEventChecker(null);
				this._capsuleEvent = null;
				return MoveResult.END;
			}
		}
		
		return MoveResult.CONTINUE;
	};

	var _ScriptExecuteEventCommand__configureOriginalEventCommand =
		ScriptExecuteEventCommand._configureOriginalEventCommand;
	ScriptExecuteEventCommand._configureOriginalEventCommand = function (groupArray) {
		_ScriptExecuteEventCommand__configureOriginalEventCommand.call(this, groupArray);
		groupArray.appendObject(EventRestartCommand);
	};

	var EventRestartCommand = defineObject(BaseEventCommand, {

		enterEventCommandCycle: function () {
			return EnterResult.OK;
		},

		moveEventCommandCycle: function () {
			var count = root.getChainEventCount();
			if (count !== 0) {
				var event = root.getChainEvent(count - 1);
				EventRestartControl.setRestartFlag(event.getEventType());
			}
			return MoveResult.END;
		},

		drawEventCommandCycle: function () {
		},

		getEventCommmandName: function () {
			return "EventRestartCommand";
		},

		getEventCommandName: function () {
			return "EventRestartCommand";
		},

		isEventCommandSkipAllowed: function () {
			return true;
		}
	});
})();
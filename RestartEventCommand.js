/*--------------------------------------------------------------------------
RestartEventCommand ver1.1

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

	reset: function () {
		this._restartEventType = -1;
	},

	setRestartFlag: function (eventType) {
		this._restartEventType = eventType;
	},

	isRestart: function (event) {
		return event && this._restartEventType === event.getEventType();
	}
};

(function () {
	var _CapsuleEvent_moveCapsuleEvent = CapsuleEvent.moveCapsuleEvent;
	CapsuleEvent.moveCapsuleEvent = function () {
		var mode = this.getCycleMode();
		var isEventRunning = EventCommandManager.isEventRunning(this._event);
		var isRestart = EventRestartControl.isRestart(this._event);

		if (!isEventRunning && isRestart && mode !== CapsuleEventMode.NONE) {
			EventRestartControl.reset();
			this.enterCapsuleEvent(this._event, this._isExecuteMark);
			return MoveResult.CONTINUE;
		} else {
			return _CapsuleEvent_moveCapsuleEvent.apply(this, arguments);
		}
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

		drawEventCommandCycle: function () {},

		getEventCommmandName: function () {
			return "EventRestartCommand";
		},

		getEventCommandName: function () {
			return "EventRestartCommand";
		},

		isEventCommandSkipAllowed: function () {
			return false;
		}
	});
})();

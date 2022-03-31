/*--------------------------------------------------------------------------
UnitScreenCommand

Author: Cube

How to use

1.Selct Unit
Execute Script->Execute Code
You fill in the fields below with the following information
UnitMenuCommandTargetId = <unit id>;

Example. you want show ID0 unit screen.
UnitMenuCommandTargetId = 0;

2.Show Unit Screen.
Execute Script->Call Event Command
You write the following in the field above.
UnitMenuScreenCommand

Press the Cancel button.
Questions to be answered with yes or no.
If player selected "yes", self switch is A.
If player selected "no", self switch is B.


Copyright (c) 2022 Cube
This software is released under the MIT License.
http://opensource.org/licenses/mit-license.php

--------------------------------------------------------------------------*/

var UnitMenuCommandTargetId = -1;

(function () {
	StringTable.UnitMenuCommand_Question = "Is this okay?";

	var _ScriptExecuteEventCommand__configureOriginalEventCommand =
		ScriptExecuteEventCommand._configureOriginalEventCommand;
	ScriptExecuteEventCommand._configureOriginalEventCommand = function (groupArray) {
		_ScriptExecuteEventCommand__configureOriginalEventCommand.call(this, groupArray);
		groupArray.appendObject(UnitMenuScreenCommand);
	};

	var UnitMenuCommandMode = {
		TOP: 0,
		HELP: 1,
		CHECK: 2
	};
	UnitMenuMode.CHECK = 2;

	var UnitMenuCommandScreen = defineObject(UnitMenuScreen, {
		_questionWindow: null,

		_prepareScreenMemberData: function (screenParam) {
			this._questionWindow = createWindowObject(QuestionWindow, this);
			this._questionWindow.setQuestionMessage(StringTable.UnitMenuCommand_Question);

			UnitMenuScreen._prepareScreenMemberData.apply(this, arguments);
		},

		moveScreenCycle: function () {
			var mode = this.getCycleMode();
			var result = UnitMenuScreen.moveScreenCycle.apply(this, arguments);
			if (mode === UnitMenuMode.CHECK) {
				result = this._moveCheckMode();
			}
			return result;
		},

		_moveCheckMode: function () {
			if (this._questionWindow.moveWindow() !== MoveResult.CONTINUE) {
				if (this._questionWindow.getQuestionAnswer() === QuestionAnswer.YES) {
					root.setSelfSwitch(0, true);
				} else {
					root.setSelfSwitch(1, true);
				}
				return MoveResult.END;
			}
			return MoveResult.CONTINUE;
		},

		_moveTopMode: function () {
			var index;
			var result = MoveResult.CONTINUE;

			this._pageChanger.movePage();

			if (this._pageChanger.checkPage()) {
				this._activePageIndex = this._pageChanger.getPageIndex();
				return result;
			}

			if (InputControl.isSelectAction()) {
				result = this._selectAction();
			} else if (InputControl.isCancelAction()) {
				result = this._cancelAction();
			} else if (InputControl.isOptionAction()) {
				result = this._optionAction();
			}

			return result;
		},

		_cancelAction: function () {
			this._playMenuCancelSound();
			this.changeCycleMode(UnitMenuMode.CHECK);
			return MoveResult.CONTINUE;
		},

		_setMenuData: function () {
			var i, count;
			var method = function (x, y) {
				SceneManager.getLastScreen().getPageChanger().drawPage(x, y);
			};

			count = this._bottomWindowArray.length;
			for (i = 0; i < count; i++) {
				this._bottomWindowArray[i].setUnitMenuData();
			}
		},

		drawScreenCycle: function () {
			var x, y;
			UnitMenuScreen.drawScreenCycle.apply(this, arguments);
			if (this.getCycleMode() === UnitMenuMode.CHECK) {
				x = LayoutControl.getCenterX(-1, this._questionWindow.getWindowWidth());
				y = LayoutControl.getCenterY(-1, this._questionWindow.getWindowHeight());
				this._questionWindow.drawWindow(x, y);
			}
		}
	});

	var UnitMenuScreenCommand = defineObject(BaseEventCommand, {
		_unitMenuScreen: null,

		enterEventCommandCycle: function () {
			this._prepareEventCommandMemberData();

			if (!this._checkEventCommand()) {
				return EnterResult.NOTENTER;
			}

			return this._completeEventCommandMemberData();
		},

		moveEventCommandCycle: function () {
			return this._unitMenuScreen.moveScreenCycle();
		},

		drawEventCommandCycle: function () {
			this._unitMenuScreen.drawScreenCycle();
		},

		getEventCommmandName: function () {
			return "UnitMenuScreenCommand";
		},

		getEventCommandName: function () {
			return "UnitMenuScreenCommand";
		},

		isEventCommandSkipAllowed: function () {
			return false;
		},

		_prepareEventCommandMemberData: function () {
			this._unitMenuScreen = createObject(UnitMenuCommandScreen);
		},

		_checkEventCommand: function () {
			return true;
		},

		_completeEventCommandMemberData: function () {
			var playerUnits = root.getMetaSession().getTotalPlayerList();
			var targetUnit = playerUnits.getDataFromId(UnitMenuCommandTargetId);
			this._unitMenuScreen.setScreenData({
				unit: targetUnit,
				enummode: UnitMenuEnum.SORTIE
			});
			UnitMenuCommandTargetId = -1;
			return EnterResult.OK;
		}
	});
})();

/*--------------------------------------------------------------------------
　バッドステート自然回復時に回復エフェクトを挟む ver 1.0

■作成者
キュウブ

■概要
バッドステートがターン切れで自然回復した場合に、該当ユニットが黄色に点滅します。

※注意1
SRPG Studioではデフォルトでは自軍ターン開始時に敵、同盟軍のステートの残りターン数も減少する仕様ですが、
このプラグインでは処理の都合上、敵軍は敵軍ターン開始時に、同盟軍は同盟軍ターン開始時に減少するようになります。
元の仕様にしたい場合はこのプラグインを改変する必要が出てきます。

※注意2
ステート解除タイミングを注意1で記載されている仕様に変更するプラグイン（もしくはTurnChangeStart._checkStateTurnの中を改変しているプラグイン）
は抜くか、StateControl.decreaseTurnの記述を消してください。
ターン減少処理が2回実行されてしまう可能性があります。

■更新履歴
ver 1.0 (2021/02/26)
初版公開

■対応バージョン
SRPG Studio Version:1.161

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。
・クレジット明記無し　OK (明記する場合は"キュウブ"でお願いします)
・再配布、転載　OK (バグなどがあったら修正できる方はご自身で修正版を配布してもらっても構いません)
・wiki掲載　OK
・SRPG Studio利用規約は遵守してください。

--------------------------------------------------------------------------*/



// この中の処理はRecoveryStateFlowEntryに移行する
TurnChangeStart._checkStateTurn = function() {
	return;
};

var RecoveryStateFlowMode = {
	SCROLL: 0,
	RECOVERY: 1
};

var RecoveryStateFlowEntry = defineObject(BaseFlowEntry,
{
	_badStateReleaseUnits: null,
	_currentUnitIndex: 0,
	_animeCounter: null,
	_soundHandle: null,
	
	enterFlowEntry: function(turnChange) {
		this._prepareMemberData(turnChange);
		return this._completeMemberData(turnChange);
	},
	
	moveFlowEntry: function() {
		var mode = this.getCycleMode();
		var result = MoveResult.END;

		if (mode === RecoveryStateFlowMode.SCROLL) {
			result = this._moveScrollCycle();
		}
		else if (mode === RecoveryStateFlowMode.RECOVERY) {
			result = this._moveRecoveryCycle();
		}

		return result;
	},

	_moveScrollCycle: function() {
		var x = this._badStateReleaseUnits[this._currentUnitIndex].getMapX();
		var y = this._badStateReleaseUnits[this._currentUnitIndex].getMapY();
		var pos = createPos(x, y);

		MapView.setScroll(pos.x, pos.y);
		this.changeCycleMode(RecoveryStateFlowMode.RECOVERY);
		this._playRecoverySound();

		return MoveResult.CONTINUE;
	},

	_moveRecoveryCycle: function() {
		var result = MoveResult.CONTINUE;

		if (this._animeCounter.moveCycleCounter() !== MoveResult.CONTINUE) {
			if (++this._currentUnitIndex < this._badStateReleaseUnits.length) {
				this.changeCycleMode(RecoveryStateFlowMode.SCROLL);
				this._animeCounter.resetCounterValue();
			}
			else {
				result = MoveResult.END;
			}
		}

		return result;
	},
	
	drawFlowEntry: function() {
		var mode = this.getCycleMode();

		if (mode === RecoveryStateFlowMode.SCROLL) {
			result = this._drawScrollCycle();
		}
		else if (mode === RecoveryStateFlowMode.RECOVERY) {
			result = this._drawRecoveryCycle();
		}
	},

	_drawScrollCycle: function() {
		// 何か追加演出したい場合はどうぞ
	},

	_drawRecoveryCycle: function() {
		var unitRenderParam = StructureBuilder.buildUnitRenderParam();

		unitRenderParam.animationIndex = MapLayer.getAnimationIndexFromUnit(this._badStateReleaseUnits[this._currentUnitIndex]);
		unitRenderParam.color.rgbValue = 0xffff66;
		unitRenderParam.isScroll = true;
		unitRenderParam.color.alpha = this._animeCounter.getCounter() % 2 === 0 ? 80 : 205;
		UnitRenderer.drawScrollUnit(
			this._badStateReleaseUnits[this._currentUnitIndex],
			this._badStateReleaseUnits[this._currentUnitIndex].getMapX() * GraphicsFormat.MAPCHIP_WIDTH,
			this._badStateReleaseUnits[this._currentUnitIndex].getMapY() * GraphicsFormat.MAPCHIP_HEIGHT,
			unitRenderParam
		);
	},
	
	_prepareMemberData: function(turnChange) {
		this._dynamicEvent = createObject(DynamicEvent);
		this._animeCounter = createObject(CycleCounter);
		this._badStateReleaseUnits = [];
		this._currentUnitIndex = 0;
	},
	
	_completeMemberData: function(turnChange) {
		StateControl.decreaseTurn(TurnControl.getActorList(), this._badStateReleaseUnits);
		if (this._badStateReleaseUnits.length === 0) {
			return EnterResult.NOTENTER;
		}
		this._animeCounter.setCounterInfo(60);
		this._soundHandle = root.createResourceHandle(true, 706, 0, 0, 0);
		this.changeCycleMode(RecoveryStateFlowMode.SCROLL);

		return EnterResult.OK;
	},

	_playRecoverySound: function() {
		MediaControl.soundPlay(this._soundHandle);
	}
}
);

// 第2引数にバッドステートが回復するユニットを詰め込むための配列を追加する
StateControl.decreaseTurn = function(list, badStateReleaseUnits) {
	var i, j, count, count2, unit, arr, list2, turn, turnState, stateData;
	var isbadStateRelease = false;
		
	count = list.getCount();
	for (i = 0; i < count; i++) {
		arr = [];
		unit = list.getData(i);
		list2 = unit.getTurnStateList();
		count2 = list2.getCount();

		isbadStateRelease = false;
		for (j = 0; j < count2; j++) {
			turnState = list2.getData(j);
			turn = turnState.getTurn();
			if (turn <= 0) {
				continue;
			}

			// ターンを1つ減少させ、新たに設定する
			turn--;
			turnState.setTurn(turn);
			if (turn <= 0) {
				stateData = turnState.getState();
				// ステートを後で解除するために配列へ保存する
				arr.push(stateData);
				// 表示型かつバッドステートが解除される場合はbadStateReleaseUnitsにユニットデータを入れとく
				if (
					isbadStateRelease === false &&
					Array.isArray(badStateReleaseUnits) && 
					stateData.isBadState() &&
					!stateData.isHidden()
				) {
					isbadStateRelease = true;
					badStateReleaseUnits.push(unit);
				}
			}
		}
			
		count2 = arr.length;
		for (j = 0; j < count2; j++) {
			this.arrangeState(unit, arr[j], IncreaseType.DECREASE);
		}
	}
};

(function(){
	var temp1 = TurnChangeStart._prepareMemberData;
	TurnChangeStart._prepareMemberData = function() {
		temp1.call(this);
		this._badStateReleaseUnits = [];
	};

	var temp2 = TurnChangeStart.pushFlowEntries;
	TurnChangeStart.pushFlowEntries = function(straightFlow) {
		temp2.call(this,straightFlow);
		straightFlow.pushFlowEntry(RecoveryStateFlowEntry);
	};

	// キャラチップの色合いも変更できるようにロジックを追加
	UnitRenderer.drawCharChip = function(x, y, unitRenderParam) {
		var dx, dy, dxSrc, dySrc;
		var directionArray = [4, 1, 2, 3, 0];
		var handle = unitRenderParam.handle;
		var width = GraphicsFormat.CHARCHIP_WIDTH;
		var height = GraphicsFormat.CHARCHIP_HEIGHT;
		var xSrc = handle.getSrcX() * (width * 3);
		var ySrc = handle.getSrcY() * (height * 5);
		var pic = this._getGraphics(handle, unitRenderParam.colorIndex);

		if (pic === null) {
			return;
		}
		
		dx = Math.floor((width - GraphicsFormat.MAPCHIP_WIDTH) / 2);
		dy = Math.floor((height - GraphicsFormat.MAPCHIP_HEIGHT) / 2);
		dxSrc = unitRenderParam.animationIndex;
		dySrc = directionArray[unitRenderParam.direction];
		
		pic.setAlpha(unitRenderParam.alpha);
		pic.setDegree(unitRenderParam.degree);
		pic.setReverse(unitRenderParam.isReverse);

		if (unitRenderParam.color.rgbValue !== null) {
			pic.setColor(unitRenderParam.color.rgbValue, unitRenderParam.color.alpha);
		}

		pic.drawStretchParts(x - dx, y - dy, width, height, xSrc + (dxSrc * width), ySrc + (dySrc * height), width, height);
	};

	// 旧バージョン用
	UnitRenderer._drawCharChip = function(x, y, unitRenderParam) {
		UnitRenderer.drawCharChip.call(this, x, y, unitRenderParam);
	};

	var temp3 = StructureBuilder.buildUnitRenderParam;
	StructureBuilder.buildUnitRenderParam = function() {
		var unitRenderParam = temp3.call(this);

		unitRenderParam.color = {
			rgbValue: null,
			alpha: 255
		};
		return unitRenderParam;
	};
})();

// Array.isArray polyfill
// Reference:https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray#polyfill
if (!Array.isArray) {
	Array.isArray = function(value) {
		return Object.prototype.toString.call(value) === '[object Array]';
	};
};

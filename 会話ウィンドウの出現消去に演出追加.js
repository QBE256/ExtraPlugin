/*--------------------------------------------------------------------------
　会話ウィンドウの出現消去に演出追加 ver 1.0

■作成者
キュウブ

■概要
デフォルトでは会話ウィンドウは突然現れたり、消えますが、
このスクリプトを導入すると出現、消去時に演出が入るようになります。

■注意点
イベント終了時に会話ウィンドウが残ったままだと正しく消去されない可能性があります。
必ず、イベント終了時、

・メッセージの表示コマンドによる会話ウィンドウが残っている場合
「メッセージ消去」と「ウェイト」を入れて消去演出の間を設けてください。
・スチルメッセージコマンドによる会話ウィンドウが残っている場合
「ウェイト」を入れて消去演出の間を設けてください。

※ウェイトは10フレームで十分です。


■更新履歴
ver 1.0 (2021/12/12)
初版

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

(function(){
	var MessageViewMode = {
		APPEAR: 0,
		SHOW: 1,
		ERASE: 2,
		NONE: 3
	};
	BaseMessageView._appearFrame = 10;
	BaseMessageView._eraseFrame = 10;
	BaseMessageView._appearCounter = null;
	BaseMessageView._eraseCounter = null;
	var _BaseMessageView_setupMessageView = BaseMessageView.setupMessageView;
	BaseMessageView.setupMessageView = function(messageViewParam) {
		this._appearCounter = createObject(CycleCounter);
		this._appearCounter.disableGameAcceleration();
		this._appearCounter.setCounterInfo(this._appearFrame);
		this._eraseCounter = createObject(CycleCounter);
		this._eraseCounter.disableGameAcceleration();
		this._eraseCounter.setCounterInfo(this._eraseFrame);
		this.changeCycleMode(MessageViewMode.APPEAR);

		_BaseMessageView_setupMessageView.apply(this, arguments);
	};

	// メッセージテロップは演出を省略する
	TeropView.setupMessageView = function(messageViewParam) {
		this._appearCounter = createObject(CycleCounter);
		this._appearCounter.disableGameAcceleration();
		this._appearCounter.setCounterInfo(0);
		this._eraseCounter = createObject(CycleCounter);
		this._eraseCounter.disableGameAcceleration();
		this._eraseCounter.setCounterInfo(0);
		this.changeCycleMode(MessageViewMode.SHOW);

		_BaseMessageView_setupMessageView.apply(this, arguments);
	};

	BaseMessageView.skipAppear = function() {
		this.changeCycleMode(MessageViewMode.SHOW);
	};

	BaseMessageView.setErase = function() {
		this.changeCycleMode(MessageViewMode.ERASE);
	};

	var _FaceView_setupMessageView = FaceView.setupMessageView;
	FaceView.setupMessageView = function(messageViewParam) {
		var pos = messageViewParam.pos;

		if (pos === MessagePos.TOP && this._topView) {
			_FaceView_setupMessageView.apply(this, arguments);
			this._topView.skipAppear();
		}
		else if (pos === MessagePos.CENTER && this._centerView) {
			_FaceView_setupMessageView.apply(this, arguments);
			this._centerView.skipAppear();
		}
		else if (pos === MessagePos.BOTTOM && this._bottomView) {
			_FaceView_setupMessageView.apply(this, arguments);
			this._bottomView.skipAppear();
		}
		else {
			_FaceView_setupMessageView.apply(this, arguments);
		}
	};
	var _BaseMessageView_moveMessageView = BaseMessageView.moveMessageView;
	BaseMessageView.moveMessageView = function() {
		var mode = this.getCycleMode();
		if (mode === MessageViewMode.APPEAR) {
			return this._moveAppear();
		}
		else if (mode === MessageViewMode.ERASE) {
			return this._moveErase();
		}
		else {
			return _BaseMessageView_moveMessageView.call(this);
		}
	};

	var _StillView_moveMessageView = StillView.moveMessageView;
	StillView.moveMessageView = function() {
		var mode = this.getCycleMode();
		var showMoveResult;
		if (mode === MessageViewMode.APPEAR) {
			return this._moveAppear();
		}
		else if (mode === MessageViewMode.ERASE) {
			return this._moveErase();
		}
		else {
			showMoveResult = _StillView_moveMessageView.call(this);
			if (showMoveResult !== MoveResult.CONTINUE) {
				this.changeCycleMode(MessageViewMode.ERASE);
			}
			return MoveResult.CONTINUE;
		}
	};

	var _BaseMessageView_drawMessageView = BaseMessageView.drawMessageView;
	BaseMessageView.drawMessageView = function(isActive, pos) {
		var mode = this.getCycleMode();

		if (mode === MessageViewMode.APPEAR) {
			this._drawAppear(pos);
		}
		else if (mode === MessageViewMode.ERASE) {
			this._drawErase(pos);
		}
		else {
			_BaseMessageView_drawMessageView.apply(this, arguments);
		}
	};

	BaseMessageView._moveAppear = function() {
		if (this._appearCounter.moveCycleCounter() !== MoveResult.CONTINUE) {
			this.changeCycleMode(MessageViewMode.SHOW);
		}
		return MoveResult.CONTINUE;
	};

	BaseMessageView._moveErase = function() {
		if (this._eraseCounter.moveCycleCounter() !== MoveResult.CONTINUE) {
			this.changeCycleMode(MessageViewMode.NONE);
			return MoveResult.END;
		}
		return MoveResult.CONTINUE;
	};

	BaseMessageView._drawAppear = function(pos) {
		var textui = this._messageLayout.getWindowTextUI();
		var picWindow = textui.getUIImage();
		var currentFrame = this._appearCounter.getCounter();
		var currentHeight = Math.floor(UIFormat.TEXTWINDOW_HEIGHT / this._appearFrame * currentFrame);
		var xWindow = pos.x + this._messageLayout.getWindowX();
		var yWindow = pos.y + this._messageLayout.getWindowY() + UIFormat.TEXTWINDOW_HEIGHT / 2 - Math.floor(currentHeight / 2);

		if (picWindow === null || !this._isWindowDisplayable) {
			return;
		}
		
		picWindow.drawStretchParts(
			xWindow,
			yWindow,
			UIFormat.TEXTWINDOW_WIDTH,
			currentHeight, 
			0,
			0,
			UIFormat.TEXTWINDOW_WIDTH, 
			UIFormat.TEXTWINDOW_HEIGHT
		);
	};

	BaseMessageView._drawErase = function(pos) {
		var textui = this._messageLayout.getWindowTextUI();
		var picWindow = textui.getUIImage();
		var currentFrame = this._eraseCounter.getCounter();
		var currentHeight = Math.floor(UIFormat.TEXTWINDOW_HEIGHT / this._eraseFrame * (this._eraseFrame - currentFrame));
		var xWindow = pos.x + this._messageLayout.getWindowX();
		var yWindow = pos.y + this._messageLayout.getWindowY() + UIFormat.TEXTWINDOW_HEIGHT / 2 - Math.floor(currentHeight / 2);

		if (picWindow === null || !this._isWindowDisplayable) {
			return;
		}

		picWindow.drawStretchParts(
			xWindow,
			yWindow,
			UIFormat.TEXTWINDOW_WIDTH,
			currentHeight, 
			0,
			0,
			UIFormat.TEXTWINDOW_WIDTH, 
			UIFormat.TEXTWINDOW_HEIGHT
		);
	};

	// 会話ウィンドウの消去演出のために、毎フレーム各会話ウィンドウのmoveMessageViewを呼び出す。
	// 本来であればFaceView.moveMessageView内に入れておくのが妥当だが、
	// イベント終了時など一部の状況下で
	// 呼び出し元となるMessageShowEventCommand.moveEventCommandCycleが呼び出されない可能性がある。
	// よって、各会話ウィンドウが存在する限り確実に毎フレーム呼び出されるFaceView.drawMessageViewを利用する。
	var _FaceView_drawMessageView = FaceView.drawMessageView;
	FaceView.drawMessageView = function() {
		if (
			this._topView &&
			this._topView.getCycleMode() === MessageViewMode.ERASE &&
			this._topView.moveMessageView() !== MoveResult.CONTINUE
		) {
			this._topView = null;
		}
		if (
			this._centerView &&
			this._centerView.getCycleMode() === MessageViewMode.ERASE &&
			this._centerView.moveMessageView() !== MoveResult.CONTINUE
		) {
			this._centerView = null;
		}
		if (
			this._bottomView &&
			this._bottomView.getCycleMode() === MessageViewMode.ERASE &&
			this._bottomView.moveMessageView() !== MoveResult.CONTINUE
		) {
			this._bottomView = null;
		}
		_FaceView_drawMessageView.call(this);
	};

	// 各会話ウィンドウのインスタンスを会話削除時に即座に破棄しないようにする
	FaceView.eraseMessage = function(flag) {
		if (flag & MessageEraseFlag.TOP) {
			if (this._topView !== null) {
				this._topView.setErase();
				this._topView.endMessageView();
			}
		}
		
		if (flag & MessageEraseFlag.CENTER) {
			if (this._centerView !== null) {
				this._centerView.setErase();
				this._centerView.endMessageView();
			}
		}
		
		if (flag & MessageEraseFlag.BOTTOM) {
			if (this._bottomView !== null) {
				this._bottomView.setErase();
				this._bottomView.endMessageView();
			}
		}
		this._activePos = MessagePos.NONE;
	};

})();
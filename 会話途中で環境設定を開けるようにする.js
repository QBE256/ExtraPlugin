/*--------------------------------------------------------------------------
　会話途中で環境設定を開けるようにする ver 1.0

■作成者
キュウブ

■概要
このスクリプトを導入すると
会話中にCキーを押すとイベントを中断して環境設定が開けるようになります。

■更新履歴
ver 1.0 (2021/07/05)
公開 

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
	MessageViewControl._configScreen = null;
	MessageViewControl._isDisableCancelState = false;
	MessageViewControl._isConfigInput = function() {
		return root.isInputAction(InputType.BTN3);
	};
	MessageViewControl.isConfig = function() {
		return this._configScreen !== null;
	};

	MessageViewControl.setIsDisableCancelState = function(isDisable) {
		this._isDisableCancelState = isDisable;
	};

	MessageViewControl.isDisableCancelState = function() {
		return this._isDisableCancelState;
	};

	var _MessageViewControl_reset = MessageViewControl.reset;
	MessageViewControl.reset = function() {
		_MessageViewControl_reset.call(this);
		this._configScreen = null;
		this._isDisableCancelState = false;
		SceneManager.setForceForeground(false);
	};

	MessageViewControl.moveConfig = function() {
		if (this._configScreen){
			if (SceneManager.isScreenClosed(this._configScreen)) {
				this._configScreen = null;
				SceneManager.setForceForeground(false);
				this._isDisableCancelState = true;
				return MoveResult.END;
			}
		}
		else if (this._isConfigInput()) {
			this._configScreen = createObject(ConfigScreen);
			SceneManager.addScreen(this._configScreen, {});
			SceneManager.setForceForeground(true);
		}
		return MoveResult.CONTINUE;
	};

	var _MessageAnalyzer__isCancelAllowed = MessageAnalyzer._isCancelAllowed;
	MessageAnalyzer._isCancelAllowed = function() {
		return !MessageViewControl.isDisableCancelState() && _MessageAnalyzer__isCancelAllowed.call(this);
	};

	var _BaseMessageView_moveMessageView = BaseMessageView.moveMessageView;
	BaseMessageView.moveMessageView = function() {
		if (MessageViewControl.moveConfig() !== MoveResult.CONTINUE || MessageViewControl.isConfig()) {
			return MoveResult.CONTINUE;
		}
		else if (!InputControl.isCancelState()) {
			MessageViewControl.setIsDisableCancelState(false);
		}
		return _BaseMessageView_moveMessageView.call(this);
	};

	var _BaseMessageView_drawMessageView = BaseMessageView.drawMessageView;
	BaseMessageView.drawMessageView = function(isActive, pos) {
		if (MessageViewControl.isConfig()) {
			return;
		}
		_BaseMessageView_drawMessageView.apply(this, arguments);
	};

	EventCommandController.moveEventCommandControllerCycle = function(eventContainer) {
		var result, exitCode;
			
		// スキップキーが押された場合は、
		// そのイベントのメイン処理(mainEventCommand)を実行して終了する。
		// ただし、isEventCommandSkipAllowedを呼び出すことで、スキップが許可されているかを調べる
		if (eventContainer.isEventCommandSkipAllowed() && !MessageViewControl.isBacklog() && !MessageViewControl.isConfig() && (InputControl.isStartAction() || root.isEventSkipMode())) {
			exitCode = eventContainer.mainEventCommand();
			
			// スキップ状態にする。
			// CurrentMap.setTurnSkipMode(true)を呼び出すのではない。
			root.setEventSkipMode(true);
			
			root.endEventCommand(exitCode);
			
			MessageViewControl.setHidden(false);
			
			return MoveResult.END;
		}
		
		result = eventContainer.moveEventCommandCycle();
		if (result === MoveResult.END) {
			// イベントが完了したことを示す
			this.endEventCommand(EventResult.OK);
		}
		
		return result;
	}
})();
/*----------------------------------------------------------
出撃準備画面から拠点に戻るコマンド ver1.0

■概要
出撃準備画面から拠点に戻る事ができるようになります。
wizさんの退却コマンドとは異なり、こちらは通常マップでも使用可能ですが出撃準備コマンドでしか出てきません。
また、拠点を終了すると再度OPイベントも流れます。
一度しか流すべきではないOPイベントに関しては実行条件をうまく組み立てて対応してください。

■作成者
キュウブ

ver 1.0 2022/05/13
初版

■対応バージョン
SRPG Studio Version:1.161

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。
・クレジット明記無し　OK (明記する場合は"キュウブ"でお願いします)
・再配布、転載　OK (バグなどがあったらプルリクエストしてくださると嬉しいです)
・wiki掲載　OK
・SRPG Studio利用規約は遵守してください。
----------------------------------------------------------*/

CommandActionType.MOVEREST = 506;

SetupCommand.MoveRest = defineObject(BaseListCommand,
{
	_questionWindow: null,
	
	openCommand: function() {
		this._questionWindow = createWindowObject(QuestionWindow, this);
		this._questionWindow.setQuestionMessage("拠点に戻りますか？");
		this._questionWindow.setQuestionActive(true);
	},
	
	moveCommand: function() {
		if (this._questionWindow.moveWindow() !== MoveResult.CONTINUE) {
			if (this._questionWindow.getQuestionAnswer() === QuestionAnswer.YES) {
				UnitProvider.recoveryPlayerList();
				root.changeScene(SceneType.REST);
			}
			return MoveResult.END;
		}
		
		return MoveResult.CONTINUE;
	},
	
	drawCommand: function() {
		var x = LayoutControl.getCenterX(-1, this._questionWindow.getWindowWidth());
		var y = LayoutControl.getCenterY(-1, this._questionWindow.getWindowHeight());
		
		this._questionWindow.drawWindow(x, y);
	},

	getCommandName: function() {
		return "拠点に戻る";
	}
}
);

(function(){
	var _CommandMixer_mixCommand = CommandMixer.mixCommand;
	CommandMixer.mixCommand = function(index, groupArray, baseObject) {
		 _CommandMixer_mixCommand.apply(this, arguments);

		if (index === CommandLayoutType.BATTLESETUP) {
			this.pushCommand(SetupCommand.MoveRest, CommandActionType.MOVEREST);
			groupArray.appendObject(this._getObjectFromActionType(CommandActionType.MOVEREST));
		}
	};
})();
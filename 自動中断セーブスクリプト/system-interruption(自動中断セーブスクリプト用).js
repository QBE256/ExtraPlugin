
/*--------------------------------------------------------------------------
  
  ※公式スクリプトを自動中断セーブスクリプト用に改変したものです(一行だけ)

  TitleCommandに「中断から始める」という項目を追加します。
  
  作成者:
  サファイアソフト
  http://srpgstudio.com/
  
  更新履歴:
  2016/09/07 カスタムデータを保存するコードを追加
  2015/08/17 マウス対応コードを追加
  2015/05/11 root.resetGameの呼び出しを追加
  2015/04/08 公開
  
--------------------------------------------------------------------------*/

(function() {

var alias1 = TitleScene._configureTitleItem;
TitleScene._configureTitleItem = function(groupArray) {
	alias1.call(this, groupArray);
	
	groupArray.insertObject(TitleCommand.Interruption, 2);
};

TitleCommand.Interruption = defineObject(BaseTitleCommand,
{
	openCommand: function() {
		AutoSavedControl.setCustomParameter();
		root.getLoadSaveManager().loadInterruptionFile();
	},
	
	moveCommand: function() {
		return MoveResult.END;
	},
	
	getCommandName: function() {
		return '中断から始める';
	},
	
	isSelectable: function() {
		return root.getLoadSaveManager().isInterruptionFileLoadable();
	}
}
);

var alias2 = MapCommand.configureCommands;
MapCommand.configureCommands = function(groupArray) {
	alias2.call(this, groupArray);
	
	groupArray.insertObject(MapCommand.Interruption, groupArray.length - 1);
};

MapCommand.Interruption = defineObject(BaseListCommand,
{
	_questionWindow: null,

	openCommand: function() {
		this._questionWindow = createWindowObject(QuestionWindow, this);
		this._questionWindow.setQuestionMessage(this._getMessage());
		this._questionWindow.setQuestionActive(true);
	},
	
	moveCommand: function() {
		var ans;
		
		if (this._questionWindow.moveWindow() !== MoveResult.CONTINUE) {
			ans = this._questionWindow.getQuestionAnswer();
			if (ans === QuestionAnswer.YES) {
				root.getLoadSaveManager().saveInterruptionFile(SceneType.FREE, root.getCurrentSession().getCurrentMapInfo().getId(), this._getCustomObject());
				root.resetGame();
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
		return '中断';
	},
	
	_getMessage: function() {
		return 'ゲームを中断しますか？';
	},
	
	_getCustomObject: function() {
		return {};
	}
}
);

})();

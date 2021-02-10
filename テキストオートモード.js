/*--------------------------------------------------------------------------
　テキストオートモード ver 1.0

■作成者
キュウブ

■概要
環境にテキスト自動送り項目が追加されます。
オンにしておくと全てのテキストが自動送り(120フレーム)されるようになります。

※仕様
このプラグインを導入すると
決定キー、キャンセルキーを入力した時に
制御文字の\atが無効化されてページ送りされます。

■更新履歴
ver 1.0 (2021/02/11)
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

(function(){
	var temp1 = MessageAnalyzer.setMessageAnalyzerText;
	var temp2 = ConfigWindow._configureConfigItem;

	var AutoTextMode = {
		ON: 0,
		OFF: 1
	};

	MessageAnalyzer.setMessageAnalyzerText = function(text) {
		if (root.getExternalData().env.isAutoText === AutoTextMode.ON) {
			text = "\\at[120]" + text;
		}
		temp1.call(this, text);
	};

	WaitParts.Auto.moveWaitParts = function() {
		if (InputControl.isSelectAction() || Miscellaneous.isGameAcceleration()) {
			this._isWaitMode = false;
			this.doEndWaitAction();
			return MoveResult.END;
		}

		return BaseWaitParts.moveWaitParts.call(this);
	};

	ConfigWindow._configureConfigItem = function(groupArray) {
		temp2.call(this, groupArray);
		groupArray.appendObject(ConfigItem.AutoTextMode);
	};

	ConfigItem.AutoTextMode = defineObject(BaseConfigtItem,
	{
		selectFlag: function(index) {		
			root.getExternalData().env.isAutoText = index;
		},
	
		getFlagValue: function() {
			if (typeof root.getExternalData().env.isAutoText !== 'number') {
				return AutoTextMode.OFF;
			}

			return root.getExternalData().env.isAutoText;
		},
	
		getFlagCount: function() {
			return 2;
		},
	
		getConfigItemTitle: function() {
			return "テキスト自動送り";
		},
	
		getConfigItemDescription: function() {
			return "テキストを自動送りするか選択します";
		},
	
		getObjectArray: function() {
			return ['オン', 'オフ'];
		}
	});
})();
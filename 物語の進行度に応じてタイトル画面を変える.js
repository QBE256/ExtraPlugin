/*--------------------------------------------------------------------------
　物語の進行度に応じてタイトル画面を変更する ver 1.0

■作成者
キュウブ

■概要
特定のグローバルスイッチがオンになっているセーブデータが存在する場合にタイトル画面が変化します。

■使い方
1.コンフィグ->スクリプト->グローバルパラメータにて以下のパラメータを設定します。
	
changeTitle: {
	isRuntime: <変化先のタイトル画像がランタイムであればtrue,オリジナルであればfalse>,
	id: <変化先のタイトル画像ID>
}
※注意※
screenback内の画像のみ指定可能です。

2.このファイル内にあるCHANGE_TITILE_SWITCH_IDの値にフラグとなるグローバルスイッチのIDを記入します。

3.CHANGE_TITILE_SWITCH_IDに指定したグローバルスイッチをオンにした上でセーブを行う。
タイトルを切り替えたいタイミングでグローバルスイッチをオンに変更してください。
その後、セーブさえ行っていればタイトル画面が切り替わると思います。

■更新履歴
ver 1.0 (2021/2/18)
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

var CHANGE_TITILE_SWITCH_ID = 0;//ここにフラグとなるグローバルスイッチのIDを記入する

(function(){
	var alias1 = TitleScene._setBackgroundData;
	TitleScene._setBackgroundData = function() {
		var pic, handle;
		var changeTitleData = root.getMetaSession().global.changeTitle;
		if (typeof changeTitleData === 'object' && this._isChangeTitle()) {
			handle = root.createResourceHandle(changeTitleData.isRuntime, changeTitleData.id, 0, 0, 0);
			pic = GraphicsRenderer.getGraphics(handle, GraphicsType.SCREENBACK);
			this._scrollBackground.startScrollBackground(pic);
		}
		else {
			alias1.call(this);
		}
	};

	TitleScene._isChangeTitle = function() {
		var saveFileInfo, chapterNumber, mapType;
		var count = DefineControl.getMaxSaveFileCount();

		for (var index = 0; index < count; index++) {
			saveFileInfo = root.getLoadSaveManager().getSaveFileInfo(index);
			if (!saveFileInfo.getMapInfo() && !saveFileInfo.isCompleteFile()) {
				continue;
			}
			if (saveFileInfo.custom.isChangeTitle === true) {
				return true;
			}
		}

		return false;
	};

	var alias2 = LoadSaveScreen._getCustomObject;
	LoadSaveScreen._getCustomObject = function() {
		var customObject = alias2.call(this);
		var metaSession = root.getMetaSession();
		var globalSwitch;

		globalSwitchTable = metaSession.getGlobalSwitchTable();
		if (globalSwitchTable.isSwitchOn(globalSwitchTable.getSwitchIndexFromId(CHANGE_TITILE_SWITCH_ID))) {
			customObject.isChangeTitle = true;
		}
		return customObject;
	}
})();
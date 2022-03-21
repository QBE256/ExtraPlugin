/*--------------------------------------------------------------------------
　ロード強制表示 ver 1.1

■作成者
キュウブ

■概要
環境項目からロード表示有無の項目が消えて、
ロードコマンドがマップコマンド上で強制的に表示されるようになります(レイアウト設定で非表示にしている場合はもちろん表示されません)

↓ver 1.0までの仕様↓
※環境系の他スクリプトと競合する可能性があります。その時は ConfigWindow._configureConfigItem の中をいじって何とかしてください。

■更新履歴
ver1.1 2022/03/21
競合が起きにくいように不親切な部分を改修

ver1.0 2020/09/17
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

LoadScreenLauncher.isLaunchable = function() {
	return true;
};

(function(){
	var _ConfigWindow__isVisible = ConfigWindow._isVisible;
	ConfigWindow._isVisible = function(commandLayoutType, commandActionType) {
		if (commandLayoutType === CommandLayoutType.MAPCOMMAND && commandActionType === CommandActionType.LOAD) {
			return false;
		}
		return _ConfigWindow__isVisible.apply(this, arguments);
	}
})();
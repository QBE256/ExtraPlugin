/*--------------------------------------------------------------------------
　ユニット整理画面キャンセル時にユニット選択フェーズに戻るようにする ver 1.0

■作成者
キュウブ

■概要
出撃準備におけるストック交換やユニット交換などにおいて
通常は コマンド選択->ユニット選択->交換画面と遷移した後、キャンセルボタンを押すとコマンド選択まで一気に戻ります。
このプラグインを導入するとユニット選択に戻るようになります。

■更新履歴
ver 1.0 (2020/05/14)
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

MarshalBaseCommand._moveScreen = function() {
	if (this.isMarshalScreenCloesed()) {
		this.changeCycleMode(MarshalBaseMode.UNITSELECT);
		this._unitSelectWindow.setActive(true);
		this._closeCommand();
	}		
	return MoveResult.CONTINUE;
};
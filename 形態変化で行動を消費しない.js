/*
 形態変化で行動を消費しなくなる ver 1.1

■作成者
キュウブ

■概要
形態変化や解除コマンド実行後も別の行動が取れるようになります。
つまり、
・形態変化->移動->攻撃
・移動後->形態変化->攻撃
といった事ができるようになります。

■更新履歴
ver 1.1 (2022/2/13)
実行後に形態変化コマンドが残らないように処理追加

ver 1.0 (2022/2/13)
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

*/

UnitCommand.Metamorphoze.endCommandAction = function() {
	this.rebuildCommand();
};

UnitCommand.MetamorphozeCancel.endCommandAction = function() {
	this.rebuildCommand();
};
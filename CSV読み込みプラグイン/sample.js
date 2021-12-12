/*--------------------------------------------------------------------------
　CSVファイルパース関数の使用例

■作成者
キュウブ

■概要
※CSVファイルをパースする.jsの使用例です。
※あくまでも関数の使用例なのでゲームの機能としての価値はありません。
※コーディングする際の参考としてください。

このスクリプトでは
このファイルで記載されているグローバル変数のtest1,test2,test3の値を
variables.csvに記載された値に変更する事ができます。
Materialフォルダに"csvtest"という名前のフォルダを作成し、"variables.csv"を入れときます。
スクリプトの実行で　CSVTest() を実行してみると
コンソールログに変化前のグローバル変数と変化後のグローバル変数が出力されます。

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

var test1 = 'Nash';
var test2 = 'Lambert';
var test3 = 'Heren';

var CSVTest = function() {
	var globalVariables = readCSVFile('csvtest', 'variables.csv');
	for (var index = 0; index < globalVariables.length; index++) {
		if (globalVariables[index][0] in this) {
			root.log(globalVariables[index][0] + 'の値は' + this[globalVariables[index][0]]);
			this[globalVariables[index][0]] = globalVariables[index][1];
			root.log(globalVariables[index][0] + 'の値が' + this[globalVariables[index][0]] + 'になりました');
		}
	}
};
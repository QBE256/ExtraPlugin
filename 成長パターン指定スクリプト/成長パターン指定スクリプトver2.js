/*--------------------------------------------------------------------------
　成長パターン指定スクリプト ver 2.0

■作成者
キュウブ

■概要
※本スクリプトを使用する場合は前バージョンの"成長パターン指定スクリプト.js"は抜いてください。
※本スクリプトを使用するには"CSVをパースする.js"を導入する必要があります。
https://github.com/QBE256/ExtraPlugin/blob/master/CSV%E8%AA%AD%E3%81%BF%E8%BE%BC%E3%81%BF%E3%83%97%E3%83%A9%E3%82%B0%E3%82%A4%E3%83%B3/CSV%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB%E3%82%92%E3%83%91%E3%83%BC%E3%82%B9%E3%81%99%E3%82%8B.js

レベルアップ時に上がるパラメータがカスパラで指定した通りになります。
例えば
レベル2の時は必ずHP+1, 力+1
レベル3の時は必ずHP+2, 速さ+1
レベル4の時は必ず力+1, 守+2
といった具合に成長速度を不規則にした上で固定化できます。

※カスパラを設定していないユニットは通常の乱数成長になります

本スクリプトVer2.0ではカスタムパラメータではなく、CSVファイルで成長パターンを管理できるようになります。

■使い方
1.付属のGrowthPatternsフォルダをMaterialフォルダの中にコピペします

2.GrowthPatternsの中にある付属ファイルのsample.csvをコピペします
※ファイル名は何でも構いません(とはいえ、半角英数字の文字列にしておくのが無難だと思います)

3.2で作成したファイルに成長値を記載します

ファイル構成は
LV,HP,力,魔力,技,速さ,幸運,守備,魔防,移動,熟練度となっており、
到達LV時の上昇量をそれぞれのセルに記載してください。

例えば、
LV,HP,力,魔力,技,速さ,幸運,守備,魔防,移動,熟練度が
4,1,0,3,3,3,0,-1,0,1,0と記入されている場合は
LV4になった時にHP+1、魔力+3、技+3、速さ+3、守備-1、移動+1という伸び方をするようになります。

※クラスチェンジ時にLV1に戻る場合の上級職の成長パターン設定
例えば、カンスト値がLV20である場合は、
LV21以上で上級職の成長パターンを記載してください。
後述の通り、クラスチェンジでLV補正をかける事が可能です。

4.対象ユニットにカスタムパラメータでファイル指定を行う
対象ユニットのカスパラに下記を設定します
growthControlV2:{
	file: "<対象ファイル名>.csv",
	highClassCorrection: <高LV補正値>
}

fileには対象成長パターンファイルのファイル名を記入してください。
highClassCorrectionはクラスチェンジ時にLV1に戻る設定の場合、
設定した値の分だけLVに補正がかかります。
例えば、20と設定しておくと上級LV2到達時にはLV22の成長パターンを適用するようになります。

※LV1に戻す予定が無い場合はこのカスパラは"設定しないでください


■設定例
例1: nash.csvをナッシュに適用させる場合
ナッシュのカスパラに
growthControlV2:{
	file: "nash.csv"
}

例2: lambart.csvをランバートに適用させる,かつ下級職LV20でカンストしてクラスチェンジでLV1に戻る仕様の場合
growthControlV2:{
	file: "lambart.csv",
	highClassCorrection: 20
}

※下記の場合だと上級LV2時にLV21の設定が反映されるようになります。どちらが設定しやすいかによってお好みで。
growthControlV2:{
	file: "lambart.csv",
	highClassCorrection: 19
}

■更新履歴
ver 2.0 (2021/12/14)
CSVファイル対応
成長パターンの設定がやりやすくなった代わりにver1.0と互換は切りました

ver 1.0 (2017/05/20)
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
	var LV_INDEX = 0;
	var _ExperienceControl__createGrowthArray = ExperienceControl._createGrowthArray;
	ExperienceControl._createGrowthArray = function(unit) {
		var matchIndex = -1;
		if (typeof unit.custom.growthControlV2 !== 'object') {
			return _ExperienceControl__createGrowthArray.apply(this, arguments);
		}
		var growthPatterns = readCSVFile('GrowthPatterns', unit.custom.growthControlV2.file);
		var nextLv = unit.getLV();
		if (
			'highClassCorrection' in unit.custom.growthControlV2 &&
			unit.getClass().getClassRank() === ClassRank.HIGH
		) {
			nextLv += unit.custom.growthControlV2.highClassCorrection;
		}
		for (var index = 0; index < growthPatterns.length; index++) {
			if (growthPatterns[index][LV_INDEX] === nextLv) {
				matchIndex = index;
				break;
			}
		}
		if (matchIndex === -1) {
			root.log("[WARN]対象成長パターン LV" + nextLv + "が存在しません");
			return _ExperienceControl__createGrowthArray.apply(this, arguments);
		}
		growthPatterns[matchIndex].shift();
		return growthPatterns[matchIndex];
	};
})();
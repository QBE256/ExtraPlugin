/*--------------------------------------------------------------------------
　乱数成長の乱数を固定する(吟味防止策) ver 1.0

■作成者
キュウブ

■概要
レベルアップした時点で次のレベルアップ時の乱数を固定させる事ができます。
つまり乱数成長でありながらセーブ&ロードによる吟味が不可能になります（初めてのレベルアップは無理、固定されるのは2回目以降になります）。

■更新履歴
ver 1.0 (2020/4/16)
初版作成

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
	var alias = ExperienceControl._createGrowthArray;
	ExperienceControl._createGrowthArray = function(unit) {
		var nextGrowthArray, growthArray;
		var weapon = ItemControl.getEquippedWeapon(unit);

		if (typeof unit.custom.nextGrowthArray === 'object') {
			growthArray = unit.custom.nextGrowthArray;
		}
		else {
			growthArray = alias.call(this, unit);
		}

		// 次レベルアップした時の成長を決定する
		nextGrowthArray = alias.call(this, unit);
		unit.custom.nextGrowthArray = nextGrowthArray;

		return growthArray;
	};

})();
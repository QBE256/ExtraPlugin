/*
ワープの転送先に制限を設ける ver1.0
■作成者
キュウブ

■概要
地形効果のカスパラにisEnabledTeleportation:trueを記載していない地形に対してはワープで転送できなくなる

■更新履歴
ver 1.0 (2021/04/28)
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
*/

(function(){
	var _TeleportationItemSelection__isPosEnabled = TeleportationItemSelection._isPosEnabled;
	TeleportationItemSelection._isPosEnabled = function(x, y, targetUnit) {
		if (!PosChecker.isEnabledWarpPos(x, y)) {
			return false;
		}
		return _TeleportationItemSelection__isPosEnabled.apply(this, arguments);
	};
})();

PosChecker.isEnabledWarpPos = function(x, y) {
	var terrain;
	if (!(terrain = this.getTerrainFromPos(x, y))) {
		return false;
	}
	if (terrain.custom.isEnabledTeleportation === true) {
		return true;
	}
	else {
		return false;
	}
};
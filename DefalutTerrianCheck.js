/*
  空白地形チェック機能 ver 1.1

[概要]
このプラグインを導入するとで地形名が"空白"となっている箇所が赤く染まります。
デバッグ用のプラグインなので公開時には抜いておくことを推奨します。

導入するとマップ開始時に"Default terrian found <空白地形の数>"というメッセージが出てくるはずです。
これが表示されない場合は競合などが原因でプラグインが正しく動いていないと考えてください。

[推奨バージョン]
srpg studio ver 1.161以降

[製作者名]
キュウブ

[更新履歴]
ver 1.1
そのまま作品公開しても問題が起きないようにテストプレイ時にしか動作しないように変更

[規約]
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。
・クレジット明記無し　OK (明記する場合は"キュウブ"でお願いします)
・再配布、転載　OK (バグなどがあったら修正できる方はご自身で修正版を配布してもらっても構いません)
・wiki掲載　OK
・SRPG Studio利用規約は遵守してください。
*/

var DEFALUT_TERRIAN_NAME = "空白";

(function(){
	var temp1 = CurrentMap.prepareMap;
	CurrentMap._defaultTerrianAddressArray = [];
	CurrentMap.prepareMap = function() {
		var terrian;
		var mapInfo = root.getCurrentSession().getCurrentMapInfo();

		this._defaultTerrianAddressArray = [];
		temp1.call(this);
		
		if (!mapInfo || root.isTestPlay() === false) {
			return;
		}

		// 全く意味の無いroot.logですが
		// これを入れとかないと何故かfor文の中のif文のDEFALUT_TERRIAN_NAMEが文字化けして正しく判定できなくなるので
		// 仕方なく入れてます。最新版だと消してしまっても問題ないのかもしれません。
		root.log("デバッグ開始");

		for (var j = 0; j < this._height; j++) {
			for (var i = 0; i < this._width; i++) {
				terrian = root.getCurrentSession().getTerrainFromPos(i, j, true);

				if (terrian.getName() === DEFALUT_TERRIAN_NAME) {
					this._defaultTerrianAddressArray.push(CurrentMap.getIndex(i, j));
				}
			}
		}

		root.msg("Default terrian found " + this._defaultTerrianAddressArray.length);
	};

	CurrentMap.getDefaultTerrianAddressArray = function() {
		return this._defaultTerrianAddressArray;
	};

	var temp2 = MapLayer.drawMapLayer;
	MapLayer.drawMapLayer = function() {
		var defaultTerrianAddressArray;
		var session = root.getCurrentSession();

		temp2.call(this);

		if (!session || root.isTestPlay() === false) {
			return;
		}

		defaultTerrianAddressArray = CurrentMap.getDefaultTerrianAddressArray();
		root.drawFadeLight(defaultTerrianAddressArray, 0xFF0000, 180);
	};
})();
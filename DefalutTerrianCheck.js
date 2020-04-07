/*
  空白地形チェック機能 ver 1.2

[概要]
このプラグインを導入すると
・地形名が"空白"となっている箇所は赤色
・地形の戦闘背景が設定されてない箇所(マップ情報で固定戦闘背景が設定されているかは考慮しません)は青色
・どちらも満たす箇所は緑色
になります。

デバッグ用のプラグインなので公開時には抜いておくことを推奨します。

導入するとマップ開始時に"Default terrain found <空白地形の数>"というメッセージが出てくるはずです。
これが表示されない場合は競合などが原因でプラグインが正しく動いていないと考えてください。

[推奨バージョン]
srpg studio ver 1.161以降

[製作者名]
キュウブ

[更新履歴]
ver 1.2
戦闘背景が設定されていない箇所を洗い出す機能を追加

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

var DEFALUT_TERRAIN_NAME = "空白";

(function(){
	var temp1 = CurrentMap.prepareMap;
	CurrentMap._defaultTerrainAddressArray = [];
	CurrentMap._emptyBackGroundTerrainAddressArray = [];
	CurrentMap._bothTerrainAddressArray = [];
	CurrentMap.prepareMap = function() {
		var terrain, isDefalutName, isEmptyBackGround;
		var mapInfo = root.getCurrentSession().getCurrentMapInfo();

		this._defaultTerrainAddressArray = [];
		this._emptyBackGroundTerrainAddressArray = [];
		this._bothTerrainAddressArray = [];
		temp1.call(this);
		
		if (!mapInfo || root.isTestPlay() === false) {
			return;
		}

		// 全く意味の無いroot.logですが
		// これを入れとかないと何故かfor文の中のif文のDEFALUT_TERRAIN_NAMEが文字化けして正しく判定できなくなるので
		// 仕方なく入れてます。最新版だと消してしまっても問題ないのかもしれません。
		root.log("デバッグ開始");

		for (var j = 0; j < this._height; j++) {
			for (var i = 0; i < this._width; i++) {
				terrain = root.getCurrentSession().getTerrainFromPos(i, j, true);
				isDefalutName = terrain.getName() === DEFALUT_TERRAIN_NAME;
				isEmptyBackGround = !terrain.getBattleBackgroundImage(0);

				if (isDefalutName && isEmptyBackGround) {
					this._bothTerrainAddressArray.push(CurrentMap.getIndex(i, j));
				}
				else if (isDefalutName) {
					this._defaultTerrainAddressArray.push(CurrentMap.getIndex(i, j));
				}
				else if (isEmptyBackGround) {
					this._emptyBackGroundTerrainAddressArray.push(CurrentMap.getIndex(i, j));
				}
			}
		}

		root.msg("Default Terrain found " + (this._defaultTerrainAddressArray.length + this._bothTerrainAddressArray.length));
		root.msg("Empty background Terrain found " + (this._emptyBackGroundTerrainAddressArray.length + this._bothTerrainAddressArray.length));
	};

	CurrentMap.getDefaultTerrainAddressArray = function() {
		return this._defaultTerrainAddressArray;
	};

	CurrentMap.getEmptyBackGroundTerrainAddressArray = function() {
		return this._emptyBackGroundTerrainAddressArray;
	};

	CurrentMap.getBothTerrainAddressArray = function() {
		return this._bothTerrainAddressArray;
	};

	var temp2 = MapLayer.drawMapLayer;
	MapLayer.drawMapLayer = function() {
		var defaultTerrainAddressArray, emptyBackGroundTerrainAddressArray,bothTerrainAddressArray;
		var session = root.getCurrentSession();

		temp2.call(this);

		if (!session || root.isTestPlay() === false) {
			return;
		}

		defaultTerrainAddressArray = CurrentMap.getDefaultTerrainAddressArray();
		root.drawFadeLight(defaultTerrainAddressArray, 0xFF0000, 180);
		emptyBackGroundTerrainAddressArray = CurrentMap.getEmptyBackGroundTerrainAddressArray();
		root.drawFadeLight(emptyBackGroundTerrainAddressArray, 0x0000FF, 180);
		bothTerrainAddressArray = CurrentMap.getBothTerrainAddressArray();
		root.drawFadeLight(bothTerrainAddressArray, 0x00FF00, 180);
	};
})();
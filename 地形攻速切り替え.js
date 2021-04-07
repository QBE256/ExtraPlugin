/*--------------------------------------------------------------------------
　地形高速切り替え ver 1.2

■作成者
キュウブ

■概要
カスパラで設定したマップチップを4フレーム単位で切り替える事ができる
画像を上に載せるだけなので透過チップは使い辛いと思う

■使い方
以下のようなカスパラを地形効果に記入する(該当地形には全て記入しておく必要あり)
isChangeMapChip:true


■更新履歴
ver 1.3 (2021/4/7)
MapLayer.setCustomAnimationMapChips()を実行することで
マップチップの更新に対応可能にした

ver 1.2 (2021/2/22)
仕様変更

ver 1.1 (2021/2/20)
仕様変更

ver 1.0 (2021/2/17)
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

MapLayer._customAnimationMapChips = null;
MapLayer.setCustomAnimationMapChips = function() {
	var terrian, currentHandle;
	var session = root.getCurrentSession();
	var mapWidth = session.getCurrentMapInfo().getMapWidth();
	var mapHeight = session.getCurrentMapInfo().getMapHeight();

	this._customAnimationMapChips = [];
	for (var x = 0; x < mapWidth; x++) {
		for (var y = 0; y < mapHeight; y++) {
			terrian = session.getTerrainFromPos(x, y, true);
			if (terrian.custom.isChangeMapChip === true) {
				currentHandle = session.getMapChipGraphicsHandle(x, y, true);
				this._customAnimationMapChips.push({
					x: x,
					y: y,
					handle: currentHandle,
					height: terrian.getMapChipImage().getHeight() / GraphicsFormat.MAPCHIP_HEIGHT
				});
			}
		}
	}		
};

(function(){
	var alias1 = MapLayer.prepareMapLayer;
	MapLayer._mapChipCounter = null;
	MapLayer.prepareMapLayer = function() {
		var terrian;

		this._mapChipCounter = createObject(CycleCounter);
		this._mapChipCounter.setCounterInfo(4);
		this._mapChipCounter.disableGameAcceleration();
		this._customAnimationMapChips = null;

		alias1.call(this);
	};

	var alias2 = MapLayer.moveMapLayer;
	MapLayer.moveMapLayer = function() {
		this._mapChipCounter.moveCycleCounter();
		return alias2.call(this);
	};

	MapLayer._drawCustomAnimationMapSet = function() {
		var customAnimationMapChip, resourceSrcX, resourceSrcY;
		var session = root.getCurrentSession();
		var scrollX = session.getScrollPixelX();
		var scrollY = session.getScrollPixelY();

		if (this._customAnimationMapChips === null) {
			this.setCustomAnimationMapChips();		
		}

		for (var index = 0; index < this._customAnimationMapChips.length; index++) {
			customAnimationMapChip = this._customAnimationMapChips[index];

			GraphicsRenderer.drawImage(
				customAnimationMapChip.x * GraphicsFormat.MAPCHIP_WIDTH - scrollX, 
				customAnimationMapChip.y * GraphicsFormat.MAPCHIP_HEIGHT - scrollY, 
				customAnimationMapChip.handle, 
				GraphicsType.MAPCHIP
			);

			if (this._mapChipCounter.getCounter() === 0) {
				resourceSrcX = customAnimationMapChip.handle.getSrcX();
				resourceSrcY = customAnimationMapChip.handle.getSrcY();
				customAnimationMapChip.handle = root.createResourceHandle(
													false,
													customAnimationMapChip.handle.getResourceId(),
													0, 
													resourceSrcX,
													++resourceSrcY < customAnimationMapChip.height ? resourceSrcY : 0
												);	
			}
		}
	};

	MapLayer.drawMapLayer = function() {
		var session;
		
		session = root.getCurrentSession();
		if (session !== null) {
			session.drawMapSet(0, 0);
			this._drawCustomAnimationMapSet();
			if (EnvironmentControl.isMapGrid() && root.isSystemSettings(SystemSettingsType.MAPGRID)) {
				session.drawMapGrid(0x0, 64);
			}
		}
		else {
			root.getGraphicsManager().fill(0x0);
		}
		
		if (this._effectRangeType === EffectRangeType.MAP) {
			this._drawScreenColor();
		}
	};
})();
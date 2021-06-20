/*--------------------------------------------------------------------------
　マップに遠景画像を表示させる ver 1.1

■作成者
キュウブ

■概要
マップチップより下のレイヤーに背景画像を表示させます。

■使い方
1.あらかじめ以下のマップチップと地形を用意しておく必要があります。
a.下レイヤーに相当する箇所(崖のマップチップの場合、崖下など)が透過色になっているマップチップ
b.全体が透過色になっているマップチップ

これらのマップチップに以下のカスパラがついた地形効果を設定しておきます。
isClearTerrain:true

遠景画像だけ表示させる箇所にはbのマップチップを、
遠景画像を下レイヤーに表示させたい箇所(崖)にはaのマップチップを配置しておきます。

2.マップに以下のカスパラを設定し、遠景画像に使用したい背景画像を選択します
※対応している背景画像はeventbackに登録されているものだけです。
backGroundImage: {
	isRuntime:<ランタイムならtrue,オリジナルならfalse>,
	id:<遠景画像として表示させたいリソースID>
}

■このスクリプトの仕組みについて
エディタではマップの下側（崖下など）を透過させておく事はできません。
透過チップはどうしてもマップチップの上側に設定されてしまいます。
しかし、このスクリプトでは
マップを開いた時にisClearTerrain:trueが設定されているマップチップが
下側に設定されている地形を無理やり透過チップで上書きするので、背景画像が表示されるようになります。

■更新履歴
ver 1.1 (2021/6/20)
夕方、夜の時に-a,-b画像を表示できるように変更

ver 1.0 (2021/6/19)
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


MapLayer.changeClearTerrain = function() {
	var handle, terrain;
	var currentSession = root.getCurrentSession();
	var mapInfo = currentSession.getCurrentMapInfo();
	var generator = root.getEventGenerator();
	var mapWidth = mapInfo.getMapWidth();
	var mapHeight = mapInfo.getMapHeight();

	for (var x = 0; x < mapWidth; x++) {
		for (var y = 0; y < mapHeight; y++) {
			terrain = currentSession.getTerrainFromPos(x, y, true);
			if (terrain.custom.isClearTerrain === true) {
				handle = currentSession.getMapChipGraphicsHandle(x, y, true);
				generator.mapChipChange(x, y, false, handle);
			}
		}
	}
	generator.execute();	
};

(function(){
	var _CurrentMap_prepareMap = CurrentMap.prepareMap;
	CurrentMap.prepareMap = function() {
		 _CurrentMap_prepareMap.call(this);
		if (root.getCurrentSession().getCurrentMapInfo()) {
			MapLayer.changeClearTerrain();
		}
	};

	var _MapLayer_drawMapLayer = MapLayer.drawMapLayer;
	MapLayer.drawMapLayer = function() {
		var handle;
		var mapInfo = root.getCurrentSession().getCurrentMapInfo();
		if (typeof mapInfo.custom.backGroundImage === 'object') {
			handle = root.createResourceHandle(
							mapInfo.custom.backGroundImage.isRuntime,
							mapInfo.custom.backGroundImage.id,
							mapInfo.getMapColorIndex(), 
							0, 
							0
						);
			GraphicsRenderer.drawImage(0, 0, handle, GraphicsType.EVENTBACK);
		}
		_MapLayer_drawMapLayer.call(this);
	};
})();
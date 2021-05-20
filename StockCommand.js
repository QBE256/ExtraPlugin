/*--------------------------------------------------------------------------
　特定地形の上でストックにアクセスできるようになる ver 1.0

■作成者
キュウブ

■概要
地形効果のカスパラに
isStockTerrain:true
と記載しておき、その地形の上にユニットが乗るとストックにアクセスできるようになります。

■更新履歴
ver 1.0 (2021/05/21)
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
UnitCommand.Stock.isCommandDisplayable = function() {
	var indexArray, terrain;
		
	if (!root.getCurrentSession().isMapState(MapStateType.STOCKSHOW)) {
		return false;
	}

	terrain = root.getCurrentSession().getTerrainFromPos(this.getCommandTarget().getMapX(), this.getCommandTarget().getMapY(), true);
	if (terrain.custom.isStockTerrain === true) {
		return true;
	}
		
	// ストックにアクセス可能なユニットかを調べる
	if (this._isTradable(this.getCommandTarget())) {
		return true;
	}
		
	// 隣接するユニットはストックにアクセス可能かを調べる
	indexArray = this._getStockArray(this.getCommandTarget());
		
	return indexArray.length !== 0;
};
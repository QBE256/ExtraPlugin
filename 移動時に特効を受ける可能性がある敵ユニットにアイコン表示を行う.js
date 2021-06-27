/*--------------------------------------------------------------------------
　移動時に特効を受ける可能性がある敵ユニットにアイコンを表示する ver 1.1

■作成者
キュウブ

■概要
このスクリプトを導入すると
ユニット移動時に有効な特効武器を持っている敵ユニットの頭上にアイコンが表示されるようになります。
※スキルは考慮していません。あくまでも武器自体に付与されている特効が有効かどうかだけで判定します。
※移動前の地形効果で特効が有効となっている場合も判定されてしまいます。
※移動後の地形効果で特効が有効になるかどうかまでは考慮しません。

■使い方
デフォルトではランタイムの!マークアイコンが表示されますが、
変更したい場合は
40行目のDangerIconSettingの設定を変えてください。

■更新履歴
ver 1.1 (2021/6/27)
軽微な修正(特にバグは無し)

ver 1.0 (2021/6/27)
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
//表示するアイコンを変更したい場合は下記の設定を変更する事
var DangerIconSetting = {
	isRuntime: true, //ランタイムならtrue,オリジナルならfalse
	resourceId: 0, //アイコン画像のリソースID
	xSrc: 0, //左端を0番目とした場合、左から何番目のアイコンか
	ySrc: 9  //上端を0番目とした場合、上から何番目のアイコンか
};

(function(){
	var _MapLayer_drawUnitLayer = MapLayer.drawUnitLayer;
	MapLayer.drawUnitLayer = function() {
		_MapLayer_drawUnitLayer.call(this);
		MapLayer.drawDangerSymbolLayer();
	};

	var _MapSequenceArea__completeSequenceMemberData = MapSequenceArea._completeSequenceMemberData;
	MapSequenceArea._completeSequenceMemberData = function(parentTurnObject) {
		_MapSequenceArea__completeSequenceMemberData.call(this, parentTurnObject);
		MapLayer.createDangerUnitArray(this._targetUnit);
	};

	var _MapSequenceArea_moveSequence = MapSequenceArea.moveSequence;
	MapSequenceArea.moveSequence = function() {
		var result = _MapSequenceArea_moveSequence.call(this);

		if (result !== MapSequenceAreaResult.NONE) {
			MapLayer.clearDangerUnitArray();
		}

		return result;
	}
})();
MapLayer._dangerUnitArray = [];
MapLayer.createDangerUnitArray = function(unit) {
	var enemyUnitList, enemyListCount, enemyUnit;

	this._dangerUnitArray = [];
	if (unit.getUnitType() !== UnitType.PLAYER) {
		return;
	}
	enemyUnitList = EnemyList.getAliveList();
	enemyListCount = enemyUnitList.getCount();
	for (var index = 0; index < enemyListCount; index++) {
		enemyUnit = enemyUnitList.getData(index);
		if (Miscellaneous.isDangerTargetUnit(unit, enemyUnit)) {
			this._dangerUnitArray.push(
				{
					unit: enemyUnit,
					xPos: enemyUnit.getMapX(),
					yPos: enemyUnit.getMapY()
				}
			);
		}
	}
};

MapLayer.clearDangerUnitArray = function() {
	this._dangerUnitArray = [];	
};

MapLayer.drawDangerSymbolLayer = function() {
	var pic, picCache, picWidth, picHeight, dangersymbolCoordinateX, dangersymbolCoordinateY;
	var handle = root.createResourceHandle(
						DangerIconSetting.isRuntime,
						DangerIconSetting.resourceId,
						0,
						DangerIconSetting.xSrc,
						DangerIconSetting.ySrc
					);

	if (handle.isNullHandle()) {
		return;
	}	
	pic = GraphicsRenderer.getGraphics(handle, GraphicsType.ICON);
	if (!pic) {
		return;
	}
	picWidth = pic.getWidth();
	picHeight = pic.getHeight();
	picCache = CacheControl.getCacheGraphics(picWidth, picHeight, pic);
	if (!picCache) {
		picCache = CacheControl.createCacheGraphics(picWidth, picHeight, pic);
		root.getGraphicsManager().setRenderCache(picCache);
		pic.draw(0, 0);
		root.getGraphicsManager().resetRenderCache();
	}
	else if (!picCache.isCacheAvailable()) {
		root.getGraphicsManager().setRenderCache(picCache);
		pic.draw(0, 0);
		root.getGraphicsManager().resetRenderCache();
	}
	dangersymbolCoordinateX = GraphicsFormat.ICON_WIDTH * DangerIconSetting.xSrc;
	dangersymbolCoordinateY = GraphicsFormat.ICON_HEIGHT * DangerIconSetting.ySrc;
	for (var index = 0; index < this._dangerUnitArray.length; index++) {
		picCache.drawStretchParts(
			LayoutControl.getPixelX(this._dangerUnitArray[index].xPos),
			LayoutControl.getPixelY(this._dangerUnitArray[index].yPos),
			16,
			16,
			dangersymbolCoordinateX,
			dangersymbolCoordinateY,
			GraphicsFormat.ICON_WIDTH,
			GraphicsFormat.ICON_HEIGHT
		);
	}
};

// unitにとってtargetUnitが危険かどうか判定する
// 危険の定義は本スクリプトではunitに対して有効な特効武器をtargetUnitが持っている事とする。
// また、スキルやunit自身が現在の状態から変化した際に特効対象になるかまでは考慮しない。
// 他の条件まで考慮しようと場合は、この関数に処理を追加すれば良い。
// ただし、全敵ユニットに対して行う関係上計算量が大幅に増加しフレームレート低下の原因となる可能性が高まるので注意する事。
Miscellaneous.isDangerTargetUnit = function(unit, targetUnit) {
	var weapon;
	var itemCount = UnitItemControl.getPossessionItemCount(targetUnit);
	
	for (var index = 0; index < itemCount; index++) {
		weapon = UnitItemControl.getItem(targetUnit, index);
		if (
			ItemControl.isWeaponAvailable(targetUnit, weapon) &&
			ItemControl.isEffectiveData(unit, weapon)
		) {
			return true;
		}
	}

	return false;
};
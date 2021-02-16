/*--------------------------------------------------------------------------
　地形高速切り替え ver 1.0

■作成者
キュウブ

■概要
カスパラで設定したマップチップを4フレーム単位で切り替える事ができる(切り替え先は全く同じ効果の地形にしとかないと、タイミングゲーになるので注意)

■使い方
以下のようなカスパラをマップに記入する
changeMapChipInfo:{
	mapChips:[
		// ここに特定のマス目の切り替え情報を記入する
		{
			position: [<x座標>, <y座標>], //<---どこのマスを切り替えるか座標を記入
			currentIndex: 0, //<---ここは必ず currentIndex:0 とだけ書いておいてください
			changeChips:[
				{
					// ここには1枚目に表示されるマップチップ情報を記入する
					isRuntime:<ランタイム画像だったらtrue、オリジナルだったらfalse>,
					id: <画像ID>,
					position: [<x座標>, <y座標>] //<---描画するマップチップの座標を記入
				},
				{
					// ここには2枚目に表示されるマップチップ情報を記入する
					isRuntime: ...
					id: ...
					position ...
				},
				{
					// ここには3枚目に表示されるマップチップ情報を記入する
					isRuntime: ...
					id: ...
					position ...
				},
				{
					// ここには4枚目に表示されるマップチップ情報を記入する
					isRuntime: ...
					id: ...
					position ...
				},
				...
				{
	
				}
			]
		},
		// ここに他のマス目の情報を記入する
		{
			position:...,
			currentIndex: 0, //<---ここは必ず currentIndex:0 とだけ書いておいてください
			changeChips:[
				{
					// ここには1枚目に表示されるマップチップ情報を記入する
				},
				{
					// ここには2枚目に表示されるマップチップ情報を記入する
				},
				{
					// ここには3枚目に表示されるマップチップ情報を記入する
				},
				...
				{
	
				}
			]
		},
		...
	]
}

例:記入例
changeMapChipInfo:{
	mapChips:[
		{
			position: [0, 0],
			currentIndex: 0,
			changeChips:[
				{
					isRuntime:true,
					id: 0,
					position: [1, 1]
				},
				{
					isRuntime:true,
					id: 0,
					position: [1, 2]
				},
				{
					isRuntime:true,
					id: 0,
					position: [1, 3]
				}
			]
		},
		{
			position: [1, 1],
			currentIndex: 0,
			changeChips:[
				{
					isRuntime:true,
					id: 0,
					position: [2, 2]
				},
				{
					isRuntime:true,
					id: 0,
					position: [2, 3]
				},
				{
					isRuntime:true,
					id: 0,
					position: [2, 4]
				}
			]
		},
		{
			position: [2, 3],
			currentIndex: 0,
			changeChips:[
				{
					isRuntime:true,
					id: 0,
					position: [3, 0]
				},
				{
					isRuntime:true,
					id: 0,
					position: [3, 1]
				}
			]
		}
	]
}

■更新履歴
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

(function(){
	var alias1 = MapLayer.prepareMapLayer;
	MapLayer._mapChipCounter = null;
	MapLayer.prepareMapLayer = function() {
		this._mapChipCounter = createObject(CycleCounter);
		this._mapChipCounter.setCounterInfo(4);
		this._mapChipCounter.disableGameAcceleration();
		alias1.call(this);
	};

	var alias2 = MapLayer.moveMapLayer;
	MapLayer.moveMapLayer = function() {
		var session = root.getCurrentSession();
		var mapChip, changeMapChipInfo;

		if (session !== null) {
			changeMapChipInfo = session.getCurrentMapInfo().custom.changeMapChipInfo;
		}

		if (changeMapChipInfo && this._mapChipCounter.moveCycleCounter() !== MoveResult.CONTINUE) {
			for (var index = 0; index < changeMapChipInfo.mapChips.length; index++) {
				mapChip = changeMapChipInfo.mapChips[index];
				mapChip.currentIndex = mapChip.currentIndex < mapChip.changeChips.length - 1 ?
										mapChip.currentIndex + 1 : 0;

			}
		}

		return alias2.call(this);
	};

	MapLayer._drawCustomAnimationMapSet = function() {
		var session = root.getCurrentSession();
		var generator, mapChip, changeChip, handle, changeMapChipInfo;

		if (session !== null) {
			changeMapChipInfo = session.getCurrentMapInfo().custom.changeMapChipInfo;
		}

		if (!changeMapChipInfo || this._mapChipCounter.getCounter() !== 0) {
			return;
		}

		generator = root.getEventGenerator();
		for (var index = 0; index < changeMapChipInfo.mapChips.length; index++) {
			mapChip = changeMapChipInfo.mapChips[index];
			changeChip = mapChip.changeChips[mapChip.currentIndex];
			handle = root.createResourceHandle(changeChip.isRuntime, changeChip.id, 0, changeChip.position[0], changeChip.position[1]);
			generator.mapChipChange(mapChip.position[0], mapChip.position[1], true, handle);
		}
		generator.execute();
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
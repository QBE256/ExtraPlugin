/*--------------------------------------------------------------------------
　フォグ演出スクリプト ver 2.1

■作成者
キュウブ

■概要
指定した画像をマップ上、ウィンドウの下に配置してスクロールさせます
つまり、吹雪や雨などの演出ができます
※ ver2.0からユニットとマップチップの間にも画像を流せるようにしました
※ ver2.0からデモマップでも画像を流せるようにしました

■使い方
1.通常マップでユニットの上にフォグ画像を流すやり方 ※ver1.0からの仕様

Materialフォルダの中にFogImageフォルダを作成し、画像を入れてください
対象マップに以下のカスパラを指定してください

fog:{
	img: <画像ファイル名>,
	moveX: <1フレーム毎にx方向に何ピクセル進むか>,
	moveY: <1フレーム毎にy方向に何ピクセル進むか>,
	switch_id: <ローカルスイッチのID>
}

※ 画像ファイルのサイズは画面の解像度と同程度の大きさである事を前提としています（解像度より小さければ拡大表示、大きければ縮小表示されます）
※ switch_idは無くても問題ありません。設定しておくと対象のローカルスイッチがONの場合のみフォグ機能が有効になります
※ ある条件をきっかけにフォグ機能を有効/無効にしたいといった時に使ってください
※ 存在しないswitch_idやimgを指定するとバグります

例1 Material\snow.pngの画像を1フレーム毎にx方向に-10, y方向に1ピクセル分スクロールさせる
fog:{
	img: 'snow.png',
	moveX: -10,
	moveY: 1
}

例2  Material\rain.pngの画像を1フレーム毎にx方向に1, y方向に1ピクセル分スクロールさせる、またローカルスイッチID3番がONの時のみ画像が表示される
fog:{
	img: 'rain.png',
	moveX: 1,
	moveY: 1,
	switch_id: 3
}


2.ユニットとマップチップの間にフォグ画像を流すやり方　※ver2.0で追加
下記のカスパラを設定する事で、ユニットとマップチップの間に画像を流せるようになります。
backFog:{
	img: <画像ファイル名>,
	moveX: <1フレーム毎にx方向に何ピクセル進むか>,
	moveY: <1フレーム毎にy方向に何ピクセル進むか>,
	switch_id: <ローカルスイッチのID>
}

3.デモマップでフォグ画像を流すやり方 ※ver2.0で追加
デモマップで1,2と同様のカスタムパラメータを設定した上で
オープニングイベントでスクリプトの実行->コードの実行で
MapLayer.setFogData();
を記載したイベントコマンドを実行する事で流れるようになります。

■更新履歴
ver 2.1 (2021/12/01)
・コードリファクタリング

ver 2.0 (2021/05/18)
・コードをリファクタリング
・デモマップでエラーを起こす不具合修正
・ユニットとマップチップの間にもフォグを流せる機能を実装
・デモマップでフォグを流せる機能を実装

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

var FogSettingFolder = "FogImage"; //Materialフォルダ下のこのフォルダの中にフォグで使用する画像を入れてください

var validationFogParameter = function (fog) {
	if (typeof fog !== "object") {
		return false;
	}
	if (!("img" in fog) || !("moveX" in fog) || !("moveY" in fog)) {
		return false;
	}
	if (typeof fog.img !== "string" || typeof fog.moveX !== "number" || typeof fog.moveY !== "number") {
		return false;
	}
	return true;
};

MapLayer._frontFogImage = null;
MapLayer._backFogImage = null;

MapLayer.setFogData = function () {
	var frontFogPicture, backFogPicture;
	var currentMapInfo = this._getMapInfo();

	if (!currentMapInfo) {
		return;
	}
	if (validationFogParameter(currentMapInfo.custom.fog)) {
		frontFogPicture = root.getMaterialManager().createImage(FogSettingFolder, currentMapInfo.custom.fog.img);
		this._frontFogImage = createObject(ScrollFogImage);
		this._frontFogImage.startScrollBackground(
			frontFogPicture,
			currentMapInfo.custom.fog.moveX,
			currentMapInfo.custom.fog.moveY
		);
	}
	if (validationFogParameter(currentMapInfo.custom.backFog)) {
		backFogPicture = root.getMaterialManager().createImage(FogSettingFolder, currentMapInfo.custom.backFog.img);
		this._backFogImage = createObject(ScrollFogImage);
		this._backFogImage.startScrollBackground(
			backFogPicture,
			currentMapInfo.custom.backFog.moveX,
			currentMapInfo.custom.backFog.moveY
		);
	}
};

MapLayer._getMapInfo = function () {
	var currentSession = root.getCurrentSession();
	if (!currentSession) {
		return null;
	}
	return currentSession.getCurrentMapInfo();
};

MapLayer._isEnableLocalSwitch = function (fog) {
	var localSwitchTable, switchIndex;
	var currentMapInfo = this._getMapInfo();
	if (!("switch_id" in fog)) {
		return true;
	}
	if (typeof fog.switch_id !== "number") {
		return false;
	}
	localSwitchTable = currentMapInfo.getLocalSwitchTable();
	switchIndex = localSwitchTable.getSwitchIndexFromId(fog.switch_id);
	return localSwitchTable.isSwitchOn(switchIndex);
};

MapLayer._isEnableFrontFogImage = function () {
	var currentMapInfo;

	if (!this._frontFogImage) {
		return false;
	}
	currentMapInfo = this._getMapInfo();
	if (!currentMapInfo) {
		return false;
	}
	if (!this._isEnableLocalSwitch(currentMapInfo.custom.fog)) {
		return false;
	}
	return true;
};

MapLayer._isEnableBackFogImage = function () {
	var currentMapInfo;

	if (!this._backFogImage) {
		return false;
	}
	currentMapInfo = this._getMapInfo();
	if (!currentMapInfo) {
		return false;
	}
	if (!this._isEnableLocalSwitch(currentMapInfo.custom.backFog)) {
		return false;
	}
	return true;
};

var ScrollFogImage = defineObject(ScrollBackground, {
	_xMove: 0,
	_yMove: 0,

	startScrollBackground: function (pic, xMove, yMove) {
		if (pic === null) {
			this._pic = null;
			this._picCache = null;
			return;
		}
		if (pic === this._pic) {
			return;
		}
		this._isHorz = true;
		this._isVert = true;
		this._xMax = pic.getWidth();
		this._yMax = pic.getHeight();
		this._pic = pic;
		this._picCache = null;
		this._xMove = xMove;
		this._yMove = yMove;
	},

	moveScrollBackground: function () {
		if (this._counter.moveCycleCounter() === MoveResult.CONTINUE) {
			return MoveResult.CONTINUE;
		}

		this._xScroll += this._xMove;
		this._xScroll = this._xScroll >= this._xMax ? 0 : this._xScroll;
		this._xScroll = this._xScroll < 0 ? this._xMax : this._xScroll;
		this._yScroll += this._yMove;
		this._yScroll = this._yScroll >= this._yMax ? 0 : this._yScroll;
		this._yScroll = this._yScroll < 0 ? this._yMax : this._yScroll;

		return MoveResult.CONTINUE;
	}
});

(function () {
	var _MapLayer_prepareMapLayer = MapLayer.prepareMapLayer;
	MapLayer.prepareMapLayer = function () {
		var currentScene = root.getCurrentScene();
		_MapLayer_prepareMapLayer.call(this);
		this._frontFogImage = null;
		this._backFogImage = null;
		if (
			currentScene !== SceneType.BATTLESETUP &&
			currentScene !== SceneType.FREE &&
			currentScene !== SceneType.BATTLERESULT
		) {
			return;
		}
		this.setFogData();
	};

	var _MapLayer_moveMapLayer = MapLayer.moveMapLayer;
	MapLayer.moveMapLayer = function () {
		if (this._isEnableFrontFogImage()) {
			this._frontFogImage.moveScrollBackground();
		}
		if (this._isEnableBackFogImage()) {
			this._backFogImage.moveScrollBackground();
		}
		return _MapLayer_moveMapLayer.call(this);
	};

	var _MapLayer_drawUnitLayer = MapLayer.drawUnitLayer;
	MapLayer.drawUnitLayer = function () {
		_MapLayer_drawUnitLayer.call(this);
		if (this._isEnableFrontFogImage()) {
			this._frontFogImage.drawScrollBackground();
		}
	};

	var _MapLayer_drawMapLayer = MapLayer.drawMapLayer;
	MapLayer.drawMapLayer = function () {
		_MapLayer_drawMapLayer.call(this);
		if (this._isEnableBackFogImage()) {
			this._backFogImage.drawScrollBackground();
		}
	};
})();

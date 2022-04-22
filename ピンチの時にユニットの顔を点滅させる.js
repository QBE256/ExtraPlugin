/*--------------------------------------------------------------------------
　ピンチの時にユニットの表情を点滅させる ver 1.0

■作成者
キュウブ

■概要
カーソルを合わせた時に表示されるユニットウィンドウにて、
ユニットのHPが1/4以下の時は画像が赤く点滅するようになります。

また、カスパラを設定する事でピンチの時に表情を変更させる事も可能になります。

■使い方
1.点滅機能について
点滅の対象は自軍、同盟軍ユニットのみとなります。

※もし敵軍ユニットも点滅させたい場合は、対象ユニットのカスパラに{ isCriticalLightUp:true }を入れてください。

2.表情変更について
対象ユニットのカスパラに以下のカスパラを入れてください
{
	criticalFacialExpression:[<左から数えて何番目か(左端を0番目とする)>, <上から数えて何番目か(上端を0番目とする)>]
}

例えば、
{
	criticalFacialExpression:[0, 0]
}
の場合はピンチの時に一番左上の表情になります。
{
	criticalFacialExpression:[1, 0]
}
の場合は左から1つずれた位置の表情になります。


■更新履歴
ver 1.0 2021/04/23

■対応バージョン
SRPG Studio Version:1.161

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。
・クレジット明記無し　OK (明記する場合は"キュウブ"でお願いします)
・再配布、転載　OK (バグなどがあったらプルリクどうぞ)
・wiki掲載　OK
・SRPG Studio利用規約は遵守してください。

--------------------------------------------------------------------------*/


(function () {
	MapParts.UnitInfo._lightUpCycleCounter = null;
	var _MapParts_UnitInfo_setUnit = MapParts.UnitInfo.setUnit;
	MapParts.UnitInfo.setUnit = function (unit) {
		this._lightUpCycleCounter = createObject(CycleCounter);
		this._lightUpCycleCounter.setCounterInfo(this._getLightUpFrame());
		this._lightUpCycleCounter.disableGameAcceleration();
		_MapParts_UnitInfo_setUnit.apply(this, arguments);
	};

	MapParts.UnitInfo._getLightUpFrame = function () {
		return 90;
	};

	MapParts.UnitInfo._getLightUpAlpha = function () {
		var alpha = 0;
		var currentFrame = this._lightUpCycleCounter.getCounter();
		var totalFrame = this._getLightUpFrame();
		var halfFrame = totalFrame / 2;
		var unit = this.getMapPartsTarget();
		var minAlpha = 60;
		var maxAlpha = 175;

		currentFrame = this._lightUpCycleCounter.getCounter();
		if (currentFrame < halfFrame) {
			alpha = minAlpha + Math.floor((currentFrame * (maxAlpha - minAlpha)) / halfFrame);
		} else {
			alpha = maxAlpha - Math.floor(((currentFrame - halfFrame) * (maxAlpha - minAlpha)) / halfFrame);
		}

		return alpha;
	};

	var _MapParts_UnitInfo_moveMapParts = MapParts.UnitInfo.moveMapParts;
	MapParts.UnitInfo.moveMapParts = function () {
		if (this._lightUpCycleCounter) {
			this._lightUpCycleCounter.moveCycleCounter();
		}
		return _MapParts_UnitInfo_moveMapParts.apply(this, arguments);
	};

	var _MapParts_UnitInfo__drawContent = MapParts.UnitInfo._drawContent;
	MapParts.UnitInfo._drawContent = function (x, y, unit, textui) {
		var isCriticalState = unit.getHp() <= Math.floor(this._mhp / 4);
		var isLightUpUnit = unit.getUnitType() !== UnitType.ENEMY || !!unit.custom.isCriticalLightUp;
		if (isCriticalState && isLightUpUnit) {
			UnitSimpleRenderer.drawCriticalContent(x, y, unit, textui, this._mhp, this._getLightUpAlpha());
		} else {
			_MapParts_UnitInfo__drawContent.apply(this, arguments);
		}
	};

	UnitSimpleRenderer.drawCriticalContent = function (x, y, unit, textui, mhp, alpha) {
		this._drawCriticalFace(x, y, unit, textui, mhp, alpha);
		this._drawName(x, y, unit, textui);
		this._drawInfo(x, y, unit, textui);
		this._drawSubInfo(x, y, unit, textui, mhp);
	};

	UnitSimpleRenderer._drawCriticalFace = function (x, y, unit, textui, mhp, lightAlpha) {
		ContentRenderer.drawUnitFace(x, y, unit, false, 255);
		root
			.getGraphicsManager()
			.fillRange(x, y, GraphicsFormat.FACE_WIDTH, GraphicsFormat.FACE_HEIGHT, 0xff0000, lightAlpha);
	};

	var _ContentRenderer_drawUnitFace = ContentRenderer.drawUnitFace;
	ContentRenderer.drawUnitFace = function (x, y, unit, isReverse, alpha) {
		if (
			typeof unit.custom.criticalFacialExpression === "object" &&
			unit.getHp() <= Math.floor(ParamBonus.getMhp(unit) / 4)
		) {
			var baseHandle = unit.getFaceResourceHandle();
			var pic = GraphicsRenderer.getGraphics(baseHandle, GraphicsType.FACE);
			if (pic === null) {
				return;
			}
			pic.setReverse(isReverse);
			pic.setAlpha(alpha);

			var isRuntime = baseHandle.getHandleType() === ResourceHandleType.RUNTIME;
			var handleId = baseHandle.getResourceId();
			var criticalFacialExpressionHandle = root.createResourceHandle(
				isRuntime,
				handleId,
				0,
				unit.custom.criticalFacialExpression[0],
				unit.custom.criticalFacialExpression[1]
			);

			this._drawShrinkFace(x, y, criticalFacialExpressionHandle, pic);
		} else {
			_ContentRenderer_drawUnitFace.apply(this, arguments);
		}
	};
})();

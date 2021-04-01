/*--------------------------------------------------------------------------
　援軍登場時にエフェクトアニメを流す ver 1.0

■作成者
キュウブ

■概要
援軍ユニットにカスパラを指定する事で
対象ユニットが出現すると同時にエフェクトアニメを流す事ができます。
例えば、魔法陣上にワープして登場する演出に使用するなどできると思います。

■使い方
援軍ユニットに以下のカスパラを設定します。
appearEffect: {
	isRuntime: <ランタイムエフェクトアニメであればtrue,オリジナルの場合はfalse>,
	id: <エフェクトアニメのID>
}

例えば、下記の場合は対象ユニット出現時にランタイムの衰弱エフェクト(404番)が流れるようになります。

appearEffect: {
	isRuntime: true,
	id: 404
}

■更新履歴
ver 1.0 (2021/4/2)
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

ReinforcementChecker._moveReinforcementUnit = function() {
	var i, dx, dy, reinforceUnit;
	var count = this._reinforceUnitArray.length;
	var result = MoveResult.END;
		
	for (i = 0; i < count; i++) {
		reinforceUnit = this._reinforceUnitArray[i];
		if (!reinforceUnit.isMoveFinal) {
			dx = (this._getPointX(reinforceUnit.direction) * 4) * -1;
			dy = (this._getPointY(reinforceUnit.direction) * 4) * -1;
				
			reinforceUnit.xPixel += dx;
			reinforceUnit.yPixel += dy;

			if (!reinforceUnit.dynamicAnimationEvent) {
				reinforceUnit.isMoveFinal = ++reinforceUnit.moveCount === 8;
			}
			else if (reinforceUnit.dynamicAnimationEvent.moveDynamicAnime() !== MoveResult.CONTINUE) {
				reinforceUnit.isMoveFinal = true;
			}

			if (reinforceUnit.isMoveFinal) {
				reinforceUnit.unit.setInvisible(false);
				this._playMovingSound(reinforceUnit.unit);
			}
				
			result = MoveResult.CONTINUE;
		}
			
		reinforceUnit.unitCounter.moveUnitCounter();
	}
		
	return result;
};

var validateAppearEffect = function(appearEffect) {
	if (typeof appearEffect !== 'object') {
		return false;
	}
	if (!('isRuntime' in appearEffect) || !('id' in appearEffect)) {
		root.log('appearEffect error:isRuntime or id not exist');
		return false;
	}
	if (typeof appearEffect.isRuntime !== 'boolean' || typeof appearEffect.id !== 'number') {
		root.log('appearEffect error:isRuntime or id is invalid type');
		return false;
	}
	return true;
};

(function(){
	var _StructureBuilder_buildReinforcementUnit = StructureBuilder.buildReinforcementUnit;
	StructureBuilder.buildReinforcementUnit = function() {
		var object = _StructureBuilder_buildReinforcementUnit.call(this);
		object.dynamicAnimationEvent = null;

		return object;
	};

	var _ReinforcementChecker_drawReinforcementChecker = ReinforcementChecker.drawReinforcementChecker;
	ReinforcementChecker.drawReinforcementChecker = function() {
		var i, reinforceUnit;
		var count = this._reinforceUnitArray.length;

		_ReinforcementChecker_drawReinforcementChecker.call(this);

		if (this.getCycleMode() !== ReinforcementCheckerMode.MOVE) {
			return;
		}

		for (i = 0; i < count; i++) {
			if (this._reinforceUnitArray[i].dynamicAnimationEvent) {
				this._reinforceUnitArray[i].dynamicAnimationEvent.drawDynamicAnime();
			}
		}
	};

	var _ReinforcementChecker__setMapScroll = ReinforcementChecker._setMapScroll;
	ReinforcementChecker._setMapScroll = function() {
		var effectAnimation, effectPosition, reinforceUnit;

		_ReinforcementChecker__setMapScroll.call(this);
		for (var index = 0; index < this._reinforceUnitArray.length; index++) {
			reinforceUnit = this._reinforceUnitArray[index];
			if (!validateAppearEffect(reinforceUnit.unit.custom.appearEffect)) {
				continue;
			}
			reinforceUnit.dynamicAnimationEvent = createObject(DynamicAnime);
			effectAnimation = root.getBaseData().getEffectAnimationList(reinforceUnit.unit.custom.appearEffect.isRuntime).getDataFromId(reinforceUnit.unit.custom.appearEffect.id);
			effectPosition = LayoutControl.getMapAnimationPos(
				LayoutControl.getPixelX(reinforceUnit.unit.getMapX()),
				LayoutControl.getPixelY(reinforceUnit.unit.getMapY()),
				effectAnimation
			);
			reinforceUnit.dynamicAnimationEvent.startDynamicAnime(effectAnimation, effectPosition.x, effectPosition.y);			
		}
	};
})();
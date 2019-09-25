/*--------------------------------------------------------------------------
　クラスチェンジ選択画面で表示されるモーションを変える ver 1.0

■作成者
キュウブ

■概要
クラスチェンジ選択画面では、通常待機モーションの最初のフレームの画像が表示される。
これを自由に変更する事ができる。

■使い方
クラスのカスパラに以下の設定をするとそのクラスの画像が変わる。
{
multiClassInoWindowMotionId: <対象モーションのID>,
multiClassInoWindowFrameIndex: <対象モーションのフレームインデックス>
}

例えば、
{
multiClassInoWindowMotionId: 3,
multiClassInoWindowFrameIndex: 4
}
だと、直接攻撃1の左から数えて4番目のモーションが表示されるようになるはず。

■更新履歴
2019/8/30
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
(function(){
	var alias = MultiClassInfoWindow._getMotionId;
	MultiClassInfoWindow._getMotionId = function() {
		if (typeof this._targetClass.custom.multiClassInfoWindowMotionId === 'number') {
			return this._targetClass.custom.multiClassInfoWindowMotionId;
		}
		else {
			return alias.call(this);
		}
	};

	MultiClassInfoWindow._drawClassGraphics = function(x, y) {
		var frameIndex, spriteIndex;
		var animeCoordinates = StructureBuilder.buildAnimeCoordinates();
		
		if (this._animeSimple !== null) {

			if (typeof this._targetClass.custom.multiClassInfoWindowFrameIndex === 'number') {
				frameIndex = this._targetClass.custom.multiClassInfoWindowFrameIndex;
			}
			else {
				frameIndex = 0;
			}

			spriteIndex = this._animeData.getSpriteIndexFromType(this._motionId, frameIndex, SpriteType.KEY);
			animeCoordinates.xBase = x + 96;
			animeCoordinates.yBase = y + 145;
			this._animeSimple.drawMotion(frameIndex, spriteIndex, this._animeRenderParam, animeCoordinates);
		}
		else {
			UnitRenderer.drawDefaultUnit(this._unit, x + 80, y + 85, this._unitRenderParam);
		}
	}
})();
/*--------------------------------------------------------------------------
　蘇生杖仕様変更(倒れたマスで蘇生させる) ver 1.0

■作成者
キュウブ

■概要
このスクリプトを導入すると対象ユニットが倒された位置で復活するようになります。
※蘇生対象が敵軍か同盟軍の場合に限ります
※倒れた位置に他のユニットがいる場合は復活できなくなります。

■更新履歴
ver 1.0 (2022/04/01)
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
	var _ResurrectionItemUse_mainAction = ResurrectionItemUse.mainAction;
	ResurrectionItemUse.mainAction = function() {
		if (!Miscellaneous.isPrepareScene() && this._targetUnit.getUnitType() !== UnitType.PLAYER) {
			this._targetUnit.setSortieState(SortieType.SORTIE);
			this._targetUnit.setAliveState(AliveType.ALIVE);
			this._targetUnit.setInvisible(false);
			this._targetUnit.setWait(false);
			this._targetUnit.setOrderMark(OrderMarkType.FREE);
			this._changeHp(this._item.getResurrectionInfo().getResurrectionType());
		} else {
			_ResurrectionItemUse_mainAction.apply(this, arguments);
		}
	};

	var _ResurrectionControl__isTargetAllowed = ResurrectionControl._isTargetAllowed;
	ResurrectionControl._isTargetAllowed = function(unit, targetUnit, item) {
		if (
			targetUnit.getUnitType() !== UnitType.PLAYER &&
			root.getCurrentSession().getUnitFromPos(targetUnit.getMapX(), targetUnit.getMapY())
		) {
			return false;
		}
		return _ResurrectionControl__isTargetAllowed.apply(this, arguments);
	};

	var _ResurrectionItemUse_getItemAnimePos = ResurrectionItemUse.getItemAnimePos;
	ResurrectionItemUse.getItemAnimePos = function(itemUseParent, animeData) {
		var itemTargetInfo = itemUseParent.getItemTargetInfo();
		var targetUnit = itemTargetInfo.targetUnit;
		if (!Miscellaneous.isPrepareScene() && itemTargetInfo.targetUnit.getUnitType() !== UnitType.PLAYER) {
			var x = LayoutControl.getPixelX(targetUnit.getMapX());
			var y = LayoutControl.getPixelY(targetUnit.getMapY());
			return LayoutControl.getMapAnimationPos(x, y, animeData);
		}
		
		return _ResurrectionItemUse_getItemAnimePos.apply(this, arguments);
	};
})();
/*--------------------------------------------------------------------------
　戦闘アニメで特定ユニットの消滅演出を省略する ver 1.0

■作成者
キュウブ

■概要
特定ユニットが戦闘でHP0になった際にユニットが消滅する演出を省略します。
ストーリー上は逃亡するだけのユニットに対して設定するといった使い方ができます。

■設定の仕方
指定のユニットのカスパラに{isOmitErase:true}を設定するだけ。

■更新履歴
ver 1.0 (2021/01/20)
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
	var alias = UnitDeathFlowEntry._moveErase;
	UnitDeathFlowEntry._moveErase = function() {
		var activeUnit = this._coreAttack.getBattleObject().getActiveBattler().getUnit();
		var passiveUnit = this._coreAttack.getBattleObject().getPassiveBattler().getUnit();
		var isOmitEraseActive = DamageControl.isLosted(activeUnit) && activeUnit.custom.isOmitErase === true;
		var isOmitErasePassive = DamageControl.isLosted(passiveUnit) && passiveUnit.custom.isOmitErase === true;
		
		if (isOmitEraseActive || isOmitErasePassive) {
			this._doEndAction();
			return MoveResult.END;
		}

		return alias.call(this);
	}
})();
/*--------------------------------------------------------------------------
　特定武器での戦闘を簡易化させるスクリプト ver1.0

■作成者
キュウブ

■概要
特定の武器で戦闘を行う際に戦闘が強制的に簡易に切り替わるようになります。

※マップ設置兵器スクリプトで長距離射撃武器に対応した各クラスのモーションを用意できない場合に併用する事を想定しています。

■使い方
対象武器のカスパラに
{isForceEasyBattle:true}
と記入する


更新履歴
ver 1.0 2022/04/11
初版

■対応バージョン
SRPG Studio Version:1.161

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。
・クレジット明記無し　OK (明記する場合は"キュウブ"でお願いします)
・再配布、転載　OK (バグなどがあったらプルリクエストしてくださると嬉しいです)
・wiki掲載　OK
・SRPG Studio利用規約は遵守してください。

------------------------------------------------------*/

(function () {
	var _CoreAttack__setBattleTypeAndObject = CoreAttack._setBattleTypeAndObject;
	CoreAttack._setBattleTypeAndObject = function (attackInfo, attackOrder) {
		var unitItem = ItemControl.getEquippedWeapon(this._attackParam.unit);
		var targetUnitItem = ItemControl.getEquippedWeapon(this._attackParam.targetUnit);
		var isForceEasyBattle =
			(unitItem && !!unitItem.custom.isForceEasyBattle) ||
			(targetUnitItem && !!targetUnitItem.custom.isForceEasyBattle);

		if (isForceEasyBattle) {
			this._battleType = BattleType.EASY;
			this._battleObject = createObject(EasyBattle);
		} else {
			_CoreAttack__setBattleTypeAndObject.apply(this, arguments);
		}
	};
})();

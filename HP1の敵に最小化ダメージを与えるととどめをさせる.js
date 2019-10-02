/*--------------------------------------------------------------------------
　HP1の敵に最小化ダメージを与えるととどめをさせるようになる ver 1.0

■作成者
キュウブ

■概要
最小化攻撃はHPを1に減らすだけでそれ以上のダメージを与える事ができません。
このスクリプトを導入する事で、HP1の敵にも1ダメージだけ与えられるようになります。

■使い方
導入するだけ
※いろんなスクリプトと競合しそうなので上手く動かなかったら頑張って変更してください

■更新履歴
ver 1.0 (2019/10/2)
初版作成

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
	var alias = AttackEvaluator.HitCritical.calculateDamage;
	AttackEvaluator.HitCritical.calculateDamage = function(virtualActive, virtualPassive, attackEntry) {
		var damage = alias.call(this, virtualActive, virtualPassive, attackEntry);
		
		if (damage === 0 && DamageCalculator.isHpMinimum(virtualActive.unitSelf, virtualPassive.unitSelf, virtualActive.weapon, attackEntry.isCritical, 0)) {
			damage = 1;
		}

		return damage;
	};
})();
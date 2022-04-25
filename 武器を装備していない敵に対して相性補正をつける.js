/*--------------------------------------------------------------------------
　武器を装備していない相手に対して相性補正をつける ver1.0

■作成者
キュウブ

■概要
このスクリプトを導入すると、
武器を装備していない相手に対して相性補正をつける事ができるようになります。
敵の武器が消耗され尽くして相性有利をとれなくなる事で、かえって倒しにくくなる現象を防ぐ事ができます。

※あくまでも相手が武器を装備していない場合に限ります。
※反撃ができないだけで武器を持てているパターンでは本スクリプトの効果は有効になりません。

■使い方
武器の相性補正で"有効武器なし"と設定する事で、適用可能となります。

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

(function() {
	var _CompatibleCalculator__getCompatible = CompatibleCalculator._getCompatible;
	CompatibleCalculator._getCompatible = function(active, passive, weapon) {
		var count, compatible, weaponTypeActive;
		var weaponPassive = ItemControl.getEquippedWeapon(passive);
		
		if (!weaponPassive && weapon) {
			weaponTypeActive = weapon.getWeaponType();
			count = weaponTypeActive.getCompatibleCount();
			for (var index = 0; index < count; index++) {
				compatible = weaponTypeActive.getCompatibleData(index);
				if (!compatible.getSrcObject()) {
					return compatible.getSupportStatus();
				}
			}
			return null;
		}
		return _CompatibleCalculator__getCompatible.apply(this, arguments);
	};
})();
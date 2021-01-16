/*--------------------------------------------------------------------------
　特定ユニットのみ専用条件を無視して武器を装備可能にする ver 1.0

■作成者
キュウブ

■概要
任意のユニットのカスパラに
{ignoreConditionWeaponId:<武器ID>}
と設定すると、指定された武器の専用条件を無視して装備できるようになる。

特定の敵が味方の専用武器を使用するといったシチュエーションを想定している。

■更新履歴

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
	var alias = ItemControl.isOnlyData;
	ItemControl.isOnlyData = function(unit, item) {
		if (
			typeof unit.custom.ignoreConditionWeaponId === 'number' &&
			item.isWeapon() &&
			unit.custom.ignoreConditionWeaponId === item.getId()
		) {
			return true;
		}
		return alias.call(this, unit, item);
	};
})();
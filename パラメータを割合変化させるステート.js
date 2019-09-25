/*--------------------------------------------------------------------------
　パラメータを割合変化させるステート ver 1.0

■作成者
キュウブ

■概要
ステートによるパラメータ補正で
10%,20%上昇といった具合に割合変化させる事ができます。

■使い方
ステートのカスパラに
rate_correction:[<最大HP>, <力>, <魔力>, <技>, <速さ>, <幸運>, <守備>, <魔防>, <移動>, <熟練度>, <体格>]
と設定する。

例えば
rate_correction:[0, -10, 20, 0, 0, 0, 0, 10, 0, 0, 0]
とか設定すると力が10%減少、魔力20%増加、魔防10%増加となる

■更新履歴
2017/7/9
5chで晒した気がする

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
(function() {
	var alias = StateControl.getStateParameter;
	StateControl.getStateParameter = function(unit, index) {
		var list = unit.getTurnStateList();
		var count = list.getCount();
		var value = alias.call(this, unit, index);
		var state;

		for (var i = 0; i < count; i++) {
			state = list.getData(i).getState();
			if (typeof state.custom.rate_correction === 'object') { 
				value += Math.floor(ParamGroup.getClassUnitValue(unit, index) * state.custom.rate_correction[index] / 100);
			}
		}

		return value;
	};
})();
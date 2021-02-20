/*--------------------------------------------------------------------------
　ユニットを掴んだ瞬間にアクティブ化させる ver 1.0

■作成者
キュウブ

■概要
本来味方ユニットは移動後ユニットコマンドが出る瞬間にアクティブユニットとして設定されます。
このスクリプトではユニットを掴むとアクティブユニットとして設定されるようになります（自軍ユニットのみ）。

このプラグインを導入するとユニット選択時に自動イベントを発火させるプラグインで
特定ユニットを掴んだ時にだけイベントを発生させる事ができるようになります。

アクティブ化の瞬間が変わってしまいますが、特殊な活用をしてなければ導入しても影響はないはず

■更新履歴
ver 1.0 (2021/2/20)
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
	var alias = MapSequenceArea._completeSequenceMemberData;
	MapSequenceArea._completeSequenceMemberData = function(parentTurnObject) {
		alias.call(this, parentTurnObject);
		if (this._targetUnit.getUnitType() === UnitType.PLAYER) {
			root.getCurrentSession().setActiveEventUnit(this._targetUnit);
		}
	}
})();
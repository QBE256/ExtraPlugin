/*--------------------------------------------------------------------------
　敵を強制的に形態変化させる攻撃 ver 1.0

■作成者
キュウブ

■概要
このスクリプトを用いる事で、攻撃した敵を強制的に形態変化させる事ができます。
例えば、騎馬ユニットを落馬させるなどの使い方ができます。

■設定方法
1.専用ステートを用意する
下記のカスパラを設定したステートを用意します。
metamorphozeId: <形態変化先の番号>

2.ステート攻撃スキルを用意する
1で作成したステートを攻撃で与えるスキルを準備します。
※落馬攻撃にするのであれば、有効相手を騎馬系クラスのみに絞ると良いでしょう。

3.武器スキルやユニットのスキルに2で作成したスキルを設定
特定の武器で形態変化させたい場合は武器のスキル、
ユニット固有のスキルにしたい場合はユニットスキルとして設定しましょう。

これでスキル攻撃を行えば戦闘終了後に相手は強制的に形態変化します。

[注意点]
形態変化用のステートは戦闘終了時に強制削除されます。よって、カスパラ以外に凝った設定は不要です。 


■更新履歴
ver 1.0 (2021/04/29)
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
StateControl.getMetamorphozeState = function(unit) {
	var state, count;
	var stateList = unit.getTurnStateList();
	count = stateList.getCount();
	for (var index = 0; index < count; index++) {
		state = stateList.getData(index).getState();
		if (typeof state.custom.metamorphozeId === 'number') {
			return state;
		}
	}
	return null;
};

(function(){
	var _PreAttack__doEndAction = PreAttack._doEndAction;
	PreAttack._doEndAction = function() {
		var activeUnit = this.getActiveUnit();
		var passiveUnit = this.getPassiveUnit();
		var activeState = StateControl.getMetamorphozeState(activeUnit);
		var passiveState = StateControl.getMetamorphozeState(passiveUnit);
		var generator = root.getEventGenerator();
		var metamorphozeList = root.getBaseData().getMetamorphozeList();
		if (activeState) {
			generator.unitMetamorphoze(
				activeUnit,
				metamorphozeList.getDataFromId(activeState.custom.metamorphozeId),
				MetamorphozeActionType.CHANGE,
				false
			);
			StateControl.arrangeState(activeUnit, activeState, IncreaseType.DECREASE);
		}
		if (passiveState) {
			generator.unitMetamorphoze(
				passiveUnit,
				metamorphozeList.getDataFromId(passiveState.custom.metamorphozeId),
				MetamorphozeActionType.CHANGE,
				false
			);
			StateControl.arrangeState(passiveUnit, passiveState, IncreaseType.DECREASE);
		}
		generator.execute();
		_PreAttack__doEndAction.call(this);
	};
})();
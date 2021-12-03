/*--------------------------------------------------------------------------
　スキル発動条件に変数やグローバルスイッチを追加 ver 1.0

■作成者
キュウブ

■概要
カスタムパラメータを設定することで
特定のグローバルスイッチがオンの場合や、
特定の変数の値が特定条件を満たす場合にのみスキルが発動するよう制御が可能になります。

■使い方
1.グローバルスイッチを発動条件に加えたい場合
スキルのカスタムパラメータに下記の設定を行えば発動するようになります。
globalSwitchCondition: {
	switchId: <条件となるグローバルスイッチのID>
}

2.変数を発動条件に加えたい場合
variableCondtion: {
	tableIndex: <対象変数が存在するテーブルが左から何番目か記入(※左端は0番目とします)>,
	variableId: <対象変数のID>,
	sign: '<等号や不等号などを記入>',
	value: <条件となる値を記入>
}

※ signは文字列型なので値は''で括って記入する事

例1.左端テーブル(デフォルトテーブル名が1)のID2の変数の値が4未満の時を発動条件としたい場合
variableCondtion: {
	tableIndex: 0,
	variableId: 2,
	sign: '<',
	value: 4
}

例2.左から2番目のテーブル(左端を0番目とした場合なのでデフォルトテーブル名が3)のID4の変数の値が5ではない時を発動条件としたい場合
variableCondtion: {
	tableIndex: 2,
	variableId: 4,
	sign: '!=',
	value: 5
}

※ signとして有効な記号は以下の通り
= valueと変数が同じ時に発動
!= value以外の変数の時発動
>= value以上の変数の時に発動
> valueより変数が大きい時に発動
<= value以下の変数の時に発動
< value未満の変数の時に発動

■更新履歴
ver 1.0 (2021/12/04)
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
	var _Probability_getInvocationProbabilityFromSkill = Probability.getInvocationProbabilityFromSkill;
	Probability.getInvocationProbabilityFromSkill = function(unit, skill) {
		if (
			this._isVariableCondtion(skill) &&
			this._isGlobalSwitchCondition(skill)
		) {
			return _Probability_getInvocationProbabilityFromSkill.apply(this, arguments);
		}
		else {
			return false;
		}
	};

	Probability._isVariableCondtion = function(skill) {
		var sign, variableTable, variableIndex, variableValue;
		if (!validateVariableCondition(skill)) {
			return true;
		}
		variableTable = root.getMetaSession().getVariableTable(skill.custom.variableCondtion.tableIndex);
		variableIndex = variableTable.getVariableIndexFromId(skill.custom.variableCondtion.variableId);
		variableValue = variableTable.getVariable(variableIndex);
		sign = skill.custom.variableCondtion.sign;
		if (sign === '=') {
			return variableValue === skill.custom.variableCondtion.value;
		}
		else if (sign === '>=') {
			return variableValue >= skill.custom.variableCondtion.value;
		}
		else if (sign === '>') {
			return variableValue > skill.custom.variableCondtion.value;
		}
		else if (sign === '!=') {
			return variableValue !== skill.custom.variableCondtion.value;
		}
		else if (sign === '<=') {
			return variableValue <= skill.custom.variableCondtion.value;
		}
		else if (sign === '<') {
			return variableValue < skill.custom.variableCondtion.value;
		}
		else {
			root.log('variableCondtionのエラー');
			root.log('signのパラメータが予期しない値に設定されています');
			return true;
		}
	};

	Probability._isGlobalSwitchCondition = function(skill) {
		var switchTable, switchIndex;
		if (!validateGlobalSwitchCondition(skill)) {
			return true;
		}
		switchTable = root.getMetaSession().getGlobalSwitchTable();
		switchIndex = switchTable.getSwitchIndexFromId(skill.custom.globalSwitchCondition.switchId);
		return switchTable.isSwitchOn(switchIndex);
	};

	var validateVariableCondition = function(object) {
		if (typeof object.custom.variableCondtion !== 'object') {
			return false;
		}
		if (
			!('tableIndex' in object.custom.variableCondtion) ||
			!('variableId' in object.custom.variableCondtion) ||
			!('sign' in object.custom.variableCondtion) ||
			!('value' in object.custom.variableCondtion)
		) {
			root.log('variableCondtionのエラー');
			root.log('オブジェクトのプロパティが足りません');
			return false;
		}
		if (
			typeof object.custom.variableCondtion.tableIndex !== 'number' ||
			typeof object.custom.variableCondtion.variableId !== 'number' ||
			typeof object.custom.variableCondtion.sign !== 'string' ||
			typeof object.custom.variableCondtion.value !== 'number'
		) {
			root.log('variableCondtionのエラー');
			root.log('オブジェクトのプロパティの型が一部誤っています');
			return false;
		}
		return true;
	};

	var validateGlobalSwitchCondition = function(object) {
		if (typeof object.custom.globalSwitchCondition !== 'object') {
			return false;
		}
		if (!('switchId' in object.custom.globalSwitchCondition)) {
			root.log('globalSwitchConditionのエラー');
			root.log('オブジェクトのプロパティが足りません');
			return false;
		}
		if (
			typeof object.custom.globalSwitchCondition.switchId !== 'number'
		) {
			root.log('globalSwitchConditionのエラー');
			root.log('オブジェクトのプロパティの型が誤っています');
			return false;
		}
		return true;
	};
})();
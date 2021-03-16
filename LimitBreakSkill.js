/*--------------------------------------------------------------------------
　限界突破スキル ver 1.0

■作成者
キュウブ

■概要
上限値を突破させる事ができます。

※テストプレイ用のテストメンバーに関してはいくら高い値を設定しても、Sスタ側で補正されてコンフィグ2の上限を超えて設定される事がありません
※ゲーム開始後に別途パラメータを上昇させてやればステータスが上限突破します

■使い方
1.カスタムスキルでカスタムキーワード"limitBreak"を作る
2.カスタムスキルのカスタムパラメータに下記を設定

limitBreakParameters:[
	<HPの上限突破量>,
	<力の上限突破量>,
	<魔力の上限突破量>,
	<技の上限突破量>,
	<速さの上限突破量>,
	<幸運の上限突破量>,
	<守備の上限突破量>,
	<魔防の上限突破量>,
	<移動の上限突破量>,
	<熟練度の上限突破量>,
	<体格の上限突破量>
];

例えば、下記の場合はHP～魔防(移動、体格、熟練度を除く)の上限を5上昇させます
limitBreakParameters:[5,5,5,5,5,5,5,5,0,0,0];

下記のように負の値を設定すれば上限値を下げる事も可能です(上限が5減少します)。
※下げすぎて上限値が0未満になった時の挙動は保証しません
※移動力は高くなる程、移動計算に時間を要するようになります。
※また、SRPGStudioの移動不可地形の移動コストは内部的には500として扱われているので、移動力を500以上まで上げるような使い方もやめておいた方が無難です。
limitBreakParameters:[-5,-5,-5,-5,-5,-5,-5,-5,0,0,0];

■更新履歴
ver 1.0 (2021/03/17)
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
	var _BaseUnitParameter_getMaxValue = BaseUnitParameter.getMaxValue;
	BaseUnitParameter.getMaxValue = function(unit) {
		var parameterIndex = this.getParameterType();
		var limitBreakValue = 0;
		var skill = SkillControl.getPossessionCustomSkill(unit, 'limitBreak');

		if (skill && validationLimitBreakSkill(skill, parameterIndex)) {
			limitBreakValue = skill.custom.limitBreakParameters[parameterIndex];
		}
		root.log(limitBreakValue);
		return _BaseUnitParameter_getMaxValue.call(this, unit) + limitBreakValue;
	}

	var validationLimitBreakSkill = function(skill, index) {
		if (!Array.isArray(skill.custom.limitBreakParameters)) {
			root.log("limitBreakスキルのカスパラが配列になっていません");
			return false;
		}
		if (skill.custom.limitBreakParameters.length <= index) {
			root.log("limitBreakスキルの配列の長さが足りていません");
			return false;
		}
		if (typeof skill.custom.limitBreakParameters[index] !== 'number') {
			root.log("limitBreakスキルの配列の中が数値ではありません");
			return false;
		}
		return true;
	}
})();

// Array.isArray
// refrence: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray#polyfill
if (!Array.isArray) {
	Array.isArray = function(value) {
		return Object.prototype.toString.call(value) === '[object Array]';
	};
};
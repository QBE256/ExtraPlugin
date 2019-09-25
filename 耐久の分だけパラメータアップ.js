/*--------------------------------------------------------------------------
■作成者
キュウブ

■概要
耐久の分だけパラメータに補正がかかるようになる

■使い方
武器のカスパラに以下のようにtrueかfalseを入れる 
  limitCorrectionIndexArray:[
	<HPに補正かけたい時はtrue, かけたくない時はfalse>,
	<力に補正かけたい時はtrue, かけたくない時はfalse>,
	<魔力に補正かけたい時はtrue, かけたくない時はfalse>,
	<技に補正かけたい時はtrue, かけたくない時はfalse>,
	<速さに補正かけたい時はtrue, かけたくない時はfalse>,
	<幸運に補正かけたい時はtrue, かけたくない時はfalse>,
	<守備に補正かけたい時はtrue, かけたくない時はfalse>,
	<魔防に補正かけたい時はtrue, かけたくない時はfalse>
  ];

例1:力にだけ補正をかけたい
limitCorrectionIndexArray:[
  false,
  true,
  false,
  false,
  false,
  false,
  false,
  false
];

面倒くさい時はこれでも以下でも動く
limitCorrectionIndexArray:[false,true]

例2:力と速さに補正をかけたい
limitCorrectionIndexArray:[
  false,
  true,
  false,
  false,
  true,
  false,
  false,
  false
];

面倒くさい時は以下でも動く
limitCorrectionIndexArray:[false,true,false,false,true]

■更新履歴
ver 1.0 (2017/10/21)
公開 

■対応バージョン
SRPG Studio Version:1.158

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

	var tempFunctions = {
		BaseUnitParameter: {
			getUnitTotalParamBonus: BaseUnitParameter.getUnitTotalParamBonus
		}
	};

	BaseUnitParameter.getUnitTotalParamBonus = function(unit, weapon) {
		var result = tempFunctions.BaseUnitParameter.getUnitTotalParamBonus.call(this, unit, weapon);

		if (weapon !== null && this._isLimitCorrection(weapon) === true) {
			result += weapon.getLimit();
		}

		return result;
	};

	BaseUnitParameter._isLimitCorrection = function(weapon) {
		var index;

		if (typeof weapon.custom.limitCorrectionIndexArray !== 'object') {
			return false;
		}

		index = this.getParameterType();

		if (index < weapon.custom.limitCorrectionIndexArray.length && weapon.custom.limitCorrectionIndexArray[index] === true) {
			return true;
		}

		return false;
	};
})();
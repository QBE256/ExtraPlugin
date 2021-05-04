/*--------------------------------------------------------------------------
　スキル発動確率の表記変更 ver 1.0

■作成者
キュウブ

■概要
スキルの発動確率で (ステータス×係数)% となっている場合、
情報ウィンドウでユニットのステータスを反映した値が表記されるようになります。

例えば、デフォルトで 速さ×2% と設定されているスキルは
情報ウィンドウでも発動確率が (速さ×2) %と表記されます。
このスクリプトを導入した場合は
対象ユニットの速さが10の時は20%,30の時は60%と表示されるようになります。

■注意点
発動確率を拡張するような他スクリプトには対応しておりません


■更新履歴
ver 1.0 (2021/05/04)
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
	SkillInteraction.setUnitData = function(unit) {
		this._window.setUnitData(unit);
	};

	SkillInfoWindow._unit = null;
	SkillInfoWindow.setUnitData = function(unit) {
		this._unit = unit;
	};

	SkillInfoWindow._drawInvocationValue = function(x, y, skill, length, color, font) {
		var text = InvocationRenderer.getInvocationText(skill.getInvocationValue(), skill.getInvocationType(), this._unit);
		
		TextRenderer.drawKeywordText(x, y, StringTable.SkillWord_Invocation, length, ColorValue.KEYWORD, font);
		x += ItemInfoRenderer.getSpaceX();
		
		TextRenderer.drawKeywordText(x, y, text, -1, color, font);
	};

	var _InvocationRenderer_getInvocationText = InvocationRenderer.getInvocationText;
	InvocationRenderer.getInvocationText = function(value, type, unit) {
		var text = '';
		if (!unit || type === InvocationType.HPDOWN || type === InvocationType.ABSOLUTE) {
			return _InvocationRenderer_getInvocationText.apply(this, arguments);
		}
		
		if (type === InvocationType.LV) {
			text = Math.floor(unit.getLv() * value);
		}
		else {
			text = Math.floor(ParamBonus.getBonus(unit, ParamGroup.getParameterIndexFromType(type)) * value);
		}
		
		text += StringTable.SignWord_Percent;

		return text;
	};

	var _UnitMenuBottomWindow__setSkillData = UnitMenuBottomWindow._setSkillData;
	UnitMenuBottomWindow._setSkillData = function(unit) {
		_UnitMenuBottomWindow__setSkillData.call(this, unit);
		this._skillInteraction.setUnitData(unit);
	};

	var _UnitMenuBottomWindow_changeUnitMenuTarget = UnitMenuBottomWindow.changeUnitMenuTarget;
	UnitMenuBottomWindow.changeUnitMenuTarget = function(unit) {
		_UnitMenuBottomWindow_changeUnitMenuTarget.call(this, unit);
		this._skillInteraction.setUnitData(unit);
	};
})();
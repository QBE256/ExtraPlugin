/*--------------------------------------------------------------------------
　スキル発動確率の表記変更 ver 1.1

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
ver 1.1 (2021/10/23)
リバイバルスキルの残り回数を表示するように対応

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

	InvocationRenderer.getRivivalCountText = function(maxCount, activeCount) {
		var restCount = maxCount > activeCount ? maxCount - activeCount : 0;
		return 'あと' + restCount + '回発動可能';
	};

	SkillInfoWindow.drawWindowContent = function(x, y) {
		var text, skillText, count, restCountText, activeCount;
		var length = this._getTextLength();
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		
		if (this._skill === null) {
			return;
		}
		
		this._drawName(x, y, this._skill, length, color, font);
		y += ItemInfoRenderer.getSpaceY();
		
		if (this._isInvocationType()) {
			this._drawInvocationValue(x, y, this._skill, length, color, font);
			y += ItemInfoRenderer.getSpaceY();
		}
		
		if (this._aggregationViewer !== null) {
			count = this._aggregationViewer.getAggregationViewerCount();
			if (count !== 0) {
				this._aggregationViewer.drawAggregationViewer(x, y, this._getMatchName());
				y += ItemInfoRenderer.getSpaceY() * this._aggregationViewer.getAggregationViewerCount();
			}
		}

		if (typeof this._skill.custom.maxActivateCount === 'number' && this._unit) {
			activeCount = 
				typeof this._unit.custom.revivalSkillActivateCount === 'number' ? this._unit.custom.revivalSkillActivateCount : 0;
			restCountText = InvocationRenderer.getRivivalCountText(this._skill.custom.maxActivateCount, activeCount);
			TextRenderer.drawKeywordText(x, y, restCountText, length, ColorValue.KEYWORD, font);
			y += ItemInfoRenderer.getSpaceY();
		}
		
		text = this._getSkillTypeText();
		if (text !== '') {
			skillText = root.queryCommand('skill_object');
			TextRenderer.drawKeywordText(x, y, text + ' ' + skillText, length, ColorValue.KEYWORD, font);
		}
		else {
			text = this._getCategoryText();
			TextRenderer.drawKeywordText(x, y, text, length, ColorValue.KEYWORD, font);
		}
	};

	var _SkillInfoWindow_getWindowHeight = SkillInfoWindow.getWindowHeight;
	SkillInfoWindow.getWindowHeight = function() {
		var height = _SkillInfoWindow_getWindowHeight.call(this);
		if (this._skill && this._unit && typeof this._skill.custom.maxActivateCount === 'number') {
			height += ItemInfoRenderer.getSpaceY();
		}
		return height;
	}
})();
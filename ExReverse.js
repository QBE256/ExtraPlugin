/*--------------------------------------------------------------------------
　経験値マイナスコマンド ver 1.1

■作成者
キュウブ

■概要
ユニットコマンドの"経験値を与える"で、経験値を減らす事ができるようになります。

■仕様
ユニットのレベルが下がる事はありません。どんなに大きな値を指定しても0で止まります。

■使い方
1.フラグ管理用のグローバルスイッチを作成する。
2.41行目のMINUS_EXPERIENCE_MODE_SWITCH_ID に1で作成したグローバルスイッチのIDを記しておく。

これで1のグローバルスイッチがオンの間、
経験値を与えるコマンドを実行すると逆に減少するようになります。
※オンの間は常時減少してしまうので、コマンドの実行が完了したら即オフに戻す事を推奨します。

■更新履歴
ver 1.1 (2020/06/11)
バグ修正

ver 1.0 (2020/06/10)
初版公開

■対応バージョン
SRPG Studio Version:1.211

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。
・クレジット明記無し　OK (明記する場合は"キュウブ"でお願いします)
・再配布、転載　OK (バグなどがあったら修正できる方はご自身で修正版を配布してもらっても構いません)
・wiki掲載　OK
・SRPG Studio利用規約は遵守してください。

--------------------------------------------------------------------------*/

// ここにグローバルスイッチのIDを書いておく
// このIDのスイッチがオンの時は得られる経験値がマイナスになる
var MINUS_EXPERIENCE_MODE_SWITCH_ID = 0;

(function(){
	var alias1 = ExperienceControl._addExperience;
	ExperienceControl._addExperience = function(unit, getExp) {
		var result = alias1.call(this, unit, getExp);

		if (unit.getExp() < 0) {
			unit.setExp(0);
		}

		return result;
	};

	ExperiencePlusEventCommand._prepareEventCommandMemberData = function() {
		var eventCommandData = root.getEventCommandObject();
		var globalSwitchTable = root.getMetaSession().getGlobalSwitchTable();

		this._getExp = eventCommandData.getExperienceValue();

		if (globalSwitchTable.isSwitchOn(globalSwitchTable.getSwitchIndexFromId(MINUS_EXPERIENCE_MODE_SWITCH_ID)) === true) {
			this._getExp *= -1;
		}

		this._type = eventCommandData.getExperiencePlusType();
		this._targetUnit = eventCommandData.getTargetUnit();
		this._levelupView = createObject(LevelupView);
		this._experienceNumberView = createWindowObject(ExperienceNumberView, this);
		this._growthArray = null;
		this._isMaxLv = false;
		
		if (this._targetUnit !== null) {
			this._isMaxLv = this._targetUnit.getLv() >= Miscellaneous.getMaxLv(this._targetUnit);
			if (!this._isMaxLv && this._type === ExperiencePlusType.VALUE) {
				this._growthArray = ExperienceControl.obtainExperience(this._targetUnit, this._getExp);
			}
		}
	};

	var alias2 = ExperienceNumberView.setExperienceNumberData;
	ExperienceNumberView._isDecreaseExperience = false;
	ExperienceNumberView.setExperienceNumberData = function(unit, exp) {

		if (exp < 0) {
			exp = -1 * exp;
			this._isDecreaseExperience = true;
		}

		alias2.call(this, unit, exp);
	};

	ExperienceNumberView._drawExp = function(x, y) {
		var textui = this._getTitleTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		var pic = textui.getUIImage();
		var width = TitleRenderer.getTitlePartsWidth();
		var height = TitleRenderer.getTitlePartsHeight();
		var count = this._getTitlePartsCount();
		var exp = this._balancer.getCurrentValue();
		
		TitleRenderer.drawTitle(pic, x, y, width, height, count);
		
		x += 55;
		y += 18;
		NumberRenderer.drawAttackNumber(x, y, exp);

		if (this._isDecreaseExperience === false) {
			TextRenderer.drawText(x + 75, y + 5, StringTable.GetTitle_ExperiencePlus, -1, color, font);
		}
		else {
			TextRenderer.drawText(x + 75, y + 5, "Exp Lost", -1, color, font);
		}
	};
})();
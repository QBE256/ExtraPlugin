/*--------------------------------------------------------------------------
　未習得スキルをステータスに表示する ver 1.0

■作成者
キュウブ

■概要
このスクリプトを導入すると
ステータス画面に未習得スキルが表示されるようになります。

表示は以下のようになっており、スキル名と習得LV以外はマスクされる仕様になっています。
・スキルアイコンはランタイム画像の?マーク
・スキルウィンドウに記載されるのはスキル名と"未習得スキル"という表記のみ
・スキル説明欄には"LV??で習得"とだけ表示

※隠しスキルに関しては表示しません
※クラスチェンジ後に習得するはずのクラススキルにも対応はしていません。あくまでもレベルアップで覚えるスキルのみとなります。

■更新履歴
ver 1.0 (2021/11/14)
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

ObjectType.UNLEARNED = 277;
UnitMenuBottomWindow._setSkillData = function(unit) {
	var i;
	var weapon = ItemControl.getEquippedWeapon(unit);
	var unlearnedSkills = SkillControl.getUnlearnedSkillArray(unit);
	var learnedSkills = SkillControl.getSkillMixArray(unit, weapon, -1, '');
	var unitSkills = learnedSkills.concat(unlearnedSkills);
	var count = unitSkills.length;
	var newSkillArray = [];
		
	for (i = 0; i < count; i++) {
		if (!unitSkills[i].skill.isHidden()) {
			newSkillArray.push(unitSkills[i]);
		}
	}
		
	this._skillInteraction.setSkillArray(newSkillArray);
};

SkillControl.getUnlearnedSkillArray = function(unit) {
	var newSkill, skill, skillEntry;
	var unlearnedSkillArray = [];
	var count = unit.getNewSkillCount();
	for (var index = 0; index < count; index++) {
		newSkill = unit.getNewSkill(index);
		skill = newSkill.getSkill();
		if (!skill.isHidden() && !SkillChecker._isSkillLearned(unit, skill)) {
			skillEntry = StructureBuilder.buildMixSkillEntry();
			skillEntry.skill = skill;
			skillEntry.leaningLv = newSkill.getLv();
			skillEntry.objecttype = ObjectType.UNLEARNED;
			unlearnedSkillArray.push(skillEntry);
		}
	}
	return unlearnedSkillArray;
};

(function(){
	var _StructureBuilder_buildMixSkillEntry = StructureBuilder.buildMixSkillEntry;
	StructureBuilder.buildMixSkillEntry = function() {
		var skillEntry = _StructureBuilder_buildMixSkillEntry.call(this);
		skillEntry.leaningLv = 0;
		return skillEntry;
	};

	var _IconItemScrollbar_drawScrollContent = IconItemScrollbar.drawScrollContent;
	IconItemScrollbar.drawScrollContent = function(x, y, object, isSelect, index) {
		var handle;
		if (object.objecttype === ObjectType.UNLEARNED) {
			// 未習得スキルの場合はランタイム画像の?マークを表示させる
			handle = root.createResourceHandle(true, 0, 0, 4, 8);
			GraphicsRenderer.drawImage(x, y, handle, GraphicsType.ICON);
		}
		else {
			_IconItemScrollbar_drawScrollContent.apply(this, arguments);
		}
	};

	SkillInteraction._changeTopic = function() {
		var skillEntry = this._scrollbar.getObject();
		
		this._window.setSkillInfoData(skillEntry.skill, skillEntry.objecttype, skillEntry.leaningLv);
	};

	var _SkillInteraction_getHelpText = SkillInteraction.getHelpText;
	SkillInteraction.getHelpText = function() {
		var skillEntry = this._scrollbar.getObject();
		if (skillEntry.objecttype === ObjectType.UNLEARNED) {
			return 'LV' + skillEntry.leaningLv + 'で習得';
		}
		else {
			return _SkillInteraction_getHelpText.call(this);
		}
	};

	SkillInfoWindow._leaningLv = 0;
	var _SkillInfoWindow_setSkillInfoData = SkillInfoWindow.setSkillInfoData;
	SkillInfoWindow.setSkillInfoData = function(skill, objecttype, learningLv) {
		_SkillInfoWindow_setSkillInfoData.apply(this, arguments);
		if (skill === null) {
			this._leaningLv = typeof learningLv !== number ? 0 : leaningLv;
		}
	};

	var _SkillInfoWindow_drawWindowContent = SkillInfoWindow.drawWindowContent;
	SkillInfoWindow.drawWindowContent = function(x, y) {
		var text, skillText, count;
		var length = this._getTextLength();
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		
		if (this._skill === null) {
			return;
		}

		if (this._objecttype !== ObjectType.UNLEARNED) {
			_SkillInfoWindow_drawWindowContent.apply(this, arguments);
			return;
		}
		this._drawName(x, y, this._skill, length, color, font);
		y += ItemInfoRenderer.getSpaceY();
		TextRenderer.drawKeywordText(x, y, '未習得スキル', length, ColorValue.KEYWORD, font);
	};

	var _SkillInfoWindow_getWindowHeight = SkillInfoWindow.getWindowHeight;
	SkillInfoWindow.getWindowHeight = function() {
		if (this._objecttype === ObjectType.UNLEARNED) {
			return 3 * ItemInfoRenderer.getSpaceY();
		}
		else {
			return _SkillInfoWindow_getWindowHeight.call(this);
		}
	};
})();
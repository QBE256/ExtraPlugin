/*--------------------------------------------------------------------------
　新規イベントにNEWマークを表示 ver 1.0

■作成者
キュウブ

■概要
拠点コミュニケーションイベント、クエストを開いた時、
初めて確認したイベントにはイベント名の隣にNEW表示がつきます。

■更新履歴
ver 1.0 (2021/03/21)
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

var HaveSeenEventType = {
	REST_COMMUNICATION: 0,
	REST_QUEST: 1
};

StringTable.NewMarkText = "NEW";

var HaveSeenEventControl = {
	createGlobalParameter: function() {
		root.getMetaSession().global.haveSeenEventList = [];
		root.getMetaSession().global.haveSeenEventList[HaveSeenEventType.REST_COMMUNICATION] = [];
		root.getMetaSession().global.haveSeenEventList[HaveSeenEventType.REST_QUEST] = [];
	},

	getGlobalParameter: function() {
		return root.getMetaSession().global.haveSeenEventList;
	},

	existsGlobalParameter: function() {
		return Array.isArray(root.getMetaSession().global.haveSeenEventList);
	},

	haveSeenEvent: function(eventId, eventType) {
		var eventIndex;
		var haveSeenEventIds = root.getMetaSession().global.haveSeenEventList[eventType];

		for (var index = 0; index < haveSeenEventIds.length; index++) {
			if (haveSeenEventIds[index] === eventId) {
				return true;
			}
		}
		return false;
	},

	addSeenEventId: function(eventId, eventType) {
		if (!this.haveSeenEvent(eventId, eventType)) {
			root.getMetaSession().global.haveSeenEventList[eventType].push(eventId);
		}
	}
};

(function(){
	CommunicationScrollbar._newFormattedText = null;
	CommunicationScrollbar.setFormattedText = function() {
		var font = this.getParentTextUI().getFont();

		this._newFormattedText = root.getGraphicsManager().createFormattedText(StringTable.NewMarkText, font);
		this._newFormattedText.setValidArea(0, StringTable.NewMarkText.length);
		this._newFormattedText.setColorAlpha(0, StringTable.NewMarkText.length, 0xff5500, 255);
		this._newFormattedText.setFontSize(0, StringTable.NewMarkText.length, font.getSize() - 2);
		if (!HaveSeenEventControl.existsGlobalParameter()) {
			HaveSeenEventControl.createGlobalParameter();
		}
	};

	QuestListScrollbar._newFormattedText = null;
	QuestListScrollbar.setFormattedText = function() {
		var font = this.getParentTextUI().getFont();

		this._newFormattedText = root.getGraphicsManager().createFormattedText(StringTable.NewMarkText, font);
		this._newFormattedText.setValidArea(0, StringTable.NewMarkText.length);
		this._newFormattedText.setColorAlpha(0, StringTable.NewMarkText.length, 0xff5500, 255);
		this._newFormattedText.setFontSize(0, StringTable.NewMarkText.length, font.getSize() - 2);
		if (!HaveSeenEventControl.existsGlobalParameter()) {
			HaveSeenEventControl.createGlobalParameter();
		}
	};

	var _CommunicationScreen__prepareScreenMemberData = CommunicationScreen._prepareScreenMemberData;
	CommunicationScreen._prepareScreenMemberData = function(screenParam) {
		_CommunicationScreen__prepareScreenMemberData.call(this, screenParam);
		this._scrollbar.setFormattedText();
	};

	var _QuestListWindow_setWindowData = QuestListWindow.setWindowData;
	QuestListWindow.setWindowData = function() {
		_QuestListWindow_setWindowData.call(this);
		var count = LayoutControl.getObjectVisibleCount(DefineControl.getTextPartsHeight(), 12);
		this._scrollbar.setFormattedText();
	};

	var _CommunicationScrollbar_objectSet = CommunicationScrollbar.objectSet;
	CommunicationScrollbar.objectSet = function(object) {
		object.needsShowNewMark = this._needsShowNewMark(object);
		if (object.needsShowNewMark) {
			HaveSeenEventControl.addSeenEventId(object.event.getId(), HaveSeenEventType.REST_COMMUNICATION);
		}
		_CommunicationScrollbar_objectSet.call(this, object);
	};

	var _QuestListScrollbar_objectSet = QuestListScrollbar.objectSet;
	QuestListScrollbar.objectSet = function(object) {
		object.needsShowNewMark = this._needsShowNewMark(object);
		if (object.needsShowNewMark) {
			HaveSeenEventControl.addSeenEventId(object.data.getId(), HaveSeenEventType.REST_QUEST);
		}
		_QuestListScrollbar_objectSet.call(this, object);
	};

	// Newマークは拠点シーンかつ一度もイベント名を見かけた事が無い時のみ表示させる
	// 他シーンでも表示させたい場合はこのメソッドを改修すれば良い
	CommunicationScrollbar._needsShowNewMark = function(object) {
		return root.getCurrentScene() === SceneType.REST && 
			!HaveSeenEventControl.haveSeenEvent(object.event.getId(), HaveSeenEventType.REST_COMMUNICATION);
	};

	// クエスト画面は拠点シーンしかありえないので、シーン確認は行わない
	QuestListScrollbar._needsShowNewMark = function(object) {
		return object.isVisible && !HaveSeenEventControl.haveSeenEvent(object.data.getId(), HaveSeenEventType.REST_QUEST);
	};

	var _CommunicationScrollbar__drawName = CommunicationScrollbar._drawName;
	CommunicationScrollbar._drawName = function(x, y, object, isSelect, index) {
		var eventNameTextLength;

		_CommunicationScrollbar__drawName.apply(this, arguments);
		if (!object.needsShowNewMark) {
			return;
		}
		eventNameTextLength = root.getGraphicsManager().getTextWidth(object.event.getName(), this.getParentTextUI().getFont());
		this._newFormattedText.drawFormattedText(x + eventNameTextLength + 5, y, 0xff0000, 155);
	};

	var _QuestListScrollbar_drawScrollContent = QuestListScrollbar.drawScrollContent;
	QuestListScrollbar.drawScrollContent = function(x, y, object, isSelect, index) {
		var eventNameTextLength;
		var dx = 0;

		_QuestListScrollbar_drawScrollContent.apply(this, arguments);
		if (!object.needsShowNewMark) {
			return;
		}
		eventNameTextLength = root.getGraphicsManager().getTextWidth(object.name, this.getParentTextUI().getFont());
		if (!object.data.getIconResourceHandle().isNullHandle()) {
			eventNameTextLength += 6 + GraphicsFormat.ICON_WIDTH;
		}
		this._newFormattedText.drawFormattedText(x + eventNameTextLength + 5, y, 0xff0000, 155);		
	};
})();

// Array.isArray polyfill
// Reference:https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray#polyfill
if (!Array.isArray) {
	Array.isArray = function(value) {
		return Object.prototype.toString.call(value) === '[object Array]';
	};
};
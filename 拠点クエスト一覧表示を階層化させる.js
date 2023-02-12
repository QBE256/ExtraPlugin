/*--------------------------------------------------------------------------
　拠点クエスト一覧を階層化する ver 1.0

■作成者
キュウブ

■概要
拠点クエストの一覧情報をグルーピングさせる事ができるようになります。

例えば、
初期状態では下記のようにクエストが並んでいて

グループA
グループB
グループC

グループAを選択すると、下記のようにAに所属するクエストが表示されるようになります。

グループA
|- グループAのクエスト1
|- グループAのクエスト2
|- グループAのクエスト3
グループB
グループC

クエストの数が非常に多くなり、スクロールが煩わしくなってきた場合に有効であると考えられます。

■使い方
対象クエストに以下のようなカスパラを設ければOK

directory: {
  name: '<グループ名>'
}

例.下記のようなカスパラを設けたクエストは
'～10章まで'というグループに含まれるようになります。
{
  directory: {
    name: '～10章まで'
  }
}

■更新履歴
ver 1.0 2023/02/13
公開

■対応バージョン
SRPG Studio Version:1.161

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。
・クレジット明記無し　OK (明記する場合は"キュウブ"でお願いします)
・再配布、転載　OK (バグなどがあったらプルリクエストお願いします)
・SRPG Studio利用規約は遵守してください。

--------------------------------------------------------------------------*/

(function(){
  var ROOT_DIRECTORY_NAME = "RootDirectory";

  var _StructureBuilder_buildListEntry = StructureBuilder.buildListEntry;
  StructureBuilder.buildListEntry = function() {
    var buildList = _StructureBuilder_buildListEntry.apply(this, arguments);
    buildList.directory = {
      isDirectory: false,
      isExpand: false
    };
    buildList.isUnderDirectory = false;
    return buildList;
  };

  QuestScreen._groupingQuests = [];
  var _QuestScreen__prepareScreenMemberData = QuestScreen._prepareScreenMemberData;
  QuestScreen._prepareScreenMemberData = function(screenParam) {
    _QuestScreen__prepareScreenMemberData.apply(this, arguments);
    this._groupingQuests = [];
  };

  QuestScreen._getQuestArray = function() {
    var groupingQuestkeys;
    var showQuests = [];
    var quests = root.getBaseData().getRestQuestList();
    var count = quests.getCount();
    var that = this;

    for (var index = 0; index < count; index++) {
      var directoryName;
      var quest = quests.getData(index);
      if (!quest.isQuestDisplayable()) {
        continue;
      }
      if (typeof quest.custom.directory !== 'object') {
        directoryName = ROOT_DIRECTORY_NAME;
      } else {
        directoryName = quest.custom.directory.name;
      }
      if (!Array.isArray(this._groupingQuests[directoryName])) {
        this._groupingQuests[directoryName] = [];
      }
      this._groupingQuests[directoryName].push(quest);
    }

    var groupingQuestkeys = Object.keys(this._groupingQuests).map(function(key){
      return key;
    });
    
    groupingQuestkeys.forEach(function(key){
      if (key === ROOT_DIRECTORY_NAME) {
        that._groupingQuests[key].forEach(function(quest){
          var entry = StructureBuilder.buildListEntry();
          entry.isAvailable = quest.isQuestAvailable();
          entry.isVisible = entry.isAvailable || !quest.isPrivateQuest();
          if (entry.isVisible) {
            entry.name = quest.getName();
          } else {
            entry.name = StringTable.HideData_Question;
          }
          entry.data = quest;
          showQuests.push(entry);
        });
      } else {
        var entry = StructureBuilder.buildListEntry();
        entry.name = key;
        entry.directory.isDirectory = true;
        entry.directory.isExpand = false;
        entry.isAvailable = true;
        entry.isVisible = true;
        entry.data = null;
        showQuests.push(entry);
      }
    });
    return showQuests;
  };

  QuestListScrollbar._directoryStatuses = [];

  var _QuestListScrollbar_drawScrollContent = QuestListScrollbar.drawScrollContent;
  QuestListScrollbar.drawScrollContent = function(x, y, object, isSelect, index) {
    if (object.directory.isDirectory) {
      var length = this._getTextLength();
      var textui = this.getParentTextUI();
      var font = textui.getFont();
      var color = object.isAvailable ? textui.getColor() : ColorValue.DISABLE;

      TextRenderer.drawKeywordText(x, y, object.name, length, color, font);
    } else {
      _QuestListScrollbar_drawScrollContent.apply(this, arguments);
    }
  };

  QuestListScrollbar.drawScrollbar = function(xStart, yStart) {
    var i, j, x, y, isSelect, scrollableData, underDirectoryCorrection;
    var isLast = false;
    var objectCount = this.getObjectCount();
    var width = this._objectWidth + this.getSpaceX();
    var height = this._objectHeight + this.getSpaceY();
    var index = (this._yScroll * this._col) + this._xScroll;
    
    xStart += this.getScrollXPadding();
    yStart += this.getScrollYPadding();
    
    this.xRendering = xStart;
    this.yRendering = yStart;
    MouseControl.saveRenderingPos(this);
    
    for (i = 0; i < this._rowCount; i++) {
      y = yStart + (i * height);
      underDirectoryCorrection = this._objectArray[index].isUnderDirectory ? 12 : 0;
      this.drawDescriptionLine(xStart + underDirectoryCorrection, y);
      
      for (j = 0; j < this._col; j++) {
        x = xStart + (j * width);
        
        isSelect = index === this.getIndex();
        this.drawScrollContent(x + underDirectoryCorrection, y, this._objectArray[index], isSelect, index);
        if (isSelect && this._isActive) {
          this.drawCursor(x, y, true);
        }
        
        if (index === this._forceSelectIndex) {
          this.drawCursor(x, y, false);
        }
        
        if (++index === objectCount) {
          isLast = true;
          break;
        }
      }
      if (isLast) {
        break;
      }
    }
    
    if (this._isActive) {
      scrollableData = this.getScrollableData();
      this._edgeCursor.drawHorzCursor(xStart - this.getScrollXPadding(), yStart - this.getScrollYPadding(), scrollableData.isLeft, scrollableData.isRight);
      this._edgeCursor.drawVertCursor(xStart - this.getScrollXPadding(), yStart - this.getScrollYPadding(), scrollableData.isTop, scrollableData.isBottom);
    }
  };

  var _QuestScreen__startQuestEvent = QuestScreen._startQuestEvent;
  QuestScreen._startQuestEvent = function() {
    var entry = this.getCurrentQuestEntry();
    if (entry.directory.isDirectory) {
      this._changeExpandQuests();
    } else {
      _QuestScreen__startQuestEvent.apply(this, arguments);
    }
  };

  QuestScreen._changeExpandQuests = function() {
    var directoryEntry = this.getCurrentQuestEntry();
    var directoryIndex = this._questListWindow.getQuestListIndex();
    var key =  directoryEntry.name;
    var that = this;
    directoryEntry.directory.isExpand = !directoryEntry.directory.isExpand;
    if (directoryEntry.directory.isExpand) {
      var insertedIndex = directoryIndex + 1;
      this._groupingQuests[key].forEach(function(quest){
        var entry = StructureBuilder.buildListEntry();
        entry.isAvailable = quest.isQuestAvailable();
        entry.isVisible = entry.isAvailable || !quest.isPrivateQuest();
        entry.isUnderDirectory = true;
        if (entry.isVisible) {
          entry.name = quest.getName();
        } else {
          entry.name = StringTable.HideData_Question;
        }
        entry.data = quest;
        that._questEntryArray.splice(insertedIndex, 0, entry);
        insertedIndex++;
      });
    } else {
      var closedQuests = this._groupingQuests[key].filter(function(quest){
        return quest.isQuestDisplayable();
      });
      var deletedFrontIndex = directoryIndex + 1;
      this._questEntryArray.splice(deletedFrontIndex, closedQuests.length);
    }

    this._questListWindow.setQuestEntryArray(this._questEntryArray);
    this._questDetailWindow.setQuestData(this._questEntryArray[directoryIndex].data);
  };

  var _QuestScreen_drawScreenBottomText = QuestScreen.drawScreenBottomText;
  QuestScreen.drawScreenBottomText = function(textui) {
    var entry = this.getCurrentQuestEntry();
    if (entry.directory.isDirectory) {
      TextRenderer.drawScreenBottomText('', textui);
    } else {
      _QuestScreen_drawScreenBottomText.apply(this, arguments);
    }
  };

  var _QuestDetailWindow_setQuestData = QuestDetailWindow.setQuestData;
  QuestDetailWindow.setQuestData = function(quest) {
    if (!quest) {
      this._quest = null;
      this._picCache = null;
      this._groupArray = [];
    } else {
      _QuestDetailWindow_setQuestData.apply(this, arguments);
    }
  };

  QuestDetailWindow.drawWindowContent = function(x, y) {
    var isPrivate = false;
    
    if (this._quest === null) {
      // クエスト情報そのものが存在しない場合はunknownが表示されるが、何も表示しないように変更
      // このif文は元々は異常なクエストデータに対してエラーをはかないように処置したものであると考えられる。
      // したがって、この仕様変更は正しくデータが設定されている作品には影響が無いと思われる。
      return;
    }
    else if (!this._quest.isQuestAvailable()) {
      isPrivate = this._quest.isPrivateQuest();
    }
    
    if (isPrivate) {
      this._drawEmptyMap(x, y);
      this._drawEmptySentence(x, y);
    }
    else {
      this._drawThumbnailMap(x, y);
      this._drawSentenceZone(x, y);
    }
  };
})();
/*--------------------------------------------------------------------------
　拠点クエスト一覧を階層化する ver 1.2

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

注意:
仕様上、"RootDirectory"というグループ名だけは設定できません。

■更新履歴
ver 1.2 2023/11/01
ポリフィルの漏れを修正

ver 1.1 2023/02/13
ポリフィルの漏れを修正

ver 1.0 2023/02/13
公開

■対応バージョン
SRPG Studio Version:1.287

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。
・クレジット明記無し　OK (明記する場合は"キュウブ"でお願いします)
・再配布、転載　OK (バグなどがあったらプルリクエストお願いします)
・SRPG Studio利用規約は遵守してください。

--------------------------------------------------------------------------*/

(function () {
  var ROOT_DIRECTORY_NAME = "RootDirectory";

  var _StructureBuilder_buildListEntry = StructureBuilder.buildListEntry;
  StructureBuilder.buildListEntry = function () {
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
  QuestScreen._prepareScreenMemberData = function (screenParam) {
    _QuestScreen__prepareScreenMemberData.apply(this, arguments);
    this._groupingQuests = [];
  };

  QuestScreen._getQuestArray = function () {
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
      if (typeof quest.custom.directory !== "object") {
        directoryName = ROOT_DIRECTORY_NAME;
      } else {
        directoryName = quest.custom.directory.name;
      }
      if (!Array.isArray(this._groupingQuests[directoryName])) {
        this._groupingQuests[directoryName] = [];
      }
      this._groupingQuests[directoryName].push(quest);
    }

    var groupingQuestkeys = Object.keys(this._groupingQuests).map(function (key) {
      return key;
    });

    groupingQuestkeys.forEach(function (key) {
      if (key === ROOT_DIRECTORY_NAME) {
        that._groupingQuests[key].forEach(function (quest) {
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
  QuestListScrollbar.drawScrollContent = function (x, y, object, isSelect, index) {
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

  QuestListScrollbar.drawScrollbar = function (xStart, yStart) {
    var i, j, x, y, isSelect, scrollableData, underDirectoryCorrection;
    var isLast = false;
    var objectCount = this.getObjectCount();
    var width = this._objectWidth + this.getSpaceX();
    var height = this._objectHeight + this.getSpaceY();
    var index = this._yScroll * this._col + this._xScroll;

    xStart += this.getScrollXPadding();
    yStart += this.getScrollYPadding();

    this.xRendering = xStart;
    this.yRendering = yStart;
    MouseControl.saveRenderingPos(this);

    for (i = 0; i < this._rowCount; i++) {
      y = yStart + i * height;
      underDirectoryCorrection = this._objectArray[index].isUnderDirectory ? 12 : 0;
      this.drawDescriptionLine(xStart + underDirectoryCorrection, y);

      for (j = 0; j < this._col; j++) {
        x = xStart + j * width;

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
      this._edgeCursor.drawHorzCursor(
        xStart - this.getScrollXPadding(),
        yStart - this.getScrollYPadding(),
        scrollableData.isLeft,
        scrollableData.isRight
      );
      this._edgeCursor.drawVertCursor(
        xStart - this.getScrollXPadding(),
        yStart - this.getScrollYPadding(),
        scrollableData.isTop,
        scrollableData.isBottom
      );
    }
  };

  var _QuestScreen__startQuestEvent = QuestScreen._startQuestEvent;
  QuestScreen._startQuestEvent = function () {
    var entry = this.getCurrentQuestEntry();
    if (entry.directory.isDirectory) {
      this._changeExpandQuests();
    } else {
      _QuestScreen__startQuestEvent.apply(this, arguments);
    }
  };

  QuestScreen._changeExpandQuests = function () {
    var directoryEntry = this.getCurrentQuestEntry();
    var directoryIndex = this._questListWindow.getQuestListIndex();
    var key = directoryEntry.name;
    var that = this;
    directoryEntry.directory.isExpand = !directoryEntry.directory.isExpand;
    if (directoryEntry.directory.isExpand) {
      var insertedIndex = directoryIndex + 1;
      this._groupingQuests[key].forEach(function (quest) {
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
      var closedQuests = this._groupingQuests[key].filter(function (quest) {
        return quest.isQuestDisplayable();
      });
      var deletedFrontIndex = directoryIndex + 1;
      this._questEntryArray.splice(deletedFrontIndex, closedQuests.length);
    }

    this._questListWindow.setQuestEntryArray(this._questEntryArray);
    this._questDetailWindow.setQuestData(this._questEntryArray[directoryIndex].data);
  };

  var _QuestScreen_drawScreenBottomText = QuestScreen.drawScreenBottomText;
  QuestScreen.drawScreenBottomText = function (textui) {
    var entry = this.getCurrentQuestEntry();
    if (entry.directory.isDirectory) {
      TextRenderer.drawScreenBottomText("", textui);
    } else {
      _QuestScreen_drawScreenBottomText.apply(this, arguments);
    }
  };

  var _QuestDetailWindow_setQuestData = QuestDetailWindow.setQuestData;
  QuestDetailWindow.setQuestData = function (quest) {
    if (!quest) {
      this._quest = null;
      this._picCache = null;
      this._groupArray = [];
    } else {
      _QuestDetailWindow_setQuestData.apply(this, arguments);
    }
  };

  QuestDetailWindow.drawWindowContent = function (x, y) {
    var isPrivate = false;

    if (this._quest === null) {
      // クエスト情報そのものが存在しない場合はunknownが表示されるが、何も表示しないように変更
      // このif文は元々は異常なクエストデータに対してエラーをはかないように処置したものであると考えられる。
      // したがって、この仕様変更は正しくデータが設定されている作品には影響が無いと思われる。
      return;
    } else if (!this._quest.isQuestAvailable()) {
      isPrivate = this._quest.isPrivateQuest();
    }

    if (isPrivate) {
      this._drawEmptyMap(x, y);
      this._drawEmptySentence(x, y);
    } else {
      this._drawThumbnailMap(x, y);
      this._drawSentenceZone(x, y);
    }
  };
})();

// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
if (!Array.prototype["forEach"]) {
  Array.prototype.forEach = function (callback, thisArg) {
    if (this == null) {
      throw new TypeError("Array.prototype.forEach called on null or undefined");
    }

    var T, k;
    // 1. Let O be the result of calling toObject() passing the
    // |this| value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get() internal
    // method of O with the argument "length".
    // 3. Let len be toUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If isCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== "function") {
      throw new TypeError(callback + " is not a function");
    }

    // 5. If thisArg was supplied, let T be thisArg; else let
    // T be undefined.
    if (arguments.length > 1) {
      T = thisArg;
    }

    // 6. Let k be 0
    k = 0;

    // 7. Repeat, while k < len
    while (k < len) {
      var kValue;

      // a. Let Pk be ToString(k).
      //    This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty
      //    internal method of O with argument Pk.
      //    This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {
        // i. Let kValue be the result of calling the Get internal
        // method of O with argument Pk.
        kValue = O[k];

        // ii. Call the Call internal method of callback with T as
        // the this value and argument list containing kValue, k, and O.
        callback.call(T, kValue, k, O);
      }
      // d. Increase k by 1.
      k++;
    }
    // 8. return undefined
  };
}

// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.io/#x15.4.4.19
if (!Array.prototype.map) {
  Array.prototype.map = function (callback /*, thisArg*/) {
    var T, A, k;

    if (this == null) {
      throw new TypeError("this is null or not defined");
    }

    // 1. Let O be the result of calling ToObject passing the |this|
    //    value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal
    //    method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== "function") {
      throw new TypeError(callback + " is not a function");
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (arguments.length > 1) {
      T = arguments[1];
    }

    // 6. Let A be a new array created as if by the expression new Array(len)
    //    where Array is the standard built-in constructor with that name and
    //    len is the value of len.
    A = new Array(len);

    // 7. Let k be 0
    k = 0;

    // 8. Repeat, while k < len
    while (k < len) {
      var kValue, mappedValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal
      //    method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {
        // i. Let kValue be the result of calling the Get internal
        //    method of O with argument Pk.
        kValue = O[k];

        // ii. Let mappedValue be the result of calling the Call internal
        //     method of callback with T as the this value and argument
        //     list containing kValue, k, and O.
        mappedValue = callback.call(T, kValue, k, O);

        // iii. Call the DefineOwnProperty internal method of A with arguments
        // Pk, Property Descriptor
        // { Value: mappedValue,
        //   Writable: true,
        //   Enumerable: true,
        //   Configurable: true },
        // and false.

        // In browsers that support Object.defineProperty, use the following:
        // Object.defineProperty(A, k, {
        //   value: mappedValue,
        //   writable: true,
        //   enumerable: true,
        //   configurable: true
        // });

        // For best browser support, use the following:
        A[k] = mappedValue;
      }
      // d. Increase k by 1.
      k++;
    }

    // 9. return A
    return A;
  };
}

if (!Array.isArray) {
  Array.isArray = function (arg) {
    return Object.prototype.toString.call(arg) === "[object Array]";
  };
}

// Array.filter poliyfill
// Reference:  https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/filter#polyfill
if (!Array.prototype.filter) {
  Array.prototype.filter = function (func, thisArg) {
    "use strict";
    if (!((typeof func === "Function" || typeof func === "function") && this)) throw new TypeError();

    var len = this.length >>> 0,
      res = new Array(len), // preallocate array
      t = this,
      c = 0,
      i = -1;

    var kValue;
    if (thisArg === undefined) {
      while (++i !== len) {
        // checks to see if the key was set
        if (i in this) {
          kValue = t[i]; // in case t is changed in callback
          if (func(t[i], i, t)) {
            res[c++] = kValue;
          }
        }
      }
    } else {
      while (++i !== len) {
        // checks to see if the key was set
        if (i in this) {
          kValue = t[i];
          if (func.call(thisArg, t[i], i, t)) {
            res[c++] = kValue;
          }
        }
      }
    }

    res.length = c; // shrink down array to proper size
    return res;
  };
}

// Object.keys poliyfil
// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
  Object.keys = (function () {
    var hasOwnProperty = Object.prototype.hasOwnProperty,
      hasDontEnumBug = !{ toString: null }.propertyIsEnumerable("toString"),
      dontEnums = [
        "toString",
        "toLocaleString",
        "valueOf",
        "hasOwnProperty",
        "isPrototypeOf",
        "propertyIsEnumerable",
        "constructor"
      ],
      dontEnumsLength = dontEnums.length;

    return function (obj) {
      if (typeof obj !== "function" && (typeof obj !== "object" || obj === null)) {
        throw new TypeError("Object.keys called on non-object");
        return;
      }

      var result = [],
        prop,
        i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  })();
}

// Object.entries poliyfil
// From https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Object/entries#polyfill
if (!Object.entries) {
  Object.entries = function (obj) {
    var ownProps = Object.keys(obj),
      i = ownProps.length,
      resArray = new Array(i); // preallocate the Array
    while (i--) resArray[i] = [ownProps[i], obj[ownProps[i]]];

    return resArray;
  };
}

/*--------------------------------------------------------------------------
　セーブした日時を表示する ver 1.0

■作成者
キュウブ

■概要
セーブデータにセーブした日時が表示されるようになります。

・"ロード/セーブ画面でサムネイルを表示する"が有効でなければこの機能は動作しません
・スペースの都合上、ターン数とプレイ時間が左の枠には表示されなくなります。
※ これらは右枠のサムネイルには表示されるので情報が欠落するわけではありません
・同じくスペースの都合上、"拠点"の文字列は"第X章"の右隣に表示されるようになります。

また、このプラグインを導入していない状態でセーブされたデータに関しては、
UTCで1970年1月1日0時0分0秒(JSTなら9時)と表示されます。

■更新履歴
ver 1.0 2024/08/25
公開

■対応バージョン
SRPG Studio Version:1.300

(C)2024 キュウブ
Released under the MIT license
https://opensource.org/licenses/mit-license.php

--------------------------------------------------------------------------*/

(function () {
  LoadSaveScrollbarEx._drawMain = function (x, y, object, index) {
    this._drawChapterNumber(x, y, object);
    this._drawChapterName(x, y, object);
    this._drawSaveDate(x, y, object);
    this._drawDifficulty(x, y, object);
  };

  LoadSaveScrollbarEx._drawChapterNumber = function (xBase, yBase, object) {
    var text;
    var textui = this._getWindowTextUI();
    var color = textui.getColor();
    var font = textui.getFont();
    var x = xBase;
    var y = yBase;

    if (object.isCompleteFile()) {
      text = StringTable.Chapter_Rest;
    } else {
      text = ChapterRenderer.getChapterText(object.getMapInfo());
      if (object.getSceneType() === SceneType.REST) {
        text += StringTable.LoadSave_Rest;
      }
    }
    TextRenderer.drawKeywordText(x, y, text, -1, color, font);
  };

  LoadSaveScrollbarEx._drawSaveDate = function (xBase, yBase, object) {
    var textui = this._getWindowTextUI();
    var font = textui.getFont();
    var x = xBase;
    var y = yBase + 25;
    var numberWidth = 9;
    var saveDate;
    if (!object.custom.saveDate) {
      var defaultDate = new Date(0);
      saveDate = {
        year: defaultDate.getFullYear(),
        month: defaultDate.getMonth() + 1,
        date: defaultDate.getDate(),
        hours: defaultDate.getHours(),
        minutes: defaultDate.getMinutes(),
        seconds: defaultDate.getSeconds()
      };
    } else {
      saveDate = object.custom.saveDate;
    }

    NumberRenderer.drawRightNumber(x, y, saveDate.year);
    x += numberWidth * 4;
    TextRenderer.drawKeywordText(x, y, "/", -1, ColorValue.DEFAULT, font);
    x += 8;
    this._drawZeroPaddingNumber(x, y, saveDate.month);
    x += numberWidth * 2;
    TextRenderer.drawKeywordText(x, y, "/", -1, ColorValue.DEFAULT, font);
    x += 8;
    this._drawZeroPaddingNumber(x, y, saveDate.date);
    x += numberWidth * 2 + 8;
    this._drawZeroPaddingNumber(x, y, saveDate.hours);
    x += numberWidth * 2;
    TextRenderer.drawKeywordText(x, y, ":", -1, ColorValue.DEFAULT, font);
    x += 8;
    this._drawZeroPaddingNumber(x, y, saveDate.minutes);
    x += numberWidth * 2;
    TextRenderer.drawKeywordText(x, y, ":", -1, ColorValue.DEFAULT, font);
    x += 8;
    this._drawZeroPaddingNumber(x, y, saveDate.seconds);
    x += numberWidth * 2;
  };

  LoadSaveScrollbarEx._drawZeroPaddingNumber = function (x, y, number) {
    if (number < 10) {
      NumberRenderer.drawRightNumber(x, y, 0);
      x += 9;
    }
    NumberRenderer.drawRightNumber(x, y, number);
  };

  var _LoadSaveScreen__getCustomObject = LoadSaveScreen._getCustomObject;
  LoadSaveScreen._getCustomObject = function () {
    var customObject = _LoadSaveScreen__getCustomObject.apply(this, arguments);
    var nowDate = new Date();
    customObject.saveDate = {
      year: nowDate.getFullYear(),
      month: nowDate.getMonth() + 1,
      date: nowDate.getDate(),
      hours: nowDate.getHours(),
      minutes: nowDate.getMinutes(),
      seconds: nowDate.getSeconds()
    };
    return customObject;
  };
})();

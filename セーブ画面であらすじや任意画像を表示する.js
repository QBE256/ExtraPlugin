/*--------------------------------------------------------------------------
　セーブ画面にあらすじや一枚絵を表示する ver 1.0

■作成者
キュウブ

■概要
セーブ画面を以下のように変更します
・サムネイルを任意の画像に差し替える事ができる
・サムネイルの上にあらすじなどの任意のテキストを表記できるようになる

■使い方
1.サムネイルの変更方法
対象マップで以下のカスタムパラメータを入力します。
※ ScreenBackに登録されている画像が対象となります。
saveWindowImage: {
	id: <対象画像のリソースID>,
	isRuntime: <ランタイム画像であればtrue, オリジナルであればfalse>,
	alpha: <透明度。最大255で0に近づける程透明化される。>
}

2.あらすじ(任意テキスト)の設定方法
対象マップで以下のようなカスタムパラメータを入力します。
※ 配列なので、"<最後の行のテキスト>"の後ろにはカンマ「,」をつけないように注意してください

saveWindowSummaries: [
  "<1行目のテキスト>",
  "<2行目のテキスト>",
  "<3行目のテキスト>",
  ...
  "<最後の行のテキスト>"
]

例.
下記のように設定すると、対象マップのセーブデータでは
サムネイルがランタイムの古文書の画像(透明度100)になり、
下記のような2行に渡るテキストが表示されるようになります。
```
ナッシュはランバートとルーシーと共に旅に出た。
旅の先ではマスターが待ち受けていた。
```
{
  saveWindowImage: {
	  id: 30,
	  isRuntime: true,
	  alpha: 100
  },
  saveWindowSummaries: [
    "ナッシュはランバートとルーシーと共に旅に出た。",
    "旅の先ではマスターが待ち受けていた。"
  ]
}

■更新履歴
ver 1.0 2024/08/27
公開

■対応バージョン
SRPG Studio Version:1.300

(C)2024 キュウブ
Released under the MIT license
https://opensource.org/licenses/mit-license.php

--------------------------------------------------------------------------*/

(function () {
  var _SaveFileDetailWindow__drawThumbnailMap = SaveFileDetailWindow._drawThumbnailMap;
  SaveFileDetailWindow._drawThumbnailMap = function (x, y) {
    var mapData = this._saveFileInfo.getMapInfo();
    if (typeof mapData.custom.saveWindowImage === "object") {
      var resourceList = root
        .getBaseData()
        .getGraphicsResourceList(GraphicsType.SCREENBACK, mapData.custom.saveWindowImage.isRuntime);
      var image = resourceList.getCollectionDataFromId(mapData.custom.saveWindowImage.id, 0);
      var width = this.getWindowWidth() - DefineControl.getWindowXPadding() * 2;
      var height = this.getWindowHeight() - DefineControl.getWindowYPadding() * 2;
      var cacheWidth = image.getWidth();
      var cacheHeight = image.getHeight();
      if (this._picCache !== null) {
        if (this._picCache.isCacheAvailable()) {
          this._picCache.setAlpha(mapData.custom.saveWindowImage.alpha);
          this._picCache.drawStretchParts(x, y, width, height, 0, 0, cacheWidth, cacheHeight);
          return;
        }
      } else {
        this._picCache = root.getGraphicsManager().createCacheGraphics(cacheWidth, cacheHeight);
      }
      root.getGraphicsManager().setRenderCache(this._picCache);
      image.draw(0, 0);
      root.getGraphicsManager().resetRenderCache();
      this._picCache.setAlpha(mapData.custom.saveWindowImage.alpha);
      this._picCache.drawStretchParts(x, y, width, height, 0, 0, cacheWidth, cacheHeight);
    } else {
      _SaveFileDetailWindow__drawThumbnailMap.apply(this, arguments);
    }
  };

  var _SaveFileDetailWindow__configureSentence = SaveFileDetailWindow._configureSentence;
  SaveFileDetailWindow._configureSentence = function (groupArray) {
    if (typeof this._saveFileInfo.getMapInfo().custom.saveWindowSummaries !== "undefined") {
      groupArray.appendObject(LoadSaveSentence.Summary);
    }
    _SaveFileDetailWindow__configureSentence.apply(this, arguments);
  };

  LoadSaveSentence.Summary = defineObject(BaseLoadSaveSentence, {
    _saveFileInfo: null,
    _summaries: [],
    setSaveFileInfo: function (saveFileInfo) {
      this._saveFileInfo = saveFileInfo;
      this._summaries = this._saveFileInfo.getMapInfo().custom.saveWindowSummaries;
    },

    drawLoadSaveSentence: function (x, y) {
      var textui = this._getSentenceTextUI();
      var color = textui.getColor();
      var font = textui.getFont();
      var length = -1;

      x -= Math.floor(
        (this._detailWindow._width -
          (this._detailWindow.getTitlePartsCount() + 3) * TitleRenderer.getTitlePartsWidth()) /
          2
      );
      x += 24;
      y -=
        this._detailWindow._height -
        this._detailWindow._groupArray.length * this._detailWindow.getLoadSaveSentenceSpaceY() -
        60;
      y += 10;
      for (var index = 0; index < this._summaries.length; index++) {
        TextRenderer.drawKeywordText(x, y + 18, this._summaries[index], length, color, font);
        y += 24;
      }
    }
  });
})();

/*--------------------------------------------------------------------------
選択肢で題目を表示する ver 1.0

■作成者
キュウブ

■概要
このスクリプトを導入すると、選択イベントで題目を表示できるようになります。

■使い方
スクリプトの実行->コードの実行 にてコード欄に
ChoiceEventTitleControl.setTitle("<題目として表示したい文章>");
と記述します。
このスクリプトの実行コマンドの直後に選択肢コマンドを入れればOK。

例えば、
ChoiceEventTitleControl.setTitle("1 + 1 は?");
と記述すると直後の選択肢で「1 + 1 は?」という題目が表示されるようになります。

※注意点
スクリプトの実行イベントだけ実施されて、選択肢イベントが未実行であった場合、
その次の選択肢イベントで題目が表示されてしまいます。
したがって、このスクリプト実行イベントを起こした場合は直後に必ず選択イベントも発生させるようにしてください。

■更新履歴
ver 1.0 (2023/10/29)
公開 

■対応バージョン
SRPG Studio Version:1.287

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。
・クレジット明記無し OK (明記する場合は"キュウブ"でお願いします)
・バグなどがあったらプルリクで修正を受け付けてます
・SRPG Studio利用規約は遵守してください。

--------------------------------------------------------------------------*/

(function () {
  var _ChoiceShowEventCommand_drawEventCommandCycle = ChoiceShowEventCommand.drawEventCommandCycle;
  ChoiceShowEventCommand.drawEventCommandCycle = function () {
    var title = ChoiceEventTitleControl.getTitle();
    if (!!title) {
      this._drawChoiceTitle(title);
    }
    _ChoiceShowEventCommand_drawEventCommandCycle.apply(this, arguments);
  };

  ChoiceShowEventCommand._drawChoiceTitle = function (title) {
    var titleTextUI = root.queryTextUI("eventmessage_title");
    var pic = titleTextUI.getUIImage();
    var color = titleTextUI.getColor();
    var font = titleTextUI.getFont();
    var partsCount = TitleRenderer.getTitlePartsCount(title, font);
    var partsWidth = TitleRenderer.getTitlePartsWidth();
    var maxWidth = partsWidth * (partsCount + 2);
    var x = Math.floor(root.getGameAreaWidth() / 2);
    var y = LayoutControl.getCenterY(-1, this._scrollbar.getScrollbarHeight());
    x -= Math.floor(maxWidth / 2);

    TextRenderer.drawTitleText(x, y - 80, title, color, font, TextFormat.CENTER, pic);
  };

  var _ChoiceShowEventCommand_moveEventCommandCycle = ChoiceShowEventCommand.moveEventCommandCycle;
  ChoiceShowEventCommand.moveEventCommandCycle = function () {
    var moveResult = _ChoiceShowEventCommand_moveEventCommandCycle.apply(this, arguments);
    if (moveResult === MoveResult.END) {
      ChoiceEventTitleControl.reset();
    }
    return moveResult;
  };
})();

var ChoiceEventTitleControl = {
  setTitle: function (text) {
    root.getMetaSession().global.choiceTitle = text;
  },

  getTitle: function () {
    var title = root.getMetaSession().global.choiceTitle;
    return !!title ? title : "";
  },

  reset: function () {
    delete root.getMetaSession().global.choiceTitle;
  }
};

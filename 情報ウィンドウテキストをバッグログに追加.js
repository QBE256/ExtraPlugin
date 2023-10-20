/*--------------------------------------------------------------------------
情報ウィンドウのテキストをバッグログに追加する ver 1.0

■作成者
キュウブ

■概要
このスクリプトを導入すると、
情報ウィンドウのテキストがバッグログで表示されるようになります。

■使い方
ver1.286現在、スクリプトを通じてバッグログにメッセージを追加するには
誰が喋ったかユニットを指定する必要があります。
メッセージテロップのように誰も喋っていないという設定は登録できないようです。

したがって、本スクリプトにバッグログメッセージを喋った事にするダミーユニットを設定しておきます。
スクリプト下部のDUMMY_NPCの項目で
TABLE_INDEX: 対象NPCが左から数えて何番目のグループにいるか(一番左を0番目とする。1となっているグループが0となる)
UNIT_ID:対象NPCのID
FACIAL_EXPRESSION_ID: 対象NPCの表情ID
を設定します。

やり方がよくわからない場合はNPCの一番左端のグループのID0のNPCの表情と名前をいじってください。

対象NPCは
表情無し+名前無しにしておくと擬似的に誰も喋ってなさそうなバッグログが生成されます。

■更新履歴
ver 1.0 (2023/10/20)
公開 

■対応バージョン
SRPG Studio Version:1.286

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。
・クレジット明記無し OK (明記する場合は"キュウブ"でお願いします)
・バグなどがあったらプルリクで修正を受け付けてます
・SRPG Studio利用規約は遵守してください。

--------------------------------------------------------------------------*/

// 情報ウィンドウに関するメッセージをNPCが喋った事にする
// 何も表示したくない場合は、名前も表情も無いNPCユニットを登録すれば良い
var DUMMY_NPC = {
  TABLE_INDEX: 0, // 対象NPCが左から数えて何番目の項目にいるか(一番左を0番目とする)
  UNIT_ID: 0, // 対象NPCのID
  FACIAL_EXPRESSION_ID: 0 // 対象NPCの表情ID
};
(function () {
  var _InfoWindowEventCommand__completeEventCommandMemberData = InfoWindowEventCommand._completeEventCommandMemberData;
  InfoWindowEventCommand._completeEventCommandMemberData = function () {
    var enterResult = _InfoWindowEventCommand__completeEventCommandMemberData.apply(this, arguments);
    if (enterResult === EnterResult.OK) {
      var text = root.getEventCommandObject().getMessage();
      var unit = root.getBaseData().getNpcList(DUMMY_NPC.TABLE_INDEX).getDataFromId(DUMMY_NPC.UNIT_ID);
      root.appendBacklogCommand(unit, text, MessagePos.CENTER, DUMMY_NPC.FACIAL_EXPRESSION_ID);
    }
    return enterResult;
  };
})();

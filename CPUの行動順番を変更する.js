/*
 CPUの行動順番を変更する ver1.0

 ■作成者
キュウブ

■概要
CPUは基本的にユニットリストの上から順に行動する仕組みになっています。
例えば、どうやっても援軍は初期配置の敵よりも先に行動する事はできません。
このスクリプトを導入すると、
CPUに行動優先度を付与する事が可能となり、
優先度の高いCPUから行動するようになります。

■使い方
対象ユニットに以下のカスタムパラメータを付与します。
orderPriority:<優先度>

※優先度の高いユニットから行動するようになります
※カスタムパラメータが付与されてないユニットは優先度0として扱われます

例えば、
orderPriority:1
と付与した援軍ユニットは優先度を付与していない他のCPUよりも先に行動するようになります。

逆に初期配置の敵に
orderPriority:-1
と付与すると、優先度を付与してないCPUが全員行動した後に手番が回ってくるようになります。

■更新履歴
ver1.0 2022/07/16
初版

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
*/

(function () {
  var _EnemyTurn__getActorList = EnemyTurn._getActorList;
  EnemyTurn._getActorList = function () {
    var actorList = _EnemyTurn__getActorList.apply(this, arguments);
    var originalActorOrder = actorList.getDataArray();
    var sortedActorOrder = originalActorOrder.sort(function (preActor, nextActor) {
      var prePriority =
        typeof preActor.custom.orderPriority === "number" ? preActor.custom.orderPriority : 0;
      var nextPriority =
        typeof nextActor.custom.orderPriority === "number" ? nextActor.custom.orderPriority : 0;
      if (prePriority > nextPriority) {
        return -1;
      } else if (prePriority < nextPriority) {
        return 1;
      }
      return 0;
    });
    actorList.setDataArray(sortedActorOrder);

    return actorList;
  };

  var _StructureBuilder_buildDataList = StructureBuilder.buildDataList;
  StructureBuilder.buildDataList = function () {
    var buildDataList = _StructureBuilder_buildDataList.apply(this, arguments);
    buildDataList.getDataArray = function () {
      return this._arr;
    };
    return buildDataList;
  };
})();

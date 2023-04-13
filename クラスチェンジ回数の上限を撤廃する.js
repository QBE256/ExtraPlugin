/*--------------------------------------------------------------------------
　アイテムによるクラスチェンジ回数の上限を撤廃する

■作成者
キュウブ

■概要
カスタムパラメータで
{isUnLimitClassChangeCount:true}
と設定したクラスチェンジアイテムではクラスチェンジ回数の上限がなくなる

■更新履歴
ver 1.0 2023/04/13
公開

■対応バージョン
SRPG Studio Version:1.161

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。
・クレジット明記無し　OK (明記する場合は"キュウブ"でお願いします)
・再配布、転載　NG
・SRPG Studio利用規約は遵守してください。

--------------------------------------------------------------------------*/

(function () {
  ClassChangeSelectManager._checkGroup = function (unit, item) {
    var i, count, classGroupId, classUpCount, classUpMaxCount;
    var group = null;
    var info = item.getClassChangeInfo();

    if (DataConfig.isBattleSetupClassChangeAllowed()) {
      // SceneType.BATTLESETUPでのクラスチェンジが可能な場合は、クラスグループ2を使用
      classGroupId = unit.getClassGroupId2();
      classUpMaxCount = 1;
    } else {
      if (this._unit.getClassUpCount() === 0) {
        // 一度もクラスチェンジしていない場合は、クラスグループ1を使用
        classGroupId = this._unit.getClassGroupId1();
      } else {
        // クラスチェンジしたことがある場合は、クラスグループ2を使用
        classGroupId = this._unit.getClassGroupId2();
      }
      classUpMaxCount = 2;
    }

    // idが-1の場合、このユニットはCCできないことを意味する
    if (classGroupId === -1) {
      this._infoWindow.setInfoMessage(
        StringTable.ClassChange_UnableClassChange
      );
      this.changeCycleMode(ClassChangeSelectMode.MSG);
      return null;
    }

    // ユニットのgroupIdが含まれているかどうかを調べる
    count = info.getClassGroupCount();
    for (i = 0; i < count; i++) {
      group = info.getClassGroupData(i);
      if (group.getId() === classGroupId) {
        break;
      }
    }

    // groupIdが含まれていなかったということは、unitはitemでCCできないことを意味する
    if (i === count) {
      this._infoWindow.setInfoMessage(
        StringTable.ClassChange_UnableClassChangeItem
      );
      this.changeCycleMode(ClassChangeSelectMode.MSG);
      return null;
    }

    classUpCount = unit.getClassUpCount();
    if (
      !!item.custom.isUnLimitClassChangeCount &&
      classUpCount >= classUpMaxCount
    ) {
      // 既にクラスチェンジしているため、これ以上のクラスチェンジはできない
      this._infoWindow.setInfoMessage(
        StringTable.ClassChange_UnableClassChangeMore
      );
      this.changeCycleMode(ClassChangeSelectMode.MSG);
      return null;
    }

    return group;
  };
})();

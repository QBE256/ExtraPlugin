/*--------------------------------------------------------------------------
　アイテムや武器の使用条件にグローバルスイッチを追加 ver 1.1

■作成者
キュウブ

■概要
グローバルスイッチがオンの時だけ使用可能になる武器、アイテムを設定できるようになります。

■使い方
武器やアイテムのカスパラに下記のような設定をすればOK
conditionGlobalSwitchId: <グローバルスイッチのID>

例えば、下記のような設定をしたアイテムや武器はID1のスイッチがオンの時のみ使用可能になる
conditionGlobalSwitchId: 1

■更新履歴
ver 1.1 2022/09/11
アイテムで使用条件が設定されないバグを修正
ver 1.0 2022/09/10

■対応バージョン
SRPG Studio Version:1.161

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。
・クレジット明記無し　OK (明記する場合は"キュウブ"でお願いします)
・再配布、転載　OK (バグなどがあったらプルリクどうぞ)
・wiki掲載　OK
・SRPG Studio利用規約は遵守してください。

--------------------------------------------------------------------------*/

(function(){
  var _ItemControl_isWeaponAvailable = ItemControl.isWeaponAvailable;
  ItemControl.isWeaponAvailable = function(unit, item) {
    var isWeaponAvailable = _ItemControl_isWeaponAvailable.apply(this, arguments);
    if (isWeaponAvailable && typeof item.custom.conditionGlobalSwitchId === 'number') {
      var globalSwitchTable = root.getMetaSession().getGlobalSwitchTable();
      var switchIndex = globalSwitchTable.getSwitchIndexFromId(item.custom.conditionGlobalSwitchId);
      return globalSwitchTable.isSwitchOn(switchIndex);
    }
    return isWeaponAvailable;
  };

  var _ItemControl_isItemUsable = ItemControl.isItemUsable;
  ItemControl.isItemUsable = function(unit, item) {
    var isItemUsable = _ItemControl_isItemUsable.apply(this, arguments);
    if (isItemUsable && typeof item.custom.conditionGlobalSwitchId === 'number') {
      var globalSwitchTable = root.getMetaSession().getGlobalSwitchTable();
      var switchIndex = globalSwitchTable.getSwitchIndexFromId(item.custom.conditionGlobalSwitchId);
      return globalSwitchTable.isSwitchOn(switchIndex);
    }
    return isItemUsable;
  };
})();
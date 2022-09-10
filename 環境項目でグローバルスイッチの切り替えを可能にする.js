/*--------------------------------------------------------------------------
　環境項目でグローバルスイッチの切り替えを可能にする ver 1.0

■作成者
キュウブ

■概要
"環境"設定で特定のグローバルスイッチの切り替えが行えるようになります。
オン/オフのみですが、任意の項目をある程度自由に作れるようになります。

※タイトル画面の環境設定では、グローバルスイッチの情報が拾えないため項目自体が表示されません

■使い方
32行目のconfigGlobalSwitchIdsに対象グローバルスイッチのIDを記入すればOK
※誤った値を入れると0番のスイッチ情報が取得されてしまいバグります

■更新履歴
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

// ここに対象のグローバルスイッチのIDを並べる
// 下記の場合は0番、1番、2番のスイッチが設定可能になる
var configGlobalSwitchIds = [0, 1, 2];

(function () {
  var _ConfigWindow__configureConfigItem = ConfigWindow._configureConfigItem;
  ConfigWindow._configureConfigItem = function (groupArray) {
    _ConfigWindow__configureConfigItem.apply(this, arguments);
    var globalSwitchTable = root.getMetaSession().getGlobalSwitchTable();
    if (globalSwitchTable) {
      for (var index = 0; index < configGlobalSwitchIds.length; index++) {
        groupArray.appendObject(ConfigItem.ChangeGlobalSwitch);
        this._commandArray[this._commandArray.length - 1].setupSwitchId(index);
      }
    }
  };

  ConfigItem.ChangeGlobalSwitch = defineObject(BaseConfigtItem, {
    _switchId: 0,

    setupSwitchId: function (index) {
      this._switchId = configGlobalSwitchIds[index];
    },

    _getGlobalSwitchTable: function () {
      return root.getMetaSession().getGlobalSwitchTable();
    },

    selectFlag: function (flagIndex) {
      var flag = flagIndex === 0;
      var globalSwitchTable = this._getGlobalSwitchTable();
      var switchIndex = globalSwitchTable.getSwitchIndexFromId(this._switchId);
      globalSwitchTable.setSwitch(switchIndex, flag);
    },

    getFlagValue: function () {
      var globalSwitchTable = this._getGlobalSwitchTable();
      var switchIndex = globalSwitchTable.getSwitchIndexFromId(this._switchId);
      var isSwitchOn = globalSwitchTable.isSwitchOn(switchIndex);
      return isSwitchOn ? 0 : 1;
    },

    getConfigItemTitle: function () {
      var globalSwitchTable = this._getGlobalSwitchTable();
      var switchIndex = globalSwitchTable.getSwitchIndexFromId(this._switchId);
      return globalSwitchTable.getSwitchName(switchIndex);
    },

    getConfigItemDescription: function () {
      var globalSwitchTable = this._getGlobalSwitchTable();
      var switchIndex = globalSwitchTable.getSwitchIndexFromId(this._switchId);
      return globalSwitchTable.getSwitchDescription(switchIndex);
    }
  });
})();

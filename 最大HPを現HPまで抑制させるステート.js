/*--------------------------------------------------------------------------
　最大HPが現在HPにまで抑制されるステート ver 1.1

■作成者
キュウブ

■概要
このステートを所持していると、最大HPが常に現HPと同値になります。

言い換えると、このステートを所持している限り
戦闘後にHPを回復させる事ができなくなります。

■使い方
対象ステートの以下のカスタムパラメータを設定すればOK
isHpRestrict:true

■更新履歴
ver 1.1 2023/02/03
コードリファクタリング

ver 1.0 2023/02/03
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

(function () {
  StateControl.hasHpRestrict = function (unit) {
    var state, currentHp, maxHp;
    var list = unit.getTurnStateList();
    var count = list.getCount();
    for (var index = 0; index < count; index++) {
      state = list.getData(index).getState();
      if (!!state.custom.isHpRestrict) {
        return true;
      }
    }
    return false;
  };

  var _ParamGroup_getLastValue = ParamGroup.getLastValue;
  ParamGroup.getLastValue = function (unit, index, weapon) {
    var currentHp, enableHpRestrict;
    var lastValue = _ParamGroup_getLastValue.apply(this, arguments);
    if (index === ParamType.MHP && StateControl.hasHpRestrict(unit)) {
      currentHp = unit.getHp();
      enableHpRestrict = lastValue > currentHp && currentHp >= 1;
      if (enableHpRestrict) {
        lastValue = currentHp;
      }
    }
    return lastValue;
  };
})();
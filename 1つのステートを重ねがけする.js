/*
ステートを重ねがけできる機能 ver1.1
作成者:キュウブ

※この機能はSRPGStudioのステートの仕様の隙間を縫って作成したものなので、大変使いづらいものになっております

1つのステートを重ねがけできるようになります。
例えば、
3ターン持続 力+3 のステートを
「残り2ターン 力+2」の時でもう一度付与すると
「残り5ターン 力+5」の状態に変化します。

・設定方法
1.想定より大幅に多い持続ターン(99を推奨)、ターン減少値を設定したステート(1を推奨)を作成します。補正値をつけたい場合は一旦±99を推奨します。 
2.ステートのカスパラに overlappingTurn:<本来持続させたいターン数> を記載します。

・このスクリプトの仕組み
対象ステート付与を行った場合、
スクリプトを導入しない場合は次のような挙動になります
持続ターン数: <エディタで持続ターン数に設定した値>
補正値:     <エディタで設定した補正値>

しかし、本スクリプトを導入してカスタムパラメータを設定した場合はa,bのような挙動に変化します
a.対象ステートを新規で付与する場合
持続ターン数: <overlappingTurnの値>
補正値:     <エディタで設定した補正値> - <ターン減少値> * (<エディタで持続ターン数に設定した値> - <overlappingTurnの値>)

b.対象ステートが既に付与されていた場合
持続ターン数: <付与直前の残りターン数> + <overlappingTurnの値>
補正値:     <エディタで設定した補正値> - <ターン減少値> * (<エディタで持続ターン数に設定した値> - (<付与直前の残りターン数> + <overlappingTurnの値>))


・Example
持続3ターンで速さに-3の補正がかかるステートを作成したい場合
1.持続ターン99、ターン減少値1、速さ-99のステートを作成する
2.カスタムパラメータは{overlappingTurn:3}と記載する

このステートを付与する時、
本スクリプトを導入しない場合は
持続99ターン、速さ-99のステートが付与され、残り3ターンになった時に速さにかかる補正値が-3になります

しかし、本スクリプトを導入した場合は
いきなり残り3ターンの状態でステートが付与され、結果的に補正値も-3になります。
さらにもう一度ステートを付与すると残りターン数がoverlappingTurnの分だけ増える仕組みになっております。

■更新履歴
ver 1.1 (2024/9/15)
最新版対応

ver 1.0 (2022/2/27)
初版

■対応バージョン
SRPG Studio Version:1.301


(C)2022 キュウブ
Released under the MIT license
https://opensource.org/licenses/mit-license.php
*/

(function () {
  var _StateControl_arrangeState = StateControl.arrangeState;
  StateControl.arrangeState = function (unit, state, increaseType) {
    var turnState, currentTurn;
    var list = unit.getTurnStateList();
    var count = list.getCount();
    var editor = root.getDataEditor();

    if (increaseType === IncreaseType.INCREASE && typeof state.custom.overlappingTurn === "number") {
      turnState = this.getTurnState(unit, state);
      if (turnState !== null) {
        currentTurn = turnState.getTurn();
        turnState.setTurn(currentTurn + state.custom.overlappingTurn);
      } else {
        if (count < DataConfig.getMaxStateCount()) {
          turnState = editor.addTurnStateData(list, state);
          turnState.setTurn(state.custom.overlappingTurn);
        }
      }
      return turnState;
    } else {
      return _StateControl_arrangeState.apply(this, arguments);
    }
  };
})();

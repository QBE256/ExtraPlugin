/*--------------------------------------------------------------------------
　汎用ユニットに顔画像を自動で設定する ver 1.0

■作成者
キュウブ

■概要
このスクリプトを導入すると、
顔画像が設定されていないユニットに対して、自動で顔グラが設定されるようになります。
この設定はクラス別で指定可能です。
つまり、汎用CPUユニットに対して一つ一つ顔画像を設定する手間が省けるようになります。

■使い方
1.あらかじめ対象ユニットは顔画像を"なし"に設定しておきます
2.クラスのカスタムパラメータに以下のようなパラメータを設定し、そのクラスにおける汎用顔画像を指定します。

autoFaceHandle: {
	isRuntime: <ランタイムであればtrue,オリジナルであればfalse>,
	id: <画像ID>,
	xSrc: <左から何番目か(左端を0番目とする)>,
	ySrc: <上から何番目か(上端を0番目とする)>
}

<例1>
バンディットに対して、下記のようなカスパラを設定した場合、
顔画像が設定されてないバンディットの顔が全てランタイム画像ID0の左上にあるナッシュになります。
autoFaceHandle: {
	isRuntime: true,
	id: 0,
	xSrc: 0,
	ySrc: 0
}

<例2>
バンディットに対して、下記のようなカスパラを設定した場合、
顔画像が設定されてないバンディットの顔が全てランタイム画像ID30の竜の紋章になります。
autoFaceHandle: {
	isRuntime: true,
	id: 30,
	xSrc: 2,
	ySrc: 3
}

■更新履歴
ver 1.0 (2023/10/13)
公開 

■対応バージョン
SRPG Studio Version:1.286

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。
・クレジット明記無し　OK (明記する場合は"キュウブ"でお願いします)
・バグなどがあったらプルリクで修正を受け付けてます
・wiki掲載　OK
・SRPG Studio利用規約は遵守してください。

--------------------------------------------------------------------------*/

(function () {
  var _UnitProvider_setupFirstUnit = UnitProvider.setupFirstUnit;
  UnitProvider.setupFirstUnit = function (unit) {
    _UnitProvider_setupFirstUnit.apply(this, arguments);

    var currentFaceHandle = unit.getFaceResourceHandle();
    var unitClass = unit.getClass();
    var autoFaceHandle = unitClass.custom.autoFaceHandle;
    if (currentFaceHandle.isNullHandle() && typeof autoFaceHandle === "object") {
      var autoFaceHandle = root.createResourceHandle(
        autoFaceHandle.isRuntime,
        autoFaceHandle.id,
        0,
        autoFaceHandle.xSrc,
        autoFaceHandle.ySrc
      );
      if (!!autoFaceHandle && !autoFaceHandle.isNullHandle()) {
        unit.setFaceResourceHandle(autoFaceHandle);
      }
    }
  };
})();

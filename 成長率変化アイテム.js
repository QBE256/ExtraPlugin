/*--------------------------------------------------------------------------
　成長率変化アイテム ver 1.1

■作成者
キュウブ

■概要
ドーピングアイテムで成長率を変化させる事ができるようになります。

■設定の仕方
ドーピングアイテムのカスパラに以下のようなカスパラを追加します。
growthBonusDopingArray: [
	<HPの成長率 変化値>,
	<力の成長率 変化値>,
	<魔力の成長率 変化値>,
	<技の成長率 変化値>,
	<速さの成長率 変化値>,
	<幸運の成長率 変化値>,
	<守備力の成長率 変化値>,
	<魔防力の成長率 変化値>,
	<移動力の成長率 変化値>,
	<熟練度の成長率 変化値>,
	<体格の成長率 変化値>
]

※ ドーピングアイテム使用時の成長ウィンドウを表示させたくない場合は別途カスパラにisEraseWindow:trueを追加する事で対処可能です。

例1:移動力、熟練度、体格以外の成長率を5%ずつ伸ばし、成長ウィンドウは表示させない
{
	growthBonusDopingArray: [
		5,
		5,
		5,
		5,
		5,
		5,
		5,
		5,
		0,
		0,
		0
	],
	isEraseWindow:true
}

[]の中を11つも記載するのが面倒な場合は、
下記のように8つ(魔防力の成長率 変化値の分)まで記載する事でも実現可能。
この書き方でも9つ目以降の成長率(移動力,熟練度,体格)は変化しない。
{
	growthBonusDopingArray: [
		5,
		5,
		5,
		5,
		5,
		5,
		5,
		5
	],
	isEraseWindow:true
}

例2:移動力を50%上昇させて成長ウィンドウは表示させない
{
	growthBonusDopingArray: [
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		50,
		0,
		0
	],
	isEraseWindow:true
}

例1と同じく、熟練度以降の成長率を記載する事が面倒な場合は下記の書き方でも可(移動力より前の要素は0と記載しないと駄目)
{
	growthBonusDopingArray: [
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		0,
		50
	],
	isEraseWindow:true
};

■更新履歴
ver 1.1 (2024/09/07)
素のドーピング設定や取得経験値が0のままだと使用不可になる仕様に対処

ver 1.0 (2021/02/08)
初版公開

■対応バージョン
SRPG Studio Version:1.301

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。
・クレジット明記無し　OK (明記する場合は"キュウブ"でお願いします)
・再配布、転載　OK (バグなどがあったら修正できる方はご自身で修正版を配布してもらっても構いません)
・wiki掲載　OK
・SRPG Studio利用規約は遵守してください。
--------------------------------------------------------------------------*/

(function () {
  var temp1 = DopingItemUse.mainAction;
  DopingItemUse.mainAction = function () {
    var growthBonus, count;
    var itemTargetInfo = this._itemUseParent.getItemTargetInfo();
    var item = itemTargetInfo.item;
    var unit = itemTargetInfo.targetUnit;

    temp1.call(this);
    if (typeof item.custom.growthBonusDopingArray === "object") {
      count = ParamGroup.getParameterCount();
      count = item.custom.growthBonusDopingArray.length < count ? item.custom.growthBonusDopingArray.length : count;
      growthBonus = unit.getGrowthBonus();
      for (var index = 0; index < count; index++) {
        if (typeof item.custom.growthBonusDopingArray[index] !== "number") {
          root.log("成長変化アイテム[警告]:" + index + "番目の値が数値ではありません");
          continue;
        }
        growthBonus.setAssistValue(
          index,
          growthBonus.getAssistValue(index) + item.custom.growthBonusDopingArray[index]
        );
      }
    }
  };

  var temp2 = DopingItemUse.moveMainUseCycle;
  DopingItemUse.moveMainUseCycle = function () {
    if (this._itemUseParent.getItemTargetInfo().item.custom.isEraseWindow === true) {
      this.mainAction();
      return MoveResult.END;
    }
    return temp2.call(this);
  };

  var temp3 = DopingItemControl.isItemAllowed;
  DopingItemControl.isItemAllowed = function (targetUnit, item) {
    var isItemAllowed = temp3.call(this, targetUnit, item);
    if (isItemAllowed || typeof item.custom.growthBonusDopingArray !== "object") {
      return isItemAllowed;
    }
    for (var index = 0; index < item.custom.growthBonusDopingArray.length; index++) {
      if (item.custom.growthBonusDopingArray[index] !== 0) {
        return true;
      }
    }
    return false;
  };
})();

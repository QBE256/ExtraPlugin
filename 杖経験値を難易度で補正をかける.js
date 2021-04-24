/*--------------------------------------------------------------------------
　杖から得られる経験値に難易度別で補正をかける ver 1.0

■作成者
キュウブ

■概要
難易度のカスパラにwandCorrection:<値>と入れると
その値の分だけ杖の取得経験値に補正がかかります。
例えば0.5にした場合は得られる経験値が半分になります。

■更新履歴
ver 1.0 (2021/04/25)
初版公開

■対応バージョン
SRPG Studio Version:1.161

■規約
Copyright (c) 2021 キュウブ
This software is released under the MIT License.
http://opensource.org/licenses/mit-license.php

--------------------------------------------------------------------------*/
(function(){
	var _ItemExpFlowEntry__getItemExperience = ItemExpFlowEntry._getItemExperience;
	ItemExpFlowEntry._getItemExperience = function(itemUseParent) {
		var itemTargetInfo = itemUseParent.getItemTargetInfo();
		var difficultlyCorrection = 1;
		var difficult;
	
		if (itemTargetInfo.item.isWand()) {
			difficult = root.getMetaSession().getDifficulty();
			if (typeof difficult.custom.wandCorrection === 'number') {
				difficultlyCorrection = difficult.custom.wandCorrection;
			}
		}
		return Math.floor(_ItemExpFlowEntry__getItemExperience.call(this, itemUseParent) * difficultlyCorrection);
	};
})();
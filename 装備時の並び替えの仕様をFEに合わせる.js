/*--------------------------------------------------------------------------
　装備時の並び替えの仕様をFEに合わせる ver 1.0

■作成者
キュウブ

■概要
SRPG Studioの装備コマンドは
下記の例ように元々装備した武器とこれから装備する武器の位置が入れ替わる仕様となっている。
------------------------
1.鉄の剣
2.鋼の剣
3.銀の剣
4.キルソード
でキルソードを装備した時は
1.キルソード
2.鋼の剣
3.銀の剣
4.鉄の剣
という並び順になる。
------------------------

このプラグインを導入すると、FEと同じように
装備した武器が先頭に来て他のアイテムは一つ後ろにずれるようになる。
------------------------
1.鉄の剣
2.鋼の剣
3.銀の剣
4.キルソード
でキルソードを装備した時は
1.キルソード
2.鉄の剣
3.鋼の剣
4.銀の剣
という並び順になる。
------------------------

■使い方
導入するだけ

■更新履歴
ver 1.0 (2019/10/7)

初版作成
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
--------------------------------------------------------------------------*/
ItemControl.setEquippedWeapon = function(unit, targetItem) {
	var i, j, item;
	var count = UnitItemControl.getPossessionItemCount(unit);
	var fastIndex = -1, targetIndex = -1;
		
	// unitがtargetItemの武器を装備する。
	// targetItemはアイテム欄の先頭に配置される。
		
	for (i = 0; i < count; i++) {
		item = UnitItemControl.getItem(unit, i);
		if (item !== null && fastIndex === -1) {
			// アイテム欄の中で先頭のアイテムのインデックスを保存
			fastIndex = i;
		}
			
		if (item === targetItem) {
			// 装備するアイテムのインデックスを保存
			targetIndex = i;
		}
	}
		
	if (fastIndex === -1 || targetIndex === -1) {
		return;
	}
		
	// 交換先が一致する場合は交換しない
	if (fastIndex === targetIndex) {
		return;
	}
		
	// アイテムを入れ替える
	for (j = targetIndex; j > fastIndex; j--) {
		item = UnitItemControl.getItem(unit, j - 1);
		UnitItemControl.setItem(unit, j, item);
	}
	UnitItemControl.setItem(unit, fastIndex, targetItem);

	this.updatePossessionItem(unit);
};
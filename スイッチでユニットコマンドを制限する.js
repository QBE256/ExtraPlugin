/*--------------------------------------------------------------------------
　スイッチでユニットコマンドを無効化する ver 1.0

■作成者
キュウブ

■概要
このスクリプトを導入すると指定のグローバルスイッチをオンにする事で
特定のユニットコマンドを無効化する事ができます。
チュートリアル等で待機を選ばせずに攻撃を選択させたい場合等に使用する事を想定しています。
無効化可能なユニットコマンドは以下の通りです。
・攻撃
・杖
・アイテム
・ストック
・交換
・待機
・形態変化
・形態変化解除
・フュージョン移行攻撃
・フュージョン化
・フュージョン解除
・フュージョン相手交換

※各ユニットコマンドクラスを継承したクラスで構成されたオリジナルユニットコマンドを導入している場合は、
そのコマンドも共に無効化される可能性があります。

■使い方
コードの一番最初にある
UnitCommandDisableSwitchIdsの中にフラグ管理に使用するグローバルスイッチのIDを入れといてください。
例えばATTACKの値を2とした場合、2番のグローバルスイッチがオンの時に攻撃コマンドが出現しなくなります。
スイッチを設定しないコマンドに関しては-1にしておいてください。

■更新履歴
ver 1.0 (2021/3/7)
公開 

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

// 下記の設定値のIDを持つグローバルスイッチがオンの時、コマンドが制限されるようになる
// 使用しない場合は-1を設定しておく事。0以上で存在しないグローバルスイッチIDだった場合はエラーを起こすので注意
var UnitCommandDisableSwitchIds = {
	ATTACK: -1,					// 攻撃コマンド
	WAND: -1,					// 杖コマンド
	ITEM: -1,					// アイテムコマンド
	TRADE: -1,					// 交換コマンド
	STOCK: -1,					// ストックコマンド
	WAIT: -1,					// 待機コマンド
	METAMORPHOZE: -1,			// 形態変化コマンド
	METAMORPHOZE_CANCEL: -1,	// 形態変化解除コマンド
	FUSION_ATTACK: -1,			// フュージョン化攻撃コマンド
	FUSION_CATCH: -1,			// フュージョン化コマンド
	FUSION_RELEASE: -1,			// フュージョン解除コマンド
	FUSION_UNIT_TRADE: -1		// フュージョン相手交換コマンド
};

(function(){
	var _UnitCommand_Attack_isCommandDisplayable = UnitCommand.Attack.isCommandDisplayable;
	UnitCommand.Attack.isCommandDisplayable = function() {
		return _UnitCommand_Attack_isCommandDisplayable.call(this) && !isUnitCommandDisableSwitchOn(UnitCommandDisableSwitchIds.ATTACK);
	};

	var _UnitCommand_Wand_isCommandDisplayable = UnitCommand.Wand.isCommandDisplayable;
	UnitCommand.Wand.isCommandDisplayable = function() {
		return _UnitCommand_Wand_isCommandDisplayable.call(this) && !isUnitCommandDisableSwitchOn(UnitCommandDisableSwitchIds.WAND);
	};

	var _UnitCommand_Item_isCommandDisplayable = UnitCommand.Item.isCommandDisplayable;
	UnitCommand.Item.isCommandDisplayable = function() {
		return _UnitCommand_Item_isCommandDisplayable.call(this) && !isUnitCommandDisableSwitchOn(UnitCommandDisableSwitchIds.ITEM);
	};

	var _UnitCommand_Trade_isCommandDisplayable = UnitCommand.Trade.isCommandDisplayable;
	UnitCommand.Trade.isCommandDisplayable = function() {
		return _UnitCommand_Trade_isCommandDisplayable.call(this) && !isUnitCommandDisableSwitchOn(UnitCommandDisableSwitchIds.TRADE);
	};

	var _UnitCommand_Stock_isCommandDisplayable = UnitCommand.Stock.isCommandDisplayable;
	UnitCommand.Stock.isCommandDisplayable = function() {
		return _UnitCommand_Stock_isCommandDisplayable.call(this) && !isUnitCommandDisableSwitchOn(UnitCommandDisableSwitchIds.STOCK);
	};

	var _UnitCommand_Wait_isCommandDisplayable = UnitCommand.Wait.isCommandDisplayable;
	UnitCommand.Wait.isCommandDisplayable = function() {
		return _UnitCommand_Wait_isCommandDisplayable.call(this) && !isUnitCommandDisableSwitchOn(UnitCommandDisableSwitchIds.WAIT);
	};

	var _UnitCommand_Metamorphoze_isCommandDisplayable = UnitCommand.Metamorphoze.isCommandDisplayable;
	UnitCommand.Metamorphoze.isCommandDisplayable = function() {
		return _UnitCommand_Metamorphoze_isCommandDisplayable.call(this) && !isUnitCommandDisableSwitchOn(UnitCommandDisableSwitchIds.METAMORPHOZE);
	};

	var _UnitCommand_MetamorphozeCancel_isCommandDisplayable = UnitCommand.MetamorphozeCancel.isCommandDisplayable;
	UnitCommand.MetamorphozeCancel.isCommandDisplayable = function() {
		return _UnitCommand_MetamorphozeCancel_isCommandDisplayable.call(this) && !isUnitCommandDisableSwitchOn(UnitCommandDisableSwitchIds.METAMORPHOZE_CANCEL);
	};

	var _UnitCommand_FusionAttack_isCommandDisplayable = UnitCommand.FusionAttack.isCommandDisplayable;
	UnitCommand.FusionAttack.isCommandDisplayable = function() {
		return _UnitCommand_FusionAttack_isCommandDisplayable.call(this) && !isUnitCommandDisableSwitchOn(UnitCommandDisableSwitchIds.FUSION_ATTACK);
	};

	var _UnitCommand_FusionCatch_isCommandDisplayable = UnitCommand.FusionCatch.isCommandDisplayable;
	UnitCommand.FusionCatch.isCommandDisplayable = function() {
		return _UnitCommand_FusionCatch_isCommandDisplayable.call(this) && !isUnitCommandDisableSwitchOn(UnitCommandDisableSwitchIds.FUSION_CATCH);
	};

	var _UnitCommand_FusionRelease_isCommandDisplayable = UnitCommand.FusionRelease.isCommandDisplayable;
	UnitCommand.FusionRelease.isCommandDisplayable = function() {
		return _UnitCommand_FusionRelease_isCommandDisplayable.call(this) && !isUnitCommandDisableSwitchOn(UnitCommandDisableSwitchIds.FUSION_RELEASE);
	};

	var _UnitCommand_FusionUnitTrade_isCommandDisplayable = UnitCommand.FusionUnitTrade.isCommandDisplayable;
	UnitCommand.FusionUnitTrade.isCommandDisplayable = function() {
		return _UnitCommand_FusionUnitTrade_isCommandDisplayable.call(this) && !isUnitCommandDisableSwitchOn(UnitCommandDisableSwitchIds.FUSION_UNIT_TRADE);
	};
})();

var isUnitCommandDisableSwitchOn = function (id) {
	var globalSwitchTable;

	// idが0未満だったりNumberではない場合はスイッチを参照せずにコマンド無効スイッチはオンになっていないとみなす
	if (typeof id !== 'number' || id < 0) {
		return false;
	}
	globalSwitchTable = root.getMetaSession().getGlobalSwitchTable();
	return globalSwitchTable.isSwitchOn(globalSwitchTable.getSwitchIndexFromId(id));
};
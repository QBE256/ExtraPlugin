/*--------------------------------------------------------------------------
　ロード強制表示 ver 1.0

■作成者
キュウブ

■概要
環境項目からロード表示有無の項目が消えて、
ロードコマンドがマップコマンド上で強制的に表示されるようになります(レイアウト設定で非表示にしている場合はもちろん表示されません)

※環境系の他スクリプトと競合する可能性があります。その時は ConfigWindow._configureConfigItem の中をいじって何とかしてください。

■更新履歴
ver1.0 2020/09/17
初版

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

LoadScreenLauncher.isLaunchable = function() {
	return true;
};

// オプションからロード有無の選択肢を消す
ConfigWindow._configureConfigItem = function(groupArray) {
	groupArray.appendObject(ConfigItem.MusicPlay);
	groupArray.appendObject(ConfigItem.SoundEffect);
	if (DataConfig.getVoiceCategoryName() !== '') {
		groupArray.appendObject(ConfigItem.Voice);
	}
	if (DataConfig.isMotionGraphicsEnabled()) {
		groupArray.appendObject(ConfigItem.RealBattle);
		if (DataConfig.isHighResolution()) {
			groupArray.appendObject(ConfigItem.RealBattleScaling);
		}
	}
	groupArray.appendObject(ConfigItem.AutoCursor);
	groupArray.appendObject(ConfigItem.AutoTurnEnd);
	groupArray.appendObject(ConfigItem.AutoTurnSkip);
	groupArray.appendObject(ConfigItem.EnemyMarking);
	groupArray.appendObject(ConfigItem.MapGrid);
	groupArray.appendObject(ConfigItem.UnitSpeed);
	groupArray.appendObject(ConfigItem.MessageSpeed);
	groupArray.appendObject(ConfigItem.ScrollSpeed);
	groupArray.appendObject(ConfigItem.UnitMenuStatus);
	groupArray.appendObject(ConfigItem.MapUnitHpVisible);
	groupArray.appendObject(ConfigItem.MapUnitSymbol);
	groupArray.appendObject(ConfigItem.DamagePopup);
	groupArray.appendObject(ConfigItem.SkipControl);
	groupArray.appendObject(ConfigItem.MouseOperation);
	groupArray.appendObject(ConfigItem.MouseCursorTracking);
};
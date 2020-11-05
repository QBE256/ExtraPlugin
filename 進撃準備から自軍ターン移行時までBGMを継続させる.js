// 進撃準備BGMと自軍ターンBGMが同じリソースの場合は途切れなくなる
BattleSetupScene._changeFreeScene = function() {
	var map = root.getCurrentSession().getCurrentMapInfo();
	if (root.getCurrentScene() === SceneType.BATTLESETUP) {
		if (!map.getBattleSetupMusicHandle().isEqualHandle(map.getPlayerTurnMusicHandle())) {
			MediaControl.clearMusicCache();
		}
		root.changeScene(SceneType.FREE);
	}
};
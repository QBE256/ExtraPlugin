/*
　増援を可視化する ver 1.0

■作成者
キュウブ

■概要
増援が出現するターンになると該当マスにランタイムの!アイコンが表示されるようになります。
これにより即時行動してくる増援の初見殺し感を軽減させる事ができます。

アイコンが出現する条件は以下の通りです
1.増援が出現する自軍ターンである事
2.増援の出現条件を満たしている事(特定スイッチのオン/オフなど。特殊な条件を含んでいる場合それらを満たした時点で表示されるようになります)

■使い方

■更新履歴
ver1.0 2020/4/20
new entry

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
*/

(function(){
	// アイコンを変えたい場合はこの設定をいじってください
	var REINFORCEMENT_NOTICE_ICON = {
		isRuntime: true,	//ランタイム画像ならtrue,オリジナルならfalse
		id: 0,				//画像のID
		xSrc: 0,			//左から何番目のアイコンか(左端を0番目とする)
		ySrc: 9				//上から何番目のアイコンか(上端を0番目とする)
	};

	var alias = MapLayer.drawUnitLayer;
	MapLayer._preTurnCount = 0;
	MapLayer.drawUnitLayer = function() {
		var session, turnType;
		
		session = root.getCurrentSession();
		alias.call(this);

		if (session !== null) {
			turnType = session.getTurnType();
			if (turnType === TurnType.PLAYER && this._counter.getAnimationIndex2() % 2 === 0 && session.getTurnCount() > this._preTurnCount) {
				this._drawReinforcementNotice();
			}
			else if (turnType === TurnType.ENEMY) {
				this._preTurnCount = session.getTurnCount();
			}
		}
	};

	MapLayer._drawReinforcementNotice = function() {
		var i, j, posData, posDataCount, handle, x, y;
		var mapInfo = root.getCurrentSession().getCurrentMapInfo();
		var mapInfoCount = mapInfo.getReinforcementPosCount();
		var session = root.getCurrentSession();


		for (i = 0; i < mapInfoCount; i++) {
			posData = mapInfo.getReinforcementPos(i);
			x = posData.getX() * GraphicsFormat.MAPCHIP_WIDTH - session.getScrollPixelX();
			y = posData.getY() * GraphicsFormat.MAPCHIP_HEIGHT - session.getScrollPixelY();
			
			posDataCount = posData.getReinforcementPageCount();

			for (j = 0; j < posDataCount; j++) {
				pageData = posData.getReinforcementPage(j);

				if (pageData.isRelativeTurn()) {
					turnCount = root.getCurrentSession().getRelativeTurnCount();
				}
				else {
					turnCount = root.getCurrentSession().getTurnCount();
				}

				if (pageData.getStartTurn() <= turnCount && pageData.getEndTurn() >= turnCount && pageData.getTurnType() === TurnType.PLAYER) {
					if (pageData.isCondition()) {
						handle = root.createResourceHandle(REINFORCEMENT_NOTICE_ICON.isRuntime, REINFORCEMENT_NOTICE_ICON.id, 0, REINFORCEMENT_NOTICE_ICON.xSrc, REINFORCEMENT_NOTICE_ICON.ySrc);
						if (handle.isNullHandle()) {
							continue;
						}
						GraphicsRenderer.drawImage(x, y, handle, GraphicsType.ICON);
					}
				}
			}
		}
	};

})();
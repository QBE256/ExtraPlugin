/*--------------------------------------------------------------------------
　ゆるりと進軍するAI ver 1.0

■作成者
キュウブ

■概要
CPUユニットのAIをカスタム(キーワード:'SlowlyApproach')とし、
ユニットのカスパラにslowly_move:<値>を仕込んでおくと、slowly_moveの分だけ移動するようになります。

例えば、{slowly_move:3}としておくと移動力が4以上のユニットでもあっても3マスずつ進むようになります。
ただし、攻撃可能なユニットがいた場合は4マス以上進んだ上で攻撃を行います。

■更新履歴
ver1.0 2020/06/11
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
(function(){

	var alias_1 = AutoActionBuilder.buildCustomAction;
	AutoActionBuilder.buildCustomAction = function(unit, autoActionArray, keyword) {

		if (keyword === 'SlowlyApproach') {
			return this._buildSlowlyApproachAction(unit, autoActionArray);
		} 
		else {
			return alias_1.call(this, unit, autoActionArray, keyword);
		}
	};

	AutoActionBuilder._buildSlowlyApproachAction = function(unit, autoActionArray) {
		var combination;
		
		// 現在位置から攻撃可能なユニットの中で、最も優れた組み合わせを取得する
		combination = CombinationManager.getApproachCombination(unit, true);
		if (combination === null) {
			// 現在位置では攻撃可能な相手がいないため、どの敵を狙うべきかを取得する
			combination = CombinationManager.getSlowlyMoveCombination(unit);
			if (combination === null) {
				return this._buildEmptyAction();
			}
			else {
				// 移動先を設定する
				this._pushMove(unit, autoActionArray, combination);
					
				// 移動の後には待機を行うため、それを設定する
				this._pushWait(unit, autoActionArray, combination);
			}
		}
		else {
			this._pushGeneral(unit, autoActionArray, combination);
		}
		
		return true;
	};

	CombinationManager.getSlowlyMoveCombination = function(unit) {
		var combinationArray, combinationIndex, combination;
		var simulator = root.getCurrentSession().createMapSimulator();
		var misc = CombinationBuilder.createMisc(unit, simulator);

		simulator.startSimulation(unit, CurrentMap.getWidth() * CurrentMap.getHeight());

		combinationArray = CombinationBuilder.createMoveCombinationArray(misc);
		if (combinationArray.length === 0) {
			combinationArray = this._getChaseCombinationArray(misc);
			if (combinationArray.length === 0) {
				return null;
			}
		}

		combinationIndex = CombinationSelectorEx.getEstimateCombinationIndex(unit, combinationArray);
		if (combinationIndex < 0) {
			return null;
		}

		combination = combinationArray[combinationIndex];

		combination.cource = CourceBuilder.createSlowlyMoveCource(unit, combination.posIndex, simulator);
		
		return combination;
	};

	CourceBuilder.createSlowlyMoveCource = function(unit, goalIndex, simulator) {
		var cource;
		var moveCount = typeof unit.custom.slowly_move === 'number' ? unit.custom.slowly_move : 1;
		var indexArrayDisabled = [];
		
		if (unit.getMapX() === CurrentMap.getX(goalIndex) && unit.getMapY() === CurrentMap.getY(goalIndex)) {
			return [];
		}
		
		cource = this._createCource(unit, goalIndex, simulator, indexArrayDisabled, moveCount, CourceType.EXTEND);
		if (cource.length === 0) {
			// cource.lengthが0の場合はコースを作れなかったことを意味する。
			// indexArrayDisabled.lengthが0の場合は同じ軍のユニットが塞いでいることが原因でないため、
			// 処理を続行しない。
			if (indexArrayDisabled.length === 0) {
				return [];
			}
			
			// 現在位置<unit.x, unit.y>が(1, 1)で、目標地点<goalIndex>が(10, 1)であると仮定したとき、
			// ユニットの移動力が6であれば、(7, 1)まで移動することが最短経路になる。
			// ただし、その(7, 1)にはユニットと同じ軍の別ユニットが存在している可能性があるため、
			// (7, 1)以外の場所を探す必要がある。
			// この例であれば、indexArrayDisabledに(7, 1)のインデックスが格納されていることになる。
			goalIndex = this._getNewGoalIndex(unit, simulator, indexArrayDisabled, moveCount);
			if (goalIndex === -1) {
				return [];
			}
			
			// 前回の_createCourceで設定した記録を消去
			simulator.resetSimulationMark();
			
			// 新しいgoalIndexでコースを作り直す
			cource = this._createCource(unit, goalIndex, simulator, indexArrayDisabled, moveCount, CourceType.RANGE);
		}
		else {
			this._validCource(unit, cource, simulator, moveCount);
		}
		
		return cource;
	};
})();
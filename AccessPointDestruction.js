/*--------------------------------------------------------------------------
　村破壊イベントを簡単に設定できるスクリプト ver 1.0

■作成者
キュウブ

■概要
本来、村破壊イベントを実装するには
一つ一つのポイントでマップチップ変更、訪問される前に特定ユニットで待機といった条件付けをした自動イベントを作成する必要があります。

このスクリプトを導入すると
1.特定のカスタムスキルを持ったユニットが
2.特定のカスタムパラメータを持ったマップチップに待機すると
3.破壊音と共に対象マスと周辺がカスタムパラメータに記載されたマップチップに変化する
ようになります。
つまり、初期設定さえ行えば、
自動イベントの設定無しで村破壊イベントを作成できるようになります。

■使い方
1.破壊ポイント用の地形を作成し、設定を行います。
この地形に特定ユニットが到達する事で自動で周辺が廃墟用の地形に変化します
(したがって、村の入り口に相当する部分を専用の地形にするのが望ましいと思います)

カスタムパラメータは以下のように設定します。
destructionSetting: {
	area:{//破壊エリアの設定
		mapX: <破壊ポイントから見て左上の相対座標X 右方向を正とする>,
		mapY: <破壊ポイントから見て左上の相対座標Y 下方向を正とする>,
		width: <破壊されるエリアの横の長さ>,
		height: <破壊されるエリアの縦の長さ>
	},
	changeMapChip:{
		sourceX: <リソース画像上で廃墟地形が左上のチップが左から何番目か記載(左端を0番目とする)>,
		sourceY: <リソース画像上で廃墟地形の左上のチップが上から何番目か記載(上端を0番目とする)>
	}
}

例えば、ランタイムの黄色い屋根の家をすぐ真下にある廃墟の家に変えたい場合は、
以下のカスパラを持たせた地形を黄色い屋根の入口の地形として設定します。
destructionSetting: {
	area:{
		mapX: -1, // 家の入口の1マス左から破壊されるので-1
		mapY: -1, // 家の入口の1マス上から破壊されるので-1
		width: 3, // 家は横3マスなので、破壊されるエリアの横の長さは3
		height: 2 // 家は縦2マスなので、破壊されるエリアの横の長さは2
	},
	changeMapChip:{
		sourceX: 3, // リソース画像の中で廃墟の家の左上のチップは左から数えて3番目
		sourceY: 11 // リソース画像の中で廃墟の家の左上のチップは左から数えて11番目
	}
}

2.破壊工作用のユニットにカスタムスキルを持たせます
'DestructionEvent'というカスタムキーワードを持たせたスキルを破壊工作用ユニットに持たせます

あとは対象ユニットを破壊ポイントとして設定した地形に向かわせれば、
どこのマップであろうとイベント設定が無かろうと勝手に更地にしてくれます。

■更新履歴
ver 1.0 (2021/03/10)
初版公開

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
	EnemyTurnMode.DESTRUCTION = 120;
	EnemyTurn._destructionStraightFlow = null;

	var _EnemyTurn__prepareTurnMemberData = EnemyTurn._prepareTurnMemberData;
	EnemyTurn._prepareTurnMemberData = function() {
		_EnemyTurn__prepareTurnMemberData.call(this);
		this._destructionStraightFlow = createObject(StraightFlow);
	};

	var _EnemyTurn_moveTurnCycle = EnemyTurn.moveTurnCycle;
	EnemyTurn.moveTurnCycle = function() {
		var result;
	
		if (this.getCycleMode() === EnemyTurnMode.DESTRUCTION) {
			if (this._isSkipAllowed() && InputControl.isStartAction()) {
				CurrentMap.setTurnSkipMode(true);
			}
			result = this._moveDestruction();
		}
		else {
			result = _EnemyTurn_moveTurnCycle.call(this);
		}
		return result;
	};

	EnemyTurn._moveDestruction = function() {
		if (this._destructionStraightFlow.moveStraightFlow() !== MoveResult.CONTINUE) {
			this._changeIdleMode(EnemyTurnMode.TOP, this._getIdleValue());
		}
		return MoveResult.CONTINUE;		
	};

	var _EnemyTurn__moveAutoAction = EnemyTurn._moveAutoAction;
	EnemyTurn._moveAutoAction = function() {
		if (this._autoActionArray[this._autoActionIndex].moveAutoAction() !== MoveResult.CONTINUE) {
			if (!this._countAutoActionIndex()) {
				this._destructionStraightFlow.setStraightFlowData(this._orderUnit);
				this._destructionStraightFlow.pushFlowEntry(DestructionEventFlowEntry);
				if (this._destructionStraightFlow.enterStraightFlow() === EnterResult.OK) {
					this.changeCycleMode(EnemyTurnMode.DESTRUCTION);
				}
				else {
					this._changeIdleMode(EnemyTurnMode.TOP, this._getIdleValue());
				}
			}
		}
		return MoveResult.CONTINUE;
	};

})();

var DestructionEventFlowEntry = defineObject(BaseFlowEntry,
{
	_dynamicEvent: null,
	
	enterFlowEntry: function(unit) {
		this._prepareMemberData();
		return this._completeMemberData(unit);
	},
	
	moveFlowEntry: function() {
		return this._dynamicEvent.moveDynamicEvent();
	},
	
	_prepareMemberData: function() {
		this._dynamicEvent = createObject(DynamicEvent);
	},
	
	_completeMemberData: function(unit) {
		var accessPointX, accessPointY, accessPointTerrian, accessPointHandle, accessPointHandleId, accessPointHandleIsRuntime;
		var destructionPointX, destructionPointY, destructionHandle;
		var destructionSetting, soundHandle, generator;
		var session = root.getCurrentSession();

		if (!SkillControl.getPossessionCustomSkill(unit, 'DestructionEvent')) {
			return EnterResult.NOTENTER;
		}
		accessPointX = unit.getMapX();
		accessPointY = unit.getMapY();
		accessPointTerrian = session.getTerrainFromPos(accessPointX, accessPointY, true);
		destructionSetting = accessPointTerrian.custom.destructionSetting;
		if (!this._validateDestructionSettingParameter(destructionSetting)) {
			return EnterResult.NOTENTER;
		}
		accessPointHandle = session.getMapChipGraphicsHandle(accessPointX, accessPointY, true);
		accessPointHandleId = accessPointHandle.getResourceId();
		accessPointHandleIsRuntime = accessPointHandle.getHandleType() === ResourceHandleType.RUNTIME; 
		destructionPointX = accessPointX + destructionSetting.area.mapX;
		destructionPointY = accessPointY + destructionSetting.area.mapY;
		generator = this._dynamicEvent.acquireEventGenerator();
		for (var dx = 0; dx < destructionSetting.area.width; dx++) {
			for (var dy = 0; dy < destructionSetting.area.height; dy++) {
				destructionHandle = root.createResourceHandle(
						accessPointHandleIsRuntime,
						accessPointHandleId,
						0,
						destructionSetting.changeMapChip.sourceX + dx,
						destructionSetting.changeMapChip.sourceY + dy
					);
				generator.mapChipChange(
						destructionPointX + dx,
						destructionPointY + dy,
						true,
						destructionHandle
					);
			}
		}
		soundHandle = root.createResourceHandle(true, 604, 0, 0, 0);
		generator.soundPlay(soundHandle, 1);
		generator.wait(120);

		return this._dynamicEvent.executeDynamicEvent();
	},

	_validateDestructionSettingParameter: function(destructionSetting) {
		if (destructionSetting === undefined) {
			return false;
		}
		if (typeof destructionSetting !== 'object') {
			root.log("destructionSettingの型が不正です");
			return false;
		}
		if (!('area' in destructionSetting) || !('changeMapChip' in destructionSetting)) {
			root.log("destructionSettingの型が不正です");
			return false;
		}
		if (typeof destructionSetting.area !== 'object' || typeof destructionSetting.changeMapChip !== 'object') {
			root.log("destructionSettingの型が不正です");
			return false;
		}
		if (
			!('mapX' in destructionSetting.area) ||
			!('mapY' in destructionSetting.area) ||
			!('width' in destructionSetting.area) ||
			!('height' in destructionSetting.area) ||
			!('sourceX' in destructionSetting.changeMapChip) ||
			!('sourceY' in destructionSetting.changeMapChip) 			
		) {
			root.log("destructionSettingの型が不正です");
			return false;
		}
		if (
			typeof destructionSetting.area.mapX !== 'number' ||
			typeof destructionSetting.area.mapY !== 'number' ||
			typeof destructionSetting.area.width !== 'number' ||
			typeof destructionSetting.area.height !== 'number' ||
			typeof destructionSetting.changeMapChip.sourceX !== 'number' ||
			typeof destructionSetting.changeMapChip.sourceY !== 'number' 	
		) {
			root.log("destructionSettingの型が不正です");
			return false;
		}
		return true;
	}
}
);
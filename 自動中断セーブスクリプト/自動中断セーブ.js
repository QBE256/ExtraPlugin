/*--------------------------------------------------------------------------
　自動中断セーブ機能 ver1.0
■作成者
キュウブ

■概要
ユニットが待機する度に自動で中断セーブが行われます
敵ターン中にリセットすると再開時に敵ターンから始まったりします

■事前準備
■■ 必須設定1
system-intteruption(自動中断セーブスクリプト用).jsと併用するか、
公式に配布されているsystem-intteruption.jsを下記のように修正してください
--------------------------------------------------------
TitleCommand.Interruption.openCommandの
root.getLoadSaveManager().loadInterruptionFile();の直前に

AutoSavedControl.setCustomParameter();
を追加する
---------------------------------------------------------
■■ 必須設定2
待機イベントでマップクリアが設定されていた場合、
そのイベント内で「イベントの状態変更」で自身の実行済み解除も行うようにしてください。
※エンディングイベント発生直後にゲームを終了して中断データをロードすると、エンディングが発生せずにクリア不能になるため

■更新履歴
ver1.0 2017/07/19
初版

■対応バージョン
SRPG Studio Version:1.137

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。
・クレジット明記無し　OK (明記する場合は"キュウブ"でお願いします)
・再配布、転載　OK (バグなどがあったら修正できる方はご自身で修正版を配布してもらっても構いません)
・wiki掲載　OK
・SRPG Studio利用規約は遵守してください。

------------------------------------------------------*/

var AutoSavedControl = {
	_customParameter: null,

	register: function () {
		root.getLoadSaveManager().saveInterruptionFile(
			root.getBaseScene(),
			root.getCurrentSession().getCurrentMapInfo().getId(),
			this._getCustomObject()
		);
	},

	_getCustomObject: function () {
		var turnType = root.getCurrentSession().getTurnType();

		var result = {
			turnType: turnType
		};

		return result;
	},

	setCustomParameter: function () {
		this._customParameter = root.getLoadSaveManager().getInterruptionFileInfo().custom;
	},

	getCustomParameter: function () {
		return this._customParameter;
	},

	resetCustomParameter: function () {
		this._customParameter = null;
	}
};

(function () {
	var alias1 = PlayerTurn._doEventEndAction;
	PlayerTurn._doEventEndAction = function () {
		alias1.call(this);
		if (!GameOverChecker.isGameOver()) {
			AutoSavedControl.register();
		}
	};

	EnemyTurn._moveAutoAction = function () {
		if (this._autoActionArray[this._autoActionIndex].moveAutoAction() !== MoveResult.CONTINUE) {
			if (!this._countAutoActionIndex()) {
				AutoSavedControl.register();
				this._changeIdleMode(EnemyTurnMode.TOP, this._getIdleValue());
			}
		}

		return MoveResult.CONTINUE;
	};

	FreeAreaScene._completeSceneMemberData = function () {
		var handle, autoSaveCustomParameter;
		var map = root.getCurrentSession().getCurrentMapInfo();
		var type = root.getCurrentSession().getTurnType();

		if (root.getSceneController().isActivatedFromSaveFile()) {
			autoSaveCustomParameter = AutoSavedControl.getCustomParameter();

			if (autoSaveCustomParameter) {
				// ターンを更新する
				if (typeof autoSaveCustomParameter.turnType === "number") {
					root.getCurrentSession().setTurnType(autoSaveCustomParameter.turnType);
					type = root.getCurrentSession().getTurnType();
				}

				// 他データのロード時に参照される事がないようにnullに戻す
				AutoSavedControl.resetCustomParameter();
			}

			SceneManager.resetCurrentMap();

			SceneManager.setEffectAllRange(false);

			if (type === TurnType.PLAYER) {
				handle = map.getPlayerTurnMusicHandle();
				this.getTurnObject().setAutoCursorSave(true);
			} else if (type === TurnType.ALLY) {
				handle = map.getAllyTurnMusicHandle();
			} else {
				handle = map.getEnemyTurnMusicHandle();
			}

			MediaControl.clearMusicCache();
			MediaControl.musicPlayNew(handle);

			this._processMode(FreeAreaMode.MAIN);
		} else {
			this._processMode(FreeAreaMode.TURNSTART);
		}
	};
})();

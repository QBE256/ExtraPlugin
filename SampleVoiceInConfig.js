/*--------------------------------------------------------------------------
　ボイス音量調整でボイスを流す ver 1.0

■作成者
キュウブ

■概要
環境設定のボイス調整に項目を当てた時に、サンプルボイスが120フレーム間隔で再生されます。
(2秒間隔で流すので、長くても1秒程度で終わるボイスを推奨)

■設定方法
31行目のSAMPLE_VOICE_FILEにサンプルボイスのファイル名を記入するだけでOK

■更新履歴
ver 1.0 (2021/07/02)
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
var SAMPLE_VOICE_FILE = "mic_test.wav";//ここに再生するファイル名を記入(この場合はmic_test.wavというファイルを流そうとする)

(function(){
	var _voiceWaitCounter = null;
	var _ConfigWindow_setConfigData = ConfigWindow.setConfigData;
	ConfigWindow.setConfigData = function() {
		_ConfigWindow_setConfigData.call(this);
		this._voiceWaitCounter = createObject(CycleCounter);
		this._voiceWaitCounter.setCounterInfo(120);
		this._voiceWaitCounter.disableGameAcceleration();
	};

	var _ConfigWindow_moveWindowContent = ConfigWindow.moveWindowContent;
	ConfigWindow.moveWindowContent = function() {
		var result = _ConfigWindow_moveWindowContent.call(this);
		// カーソルがボイス音量調節を指しているかどうかは、現在指している項目名がConfigItem.Voiceクラスの項目名と一致しているかどうかで判断する
		if (this._scrollbar.getObject().getConfigItemTitle() !== ConfigItem.Voice.getConfigItemTitle()) {
			root.getMaterialManager().voiceStop(1, false);
			this._voiceWaitCounter.resetCounterValue();
		}
		else {
			if (this._voiceWaitCounter.getCounter() === 0) {
				// 流す直前はボイスを止める
				root.getMaterialManager().voiceStop(1, false);
				root.getMaterialManager().voicePlay(DataConfig.getVoiceCategoryName(), SAMPLE_VOICE_FILE, 1);
			}
			this._voiceWaitCounter.moveCycleCounter();
		}
		
		return result;
	};
})();
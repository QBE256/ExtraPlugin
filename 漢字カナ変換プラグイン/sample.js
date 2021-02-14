/*--------------------------------------------------------------------------
■作成者
 キュウブ

■概要
こちらは漢字カナ変換プラグインを使ったサンプルコードです。
スクリプトの実行->イベントコマンドの呼び出し オブジェクト名"KanjiConversionCommand" で"わたしはなっしゅ"という文字列を漢字変換できます。
変換後にID0番のユニットの名前が変わります。
他の変換を行いたい時はCONVERSION_TEXTの値を変えてみてください。

また、このコードは作り込んでいるわけじゃないので、0番のユニットが設定されてないとエラー落ちします。

※サンプルコードではありますが独自イベントコマンドの作り方を理解されている事が前提のコードとなります。

■更新履歴
ver 1.0 (2021/02/14)
初版公開

■対応バージョン
SRPG Studio Version:1.161

■規約
Copyright (c) 2021 キュウブ
This software is released under the MIT License.
http://opensource.org/licenses/mit-license.php

・APIに関してはGoogleの規約にも従ってください。
https://developers.google.com/transliterate/terms

--------------------------------------------------------------------------*/

var CONVERSION_TEXT = "わたしはなっしゅ";

(function() {
	var alias1 = ScriptExecuteEventCommand._configureOriginalEventCommand;
	ScriptExecuteEventCommand._configureOriginalEventCommand = function(groupArray) {
		alias1.call(this, groupArray);
		groupArray.appendObject(KanjiConversionCommand);
	};

	var KanjiConversionMode = {
		REQUEST: 0,
		SELECT: 1,
		CONVERSION: 2
	};

	var KanjiConversionCommand = defineObject(BaseEventCommand,
	{
		_conversionAPIRequest: null,
		_selectConversionCandidateWindow: null,

		enterEventCommandCycle: function() {
			this._prepareEventCommandMemberData();		
			return this._completeEventCommandMemberData();
		},

		moveEventCommandCycle: function() {
			var result = MoveResult.END;
			var mode = this.getCycleMode();

			if (mode === KanjiConversionMode.REQUEST) {
				result = this.moveRequest();
			}
			else if (mode === KanjiConversionMode.SELECT) {
				result = this.moveSelect();
			}
			else if (mode === KanjiConversionMode.CONVERSION) {
				result = this.moveConversion();
			}

			return result;
		},

		moveRequest: function() {
			var responseData;
			var result = MoveResult.CONTINUE;

			if (this._conversionAPIRequest.waitRequest() === MoveResult.END) {
				// APIへのリクエスト処理が終わったのでレスポンスデータを受け取る
				responseData = this._conversionAPIRequest.getResponseData();
				// レスポンスデータが空配列であればイベント終了
				if (responseData.length === 0) {
					result = MoveResult.END;
				}
				else {
					this.changeCycleMode(KanjiConversionMode.SELECT);
					// 変換候補ウィンドウにレスポンスデータをセットアップする
					this._selectConversionCandidateWindow.setCandidateData(responseData);
				}
			}
			return result;
		},

		moveSelect: function() {
			if (this._selectConversionCandidateWindow.moveWindow() === MoveResult.END) {
				this.changeCycleMode(KanjiConversionMode.CONVERSION);
			}

			return MoveResult.CONTINUE;
		},

		moveConversion: function() {
			var unit = root.getMetaSession().getTotalPlayerList().getDataFromId(0);
			var contersionText = this._selectConversionCandidateWindow.getConversionText();

			// conversionText.afterTextにCONVERSION_TEXTを変換した文字列が入っているので、ユニット名に設定
			// また、このサンプルコードでは扱いませんが、conversionText.beforeTextにはCONVERSION_TEXTの文字列(つまり変換前の文字列)が入っています
			unit.setName(contersionText.afterText);
			return MoveResult.END;
		},

		drawEventCommandCycle: function() {
			var mode = this.getCycleMode();

			if (mode === KanjiConversionMode.SELECT) {
				// BaseWindowクラスを継承しているのでdrawWindowで描画可能
				this._selectConversionCandidateWindow.drawWindow(
					LayoutControl.getCenterX(-1, this._selectConversionCandidateWindow.getWindowWidth()), 
					100
				);
			}
		},
	
		getEventCommandName: function() {
			return 'KanjiConversionCommand';
		},

		// 旧バージョン用のメソッド
		getEventCommmandName: function() {
			return 'KanjiConversionCommand';
		},

		_prepareEventCommandMemberData: function() {
			this._conversionAPIRequest = createObject(ConversionAPIRequest);
			this._selectConversionCandidateWindow = createWindowObject(SelectConversionCandidateWindow, this);
		},
	
		_completeEventCommandMemberData: function() {
			// リクエストデータをセットアップ
			this._conversionAPIRequest.setRequest(CONVERSION_TEXT);
			// APIへリクエスト送信
			this._conversionAPIRequest.sendRequest();
			this.changeCycleMode(KanjiConversionMode.REQUEST);

			return true;
		}	
	});
})();
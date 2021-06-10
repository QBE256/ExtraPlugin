/*--------------------------------------------------------------------------
　タイトル画面に告知文を表示 ver 1.0

■作成者
キュウブ

■概要
ゲーム起動時の1度だけ、タイトル画面でゲームバージョンに応じて告知文を出し分けます。
この機能を使用するにはGoogleスプレッドシートに告知文を記載する必要になります。
私の方で作成したGoogle Apps ScriptのAPIを通してスプレッドシートに書かれた文章を受け取りに行く仕組みになっています。
※あまりに多くのユーザが利用し、総アクセス数が多くなるとGoogle Apps Scriptの上限に引っかかる可能性があります。
懸念される場合はGoogle Apps ScriptのAPIを別途独自で作成される事を推奨します(ソースコードはgitの同ディレクトリ内に置いてあります)

■設定方法
1.コンフィグ->スクリプト->グローバルパラメータで
version:"<現在のバージョン>"
を入力します。必ずx.y.zという形式にしてください(駄目な例:"1.05",正しい例:"1.0.5")。
ここは最新バージョンを入力する必要があるので、新しくゲームのパッチをリリースする度に書き換えてください。
例. 1.0.31の場合
version:"1.0.31"
※数字を" "（ダブルクォーテーション）で囲わなければならない事に注意！

2.Googleスプレッドシートを作成します(※Googleアカウント必須)。
※一番目のシート(デフォルト名:シート1)以外は編集しても意味がありません

A1に 最新バージョン名
B1に 告知文
を記載してください。

例. 最新バージョンが1.0.31の場合
A1に 1.0.31 (こちらは""で囲ってはいけません)
B1に 1.0.31を公開しました。サイトからDLお願いします。

上記のような設定を行うと1で設定した値が1.0.31より小さい場合は
タイトル画面で"1.0.31を公開しました。サイトからDLお願いします。"という文字列が表示されるようになります。

また、1.0.31以降であれば、"更新情報はありません。"と表示されます。

3.2で作成したGoogleスプレッドシートの共有設定を変更する
スプレットシートの右上の画面の"共有"のボタンを押してください。
設定を保存した後、
リンクを取得のところで"制限つき"となっているところをクリックして"リンクを知っている全員"に変更します。
これで告知システムがスプレットシートにアクセス可能になります。

4.71行目のSPREADSHEET_IDにスプレッドシートのIDを入力します
スプレットシートのURLは
https://docs.google.com/spreadsheets/d/xxxxxxxxxxxxx/edit
となっていると思います。このxxxxxxxxxxの部分がIDとなります。

5.タイトル画面と告知文の色の相性が悪い場合
70行目のNOTICE_COLORの値を変えてください。0x<Rの16進数><Gの16進数><Bの16進数>で設定できます。
例えば、0xff0000はR=FF(255),G=00(0),B=00(0)となるので真っ赤な文字になります。

6.告知文の表示位置を変えたい場合
73行目の[400, 30]の値を変えてください。[<左端0とした場合のx座標>, <上端を0として下を正方向とするy座標>]となっております。

■更新履歴
ver 1.0 (2021/06/11)
初版公開

■対応バージョン
SRPG Studio Version:1.161

■規約
Copyright (c) 2021 キュウブ
This software is released under the MIT License.
http://opensource.org/licenses/mit-license.php

--------------------------------------------------------------------------*/
var NOTICE_COLOR = 0x00ff00;//告知文の色を設定
var SPREADSHEET_ID = "";//ここに「共有設定がリンクを知っている全員」になっているスプレッドシートのidを記載
var NOTICEAPI_URL = "https://script.google.com/macros/s/AKfycbxB22r0yvMDdREqHH1njyOPPindhZYwGAtVn8UMNM2bvnOslYTc8HrJoJdjubEAVbAKBA/exec";
var NOTICE_POSITION = [400, 30];//告知文の表示箇所を設定
var isRequestNoticeAPI = false;
var APIRequest = defineObject(BaseObject,
{
	_request: null,
	_counter: null,
	_responseData: null,

	initialize: function() {
		this._request = new ActiveXObject("Msxml2.ServerXMLHTTP");
		this._responseData = {notice:""};
		this._counter = createObject(CycleCounter);
		this._counter.setCounterInfo(this._getRequestTimeOut());
		this._counter.disableGameAcceleration();
	},
	// 120フレーム待って戻ってこなかったらタイムアウトとする
	_getRequestTimeOut: function() {
		return 120;
	},

	getResponseData: function() {
		return this._responseData;
	},

	waitRequest: function() {
		var waitRequestResult = MoveResult.END;
		var counterResult = this._counter.moveCycleCounter();
		
		if (this._request.readyState <= 3 || counterResult === MoveResult.CONTINUE) {
			waitRequestResult = MoveResult.CONTINUE;
		}
		else if (this._request.readyState === 4 && this._request.status === 200) {
			this._responseData = JSON.parse(this._request.responseText);
			waitRequestResult = MoveResult.END;
			root.log("API Request Success");
			root.log(this._request.responseText);
		}
		else {
			root.log("API Request Error");
			if (counterResult === MoveResult.END) {
				root.log("TimeOut");
				this._request.abort();
			}
			else {
				root.log("StatusCode:" + this._request.status);
				root.log("ReadyState:" + this._request.readyState);
			}
			waitRequestResult = MoveResult.END;
			this._responseData = {notice:""};
		}
		return waitRequestResult;
	},

	setRequest: function(method, url) {
		this._request.open(method, url, true);
	},

	sendRequest: function() {
		this._responseData = {notice:""};
		this._counter.resetCounterValue();
		this._request.send();
	}
});

var GameVersionControl = {
	getCurrentGameVersion: function() {
		return root.getMetaSession().global.version;
	},

	getSaveDataVersion: function(index) {
		return root.getLoadSaveManager().getSaveFileInfo(index).custom.version;
	},

	parseVersion: function(stringVer) {
		var arrayVer =  stringVer.split(".");

		for (var index = 0; index < arrayVer.length; index++) {
			arrayVer[index] = parseInt(arrayVer[index]);
		}
		return arrayVer;
	},

	compareVersion: function(stringVer1, stringVer2) {
		var arrayVer1 = this.parseVersion(stringVer1);
		var arrayVer2 = this.parseVersion(stringVer2);
	}
};

(function(){
	var _ScriptCall__Setup = ScriptCall_Setup;
	ScriptCall_Setup = function() {
		_ScriptCall__Setup.call(this);
		isRequestNoticeAPI = false;
	};
	TitleScene._apiRequest = null;
	TitleScene._notice = null;
	var _TitleScene__completeSceneMemberData = TitleScene._completeSceneMemberData;
	TitleScene._completeSceneMemberData = function() {
		var versions;

		_TitleScene__completeSceneMemberData.call(this);
		
		if (isRequestNoticeAPI) {
			return;
		}

		versions = GameVersionControl.parseVersion(GameVersionControl.getCurrentGameVersion());
		this._notice = null;
		this._apiRequest = createObject(APIRequest);
		this._apiRequest.setRequest(
			'GET',
			NOTICEAPI_URL + '?major=' + versions[0] + '&minor=' + versions[1] + '&patch=' + versions[2] + '&spreadSheetId=' + SPREADSHEET_ID
		);
		this._apiRequest.sendRequest();
	};

	var _TitleScene_moveSceneCycle = TitleScene.moveSceneCycle;
	TitleScene.moveSceneCycle = function() {
		if (!isRequestNoticeAPI && this._apiRequest.waitRequest() === MoveResult.END) {
			isRequestNoticeAPI = true;
			this._notice = this._apiRequest.getResponseData();
		}
		return _TitleScene_moveSceneCycle.call(this);
	};

	var _TitleScene__drawBackground = TitleScene._drawBackground;
	TitleScene._drawBackground = function() {
		_TitleScene__drawBackground.call(this);
		this._drawNoticeText(NOTICE_POSITION[0], NOTICE_POSITION[1]);
	};

	TitleScene._drawNoticeText = function(x, y) {
		var textui = root.queryTextUI('description_title');
		var color = textui.getColor();
		var font = textui.getFont();

		if (!this._notice || typeof this._notice !== 'object') {
			return;
		}

		TextRenderer.drawText(x, y, this._notice.notice, 500, NOTICE_COLOR, font);
	};
})();

// JSON.parse polyfill
// Reference: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#polyfill
if (JSON === undefined) {
	var JSON = {};
}
// From https://github.com/douglascrockford/JSON-js/blob/master/json2.js
if (typeof JSON.parse !== "function") {
    var rx_one = /^[\],:{}\s]*$/;
    var rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
    var rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
    var rx_four = /(?:^|:|,)(?:\s*\[)+/g;
    var rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    JSON.parse = function(text, reviver) {

        // The parse method takes a text and an optional reviver function, and returns
        // a JavaScript value if the text is a valid JSON text.

        var j;

        function walk(holder, key) {

            // The walk method is used to recursively walk the resulting structure so
            // that modifications can be made.

            var k;
            var v;
            var value = holder[key];
            if (value && typeof value === "object") {
                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = walk(value, k);
                        if (v !== undefined) {
                            value[k] = v;
                        } else {
                            delete value[k];
                        }
                    }
                }
            }
            return reviver.call(holder, key, value);
        }


        // Parsing happens in four stages. In the first stage, we replace certain
        // Unicode characters with escape sequences. JavaScript handles many characters
        // incorrectly, either silently deleting them, or treating them as line endings.

        text = String(text);
        rx_dangerous.lastIndex = 0;
        if (rx_dangerous.test(text)) {
            text = text.replace(rx_dangerous, function(a) {
                return (
                    "\\u" +
                    ("0000" + a.charCodeAt(0).toString(16)).slice(-4)
                );
            });
        }

        // In the second stage, we run the text against regular expressions that look
        // for non-JSON patterns. We are especially concerned with "()" and "new"
        // because they can cause invocation, and "=" because it can cause mutation.
        // But just to be safe, we want to reject all unexpected forms.

        // We split the second stage into 4 regexp operations in order to work around
        // crippling inefficiencies in IE's and Safari's regexp engines. First we
        // replace the JSON backslash pairs with "@" (a non-JSON character). Second, we
        // replace all simple value tokens with "]" characters. Third, we delete all
        // open brackets that follow a colon or comma or that begin the text. Finally,
        // we look to see that the remaining characters are only whitespace or "]" or
        // "," or ":" or "{" or "}". If that is so, then the text is safe for eval.

        if (
            rx_one.test(
                text
                .replace(rx_two, "@")
                .replace(rx_three, "]")
                .replace(rx_four, "")
            )
        ) {

            // In the third stage we use the eval function to compile the text into a
            // JavaScript structure. The "{" operator is subject to a syntactic ambiguity
            // in JavaScript: it can begin a block or an object literal. We wrap the text
            // in parens to eliminate the ambiguity.

            j = eval("(" + text + ")");

            // In the optional fourth stage, we recursively walk the new structure, passing
            // each name/value pair to a reviver function for possible transformation.

            return (typeof reviver === "function") ?
                walk({
                    "": j
                }, "") :
                j;
        }

        // If the text is not JSON parseable, then a SyntaxError is thrown.
        return false;
    };
}
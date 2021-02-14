/*--------------------------------------------------------------------------
　漢字カナ変換プラグイン ver 1.0

■作成者
キュウブ

■概要
※これ単体ではゲーム上では使えません。
※文字入力系のプラグインにうまく組み込んで使ってください
※SRPGStudioのプラグインに書き慣れていないと難しいと思います。SRPGStudioユーザというよりプラグイン作成者向けのプラグインといったところです。
※簡単なサンプルコードも用意しているので、使いたい方はそちらを参考にしてみてください。

このプラグインでは
与えた文字列の漢字、片仮名等の変換候補の取得を行うクラスと
変換候補から変換文字列を選択するウィンドウを描画するクラスを定義しています。

つまり、これらの二種類のクラスをうまくプラグインに組み込む事で、
与えた文字列を漢字等に変換する事ができるようになります。

なお、変換候補を取得するために、Google CGI API for Japanese Input へリクエストを行います。
https://www.google.co.jp/ime/cgiapi.html

※注意
・つまり、このプラグインを導入した作品は、外部へインターネット接続を行う事になります。
よって、作品にしようする場合はオンライン要素がある事をReadmeにも一言入れておくと良いでしょう。
・Google APIの仕様が変更される、障害でダウンする、サービスが終了するといった場合はこのプラグインは使えなくなります。
よって、うまく変換候補が取得できなくても正常に動作するようにプラグインを組み込んでおくと良いでしょう。
・リクエスト時、60フレーム待機してAPIから応答が無かった場合は処理を強制的に打ち切ります(プラグイン自体はエラーにはなりません)。
失敗した場合でもゲームが強制終了しないようにうまく組み込んでおいてください。

■使い方
基本的にConversionAPIRequestクラスとSelectConversionCandidateWindowクラスを通じて変換候補の取得と選択が可能です。
下記クラスと主なメソッドの解説です。

1.ConversionAPIRequestクラス
APIにリクエストを行い、変換候補を取得するためのクラスです。

1.1.setRequest(queryText) 
arg: queryText:<string>

APIへのリクエストの準備を行います。queryTextはString型でなければなりません。
また、APIの仕様で平仮名以外はまともに変換候補を出してくれないので、可能な限り片仮名等の使用は避けておいた方が良さそうです。

1.2.sendRequest()
APIへリクエストを行います。事前にsetRequest()でリクエストの準備が済んでいなければ確実に失敗します。

1.3.waitRequest()
return: <MoveResultの値>

APIへのリクエストが完了するまで呼び出し続ける事を想定しているメソッドです。
SRPGStudioクラスでよくあるmove系メソッドと同等の機能を持ちます。
つまり、返り値がMoveResult.CONTINUEの時はリクエスト処理未完了、MoveResult.ENDの時はリクエスト処理完了となります。
リクエストが成功したか失敗したかはログに出力されます。

1.4.getResponseData()
return: <APIのレスポンスボディ>

APIのレスポンスボディを取得します。
レスポンスの構造は以下のような多次元配列となっています(2021/02/14現在)。
[
	["<変換前の文字列A>",["<文字列Aの変換候補1>","<文字列Aの変換候補2>","<文字列Aの変換候補3>"...]],
	["<変換前の文字列B>",["<文字列Bの変換候補1>","<文字列Bの変換候補2>","<文字列Bの変換候補3>"...]],
	["<変換前の文字列C>",["<文字列Cの変換候補1>","<文字列Cの変換候補2>","<文字列Cの変換候補3>"...]],
	...
]

例えば、"わたしはにほんにいます"の場合は、
[
	["わたしは",["私は","渡しは"]],
	["にほんに",["日本に","二本に","二ホンに"],
	["います",["射ます","居ます"]]
]
のような配列になると思います。

もし、リクエストに失敗、もしくはステータスコードが200以外であった場合は空配列を返す仕様にしています。

2.SelectConversionCandidateWindowクラス
変換候補一覧を出し、選択するウィンドウを描画するためのクラスです。

2.1.setCandidateData(candidateData)
arg:candidateData:<object>

変換候補データの初期セットアップを行います。クラスのインスタンス化直後に呼び出す事を想定しています。
引数のcandidateDataには
ConversionAPIRequestクラスのgetResponseData()で得たレスポンスデータをそのまま与えてください。

2.2.getConversionText()
return:<object> {beforeText:<変換前文字列>, afterText:<変化後文字列>}という構造のオブジェクト

変換候補の選択が完了した後に、変換データを呼び出すためのメソッドです。
beforeTextが変換前の文字列、afterTextが変換後の文字列となっているので、
これのデータをもとに、対象文字列を変換してください。

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

var ConversionAPISetting = {
	URL: 'http://www.google.com/transliterate',
	FIXED_QUERY: '?langpair=ja-Hira|ja&text=',
	TARGET_TEXT_INDEX: 0,
	CANDIDATE_ARRAY_INDEX: 1
};

var ConversionAPIRequest = defineObject(BaseObject,
{
	_request: null,
	_counter: null,
	_responseData: null,

	initialize: function() {
		this._request = new ActiveXObject("Microsoft.XMLHTTP");
		this._responseData = [];
		this._counter = createObject(CycleCounter);
		this._counter.setCounterInfo(this._getRequestTimeOut());
		this._counter.disableGameAcceleration();
	},

	_getRequestTimeOut: function() {
		return 60;
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
			root.log("ConversionAPI Request Success");
			root.log(this._request.responseText);
		}
		else {
			root.log("ConversionAPI Request Error");
			if (counterResult === MoveResult.END) {
				root.log("TimeOut");
			}
			else {
				root.log("StatusCode:" + this._request.status);
				root.log("ReadyState:" + this._request.readyState);
			}
			waitRequestResult = MoveResult.END;
			this._responseData = [];
		}
		return waitRequestResult;
	},

	setRequest: function(queryText) {
		if (typeof queryText !== 'string') {
			root.log("ConversionAPI setRequest Method Error");
			root.log("queryText should be string");
			return;
		}
		root.log("queryText=" + queryText);
		this._request.open('GET', ConversionAPISetting.URL + ConversionAPISetting.FIXED_QUERY + queryText, true);
	},

	sendRequest: function() {
		this._responseData = [];
		this._counter.resetCounterValue();
		this._request.send();
	}
});

ScreenBuilder.buildConversionText = function() {
	return {
		beforeText: "",
		afterText: ""
	};
};

var SelectConversionCandidateWindow = defineObject(BaseWindow,
{
	_candidateTextScrollbar: null,
	_candidateData: null,
	_conversionText: null,
	_currentIndex: 0,
	_windowWidth: 0,
	_windowHeight: 0,
	_maxShowCount: 8,
	_minWindowWidth: 200,
	_targetIndex: [],
	_currentText: "",
	
	setCandidateData: function(candidateData) {
		this._candidateTextScrollbar = createScrollbarObject(CandidateTextScrollbar, this);
		this._conversionText = ScreenBuilder.buildConversionText();
		this._currentIndex = 0;
		this._targetIndex = [0, 0];
		this._candidateData = candidateData;
		this._conversionText.beforeText = this._createCurrentText();
		this._changeConversionTextData();
		this._candidateTextScrollbar.setActive(true);
	},

	_changeConversionTextData: function() {
		var textWidth = 0;
		var count = this._candidateData[this._currentIndex][ConversionAPISetting.CANDIDATE_ARRAY_INDEX].length;

		count = count > this._maxShowCount ? count : this._maxShowCount;
		this._currentText = this._createCurrentText();
		this._candidateTextScrollbar.setScrollFormation(1, count);
		this._candidateTextScrollbar.setCandidateData(
			this._currentText,
			this._candidateData[this._currentIndex][ConversionAPISetting.CANDIDATE_ARRAY_INDEX]
		);
		this._setTargetIndex(
			this._conversionText.afterText.length,
			this._conversionText.afterText.length + this._candidateData[this._currentIndex][ConversionAPISetting.TARGET_TEXT_INDEX].length
		);
		this._windowWidth = this._candidateTextScrollbar.getObjectWidth() > this._minWindowWidth ?
							this._candidateTextScrollbar.getObjectWidth() + 100 : this._minWindowWidth;
		this._windowHeight = this._candidateTextScrollbar.getObjectHeight() * count + 32;
	},

	_createCurrentText: function() {
		var text = this._conversionText.afterText;

		for (var index = this._currentIndex; index < this._candidateData.length; index++) {
			text += this._candidateData[index][ConversionAPISetting.TARGET_TEXT_INDEX]; 
		}
		return text;
	},
	
	moveWindowContent: function() {
		var result = MoveResult.CONTINUE;
		var input = this._candidateTextScrollbar.moveInput();

		if (input === ScrollbarInput.SELECT) {
			this._conversionText.afterText += this._candidateTextScrollbar.getObject();
			if (++this._currentIndex < this._candidateData.length) {
				this._changeConversionTextData();
				result = MoveResult.CONTINUE;
			}
			else {	
				result = MoveResult.END;
			}
		}
		else if (input === ScrollbarInput.CANCEL) {
			this._conversionText.afterText = this._createCurrentText();
			result = MoveResult.END;
		}
		return result;
	},
	
	drawWindowContent: function(x, y) {
		this._drawCurrentText(x, y);
		this._candidateTextScrollbar.drawScrollbar(x, y + this._candidateTextScrollbar.getObjectHeight() + 32);
	},

	_drawCurrentText: function(x, y) {
		var length = this.getWindowWidth();
		var textui = this._candidateTextScrollbar.getParentTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		var pic = root.queryUI('select_line');
		var frontText = this._currentText.substr(0, this._targetIndex[0]);
		var targetText = this._currentText.substr(this._targetIndex[0], this._targetIndex[1] - this._targetIndex[0]);
		var backText = this._currentText.substr(this._targetIndex[1]);

		x += 3;
		y += 8;
		TextRenderer.drawText(x, y + this._candidateTextScrollbar.getObjectHeight() + 8, '変換候補', length, ColorValue.KEYWORD, font);
		if (frontText) {
			TextRenderer.drawText(x, y, frontText, length, color, font);
			x += root.getGraphicsManager().getTextWidth(frontText, font);
		}
		if (targetText) {
			TextRenderer.drawText(x, y, targetText, length, color, font);
			if (pic) {
				TitleRenderer.drawLine(x - 3, y + 14, root.getGraphicsManager().getTextWidth(targetText, font) - 16, pic);
			}
			x += root.getGraphicsManager().getTextWidth(targetText, font);
		}
		if (backText) {
			TextRenderer.drawText(x, y, backText, length, color, font);
		}
	},

	_setTargetIndex: function(start, end) {
		this._targetIndex = [start, end];
	},

	getConversionText: function() {
		return this._conversionText;
	},
	
	getWindowWidth: function() {
		return this._windowWidth;
	},
	
	getWindowHeight: function() {
		return this._windowHeight;
	}
}
);

var CandidateTextScrollbar = defineObject(BaseScrollbar,
{
	_objectWidth: 0,

	drawScrollContent: function(x, y, object, isSelect, index) {
		var length = this.getObjectWidth();
		var textui = this.getParentTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		
		x += 3;
		y += 8;
		TextRenderer.drawText(x, y, object, length, color, font);
	},

	setObjectWidth: function(text) {
		var font = this.getDescriptionTextUI().getFont();
		var textWidth = root.getGraphicsManager().getTextWidth(text, font);

		this._objectWidth = textWidth < DefineControl.getTextPartsWidth() ?
							DefineControl.getTextPartsWidth() : textWidth;
	},

	setCandidateData: function(text, objectArray) {
		this.setObjectWidth(text);
		this.setObjectArray(objectArray);
	},

	getObjectWidth: function() {
		return this._objectWidth;
	},
	
	getObjectHeight: function() {
		return DefineControl.getTextPartsHeight();;
	}
});

// JSON.parse polyfill
// Reference: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#polyfill
var JSON = {};
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

        throw new SyntaxError("JSON.parse");
    };
}
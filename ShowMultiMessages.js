/*--------------------------------------------------------------------------
　同時台詞進行 ver 1.1

■作成者
キュウブ

■概要
指定のグローバルスイッチがオンになっている間、二つの台詞が同時に流れるようになります。
二つ同時に流す時以外は必ずスイッチをオフにしてください。
※ また、本機能はタイトル画面から直でシーン回想で該当イベントを流した場合などは動作しません。グローバルスイッチが参照できないためです。

■使い方
1.MultiShowMessageGlobalSwitchIdにフラグ用のグローバルスイッチIDを記入します。

2.イベントコマンドを
* グローバルスイッチ オン
* 第1メッセージイベントコマンド
* 第2メッセージイベントコマンド
* グローバルスイッチ オフ
というふうに並べれば同時に台詞が流れるようになります。

■仕様
内部的な挙動を解説すると
第1メッセージイベントコマンドを即終了させて、第2メッセージイベントコマンドの中で第1メッセージも流すような処理になっています。

例えば、下記のようなイベントを組んだ場合、同時にメッセージが流れる直前にユニット移動が行われます
* グローバルスイッチ オン
* 第1メッセージイベントコマンド
* ユニット移動
* 第2メッセージイベントコマンド
* グローバルスイッチ オフ

また、グローバルスイッチがオンになっている間は二つのメッセージイベントコマンドが実行されて初めて台詞が流れるようになります。
下記の例だと2回目の表示位置上メッセージコマンドだけ流そうとしても、2つ目のメッセージイベントコマンドが設定されていないので表示されません。
* グローバルスイッチ オン
* メッセージイベントコマンド(表示位置 上)
* メッセージイベントコマンド(表示位置 下)
* 表示位置 下だけメッセージ消去
* メッセージイベントコマンド(表示位置 上)
* グローバルスイッチ オフ

単体でメッセージを流す時は"必ずグローバルスイッチをオフに戻してください"。

上記の演出を行いたい場合は下記のようにコマンドを組む事を強く推奨します
* グローバルスイッチ オン
* メッセージイベントコマンド(表示位置 上)
* メッセージイベントコマンド(表示位置 下)
* グローバルスイッチ オフ
* 表示位置 下だけメッセージ消去
* メッセージイベントコマンド(表示位置 上)

■更新履歴
ver 1.1 (2025/10/20)
タイトル画面経由でシーン回想を開くなど、グローバルスイッチが参照できないパターンで参照エラーが起きる不具合を修正
こういった特定条件下では本機能を動作させないように対処

ver 1.0 (2021/04/13)
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

var MultiShowMessageGlobalSwitchId = 25; //同時台詞フラグ用のグローバルスイッチIDをここに記入してください

(function () {
  var _MessageShowEventCommand__completeEventCommandMemberData =
    MessageShowEventCommand._completeEventCommandMemberData;
  MessageShowEventCommand._completeEventCommandMemberData = function () {
    if (this._messageView.isMultiShowMessageSwitchOn()) {
      if (this._messageView.isReadyFirstMessage()) {
        this._messageView.setupSecondMessageView(this._createMessageViewParam());
        return EnterResult.OK;
      } else {
        _MessageShowEventCommand__completeEventCommandMemberData.call(this);
        return EnterResult.NOTENTER;
      }
    }
    return _MessageShowEventCommand__completeEventCommandMemberData.call(this);
  };

  FaceView._isReadyFirstMessage = false;
  FaceView._activeSecondPos = MessagePos.NONE;
  FaceView.isMultiShowMessageSwitchOn = function () {
    var metaSession = root.getMetaSession();
    if (!metaSession) {
      return false;
    }
    var index = metaSession.getGlobalSwitchTable().getSwitchIndexFromId(MultiShowMessageGlobalSwitchId);
    return metaSession.getGlobalSwitchTable().isSwitchOn(index);
  };

  var _FaceView_setupMessageView = FaceView.setupMessageView;
  FaceView.setupMessageView = function (messageViewParam) {
    this._activeSecondPos = MessagePos.NONE;
    _FaceView_setupMessageView.call(this, messageViewParam);
    // グローバルスイッチがオンになっている場合は第1メッセージ準備完了フラグを立てる
    if (this.isMultiShowMessageSwitchOn()) {
      this._isReadyFirstMessage = true;
    }
  };

  FaceView.setupSecondMessageView = function (messageViewParam) {
    var tempActivePos = this._activePos;
    this.setupMessageView(messageViewParam);
    this._activePos = tempActivePos;
    this._activeSecondPos = messageViewParam.pos;
  };

  FaceView.isReadyFirstMessage = function () {
    return this._isReadyFirstMessage;
  };

  var _FaceView_moveMessageView = FaceView.moveMessageView;
  FaceView.moveMessageView = function () {
    var resultFirstMessageView = _FaceView_moveMessageView.call(this);
    var resultSecondMessageView = MoveResult.CONTINUE;

    // グローバルスイッチがオンになっていない場合は第1メッセージの結果だけ見て終わり
    if (!this.isMultiShowMessageSwitchOn()) {
      return resultFirstMessageView;
    }

    if (this._activeSecondPos === MessagePos.TOP) {
      resultSecondMessageView = this._topView.moveMessageView();
    } else if (this._activeSecondPos === MessagePos.CENTER) {
      resultSecondMessageView = this._centerView.moveMessageView();
    } else if (this._activeSecondPos === MessagePos.BOTTOM) {
      resultSecondMessageView = this._bottomView.moveMessageView();
    }

    // 何らかの理由で、第1メッセージがアクティブになっていない場合は第2メッセージの結果だけ見て終わり
    // ただし、これは進行不能になる事を回避するための措置で、このような状況になる事自体推奨しない
    // このような状況になる前にグローバルスイッチをオフにするべきである
    if (this._activePos === MessagePos.NONE) {
      return resultSecondMessageView;
    } else if (resultFirstMessageView === MoveResult.END && resultSecondMessageView === MoveResult.END) {
      this._isReadyFirstMessage = false;
      return MoveResult.END;
    } else {
      return MoveResult.CONTINUE;
    }
  };

  FaceView.drawMessageView = function () {
    var view = null;
    var isActive = true;
    var isTopActive = true;
    var isCenterActive = true;
    var isBottomActive = true;

    if (root.isMessageBlackOutEnabled()) {
      isTopActive = this._activePos === MessagePos.TOP || this._activeSecondPos === MessagePos.TOP;
      isCenterActive = this._activePos === MessagePos.CENTER || this._activeSecondPos === MessagePos.CENTER;
      isBottomActive = this._activePos === MessagePos.BOTTOM || this._activeSecondPos === MessagePos.BOTTOM;
    }

    if (this._topView !== null) {
      this._topView.drawCharIllust(isTopActive);
    }

    if (this._centerView !== null) {
      this._centerView.drawCharIllust(isCenterActive);
    }

    if (this._bottomView !== null) {
      this._bottomView.drawCharIllust(isBottomActive);
    }

    if (root.isMessageWindowFixed()) {
      if (this._activePos === MessagePos.TOP) {
        view = this._topView;
        isActive = isTopActive;
      } else if (this._activePos === MessagePos.CENTER) {
        view = this._centerView;
        isActive = isCenterActive;
      } else if (this._activePos === MessagePos.BOTTOM) {
        view = this._bottomView;
        isActive = isBottomActive;
      }

      if (view !== null) {
        view.drawMessageView(isActive, BaseMessageView.getMessageBottomPos.call(view));
      }
    } else {
      if (this._topView !== null) {
        this._topView.drawMessageView(isTopActive, this._topView.getMessagePos());
      }

      if (this._centerView !== null) {
        this._centerView.drawMessageView(isCenterActive, this._centerView.getMessagePos());
      }

      if (this._bottomView !== null) {
        this._bottomView.drawMessageView(isBottomActive, this._bottomView.getMessagePos());
      }
    }
  };

  var _FaceView_eraseMessage = FaceView.eraseMessage;
  FaceView.eraseMessage = function (flag) {
    _FaceView_eraseMessage.call(this, flag);
    this._activeSecondPos = MessagePos.NONE;
  };
})();

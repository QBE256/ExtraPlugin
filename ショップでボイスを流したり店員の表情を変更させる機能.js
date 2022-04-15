/*--------------------------------------------------------------------------
　店員の表情変更させる&ボイスを流す ver 1.0

■作成者
キュウブ

■概要
ショップで各メッセージごとにボイスを流したり、店員の表情を変える事ができるようになります。

■使い方
1.ボイスを流す
通常メッセージでボイスを流す場合と同じ方法で設定可能です。
テキスト内に
\vo[<ファイル名(拡張子は省略)>]
という制御文字を設定すればOKです。

2.表情を変更させる
テキスト内に
\fa[<左端を0番目とした場合、何番目の表情か記入>][<上端を0番目とした場合、何番目の表情か記入>]
という制御文字を記入します。
例えば、ランタイムのスキンヘッドの画像が設定されている状態で
\fa[1][3]とした場合は竜が表示されます。

■更新履歴
ver 1.0 (2022/04/16)
公開

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

(function () {
	var _ShopLayoutScreen__createShopMessageTable = ShopLayoutScreen._createShopMessageTable;
	ShopLayoutScreen._createShopMessageTable = function (shopLayout) {
		_ShopLayoutScreen__createShopMessageTable.apply(this, arguments);
		this._shopMessageTable.FirstMessage = this._setMessageInfo(shopLayout.getMessage(0));
		this._shopMessageTable.QuestionBuy = this._setMessageInfo(shopLayout.getMessage(1));
		this._shopMessageTable.QuestionSell = this._setMessageInfo(shopLayout.getMessage(2));
		this._shopMessageTable.SelectQuestion = this._setMessageInfo(shopLayout.getMessage(3));
		this._shopMessageTable.OtherMessage = this._setMessageInfo(shopLayout.getMessage(4));
		this._shopMessageTable.EndBuy = this._setMessageInfo(shopLayout.getMessage(5));
		this._shopMessageTable.EndSell = this._setMessageInfo(shopLayout.getMessage(6));
		this._shopMessageTable.NoGold = this._setMessageInfo(shopLayout.getMessage(7));
		this._shopMessageTable.ItemFull = this._setMessageInfo(shopLayout.getMessage(8));
		this._shopMessageTable.ForceStock = this._setMessageInfo(shopLayout.getMessage(9));
		this._shopMessageTable.NoSell = this._setMessageInfo(shopLayout.getMessage(10));
		this._shopMessageTable.NoItemBring = this._setMessageInfo(shopLayout.getMessage(11));
	};

	var _ShopLayoutScreen__startMessage = ShopLayoutScreen._startMessage;
	ShopLayoutScreen._startMessage = function (messageInfo, mode) {
		if (typeof messageInfo !== "object") {
			_ShopLayoutScreen__startMessage.apply(this, arguments);
			return;
		}

		if (messageInfo.voiceFile) {
			root.getMaterialManager().voiceStop(1, true);
			root.getMaterialManager().voicePlay(
				DataConfig.getVoiceCategoryName(),
				messageInfo.voiceFile,
				1
			);
		}

		this._keeperWindow._setFaceExpression(messageInfo.faceExpression);
		this._keeperWindow.setShopMessage(messageInfo.filteredMessage);
		this.changeCycleMode(ShopLayoutMode.MESSAGE);
		this._nextmode = mode;
	};

	ShopMessageWindow._faceExpression = null;
	ShopMessageWindow._setFaceExpression = function (faceExpression) {
		this._faceExpression = faceExpression;
	};

	var _ShopMessageWindow__drawKeeperFace = ShopMessageWindow._drawKeeperFace;
	ShopMessageWindow._drawKeeperFace = function (x, y) {
		if (!this._faceExpression) {
			_ShopMessageWindow__drawKeeperFace.apply(this, arguments);
		} else {
			var originalHandle = this.getParentInstance().getShopLayout().getFaceResourceHandle();
			var faceExpressionHandle = root.createResourceHandle(
				originalHandle.getHandleType() === ResourceHandleType.RUNTIME,
				originalHandle.getResourceId(),
				0,
				this._faceExpression[0],
				this._faceExpression[1]
			);
			ContentRenderer.drawFaceFromResourceHandle(x, y, faceExpressionHandle);
		}
	};
})();

ShopLayoutScreen._setMessageInfo = function (originalMessage) {
	var ext = ["ogg", "mp3", "wav"];
	var filteredMessage = originalMessage;
	var voiceRegularExpression = /\\vo\[(.+?)\]/;
	var faceRegularExpression = /\\fa\[(\d+)\]\[(\d+)\]/;
	var voiceFileInfo = filteredMessage.match(voiceRegularExpression);
	var faceExpressionInfo = filteredMessage.match(faceRegularExpression);
	filteredMessage = filteredMessage.replace(voiceRegularExpression, "");
	filteredMessage = filteredMessage.replace(faceRegularExpression, "");

	return {
		filteredMessage: filteredMessage,
		voiceFile: voiceFileInfo
			? voiceFileInfo[1] + "." + ext[DataConfig.getVoiceExtIndex()]
			: null,
		faceExpression: faceExpressionInfo ? [faceExpressionInfo[1], faceExpressionInfo[2]] : null
	};
};

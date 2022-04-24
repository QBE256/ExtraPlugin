/*--------------------------------------------------------------------------
　ユニットコマンド説明スクリプト ver1.0

■作成者
キュウブ

■概要
ユニットコマンドでコマンドにカーソルをあわせた時に各種コマンドの説明文が表示されるようになります。
説明文を変更したい場合は、このスクリプト内のテキストを編集する必要があります。

また、
ユニットイベントのコマンド
フュージョンデータ
形態変化スキル(※形態変化データではない事に注意)
会話イベント
場所イベント(カスタム)
では、それぞれのカスパラに
{
  commandDescriptionText: '<コマンドの説明文>'
}
を設定する事で独自のコマンド説明文に変更する事が可能となります。

■その他のコマンド系スクリプトについて
下記のスクリプトについては対応済みです
マップ設置兵器スクリプト ver1.8以降 (対象武器のカスパラにcommandDescriptionTextを仕込む事で書き換え可)
連携攻撃スクリプト ver0.2以降 (対象フュージョンデータにcommandDescriptionTextを仕込む事で書き換え可)
ワープコマンドスクリプト ver1.1以降 (対象"ダミーアイテム"のカスパラにcommandDescriptionTextを仕込む事で書き換え可)

その他のスクリプトについては
各々のスクリプトのコマンドクラスの中に下記のようなメソッドを追加しないと、空文字か親クラスの説明文が表示されます。
getDescription: function() {
	return '<コマンド説明文>';
}

■対応バージョン
SRPG Studio Version:1.161

■規約
・利用はSRPG Studioを使ったゲームに限ります。
・商用・非商用問いません。フリーです。
・加工等、問題ありません。
・クレジット明記無し　OK (明記する場合は"キュウブ"でお願いします)
・再配布、転載　OK (バグなどがあったらプルリクエストしてくださると嬉しいです)
・wiki掲載　OK
・SRPG Studio利用規約は遵守してください。

------------------------------------------------------*/

UnitListCommand.getDescription = function() {
	return '';
};

UnitCommand.UnitEvent.getDescription = function() {
	var event = this._getEvent();
	return event.custom.commandDescriptionText || '';
};

UnitCommand.Attack.getDescription = function() {
	return '敵と戦闘を行います';
};

UnitCommand.Wand.getDescription = function() {
	return '杖を使ってサポートを行います';
};

UnitCommand.Item.getDescription = function() {
	return 'アイテムを使用します';
};

UnitCommand.Trade.getDescription = function() {
	return '隣接する味方と持ち物を交換します';
};

UnitCommand.Stock.getDescription = function() {
	return 'ストックから持ち物の出し入れを行います';
};

UnitCommand.Wait.getDescription = function() {
	return 'この場に留まり、行動を終了します';
};

UnitCommand.Metamorphoze.getDescription = function() {
	if (!this._skill || typeof this._skill.custom.commandDescriptionText !== 'string') {
		return '形態変化します';
	}
	return this._skill.custom.commandDescriptionText;
};

UnitCommand.MetamorphozeCancel.getDescription = function() {
	return '元の状態に戻ります';
};

UnitCommand.FusionAttack.getDescription = function() {
	return this._fusionData.custom.commandDescriptionText || '敵を捕獲して無力化します';
};

UnitCommand.FusionCatch.getDescription = function() {
	return this._fusionData.custom.commandDescriptionText || '味方を担いで守ります';
};

UnitCommand.FusionUnitTrade.getDescription = function() {
	return '担いでいるユニットを交換します';
};

UnitCommand.FusionRelease.getDescription = function() {
	return '担いでいるユニットを下ろします';
};

UnitCommand.PlaceCommand.getDescription = function() {
	var event = this._getEvent();
	return event.custom.commandDescriptionText || '';
};

UnitCommand.Talk.getDescription = function() {
	var event = this._getTargetEvent();
	return event.custom.commandDescriptionText || '会話を行います';
};

UnitCommand.Steal.getDescription = function() {
	return '敵の所持品を盗みます';
};

UnitCommand.Quick.getDescription = function() {
	return '味方を励まして、もう一度行動可能にします';
};

UnitCommand.Occupation.getDescription = function() {
	return '拠点を制圧します';
};

UnitCommand.Village.getDescription = function() {
	return '村、町、家などを訪問します';
};

UnitCommand.Information.getDescription = function() {
	return '情報収集を行います';
};

UnitCommand.Shop.getDescription = function() {
	return 'お店で買い物をします';
};

UnitCommand.Treasure.getDescription = function() {
	return '宝箱を開けてアイテムを入手します';
};

UnitCommand.Gate.getDescription = function() {
	return '扉を解錠します';
};

(function(){
	UnitCommand._drawTitle = function() {
		var x = this.getPositionX();
		var y = this.getPositionY();
		
		this._commandScrollbar.drawScrollbar(x, y);
		this._drawBottomText();
	};

	UnitCommand._drawBottomText = function() {
		var currentCommand = this._commandScrollbar.getObject();
		var text = currentCommand.getDescription() || '';
		var textui = root.queryScreen('UnitMenu').getBottomFrameTextUI();
		
		TextRenderer.drawScreenBottomText(text, textui);
	};
})();
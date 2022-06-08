/*
  出撃ボイスプラグイン ver1.0
  作成者: キュウブ

  必ずモーションボイス用CSVファイル読み込みプラグインの"ver2.0"以上を導入してください。
  https://raw.githubusercontent.com/QBE256/ExtraPlugin/master/%E3%83%A2%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3%E3%83%9C%E3%82%A4%E3%82%B9%E3%83%97%E3%83%A9%E3%82%B0%E3%82%A4%E3%83%B3/%E3%83%A2%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3%E3%83%9C%E3%82%A4%E3%82%B9CSV%E8%AA%AD%E3%81%BF%E8%BE%BC%E3%81%BF%E3%83%97%E3%83%A9%E3%82%B0%E3%82%A4%E3%83%B3.js

  出撃選択時、キャンセル時にユニットのボイスをつけます。
  <設定方法>
  1.対象ユニット用にCSV形式のファイルを用意します。モーションボイスプラグイン付属のfighterSample.csvかmageSample.csv参照
  https://github.com/QBE256/ExtraPlugin/tree/master/%E3%83%A2%E3%83%BC%E3%82%B7%E3%83%A7%E3%83%B3%E3%83%9C%E3%82%A4%E3%82%B9%E3%83%97%E3%83%A9%E3%82%B0%E3%82%A4%E3%83%B3
  ※CSVファイルはMaterialのUnitVoiceフォルダの中にいれること。
  ※モーションボイスプラグインを使用している場合は同じファイルを編集してください

  2.CSVファイルに対象ユニットのボイス情報を入力する
  CSVファイルは以下のようになっています
  自由記述欄|ボイスタイプ|対応するID|グローバルスイッチID|スイッチのONかOFF|ボイスファイル名1|ボイスファイル名2|...

  3.ボイスタイプに 出撃選択ボイスを設定する場合は selectSortie、出撃キャンセルボイスを設定する場合は cancelSortie と入力します。

  4.対応するIDに 0 と入力します(モーションボイスプラグイン側の都合となります。0以外ではボイスが流れなくなるので注意)

  5.特定条件下で発動させたい場合はグローバルスイッチIDに対象スイッチのIDを、スイッチのオンオフに on か off を入力します。

  6.ファイル名1から順にボイスファイル名を記載します。
  複数設定するとランダムでボイスが流れるようになります。不要の場合はファイル名1だけ設定すればOK
  ※※※注意点※※※
  ボイスファイル名は全て拡張子を抜いて記載してください。
  例.firstFire.wav の場合は 'firstFire'

  7.対象ユニットのカスタムパラメータに対象CSVファイル名を記述します
  voiceFile: '<対象ファイル名>.csv'
  ※モーションボイスプラグインで同カスタムパラメータを設定している場合は設定不要です

  ■更新履歴
  ver 1.0 (2022/6/9)
  初版

  ■規約
  ・利用はSRPG Studioを使ったゲームに限ります。
  ・商用・非商用問いません。フリーです。
  ・加工等、問題ありません。
  ・クレジット明記無し　OK (明記する場合は"キュウブ"でお願いします)
  ・再配布、転載　OK (バグなどがあったら修正できる方はgitでプルリクエストを受け付けてます)
  ・SRPG Studio利用規約は遵守してください。
*/

(function () {
  UnitSortieListScrollbar.playSelectSound = function () {
    var object = this.getObject();
    var isSelect = true;

    if (this._isForceSortie(object)) {
      isSelect = false;
    } else if (!this._isSortie(object)) {
      isSelect = false;
    } else if (
      SceneManager.getActiveScene().getSortieSetting().getSortieCount() ===
      root.getCurrentSession().getCurrentMapInfo().getSortieMaxCount()
    ) {
      if (object.getSortieState() === SortieType.SORTIE) {
        isSelect = true;
      } else {
        isSelect = false;
      }
    }

    if (isSelect) {
      MediaControl.soundDirect("commandselect");
    } else {
      MediaControl.soundDirect("operationblock");
    }

    if (isSelect) {
      if (object.getSortieState() !== SortieType.SORTIE) {
        this._playSelectVoice(VoiceType.SELECT_SORTIE);
      } else {
        this._playSelectVoice(VoiceType.CANCEL_SORTIE);
      }
    }
  };

  UnitSortieListScrollbar._playSelectVoice = function (voiceType) {
    var object = this.getObject();
    var templateVoices = getVoices(object, voiceType);
    var motionVoices = templateVoices.filter(getCorrespondingRows, {
      correspondingId: 0
    });
    if (motionVoices.length === 0) {
      return;
    }
    var voiceFiles = motionVoices[0].filter(getVoiceFiles);
    if (voiceFiles.length === 0) {
      return;
    }
    var voiceIndex = root.getRandomNumber() % voiceFiles.length;
    var ext = getVoiceExtension(DataConfig.getVoiceExtIndex());
    var fileName = voiceFiles[voiceIndex] + "." + ext;
    var folderName = DataConfig.getVoiceCategoryName();
    root.getMaterialManager().voiceStop(1, false);
    root.getMaterialManager().voicePlay(folderName, fileName, 1);
  };
})();
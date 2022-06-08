/*
リアル戦闘時のボイスをつける ver1.0
作成者:キュウブ

※モーションボイス用CSVファイル読み込みプラグインと併用してください

戦闘時の各種モーションにボイスをつけます。
魔法攻撃に関しては魔法毎にボイスを分ける事も可能です。

<設定方法>
1.CSV形式のファイルを用意します。付属のfighterSample.csvかmageSample.csvをコピペしてください。
※CSVファイルはMaterialのUnitVoiceフォルダの中にいれること。

2.CSVファイルに対象ユニットのボイス情報を入力する
CSVファイルは以下のようになっています
自由記述欄|ボイスタイプ|対応するID|グローバルスイッチID|スイッチのONかOFF|ボイスファイル名1|ボイスファイル名2|...

2-1.魔法陣発動時のボイス設定方法
・ボイスタイプに invocationMagic と入力します。
・対応するIDに 対象魔法のID を入力します。
・特定条件下で発動させたい場合はグローバルスイッチIDに対象スイッチのIDを、スイッチのオンオフに on か off を入力します。
・ファイル名1から順にボイスファイル名を記載します(1回目の攻撃はファイル名1,2回目の攻撃はファイル名2,...のボイスが流れます)

※※※注意点※※※
ボイスファイル名は全て拡張子を抜いて記載してください。
例.firstFire.wav の場合は 'firstFire'

2-2.魔法攻撃発動時のボイス設定方法
・ボイスタイプに attackMagic と入力します。
・対応するIDに 対象魔法のID を入力します。
・特定条件下で発動させたい場合はグローバルスイッチIDに対象スイッチのIDを、スイッチのオンオフに on か off を入力します。
・ファイル名1から順にボイスファイル名を記載します(1回目の攻撃はファイル名1,2回目の攻撃はファイル名2,...のボイスが流れます)

2-3.物理、弓ユニットのボイス設定方法
・ボイスタイプに 物理の場合は fighterMotion 弓の場合は archerMotion と入力します。
・対応するIDに 対象のモーションID を入力します。
・特定条件下で発動させたい場合はグローバルスイッチIDに対象スイッチのIDを、スイッチのオンオフに on か off を入力します。
・ファイル名1から順にボイスファイル名を記載します(攻撃時にランダムでボイスファイルが選択されます)

2-4.魔法ユニットの魔法攻撃以外のボイス設定方法
・ボイスタイプに mageMotion と入力します。
・対応するIDに 対象のモーションID を入力します。
・特定条件下で発動させたい場合はグローバルスイッチIDに対象スイッチのIDを、スイッチのオンオフに on か off を入力します。
・ファイル名1から順にボイスファイル名を記載します(攻撃時にランダムでボイスファイルが選択されます)
※攻撃用のモーションIDはattackMagicやinvocationMagicに振ったボイスも同時に流れてしまうので設定しないようにしてください
※回避や被弾モーションで使用される事をおすすめします

3.対象ユニットのカスタムパラメータに対象CSVファイル名を記述します
voiceFile: '<対象ファイル名>.csv'

※とりあえず試したい場合は付属のfighterSample.csvやmageSample.csvにボイスファイルを設定して使用してみてください

■更新履歴
ver 1.0 (2022/2/9)
初版

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
*/

(function () {
  var _AnimeMotion__setFrame = AnimeMotion._setFrame;
  AnimeMotion._setFrame = function (frameIndex) {
    this._checkVoice();
    _AnimeMotion__setFrame.call(this, frameIndex);
  };

  AnimeMotion._checkVoice = function () {
    var templateType, templateVoices, motionVoices, voiceFiles, motionId;
    var voiceIndex = 0;
    if (!this._unit) {
      return;
    }
    if (this._frameIndex !== 0) {
      return;
    }
    templateType = this._animeData.getAttackTemplateType();
    if (templateType === AttackTemplateType.FIGHTER) {
      templateVoices = getVoices(this._unit, VoiceType.FIGHTER_MOTION);
    } else if (templateType === AttackTemplateType.ARCHER) {
      templateVoices = getVoices(this._unit, VoiceType.ARCHER_MOTION);
    } else {
      templateVoices = getVoices(this._unit, VoiceType.MAGE_MOTION);
    }

    motionId = this._motionId;
    motionVoices = templateVoices.filter(getCorrespondingRows, { correspondingId: motionId });
    if (motionVoices.length === 0) {
      return;
    }
    voiceFiles = motionVoices[0].filter(getVoiceFiles);
    if (voiceFiles.length === 0) {
      return;
    }
    voiceIndex = root.getRandomNumber() % voiceFiles.length;
    root.getMaterialManager().voiceStop(1, false);
    root.getMaterialManager().voicePlay(
      DataConfig.getVoiceCategoryName(),
      voiceFiles[voiceIndex] + "." + getVoiceExtension(DataConfig.getVoiceExtIndex()),
      1
    );
  };

  BaseBattler._attackCount = 0;
  var _MagicBattler__createInvocationEffect = MagicBattler._createInvocationEffect;
  MagicBattler._createInvocationEffect = function () {
    var voiceFiles;
    var voiceIndex = 0;
    var weaponId = BattlerChecker.getRealBattleWeapon(this._unit).getId();
    var templateVoices = getVoices(this._unit, VoiceType.INVOCATION_MAGIC);
    var weaponVoices = templateVoices.filter(getCorrespondingRows, { correspondingId: weaponId });
    _MagicBattler__createInvocationEffect.call(this);
    if (weaponVoices.length === 0) {
      return;
    }
    voiceFiles = weaponVoices[0].filter(getVoiceFiles);
    if (voiceFiles.length === 0) {
      return;
    }
    voiceIndex = this._attackCount % voiceFiles.length;
    root.getMaterialManager().voiceStop(1, false);
    root.getMaterialManager().voicePlay(
      DataConfig.getVoiceCategoryName(),
      voiceFiles[voiceIndex] + "." + getVoiceExtension(DataConfig.getVoiceExtIndex()),
      1
    );
  };

  var _MagicBattler__createMagicEffect = MagicBattler._createMagicEffect;
  MagicBattler._createMagicEffect = function () {
    var voiceFiles;
    var voiceIndex = 0;
    var weaponId = BattlerChecker.getRealBattleWeapon(this._unit).getId();
    var templateVoices = getVoices(this._unit, VoiceType.ATTACK_MAGIC);
    var weaponVoices = templateVoices.filter(getCorrespondingRows, { correspondingId: weaponId });
    _MagicBattler__createMagicEffect.call(this);
    if (weaponVoices.length === 0) {
      return;
    }
    voiceFiles = weaponVoices[0].filter(getVoiceFiles);
    if (voiceFiles.length === 0) {
      return;
    }
    voiceIndex = this._attackCount % voiceFiles.length;
    root.getMaterialManager().voiceStop(1, false);
    root.getMaterialManager().voicePlay(
      DataConfig.getVoiceCategoryName(),
      voiceFiles[voiceIndex] + "." + getVoiceExtension(DataConfig.getVoiceExtIndex()),
      1
    );
    this._attackCount++;
  };
})();

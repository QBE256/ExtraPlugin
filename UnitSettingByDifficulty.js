/*--------------------------------------------------------------------------
　敵ユニットの所持品、スキル等を難易度毎に変更する ver 1.0

■作成者
キュウブ

■概要
これは難易度に応じて、敵ユニットのスキル、所持品等も変えたい時に使うためのプラグインです。

このプラグイン自体は難易度に応じて、他マップの敵ユニットの設定を現在のマップの敵ユニットにコピーするというものです。
つまり、他マップに他難易度用の敵ユニットを設定しておく事で、難易度毎に細かい調整が可能になります。

ただし、コピー可能なのは初期配置の敵ユニットのみです。イベント敵、援軍の設定まではできません。
また、コピーされる設定は以下のものに限られます。
・マップ上の初期配置
・レベル
・クラス
・重要度
・追加スキル
・HP、力~体格までの各種パラメータ
・アイテムリスト

■使い方
1.コピペ用のマップを用意します ※元マップと縦横の大きさが同じであれば、どんなマップであろうと構いません
ここに元マップと同じIDの該当難易度用に設定した敵ユニットを配置します。

※元マップのID:0番の敵はコピペ用マップのID:0番の敵をコピー、
元マップのID:1番の敵はコピペ用マップのID:1番の敵をコピー…していきます。
よって、元マップの同じ数、同じIDの敵ユニットを置いておく必要があります。

2.ゲームで使用するためのマップのカスタムパラメータに以下を入力します。
difficultlySettings:[
	{
		difficultlyId:<難易度のID>,
		mapId:<1で作ったコピー元のマップID>
	}
];

例.
下記のような場合は
難易度ID:1の時はマップID:20の敵を、
難易度ID:2の時はマップID:21の敵を、
難易度ID:4の時はマップID:22の敵をコピーするようになります。
difficultlySettings:[
	{
		difficultlyId:1,
		mapId:20
	},
	{
		difficultlyId:2,
		mapId:21
	},
	{
		difficultlyId:4,
		mapId:22
	}
];

■ Q&A
Q.敵ユニットを増やしたり、減らしたい
A.そこまでは対応していないので、元マップに登場条件をつけてうまくやってください。

Q.ユニットイベントや行動パターンはコピーできないのか？
A.
名前と説明の2項目に関しては需要が限られていると判断してあえてやってないです。
イベントや行動パターンや支援などをコピーするのは不可能です。
元マップの敵のユニットの設定で難易度毎に設定するなどして上手くやってください。

Q.せめて特定のカスタムパラメーターだけでも難易度別に変えたい
A.
OpeningEventFlowEntry._copyExtraMapUnitの中に
下記の3行を入れればコピー元のカスタムパラメータを持ってくる事ができます。
if (('<コピーしたいカスタムパラメータ>' in sourceUnit.custom)) {
	unit.custom.<コピーしたいカスタムパラメータ> = sourceUnit.custom.<コピーしたいカスタムパラメータ>;
}

例えば、hogeというカスタムパラメータをコピーしたい場合は…
if (('hoge' in sourceUnit.custom)) {
	unit.custom.hoge = sourceUnit.custom.hoge;
}

Q.使いにくい
A.これ以上はプラグイン側だけで設定を簡略化できる気がしないっす…

■更新履歴
ver 1.0 (2021/02/28)
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

(function(){
	OpeningEventFlowEntry._difficultySettingEnemyList = null;
	OpeningEventFlowEntry._difficultySettingEventGenerator = null;
	var temp1 = OpeningEventFlowEntry._completeMemberData;
	OpeningEventFlowEntry._completeMemberData = function(battleSetupScene) {
		var difficultySettingMapInfo;
		var mapInfo = root.getCurrentSession().getCurrentMapInfo();
		
		this._difficultySettingEventGenerator = root.getEventGenerator();
		if (
			Array.isArray(mapInfo.custom.difficultlySettings) &&
			(difficultySettingMapInfo = this._getDifficultySettingMapInfo(mapInfo.custom.difficultlySettings))
		) {
			this._difficultySettingEnemyList = difficultySettingMapInfo.getListFromUnitGroup(UnitGroup.ENEMY);
		}

		return temp1.call(this, battleSetupScene);
	};

	OpeningEventFlowEntry._getDifficultySettingMapInfo = function(difficultlySettings) {
		var currentDifficultlyId = root.getMetaSession().getDifficulty().getId();
		var targetDifficultSettings = difficultlySettings.filter(
			function(difficultlySetting) {
				return difficultlySetting.difficultlyId === currentDifficultlyId;
			}
		);

		if (targetDifficultSettings.length === 0) {
			return null;
		}

		return root.getBaseData().getMapList().getDataFromId(targetDifficultSettings[0].mapId);
	};

	var temp2 = OpeningEventFlowEntry._resetUnit;
	OpeningEventFlowEntry._resetUnit = function(unit) {
		var sourceUnit = null;
		var unitType = unit.getUnitType();

		if (this._difficultySettingEnemyList && unitType === UnitType.ENEMY) {
			sourceUnit = this._getSourceUnit(unit, this._difficultySettingEnemyList);
		}
		if (sourceUnit) {
			this._copyExtraMapUnit(unit, sourceUnit);
		}

		temp2.call(this, unit);
	};

	OpeningEventFlowEntry._getSourceUnit = function(unit, sourceUnitList) {
		var unitId = unit.getId();
		var sourceUnit = null;
		var count = sourceUnitList.getCount();

		for (var index = 0; index < count; index++) {
			sourceUnit = sourceUnitList.getData(index);
			if (unitId === sourceUnit.getId()) {
				return sourceUnit;
			}
		}

		return null;
	};

	OpeningEventFlowEntry._copyExtraMapUnit = function(unit, sourceUnit) {
		var item;
		var unitSkillList = unit.getSkillReferenceList();
		var unitSkillListCount = unitSkillList.getTypeCount();
		var sourceUnitSkillList = sourceUnit.getSkillReferenceList();
		var sourceUnitSkillListCount = sourceUnitSkillList.getTypeCount();

		unit.setMapX(sourceUnit.getMapX());
		unit.setMapY(sourceUnit.getMapY());
		unit.setClass(sourceUnit.getClass());
		unit.setLv(sourceUnit.getLv());
		unit.setImportance(sourceUnit.getImportance());
		unit.setHp(sourceUnit.getHp());
		for (var index = 0; index < 10; index++) {
			unit.setParamValue(index, sourceUnit.getParamValue(index));
		};
		if (unitSkillListCount > 0) {
			this._difficultySettingEventGenerator.skillChange(unit, unitSkillList.getTypeData(0), IncreaseType.ALLRELEASE, true);
		}
		for (var index = 0; index < sourceUnitSkillListCount; index++) {
			this._difficultySettingEventGenerator.skillChange(unit, sourceUnitSkillList.getTypeData(index), IncreaseType.INCREASE, true);
		};
		for (var index = 0; index < 5; index++) {
			unit.clearItem(index);
			if (item = sourceUnit.getItem(index)) {
				unit.setItem(index, item);
			}
		};
	};

	var temp3 = OpeningEventFlowEntry._checkUnitParameter;
	OpeningEventFlowEntry._checkUnitParameter = function() {
		temp3.call(this);
		this._difficultySettingEventGenerator.execute();
	};
})();

// Array.isArray polyfill
// reference: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray#polyfill
if (!Array.isArray) {
	Array.isArray = function(arg) {
		return Object.prototype.toString.call(arg) === '[object Array]';
	};
}

// Array.prototype.filter polyfil
// reference: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/filter#polyfill
if (!Array.prototype.filter){
	Array.prototype.filter = function(func, thisArg) {
		if ( ! ((typeof func === 'Function' || typeof func === 'function') && this) )
			throw new TypeError();

		var len = this.length >>> 0,
		res = new Array(len), // preallocate array
		t = this, c = 0, i = -1;

		var kValue;
		if (thisArg === undefined){
			while (++i !== len){
				// checks to see if the key was set
				if (i in this){
					kValue = t[i]; // in case t is changed in callback
					if (func(t[i], i, t)){
						res[c++] = kValue;
					}
				}
			}
		}
		else{
			while (++i !== len){
				// checks to see if the key was set
				if (i in this){
					kValue = t[i];
					if (func.call(thisArg, t[i], i, t)){
						res[c++] = kValue;
					}
				}
			}
		}

		res.length = c; // shrink down array to proper size
    	return res;
	};
}
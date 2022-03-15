/*--------------------------------------------------------------------------
　特定キーを押している間、ウィンドウの表示情報を切り替える ver1.0

■作成者
キュウブ

■概要
vキーを押している間、マップ攻略中に表示されるウィンドウ情報が下記のように切り替わります

ユニットウィンドウ
・装備武器の名前
・攻撃力、命中値、必殺値、回避値を表示

地形ウィンドウ
・HP回復量orダメージ量
・地形のカスパラにeffectRemarksを入れた場合はその中身の文章が表示

■地形のカスタムパラメータ(effectRemarks)について
※ effectRemarks:[<1行目の文章>, <2行目の文章>, <3行目の文章>,...,<x行目の文章>] 
というカスパラを入れる事で任意の文章を表示させる事ができあます。
※※例1
effectRemarks:["特別イベント有り"]
と記入すると
対象の地形にカーソルをあわせてvキーを押した時
-------------
特別イベント有り
-------------
という表示が出てきます。

※※例2
effectRemarks:[
	"3ターン後に",
	"特別イベント有り"
]
と記入すると
対象の地形にカーソルをあわせてvキーを押した時
-------------
3ターン後に
特別イベント有り
-------------
という表示が出てきます。

■更新履歴
ver 1.0 (2022/03/16)
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

InputControl.isChangeState = function () {
	return root.isInputState(InputType.BTN4);
};

UnitSimpleRenderer.drawAnotherContentEx = function (x, y, unit, textui, weapon, battleStatus) {
	this._drawFace(x, y, unit, textui);
	this._drawName(x, y, unit, textui);
	this._drawEquippedWeaponInfo(x, y, unit, textui, weapon);
	this._drawStatusInfo(x, y, unit, textui, battleStatus);
};

UnitSimpleRenderer._drawEquippedWeaponInfo = function (x, y, unit, textui, weapon) {
	var length = this._getTextLength();
	var color = textui.getColor();
	var font = textui.getFont();

	x += GraphicsFormat.FACE_WIDTH + this._getInterval();
	y += 40;
	if (weapon) {
		TextRenderer.drawAlphaText(x, y, weapon.getName(), length, color, 255, font);
	} else {
		TextRenderer.drawAlphaText(x, y, "NO WEAPON", length, color, 255, font);
	}
};

UnitSimpleRenderer._drawStatusInfo = function (x, y, unit, textui, battleStatus) {
	var length = this._getTextLength();
	var color = textui.getColor();
	var font = textui.getFont();
	var adjustNumberPosition = -1;

	x += GraphicsFormat.FACE_WIDTH + this._getInterval();
	y += 58;

	TextRenderer.drawSignText(x, y, "ATK");
	NumberRenderer.drawNumber(x + 42, y + adjustNumberPosition, battleStatus.power);
	TextRenderer.drawSignText(x + 62, y, "HIT");
	NumberRenderer.drawNumber(x + 104, y + adjustNumberPosition, battleStatus.hit);
	y += 18;
	TextRenderer.drawSignText(x, y, "CRI");
	NumberRenderer.drawNumber(x + 42, y + adjustNumberPosition, battleStatus.critical);
	TextRenderer.drawSignText(x + 62, y, "AVO");
	NumberRenderer.drawNumber(x + 104, y + adjustNumberPosition, battleStatus.avoid);
};

(function () {
	MapParts.UnitInfo._weapon = null;
	MapParts.UnitInfo._battleStatus = null;
	var _MapParts_UnitInfo_setUnit = MapParts.UnitInfo.setUnit;
	MapParts.UnitInfo.setUnit = function (unit) {
		var supportStatus;
		if (unit) {
			supportStatus = SupportCalculator.createTotalStatus(unit);
			this._weapon = ItemControl.getEquippedWeapon(unit);
			this._battleStatus = {
				power: 0,
				hit: 0,
				critical: 0,
				avoid: AbilityCalculator.getAvoid(unit) + supportStatus.avoidTotal
			};
			if (this._weapon) {
				this._battleStatus.power = AbilityCalculator.getPower(unit, this._weapon) + supportStatus.powerTotal;
				this._battleStatus.hit = AbilityCalculator.getHit(unit, this._weapon) + supportStatus.hitTotal;
				this._battleStatus.critical =
					AbilityCalculator.getCritical(unit, this._weapon) + supportStatus.criticalTotal;
			}
		}
		_MapParts_UnitInfo_setUnit.apply(this, arguments);
	};
	var _MapParts_UnitInfo__drawContent = MapParts.UnitInfo._drawContent;
	MapParts.UnitInfo._drawContent = function (x, y, unit, textui) {
		if (InputControl.isChangeState()) {
			UnitSimpleRenderer.drawAnotherContentEx(x, y, unit, textui, this._weapon, this._battleStatus);
		} else {
			_MapParts_UnitInfo__drawContent.apply(this, arguments);
		}
	};

	var _MapParts_Terrain__drawContent = MapParts.Terrain._drawContent;
	MapParts.Terrain._drawContent = function (x, y, terrain) {
		var text, recoveryValue, effectRemarks, isSpecialEffect;
		var textui = this._getWindowTextUI();
		var font = textui.getFont();
		var color = textui.getColor();
		var length = this._getTextLength();

		if (!InputControl.isChangeState() || !terrain) {
			_MapParts_Terrain__drawContent.apply(this, arguments);
			return;
		}

		x += 2;
		TextRenderer.drawText(x, y, terrain.getName(), length, color, font);
		recoveryValue = terrain.getAutoRecoveryValue();
		effectRemarks = Array.isArray(terrain.custom.effectRemarks) ? terrain.custom.effectRemarks : [];
		isSpecialEffect = recoveryValue !== 0 || effectRemarks.length > 0;

		if (!isSpecialEffect) {
			y += this.getIntervalY();
			ItemInfoRenderer.drawKeyword(x, y, "特殊効果なし");
			return;
		}
		if (recoveryValue > 0) {
			y += this.getIntervalY();
			ItemInfoRenderer.drawKeyword(x, y, "HP回復");
			NumberRenderer.drawNumber(x + 85, y, recoveryValue);
		} else {
			y += this.getIntervalY();
			ItemInfoRenderer.drawKeyword(x, y, "ダメージ");
			NumberRenderer.drawNumber(x + 85, y, -1 * recoveryValue);
		}
		for (var index = 0; index < effectRemarks.length; index++) {
			y += this.getIntervalY();
			TextRenderer.drawSignText(x, y, effectRemarks[index]);
		}
	};

	var _MapParts_Terrain__getPartsCount = MapParts.Terrain._getPartsCount;
	MapParts.Terrain._getPartsCount = function (terrain) {
		var count;

		if (!InputControl.isChangeState()) {
			return _MapParts_Terrain__getPartsCount.apply(this, arguments);
		}

		count = 3;
		if (Array.isArray(terrain.custom.effectRemarks)) {
			count += terrain.custom.effectRemarks.length;
		}
		return count;
	};
})();

// Array.isArray polyfill
// reference: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray#polyfill
if (!Array.isArray) {
	Array.isArray = function (arg) {
		return Object.prototype.toString.call(arg) === "[object Array]";
	};
}

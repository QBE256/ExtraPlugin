/*--------------------------------------------------------------------------
　簡易戦闘で詳細情報を表示する ver 1.2

■作成者
キュウブ

■概要
このスクリプトを導入すると簡易戦闘で、
相手に与えるダメージ、命中率、必殺率が表示されるようになります。

■更新履歴
ver 1.2 2022/09/18
下記に加え、味方ステータスと敵ステータスの表示が逆転するケースが残っていたので修正

ver 1.1 2022/09/05
敵から攻撃を受けた時に味方ステータスと敵ステータスの表示が逆転しているバグを修正

ver 1.0 2022/04/09

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

--------------------------------------------------------------------------*/

var EasyAttackInfoWindow = defineObject(BaseWindow, {
	_leftInfo: null,
	_rightInfo: null,

	// attackUnit　攻撃する側　targetUnit：攻撃される側
	setInfo: function (attackUnit, targetUnit) {
		var attackInfo = this.getParentInstance().getAttackInfo();
		var attackWeapon = BattlerChecker.getRealBattleWeapon(attackUnit);
		var targetWeapon = BattlerChecker.getRealBattleWeapon(targetUnit);
		// isUnitSrcPriority…優先位置表示対象(ウインドウ左側に出す)か否か
		// 左側表示の優先順位は下記の法則に従う(singleton-system.js参照)
		// 自軍 > 敵軍
		// 自軍 > 同盟軍
		// 同盟軍 > 敵軍
		var isUnitSrcPriority = Miscellaneous.isUnitSrcPriority(attackUnit, targetUnit);
		var enabledLeftAttack = isUnitSrcPriority || attackInfo.isCounterattack;
		var enabledRightAttack = !isUnitSrcPriority || attackInfo.isCounterattack;
		// 攻撃可能なら、攻撃する側が優先表示対象(Priority:true)かを判定する。
		// 優先表示対象の場合、攻撃する側の戦闘情報を表示し、
		// 優先表示対象でない場合、攻撃される側の戦闘情報を表示する。
		var leftStatuses = enabledLeftAttack
			? isUnitSrcPriority
				? AttackChecker.getAttackStatusInternal(attackUnit, attackWeapon, targetUnit)
				: AttackChecker.getAttackStatusInternal(targetUnit, targetWeapon, attackUnit)
			: AttackChecker.getNonStatus();
		// 右側表示の場合は、優先位置である左側とは逆の条件で判定する。
		var rightStatuses = enabledRightAttack
			? !isUnitSrcPriority
				? AttackChecker.getAttackStatusInternal(attackUnit, attackWeapon, targetUnit)
				: AttackChecker.getAttackStatusInternal(targetUnit, targetWeapon, attackUnit)
			: AttackChecker.getNonStatus();

		this._leftInfo = {
			unit: attackUnit,
			statuses: leftStatuses
		};
		this._rightInfo = {
			unit: targetUnit,
			statuses: rightStatuses
		};
	},

	moveWindowContent: function () {
		return MoveResult.CONTINUE;
	},

	drawWindowContent: function (x, y) {
		this._drawInfo(x, y);
	},

	getWindowWidth: function () {
		return 100;
	},

	getWindowHeight: function () {
		return 100;
	},

	getWindowTextUI: function () {
		return Miscellaneous.getColorWindowTextUI(this._leftInfo.unit);
	},

	_drawWindowInternal: function (x, y, width, height) {
		var pic = null;
		var textui = this.getWindowTextUI();

		if (textui !== null) {
			pic = root.getBaseData().getUIResourceList(UIType.MENUWINDOW, true).getDataFromId(0);
		}

		if (pic !== null) {
			WindowRenderer.drawStretchWindow(x, y, width, height, pic);
		}
	},

	_drawInfo: function (xBase, yBase) {
		var positionX = xBase;
		var positionY = yBase;
		var textui = root.queryTextUI("easyattack_window");
		var color = textui.getColor();
		var font = TextRenderer.getDefaultFont();
		var textWidth = this.getWindowWidth() - this.getWindowXPadding() * 2;
		var textHeight = this.getWindowYPadding();
		var leftNumberX = positionX + Math.floor(this.getWindowXPadding() / 2);
		var rightNumberX = positionX + this.getWindowWidth() - this.getWindowXPadding() * 3 - 2;
		var statusNames = ["attack_capacity", "hit_capacity", "critical_capacity"];

		for (var index = 0; index < 3; index++) {
			var range = createRangeObject(positionX, positionY + 10, textWidth, textHeight);
			var statusName = root.queryCommand(statusNames[index]);
			var leftValue = this._leftInfo.statuses[index];
			var rightValue = this._rightInfo.statuses[index];
			TextRenderer.drawRangeText(range, TextFormat.CENTER, statusName, -1, color, font);
			this._drawStatusValue(leftNumberX, positionY, leftValue, color, font, true);
			this._drawStatusValue(rightNumberX, positionY, rightValue, color, font, false);
			positionY += 20;
		}
	},

	_drawStatusValue: function (x, y, value, color, font, isLeft) {
		if (isLeft) {
			if (value < 0) {
				TextRenderer.drawText(x - 5, y + 10, StringTable.SignWord_Limitless, -1, color, font);
			} else {
				NumberRenderer.drawNumberColor(x, y + 5, value, 0, 255);
			}
		} else {
			if (value < 0) {
				TextRenderer.drawText(x + 5, y + 10, StringTable.SignWord_Limitless, -1, color, font);
			} else {
				NumberRenderer.drawRightNumberColor(x, y + 5, value, 0, 255);
			}
		}
	}
});

(function () {
	EasyAttackMenu._infoWindow = null;
	EasyBattle.getAttackInfo = function () {
		return this._attackInfo;
	};
	EasyAttackMenu.getAttackInfo = function () {
		return this._attackInfo;
	};
	EasyAttackMenu._attackInfo = null;
	var _EasyAttackMenu_setMenuUnit = EasyAttackMenu.setMenuUnit;
	// 新たに第3引数を設定しているが、
	// 元々コアスクリプトではsetMenuUnit呼び出し時に第3引数にEasyBattleクラスが渡されている
	// 引数を渡すだけで使われていなかったが、本スクリプトではattackInfoを参照するために利用する
	EasyAttackMenu.setMenuUnit = function (unitSrc, unitDest, easyBattle) {
		_EasyAttackMenu_setMenuUnit.apply(this, arguments);
		this._attackInfo = easyBattle.getAttackInfo();
		this._infoWindow = createWindowObject(EasyAttackInfoWindow, this);
		this._infoWindow.setInfo(unitSrc, unitDest);
	};

	EasyAttackMenu.drawWindowManager = function () {
		var leftWindowX = this.getPositionWindowX();
		var windowY = this.getPositionWindowY();
		var infoWindowX = leftWindowX + this._leftWindow.getWindowWidth() + this._getWindowInterval();
		var rightWindowX = infoWindowX + this._infoWindow.getWindowWidth() + this._getWindowInterval();

		this._leftWindow.drawWindow(leftWindowX, windowY);
		this._infoWindow.drawWindow(infoWindowX, windowY);
		this._rightWindow.drawWindow(rightWindowX, windowY);
	};

	var _EasyAttackMenu_getTotalWindowWidth = EasyAttackMenu.getTotalWindowWidth;
	EasyAttackMenu.getTotalWindowWidth = function () {
		return (
			_EasyAttackMenu_getTotalWindowWidth.apply(this, arguments) + this._infoWindow.getWindowWidth()
		);
	};
})();

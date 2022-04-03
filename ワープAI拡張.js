/*--------------------------------------------------------------------------
　ワープのCPU AI拡張 ver1.0

■作成者
キュウブ

■概要
CPUがワープアイテムを使用する場合、
デフォルトでは射程範囲に敵勢力ユニットがいた場合に、そのユニットに隣接させるように瞬間移動させます。

このスクリプトを導入した場合、
敵勢力ユニットがいるかどうかに関わらず指定した地点に瞬間移動させる事ができるようになります。

■使い方
ワープアイテムを所持するユニットに以下のようなカスタムパラメータを設定します。
{
	teleportationPosition: {
		type: <絶対座標指定の場合は0, 相対座標指定の場合は1>,
		x: <x座標>,
		y: <y座標>
	}
}

※わかる人向け
typeは本スクリプト内でグローバルで定数定義しています。
TeleportationPositionType.ABSOLUTE もしくは TeleportationPositionType.RELATIVE でも設定可能です

例1.マップの(3, 0)の位置に飛ばしたい
下記のように設定すると(3,0)の位置(届かない場合はその周辺)に瞬間移動させるような行動をとるようになります。
teleportationPosition: {
	type: 0,
	x: 3,
	y: 0
}

例2.ワープアイテムを持っているユニットから4マス下に飛ばしたい
下記のように設定すると対象ユニットの4マス下(到達不能の場合はその周辺)に瞬間移動させるような行動をとるようになります。
teleportationPosition: {
	type: 1,
	x: 0,
	y: 4
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

var TeleportationPositionType = {
	ABSOLUTE: 0,
	RELATIVE: 1
};

(function () {
	var _TeleportationControl_getTeleportationPos = TeleportationControl.getTeleportationPos;
	TeleportationControl.getTeleportationPos = function (unit, targetUnit, item) {
		var targetPosition;
		var teleportationInfo = item.getTeleportationInfo();
		var rangeType = teleportationInfo.getRangeType();
		var parentIndexArray = null;

		if (typeof unit.custom.teleportationPosition === "object") {
			targetPosition = TeleportationItemAI._getTargetPosition(unit);
			if (rangeType === SelectionRangeType.MULTI) {
				parentIndexArray = IndexArray.getBestIndexArray(
					unit.getMapX(),
					unit.getMapY(),
					1,
					teleportationInfo.getRangeValue()
				);
				return this._isTeleportationTargetPostion(
					targetPosition.x,
					targetPosition.y,
					targetUnit,
					parentIndexArray
				)
					? createPos(targetPosition.x, targetPosition.y)
					: PosChecker.getNearbyPosFromSpecificPos(
							targetPosition.x,
							targetPosition.y,
							targetUnit,
							parentIndexArray
					  );
			} else if (rangeType === SelectionRangeType.ALL) {
				return this._isTeleportationTargetPostion(
					targetPosition.x,
					targetPosition.y,
					targetUnit,
					parentIndexArray
				)
					? createPos(targetPosition.x, targetPosition.y)
					: PosChecker.getNearbyPosFromSpecificPos(
							targetPosition.x,
							targetPosition.y,
							targetUnit,
							parentIndexArray
					  );
			}
		}

		return _TeleportationControl_getTeleportationPos.apply(this, arguments);
	};

	TeleportationControl._isTeleportationTargetPostion = function (
		x,
		y,
		targetUnit,
		parentIndexArray
	) {
		if (!PosChecker.getMovePointFromUnit(x, y, targetUnit)) {
			return false;
		}
		if (parentIndexArray !== null && !IndexArray.findPos(parentIndexArray, x, y)) {
			return false;
		}
		if (PosChecker.getUnitFromPos(x, y) !== null) {
			return false;
		}
		return true;
	};

	TeleportationItemAI._getTargetPosition = function (unit) {
		var targetPostion = {
			x: 0,
			y: 0
		};
		var positionType = unit.custom.teleportationPosition.type;
		var mapInfo = root.getCurrentSession().getCurrentMapInfo();
		var boundaryValue = root.getCurrentSession().getMapBoundaryValue();
		var leftEdgePosition = boundaryValue;
		var topEdgePosition = boundaryValue;
		var rightEdgePosition = mapInfo.getMapWidth() - boundaryValue - 1;
		var bottomEdgePosition = mapInfo.getMapHeight() - boundaryValue - 1;
		if (positionType === TeleportationPositionType.ABSOLUTE) {
			targetPostion.x = unit.custom.teleportationPosition.x;
			targetPostion.y = unit.custom.teleportationPosition.y;
		} else {
			targetPostion.x = unit.custom.teleportationPosition.x + unit.getMapX();
			targetPostion.y = unit.custom.teleportationPosition.y + unit.getMapY();
		}
		if (targetPostion.x < leftEdgePosition) {
			targetPostion.x = leftEdgePosition;
		} else if (targetPostion.x > rightEdgePosition) {
			targetPostion.x = rightEdgePosition;
		}
		if (targetPostion.y < topEdgePosition) {
			targetPostion.y = topEdgePosition;
		} else if (targetPostion.y > bottomEdgePosition) {
			targetPostion.y = bottomEdgePosition;
		}
		return targetPostion;
	};

	var _TeleportationItemAI__isTeleportationEnabled = TeleportationItemAI._isTeleportationEnabled;
	TeleportationItemAI._isTeleportationEnabled = function (unit, combination) {
		var teleportationInfo = combination.item.getTeleportationInfo();
		var rangeType = teleportationInfo.getRangeType();

		if (
			typeof unit.custom.teleportationPosition === "object" &&
			rangeType !== SelectionRangeType.SELFONLY
		) {
			return true;
		} else {
			return _TeleportationItemAI__isTeleportationEnabled.apply(this, arguments);
		}
	};
})();

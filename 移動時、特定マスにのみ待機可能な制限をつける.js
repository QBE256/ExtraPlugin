/*--------------------------------------------------------------------------
　移動時、特定マスにのみ待機可能な制限をつける ver 1.0

■作成者
キュウブ

■概要
※ このスクリプトはユニット選択、コマンド選択、出撃準備で自動イベント発火スクリプト
(https://github.com/QBE256/ExtraPlugin/blob/master/%E8%87%AA%E5%8B%95%E3%82%A4%E3%83%99%E3%83%B3%E3%83%88%E3%82%92%E3%83%A6%E3%83%8B%E3%83%83%E3%83%88%E3%82%92%E6%91%98%E3%81%BE%E3%82%93%E3%81%A0%E6%99%82%E3%80%81%E3%82%B3%E3%83%9E%E3%83%B3%E3%83%89%E9%81%B8%E6%8A%9E%E6%99%82%E3%80%81%E5%87%BA%E6%92%83%E6%BA%96%E5%82%99%E6%99%82%E3%81%AB%E7%99%BA%E7%81%AB.js)
と併用すると使いやすいと思います。（単独でも使用はできます）

自軍ユニットが設定したマス以外に移動できなくなります。
例えば、チュートリアル等のために特定マスだけに移動させたい場合に使用する事を想定しています。

■使い方
■■移動制限のかけ方
移動制限はイベントコマンド->スクリプト実行->コード実行にて以下のどちらかのメソッドを呼び出す事で可能となります。
1.PlaceSelectableControl.setRelativeSelectablePositions(<対象ユニットID>,<移動可能マスの相対座標を詰めた二次元配列>)
こちらでは対象ユニットの位置を(0, 0)とした場合の相対座標で指定が可能です。
※座標は右方向と下方向を正とします

例えば、
PlaceSelectableControl.setRelativeSelectablePositions(2, [[5,0],[4,-1],[3,-2],[2,-3],[1,-4],[0,-5]]);
とやると
2番のユニットを基準に
右に5つ離れたマス、
右に4つ上に1つ離れたマス、
右に3つ上に2つ離れたマス、
右に2つ上に3つ離れたマス、
右に1つ上に4つ離れたマス、
上に5つ離れたマス
の5箇所のマスのみ移動可能となります。

また、ユニットIDは敵、同盟、ゲストユニットになるとエディタで表示されているIDに65536*nだけ加算しなければならないので注意してください。
(正確な値は"ユニット概要"コマンドからの確認を推奨)

2.PlaceSelectableControl.setAbsoluteSelectablePositions(<移動可能マスの絶対座標を詰めた二次元配列>)
こちらはマップの左上のマスを(0, 0)とした場合の絶対座標で指定が可能です。
※座標は右方向と下方向を正とします

例えば、
PlaceSelectableControl.setAbsoluteSelectablePositions([[0,1], [1,0], [2,0], [0,2], [1,1]]);
とやると
マップ左上から数えて、
下に1つ離れたマス、
右に1つ離れたマス、
下に2つ離れたマス、
右に2つ離れたマス、
右に1つ、下に1つ離れたマス
の5箇所のマスのみ移動可能となります。

■■具体的な使用例
例えば、ユニット選択、コマンド選択、出撃準備で自動イベント発火スクリプトと併用します。

以下の設定の自動イベントを作ります

自動イベントA
1.カスパラを autoEventType:0 と設定
2.実行条件をナッシュ-アクティブ、ローカルスイッチAがオフの場合と設定
3.何度でもこのイベンオが実行できるようにイベント実行状態を解除するコマンドを設定
4.イベントコマンド->スクリプト実行->コード実行で下記を追記(ナッシュのIDが0番の場合)
PlaceSelectableControl.setRelativeSelectablePositions(0, [[1,0],[0,-1],[-1,0],[0,1]);

自動イベントB
1.実行条件はナッシュが待機した時
2.ローカルスイッチAをオンにするコマンドを設定

こうする事によって、
ナッシュは周囲1マスにしか移動ができなくなります。
また、移動して待機を行うまで何度でもこのイベントは発生するようになります(自動イベントBが起こるまで自動イベントAが何度も発生する)。

■更新履歴
ver 1.0 (2021/3/5)
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

(function(){
	var temp1 = MapSequenceArea._isPlaceSelectable;
	var temp2 = MapLayer.prepareMapLayer;
	var temp3 = MapLayer.drawUnitLayer;
	var temp4 = PlayerTurn._moveArea;
	var temp5 = MapLayer.moveMapLayer;

	MapSequenceArea._isPlaceSelectable = function() {
		return temp1.call(this) && PlaceSelectableControl.isPlaceSelectable(this._mapCursor.getX(), this._mapCursor.getY());
	};

	MapLayer._placeSelectableCursor = null;
	MapLayer.prepareMapLayer = function() {
		temp2.call(this);
		this._placeSelectableCursor = createObject(PlaceSelectableFocusCursor);
	};

	MapLayer.drawUnitLayer = function() {
		temp3.call(this);

		if (root.getCurrentSession() !== null) {
			this._placeSelectableCursor.drawCursor();
		}
	};

	PlayerTurn._moveArea = function() {
		var result = temp4.call(this);

		if (this.getCycleMode() !== PlayerTurnMode.AREA) {
			PlaceSelectableControl.resetSelectablePositions();
		}

		return result;
	}

	MapLayer.moveMapLayer = function() {
		temp5.call(this);
		this._placeSelectableCursor.moveCursor();
	};
})();

var PlaceSelectableFocusCursor = defineObject(FocusCursor,
{
	drawCursor: function() {
		var session = root.getCurrentSession();
		var width = UIFormat.MAPCURSOR_WIDTH / 2;
		var height = UIFormat.MAPCURSOR_HEIGHT;
		var x = (session.getMapCursorX() * width) - session.getScrollPixelX();
		var y = (session.getMapCursorY() * height) - session.getScrollPixelY();
		var pic = root.queryUI('lockoncursor');
		var selectablePositions = PlaceSelectableControl.getPlaceSelectablePositions();

		if (pic !== null) {
			for (var index = 0; index < selectablePositions.length; index++) {
				x = selectablePositions[index][0] * width - session.getScrollPixelX();
				y = selectablePositions[index][1] * height - session.getScrollPixelY();
				pic.drawParts(x, y, this._mapCursorSrcIndex * width, 0, width, height);
			}
		}
	}
}
);

var PlaceSelectableControl = {
	getPlaceSelectablePositions: function() {
		var selectablePositions = root.getMetaSession().global.selectablePositions;
		if (!Array.isArray(selectablePositions)) {
			selectablePositions = [];
		}
		return selectablePositions;
	},

	isPlaceSelectable: function(x, y) {
		var selectablePositions = root.getMetaSession().global.selectablePositions;

		if (!Array.isArray(selectablePositions)) {
			return true;
		}
		if (selectablePositions.length === 0) {
			return true;
		}
		for (var positionIndex = 0; positionIndex < selectablePositions.length; positionIndex++) {
			if (
				selectablePositions[positionIndex][0] === x &&
				selectablePositions[positionIndex][1] === y
			) {
				return true;
			}
		}
		return false;
	},

	setAbsoluteSelectablePositions: function(selectablePositions) {
		this.resetSelectablePositions();
		if (!Array.isArray(selectablePositions)) {
			return;
		}
		for (var positionIndex = 0; positionIndex < selectablePositions.length; positionIndex++) {
			if (
				Array.isArray(selectablePositions[positionIndex]) &&
				typeof selectablePositions[positionIndex][0] === 'number' &&
				typeof selectablePositions[positionIndex][1] === 'number' &&
				selectablePositions[positionIndex].length === 2
			) {
				root.getMetaSession().global.selectablePositions.push(selectablePositions[positionIndex]);
			}
		}
	},

	setRelativeSelectablePositions: function(unitId, selectablePositions) {
		var unit, targetUnit, filterList, unitListCount, unitPosition;

		this.resetSelectablePositions();
		if (typeof unitId !== 'number' && !Array.isArray(selectablePositions)) {
			return;
		}
		filterList = FilterControl.getAliveListArray(UnitFilterFlag.PLAYER | UnitFilterFlag.ENEMY | UnitFilterFlag.ALLY);
		for (var filterIndex = 0; filterIndex < 3; filterIndex++) {
			unitListCount = filterList[filterIndex].getCount();
			for (var unitListIndex = 0; unitListIndex < unitListCount; unitListIndex++) {
				unit = filterList[filterIndex].getData(unitListIndex);
				if (unit.getId() === unitId) {
					targetUnit = unit;
					break;
				}
			}
			if (targetUnit) {
				break;
			}
		}
		if (!targetUnit) {
			return;
		}
		unitPosition = [targetUnit.getMapX(),targetUnit.getMapY()];
		for (var positionIndex = 0; positionIndex < selectablePositions.length; positionIndex++) {
			if (
				Array.isArray(selectablePositions[positionIndex]) &&
				typeof selectablePositions[positionIndex][0] === 'number' &&
				typeof selectablePositions[positionIndex][1] === 'number' &&
				selectablePositions[positionIndex].length === 2
			) {
				root.getMetaSession().global.selectablePositions.push(
					this._translateFromRelativeToAbsolutePositions(unitPosition, selectablePositions[positionIndex])
				);
			}
		}
	},

	_translateFromRelativeToAbsolutePositions: function(unitPosition, relativePosition) {
		return [unitPosition[0] + relativePosition[0], unitPosition[1] + relativePosition[1]];
	},

	resetSelectablePositions: function() {
		root.getMetaSession().global.selectablePositions = [];
	}
};

// Array.isArray polyfill
// Reference:https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray#polyfill
if (!Array.isArray) {
	Array.isArray = function(value) {
		return Object.prototype.toString.call(value) === '[object Array]';
	};
};
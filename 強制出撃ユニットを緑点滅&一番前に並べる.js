/*--------------------------------------------------------------------------
　出撃ユニット画面で強制出撃ユニットを前方に移動&緑色で点滅 ver 1.0

■作成者
キュウブ

■概要
強制出撃ユニットをユニットリストの前方に表示させます。
また、ユニットの名前が緑色で点滅するようになります。
さらに、カスタムパラメータを設定する事により強制出撃ユニット同士でも並び順を固定化させる事ができます。

並び順を固定化させるためには
ユニットに以下のカスパラを設定します
{forceSortiePriority:<優先度。1以上の数値にしておく>}
ここで設定された数値が大きい順に強制出撃ユニットが並ぶようになります。

例1.主人公を一番前に並べたい場合
主人公のカスパラに下記のように1以上の数値を設定すればOK。
※1以上であれば100でも1000でも問題ありません。
{forceSortiePriority:1}

例2.強制出撃になるユニットは主人公と準主人公で二キャラいる。主人公を一番目、準主人公を二番目で固定させたい場合。
主人公のカスパラを以下のように
{forceSortiePriority:2}
準主人公のカスパラを以下のように
{forceSortiePriority:1}
設定します。主人公の数値を準主人公よりも大きくしておけば問題ありません。

■更新履歴
ver 1.0 2021/04/12

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
	var _UnitSortieScreen__prepareScreenMemberData = UnitSortieScreen._prepareScreenMemberData;
	UnitSortieScreen._prepareScreenMemberData = function (screenParam) {
		UnitProvider.sortSortieUnit();
		_UnitSortieScreen__prepareScreenMemberData.apply(this, arguments);
	};

	UnitSortieListScrollbar._lightUpCycleCounter = null;
	var _UnitSortieListScrollbar_initialize = UnitSortieListScrollbar.initialize;
	UnitSortieListScrollbar.initialize = function () {
		_UnitSortieListScrollbar_initialize.apply(this, arguments);
		this._lightUpCycleCounter = createObject(CycleCounter);
		this._lightUpCycleCounter.setCounterInfo(this._getLightUpFrame());
		this._lightUpCycleCounter.disableGameAcceleration();
	};

	UnitSortieListScrollbar._getLightUpFrame = function () {
		return 90;
	};

	var _UnitSortieListScrollbar_moveInput = UnitSortieListScrollbar.moveInput;
	UnitSortieListScrollbar.moveInput = function () {
		this._lightUpCycleCounter.moveCycleCounter();
		return _UnitSortieListScrollbar_moveInput.apply(this, arguments);
	};

	UnitSortieListScrollbar.drawScrollContent = function (x, y, object, isSelect, index) {
		var length = this._getTextLength();
		var textui = this.getParentTextUI();
		var font = textui.getFont();
		var color = this._getSortieColor(object);
		var alpha = this._getSortieAlpha(object);

		TextRenderer.drawAlphaText(x, y + 5, object.getName(), length, color, alpha, font);
	};

	var _UnitSortieListScrollbar__getSortieColor = UnitSortieListScrollbar._getSortieColor;
	UnitSortieListScrollbar._getSortieColor = function (object) {
		if (this._isForceSortie(object)) {
			return 0x00ff00;
		} else {
			return _UnitSortieListScrollbar__getSortieColor.apply(this, arguments);
		}
	};

	UnitSortieListScrollbar._getSortieAlpha = function (object) {
		var alpha = 255;
		var currentFrame = this._lightUpCycleCounter.getCounter();
		var totalFrame = this._getLightUpFrame();
		var halfFrame = totalFrame / 2;

		if (this._isForceSortie(object)) {
			currentFrame = this._lightUpCycleCounter.getCounter();
			if (currentFrame < halfFrame) {
				alpha = 50 + Math.floor((currentFrame * 205) / halfFrame);
			} else {
				alpha = 255 - Math.floor(((currentFrame - halfFrame) * 205) / halfFrame);
			}
		}

		return alpha;
	};

	UnitProvider.sortSortieUnit = function () {
		var i;
		var unit = null;
		var list = PlayerList.getMainList();
		var count = list.getCount();
		var that = this;

		function exchangeUnit(index) {
			var j, targetUnit, isSortieState;
			var unitState = {
				unit: unit,
				sortiePriority: unit.custom.forceSortiePriority || 0,
				isSortie: true,
				isForceSortie: that._isForceSortie(unit)
			};

			for (j = index; j >= 0; j--) {
				targetUnit = list.getData(j);
				var targetUnitState = {
					unit: targetUnit,
					sortiePriority: targetUnit.custom.forceSortiePriority || 0,
					isSortie: targetUnit.getSortieState() === SortieType.SORTIE,
					isForceSortie: that._isForceSortie(targetUnit)
				};
				var isSortieCondition = !targetUnitState.isSortie;
				var isForceSortieCondition =
					!targetUnitState.isForceSortie && unitState.isForceSortie;
				var isSortiePriorityCondition =
					unitState.isForceSortie &&
					unitState.sortiePriority > targetUnitState.sortiePriority;

				if (isSortieCondition || isForceSortieCondition || isSortiePriorityCondition) {
					list.exchangeUnit(unit, targetUnit);
				} else {
					break;
				}
			}
		}

		for (i = 0; i < count; i++) {
			unit = list.getData(i);
			if (unit.getSortieState() === SortieType.SORTIE) {
				exchangeUnit(i - 1);
			}
		}
	};

	UnitProvider._isForceSortie = function (unit) {
		return SceneManager.getActiveScene().getSortieSetting().isForceSortie(unit);
	};
})();

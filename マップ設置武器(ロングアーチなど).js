/*--------------------------------------------------------------------------

　マップ設置兵器(ロングアーチ等) ver1.2

■作成者
キュウブ

■概要
マップ中に敵味方両者が使用可能な武器が設置された地形を設定する事ができます。
対象の地形の上に立つと攻撃コマンドとは別に、マップ設置兵器で攻撃するコマンドが出現します。

■使い方
地形効果のカスパラに
{installedWeaponId:<設置したい武器のID>}
と入力する。

■注意点
設置兵器地形を別の地形に変更したり、
なんでもない地形を設置兵器地形に変更した場合は正しく動作しなくなる可能性があります。
※通常地形を別の通常地形に変更する分には問題ありません

更新履歴
ver 1.2 2022/03/27
地形情報が存在しない時にエラーが出る不具合を修正

ver 1.1 2022/03/27
コードリファクタリング

ver 1.0 2022/03/26
初版

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

(function () {
	var _CurrentMap_prepareMap = CurrentMap.prepareMap;
	CurrentMap.prepareMap = function () {
		var currentSession, mapInfo;
		this._installedWeaponInfos = [];
		this._isEnableInstalledWeapon = false;
		_CurrentMap_prepareMap.apply(this, arguments);
		currentSession = root.getCurrentSession();
		if (!currentSession) {
			return;
		}
		mapInfo = currentSession.getCurrentMapInfo();
		if (!mapInfo) {
			return;
		}
		if (this._isEnableLoadCurrentMapInstalledWeapon(mapInfo.getId())) {
			this._loadCurrentMapInstalledWeapon();
		} else {
			this._resetCurrentMapInstalledWeaponParamter();
			this._initializeInstalledWeaponInfos();
			this.updateCurrentMapInstalledWeaponParamter(mapInfo.getId());
		}
	};

	var _UnitCommand_configureCommands = UnitCommand.configureCommands;
	UnitCommand.configureCommands = function (groupArray) {
		groupArray.appendObject(UnitCommand.InstalledWeaponAttack);
		_UnitCommand_configureCommands.apply(this, arguments);
	};

	UnitRangePanel._installedWeaponSimulators = [];
	var _UnitRangePanel__setLight = UnitRangePanel._setLight;
	UnitRangePanel._setLight = function (isWeapon) {
		var moveableIndexArray;
		var that = this;
		_UnitRangePanel__setLight.apply(this, arguments);
		if (this._installedWeaponSimulators.length === 0) {
			return;
		}
		if (!isWeapon) {
			this._mapChipLightWeapon.setLightType(MapLightType.RANGE);
		}
		this._installedWeaponSimulators.forEach(function (simulator) {
			var indexArray = simulator.getSimulationWeaponIndexArray();
			that._mapChipLightWeapon.mergeIndexArray(indexArray);
		});
		moveableIndexArray = this._simulator.getSimulationIndexArray();
		this._mapChipLightWeapon.dedupeIndexArray(moveableIndexArray);
	};

	MapChipLight.mergeIndexArray = function (addIndexArray) {
		var mergedIndexArray = this._indexArray.concat(addIndexArray);
		var filterMergedIndexArray = mergedIndexArray.filter(function (
			element,
			index
		) {
			return Number(mergedIndexArray.indexOf(element)) === index;
		});
		this._indexArray = filterMergedIndexArray;
	};

	MapChipLight.dedupeIndexArray = function (targetIndexArray) {
		var dedupedIndexArray = this._indexArray.filter(function (element) {
			return targetIndexArray.indexOf(element) < 0;
		});
		this._indexArray = dedupedIndexArray;
	};

	UnitRangePanel._setInstalledWeaponRangeDatas = function () {
		var that = this;
		var moveableIndexArray = this._simulator.getSimulationIndexArray();
		var attackaleIndexArray = moveableIndexArray.filter(function (index) {
			var x = CurrentMap.getX(index);
			var y = CurrentMap.getY(index);
			var weapon = CurrentMap.getInstalledWeapon(x, y);
			return (
				weapon &&
				!ItemControl.isItemBroken(weapon) &&
				ItemControl.isWeaponAvailable(that._unit, weapon)
			);
		});
		attackaleIndexArray.forEach(function (index) {
			var simulator = root.getCurrentSession().createMapSimulator();
			var x = CurrentMap.getX(index);
			var y = CurrentMap.getY(index);
			var weapon = CurrentMap.getInstalledWeapon(x, y);
			that._unit.setMapX(x);
			that._unit.setMapY(y);
			simulator.disableRestrictedPass();
			simulator.startSimulationWeapon(
				that._unit,
				0,
				weapon.getStartRange(),
				weapon.getEndRange()
			);
			that._installedWeaponSimulators.push(simulator);
		});
		this._unit.setMapX(this._x);
		this._unit.setMapY(this._y);
	};

	UnitRangePanel._setRangeData = function () {
		var attackRange = this.getUnitAttackRange(this._unit);
		var isWeapon = attackRange.endRange !== 0;

		if (isWeapon) {
			this._simulator.startSimulationWeapon(
				this._unit,
				attackRange.mov,
				attackRange.startRange,
				attackRange.endRange
			);
		} else {
			this._simulator.startSimulation(this._unit, attackRange.mov);
		}
		this._setInstalledWeaponRangeDatas();

		this._setLight(isWeapon);
		this._installedWeaponSimulators = [];
	};

	var _MapParts_Terrain__getPartsCount = MapParts.Terrain._getPartsCount;
	MapParts.Terrain._getPartsCount = function (terrain) {
		var count = _MapParts_Terrain__getPartsCount.apply(this, arguments);

		if (typeof terrain.custom.installedWeaponId === "number") {
			count++;
		}

		return count;
	};

	var _MapParts_Terrain__drawContent = MapParts.Terrain._drawContent;
	MapParts.Terrain._drawContent = function (x, y, terrain) {
		var installedWeapon, limit, textui;

		_MapParts_Terrain__drawContent.apply(this, arguments);
		if (!terrain) {
			return;
		}
		if (typeof terrain.custom.installedWeaponId !== "number") {
			return;
		}
		installedWeapon = CurrentMap.getInstalledWeapon(
			this.getMapPartsX(),
			this.getMapPartsY()
		);
		limit = installedWeapon.getLimit();

		x += 2;
		y += this.getIntervalY() * (this._getPartsCount(terrain) - 2);
		ItemInfoRenderer.drawKeyword(x, y, "残数");
		if (ItemControl.isItemBroken(installedWeapon)) {
			NumberRenderer.drawNumber(x + 85, y, 0);
		} else if (limit === 0) {
			textui = this._getWindowTextUI();
			TextRenderer.drawText(
				x + 85,
				y,
				"--",
				this._getTextLength(),
				textui.getColor(),
				textui.getFont()
			);
		} else {
			NumberRenderer.drawNumber(x + 85, y, limit);
		}
	};

	var _ItemControl_getEquippedWeapon = ItemControl.getEquippedWeapon;
	ItemControl.getEquippedWeapon = function (unit) {
		if (unit === null) {
			return _ItemControl_getEquippedWeapon.apply(this, arguments);
		}
		if (CurrentMap.getEnableInstalledWeaponFlag()) {
			return CurrentMap.getInstalledWeapon(
				unit.getMapX(),
				unit.getMapY()
			);
		}
		return _ItemControl_getEquippedWeapon.apply(this, arguments);
	};

	var _ItemControl_setEquippedWeapon = ItemControl.setEquippedWeapon;
	ItemControl.setEquippedWeapon = function (unit, targetItem) {
		if (CurrentMap.getEnableInstalledWeaponFlag()) {
			return;
		}
		_ItemControl_setEquippedWeapon.apply(this, arguments);
	};

	var _MarkingPanel_updateMarkingPanel = MarkingPanel.updateMarkingPanel;
	MarkingPanel.updateMarkingPanel = function () {
		var enemyList;
		_MarkingPanel_updateMarkingPanel.apply(this, arguments);
		if (!this.isMarkingEnabled()) {
			return;
		}
		this._addInstalledIndexWeaponArray();
	};

	_MarkingPanel_updateMarkingPanelFromUnit =
		MarkingPanel.updateMarkingPanelFromUnit;
	MarkingPanel.updateMarkingPanelFromUnit = function (unit) {
		_MarkingPanel_updateMarkingPanelFromUnit.apply(this, arguments);
		if (!this.isMarkingEnabled()) {
			return;
		}
		this._addInstalledIndexWeaponArray();
	};

	MarkingPanel._addInstalledIndexWeaponArray = function () {
		var enemyList = EnemyList.getAliveList();
		var that = this;
		for (var unitIndex = 0; unitIndex < enemyList.getCount(); unitIndex++) {
			var unit = enemyList.getData(unitIndex);
			var currentUnitMapX = unit.getMapX();
			var currentUnitMapY = unit.getMapY();
			var attackaleIndexArray = this._indexArray.filter(function (index) {
				var x = CurrentMap.getX(index);
				var y = CurrentMap.getY(index);
				var weapon = CurrentMap.getInstalledWeapon(x, y);
				return (
					weapon &&
					!ItemControl.isItemBroken(weapon) &&
					ItemControl.isWeaponAvailable(unit, weapon)
				);
			});
			attackaleIndexArray.forEach(function (index) {
				var x = CurrentMap.getX(index);
				var y = CurrentMap.getY(index);
				var weapon = CurrentMap.getInstalledWeapon(x, y);
				unit.setMapX(x);
				unit.setMapY(y);
				var simulator = root.getCurrentSession().createMapSimulator();
				simulator.disableRestrictedPass();
				simulator.startSimulationWeapon(
					unit,
					0,
					weapon.getStartRange(),
					weapon.getEndRange()
				);
				var weaponIndexArray =
					simulator.getSimulationWeaponIndexArray();
				that._mergeIndexArray(weaponIndexArray);
			});
			if (attackaleIndexArray.length > 0) {
				unit.setMapX(currentUnitMapX);
				unit.setMapY(currentUnitMapY);
				this._dedupeIndexArray(this._indexArray);
			}
		}
	};

	MarkingPanel._mergeIndexArray = function (addIndexArray) {
		var mergedIndexArray = this._indexArrayWeapon.concat(addIndexArray);
		var filterMergedIndexArray = mergedIndexArray.filter(function (
			element,
			index
		) {
			return Number(mergedIndexArray.indexOf(element)) === index;
		});
		this._indexArrayWeapon = filterMergedIndexArray;
	};

	MarkingPanel._dedupeIndexArray = function (targetIndexArray) {
		var dedupedIndexArray = this._indexArrayWeapon.filter(function (
			element
		) {
			return targetIndexArray.indexOf(element) < 0;
		});
		this._indexArrayWeapon = dedupedIndexArray;
	};

	CombinationCollector.Weapon._getInstalledWeaponInfo = function (weapon) {
		var installedWeaponInfos = CurrentMap.getInstalledWeaponInfos();
		var usedInstalledWeaponInfos = installedWeaponInfos.filter(function (
			weaponInfo
		) {
			return weaponInfo.weapon === weapon;
		});
		return usedInstalledWeaponInfos.length > 0
			? usedInstalledWeaponInfos[0]
			: null;
	};

	var _CombinationCollector_Weapon__createCostArrayInternal =
		CombinationCollector.Weapon._createCostArrayInternal;
	CombinationCollector.Weapon._createCostArrayInternal = function (misc) {
		var installedWeaponInfo = this._getInstalledWeaponInfo(misc.item);
		if (
			installedWeaponInfo &&
			(installedWeaponInfo.x !== CurrentMap.getX(misc.posIndex) ||
				installedWeaponInfo.y !== CurrentMap.getY(misc.posIndex))
		) {
			return;
		}
		_CombinationCollector_Weapon__createCostArrayInternal.apply(
			this,
			arguments
		);
	};

	var _CombinationCollector_Weapon_collectCombination =
		CombinationCollector.Weapon.collectCombination;
	CombinationCollector.Weapon.collectCombination = function (misc) {
		var installedWeaponInfos = CurrentMap.getInstalledWeaponInfos();
		var unit = misc.unit;
		var that = this;
		_CombinationCollector_Weapon_collectCombination.apply(this, arguments);
		var enabledInstalledWeaponInfos = installedWeaponInfos.filter(function (
			weaponInfo
		) {
			return (
				!ItemControl.isItemBroken(weaponInfo.weapon) &&
				that._isWeaponEnabled(unit, weaponInfo.weapon, misc)
			);
		});
		enabledInstalledWeaponInfos.forEach(function (weaponInfo) {
			misc.item = weaponInfo.weapon;

			var rangeMetrics = StructureBuilder.buildRangeMetrics();
			rangeMetrics.startRange = weaponInfo.weapon.getStartRange();
			rangeMetrics.endRange = weaponInfo.weapon.getEndRange();

			var filter = that._getWeaponFilter(unit);
			that._checkSimulator(misc);
			that._setUnitRangeCombination(misc, filter, rangeMetrics);
		});
	};

	var _WeaponAutoAction_setAutoActionInfo =
		WeaponAutoAction.setAutoActionInfo;
	WeaponAutoAction.setAutoActionInfo = function (unit, combination) {
		if (this._isUsedInstalledWeapon(combination)) {
			CurrentMap.changeEnableInstalledWeaponFlag(true);
		}
		_WeaponAutoAction_setAutoActionInfo.apply(this, arguments);
	};

	var _WeaponAutoAction_moveAutoAction = WeaponAutoAction.moveAutoAction;
	WeaponAutoAction.moveAutoAction = function () {
		var result = _WeaponAutoAction_moveAutoAction.apply(this, arguments);
		if (
			result === MoveResult.END &&
			CurrentMap.getEnableInstalledWeaponFlag()
		) {
			CurrentMap.changeEnableInstalledWeaponFlag(false);
			CurrentMap.updateCurrentMapInstalledWeaponParamter(
				root.getCurrentSession().getCurrentMapInfo().getId()
			);
		}
		return result;
	};

	WeaponAutoAction._isUsedInstalledWeapon = function (combination) {
		var installedWeaponInfos = CurrentMap.getInstalledWeaponInfos();
		return installedWeaponInfos.some(function (weaponInfo) {
			// 同じアドレスを指しているかどうかで同位置の設置武器か判定する
			return weaponInfo.weapon === combination.item;
		});
	};

	AIScorer.Weapon._isUsedInstalledWeapon = function (combination) {
		var installedWeaponInfos = CurrentMap.getInstalledWeaponInfos();
		return installedWeaponInfos.some(function (weaponInfo) {
			// 同じアドレスを指しているかどうかで同位置の設置武器か判定する
			return weaponInfo.weapon === combination.item;
		});
	};

	AIScorer.Weapon._currentItem = null;
	_AIScorer_Weapon__setTemporaryWeapon = AIScorer.Weapon._setTemporaryWeapon;
	AIScorer.Weapon._setTemporaryWeapon = function (unit, combination) {
		if (this._isUsedInstalledWeapon(combination)) {
			this._currentItem = UnitItemControl.getItem(unit, 0);
			UnitItemControl.setItem(unit, 0, combination.item);
			return 0;
		}

		return _AIScorer_Weapon__setTemporaryWeapon.apply(this, arguments);
	};
	var _AIScorer_Weapon__resetTemporaryWeapon =
		AIScorer.Weapon._resetTemporaryWeapon;
	AIScorer.Weapon._resetTemporaryWeapon = function (
		unit,
		combination,
		prevItemIndex
	) {
		if (this._isUsedInstalledWeapon(combination)) {
			UnitItemControl.setItem(unit, 0, this._currentItem);
		} else {
			_AIScorer_Weapon__resetTemporaryWeapon.apply(this, arguments);
		}
	};
})();

CurrentMap._installedWeaponInfos = [];
CurrentMap.getInstalledWeaponInfos = function () {
	return this._installedWeaponInfos;
};
CurrentMap.updateCurrentMapInstalledWeaponParamter = function (currentMapId) {
	var currentMapInstalledWeapon = {
		mapId: currentMapId,
		installedWeaponInfos: []
	};
	var installedWeaponInfos = this._installedWeaponInfos.map(function (
		weaponInfo
	) {
		return {
			x: weaponInfo.x,
			y: weaponInfo.y,
			weaponId: weaponInfo.weapon.getId(),
			limit: weaponInfo.weapon.getLimit()
		};
	});
	currentMapInstalledWeapon.installedWeaponInfos = installedWeaponInfos;
	root.getMetaSession().global.currentMapInstalledWeapon =
		currentMapInstalledWeapon;
};

CurrentMap._isEnableLoadCurrentMapInstalledWeapon = function (currentMapId) {
	var currentMapInstalledWeapon =
		root.getMetaSession().global.currentMapInstalledWeapon;
	if (typeof currentMapInstalledWeapon !== "object") {
		return false;
	}
	return currentMapInstalledWeapon.mapId === currentMapId;
};

CurrentMap._resetCurrentMapInstalledWeaponParamter = function () {
	delete root.getMetaSession().global.currentMapInstalledWeapon;
};

CurrentMap._loadCurrentMapInstalledWeapon = function () {
	var installedWeaponInfos =
		root.getMetaSession().global.currentMapInstalledWeapon
			.installedWeaponInfos;
	var weaponList = root.getBaseData().getWeaponList();
	this._installedWeaponInfos = installedWeaponInfos.map(function (
		weaponInfo
	) {
		var baseWeapon = weaponList.getDataFromId(weaponInfo.weaponId);
		var weapon = root.duplicateItem(baseWeapon);
		weapon.setLimit(weaponInfo.limit);
		return {
			x: weaponInfo.x,
			y: weaponInfo.y,
			weapon: weapon
		};
	});
};

CurrentMap._initializeInstalledWeaponInfos = function () {
	var currentSession = root.getCurrentSession();
	var weaponList = root.getBaseData().getWeaponList();
	for (var mapY = 0; mapY < this._height; mapY++) {
		for (var mapX = 0; mapX < this._width; mapX++) {
			var terrain = currentSession.getTerrainFromPos(mapX, mapY, true);
			if (typeof terrain.custom.installedWeaponId === "number") {
				var installedWeapon = weaponList.getDataFromId(
					terrain.custom.installedWeaponId
				);
				var installedWeaponInfo = {
					x: mapX,
					y: mapY,
					weapon: root.duplicateItem(installedWeapon)
				};
				this._installedWeaponInfos.push(installedWeaponInfo);
			}
		}
	}
};

CurrentMap._isEnableInstalledWeapon = false;
CurrentMap.changeEnableInstalledWeaponFlag = function (isEnable) {
	this._isEnableInstalledWeapon = isEnable;
};
CurrentMap.getEnableInstalledWeaponFlag = function () {
	return this._isEnableInstalledWeapon;
};
CurrentMap.getInstalledWeapon = function (x, y) {
	var targetInstalledWeaponInfos = this._installedWeaponInfos.filter(
		function (weaponInfo) {
			return weaponInfo.x === x && weaponInfo.y === y;
		}
	);
	return targetInstalledWeaponInfos.length > 0
		? targetInstalledWeaponInfos[0].weapon
		: null;
};

UnitCommand.InstalledWeaponAttack = defineObject(UnitCommand.Attack, {
	_installedWeapon: null,
	_weaponSelectMenu: null,

	isCommandDisplayable: function () {
		var installedWeapon, attackaleIndexArray;
		var unit = this.getCommandTarget();
		var installedWeapon = this._getInstalledWeapon();
		if (!installedWeapon) {
			return false;
		}
		if (!ItemControl.isWeaponAvailable(unit, installedWeapon)) {
			return false;
		}
		attackaleIndexArray = this._getIndexArray(unit, installedWeapon);
		return attackaleIndexArray.length > 0;
	},

	_getInstalledWeapon: function () {
		var installedWeapon;
		var unit = this.getCommandTarget();
		var mapX = unit.getMapX();
		var mapY = unit.getMapY();
		var terrain = root
			.getCurrentSession()
			.getTerrainFromPos(mapX, mapY, true);
		if (typeof terrain.custom.installedWeaponId === "number") {
			installedWeapon = CurrentMap.getInstalledWeapon(mapX, mapY);
			if (!installedWeapon) {
				return null;
			}
			if (ItemControl.isItemBroken(installedWeapon)) {
				return null;
			}
			return installedWeapon;
		}
		return null;
	},

	getCommandName: function () {
		var installedWeapon = this._getInstalledWeapon();
		var limit = installedWeapon.getLimit();
		var limitText = limit > 0 ? " " + limit : "";
		return installedWeapon.getName() + limitText;
	},

	isRepeatMoveAllowed: function () {
		return DataConfig.isUnitCommandMovable(RepeatMoveType.ATTACK);
	},

	_completeCommandMemberData: function () {
		var filter = this._getUnitFilter();
		var unit = this.getCommandTarget();
		this._installedWeapon = this._getInstalledWeapon();
		var indexArray = this._getIndexArray(unit, this._installedWeapon);
		// _moveSelectでエラーを発生させないためのモックを作成する
		var mockReturnValue = this._installedWeapon;
		this._weaponSelectMenu["getSelectWeapon"] = function () {
			return mockReturnValue;
		};
		this._weaponSelectMenu.setMenuTarget(unit);
		this._posSelector.setUnitOnly(
			unit,
			this._installedWeapon,
			indexArray,
			PosMenuType.Attack,
			filter
		);
		this._posSelector.setFirstPos();
		this.changeCycleMode(AttackCommandMode.SELECTION);
	},

	_createAttackParam: function () {
		// 本来は_moveSelection内で呼び出す方が望ましいが、
		// プロトタイプ側のメソッドを呼び出して追加処理を記述する事が困難なため、
		// アップデートの変更に弱くなってしまう。
		// 代替案として_moveSelect内で戦闘結果の計算前に呼び出される_createAttackParam内で呼び出す事にした。
		CurrentMap.changeEnableInstalledWeaponFlag(true);
		return UnitCommand.Attack._createAttackParam.apply(this, arguments);
	},

	endCommandAction: function () {
		CurrentMap.changeEnableInstalledWeaponFlag(false);
		CurrentMap.updateCurrentMapInstalledWeaponParamter(
			root.getCurrentSession().getCurrentMapInfo().getId()
		);
		UnitCommand.Attack.endCommandAction.apply(this, arguments);
	}
});

// Array.prototype.map polyfill
// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.io/#x15.4.4.19
if (!Array.prototype.map) {
	Array.prototype.map = function (callback /*, thisArg*/) {
		var T, A, k;

		if (this == null) {
			throw new TypeError("this is null or not defined");
		}

		// 1. Let O be the result of calling ToObject passing the |this|
		//    value as the argument.
		var O = Object(this);

		// 2. Let lenValue be the result of calling the Get internal
		//    method of O with the argument "length".
		// 3. Let len be ToUint32(lenValue).
		var len = O.length >>> 0;

		// 4. If IsCallable(callback) is false, throw a TypeError exception.
		// See: http://es5.github.com/#x9.11
		if (typeof callback !== "function") {
			throw new TypeError(callback + " is not a function");
		}

		// 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
		if (arguments.length > 1) {
			T = arguments[1];
		}

		// 6. Let A be a new array created as if by the expression new Array(len)
		//    where Array is the standard built-in constructor with that name and
		//    len is the value of len.
		A = new Array(len);

		// 7. Let k be 0
		k = 0;

		// 8. Repeat, while k < len
		while (k < len) {
			var kValue, mappedValue;

			// a. Let Pk be ToString(k).
			//   This is implicit for LHS operands of the in operator
			// b. Let kPresent be the result of calling the HasProperty internal
			//    method of O with argument Pk.
			//   This step can be combined with c
			// c. If kPresent is true, then
			if (k in O) {
				// i. Let kValue be the result of calling the Get internal
				//    method of O with argument Pk.
				kValue = O[k];

				// ii. Let mappedValue be the result of calling the Call internal
				//     method of callback with T as the this value and argument
				//     list containing kValue, k, and O.
				mappedValue = callback.call(T, kValue, k, O);

				// iii. Call the DefineOwnProperty internal method of A with arguments
				// Pk, Property Descriptor
				// { Value: mappedValue,
				//   Writable: true,
				//   Enumerable: true,
				//   Configurable: true },
				// and false.

				// In browsers that support Object.defineProperty, use the following:
				// Object.defineProperty(A, k, {
				//   value: mappedValue,
				//   writable: true,
				//   enumerable: true,
				//   configurable: true
				// });

				// For best browser support, use the following:
				A[k] = mappedValue;
			}
			// d. Increase k by 1.
			k++;
		}

		// 9. return A
		return A;
	};
}

// Array.prototype.filter polyfill
// reference: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/filter#polyfill
if (!Array.prototype.filter) {
	Array.prototype.filter = function (func, thisArg) {
		"use strict";
		if (
			!(
				(typeof func === "Function" || typeof func === "function") &&
				this
			)
		)
			throw new TypeError();

		var len = this.length >>> 0,
			res = new Array(len), // preallocate array
			t = this,
			c = 0,
			i = -1;

		var kValue;
		if (thisArg === undefined) {
			while (++i !== len) {
				// checks to see if the key was set
				if (i in this) {
					kValue = t[i]; // in case t is changed in callback
					if (func(t[i], i, t)) {
						res[c++] = kValue;
					}
				}
			}
		} else {
			while (++i !== len) {
				// checks to see if the key was set
				if (i in this) {
					kValue = t[i];
					if (func.call(thisArg, t[i], i, t)) {
						res[c++] = kValue;
					}
				}
			}
		}

		res.length = c; // shrink down array to proper size
		return res;
	};
}

// Array.prototype.some polyfill
// Production steps of ECMA-262, Edition 5, 15.4.4.17
// Reference: http://es5.github.io/#x15.4.4.17
if (!Array.prototype.some) {
	Array.prototype.some = function (fun, thisArg) {
		"use strict";

		if (this == null) {
			throw new TypeError(
				"Array.prototype.some called on null or undefined"
			);
		}

		if (typeof fun !== "function") {
			throw new TypeError();
		}

		var t = Object(this);
		var len = t.length >>> 0;

		for (var i = 0; i < len; i++) {
			if (i in t && fun.call(thisArg, t[i], i, t)) {
				return true;
			}
		}

		return false;
	};
}

// Array.prototype.forEach polyfill
// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.com/#x15.4.4.18
if (!Array.prototype.forEach) {
	Array.prototype.forEach = function (callback, thisArg) {
		var T, k;
		if (this == null) {
			throw new TypeError(" this is null or not defined");
		}
		// 1. Let O be the result of calling ToObject passing the |this| value as the argument.
		var O = Object(this);
		// 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
		// 3. Let len be ToUint32(lenValue).
		var len = O.length >>> 0;
		// 4. If IsCallable(callback) is false, throw a TypeError exception.
		// See: http://es5.github.com/#x9.11
		if (typeof callback !== "function") {
			throw new TypeError(callback + " is not a function");
		}
		// 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
		if (thisArg) {
			T = thisArg;
		}
		// 6. Let k be 0
		k = 0;
		// 7. Repeat, while k < len
		while (k < len) {
			var kValue;
			// a. Let Pk be ToString(k).
			//   This is implicit for LHS operands of the in operator
			// b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
			//   This step can be combined with c
			// c. If kPresent is true, then
			if (k in O) {
				// i. Let kValue be the result of calling the Get internal method of O with argument Pk.
				kValue = O[k];
				// ii. Call the Call internal method of callback with T as the this value and
				// argument list containing kValue, k, and O.
				callback.call(T, kValue, k, O);
			}
			// d. Increase k by 1.
			k++;
		}
		// 8. return undefined
	};
}
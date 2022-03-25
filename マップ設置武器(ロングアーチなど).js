/*
  まだ作成中です
*/
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

	var _AttackChecker_isUnitAttackable = AttackChecker.isUnitAttackable;
	AttackChecker.isUnitAttackable = function (unit) {
		var i, item, indexArray;
		var count = UnitItemControl.getPossessionItemCount(unit);

		for (i = 0; i < count; i++) {
			item = UnitItemControl.getItem(unit, i);
			if (item !== null && ItemControl.isWeaponAvailable(unit, item)) {
				indexArray = this.getAttackIndexArray(unit, item, true);
				if (indexArray.length !== 0) {
					return true;
				}
			}
		}

		return false;
	};

	var _UnitCommand_configureCommands = UnitCommand.configureCommands;
	UnitCommand.configureCommands = function (groupArray) {
		groupArray.appendObject(UnitCommand.InstalledWeaponAttack);
		_UnitCommand_configureCommands.apply(this, arguments);
	};

	UnitRangePanel._installedWeaponSimulators = [];
	var _UnitRangePanel__setLight = UnitRangePanel._setLight;
	UnitRangePanel._setLight = function(isWeapon) {
		_UnitRangePanel__setLight.apply(this, arguments);
		if (this._installedWeaponSimulators.length === 0) {
			return;
		}
		if (!isWeapon) {
			this._mapChipLightWeapon.setLightType(MapLightType.RANGE);
			this._mapChipLightWeapon.setIndexArray(this._installedWeaponSimulators[0].getSimulationWeaponIndexArray());
		}
		for (var index = 0; index < this._installedWeaponSimulators.length; index++) {
			var installedWeaponIndexArray = this._installedWeaponSimulators[index].getSimulationWeaponIndexArray();
			this._mapChipLightWeapon.mergeIndexArray(installedWeaponIndexArray);
		}
		this._mapChipLightWeapon.dedupeIndexArray(this._simulator.getSimulationIndexArray());
	};

	MapChipLight.mergeIndexArray = function(addIndexArray) {
		var mergedIndexArray = this._indexArray.concat(addIndexArray);
		var filterMergedIndexArray = mergedIndexArray.filter(function(element, index){
			return Number(mergedIndexArray.indexOf(element)) === index;
		});
		this._indexArray = filterMergedIndexArray;
	};

	MapChipLight.dedupeIndexArray = function(targetIndexArray) {
		var dedupedIndexArray = this._indexArray.filter(function(element){
			return targetIndexArray.indexOf(element) < 0;
		});
		this._indexArray = dedupedIndexArray;
	};

	UnitRangePanel._setInstalledWeaponRangeDatas = function() {
		var simulator;
		var moveableIndexArray = this._simulator.getSimulationIndexArray();
		for (var index = 0; index < moveableIndexArray.length; index++) {
			var x = CurrentMap.getX(moveableIndexArray[index]);
			var y = CurrentMap.getY(moveableIndexArray[index]);
			var weapon = CurrentMap.getInstalledWeapon(x, y);
			if (weapon && !ItemControl.isItemBroken(weapon) && ItemControl.isWeaponAvailable(this._unit, weapon)) {
				this._unit.setMapX(x);
				this._unit.setMapY(y);
				simulator = root.getCurrentSession().createMapSimulator();
				simulator.disableRestrictedPass();
				simulator.startSimulationWeapon(this._unit, 0, weapon.getStartRange(), weapon.getEndRange());
				this._installedWeaponSimulators.push(simulator);
			}
		}
		this._unit.setMapX(this._x);
		this._unit.setMapY(this._y);
	};

	UnitRangePanel._setRangeData = function() {
		var attackRange = this.getUnitAttackRange(this._unit);
		var isWeapon = attackRange.endRange !== 0;

		if (isWeapon) {
			this._simulator.startSimulationWeapon(this._unit, attackRange.mov, attackRange.startRange, attackRange.endRange);
		}
		else {
			this._simulator.startSimulation(this._unit, attackRange.mov);
		}
		this._setInstalledWeaponRangeDatas();
		
		this._setLight(isWeapon);
		this._installedWeaponSimulators = [];
	};

	var _MapParts_Terrain__getPartsCount = MapParts.Terrain._getPartsCount;
	MapParts.Terrain._getPartsCount = function (terrain) {
		var count = _MapParts_Terrain__getPartsCount.apply(this, arguments);

		if (typeof terrain.custom.installedWeaponId === 'number') {
			count++;
		}

		return count;
	};

	var _MapParts_Terrain__drawContent = MapParts.Terrain._drawContent;
	MapParts.Terrain._drawContent = function (x, y, terrain) {
		var installedWeapon, limit, textui;

		_MapParts_Terrain__drawContent.apply(this, arguments);
		if (typeof terrain.custom.installedWeaponId !== 'number') {
			return;
		}
		installedWeapon = CurrentMap.getInstalledWeapon(this.getMapPartsX(), this.getMapPartsY());
		limit = installedWeapon.getLimit();

		x += 2;
		y += this.getIntervalY() * (this._getPartsCount(terrain) - 2);
		ItemInfoRenderer.drawKeyword(x, y, "残数");
		if (ItemControl.isItemBroken(installedWeapon)) {
			NumberRenderer.drawNumber(x + 85, y, 0);
		} else if (limit === 0) {
			textui = this._getWindowTextUI();
			TextRenderer.drawText(x + 85, y, "--", this._getTextLength(), textui.getColor(), textui.getFont());
		} else {
			NumberRenderer.drawNumber(x + 85, y, limit);
		}
	};

	var _ItemControl_getEquippedWeapon = ItemControl.getEquippedWeapon;
	ItemControl.getEquippedWeapon = function(unit) {
		if (unit === null) {
			return _ItemControl_getEquippedWeapon.apply(this, arguments);
		}
		if (CurrentMap.getEnableInstalledWeaponFlag()) {
			return CurrentMap.getInstalledWeapon(unit.getMapX(), unit.getMapY());
		}
		return _ItemControl_getEquippedWeapon.apply(this, arguments);
	};

	var _ItemControl_setEquippedWeapon = ItemControl.setEquippedWeapon;
	ItemControl.setEquippedWeapon = function(unit, targetItem) {
		if (CurrentMap.getEnableInstalledWeaponFlag()) {
			return;
		}
		_ItemControl_setEquippedWeapon.apply(this, arguments);
	};
})();

CurrentMap._installedWeaponInfos = [];
CurrentMap.updateCurrentMapInstalledWeaponParamter = function(currentMapId) {
	var currentMapInstalledWeapon = {
		mapId: currentMapId,
		installedWeaponInfos: []
	};
	for (var index = 0; index < this._installedWeaponInfos.length; index++) {
		var installedWeaponInfo = {
			x: this._installedWeaponInfos[index].x,
			y: this._installedWeaponInfos[index].y,
			weaponId: this._installedWeaponInfos[index].weapon.getId(),
			limit: this._installedWeaponInfos[index].weapon.getLimit()
		};
		currentMapInstalledWeapon.installedWeaponInfos.push(installedWeaponInfo);
	}
	root.getMetaSession().global.currentMapInstalledWeapon = currentMapInstalledWeapon;
};

CurrentMap._isEnableLoadCurrentMapInstalledWeapon = function(currentMapId) {
	var currentMapInstalledWeapon = root.getMetaSession().global.currentMapInstalledWeapon;
	if (typeof currentMapInstalledWeapon !== 'object') {
		return false;
	}
	return currentMapInstalledWeapon.mapId === currentMapId;
};

CurrentMap._resetCurrentMapInstalledWeaponParamter = function() {
	delete root.getMetaSession().global.currentMapInstalledWeapon;
};

CurrentMap._loadCurrentMapInstalledWeapon = function() {
	var installedWeaponInfos = root.getMetaSession().global.currentMapInstalledWeapon.installedWeaponInfos;
	var weaponList = root.getBaseData().getWeaponList();
	for (var index = 0; index < installedWeaponInfos.length; index++) {
		var baseWeapon = weaponList.getDataFromId(installedWeaponInfos[index].weaponId);
		var installedWeapon = root.duplicateItem(baseWeapon);
		installedWeapon.setLimit(installedWeaponInfos[index].limit);
		this._installedWeaponInfos.push({
			x: installedWeaponInfos[index].x,
			y: installedWeaponInfos[index].y,
			weapon: installedWeapon
		});
	}
};

CurrentMap._initializeInstalledWeaponInfos = function() {
	var currentSession = root.getCurrentSession();
	var weaponList = root.getBaseData().getWeaponList();
	for (var mapY = 0; mapY < this._height; mapY++) {
		for (var mapX = 0; mapX < this._width; mapX++) {
			var terrain = currentSession.getTerrainFromPos(mapX, mapY, true);
			if (typeof terrain.custom.installedWeaponId === 'number') {
				var installedWeapon = weaponList.getDataFromId(terrain.custom.installedWeaponId);
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
	for (var index = 0; index < this._installedWeaponInfos.length; index++) {
		if (
			x === this._installedWeaponInfos[index].x &&
			y === this._installedWeaponInfos[index].y
		) {
			return this._installedWeaponInfos[index].weapon;
		}
	}
	return null;
};

AttackChecker.isUnitAttackableByFixedWeapon = function (unit, weapon) {
	var indexArray;

	if (ItemControl.isWeaponAvailable(unit, weapon)) {
		indexArray = this.getAttackIndexArray(unit, weapon, true);
		if (indexArray.length !== 0) {
			return true;
		}
	}

	return false;
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

	_getInstalledWeapon: function() {
		var installedWeapon;
		var unit = this.getCommandTarget();
		var mapX = unit.getMapX();
		var mapY = unit.getMapY();
		var terrain = root.getCurrentSession().getTerrainFromPos(mapX, mapY, true);
		if (typeof terrain.custom.installedWeaponId === 'number') {
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
		this._weaponSelectMenu["getSelectWeapon"] = function() {
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

	_createAttackParam: function() {
		// 本来は_moveSelection内で呼び出す方が望ましいが、
		// プロトタイプ側のメソッドを呼び出して追加処理を記述する事が困難なため、
		// アップデートの変更に弱くなってしまう。
		// 代替案として_moveSelect内で戦闘結果の計算前に呼び出される_createAttackParam内で呼び出す事にした。
		CurrentMap.changeEnableInstalledWeaponFlag(true);
		return UnitCommand.Attack._createAttackParam.apply(this, arguments);
	},

	endCommandAction: function () {
		CurrentMap.changeEnableInstalledWeaponFlag(false);
		CurrentMap.updateCurrentMapInstalledWeaponParamter(root.getCurrentSession().getCurrentMapInfo().getId());
		UnitCommand.Attack.endCommandAction.apply(this, arguments);
	}
});

// Array.prototype.filter polyfill
// reference: https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/filter#polyfill
if (!Array.prototype.filter){
  Array.prototype.filter = function(func, thisArg) {
    'use strict';
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
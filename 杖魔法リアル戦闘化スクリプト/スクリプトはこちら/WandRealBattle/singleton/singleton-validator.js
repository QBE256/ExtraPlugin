var WandAnimationValidatiors = {
  isRealBattleSettingItem: function (item) {
    return this.isValidItemImage(item) && this.isValidItemSetting(item, WeaponEffectAnime.MAGICWEAPON);
  },
  isValidItemImage: function (item) {
    if (!item) {
      return false;
    }

    var realSetting = item.custom.real_setting;
    if (typeof realSetting !== "object") {
      return false;
    }

    if (!realSetting.hasOwnProperty("img")) {
      return false;
    }
    if (typeof realSetting.img !== "string") {
      return false;
    }
    return true;
  },

  isValidItemSetting: function (item, weaponEffectAnimeType) {
    if (!item) {
      return false;
    }

    var realSetting = item.custom.real_setting;
    if (typeof realSetting !== "object") {
      return false;
    }

    if (weaponEffectAnimeType === WeaponEffectAnime.MAGICWEAPON) {
      return this._isValidEffect(realSetting);
    } else if (weaponEffectAnimeType === WeaponEffectAnime.MAGICINVOCATION) {
      return this._isValidInvocation(realSetting);
    }

    return false;
  },

  _isValidEffect: function (realSetting) {
    if (!realSetting.hasOwnProperty("effect")) {
      return false;
    }

    if (typeof realSetting.effect !== "object") {
      return false;
    }

    if (!realSetting.effect.hasOwnProperty("runtime") || !realSetting.effect.hasOwnProperty("id")) {
      return false;
    }

    if (typeof realSetting.effect.runtime !== "boolean" || typeof realSetting.effect.id !== "number") {
      return false;
    }

    var effect = root
      .getBaseData()
      .getEffectAnimationList(realSetting.effect.runtime)
      .getDataFromId(realSetting.effect.id);

    if (!effect) {
      return false;
    }

    return true;
  },

  _isValidInvocation: function (realSetting) {
    if (!realSetting.hasOwnProperty("invocation")) {
      return false;
    }

    if (typeof realSetting.invocation !== "object") {
      return false;
    }
    var invocation = realSetting.invocation;

    if (!invocation.hasOwnProperty("runtime") || !invocation.hasOwnProperty("id")) {
      return false;
    }

    if (typeof invocation.runtime !== "boolean" || typeof invocation.id !== "number") {
      return false;
    }

    var effect = root.getBaseData().getEffectAnimationList(invocation.runtime).getDataFromId(invocation.id);

    if (!effect) {
      return false;
    }

    return true;
  },

  isValidWandSetting: function (anime, isActive, itemType) {
    if (!anime) {
      return false;
    }
    var wandSetting = anime.custom.wand_setting;
    if (typeof wandSetting !== "object") {
      return false;
    }

    if (isActive) {
      return this._isValidActive(anime, wandSetting);
    } else {
      if (itemType === ItemType.TELEPORTATION) {
        return this._isValidPassiveByTeleportation(anime, wandSetting);
      } else if (itemType === ItemType.RESURRECTION) {
        return this._isValidPassiveByResurrection(anime, wandSetting);
      } else if (itemType === ItemType.RESCUE) {
        return this._isValidPassiveByRescue(anime, wandSetting);
      } else if (itemType === ItemType.QUICK) {
        return this._isValidPassiveByQuick(anime, wandSetting);
      }
    }

    return false;
  },

  _isValidActive: function (anime, wandSetting) {
    if (!wandSetting.hasOwnProperty("wand")) {
      return false;
    }
    var wand = wandSetting.wand;
    if (typeof wand !== "object") {
      return false;
    }
    if (!wand.hasOwnProperty("attack_id") || !wand.hasOwnProperty("wait_id")) {
      return false;
    }
    if (typeof wand.attack_id !== "number" || typeof wand.wait_id !== "number") {
      return false;
    }
    if (anime.getMotionCategoryType(wand.wait_id) !== MotionCategoryType.NORMAL) {
      return false;
    }
    if (anime.getMotionCategoryType(wand.attack_id) !== MotionCategoryType.MAGIC) {
      return false;
    }
    return true;
  },

  _isValidPassiveByTeleportation: function (anime, wandSetting) {
    if (!wandSetting.hasOwnProperty("teleportation")) {
      return false;
    }
    var teleportation = anime.custom.wand_setting.teleportation;
    if (typeof teleportation !== "object") {
      return false;
    }
    if (!teleportation.hasOwnProperty("teleportation_id")) {
      return false;
    }
    if (typeof teleportation.teleportation_id !== "number") {
      return false;
    }
    if (anime.getMotionCategoryType(teleportation.teleportation_id) !== MotionCategoryType.DAMAGE) {
      return false;
    }
    return true;
  },

  _isValidPassiveByResurrection: function (anime, wandSetting) {
    if (!wandSetting.hasOwnProperty("resurrection")) {
      return false;
    }
    var resurrection = anime.custom.wand_setting.resurrection;
    if (typeof resurrection !== "object") {
      return false;
    }
    if (!resurrection.hasOwnProperty("recovery_id") || !resurrection.hasOwnProperty("wait_id")) {
      return false;
    }
    if (typeof resurrection.recovery_id !== "number" || typeof resurrection.wait_id !== "number") {
      return false;
    }
    if (anime.getMotionCategoryType(resurrection.wait_id) !== MotionCategoryType.NORMAL) {
      return false;
    }
    if (anime.getMotionCategoryType(resurrection.recovery_id) !== MotionCategoryType.DAMAGE) {
      return false;
    }
    return true;
  },

  _isValidPassiveByRescue: function (anime, wandSetting) {
    if (!wandSetting.hasOwnProperty("rescue")) {
      return false;
    }
    var rescue = anime.custom.wand_setting.rescue;
    if (typeof rescue !== "object") {
      return false;
    }
    if (!rescue.hasOwnProperty("rescue_id") || !rescue.hasOwnProperty("wait_id")) {
      return false;
    }
    if (typeof rescue.rescue_id !== "number" || typeof rescue.wait_id !== "number") {
      return false;
    }
    if (anime.getMotionCategoryType(rescue.wait_id) !== MotionCategoryType.NORMAL) {
      return false;
    }
    if (anime.getMotionCategoryType(rescue.rescue_id) !== MotionCategoryType.DAMAGE) {
      return false;
    }
    return true;
  },

  _isValidPassiveByQuick: function (anime, wandSetting) {
    if (!wandSetting.hasOwnProperty("quick")) {
      return false;
    }
    var quick = anime.custom.wand_setting.quick;
    if (typeof quick !== "object") {
      return false;
    }
    if (!quick.hasOwnProperty("quick_id") || !quick.hasOwnProperty("quick_id")) {
      return false;
    }
    if (typeof quick.quick_id !== "number" || typeof quick.wait_id !== "number") {
      return false;
    }
    if (anime.getMotionCategoryType(quick.wait_id) !== MotionCategoryType.NORMAL) {
      return false;
    }
    if (anime.getMotionCategoryType(quick.quick_id) !== MotionCategoryType.DAMAGE) {
      return false;
    }
    return true;
  }
};

var WandMusicValidatiors = {
  isValid: function (mapInfo, isReverseUnitType) {
    if (!mapInfo) {
      return false;
    }
    var wandMusic = mapInfo.custom.wand_music;
    if (typeof wandMusic !== "object") {
      return false;
    }
    var property = isReverseUnitType ? "rival" : "support";
    if (!wandMusic.hasOwnProperty(property)) {
      return false;
    }
    var music = wandMusic[property];
    if (!music.hasOwnProperty("runtime") || !music.hasOwnProperty("id")) {
      return false;
    }
    if (typeof music.runtime !== "boolean" || typeof music.id !== "number") {
      return false;
    }
    return true;
  }
};

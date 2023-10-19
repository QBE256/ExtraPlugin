AnimeSimple._wandFilePath = null;
AnimeSimple._setWandFilePath = function (wand) {
  if (WandAnimationValidatiors.isValidItemImage(wand)) {
    this._wandFilePath = wand.custom.real_setting.img;
  }
};

AnimeSimple._checkWandSprite = function (frameIndex, spriteIndex) {
  if (!WandAnimationValidatiors.isValidWandSetting(this._animeData, true)) {
    return false;
  }
  var resourceId = this._animeData.getSpriteGraphicsHandle(this._motionId, frameIndex, spriteIndex).getResourceId();
  if (resourceId !== WandImageSetting.BASE_RESOURCE_ID) {
    return false;
  }

  return (
    this._motionId === this._animeData.custom.wand_setting.wand.wait_id ||
    this._motionId === this._animeData.custom.wand_setting.wand.attack_id
  );
};

AnimeSimple.drawMotion = function (frameIndex, i, animeRenderParam, animeCoordinates) {
  var isRight, pic, srcWidth, srcHeight;
  var x = this._animeData.getSpriteX(this._motionId, frameIndex, i);
  var y = this._animeData.getSpriteY(this._motionId, frameIndex, i);
  var width = this._animeData.getSpriteWidth(this._motionId, frameIndex, i);
  var height = this._animeData.getSpriteHeight(this._motionId, frameIndex, i);
  var alpha = this._animeData.getSpriteAlpha(this._motionId, frameIndex, i);
  var degree = this._animeData.getSpriteDegree(this._motionId, frameIndex, i);
  var isReverse = this._animeData.isSpriteReverse(this._motionId, frameIndex, i);
  var handle = this._animeData.getSpriteGraphicsHandle(this._motionId, frameIndex, i);
  var xSrc = handle.getSrcX();
  var ySrc = handle.getSrcY();
  var isAbsolute = this._animeData.isAbsoluteMotion(this._motionId);

  if (animeRenderParam !== null) {
    if (animeRenderParam.alpha !== -1) {
      alpha = animeRenderParam.alpha;
    }

    if (!animeRenderParam.isRight) {
      isReverse = !isReverse;
    }

    isRight = animeRenderParam.isRight;
  } else {
    isRight = true;
  }

  if (this._checkWandSprite(frameIndex, i)) {
    if (this._wandFilePath) {
      pic = root.getMaterialManager().createImage(WandImageSetting.Material, this._wandFilePath);
    } else {
      pic = null;
    }
  } else {
    pic = this._getMotionPicture(frameIndex, i, animeRenderParam);
  }

  if (pic !== null) {
    pic.setAlpha(alpha);
    pic.setDegree(degree);
    if (this._animeData.isMirrorAllowed()) {
      pic.setReverse(isReverse);
    }
    pic.setInterpolationMode(this._interpolationMode);

    if (this._animeData.getSpriteGraphicsType(this._motionId, frameIndex, i) === GraphicsType.PICTURE) {
      srcWidth = pic.getWidth();
      srcHeight = pic.getHeight();
    } else {
      srcWidth = GraphicsFormat.MOTION_WIDTH;
      srcHeight = GraphicsFormat.MOTION_HEIGHT;
    }

    this._drawSprite(x, y, width, height, pic, isAbsolute, isRight, xSrc, ySrc, srcWidth, srcHeight, animeCoordinates);
  }
};

(function () {
  var _AnimeMotion_setMotionParam = AnimeMotion.setMotionParam;
  AnimeMotion.setWandAttackMotionParam = function (motionParam) {
    _AnimeMotion_setMotionParam.apply(this, arguments);

    if (
      motionParam.motionId !== MotionIdValue.NONE &&
      WandAnimationValidatiors.isValidWandSetting(this._animeData, true)
    ) {
      this._animeSimple._setWandFilePath(ItemControl.getEquippedWand(this._unit));
    }
  };
})();

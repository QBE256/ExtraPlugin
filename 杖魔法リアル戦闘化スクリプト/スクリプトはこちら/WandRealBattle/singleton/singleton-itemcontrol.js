ItemControl.getEquippedWand = function (unit) {
  if (!unit) {
    return null;
  }
  var count = UnitItemControl.getPossessionItemCount(unit);
  for (var index = 0; index < count; index++) {
    var item = UnitItemControl.getItem(unit, index);
    if (!!item && this.isItemUsable(unit, item)) {
      return item;
    }
  }

  return null;
};

var WandFlow = defineObject(AttackFlow, {
  _doAttackAction: function () {
    var order = this._order;
    var active = order.getActiveUnit();
    var passive = order.getPassiveUnit();
    var activeStates = order.getActiveStateArray();
    var passiveStates = order.getPassiveStateArray();
    var isItemDecrement = order.isCurrentItemDecrement();
    var wand = ItemControl.getEquippedWand(active);
    var activeDamage = order.getActiveDamage();
    var passiveDamage = order.getPassiveDamage();

    DamageControl.reduceHp(active, activeDamage);
    DamageControl.reduceHp(passive, passiveDamage);
    DamageControl.checkHp(active, passive);

    activeStates.forEach(function (state) {
      StateControl.arrangeState(active, state, IncreaseType.INCREASE);
    });
    passiveStates.forEach(function (state) {
      StateControl.arrangeState(passive, state, IncreaseType.INCREASE);
    });
    if (isItemDecrement) {
      ItemControl.decreaseLimit(active, wand);
    }
  }
});

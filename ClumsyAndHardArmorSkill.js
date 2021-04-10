/*--------------------------------------------------------------------------
　スキル 不器用、ハードアーマー(攻撃時に武器耐久を余分に消耗させるスキル) ver 1.0

■作成者
キュウブ

■概要
以下のカスタムスキルを導入する事で、
武器の耐久を余分に消耗させる事ができるようになります。

1.不器用(カスタムキーワード:Clumsy)
カスタムパラメータで
decreaseCount:<数値>
と設定しておくと、攻撃した時に数値の分だけ余分に武器耐久を消耗するようになります。

2.ハードアーマー(カスタムキーワード:HardArmor)
カスタムパラメータで
decreaseCount:<数値>
と設定しておくと、攻撃を受けた時に数値の分だけ敵の武器耐久を余分に減らす事ができます。

※弓や魔法などで適用させたくない場合は有効相手で武器の設定をしておくとよいでしょう。

■更新履歴
ver 1.0 (2021/04/11)
初版公開

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
	var _NormalAttackOrderBuilder__decreaseWeaponLimit = NormalAttackOrderBuilder._decreaseWeaponLimit;
	NormalAttackOrderBuilder._decreaseWeaponLimit = function(virtualActive, virtualPassive, attackEntry) {
		var clumsySkill, hardArmorSkill, weaponType;
		var weapon = virtualActive.weapon;
		var isItemDecrement = false;

		_NormalAttackOrderBuilder__decreaseWeaponLimit.apply(this, arguments);
		if (weapon === null) {
			return;
		}
		clumsySkill = SkillControl.checkAndPushCustomSkill(virtualActive.unitSelf, virtualPassive.unitSelf, attackEntry, true, 'Clumsy');
		hardArmorSkill = SkillControl.checkAndPushCustomSkill(virtualPassive.unitSelf, virtualActive.unitSelf, attackEntry, false, 'HardArmor');
		if (!clumsySkill && !hardArmorSkill) {
			return;
		}		
		weaponType = weapon.getWeaponType();
		if (weaponType.isHitDecrement()) {
			if (attackEntry.isHit) {
				isItemDecrement = true;
			}
		}
		else {
			isItemDecrement = true;
		}
		if (isItemDecrement) {
			attackEntry.isItemDecrement = true;
			if (clumsySkill) {
				virtualActive.weaponUseCount += clumsySkill.custom.decreaseCount;
			}
			if (hardArmorSkill) {
				virtualActive.weaponUseCount += hardArmorSkill.custom.decreaseCount;
			}
		}
	};

	var _SkillRandomizer_isCustomSkillInvokedInternal = SkillRandomizer.isCustomSkillInvokedInternal;
	SkillRandomizer.isCustomSkillInvokedInternal = function(active, passive, skill, keyword) {
		if (keyword === 'Clumsy' || keyword === 'HardArmor') {
			return this._isSkillInvokedInternal(active, passive, skill);
		}
		else {
			return _SkillRandomizer_isCustomSkillInvokedInternal.apply(this, arguments);
		}
	};

	var _AttackFlow__doAttackAction = AttackFlow._doAttackAction;
	AttackFlow._doAttackAction = function() {
		var order = this._order;
		var active = order.getActiveUnit();
		var isItemDecrement = order.isCurrentItemDecrement();
		var decreaseCountBySkill = 0;
		var activeSkillArray = order.getActiveSkillArray();
		var passiveSkillArray = order.getPassiveSkillArray();

		_AttackFlow__doAttackAction.call(this);
		if (!order.isCurrentItemDecrement()) {
			return;
		}
		for (var index = 0; index < activeSkillArray.length; index++) {
			if (activeSkillArray[index].getCustomKeyword() === 'Clumsy') {
				decreaseCountBySkill += activeSkillArray[index].custom.decreaseCount;
			}
		}
		for (var index = 0; index < passiveSkillArray.length; index++) {
			if (passiveSkillArray[index].getCustomKeyword() === 'HardArmor') {
				decreaseCountBySkill += passiveSkillArray[index].custom.decreaseCount;
			}
		}
		for (var index = 0; index < decreaseCountBySkill; index++) {
			ItemControl.decreaseLimit(active, BattlerChecker.getBaseWeapon(active));
		}
	};
})();
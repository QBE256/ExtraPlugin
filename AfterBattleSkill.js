/*--------------------------------------------------------------------------
　戦闘後に自分か相手のHPを変動させるスキル ver 1.1

■作成者
キュウブ

■概要
戦闘後に自分のHPを回復、あるいは敵のHPを削るスキルを設定できます。

■使い方
■■自分のHPを回復するスキル
1.カスタムスキルにカスタムキーワード"RecoveryHpAfterBattle"と設定
2.以下のようなカスタムパラメータを設定

recoveryHpAfterBattle: {
	type: <回復量のタイプ。固定値であれば0(RecoveryHpType.FIXED),最大HP割合であれば1(RecoveryHpType.RATE)>,
	value: <回復量>,
	effect: {
		isRuntime: <回復エフェクトアニメがランタイムであればtrue,オリジナルであればfalse>,
		id: <回復エフェクトアニメのID>
	}
}

例.戦闘後最大HP20%回復するスキル(エフェクトは光の輪)
recoveryHpAfterBattle: {
	type: RecoveryHpType.RATE,
	value: 0.2,
	effect: {
		isRuntime: true,
		id: 5
	}
}

例.戦闘後HPが5回復するスキル(エフェクトは闇の渦)
recoveryHpAfterBattle: {
	type: RecoveryHpType.FIXED,
	value: 5,
	effect: {
		isRuntime: true,
		id: 6
	}
}

■■ 敵にダメージを与えるスキル
1.カスタムスキルにカスタムキーワード"Pursuit"と設定
2.以下のようなカスタムパラメータを設定

pursuit: {
	type: <ダメージ量のタイプ。固定値であれば0(PursuitDamageType.FIXED),最大HP割合であれば1(PursuitDamageType.RATE)>,
	value: <ダメージ量>,
	effect: {
		isRuntime: <ダメージエフェクトアニメがランタイムであればtrue,オリジナルであればfalse>,
		id: <ダメージエフェクトアニメのID>
	},
	isFinish: <とどめをさす場合はtrue, ささない場合はfalse>
}

例:戦闘後敵に最大HP10%分のダメージを与えるスキル(エフェクトは炎の渦、とどめはささず最低でもHPは1残る)
pursuit: {
	type: PursuitDamageType.RATE,
	value: 0.1,
	effect: {
		isRuntime: true,
		id: 8
	},
	isFinish: false
}

■更新履歴
ver 1.1 2021/12/09
カスパラ例が誤っていたので修正(コード部分には手を入れてないです)

ver 1.0 2021/11/20
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
	var _PreAttack__pushFlowEntriesEnd = PreAttack._pushFlowEntriesEnd;
	PreAttack._pushFlowEntriesEnd = function(straightFlow) {
		_PreAttack__pushFlowEntriesEnd.apply(this, arguments);
		straightFlow.pushFlowEntry(RecoveryHpFlowEntry);
		straightFlow.pushFlowEntry(PursuitFlowEntry);
	};
})();

var RecoveryHpType = {
	FIXED: 0,
	RATE: 1
};

var PursuitDamageType = {
	FIXED: 0,
	RATE: 1	
};

var RecoveryHpFlowEntry = defineObject(BaseFlowEntry,
{	
	_dynamicEvent: null,

	enterFlowEntry: function(preAttack) {
		this._prepareMemberData(preAttack);
		return this._completeMemberData(preAttack);
	},
	
	moveFlowEntry: function() {
		return this._dynamicEvent.moveDynamicEvent();
	},
	
	_prepareMemberData: function(preAttack) {
		this._dynamicEvent = createObject(DynamicEvent);
	},
	
	_completeMemberData: function(preAttack) {
		var activeUnit = preAttack.getActiveUnit();
		var passiveUnit = preAttack.getPassiveUnit();
		var generator = this._dynamicEvent.acquireEventGenerator();
		this._setDynamicEvent(activeUnit, generator);
		this._setDynamicEvent(passiveUnit, generator);
		return this._dynamicEvent.executeDynamicEvent();
	},

	_setDynamicEvent: function(unit, generator) {
		var effect;
		var skill = SkillControl.getPossessionCustomSkill(unit, 'RecoveryHpAfterBattle');
		
		if (!this._isEnableSkill(unit, skill)) {
			return;
		}
		effect = this._getRecoveryEffect(skill);
		generator.locationFocus(unit.getMapX(), unit.getMapY(), true); 
		generator.hpRecovery(
			unit,
			effect,
			this._getRecoveryValue(unit, skill),
			RecoveryType.SPECIFY,
			false
		);
	},

	_getRecoveryEffect: function(skill) {
		var isRuntime = skill.custom.recoveryHpAfterBattle.effect.isRuntime;
		var id = skill.custom.recoveryHpAfterBattle.effect.id;
		return root.getBaseData().getEffectAnimationList(isRuntime).getDataFromId(id);
	},

	_getRecoveryValue: function(unit, skill) {
		if (skill.custom.recoveryHpAfterBattle.type === RecoveryHpType.FIXED) {
			return skill.custom.recoveryHpAfterBattle.value;
		}
		else if (skill.custom.recoveryHpAfterBattle.type === RecoveryHpType.RATE) {
			return Math.floor(ParamBonus.getMhp(unit) * skill.custom.recoveryHpAfterBattle.value);
		}
		else {
			return skill.custom.recoveryHpAfterBattle.value;
		}
	},

	_isEnableSkill: function(unit, skill) {
		if (!skill) {
			return false;
		}
		if (!validateRecoveryHpAfterBattleSkill(skill)) {
			return false;
		}
		if (unit.getAliveState() !== AliveType.ALIVE) {
			return false;
		}
		if (unit.getHp() >= ParamBonus.getMhp(unit)) {
			return false;
		}
		return true;
	}
}
);

var PursuitFlowEntry = defineObject(BaseFlowEntry,
{	
	_dynamicEvent: null,

	enterFlowEntry: function(preAttack) {
		this._prepareMemberData(preAttack);
		return this._completeMemberData(preAttack);
	},
	
	moveFlowEntry: function() {
		return this._dynamicEvent.moveDynamicEvent();
	},
	
	_prepareMemberData: function(preAttack) {
		this._dynamicEvent = createObject(DynamicEvent);
	},
	
	_completeMemberData: function(preAttack) {
		var activeUnit = preAttack.getActiveUnit();
		var passiveUnit = preAttack.getPassiveUnit();
		var generator = this._dynamicEvent.acquireEventGenerator();
		this._setDynamicEvent(activeUnit, passiveUnit, generator);
		this._setDynamicEvent(passiveUnit, activeUnit, generator);
		return this._dynamicEvent.executeDynamicEvent();
	},

	_setDynamicEvent: function(unit, targetUnit, generator) {
		var effect;
		var skill = SkillControl.getPossessionCustomSkill(unit, 'Pursuit');
		
		if (!this._isEnableSkill(unit, targetUnit, skill)) {
			return;
		}
		effect = this._getDamageEffect(skill);
		generator.locationFocus(targetUnit.getMapX(), targetUnit.getMapY(), true); 
		generator.damageHit(
			targetUnit,
			effect,
			this._getDamageValue(targetUnit, skill),
			DamageType.FIXED,
			unit,
			false
		);
	},

	_getDamageEffect: function(skill) {
		var isRuntime = skill.custom.pursuit.effect.isRuntime;
		var id = skill.custom.pursuit.effect.id;
		return root.getBaseData().getEffectAnimationList(isRuntime).getDataFromId(id);
	},

	_getDamageValue: function(targetUnit, skill) {
		var damage;
		var isFinish = skill.custom.pursuit.isFinish;
		var currentHp = targetUnit.getHp();
		if (skill.custom.pursuit.type === PursuitDamageType.FIXED) {
			damage = skill.custom.pursuit.value;
		}
		else if (skill.custom.pursuit.type === PursuitDamageType.RATE) {
			damage = Math.floor(ParamBonus.getMhp(targetUnit) * skill.custom.pursuit.value);
		}
		else {
			damage = skill.custom.pursuit.value;
		}
		if (!isFinish && currentHp - damage <= 0) {
			damage = currentHp - 1;
		}
		return damage;
	},

	_isEnableSkill: function(unit, targetUnit, skill) {
		if (!skill) {
			return false;
		}
		if (!validatePursuitSkill(skill)) {
			return false;
		}
		if (unit.getAliveState() !== AliveType.ALIVE) {
			return false;
		}
		if (targetUnit.getAliveState() !== AliveType.ALIVE) {
			return false;
		}
		return true;
	}
}
);

var validateRecoveryHpAfterBattleSkill = function(skill) {
	if (typeof skill.custom.recoveryHpAfterBattle !== 'object') {
		return false;
	}
	if (
		!('type' in skill.custom.recoveryHpAfterBattle) ||
		!('value' in skill.custom.recoveryHpAfterBattle) || 
		!('effect' in skill.custom.recoveryHpAfterBattle)
	) {
		root.log('invalid recoveryHpAfterBattle parameter');
		return false;
	}
	if (
		typeof skill.custom.recoveryHpAfterBattle.type !== 'number' ||
		typeof skill.custom.recoveryHpAfterBattle.value !== 'number' ||
		typeof skill.custom.recoveryHpAfterBattle.effect !== 'object'
	) {
		root.log('invalid recoveryHpAfterBattle parameter');
		return false;
	}
	if (
		!('isRuntime' in skill.custom.recoveryHpAfterBattle.effect) ||
		!('id' in skill.custom.recoveryHpAfterBattle.effect)
	) {
		root.log('invalid recoveryHpAfterBattle parameter');
		return false;
	}
	if (
		typeof skill.custom.recoveryHpAfterBattle.effect.isRuntime !== 'boolean' ||
		typeof skill.custom.recoveryHpAfterBattle.effect.id !== 'number'
	) {
		root.log('invalid recoveryHpAfterBattle parameter');
		return false;
	}
	return true;
};

var validatePursuitSkill = function(skill) {
	if (typeof skill.custom.pursuit !== 'object') {
		return false;
	}
	if (
		!('type' in skill.custom.pursuit) ||
		!('value' in skill.custom.pursuit) || 
		!('effect' in skill.custom.pursuit) || 
		!('isFinish' in skill.custom.pursuit)
	) {
		root.log('invalid pursuit parameter');
		return false;
	}
	if (
		typeof skill.custom.pursuit.type !== 'number' ||
		typeof skill.custom.pursuit.value !== 'number' ||
		typeof skill.custom.pursuit.effect !== 'object' ||
		typeof skill.custom.pursuit.isFinish !== 'boolean'
	) {
		root.log('invalid pursuit parameter');
		return false;
	}
	if (
		!('isRuntime' in skill.custom.pursuit.effect) ||
		!('id' in skill.custom.pursuit.effect)
	) {
		root.log('invalid pursuit parameter');
		return false;
	}
	if (
		typeof skill.custom.pursuit.effect.isRuntime !== 'boolean' ||
		typeof skill.custom.pursuit.effect.id !== 'number'
	) {
		root.log('invalid pursuit parameter');
		return false;
	}
	return true;
};
/*
　パラメータスキルに発動率を追加する

■作成者
キュウブ

■概要
パラメータスキルのカスパラを入れると発動率が反映されるようになります

■使い方
1.カスパラを入れるだけ(HPがn%以下の時に発動となる)
{extraInvocation: n}
※最大HPはクラス補正と素のパラメータだけで計算している。

■更新履歴

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
*/

BaseUnitParameter.getUnitTotalParamBonus = function(unit, weapon) {
	var i, count, item, n, id, objectFlag, skill;
	var d = 0;
	var arr = [];
		
	// 武器のパラメータボーナス
	if (weapon !== null) {
		d += this.getParameterBonus(weapon);
	}
		
	// アイテムのパラメータボーナス
	count = UnitItemControl.getPossessionItemCount(unit);
	for (i = 0; i < count; i++) {
		item = UnitItemControl.getItem(unit, i);
		if (item !== null && !item.isWeapon()) {
			id = item.getId();
			if (arr.indexOf(id) !== -1) {
				continue;
			}
			arr.push(id);
			
			n = this.getParameterBonus(item);
			// アイテムを使用できないユニットは、補正が加算されない
			if (n !== 0 && ItemControl.isItemUsable(unit, item)) {
				d += n;
			}
		}
	}

	// パラメータボーナスのスキルを確認する。
	// 武器、アイテムはパラメータボーナススキルではなく、
	// 直接パラメータボーナスを設定しているものとする。
	objectFlag = ObjectFlag.UNIT | ObjectFlag.CLASS | Object.STATE | ObjectFlag.TERRAIN;
	arr = SkillControl.getSkillObjectArray(unit, weapon, SkillType.PARAMBONUS, '', objectFlag);
	count = arr.length;
	for (i = 0; i < count; i++) {
		skill = arr[i].skill;
		if (typeof skill.custom.extraInvocation === 'number') {
			if (unit.getHp() > skill.custom.extraInvocation / 100 * ParamGroup.getClassUnitValue(unit, ParamType.MHP)) {
				continue;
			}
		}
		d += this.getParameterBonus(skill);
	}
	
	return d;
};
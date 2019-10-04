/*--------------------------------------------------------------------------
　特定のステートを防ぐスキル ver 1.0

■作成者
キュウブ

■概要
カスタムスキル"stateGuard"で特定ステートを防ぐ事ができる。

■使い方
スキルのカスパラに下記のように防ぎたいステートIDを設定する
{guardStateID:<ステートID>}

■更新履歴
ver 1.0 (2019/10/2)
初版作成

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
	var alias = StateControl.isStateBlocked;
	StateControl.isStateBlocked = function(unit, targetUnit, state) {
		var skills;
		
		if (state === null) {
			return false;
		}
		skills = SkillControl.getDirectSkillArray(unit, SkillType.CUSTOM, 'stateGuard');

		for (var index = 0; index < skills.length; index++) {
			
			if (skills[index].skill.custom.guardStateID === state.getID()) {
				return true;
			}
		};
		
		return alias.call(this, unit, targetUnit, state);
	};
})();
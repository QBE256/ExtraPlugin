/*
        非表示フラグを立てたスキルはスキル一覧画面で表示されなくなるスクリプト
        製作者:キュウブ
*/
(function(){
    var _SkillScreen__isSkillAllowed = SkillScreen._isSkillAllowed;
    SkillScreen._isSkillAllowed = function(skill) {
        return !skill.isHidden() && _SkillScreen__isSkillAllowed.apply(this, arguments);
    };
})();
/*--------------------------------------------------------------------------
�@�������f�Z�[�u�@�\ ver1.0
���쐬��
�L���E�u

���T�v
���j�b�g���ҋ@����x�Ɏ����Œ��f�Z�[�u���s���܂�
�G�^�[�����Ƀ��Z�b�g����ƍĊJ���ɓG�^�[������n�܂����肵�܂�

�����O����
���� �K�{�ݒ�1
system-intteruption(�������f�Z�[�u�X�N���v�g�p).js�ƕ��p���邩�A
�����ɔz�z����Ă���system-intteruption.js�����L�̂悤�ɏC�����Ă�������
--------------------------------------------------------
TitleCommand.Interruption.openCommand��
root.getLoadSaveManager().loadInterruptionFile();�̒��O��

AutoSavedControl.setCustomParameter();
��ǉ�����
---------------------------------------------------------
���� �K�{�ݒ�2
�ҋ@�C�x���g�Ń}�b�v�N���A���ݒ肳��Ă����ꍇ�A
���̃C�x���g���Łu�C�x���g�̏�ԕύX�v�Ŏ��g�̎��s�ς݉������s���悤�ɂ��Ă��������B
���G���f�B���O�C�x���g��������ɃQ�[�����I�����Ē��f�f�[�^�����[�h����ƁA�G���f�B���O�����������ɃN���A�s�\�ɂȂ邽��

���X�V����
ver1.0 2017/07/19
����

���Ή��o�[�W����
SRPG Studio Version:1.137

���K��
�E���p��SRPG Studio���g�����Q�[���Ɍ���܂��B
�E���p�E�񏤗p�₢�܂���B�t���[�ł��B
�E���H���A��肠��܂���B
�E�N���W�b�g���L�����@OK (���L����ꍇ��"�L���E�u"�ł��肢���܂�)
�E�Ĕz�z�A�]�ځ@OK (�o�O�Ȃǂ���������C���ł�����͂����g�ŏC���ł�z�z���Ă�����Ă��\���܂���)
�Ewiki�f�ځ@OK
�ESRPG Studio���p�K��͏��炵�Ă��������B

------------------------------------------------------*/

var AutoSavedControl = {
	_customParameter: null,

	register: function () {
		root.getLoadSaveManager().saveInterruptionFile(
			root.getBaseScene(),
			root.getCurrentSession().getCurrentMapInfo().getId(),
			this._getCustomObject()
		);
	},

	_getCustomObject: function () {
		var turnType = root.getCurrentSession().getTurnType();

		var result = {
			turnType: turnType
		};

		return result;
	},

	setCustomParameter: function () {
		this._customParameter = root.getLoadSaveManager().getInterruptionFileInfo().custom;
	},

	getCustomParameter: function () {
		return this._customParameter;
	},

	resetCustomParameter: function () {
		this._customParameter = null;
	}
};

(function () {
	var alias1 = PlayerTurn._doEventEndAction;
	PlayerTurn._doEventEndAction = function () {
		alias1.call(this);
		if (!GameOverChecker.isGameOver()) {
			AutoSavedControl.register();
		}
	};

	EnemyTurn._moveAutoAction = function () {
		if (this._autoActionArray[this._autoActionIndex].moveAutoAction() !== MoveResult.CONTINUE) {
			if (!this._countAutoActionIndex()) {
				AutoSavedControl.register();
				this._changeIdleMode(EnemyTurnMode.TOP, this._getIdleValue());
			}
		}

		return MoveResult.CONTINUE;
	};

	FreeAreaScene._completeSceneMemberData = function () {
		var handle, autoSaveCustomParameter;
		var map = root.getCurrentSession().getCurrentMapInfo();
		var type = root.getCurrentSession().getTurnType();

		if (root.getSceneController().isActivatedFromSaveFile()) {
			autoSaveCustomParameter = AutoSavedControl.getCustomParameter();

			if (autoSaveCustomParameter) {
				// �^�[�����X�V����
				if (typeof autoSaveCustomParameter.turnType === "number") {
					root.getCurrentSession().setTurnType(autoSaveCustomParameter.turnType);
					type = root.getCurrentSession().getTurnType();
				}

				// ���f�[�^�̃��[�h���ɎQ�Ƃ���鎖���Ȃ��悤��null�ɖ߂�
				AutoSavedControl.resetCustomParameter();
			}

			SceneManager.resetCurrentMap();

			SceneManager.setEffectAllRange(false);

			if (type === TurnType.PLAYER) {
				handle = map.getPlayerTurnMusicHandle();
				this.getTurnObject().setAutoCursorSave(true);
			} else if (type === TurnType.ALLY) {
				handle = map.getAllyTurnMusicHandle();
			} else {
				handle = map.getEnemyTurnMusicHandle();
			}

			MediaControl.clearMusicCache();
			MediaControl.musicPlayNew(handle);

			this._processMode(FreeAreaMode.MAIN);
		} else {
			this._processMode(FreeAreaMode.TURNSTART);
		}
	};
})();

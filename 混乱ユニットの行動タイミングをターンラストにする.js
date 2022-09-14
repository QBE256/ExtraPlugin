/*--------------------------------------------------------------------------
�^�[���I�����ɍ������j�b�g���s�������� ver1.2

���T�v
�������j�b�g���^�[���J�n���ɍs������d�l��ύX����

��recovery_support.js������ꍇ�͂������TurnChangeStart.pushFlowEntries�������A
��recovery_support.js����TurnChangeStart.pushFlowEntries�̒����ȉ��̂悤�ɕύX���鎖
//////////////////////////////////////////////////////////////////
TurnChangeStart.pushFlowEntries = function(straightFlow) {

	// �^�[���\�����s������
	if (this._isTurnAnimeEnabled()) {
		straightFlow.pushFlowEntry(TurnAnimeFlowEntry);
	}
	else {
		straightFlow.pushFlowEntry(TurnMarkFlowEntry);
	}
	straightFlow.pushFlowEntry(RecoveryAllFlowEntry);
	straightFlow.pushFlowEntry(MetamorphozeCancelFlowEntry);
	straightFlow.pushFlowEntry(StateTurnFlowEntry);
	straightFlow.insertFlowEntry(EntireRecoveryFlowEntry,1);
};
/////////////////////////////////////////////////////////////////

���X�V����
ver 1.2 2022/09/15
�ŐV�łɑΉ�

ver 1.1 2017/06/26
TurnChangeStart.pushFlowEntries�̏������ς�����̂ŏC��

ver 1.0 2017/06/06


���Ή��o�[�W����
�@SRPG Studio Version:1.267


���K��
�E���p��SRPG Studio���g�����Q�[���Ɍ���܂��B
�E���p�E�񏤗p�₢�܂���B�t���[�ł��B
�E���H���A��肠��܂���B�ǂ�ǂ�������Ă��������B
�E�N���W�b�g���L�����@OK
�E�Ĕz�z�A�]�ځ@OK
�ESRPG Studio���p�K��͏��炵�Ă��������B
  
--------------------------------------------------------------------------*/

(function () {
	// �^�[���J�n���̃C�x���g������BerserkFlowEntry����͂��鏈���𖳌�������K�v������
	TurnChangeStart.pushFlowEntries = function (straightFlow) {
		// �^�[���\�����s������
		if (this._isTurnAnimeEnabled()) {
			straightFlow.pushFlowEntry(TurnAnimeFlowEntry);
		} else {
			straightFlow.pushFlowEntry(TurnMarkFlowEntry);
		}
		straightFlow.pushFlowEntry(RecoveryAllFlowEntry);
		straightFlow.pushFlowEntry(MetamorphozeCancelFlowEntry);
		//straightFlow.pushFlowEntry(BerserkFlowEntry);
		straightFlow.pushFlowEntry(StateTurnFlowEntry);
	};

	var _TurnChangeEnd_pushFlowEntries = TurnChangeEnd.pushFlowEntries;
	TurnChangeEnd.pushFlowEntries = function (straightFlow) 
		straightFlow.pushFlowEntry(BerserkFlowEntry);
		_TurnChangeEnd_pushFlowEntries.apply(this, arguments);
	};
})();

// pages/index.js
import React, { useState } from 'react';
import { ClipboardCopy, BellRing } from 'lucide-react'; // �A�C�R���̃C���|�[�g

// ���C���A�v���P�[�V�����R���|�[�l���g
const Home = () => { // �R���|�[�l���g���� 'Home' �ɕύX (Next.js�̊��K�ɍ��킹��)
  // �ʒm�X�e�[�^�X���Ǘ������ԕϐ�
  const [notificationStatus, setNotificationStatus] = useState('');
  // Webhook�y�C���[�h�̕\����Ԃ��Ǘ������ԕϐ�
  const [webhookPayload, setWebhookPayload] = useState('');

  /**
   * LINE WORKS�ւ̒ʒm�𑗐M����񓯊��֐�
   * @param {string} message - LINE WORKS�ɑ��M���郁�b�Z�[�W
   */
  const sendLineWorksNotification = async (message) => {
    try {
      setNotificationStatus('LINE WORKS�ɒʒm�𑗐M��...');
      // ���[�U�[���w�肵���G���h�|�C���g��POST���N�G�X�g�𑗐M
      const response = await fetch('https://prod-11.japaneast.logic.azure.com:443/workflows/8b52f81a63e04774be8f15b3ec05777f/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=d89VVpI696zkqQNk5S4kfHNJzj0bY_NyLjfK5B-2LoU', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // �K�v�ɉ����ĔF�؃w�b�_�[�Ȃǂ�ǉ�
        },
        body: JSON.stringify({ text: message }), // ���b�Z�[�W��JSON�`���ő��M
      });

      // ���X�|���X��OK�X�e�[�^�X���m�F
      if (response.ok) {
        setNotificationStatus('LINE WORKS�ւ̒ʒm������ɑ��M����܂����B');
      } else {
        // �G���[���X�|���X�̏ꍇ
        const errorData = await response.text();
        setNotificationStatus(`LINE WORKS�ւ̒ʒm�Ɏ��s���܂���: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      // �l�b�g���[�N�G���[�Ȃǂ̗�O���L���b�`
      setNotificationStatus(`�ʒm�̑��M���ɃG���[���������܂���: ${error.message}`);
      console.error('�ʒm���M�G���[:', error);
    }
  };

  /**
   * Zoom Phone Webhook�y�C���[�h����������֐�
   * ���̗�ł́A�R�[���I�[�o�[�t���[���V�~�����[�g���܂��B
   * ���ۂ̃A�v���P�[�V�����ł́A���̊֐��̓T�[�o�[�T�C�h��Webhook����M���ČĂяo����܂��B
   */
  const handleZoomWebhook = () => {
    // Zoom Phone Webhook�̃V�~�����[�g���ꂽ�y�C���[�h
    // ���ۂ̃y�C���[�h�\���ɂ��Ă�Zoom Phone Webhook�̃h�L�������g���Q�Ƃ��Ă��������B
    const simulatedPayload = {
      event: "phone.call_ended", // �C�x���g�^�C�v������
      payload: {
        object: {
          callId: "call_id_12345",
          direction: "inbound",
          callOutcome: "overflow", // �R�[���I�[�o�[�t���[�������d�v�ȃt�B�[���h
          // ���̑��̊֘A�f�[�^
          callerNumber: "+819012345678",
          calleeNumber: "+81398765432",
          duration: 0, // �I�[�o�[�t���[�̏ꍇ�A�ʘb���Ԃ͒Z����0�ł���\��������܂�
          callStartTime: new Date().toISOString(),
          callEndTime: new Date().toISOString(),
        }
      }
    };

    setWebhookPayload(JSON.stringify(simulatedPayload, null, 2));

    // �C�x���g���R�[���I���ł���A���R�[�����ʂ��I�[�o�[�t���[�ł��邩���m�F
    if (simulatedPayload.event === "phone.call_ended" && simulatedPayload.payload.object.callOutcome === "overflow") {
      const message = `? �R�[���I�[�o�[�t���[�����I\n���M��: ${simulatedPayload.payload.object.callerNumber}\n���M��: ${simulatedPayload.payload.object.calleeNumber}\n�ʘbID: ${simulatedPayload.payload.object.callId}`;
      sendLineWorksNotification(message);
    } else {
      setNotificationStatus('�I�[�o�[�t���[�C�x���g�ł͂���܂���B');
    }
  };

  /**
   * �������ꂽWebhook�y�C���[�h���N���b�v�{�[�h�ɃR�s�[����֐�
   */
  const copyPayloadToClipboard = () => {
    if (webhookPayload) {
      // document.execCommand('copy') �͔񐄏��ł����Aiframe���ł�navigator.clipboard�����p�ł��Ȃ��ꍇ�����邽�ߎg�p
      const el = document.createElement('textarea');
      el.value = webhookPayload;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setNotificationStatus('Webhook�y�C���[�h���N���b�v�{�[�h�ɃR�s�[���܂����I');
    } else {
      setNotificationStatus('�R�s�[����y�C���[�h������܂���B');
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans antialiased">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Zoom Phone Webhook�ʒm�A�v��
        </h1>

        <p className="text-gray-600 mb-6 text-center">
          ���̃A�v���́AZoom Phone Webhook����̃R�[���I�[�o�[�t���[�C�x���g���V�~�����[�g���ALINE WORKS�ɒʒm�𑗐M���܂��B
          �ʒm�� <code className="bg-gray-200 p-1 rounded">https://prod-11.japaneast.logic.azure.com:443/workflows/8b52f81a63e04774be8f15b3ec05777f/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=d89VVpI696zkqQNk5S4kfHNJzj0bY_NyLjfK5B-2LoU</code> ��POST���N�G�X�g�Ƃ��đ��M����܂��B
        </p>

        {/* Webhook�V�~�����[�V�����{�^�� */}
        <button
          onClick={handleZoomWebhook}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
        >
          <BellRing size={20} />
          <span>�R�[���I�[�o�[�t���[���V�~�����[�g</span>
        </button>

        {/* �ʒm�X�e�[�^�X�̕\�� */}
        {notificationStatus && (
          <div className={`mt-6 p-4 rounded-lg text-sm ${notificationStatus.includes('����') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {notificationStatus}
          </div>
        )}

        {/* �V�~�����[�g���ꂽWebhook�y�C���[�h�̕\�� */}
        {webhookPayload && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">�V�~�����[�g���ꂽWebhook�y�C���[�h:</h2>
            <pre className="whitespace-pre-wrap break-words text-gray-800 text-xs bg-gray-100 p-3 rounded-md overflow-x-auto max-h-60">
              {webhookPayload}
            </pre>
            <button
              onClick={copyPayloadToClipboard}
              className="absolute top-4 right-4 bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-full transition duration-200 ease-in-out"
              title="�y�C���[�h���R�s�["
            >
              <ClipboardCopy size={16} />
            </button>
          </div>
        )}

        <div className="mt-8 text-xs text-gray-500 text-center">
          �����̃A�v���̓N���C�A���g�T�C�h�œ��삷�邽�߁AWebhook�̎�M�̓T�[�o�[�T�C�h�Ŏ�������K�v������܂��B
          �u�R�[���I�[�o�[�t���[���V�~�����[�g�v�{�^���́AZoom Phone Webhook����̃C�x���g������͕킵�Ă��܂��B
        </div>
      </div>
    </div>
  );
};

export default Home;

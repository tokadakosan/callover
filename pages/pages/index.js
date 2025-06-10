// pages/index.js
import React, { useState } from 'react';
import { ClipboardCopy, BellRing } from 'lucide-react'; // アイコンのインポート

// メインアプリケーションコンポーネント
const Home = () => { // コンポーネント名を 'Home' に変更 (Next.jsの慣習に合わせて)
  // 通知ステータスを管理する状態変数
  const [notificationStatus, setNotificationStatus] = useState('');
  // Webhookペイロードの表示状態を管理する状態変数
  const [webhookPayload, setWebhookPayload] = useState('');

  /**
   * LINE WORKSへの通知を送信する非同期関数
   * @param {string} message - LINE WORKSに送信するメッセージ
   */
  const sendLineWorksNotification = async (message) => {
    try {
      setNotificationStatus('LINE WORKSに通知を送信中...');
      // ユーザーが指定したエンドポイントにPOSTリクエストを送信
      const response = await fetch('https://prod-11.japaneast.logic.azure.com:443/workflows/8b52f81a63e04774be8f15b3ec05777f/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=d89VVpI696zkqQNk5S4kfHNJzj0bY_NyLjfK5B-2LoU', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 必要に応じて認証ヘッダーなどを追加
        },
        body: JSON.stringify({ text: message }), // メッセージをJSON形式で送信
      });

      // レスポンスのOKステータスを確認
      if (response.ok) {
        setNotificationStatus('LINE WORKSへの通知が正常に送信されました。');
      } else {
        // エラーレスポンスの場合
        const errorData = await response.text();
        setNotificationStatus(`LINE WORKSへの通知に失敗しました: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      // ネットワークエラーなどの例外をキャッチ
      setNotificationStatus(`通知の送信中にエラーが発生しました: ${error.message}`);
      console.error('通知送信エラー:', error);
    }
  };

  /**
   * Zoom Phone Webhookペイロードを処理する関数
   * この例では、コールオーバーフローをシミュレートします。
   * 実際のアプリケーションでは、この関数はサーバーサイドでWebhookを受信して呼び出されます。
   */
  const handleZoomWebhook = () => {
    // Zoom Phone Webhookのシミュレートされたペイロード
    // 実際のペイロード構造についてはZoom Phone Webhookのドキュメントを参照してください。
    const simulatedPayload = {
      event: "phone.call_ended", // イベントタイプを仮定
      payload: {
        object: {
          callId: "call_id_12345",
          direction: "inbound",
          callOutcome: "overflow", // コールオーバーフローを示す重要なフィールド
          // その他の関連データ
          callerNumber: "+819012345678",
          calleeNumber: "+81398765432",
          duration: 0, // オーバーフローの場合、通話時間は短いか0である可能性があります
          callStartTime: new Date().toISOString(),
          callEndTime: new Date().toISOString(),
        }
      }
    };

    setWebhookPayload(JSON.stringify(simulatedPayload, null, 2));

    // イベントがコール終了であり、かつコール結果がオーバーフローであるかを確認
    if (simulatedPayload.event === "phone.call_ended" && simulatedPayload.payload.object.callOutcome === "overflow") {
      const message = `? コールオーバーフロー発生！\n発信者: ${simulatedPayload.payload.object.callerNumber}\n着信先: ${simulatedPayload.payload.object.calleeNumber}\n通話ID: ${simulatedPayload.payload.object.callId}`;
      sendLineWorksNotification(message);
    } else {
      setNotificationStatus('オーバーフローイベントではありません。');
    }
  };

  /**
   * 生成されたWebhookペイロードをクリップボードにコピーする関数
   */
  const copyPayloadToClipboard = () => {
    if (webhookPayload) {
      // document.execCommand('copy') は非推奨ですが、iframe環境ではnavigator.clipboardが利用できない場合があるため使用
      const el = document.createElement('textarea');
      el.value = webhookPayload;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setNotificationStatus('Webhookペイロードをクリップボードにコピーしました！');
    } else {
      setNotificationStatus('コピーするペイロードがありません。');
    }
  };


  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans antialiased">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Zoom Phone Webhook通知アプリ
        </h1>

        <p className="text-gray-600 mb-6 text-center">
          このアプリは、Zoom Phone Webhookからのコールオーバーフローイベントをシミュレートし、LINE WORKSに通知を送信します。
          通知は <code className="bg-gray-200 p-1 rounded">https://prod-11.japaneast.logic.azure.com:443/workflows/8b52f81a63e04774be8f15b3ec05777f/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=d89VVpI696zkqQNk5S4kfHNJzj0bY_NyLjfK5B-2LoU</code> にPOSTリクエストとして送信されます。
        </p>

        {/* Webhookシミュレーションボタン */}
        <button
          onClick={handleZoomWebhook}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
        >
          <BellRing size={20} />
          <span>コールオーバーフローをシミュレート</span>
        </button>

        {/* 通知ステータスの表示 */}
        {notificationStatus && (
          <div className={`mt-6 p-4 rounded-lg text-sm ${notificationStatus.includes('成功') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {notificationStatus}
          </div>
        )}

        {/* シミュレートされたWebhookペイロードの表示 */}
        {webhookPayload && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">シミュレートされたWebhookペイロード:</h2>
            <pre className="whitespace-pre-wrap break-words text-gray-800 text-xs bg-gray-100 p-3 rounded-md overflow-x-auto max-h-60">
              {webhookPayload}
            </pre>
            <button
              onClick={copyPayloadToClipboard}
              className="absolute top-4 right-4 bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-full transition duration-200 ease-in-out"
              title="ペイロードをコピー"
            >
              <ClipboardCopy size={16} />
            </button>
          </div>
        )}

        <div className="mt-8 text-xs text-gray-500 text-center">
          ※このアプリはクライアントサイドで動作するため、Webhookの受信はサーバーサイドで実装する必要があります。
          「コールオーバーフローをシミュレート」ボタンは、Zoom Phone Webhookからのイベント発生を模倣しています。
        </div>
      </div>
    </div>
  );
};

export default Home;

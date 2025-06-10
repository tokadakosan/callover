// pages/api/webhook.js

// LINE WORKS通知のエンドポイントURL
const LINE_WORKS_NOTIFICATION_URL = "https://prod-11.japaneast.logic.azure.com:443/workflows/8b52f81a63e04774be8f15b3ec05777f/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=d89VVpI696zkqQNk5S4kfHNJzj0bY_NyLjfK5B-2LoU";

/**
 * LINE WORKSに通知をPOSTリクエストで送信します。
 * @param {string} message - LINE WORKSに送信するメッセージ
 */
async function sendLineWorksNotification(message) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      // 必要に応じて、LINE WORKS APIに認証ヘッダーなどを追加する
      // 例: 'Authorization': 'Bearer YOUR_LINE_WORKS_ACCESS_TOKEN'
    };
    const data = {
      text: message
    };

    // LINE WORKSへのPOSTリクエストを送信
    const response = await fetch(LINE_WORKS_NOTIFICATION_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data),
    });

    // HTTPエラーがあれば例外を発生させる
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}, Body: ${errorText}`);
    }

    console.log(`LINE WORKS notification sent successfully. Status: ${response.status}`);
  } catch (error) {
    console.error(`Failed to send notification to LINE WORKS: ${error.message}`);
    // ここでエラーを再スローすることも検討できますが、Webhookの応答に影響を与えないようにログに記録するだけにすることも可能です。
  }
}

/**
 * Zoom Phone WebhookからのPOSTリクエストを処理するAPIルートハンドラです。
 * @param {import('next').NextApiRequest} req - Next.js APIリクエストオブジェクト
 * @param {import('next').NextApiResponse} res - Next.js APIレスポンスオブジェクト
 */
export default async function handler(req, res) {
  // POSTメソッドのみを受け入れる
  if (req.method !== 'POST') {
    console.log(`Method Not Allowed: ${req.method}`);
    return res.status(405).json({ status: "error", message: "Method Not Allowed" });
  }

  try {
    // リクエストボディからJSONデータを取得
    const data = req.body;

    if (!data) {
      console.log("Received request with no JSON data.");
      return res.status(400).json({ status: "error", message: "Request must be JSON" });
    }

    console.log(`Received Zoom Webhook: ${JSON.stringify(data, null, 2)}`);

    // Zoom Phone Webhookのイベントタイプとペイロードをチェック
    const eventType = data.event;
    const payload = data.payload || {};
    const objectData = payload.object || {};

    // コール終了イベントであり、かつコール結果がオーバーフローであるかを確認
    if (eventType === "phone.call_ended" && objectData.callOutcome === "overflow") {
      const callId = objectData.callId || 'N/A';
      const callerNumber = objectData.callerNumber || 'N/A';
      const calleeNumber = objectData.calleeNumber || 'N/A';

      // LINE WORKSに送信するメッセージを構築
      const notificationMessage = (
        `🚨 コールオーバーフロー発生！\n` +
        `発信者: ${callerNumber}\n` +
        `着信先: ${calleeNumber}\n` +
        `通話ID: ${callId}`
      );

      console.log(`Detected Call Overflow. Sending notification to LINE WORKS: ${notificationMessage}`);
      // LINE WORKSへの通知を送信 (非同期で実行し、Webhookの応答をブロックしない)
      await sendLineWorksNotification(notificationMessage);

      return res.status(200).json({ status: "success", message: "Call overflow detected and notification sent" });
    } else {
      // オーバーフローイベントではない場合
      console.log(`Received non-overflow event or unexpected event type: ${eventType}`);
      return res.status(200).json({ status: "success", message: "Event received, but not a call overflow event" });
    }

  } catch (error) {
    // 例外発生時のエラーハンドリング
    console.error(`Error processing webhook: ${error.message}`);
    return res.status(500).json({ status: "error", message: error.message });
  }
}

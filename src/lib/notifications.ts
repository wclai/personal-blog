export async function sendWelcomeEmail(email: string, name: string) {
  const webhookUrl = process.env.N8N_REGISTRATION_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn("n8n Webhook URL is not set. Registration email will not be sent.");
    return;
  }

  try {
    // 使用 fire-and-forget 模式，或是等待結果
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, timestamp: new Date().toISOString() }),
    });

    if (!response.ok) throw new Error("n8n 回傳錯誤");
  } catch (error) {
    // 這裡只記錄錯誤，不拋出異常，以免中斷用戶註冊流程
    console.error("Registration email failed to send", error);
  }
}
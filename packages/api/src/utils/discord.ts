export async function sendToWebhook(url: string, msg: string) {
  //send the timestamp and the args to the webhook
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: msg }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.fatal("Error sending to webhook", errorData);
      return;
    }
  } catch (err) {
    console.error("Error sending to webhook", err);
  }
}

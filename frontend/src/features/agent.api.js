import api from "../utils/axios";

export const sendPrompt = async (payload) => {
  const { data } = await api.post("/api/agent/chat", payload);
  console.log(data)
  return data;
};

export const sendPromptStream = async (payload, callbacks) => {
  const { onStart, onToken, onComplete, onError, signal } = callbacks;

  try {
    // We use native fetch here because Axios doesn't handle streams natively well
    const response = await fetch(`/api/agent/chat`, {
      method: "POST",
      body: payload,
      credentials: "include", // Very important to send auth cookies exactly like Axios does!
      signal, // Attach AbortController signal
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || "Unauthorized");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let done = false;
    let buffer = "";

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;

      if (value) {
        const chunkStr = decoder.decode(value, { stream: true });
        buffer += chunkStr;

        // Split by SSE double newline boundaries
        const events = buffer.split("\n\n");
        // Keep the last part in the buffer if it's incomplete
        buffer = events.pop() || "";

        for (const eventStr of events) {
          if (eventStr.trim().startsWith("data: ")) {
            const dataStr = eventStr.replace("data: ", "").trim();
            if (!dataStr) continue;

            try {
              const parsed = JSON.parse(dataStr);

              switch (parsed.type) {
                case "start":
                  onStart?.(parsed.messageId);
                  break;
                case "token":
                  onToken?.(parsed.content);
                  break;
                case "done":
                  onComplete?.(parsed);
                  break;
                case "error":
                  throw new Error(parsed.message);
              }
            } catch (err) {
              console.warn("Failed to parse SSE JSON:", dataStr, err);
            }
          }
        }
      }
    }
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("Stream aborted by user");
    } else {
      console.error("Stream Error:", error);
      onError?.(error);
    }
  }
};

export const generateChatTitle = async (prompt) => {
  try {
    const { data } = await api.post("/api/agent/title", { prompt });
    return data.title;
  } catch (error) {
    console.error("Failed to generate title", error);
    return prompt.slice(0, 40);
  }
};
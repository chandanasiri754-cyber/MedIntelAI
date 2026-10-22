
const chatMessages = document.getElementById("chatMessages");
const assistantInput = document.getElementById("assistantInput");
const sendButton = document.querySelector(".chat-input button");

const conversation = [];
let isSending = false;

function addMessage(text, sender) {
    const message = document.createElement("div");

    message.className =
        sender === "user"
            ? "chat-message user-message"
            : "chat-message bot-message";

    // Use textContent so responses are displayed safely.
    message.textContent = text;
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    return message;
}

async function sendMessage() {
    if (isSending) return;

    const question = assistantInput.value.trim();

    if (!question) return;

    assistantInput.value = "";
    addMessage(question, "user");

    conversation.push({
        role: "user",
        content: question
    });

    // Keep recent context to limit the request size.
    while (conversation.length > 10) {
        conversation.shift();
    }

    isSending = true;
    assistantInput.disabled = true;
    sendButton.disabled = true;

    const loadingMessage = addMessage(
        "Thinking... Please wait.",
        "bot"
    );

    try {
        const response = await fetch(
            "http://127.0.0.1:5000/api/health-assistant",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    messages: conversation
                })
            }
        );

        const data = await response.json();
        loadingMessage.remove();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "The AI service returned an error."
            );
        }

        addMessage(data.reply, "bot");

        conversation.push({
            role: "assistant",
            content: data.reply
        });

        while (conversation.length > 10) {
            conversation.shift();
        }

    } catch (error) {
        loadingMessage.remove();

        console.error("AI Health Assistant error:", error);

        addMessage(
            "Sorry, I couldn't connect to the AI assistant. " +
            "Please check that Flask is running, your Gemini API key " +
            "is configured, and the backend route is available. " +
            "Then try again.",
            "bot"
        );
    } finally {
        isSending = false;
        assistantInput.disabled = false;
        sendButton.disabled = false;
        assistantInput.focus();
    }
}

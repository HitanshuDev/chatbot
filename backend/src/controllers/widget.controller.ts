import { Request, Response } from "express";
import Bot from "../models/bot.model";

export const getWidgetScript = async (req: Request, res: Response) => {
  try {
    const { botId } = req.params;

    const bot = await Bot.findById(botId).select(
      "name avatar theme initialPrompt"
    );

    if (!bot) {
      return res.status(404).json({ error: "Bot not found" });
    }

    const apiUrl = process.env.API_URL || "http://localhost:3000";

    const script = `
(function() {
  const botId = '${botId}';
  const apiUrl = '${apiUrl}';
  
  // Create widget container
  const container = document.createElement('div');
  container.id = 'ai-chatbot-widget';
  container.style.cssText = \`
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 400px;
    height: 600px;
    border-radius: 12px;
    box-shadow: 0 5px 40px rgba(0,0,0,0.16);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    background: white;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  \`;
  
  // Create header
  const header = document.createElement('div');
  header.style.cssText = \`
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    border-radius: 12px 12px 0 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  \`;
  header.innerHTML = \`
    <div>
      <h3 style="margin: 0; font-size: 18px;">${bot.name}</h3>
      <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">Online</p>
    </div>
    <button id="close-widget" style="background: none; border: none; color: white; cursor: pointer; font-size: 20px;">×</button>
  \`;
  
  // Create messages container
  const messagesContainer = document.createElement('div');
  messagesContainer.id = 'messages-container';
  messagesContainer.style.cssText = \`
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  \`;
  
  // Create input area
  const inputArea = document.createElement('div');
  inputArea.style.cssText = \`
    padding: 15px;
    border-top: 1px solid #eee;
    display: flex;
    gap: 10px;
  \`;
  
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Type a message...';
  input.style.cssText = \`
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 20px;
    outline: none;
    font-size: 14px;
  \`;
  
  const sendBtn = document.createElement('button');
  sendBtn.innerHTML = '→';
  sendBtn.style.cssText = \`
    background: #667eea;
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    cursor: pointer;
    font-size: 20px;
  \`;
  
  inputArea.appendChild(input);
  inputArea.appendChild(sendBtn);
  
  container.appendChild(header);
  container.appendChild(messagesContainer);
  container.appendChild(inputArea);
  document.body.appendChild(container);
  
  let conversationId = null;
  
  // Initialize conversation
  async function initConversation() {
    try {
      const response = await fetch(\`\${apiUrl}/v1/bots/\${botId}/conversations\`, {
        method: 'POST',
      });
      const data = await response.json();
      conversationId = data.conversation.id;
    } catch (error) {
      console.error('Failed to initialize conversation:', error);
    }
  }
  
  // Send message
  async function sendMessage() {
    const content = input.value.trim();
    if (!content) return;
    
    // Add user message to UI
    const userMsg = document.createElement('div');
    userMsg.style.cssText = \`
      align-self: flex-end;
      background: #667eea;
      color: white;
      padding: 10px 15px;
      border-radius: 18px;
      max-width: 80%;
      word-wrap: break-word;
    \`;
    userMsg.textContent = content;
    messagesContainer.appendChild(userMsg);
    
    input.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    try {
      const response = await fetch(
        \`\${apiUrl}/v1/conversations/\${conversationId}/messages\`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        }
      );
      
      const data = await response.json();
      const botMsg = document.createElement('div');
      botMsg.style.cssText = \`
        align-self: flex-start;
        background: #f0f0f0;
        color: #333;
        padding: 10px 15px;
        border-radius: 18px;
        max-width: 80%;
        word-wrap: break-word;
      \`;
      botMsg.textContent = data.message.content;
      messagesContainer.appendChild(botMsg);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }
  
  // Event listeners
  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
  
  document.getElementById('close-widget').addEventListener('click', () => {
    container.remove();
  });
  
  // Initialize
  initConversation();
})();
    `.trim();

    res.setHeader("Content-Type", "application/javascript");
    res.send(script);
  } catch (error) {
    console.error("Get widget script error:", error);
    res.status(500).json({ error: "Failed to generate widget" });
  }
};

export const getWidgetConfig = async (req: Request, res: Response) => {
  try {
    const { botId } = req.params;

    const bot = await Bot.findById(botId).select(
      "name avatar theme initialPrompt"
    );

    if (!bot) {
      return res.status(404).json({ error: "Bot not found" });
    }

    res.json({
      config: {
        botId: bot._id,
        name: bot.name,
        avatar: bot.avatar,
        theme: bot.theme,
      },
    });
  } catch (error) {
    console.error("Get widget config error:", error);
    res.status(500).json({ error: "Failed to fetch widget config" });
  }
};

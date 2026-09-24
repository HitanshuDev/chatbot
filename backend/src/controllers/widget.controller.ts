import { Request, Response } from "express";
import Bot from "../models/bot.model";

// Bot names are user-supplied and end up inside a script served to third-party
// sites, so they must be embedded as a JS string literal rather than
// interpolated as code. Escaping "</" additionally keeps the payload safe if a
// caller ever inlines this script into HTML.
const toJsString = (value: string) =>
  JSON.stringify(value ?? "").replace(/<\//g, "<\\/");

export const getWidgetScript = async (req: Request, res: Response) => {
  try {
    const { botId } = req.params;

    const bot = await Bot.findById(botId).select("name avatar theme");

    if (!bot) {
      res.setHeader("Content-Type", "application/javascript; charset=utf-8");
      return res
        .status(404)
        .send(`console.error("[chatbot] Bot ${toJsString(botId)} not found");`);
    }

    const apiUrl = process.env.API_URL || "http://localhost:5000";

    const script = `
(function () {
  if (window.__aiChatbotLoaded) return;
  window.__aiChatbotLoaded = true;

  var botId = ${toJsString(String(bot._id))};
  var apiUrl = ${toJsString(apiUrl)};
  var botName = ${toJsString(bot.name)};

  var PREFIX = 'aicb';
  var css = [
    '.' + PREFIX + '-launcher{position:fixed;bottom:20px;right:20px;width:56px;height:56px;border-radius:50%;background:#2a78d6;color:#fff;border:none;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.24);z-index:2147483001;display:flex;align-items:center;justify-content:center;padding:0;transition:transform .2s ease,box-shadow .2s ease;}',
    '.' + PREFIX + '-launcher:hover{transform:scale(1.05);box-shadow:0 6px 20px rgba(0,0,0,.28);}',
    '.' + PREFIX + '-launcher:active{transform:scale(.96);}',
    '.' + PREFIX + '-ico{position:absolute;width:26px;height:26px;display:block;transition:opacity .18s ease,transform .26s cubic-bezier(.16,1,.3,1);}',
    '.' + PREFIX + '-ico-close{opacity:0;transform:rotate(-90deg) scale(.5);}',
    '.' + PREFIX + '-launcher.' + PREFIX + '-active .' + PREFIX + '-ico-chat{opacity:0;transform:rotate(90deg) scale(.5);}',
    '.' + PREFIX + '-launcher.' + PREFIX + '-active .' + PREFIX + '-ico-close{opacity:1;transform:rotate(0) scale(1);}',
    '.' + PREFIX + '-panel{position:fixed;bottom:88px;right:20px;width:380px;height:min(600px,calc(100vh - 120px));background:#fff;border-radius:12px;box-shadow:0 8px 40px rgba(0,0,0,.18);z-index:2147483000;display:flex;flex-direction:column;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#0b0b0b;opacity:0;visibility:hidden;transform:translateY(24px) scale(.97);transform-origin:bottom right;transition:opacity .2s ease,transform .28s cubic-bezier(.16,1,.3,1),visibility .28s;}',
    '.' + PREFIX + '-panel.' + PREFIX + '-open{opacity:1;visibility:visible;transform:translateY(0) scale(1);}',
    '.' + PREFIX + '-head{background:#2a78d6;color:#fff;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;flex:0 0 auto;}',
    '.' + PREFIX + '-title{font-size:15px;font-weight:600;margin:0;line-height:1.3;}',
    '.' + PREFIX + '-sub{font-size:12px;margin:2px 0 0;opacity:.85;}',
    '.' + PREFIX + '-x{background:none;border:none;color:#fff;font-size:22px;line-height:1;cursor:pointer;padding:0 4px;}',
    '.' + PREFIX + '-body{flex:1 1 auto;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:8px;background:#fff;}',
    '.' + PREFIX + '-msg{padding:9px 13px;border-radius:14px;max-width:80%;font-size:14px;line-height:1.45;white-space:pre-wrap;word-wrap:break-word;}',
    '.' + PREFIX + '-user{align-self:flex-end;background:#2a78d6;color:#fff;border-bottom-right-radius:4px;}',
    '.' + PREFIX + '-bot{align-self:flex-start;background:#f1f1ee;color:#0b0b0b;border-bottom-left-radius:4px;}',
    '.' + PREFIX + '-err{align-self:center;background:#fdecec;color:#a11;font-size:12px;padding:6px 10px;border-radius:8px;max-width:90%;text-align:center;}',
    '.' + PREFIX + '-foot{flex:0 0 auto;border-top:1px solid #e1e0d9;padding:10px;display:flex;gap:8px;background:#fff;}',
    '.' + PREFIX + '-in{flex:1;padding:9px 12px;border:1px solid #ddd;border-radius:18px;outline:none;font-size:14px;font-family:inherit;min-width:0;color:#0b0b0b;background:#fff;}',
    '.' + PREFIX + '-in:disabled{background:#f5f5f3;}',
    '.' + PREFIX + '-send{flex:0 0 auto;width:36px;height:36px;border-radius:50%;background:#2a78d6;color:#fff;border:none;cursor:pointer;font-size:17px;}',
    '.' + PREFIX + '-send:disabled{opacity:.5;cursor:default;}',
    '@media (max-width:480px){',
    '.' + PREFIX + '-panel{left:8px;right:8px;bottom:8px;width:auto;height:min(78vh,calc(100vh - 16px));border-radius:12px;transform-origin:bottom center;}',
    '.' + PREFIX + '-launcher{bottom:14px;right:14px;}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '.' + PREFIX + '-panel,.' + PREFIX + '-ico,.' + PREFIX + '-launcher{transition-duration:.01ms;}',
    '}'
  ].join('');

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // --- launcher -------------------------------------------------------------
  var launcher = document.createElement('button');
  launcher.className = PREFIX + '-launcher';
  launcher.id = 'ai-chatbot-launcher';
  launcher.setAttribute('aria-label', 'Open chat');
  launcher.setAttribute('aria-expanded', 'false');
  launcher.innerHTML =
    '<svg class="' + PREFIX + '-ico ' + PREFIX + '-ico-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>' +
    '<svg class="' + PREFIX + '-ico ' + PREFIX + '-ico-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';

  // --- panel ----------------------------------------------------------------
  var panel = document.createElement('div');
  panel.className = PREFIX + '-panel';
  panel.id = 'ai-chatbot-widget';
  panel.setAttribute('aria-hidden', 'true');
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Chat with ' + botName);

  var head = document.createElement('div');
  head.className = PREFIX + '-head';
  var headText = document.createElement('div');
  var title = document.createElement('p');
  title.className = PREFIX + '-title';
  title.textContent = botName;          // textContent: never parsed as HTML
  var sub = document.createElement('p');
  sub.className = PREFIX + '-sub';
  sub.textContent = 'Online';
  headText.appendChild(title);
  headText.appendChild(sub);
  var closeBtn = document.createElement('button');
  closeBtn.className = PREFIX + '-x';
  closeBtn.id = 'close-widget';
  closeBtn.setAttribute('aria-label', 'Close chat');
  closeBtn.textContent = '\\u00d7';
  head.appendChild(headText);
  head.appendChild(closeBtn);

  var body = document.createElement('div');
  body.className = PREFIX + '-body';
  body.id = 'messages-container';

  var foot = document.createElement('div');
  foot.className = PREFIX + '-foot';
  var input = document.createElement('input');
  input.type = 'text';
  input.className = PREFIX + '-in';
  input.placeholder = 'Connecting...';
  input.disabled = true;
  var sendBtn = document.createElement('button');
  sendBtn.className = PREFIX + '-send';
  sendBtn.setAttribute('aria-label', 'Send message');
  sendBtn.textContent = '\\u2192';
  sendBtn.disabled = true;
  foot.appendChild(input);
  foot.appendChild(sendBtn);

  panel.appendChild(head);
  panel.appendChild(body);
  panel.appendChild(foot);
  document.body.appendChild(launcher);
  document.body.appendChild(panel);

  // --- behaviour ------------------------------------------------------------
  var conversationId = null;
  var sending = false;

  function bubble(cls, text) {
    var el = document.createElement('div');
    el.className = PREFIX + '-msg ' + PREFIX + '-' + cls;
    el.textContent = text;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  }

  function notice(text) {
    var el = document.createElement('div');
    el.className = PREFIX + '-err';
    el.textContent = text;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
  }

  function setReady(ready) {
    input.disabled = !ready;
    sendBtn.disabled = !ready;
    input.placeholder = ready ? 'Type a message...' : 'Connecting...';
  }

  var isOpen = false;

  function open() {
    isOpen = true;
    panel.classList.add(PREFIX + '-open');
    panel.setAttribute('aria-hidden', 'false');
    launcher.classList.add(PREFIX + '-active');
    launcher.setAttribute('aria-expanded', 'true');
    launcher.setAttribute('aria-label', 'Close chat');
    if (!conversationId) start();
    // Focus after the transition so the page does not jump mid-animation.
    setTimeout(function () { if (!input.disabled) input.focus(); }, 280);
  }

  function close() {
    isOpen = false;
    panel.classList.remove(PREFIX + '-open');
    panel.setAttribute('aria-hidden', 'true');
    launcher.classList.remove(PREFIX + '-active');
    launcher.setAttribute('aria-expanded', 'false');
    launcher.setAttribute('aria-label', 'Open chat');
  }

  function toggle() { isOpen ? close() : open(); }

  // Conversation is created on first open, not on page load, so merely
  // visiting the host page does not create empty conversations.
  var starting = false;
  function start() {
    if (starting || conversationId) return;
    starting = true;
    fetch(apiUrl + '/v1/bots/' + botId + '/conversations', { method: 'POST' })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (d) {
        conversationId = d && d.conversation && d.conversation.id;
        if (!conversationId) throw new Error('no conversation id');
        setReady(true);
      })
      .catch(function (err) {
        console.error('[chatbot] could not start conversation:', err);
        notice("Couldn't connect. Please try again later.");
      })
      .finally(function () { starting = false; });
  }

  function send() {
    var content = input.value.trim();
    if (!content || sending || !conversationId) return;

    bubble('user', content);
    input.value = '';
    sending = true;
    setReady(false);

    fetch(apiUrl + '/v1/conversations/' + conversationId + '/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: content })
    })
      .then(function (r) {
        if (r.status === 429) throw new Error('rate-limited');
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (d) {
        var text = d && d.message && d.message.content;
        if (text) bubble('bot', text);
        else notice('No reply received.');
      })
      .catch(function (err) {
        console.error('[chatbot] send failed:', err);
        notice(err.message === 'rate-limited'
          ? 'Too many messages. Please slow down.'
          : "Message could not be delivered.");
      })
      .finally(function () {
        sending = false;
        setReady(true);
        input.focus();
      });
  }

  launcher.addEventListener('click', toggle);
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && isOpen) close();
  });
  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });
})();
`.trim();

    res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300");
    res.send(script);
  } catch (error) {
    console.error("Get widget script error:", error);
    res.status(500).json({ error: "Failed to generate widget" });
  }
};

export const getWidgetConfig = async (req: Request, res: Response) => {
  try {
    const { botId } = req.params;

    const bot = await Bot.findById(botId).select("name avatar theme");

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

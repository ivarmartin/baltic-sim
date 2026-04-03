import type { Chapter } from '../stages/chapter-data';
import { t, onLocaleChange } from '../i18n';

export interface ChatUI {
  show: () => void;
  hide: () => void;
  setChapterContext: (chapter: Chapter) => void;
  onSendMessage: (callback: (message: string) => void) => void;
  addMessage: (role: 'user' | 'assistant', text: string) => void;
  clearMessages: () => void;
  showTyping: () => void;
  hideTyping: () => void;
  disableSend: () => void;
  enableSend: () => void;
  /** Create an empty assistant bubble for streaming; returns the element. */
  addStreamingMessage: () => HTMLDivElement;
  /** Update a streaming bubble's text and auto-scroll. */
  updateStreamingMessage: (el: HTMLDivElement, text: string) => void;
  /** Rebuild message DOM from saved history (for chapter switching). */
  restoreHistory: (messages: Array<{ role: 'user' | 'assistant'; text: string }>) => void;
  dispose: () => void;
}

export function createChatUI(): ChatUI {
  let sendCallback: ((message: string) => void) | null = null;
  let currentChapter: Chapter | null = null;
  let sendDisabled = false;

  const container = document.createElement('div');
  container.id = 'chat-ui';
  container.innerHTML = `
    <div class="chat-card">
      <div class="chat-messages"></div>
      <div class="chat-typing">
        <span class="chat-typing-dot"></span>
        <span class="chat-typing-dot"></span>
        <span class="chat-typing-dot"></span>
      </div>
      <div class="chat-input-row">
        <input type="text" class="chat-input" placeholder="${t().ui.chatPlaceholder}" />
        <button class="chat-send">${t().ui.chatSend}</button>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    #chat-ui {
      position: fixed;
      bottom: 32px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 100;
      pointer-events: none;
      user-select: none;
      opacity: 0;
      transition: opacity 0.4s ease;
    }

    #chat-ui.visible {
      opacity: 1;
      pointer-events: auto;
    }

    .chat-card {
      width: 480px;
      max-width: 90vw;
      display: flex;
      flex-direction: column;
      background: rgba(10, 30, 20, 0.55);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 14px;
      overflow: hidden;
    }

    .chat-messages {
      min-height: 80px;
      max-height: 280px;
      overflow-y: auto;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .chat-messages::-webkit-scrollbar {
      width: 4px;
    }

    .chat-messages::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.15);
      border-radius: 2px;
    }

    .chat-msg {
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
      font-size: 13px;
      line-height: 1.5;
      padding: 8px 12px;
      border-radius: 12px;
      max-width: 85%;
      word-wrap: break-word;
    }

    .chat-msg.user {
      align-self: flex-end;
      background: rgba(40, 100, 70, 0.6);
      color: rgba(255, 255, 255, 0.95);
      border-bottom-right-radius: 4px;
    }

    .chat-msg.assistant {
      align-self: flex-start;
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.9);
      border-bottom-left-radius: 4px;
    }

    /* Typing indicator */
    .chat-typing {
      display: none;
      align-self: flex-start;
      padding: 4px 14px 8px;
      gap: 4px;
    }

    .chat-typing.visible {
      display: flex;
    }

    .chat-typing-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.4);
      animation: chat-typing-pulse 1.4s ease-in-out infinite;
    }

    .chat-typing-dot:nth-child(2) {
      animation-delay: 0.2s;
    }

    .chat-typing-dot:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes chat-typing-pulse {
      0%, 60%, 100% { opacity: 0.3; transform: scale(1); }
      30% { opacity: 1; transform: scale(1.2); }
    }

    .chat-input-row {
      display: flex;
      gap: 8px;
      padding: 10px 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .chat-input {
      flex: 1;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 10px;
      padding: 8px 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.9);
      outline: none;
      transition: border-color 0.2s ease, opacity 0.2s ease;
    }

    .chat-input::placeholder {
      color: rgba(255, 255, 255, 0.35);
    }

    .chat-input:focus {
      border-color: rgba(255, 255, 255, 0.3);
    }

    .chat-input:disabled {
      opacity: 0.5;
    }

    .chat-send {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px 16px;
      background: rgba(40, 100, 70, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 10px;
      color: rgba(255, 255, 255, 0.9);
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      outline: none;
    }

    .chat-send:hover {
      background: rgba(50, 120, 85, 0.7);
      border-color: rgba(255, 255, 255, 0.3);
    }

    .chat-send:active {
      transform: scale(0.96);
    }

    .chat-send:disabled {
      opacity: 0.4;
      cursor: default;
    }

    @media (max-width: 480px) {
      #chat-ui { bottom: 20px; }
      .chat-card { width: 92vw; }
      .chat-messages { max-height: 200px; padding: 8px 10px; }
      .chat-input-row { padding: 8px 10px; }
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(container);

  const messagesEl = container.querySelector('.chat-messages') as HTMLDivElement;
  const typingEl = container.querySelector('.chat-typing') as HTMLDivElement;
  const inputEl = container.querySelector('.chat-input') as HTMLInputElement;
  const sendBtn = container.querySelector('.chat-send') as HTMLButtonElement;

  function handleSend() {
    if (sendDisabled) return;
    const text = inputEl.value.trim();
    if (!text) return;
    inputEl.value = '';
    sendCallback?.(text);
  }

  sendBtn.addEventListener('click', handleSend);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  const unsubLocale = onLocaleChange(() => {
    inputEl.placeholder = t().ui.chatPlaceholder;
    sendBtn.textContent = t().ui.chatSend;
  });

  function addMessage(role: 'user' | 'assistant', text: string) {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${role}`;
    msg.textContent = text;
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function clearMessages() {
    messagesEl.innerHTML = '';
  }

  return {
    show() {
      container.classList.add('visible');
      inputEl.focus();
    },
    hide() {
      container.classList.remove('visible');
    },
    setChapterContext(chapter: Chapter) {
      currentChapter = chapter;
      clearMessages();
    },
    onSendMessage(callback: (message: string) => void) {
      sendCallback = callback;
    },
    addMessage,
    clearMessages,
    showTyping() {
      typingEl.classList.add('visible');
      messagesEl.scrollTop = messagesEl.scrollHeight;
    },
    hideTyping() {
      typingEl.classList.remove('visible');
    },
    disableSend() {
      sendDisabled = true;
      inputEl.disabled = true;
      sendBtn.disabled = true;
    },
    enableSend() {
      sendDisabled = false;
      inputEl.disabled = false;
      sendBtn.disabled = false;
    },
    addStreamingMessage(): HTMLDivElement {
      const msg = document.createElement('div');
      msg.className = 'chat-msg assistant';
      messagesEl.appendChild(msg);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      return msg;
    },
    updateStreamingMessage(el: HTMLDivElement, text: string) {
      el.textContent = text;
      messagesEl.scrollTop = messagesEl.scrollHeight;
    },
    restoreHistory(messages: Array<{ role: 'user' | 'assistant'; text: string }>) {
      clearMessages();
      for (const m of messages) {
        addMessage(m.role, m.text);
      }
    },
    dispose() {
      unsubLocale();
      container.remove();
      style.remove();
    },
  };
}

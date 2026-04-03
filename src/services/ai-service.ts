import type { Chapter } from '../stages/chapter-data';
import type { ChatUI } from '../ui/chat-ui';
import type { StageManager } from '../stages/stage-manager';
import { aiConfig } from '../config/ai';
import { t, getLocale, onLocaleChange } from '../i18n';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, unknown>;
      required: string[];
    };
  };
}

export interface AIService {
  setChapter: (chapter: Chapter) => void;
  sendMessage: (userText: string) => Promise<void>;
  notifyNavigation: (stageId: string) => Promise<void>;
  generateWelcome: () => Promise<void>;
  isAINavigating: () => boolean;
  abort: () => void;
  dispose: () => void;
}

export interface AIServiceDeps {
  chatUI: ChatUI;
  stageManager: StageManager;
  goToIndex: (index: number) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_HISTORY = 40;

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export function createAIService(deps: AIServiceDeps): AIService {
  const { chatUI, stageManager } = deps;

  // Per-chapter conversation history
  const historyMap = new Map<string, ChatMessage[]>();

  // Session-scoped visited stages (cross-chapter)
  const visitedStages = new Set<string>();

  let currentChapter: Chapter | null = null;
  let abortController: AbortController | null = null;
  let aiNavigating = false;

  // -------------------------------------------------------------------------
  // History helpers
  // -------------------------------------------------------------------------

  function getHistory(): ChatMessage[] {
    const id = currentChapter!.id;
    if (!historyMap.has(id)) historyMap.set(id, []);
    return historyMap.get(id)!;
  }

  function addToHistory(msg: ChatMessage) {
    const history = getHistory();
    history.push(msg);
    trimHistory(history);
  }

  function trimHistory(history: ChatMessage[]) {
    while (history.length > MAX_HISTORY) {
      // Remove oldest user+assistant pair after the first assistant (welcome)
      history.splice(1, 2);
    }
  }

  // -------------------------------------------------------------------------
  // Prompt assembly
  // -------------------------------------------------------------------------

  /** Strip tool-call-like text the model sometimes writes inline instead of using the API. */
  function cleanToolMentions(text: string): string {
    return text
      .replace(/\*?navigate_to_stage[:(\s][^*\n]*\*?/gi, '')
      .replace(/\[navigate_to_stage[^\]]*\]/gi, '')
      .replace(/\*?Navigerar?\s+(nu\s+)?till\s+"?[^"*\n]*"?\*?\.?/gi, '')
      .replace(/\n{3,}/g, '\n\n');
  }

  function findStageName(stageId: string): string {
    const strings = t();
    // Search all chapters for this stage ID
    for (const chId of Object.keys(strings.chapters)) {
      const stage = strings.chapters[chId]?.stages[stageId];
      if (stage) return stage.name;
    }
    return stageId;
  }

  function buildSystemPrompt(): string {
    const strings = t();
    const chapterId = currentChapter!.id;
    const chapterText = strings.chapters[chapterId];
    const currentStageId = stageManager.getCurrentStageId();
    const stageText = currentStageId ? chapterText?.stages[currentStageId] : null;

    let prompt = strings.ai?.coreSystemPrompt || '';

    // Chapter context
    if (chapterText?.aiPrompt) {
      prompt += '\n\n' + chapterText.aiPrompt;
    }

    // Current scene (last = highest priority due to recency bias)
    if (stageText?.narrative) {
      prompt += '\n\nSTORY TEXT FOR THIS SCENE (use as inspiration for your response):\n';
      prompt += stageText.narrative;
    }
    prompt += '\n\nCURRENT SCENE (the visitor is looking at this right now):\n';
    prompt += stageText?.aiPrompt || 'No scene description available.';

    // Visited stages this session
    if (visitedStages.size > 0) {
      prompt += '\n\nStages the visitor has already seen this session:\n';
      for (const id of visitedStages) {
        prompt += `- ${id}: "${findStageName(id)}"\n`;
      }
    }

    // Available stages for tool calling
    prompt += '\n\nAvailable scenes you can navigate to:\n';
    for (const stage of currentChapter!.stages) {
      const name = strings.chapters[chapterId]?.stages[stage.id]?.name || stage.id;
      prompt += `- ${stage.id}: "${name}"\n`;
    }

    return prompt;
  }

  function buildTools(): ToolDefinition[] {
    const stageIds = currentChapter!.stages.map((s) => s.id);
    return [
      {
        type: 'function',
        function: {
          name: 'navigate_to_stage',
          description:
            'Move the camera to a specific scene to show the visitor something relevant. Only call once per response.',
          parameters: {
            type: 'object',
            properties: {
              stage_id: {
                type: 'string',
                enum: stageIds,
                description: 'The stage ID to navigate to',
              },
            },
            required: ['stage_id'],
          },
        },
      },
    ];
  }

  // -------------------------------------------------------------------------
  // Streaming API call
  // -------------------------------------------------------------------------

  async function callAPI(
    messages: ChatMessage[],
    options?: { disableTools?: boolean },
  ): Promise<{ text: string; toolCall?: { stageId: string } }> {
    abortController = new AbortController();

    const body: Record<string, unknown> = {
      model: aiConfig.model,
      messages,
      max_tokens: aiConfig.maxTokens,
      temperature: aiConfig.temperature,
      stream: true,
    };
    if (!options?.disableTools) {
      body.tools = buildTools();
    }

    const response = await fetch(aiConfig.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aiConfig.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: abortController.signal,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`API ${response.status}: ${body.slice(0, 200)}`);
    }

    // Hide typing indicator once the stream starts, create streaming bubble
    chatUI.hideTyping();
    const bubbleEl = chatUI.addStreamingMessage();

    let fullText = '';
    let toolCallArgs = '';
    let toolCallName = '';

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop()!; // keep incomplete line in buffer

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;

          let chunk;
          try {
            chunk = JSON.parse(data);
          } catch {
            continue;
          }

          // Debug: log every SSE chunk
          // console.log('[AI Stream]', JSON.stringify(chunk));

          const delta = chunk.choices?.[0]?.delta;
          if (!delta) continue;

          // Text content
          if (delta.content) {
            fullText += delta.content;
            chatUI.updateStreamingMessage(bubbleEl, cleanToolMentions(fullText));
          }

          // Tool call deltas
          if (delta.tool_calls?.[0]) {
            const tc = delta.tool_calls[0];
            if (tc.function?.name) toolCallName = tc.function.name;
            if (tc.function?.arguments) toolCallArgs += tc.function.arguments;
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    // Debug: log final parse result
    // console.log('[AI Result]', { fullText: fullText.slice(0, 100), toolCallName, toolCallArgs });

    // If the model returned no visible text but made a tool call, remove the empty bubble
    if (!fullText && bubbleEl.parentElement) {
      // console.log('[AI Result] Empty text — removing bubble');
      bubbleEl.remove();
    }

    // Parse tool call
    let toolCall: { stageId: string } | undefined;
    if (toolCallName === 'navigate_to_stage' && toolCallArgs) {
      try {
        const args = JSON.parse(toolCallArgs);
        if (args.stage_id) {
          toolCall = { stageId: args.stage_id };
        }
      } catch {
        // ignore malformed tool call
      }
    }

    return { text: cleanToolMentions(fullText).trim(), toolCall };
  }

  // -------------------------------------------------------------------------
  // Navigation execution
  // -------------------------------------------------------------------------

  function executeNavigation(stageId: string) {
    if (!currentChapter) return;
    const index = currentChapter.stages.findIndex((s) => s.id === stageId);
    if (index < 0) return;
    visitedStages.add(stageId);
    aiNavigating = true;
    deps.goToIndex(index);
    aiNavigating = false;
  }

  // -------------------------------------------------------------------------
  // Follow-up after tool-only responses
  // -------------------------------------------------------------------------

  async function followUpAfterNavigation(stageId: string) {
    const stageName = findStageName(stageId);
    addToHistory({
      role: 'user',
      content: `[The scene just changed to "${stageName}". Describe what I'm seeing and continue the story.]`,
    });

    chatUI.showTyping();

    const messages: ChatMessage[] = [
      { role: 'system', content: buildSystemPrompt() },
      ...getHistory(),
    ];

    try {
      const { text } = await callAPI(messages, { disableTools: true });
      if (text) {
        addToHistory({ role: 'assistant', content: text });
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('[AI Service] Follow-up failed', err);
      }
    }
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  function setChapter(chapter: Chapter) {
    // Abort any in-flight request
    abortController?.abort();

    currentChapter = chapter;
    visitedStages.add(chapter.stages[0]?.id);

    // Restore or start fresh
    const history = getHistory();
    if (history.length > 0) {
      // Restore saved conversation to the UI
      chatUI.restoreHistory(
        history
          .filter((m) => m.role !== 'system')
          .map((m) => ({
            role: m.role as 'user' | 'assistant',
            text: m.content,
          })),
      );
    } else {
      chatUI.clearMessages();
    }
  }

  async function sendMessage(userText: string) {
    if (!currentChapter) return;

    chatUI.addMessage('user', userText);
    chatUI.showTyping();
    chatUI.disableSend();

    addToHistory({ role: 'user', content: userText });

    const messages: ChatMessage[] = [
      { role: 'system', content: buildSystemPrompt() },
      ...getHistory(),
    ];

    try {
      const { text, toolCall } = await callAPI(messages);
      if (text) {
        addToHistory({ role: 'assistant', content: text });
      }
      if (toolCall) {
        executeNavigation(toolCall.stageId);

        // If the model returned a tool call but no text, auto-follow-up
        // so the AI describes the new scene instead of leaving a dead end
        if (!text) {
          await followUpAfterNavigation(toolCall.stageId);
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('[AI Service]', err);
        chatUI.addMessage(
          'assistant',
          'Sorry, I had trouble responding. Please try again.',
        );
      }
    } finally {
      chatUI.hideTyping();
      chatUI.enableSend();
    }
  }

  async function notifyNavigation(stageId: string) {
    if (!currentChapter) return;

    visitedStages.add(stageId);

    const stageName = findStageName(stageId);
    addToHistory({
      role: 'user',
      content: `[I just moved to the scene: "${stageName}"]`,
    });

    chatUI.showTyping();
    chatUI.disableSend();

    const messages: ChatMessage[] = [
      { role: 'system', content: buildSystemPrompt() },
      ...getHistory(),
    ];

    try {
      const { text } = await callAPI(messages);
      if (text) {
        addToHistory({ role: 'assistant', content: text });
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('[AI Service]', err);
      }
    } finally {
      chatUI.hideTyping();
      chatUI.enableSend();
    }
  }

  async function generateWelcome() {
    if (!currentChapter) return;

    const history = getHistory();
    // If returning to a chapter with history, don't regenerate
    if (history.length > 0) return;

    chatUI.showTyping();
    chatUI.disableSend();

    const messages: ChatMessage[] = [
      { role: 'system', content: buildSystemPrompt() },
      {
        role: 'user',
        content:
          '[The visitor just entered this chapter. Welcome them warmly and introduce what they are seeing in the current scene. Ask an engaging opening question.]',
      },
    ];

    try {
      const { text, toolCall } = await callAPI(messages);
      // Store in history (use a minimal marker for the synthetic user message)
      addToHistory({ role: 'user', content: '[Chapter start]' });
      if (text) {
        addToHistory({ role: 'assistant', content: text });
      }
      if (toolCall) {
        executeNavigation(toolCall.stageId);
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('[AI Service]', err);
        // Fallback to static welcome
        const title = t().chapters[currentChapter!.id]?.title;
        const fallback = title
          ? `Welcome! Let's explore: ${title}. What would you like to know?`
          : 'Welcome! What would you like to explore?';
        chatUI.addMessage('assistant', fallback);
        addToHistory({ role: 'user', content: '[Chapter start]' });
        addToHistory({ role: 'assistant', content: fallback });
      }
    } finally {
      chatUI.hideTyping();
      chatUI.enableSend();
    }
  }

  function abort() {
    abortController?.abort();
  }

  // -------------------------------------------------------------------------
  // Language switch handling
  // -------------------------------------------------------------------------

  const localeNames: Record<string, string> = { en: 'English', sv: 'Svenska' };

  const unsubLocale = onLocaleChange((locale) => {
    if (!currentChapter) return;

    const langName = localeNames[locale] || locale;
    const contextMsg = `[The visitor switched language to ${langName}. Continue the conversation in ${langName}.]`;

    addToHistory({ role: 'user', content: contextMsg });

    chatUI.addMessage('assistant', locale === 'sv'
      ? `Språket ändrades till svenska. Jag fortsätter på svenska!`
      : `Language changed to English. I'll continue in English!`);
    addToHistory({
      role: 'assistant',
      content: locale === 'sv'
        ? 'Språket ändrades till svenska. Jag fortsätter på svenska!'
        : "Language changed to English. I'll continue in English!",
    });
  });

  function dispose() {
    unsubLocale();
    abort();
  }

  return {
    setChapter,
    sendMessage,
    notifyNavigation,
    generateWelcome,
    isAINavigating: () => aiNavigating,
    abort,
    dispose,
  };
}

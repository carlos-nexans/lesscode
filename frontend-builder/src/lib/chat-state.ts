import React from 'react';
import { ChatMessage, ToolCall, ToolResult } from '@/types/workflow';

export interface ChatStateManager {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  
  addMessage: (message: ChatMessage) => void;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
  addToolCall: (messageId: string, toolCall: ToolCall) => void;
  addToolResult: (messageId: string, toolResult: ToolResult) => void;
}

export class ChatStateManagerImpl implements ChatStateManager {
  private _messages: ChatMessage[] = [];
  private _isLoading: boolean = false;
  private _error: string | null = null;
  private listeners: Set<() => void> = new Set();

  get messages(): ChatMessage[] {
    return this._messages;
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  get error(): string | null {
    return this._error;
  }

  addMessage(message: ChatMessage): void {
    this._messages.push(message);
    this.notifyListeners();
  }

  updateMessage(messageId: string, updates: Partial<ChatMessage>): void {
    const index = this._messages.findIndex(msg => msg.id === messageId);
    if (index !== -1) {
      this._messages[index] = { ...this._messages[index], ...updates };
      this.notifyListeners();
    }
  }

  setLoading(loading: boolean): void {
    this._isLoading = loading;
    this.notifyListeners();
  }

  setError(error: string | null): void {
    this._error = error;
    this.notifyListeners();
  }

  clearMessages(): void {
    this._messages = [];
    this.notifyListeners();
  }

  addToolCall(messageId: string, toolCall: ToolCall): void {
    const message = this._messages.find(msg => msg.id === messageId);
    if (message) {
      message.toolCalls = message.toolCalls || [];
      message.toolCalls.push(toolCall);
      this.notifyListeners();
    }
  }

  addToolResult(messageId: string, toolResult: ToolResult): void {
    const message = this._messages.find(msg => msg.id === messageId);
    if (message) {
      message.toolResults = message.toolResults || [];
      message.toolResults.push(toolResult);
      this.notifyListeners();
    }
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }
}

// Singleton instance
export const chatStateManager = new ChatStateManagerImpl();

// React hook for using chat state
export function useChatState() {
  const [state, setState] = React.useState({
    messages: chatStateManager.messages,
    isLoading: chatStateManager.isLoading,
    error: chatStateManager.error
  });

  React.useEffect(() => {
    const unsubscribe = chatStateManager.subscribe(() => {
      setState({
        messages: chatStateManager.messages,
        isLoading: chatStateManager.isLoading,
        error: chatStateManager.error
      });
    });

    return unsubscribe;
  }, []);

  return {
    ...state,
    addMessage: chatStateManager.addMessage.bind(chatStateManager),
    updateMessage: chatStateManager.updateMessage.bind(chatStateManager),
    setLoading: chatStateManager.setLoading.bind(chatStateManager),
    setError: chatStateManager.setError.bind(chatStateManager),
    clearMessages: chatStateManager.clearMessages.bind(chatStateManager),
    addToolCall: chatStateManager.addToolCall.bind(chatStateManager),
    addToolResult: chatStateManager.addToolResult.bind(chatStateManager)
  };
} 
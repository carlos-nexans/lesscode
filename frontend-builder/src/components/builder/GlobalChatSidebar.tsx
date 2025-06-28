'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  MessageCircle, 
  Send, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Bot,
  User,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useWorkflow } from '@/lib/workflow-context';
import { ChatMessage, ToolCall, ToolResult } from '@/types/workflow';

interface GlobalChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function GlobalChatSidebar({ isOpen, onToggle }: GlobalChatSidebarProps) {
  const { state, actions } = useWorkflow();
  const [inputValue, setInputValue] = useState('');
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.chatState.messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || state.chatState.isLoading) return;
    
    await actions.sendMessage(inputValue.trim());
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRetryMessage = async (messageId: string) => {
    await actions.retryMessage(messageId);
  };

  const formatMessageContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
      .replace(/\n/g, '<br />');
  };

  const renderToolCalls = (toolCalls: ToolCall[]) => {
    return toolCalls.map((toolCall, index) => (
      <div key={toolCall.id} className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-2">
        <div className="flex items-center gap-2 mb-2">
          <Bot className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">
            {toolCall.name}
          </span>
        </div>
        <pre className="text-xs text-blue-700 bg-blue-100 p-2 rounded overflow-x-auto">
          {JSON.stringify(toolCall.arguments, null, 2)}
        </pre>
      </div>
    ));
  };

  const renderToolResults = (toolResults: ToolResult[]) => {
    return toolResults.map((toolResult, index) => (
      <div key={toolResult.toolCallId} className="bg-green-50 border border-green-200 rounded-md p-3 mb-2">
        <div className="flex items-center gap-2 mb-2">
          <Bot className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">
            Tool Result
          </span>
        </div>
        {toolResult.error ? (
          <div className="text-sm text-red-600 bg-red-100 p-2 rounded">
            Error: {toolResult.error}
          </div>
        ) : (
          <pre className="text-xs text-green-700 bg-green-100 p-2 rounded overflow-x-auto">
            {JSON.stringify(toolResult.result, null, 2)}
          </pre>
        )}
      </div>
    ));
  };

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.role === 'user';
    
    return (
      <div key={message.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`flex gap-3 max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? 'bg-blue-500' : 'bg-gray-500'
          }`}>
            {isUser ? (
              <User className="h-4 w-4 text-white" />
            ) : (
              <Bot className="h-4 w-4 text-white" />
            )}
          </div>
          
          <div className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
            <div className={`rounded-lg px-4 py-2 max-w-full ${
              isUser 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-900'
            }`}>
              <div 
                className="text-sm"
                dangerouslySetInnerHTML={{ 
                  __html: formatMessageContent(message.content) 
                }}
              />
            </div>
            
            {message.toolCalls && message.toolCalls.length > 0 && (
              <div className="w-full">
                {renderToolCalls(message.toolCalls)}
              </div>
            )}
            
            {message.toolResults && message.toolResults.length > 0 && (
              <div className="w-full">
                {renderToolResults(message.toolResults)}
              </div>
            )}
            
            <div className="text-xs text-gray-500">
              {message.timestamp.toLocaleTimeString()}
            </div>
            
            {isUser && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRetryMessage(message.id)}
                className="h-6 px-2 text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      className={`fixed right-0 top-0 h-full bg-white border-l border-gray-200 shadow-lg transition-all duration-500 ease-in-out transform ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{ width: sidebarWidth }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-600 animate-pulse" />
          <h3 className="font-semibold text-gray-900">AI Assistant</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {state.application && (
            <Badge variant="secondary" className="text-xs animate-fade-in">
              {state.application.name}
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 transition-colors duration-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Context Indicators */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 transition-all duration-300">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Workflow Status:</span>
            <Badge variant="outline" className="text-xs transition-all duration-200 hover:scale-105">
              {state.nodes.length} nodes, {state.edges.length} connections
            </Badge>
          </div>
          
          {state.selectedNodeId && (
            <div className="flex items-center justify-between text-sm animate-fade-in">
              <span className="text-gray-600">Selected Node:</span>
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                {state.nodes.find(n => n.id === state.selectedNodeId)?.data.name || 'Unknown'}
              </Badge>
            </div>
          )}
          
          {state.chatState.error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded animate-shake">
              <AlertCircle className="h-4 w-4" />
              {state.chatState.error}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {state.chatState.messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8 animate-fade-in">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300 animate-bounce" />
                <p className="text-sm">
                  Start a conversation with the AI assistant to get help with your workflow.
                </p>
                <p className="text-xs mt-2 text-gray-400">
                  You can ask for help with code, request new nodes, or get workflow suggestions.
                </p>
              </div>
            ) : (
              state.chatState.messages.map((message, index) => (
                <div key={message.id} className="animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
                  {renderMessage(message)}
                </div>
              ))
            )}
            
            {state.chatState.isLoading && (
              <div className="flex gap-3 justify-start animate-fade-in">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                  <span className="text-sm text-gray-600">AI is thinking...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask the AI assistant..."
            disabled={state.chatState.isLoading}
            className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || state.chatState.isLoading}
            size="sm"
            className="transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={actions.clearChatMessages}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            Clear chat
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={actions.undo}
              disabled={!state.isUndoAvailable}
              className="h-6 w-6 p-0 transition-all duration-200 hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={actions.redo}
              disabled={!state.isRedoAvailable}
              className="h-6 w-6 p-0 transition-all duration-200 hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Resize Handle */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors duration-200"
        onMouseDown={() => setIsResizing(true)}
      />
      
      {/* Resize Overlay */}
      {isResizing && (
        <div
          className="fixed inset-0 z-50"
          onMouseMove={(e) => {
            if (isResizing) {
              const newWidth = window.innerWidth - e.clientX;
              setSidebarWidth(Math.max(300, Math.min(600, newWidth)));
            }
          }}
          onMouseUp={() => setIsResizing(false)}
        />
      )}
    </div>
  );
} 
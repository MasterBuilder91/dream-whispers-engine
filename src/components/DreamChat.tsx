import { useState, useRef, useEffect } from "react";
import { Moon, Send, RefreshCw, Crown, Lock, BookOpen, ChevronDown, ChevronUp, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useDreamChat, ChatMessage, SourceCitation } from "@/hooks/useDreamChat";
import { useAuth } from "@/contexts/AuthContext";
import { SignupPrompt } from "@/components/SignupPrompt";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

function MessageBubble({ 
  message, 
  isStreaming 
}: { 
  message: ChatMessage; 
  isStreaming: boolean;
}) {
  const [showSources, setShowSources] = useState(false);
  const isUser = message.role === "user";
  const isArabic = /[\u0600-\u06FF]/.test(message.content.slice(0, 50));

  return (
    <div className={cn(
      "flex gap-3",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
        isUser ? "bg-gold/20" : "bg-gradient-gold"
      )}>
        {isUser ? (
          <span className="text-xs text-gold">You</span>
        ) : (
          <Moon className="w-4 h-4 text-primary-foreground" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn(
        "flex-1 max-w-[85%]",
        isUser ? "text-right" : "text-left"
      )}>
        <div className={cn(
          "inline-block rounded-2xl px-4 py-3",
          isUser 
            ? "bg-gold/20 text-foreground" 
            : "bg-secondary/50 border border-border/50"
        )}>
          {isUser ? (
            <p className="text-sm sm:text-base whitespace-pre-wrap" dir={isArabic ? "rtl" : "ltr"}>
              {message.content}
            </p>
          ) : (
            <div className="prose prose-invert prose-gold max-w-none prose-sm">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-lg font-serif text-gradient-gold mb-2 mt-3 first:mt-0">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-base font-serif text-gold mb-2 mt-3">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-serif text-gold/90 mb-1 mt-2">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => {
                    const text = String(children);
                    const textIsArabic = /[\u0600-\u06FF]/.test(text.slice(0, 20));
                    return (
                      <p 
                        className="text-foreground/90 leading-relaxed mb-2 text-sm" 
                        dir={textIsArabic ? "rtl" : "ltr"} 
                        style={{ textAlign: textIsArabic ? "right" : "left" }}
                      >
                        {children}
                      </p>
                    );
                  },
                  ul: ({ children }) => (
                    <ul className="space-y-1 mb-2 text-foreground/85 list-disc ltr:ml-4 rtl:mr-4 text-sm">
                      {children}
                    </ul>
                  ),
                  li: ({ children }) => (
                    <li className="text-foreground/85 text-sm">{children}</li>
                  ),
                  strong: ({ children }) => (
                    <strong className="text-gold font-semibold">{children}</strong>
                  ),
                  blockquote: ({ children }) => {
                    const text = String(children);
                    const quoteIsArabic = /[\u0600-\u06FF]/.test(text.slice(0, 20));
                    return (
                      <blockquote 
                        className={`my-2 italic text-foreground/80 bg-gold/5 py-1 ${quoteIsArabic ? "border-r-2 pr-3" : "border-l-2 pl-3"} border-gold/50 text-sm`}
                        dir={quoteIsArabic ? "rtl" : "ltr"}
                      >
                        {children}
                      </blockquote>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
              {isStreaming && !message.content && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                  <span>Thinking...</span>
                </div>
              )}
              {isStreaming && message.content && (
                <span className="inline-block w-1.5 h-4 bg-gold animate-pulse ml-0.5" />
              )}
            </div>
          )}
        </div>

        {/* Sources toggle for assistant messages */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => setShowSources(!showSources)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-gold transition-colors"
            >
              <BookOpen className="w-3 h-3" />
              <span>{message.sources.length} sources</span>
              {showSources ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            
            {showSources && (
              <div className="mt-2 space-y-1.5">
                {message.sources.map((source, idx) => (
                  <div 
                    key={idx}
                    className="bg-background/50 rounded-lg p-2 border border-border/30 text-xs"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-foreground">{source.title}</span>
                      <span className="px-1 py-0.5 rounded bg-gold/10 text-gold text-[10px]">
                        {source.source}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface DreamChatProps {
  initialDream?: string;
  initialInterpretation?: string;
}

export function DreamChat({ initialDream, initialInterpretation }: DreamChatProps) {
  const { user, subscription } = useAuth();
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    resetChat, 
    remainingMessages, 
    isLimitReached 
  } = useDreamChat(initialDream, initialInterpretation);
  
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = () => {
    if (input.trim() && !isLoading && !isLimitReached) {
      sendMessage(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isPremium = subscription.subscribed || subscription.isAdmin;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="dream-card rounded-2xl overflow-hidden glow-border">
        {/* Header */}
        <div className="bg-gradient-to-r from-gold/10 to-accent/10 px-4 sm:px-6 py-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-gold flex items-center justify-center">
                <Moon className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-serif text-gradient-gold">Dream Interpreter</h2>
                <p className="text-xs text-muted-foreground">
                  Ask follow-up questions to explore deeper
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Message counter */}
              {!isPremium && (
                <div className="text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
                  {remainingMessages === Infinity ? "∞" : remainingMessages} left today
                </div>
              )}
              {isPremium && subscription.isAdmin && (
                <div className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                  <Shield className="w-3 h-3" />
                  Admin
                </div>
              )}
              {isPremium && !subscription.isAdmin && (
                <div className="flex items-center gap-1 text-xs text-gold bg-gold/10 px-2 py-1 rounded-full">
                  <Crown className="w-3 h-3" />
                  Premium
                </div>
              )}
              
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetChat}
                  className="text-muted-foreground hover:text-gold"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="h-[400px] sm:h-[500px] overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-4">
                <Moon className="w-8 h-8 text-gold" />
              </div>
              <h3 className="text-lg font-serif text-gradient-gold mb-2">صف رؤياك</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Describe your dream and I'll interpret it using classical Islamic texts from Ibn Sirin and Al-Nabulsi. 
                Ask follow-up questions to explore the meaning deeper.
              </p>
            </div>
          ) : (
            messages.map((message, idx) => (
              <MessageBubble 
                key={message.id} 
                message={message}
                isStreaming={isLoading && idx === messages.length - 1 && message.role === "assistant"}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Limit Reached Banner */}
        {isLimitReached && (
          <div className="px-4 sm:px-6 py-4 bg-gold/5 border-t border-border/50">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground mb-1">
                  Daily limit reached
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  You've used all 20 free messages for today. {user ? "Subscribe to unlock unlimited conversations." : "Sign up for more messages."}
                </p>
                <SignupPrompt variant="chat-limit" />
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 sm:p-6 border-t border-border/50 bg-secondary/20 relative z-20">
          <div className="flex gap-3">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                messages.length === 0 
                  ? "اكتب حلمك هنا... / Describe your dream here..." 
                  : "اسأل المزيد... / Ask a follow-up question..."
              }
              className="flex-1 min-h-[60px] max-h-[120px] bg-secondary/30 border-border/50 resize-none text-sm sm:text-base placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-gold/30 focus:border-gold/50 rounded-xl relative z-30"
              dir="auto"
              disabled={isLimitReached}
              autoFocus
            />
            <Button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading || isLimitReached}
              className="bg-gradient-gold hover:opacity-90 text-primary-foreground h-auto px-4"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          
          {!isLimitReached && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Press Enter to send • Shift+Enter for new line
            </p>
          )}
        </div>
      </div>

      {/* Signup prompt for non-authenticated users after first message */}
      {!user && messages.length > 0 && !isLimitReached && (
        <div className="mt-8 max-w-lg mx-auto">
          <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground">
              Sign up to save your interpretations and track patterns
            </p>
          </div>
          <SignupPrompt variant="upgrade-benefits" />
        </div>
      )}
    </div>
  );
}

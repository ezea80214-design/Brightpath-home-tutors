import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Send, X, RotateCcw, ArrowRight } from 'lucide-react';
import { siteConfig, buildWhatsAppUrl } from '../data/siteConfig';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const QUICK_PROMPTS = [
  'What are your monthly fees in Naira?',
  'Which primary & secondary subjects do you teach?',
  'How do lesson schedules and tutor vetting work?',
];

const INITIAL_WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'model',
  text: 'Welcome to BrightPath Home Tutors. Ask me about primary or secondary subjects, sample Nigerian Naira fees, tutor vetting, or lesson scheduling.',
};

export function TutoringChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_WELCOME]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const handleReset = () => {
    if (isStreaming) return;
    setMessages([INITIAL_WELCOME]);
    setErrorMessage(null);
    setInput('');
  };

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isStreaming) return;

    setErrorMessage(null);
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };
    const assistantId = `model-${Date.now()}`;
    const assistantPlaceholder: ChatMessage = {
      id: assistantId,
      role: 'model',
      text: '',
    };

    const nextHistory = [...messages, userMessage];
    setMessages([...nextHistory, assistantPlaceholder]);
    setInput('');
    setIsStreaming(true);

    try {
      const apiMessages = nextHistory
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, text: m.text }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!response.ok) {
        let serverError = 'Unable to connect to the assistant right now.';
        try {
          const errJson = (await response.json()) as { error?: string };
          if (errJson.error) serverError = errJson.error;
        } catch {
          // Non-JSON error response
        }
        throw new Error(serverError);
      }

      if (!response.body) {
        throw new Error('Empty response stream from server.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';

        for (const eventBlock of events) {
          const lines = eventBlock.split('\n');
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const payload = line.slice(6).trim();
            if (payload === '[DONE]') continue;

            try {
              const parsed = JSON.parse(payload) as { text?: string; error?: string };
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.text) {
                accumulated += parsed.text;
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantId ? { ...m, text: accumulated } : m))
                );
              }
            } catch (parseErr) {
              if (parseErr instanceof Error && parseErr.message !== 'Unexpected end of JSON input') {
                throw parseErr;
              }
            }
          }
        }
      }

      if (!accumulated.trim()) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  text: `Thank you for your question. Please contact us on WhatsApp (${siteConfig.contact.whatsapp}) or via our Contact page for immediate assistance.`,
                }
              : m
          )
        );
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Sorry, the assistant could not respond right now.';
      setErrorMessage(msg);
      setMessages((prev) => prev.filter((m) => m.id !== assistantId || m.text.length > 0));
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  const whatsappHref = buildWhatsAppUrl(
    siteConfig.contact.whatsapp,
    'Hello BrightPath Home Tutors, I would like to enquire about home tutoring lessons.'
  );

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
      {!isOpen ? (
        <button
          type="button"
          onClick={handleOpen}
          aria-label="Open BrightPath parent assistant"
          className="h-12 px-4 sm:px-5 inline-flex items-center gap-2.5 rounded-full bg-[#0B1F3A] text-white border border-[#D8B45A]/50 shadow-lg hover:bg-[#132E53] transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C59B38]"
        >
          <MessageSquare className="w-5 h-5 text-[#D8B45A]" aria-hidden="true" />
          <span className="text-sm font-semibold whitespace-nowrap">Ask BrightPath</span>
        </button>
      ) : (
        <section
          role="dialog"
          aria-label="BrightPath Parent Assistant"
          className="w-[calc(100vw-2rem)] sm:w-[390px] h-[520px] max-h-[80vh] flex flex-col rounded-xl bg-white border border-slate-200 shadow-2xl overflow-hidden"
        >
          {/* Chat Header */}
          <div className="px-5 py-4 bg-[#0B1F3A] text-white flex items-center justify-between gap-3 shrink-0">
            <div className="min-w-0">
              <h2 className="font-display text-lg font-bold text-white leading-tight truncate">
                BrightPath Assistant
              </h2>
              <p className="text-xs text-[#D8B45A] truncate">
                Subjects · Naira Fees · Scheduling
              </p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleReset}
                disabled={isStreaming}
                aria-label="Start new conversation"
                title="Reset conversation"
                className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close assistant"
                className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#F8FAFC]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-[#0B1F3A] text-white'
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  {msg.text || (isStreaming && msg.role === 'model' ? 'Typing...' : '')}
                </div>
              </div>
            ))}

            {/* Quick Starter Prompts on first open */}
            {messages.length === 1 && !isStreaming && (
              <div className="pt-1 space-y-2">
                <p className="text-xs font-medium text-slate-500">Common questions:</p>
                <div className="flex flex-col gap-2">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void sendMessage(prompt)}
                      className="text-left px-3.5 py-2.5 text-xs font-medium text-[#0B1F3A] bg-white border border-slate-200 rounded-lg hover:border-[#0B1F3A] hover:bg-[#FCF9F0] transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {errorMessage && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 space-y-1.5"
              >
                <p>{errorMessage}</p>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold underline"
                >
                  <span>Chat on WhatsApp ({siteConfig.contact.whatsapp})</span>
                </a>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Booking Bar */}
          <div className="px-4 py-2 bg-[#FCF9F0] border-t border-slate-200 flex items-center justify-between gap-2 text-xs shrink-0">
            <span className="text-slate-600 truncate">Ready to arrange lessons?</span>
            <Link
              to="/contact#enquiry"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1 font-semibold text-[#0B1F3A] hover:text-[#8C6A1B] whitespace-nowrap shrink-0"
            >
              <span>Book a Lesson</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>

          {/* Input Composer */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isStreaming}
              placeholder="Ask about subjects, fees, or times..."
              aria-label="Type your question for BrightPath Assistant"
              className="flex-1 h-10 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 bg-[#F8FAFC] border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-[#0B1F3A] disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isStreaming || input.trim().length === 0}
              aria-label="Send message"
              className="w-10 h-10 inline-flex items-center justify-center rounded-lg bg-[#0B1F3A] text-white hover:bg-[#132E53] disabled:opacity-45 transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-[#C59B38]"
            >
              <Send className="w-4 h-4 text-[#D8B45A]" aria-hidden="true" />
            </button>
          </form>
        </section>
      )}
    </div>
  );
}

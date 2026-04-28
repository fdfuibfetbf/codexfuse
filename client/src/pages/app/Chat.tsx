import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Plus, Send, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { useToasts } from '@/components/ui/Toast';

interface ChatLite { id: string; title: string; updatedAt: string }
interface Msg { id: string; role: string; content: string; createdAt: string }

export default function ChatPage() {
  const params = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const push = useToasts((s) => s.push);

  const list = useQuery({ queryKey: ['chats'], queryFn: () => api.get<ChatLite[]>('/chat') });
  const chatId = params.chatId;
  const chat = useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => api.get<{ id: string; title: string; messages: Msg[] }>(`/chat/${chatId}`),
    enabled: !!chatId
  });

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [chat.data?.messages.length]);

  const create = useMutation({
    mutationFn: () => api.post<ChatLite>('/chat', {}),
    onSuccess: (c) => {
      qc.invalidateQueries({ queryKey: ['chats'] });
      nav(`/app/chat/${c.id}`);
    }
  });

  const send = async () => {
    if (!input.trim()) return;
    let id = chatId;
    if (!id) {
      const c = await api.post<ChatLite>('/chat', {});
      id = c.id;
      qc.invalidateQueries({ queryKey: ['chats'] });
      nav(`/app/chat/${id}`);
    }
    setSending(true);
    const msg = input;
    setInput('');
    try {
      // optimistic
      qc.setQueryData(['chat', id], (prev: any) => ({
        ...(prev ?? { id, title: msg.slice(0, 60), messages: [] }),
        messages: [
          ...((prev?.messages ?? []) as any[]),
          { id: 'tmp-u', role: 'user', content: msg, createdAt: new Date().toISOString() }
        ]
      }));
      const r: any = await api.post(`/chat/${id}/messages`, { message: msg });
      qc.setQueryData(['chat', id], (prev: any) => ({
        ...(prev ?? {}),
        messages: [
          ...((prev?.messages ?? []) as any[]),
          { id: `tmp-a-${Date.now()}`, role: 'assistant', content: r.message, createdAt: new Date().toISOString() }
        ]
      }));
      qc.invalidateQueries({ queryKey: ['chat', id] });
      qc.invalidateQueries({ queryKey: ['chats'] });
    } catch (e: any) {
      push({ title: 'Chat failed', description: e.message, variant: 'error' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Create"
        title="AI Chat"
        description="Chat with the world's best models — switch providers, save bots, build memory."
        icon={<MessageSquare className="h-6 w-6" />}
        actions={
          <button onClick={() => create.mutate()} className="btn-primary">
            <Plus className="h-4 w-4" /> New chat
          </button>
        }
      />

      <div className="grid lg:grid-cols-[300px_1fr] gap-5 h-[calc(100vh-220px)] min-h-[520px]">
        <aside className="panel p-3 overflow-y-auto">
          <div className="text-xs uppercase tracking-widest text-ink-muted px-2 py-1.5">History</div>
          <div className="space-y-1">
            {list.isLoading ? (
              <div className="p-3 text-sm text-ink-muted">Loading…</div>
            ) : (list.data ?? []).length === 0 ? (
              <div className="p-3 text-sm text-ink-muted">No chats yet</div>
            ) : (
              (list.data ?? []).map((c) => (
                <Link
                  key={c.id}
                  to={`/app/chat/${c.id}`}
                  className={cn('nav-item text-sm', c.id === chatId && 'active')}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="flex-1 truncate">{c.title}</span>
                </Link>
              ))
            )}
          </div>
        </aside>

        <section className="panel flex flex-col">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-5">
            {!chatId && (
              <div className="text-center text-ink-muted mt-20">
                Start a conversation by typing below.
              </div>
            )}
            {chat.data?.messages.map((m) => (
              <div key={m.id} className={cn('flex gap-3', m.role === 'user' ? 'justify-end' : '')}>
                {m.role !== 'user' && (
                  <div className="h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br from-brand-500 to-accent-cyan flex items-center justify-center text-xs font-semibold">
                    AI
                  </div>
                )}
                <div
                  className={cn(
                    'rounded-2xl px-4 py-3 max-w-[80%] prose-chat',
                    m.role === 'user'
                      ? 'bg-gradient-to-br from-brand-600 to-brand-500 text-white shadow-glow'
                      : 'panel'
                  )}
                >
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-cyan animate-pulse" />
                <div className="panel px-4 py-3 text-ink-dim text-sm flex items-center gap-2">
                  <Spinner /> thinking…
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-white/[0.06] p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex gap-2 items-end"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={1}
                placeholder="Ask anything — Shift+Enter for newline…"
                className="textarea min-h-[44px] !py-3"
              />
              <button disabled={sending || !input.trim()} className="btn-primary !py-3 !px-4">
                {sending ? <Spinner /> : <Send className="h-4 w-4" />}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

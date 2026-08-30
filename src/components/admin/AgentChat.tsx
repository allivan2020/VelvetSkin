'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';

type ProposedAction =
  | {
      type: 'set_appointment';
      clientId: string;
      clientName: string;
      date: string;
      time: string;
      service?: string;
    }
  | {
      type: 'clear_appointment';
      clientId: string;
      clientName: string;
    };

type Msg = {
  role: 'user' | 'assistant';
  content: string;
  proposal?: ProposedAction;
  proposalStatus?: 'pending' | 'done' | 'cancelled';
};

const STARTERS = [
  'Що на цей тиждень?',
  'Що пишуть нотатки в iPhone календарі?',
  'Надішли мені в Telegram нагадування на сьогодні',
];

export default function AgentChat() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'assistant',
      content:
        'Привіт. Підкажу по записах, надішлю вам нагадування в Telegram салону без підтвердження. Запис у календар CRM — лише після «Підтвердити». Клієнтам ніколи не пишу.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const nextUser: Msg = { role: 'user', content: trimmed };
    const history = [...messages, nextUser]
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-10);

    setMessages((prev) => [...prev, nextUser]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: history.slice(0, -1).map(({ role, content }) => ({
            role,
            content,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'error');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply || 'Порожня відповідь',
          proposal: data.proposal,
          proposalStatus: data.proposal ? 'pending' : undefined,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Не вдалося відповісти. Спробуйте ще раз.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const confirmProposal = async (index: number, accept: boolean) => {
    const msg = messages[index];
    if (!msg?.proposal || msg.proposalStatus !== 'pending' || loading) return;

    if (!accept) {
      setMessages((prev) =>
        prev.map((m, i) =>
          i === index
            ? {
                ...m,
                proposalStatus: 'cancelled',
                content: `${m.content}\n\n— Скасовано.`,
              }
            : m,
        ),
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: msg.proposal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'error');

      setMessages((prev) => {
        const next = prev.map((m, i) =>
          i === index ? { ...m, proposalStatus: 'done' as const } : m,
        );
        return [
          ...next,
          {
            role: 'assistant' as const,
            content: data.reply || 'Збережено.',
          },
        ];
      });
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Не вдалося зберегти. Спробуйте ще раз.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  return (
    <aside className="flex flex-col h-[min(70vh,640px)] lg:h-[calc(100vh-6rem)] lg:sticky lg:top-6 rounded-3xl border border-[#efe6da] bg-white/90 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-[#efe6da] bg-[#fbf7f1]">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#856142] font-semibold">
          Асистент
        </p>
        <h2 className="text-sm font-bold text-[#1a1614]">CRM Agent</h2>
        <p className="text-[11px] text-gray-500 mt-0.5">
          Клієнтам не пише · вам у Telegram — одразу
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.map((m, i) => (
          <div key={`${i}-${m.role}`} className="space-y-2">
            <div
              className={`text-sm leading-relaxed whitespace-pre-wrap rounded-2xl px-3 py-2 max-w-[95%] ${
                m.role === 'user'
                  ? 'ml-auto bg-[#c49f2d] text-white'
                  : 'mr-auto bg-[#f7f3ee] text-gray-800 border border-[#efe6da]'
              }`}
            >
              {m.content}
            </div>
            {m.proposal && m.proposalStatus === 'pending' && (
              <div className="mr-auto max-w-[95%] rounded-2xl border border-[#c49f2d]/40 bg-white p-3 space-y-2">
                <p className="text-xs font-bold text-[#856142] uppercase tracking-wider">
                  Підтвердження
                </p>
                <p className="text-sm text-gray-800">
                  {m.proposal.type === 'set_appointment'
                    ? `${m.proposal.clientName} · ${m.proposal.date} ${m.proposal.time}`
                    : `Скасувати запис: ${m.proposal.clientName}`}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => void confirmProposal(i, true)}
                    className="flex-1 px-3 py-2 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 disabled:opacity-50"
                  >
                    Підтвердити
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => void confirmProposal(i, false)}
                    className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Скасувати
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="text-xs text-gray-400 animate-pulse px-2">
            Думаю...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-3 pb-2 flex flex-wrap gap-1.5">
        {STARTERS.map((s) => (
          <button
            key={s}
            type="button"
            disabled={loading}
            onClick={() => void send(s)}
            className="text-[11px] px-2.5 py-1 rounded-full border border-[#e4d9cb] bg-white text-[#856142] hover:bg-[#f7f3ee] disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        onSubmit={onSubmit}
        className="p-3 border-t border-[#efe6da] flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Напр. запиши Марію на 02.09 о 14:30"
          disabled={loading}
          className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#c49f2d] focus:ring-2 focus:ring-[#c49f2d]/15 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2.5 rounded-xl bg-[#1a1614] text-white text-sm font-bold disabled:opacity-40"
        >
          →
        </button>
      </form>
    </aside>
  );
}

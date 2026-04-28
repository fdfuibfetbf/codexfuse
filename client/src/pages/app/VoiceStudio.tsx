import { useState } from 'react';
import { AudioLines, Mic2, Wand2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Spinner } from '@/components/ui/Spinner';
import { api } from '@/lib/api';
import { useToasts } from '@/components/ui/Toast';

export default function VoiceStudioPage() {
  const [tab, setTab] = useState<'tts' | 'stt'>('tts');
  return (
    <div>
      <PageHeader
        eyebrow="Create"
        title="Voice studio"
        description="Hyper-realistic text-to-speech and Whisper transcription."
        icon={<AudioLines className="h-6 w-6" />}
        actions={
          <div className="inline-flex p-1 panel">
            <button onClick={() => setTab('tts')} className={`btn ${tab === 'tts' ? 'btn-primary !py-1.5' : 'btn-ghost !py-1.5'}`}>Text → Speech</button>
            <button onClick={() => setTab('stt')} className={`btn ${tab === 'stt' ? 'btn-primary !py-1.5' : 'btn-ghost !py-1.5'}`}>Speech → Text</button>
          </div>
        }
      />
      {tab === 'tts' ? <TTS /> : <STT />}
    </div>
  );
}

function TTS() {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('alloy');
  const [provider, setProvider] = useState('openai');
  const [audio, setAudio] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const push = useToasts((s) => s.push);
  async function go() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const r: any = await api.post('/voice/tts', { text, voice, provider });
      setAudio(`data:${r.mimeType};base64,${r.audioBase64}`);
    } catch (e: any) {
      push({ title: 'TTS failed', description: e.message, variant: 'error' });
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="grid lg:grid-cols-[400px_1fr] gap-5">
      <aside className="panel p-5 space-y-4">
        <div>
          <label className="label">Text</label>
          <textarea className="textarea min-h-[160px]" value={text} onChange={(e) => setText(e.target.value)} placeholder="Type something for the AI to read…" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Provider</label>
            <select className="select" value={provider} onChange={(e) => setProvider(e.target.value)}>
              <option value="openai">OpenAI</option>
              <option value="elevenlabs">ElevenLabs</option>
            </select>
          </div>
          <div>
            <label className="label">Voice</label>
            <input className="input" value={voice} onChange={(e) => setVoice(e.target.value)} placeholder="alloy" />
          </div>
        </div>
        <button onClick={go} disabled={loading} className="btn-primary w-full justify-center">{loading ? <Spinner /> : <Wand2 className="h-4 w-4" />} Speak</button>
      </aside>
      <section className="panel p-6">
        {audio ? (
          <audio controls src={audio} className="w-full" />
        ) : (
          <div className="text-center text-ink-muted py-12">Your audio will appear here.</div>
        )}
      </section>
    </div>
  );
}

function STT() {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const push = useToasts((s) => s.push);
  async function go() {
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('audio', file);
      if (language) fd.append('language', language);
      const r: any = await api.upload('/voice/stt', fd);
      setText(r.text);
    } catch (e: any) {
      push({ title: 'Transcription failed', description: e.message, variant: 'error' });
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="grid lg:grid-cols-[400px_1fr] gap-5">
      <aside className="panel p-5 space-y-4">
        <div>
          <label className="label">Audio file</label>
          <input type="file" accept="audio/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="input file:bg-white/10 file:border-0 file:text-white file:rounded-lg file:px-3 file:py-1 file:mr-3" />
        </div>
        <div>
          <label className="label">Language (optional)</label>
          <input className="input" value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="en" />
        </div>
        <button onClick={go} disabled={loading || !file} className="btn-primary w-full justify-center">
          {loading ? <Spinner /> : <Mic2 className="h-4 w-4" />} Transcribe
        </button>
      </aside>
      <section className="panel p-6">
        <textarea className="textarea min-h-[300px]" value={text} readOnly placeholder="Transcript will appear here…" />
      </section>
    </div>
  );
}

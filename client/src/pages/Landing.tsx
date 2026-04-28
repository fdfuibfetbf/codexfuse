import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  MessageSquare,
  Image as ImageIcon,
  AudioLines,
  Code2,
  FileText,
  Bot,
  Workflow,
  Search,
  Languages,
  ScanText,
  ShieldCheck,
  Mic2,
  Music2,
  Video,
  Wand2,
  Megaphone,
  Building2,
  Zap,
  Cpu,
  Layers,
  Lock,
  Star
} from 'lucide-react';
import { Logo } from '@/components/Logo';

const FEATURES = [
  { title: 'AI Chat', desc: 'Multi-model chat with custom system prompts, brand voices and memory.', icon: MessageSquare },
  { title: 'Image studio', desc: 'Generate, edit, upscale & remix images across SDXL, FLUX & DALL-E.', icon: ImageIcon },
  { title: 'Voice studio', desc: 'Hyper-realistic TTS, voice cloning, and Whisper transcription.', icon: AudioLines },
  { title: 'Code generator', desc: 'Generate, explain, refactor, debug & test code in any language.', icon: Code2 },
  { title: 'Templates library', desc: '60+ ready-to-use prompts: blogs, ads, emails, scripts & more.', icon: Sparkles },
  { title: 'Documents · RAG', desc: 'Upload PDFs / docs and ask grounded, source-cited questions.', icon: FileText },
  { title: 'AI Search', desc: 'Real-time web search synthesised into clean cited answers.', icon: Search },
  { title: 'Translate', desc: 'Tone-preserving translation across 100+ languages.', icon: Languages },
  { title: 'OCR', desc: 'Extract structured text from images, receipts & screenshots.', icon: ScanText },
  { title: 'AI detector', desc: 'Spot AI-generated content with confidence + reasons.', icon: ShieldCheck },
  { title: 'Plagiarism', desc: 'Heuristic plagiarism analysis with flagged spans.', icon: ShieldCheck },
  { title: 'Custom GPTs', desc: 'Build private bots with your prompts, tools and persona.', icon: Bot },
  { title: 'AI agents', desc: 'Plan-and-execute agents that complete real goals.', icon: Wand2 },
  { title: 'Workflows', desc: 'Chain prompts, models & data into automations.', icon: Workflow },
  { title: 'Brand voices', desc: 'Encode your tone & rules. Apply to every generation.', icon: Megaphone },
  { title: 'Video gen', desc: 'Generate short clips from text with cinematic models.', icon: Video },
  { title: 'Music gen', desc: 'Compose royalty-free music with simple text prompts.', icon: Music2 },
  { title: 'Speech-to-text', desc: 'Studio-quality transcription with speaker diarization.', icon: Mic2 },
  { title: 'Team workspaces', desc: 'Roles, invitations, shared assets & audit logs.', icon: Building2 }
];

const PROVIDERS = ['OpenAI', 'Anthropic', 'Google Gemini', 'Stability', 'Replicate', 'ElevenLabs', 'HuggingFace', 'Ollama'];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* nav */}
      <header className="relative z-20">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-7 text-sm text-ink-dim">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#providers" className="hover:text-white">Providers</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-ghost">Sign in</Link>
            <Link to="/register" className="btn-primary">
              Start free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* hero */}
      <section className="relative">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="absolute inset-0 bg-mesh pointer-events-none opacity-80" />
        <div className="relative max-w-7xl mx-auto px-6 pt-16 pb-24 text-center">
          <div className="mx-auto inline-flex items-center gap-2 chip mb-6">
            <Sparkles className="h-3.5 w-3.5 text-brand-300" />
            <span>Every AI service. One platform.</span>
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-semibold tracking-tight">
            <span className="gradient-text">The AI workspace</span>
            <br />
            <span className="gradient-text-vibrant">your team will fuse around.</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-ink-dim leading-relaxed">
            CodexFuse brings chat, image, voice, video, code, RAG, agents and workflows together
            with the world&apos;s best AI models — under your brand, with your rules.
          </p>
          <div className="mt-9 flex items-center justify-center gap-3 flex-wrap">
            <Link to="/register" className="btn-primary text-base px-5 py-3">
              Get started free <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#features" className="btn-ghost text-base px-5 py-3">
              Explore features
            </a>
          </div>
          <div className="mt-10 text-xs text-ink-muted flex items-center justify-center gap-4 flex-wrap">
            <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 text-brand-300" /> 19+ AI tools</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1"><Cpu className="h-3 w-3 text-accent-cyan" /> 8 providers</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1"><Layers className="h-3 w-3 text-accent-fuchsia" /> Team workspaces</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1"><Lock className="h-3 w-3 text-emerald-400" /> Self-hostable</span>
          </div>

          {/* hero card preview */}
          <div className="relative mt-16 mx-auto max-w-5xl">
            <div className="absolute -inset-x-8 -top-10 -bottom-10 bg-mesh opacity-60 blur-2xl pointer-events-none" />
            <div className="relative panel-glow p-2 rounded-3xl">
              <div className="rounded-2xl border border-white/[0.06] overflow-hidden bg-gradient-to-br from-bg-soft to-bg-card">
                <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                  <span className="ml-3 text-xs text-ink-muted">app.codexfuse.ai</span>
                </div>
                <div className="p-6 grid md:grid-cols-12 gap-5 text-left">
                  <div className="md:col-span-3 space-y-2">
                    {[
                      ['Dashboard', LayoutDash],
                      ['Chat', MessageSquare],
                      ['Templates', Sparkles],
                      ['Image studio', ImageIcon],
                      ['Voice studio', AudioLines],
                      ['Workflows', Workflow]
                    ].map(([label, Icon]: any) => (
                      <div key={label} className="nav-item active text-xs">
                        <Icon className="h-3.5 w-3.5" />
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="md:col-span-9 space-y-3">
                    <div className="panel p-4">
                      <div className="text-xs text-ink-muted">You</div>
                      <div className="mt-1">Generate a launch announcement for our new dark-mode AI workspace.</div>
                    </div>
                    <div className="panel-glow p-4">
                      <div className="text-xs text-brand-300 inline-flex items-center gap-1.5"><Sparkles className="h-3 w-3" /> CodexFuse · GPT-4o</div>
                      <div className="mt-1">
                        Introducing <span className="gradient-text-vibrant font-semibold">CodexFuse</span> — every AI tool your team needs, fused into one
                        beautiful dark-mode workspace. Chat, generate, automate, ship. Try it free →
                      </div>
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <span className="chip">#launch</span>
                        <span className="chip">#ai</span>
                        <span className="chip">#productivity</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="panel p-3 aspect-square bg-gradient-to-br from-brand-700 to-bg-card flex items-center justify-center text-3xl">🌌</div>
                      <div className="panel p-3 aspect-square bg-gradient-to-br from-accent-cyan/30 to-bg-card flex items-center justify-center text-3xl">🪄</div>
                      <div className="panel p-3 aspect-square bg-gradient-to-br from-accent-fuchsia/30 to-bg-card flex items-center justify-center text-3xl">⚡</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* providers marquee */}
      <section id="providers" className="relative py-12 border-y border-white/[0.06] bg-white/[0.01]">
        <div className="text-center text-xs uppercase tracking-widest text-ink-muted mb-6">
          Connect any model · any provider
        </div>
        <div className="overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap gap-12 text-2xl font-display">
            {[...PROVIDERS, ...PROVIDERS, ...PROVIDERS].map((p, i) => (
              <span key={i} className="text-ink-muted hover:text-white transition">{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* features */}
      <section id="features" className="relative py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl">
            <div className="chip mb-3 border-brand-400/30 text-brand-200"><Zap className="h-3 w-3" /> Built for teams shipping with AI</div>
            <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight gradient-text">
              19+ AI services. One workspace.
            </h2>
            <p className="mt-4 text-ink-dim text-lg">
              Stop bouncing between tools. CodexFuse unifies every modality — text, image, voice, video, code, knowledge,
              automation — and lets your team build, brand and ship from a single dark-mode console.
            </p>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="panel p-5 hover:border-brand-400/40 hover:-translate-y-0.5 transition group">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-brand-500/30 to-accent-cyan/20 ring-1 ring-white/10 flex items-center justify-center text-brand-200 group-hover:scale-105 transition">
                  <f.icon className="h-5 w-5" />
                </div>
                <div className="mt-4 text-base font-semibold text-white">{f.title}</div>
                <div className="mt-1 text-sm text-ink-dim leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* pricing */}
      <section id="pricing" className="relative py-24 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-4xl md:text-5xl font-semibold gradient-text">Simple credit-based pricing</h2>
            <p className="mt-4 text-ink-dim text-lg">Every modality, every model — one credit pool. Scale up or down anytime.</p>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {[
              { name: 'Free', price: '$0', tagline: 'Get started', credits: '10,000 credits / month', features: ['Chat & templates', 'Image generation', 'Voice & STT', 'Single workspace'] },
              { name: 'Pro', price: '$19', tagline: 'For creators', credits: '200,000 credits / month', features: ['Everything in Free', 'Documents · RAG', 'Custom GPTs & agents', 'Priority models'], featured: true },
              { name: 'Team', price: '$49', tagline: 'For teams', credits: '600,000 credits / month', features: ['Everything in Pro', 'Team workspaces', 'Brand voices', 'Audit logs'] }
            ].map((p) => (
              <div key={p.name} className={`panel p-6 relative ${p.featured ? 'border-brand-400/50 ring-ai' : ''}`}>
                {p.featured && (
                  <span className="absolute -top-3 right-4 chip border-brand-400/40 text-brand-200">Most popular</span>
                )}
                <div className="text-sm text-ink-muted">{p.tagline}</div>
                <div className="mt-2 font-display text-2xl font-semibold text-white">{p.name}</div>
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="font-display text-4xl font-semibold gradient-text">{p.price}</span>
                  <span className="text-ink-muted text-sm">/mo</span>
                </div>
                <div className="mt-1 text-xs text-ink-dim">{p.credits}</div>
                <ul className="mt-5 space-y-2 text-sm text-ink-dim">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-brand-300 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className={`mt-6 w-full justify-center ${p.featured ? 'btn-primary' : 'btn-secondary'}`}>
                  Start with {p.name}
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-8 panel p-6 text-center">
            <div className="font-display text-xl text-white">Enterprise</div>
            <div className="text-sm text-ink-dim mt-1">SSO, custom SLAs, on-prem deployment, audit logs, custom limits.</div>
            <button className="btn-secondary mt-4">Talk to sales</button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="panel-glow p-10 md:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-mesh opacity-60 pointer-events-none" />
            <h3 className="relative font-display text-3xl md:text-5xl font-semibold gradient-text-vibrant">
              Ready to fuse your AI stack?
            </h3>
            <p className="relative mt-3 text-ink-dim max-w-xl mx-auto">
              Spin up a workspace in seconds. No credit card. All AI providers — yours to plug in.
            </p>
            <div className="relative mt-7 flex items-center justify-center gap-3">
              <Link to="/register" className="btn-primary text-base px-6 py-3">Start free <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/login" className="btn-ghost text-base px-6 py-3">Sign in</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <Logo />
          <div className="text-sm text-ink-muted">
            © {new Date().getFullYear()} CodexFuse. Built for builders.
          </div>
        </div>
      </footer>
    </div>
  );
}

// tiny inline icon to avoid an extra import inside the hero mock
function LayoutDash(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}

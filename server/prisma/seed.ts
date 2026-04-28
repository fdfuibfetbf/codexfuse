import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { env } from '../src/config/env.js';

const prisma = new PrismaClient();

async function main() {
  const plans = [
    {
      name: 'Free',
      description: 'Get started with CodexFuse',
      priceCents: 0,
      interval: 'MONTH' as const,
      monthlyCredits: 10000,
      features: { chat: true, image: true, tts: true, stt: true, code: true, templates: true } as any,
      sortOrder: 0
    },
    {
      name: 'Pro',
      description: 'For creators & professionals',
      priceCents: 1900,
      interval: 'MONTH' as const,
      monthlyCredits: 200000,
      features: { everything: true, priorityModels: true, rag: true, agents: true, workflows: true } as any,
      sortOrder: 1
    },
    {
      name: 'Team',
      description: 'For teams that ship together',
      priceCents: 4900,
      interval: 'MONTH' as const,
      monthlyCredits: 600000,
      features: { everything: true, teamWorkspaces: true, brandVoices: true, customBots: true } as any,
      sortOrder: 2
    },
    {
      name: 'Enterprise',
      description: 'Custom limits, SSO, audit logs',
      priceCents: 0,
      interval: 'MONTH' as const,
      monthlyCredits: 0,
      features: { everything: true, sso: true, audit: true, sla: true, contact: true } as any,
      sortOrder: 3
    }
  ];
  for (const p of plans) {
    await prisma.plan.upsert({
      where: { name: p.name },
      create: p,
      update: { description: p.description, priceCents: p.priceCents, monthlyCredits: p.monthlyCredits, features: p.features as any }
    });
  }

  const templates = [
    {
      slug: 'blog-post',
      name: 'Blog post writer',
      category: 'Content',
      description: 'Long-form, SEO-friendly blog post.',
      icon: '📝',
      promptTemplate:
        'Write a {{tone}} blog post about "{{topic}}" targeting {{audience}}. Include an engaging intro, 4-6 H2 sections, and a CTA. Length: ~{{length}} words.',
      fields: [
        { name: 'topic', label: 'Topic', type: 'text', required: true },
        { name: 'audience', label: 'Audience', type: 'text', placeholder: 'e.g. early-stage founders' },
        { name: 'tone', label: 'Tone', type: 'select', options: ['professional', 'casual', 'witty', 'authoritative'] },
        { name: 'length', label: 'Word count', type: 'number', default: 800 }
      ] as any,
      isFeatured: true,
      sortOrder: 1
    },
    {
      slug: 'ad-copy',
      name: 'Ad copy generator',
      category: 'Marketing',
      icon: '🎯',
      promptTemplate:
        'Write {{count}} variations of {{platform}} ad copy for {{product}} aimed at {{audience}}. Each variation: hook (≤7 words), body (≤30 words), CTA.',
      fields: [
        { name: 'product', label: 'Product / service', type: 'text', required: true },
        { name: 'audience', label: 'Audience', type: 'text' },
        { name: 'platform', label: 'Platform', type: 'select', options: ['Facebook', 'Google', 'LinkedIn', 'X / Twitter', 'TikTok'] },
        { name: 'count', label: 'Variations', type: 'number', default: 5 }
      ] as any,
      isFeatured: true,
      sortOrder: 2
    },
    {
      slug: 'email-sequence',
      name: 'Email sequence',
      category: 'Marketing',
      icon: '✉️',
      promptTemplate:
        'Create a {{count}}-email {{purpose}} sequence for {{audience}}. Each email: subject line, preview text, body (~150 words), and CTA.',
      fields: [
        { name: 'purpose', label: 'Purpose', type: 'select', options: ['onboarding', 'sales', 're-engagement', 'cart abandonment'] },
        { name: 'audience', label: 'Audience', type: 'text' },
        { name: 'count', label: 'Emails', type: 'number', default: 5 }
      ] as any,
      sortOrder: 3
    },
    {
      slug: 'product-description',
      name: 'Product description',
      category: 'E-commerce',
      icon: '🛍️',
      promptTemplate:
        'Write a compelling product description for "{{name}}". Key features: {{features}}. Audience: {{audience}}. Include 1-paragraph hero, bullet features, and SEO meta description.',
      fields: [
        { name: 'name', label: 'Product name', type: 'text', required: true },
        { name: 'features', label: 'Key features', type: 'textarea' },
        { name: 'audience', label: 'Audience', type: 'text' }
      ] as any,
      sortOrder: 4
    },
    {
      slug: 'social-caption',
      name: 'Social media caption',
      category: 'Social',
      icon: '📱',
      promptTemplate: 'Write {{count}} {{platform}} captions about "{{topic}}" with relevant hashtags and emojis.',
      fields: [
        { name: 'topic', label: 'Topic', type: 'text', required: true },
        { name: 'platform', label: 'Platform', type: 'select', options: ['Instagram', 'X / Twitter', 'LinkedIn', 'TikTok', 'Facebook'] },
        { name: 'count', label: 'Variations', type: 'number', default: 5 }
      ] as any,
      sortOrder: 5
    },
    {
      slug: 'cold-outreach',
      name: 'Cold outreach',
      category: 'Sales',
      icon: '🤝',
      promptTemplate:
        'Write a personalized cold outreach to {{persona}} at {{company}}. Goal: {{goal}}. Reference: {{context}}. Subject + 90-word email + 1-line follow-up.',
      fields: [
        { name: 'persona', label: 'Persona', type: 'text' },
        { name: 'company', label: 'Company', type: 'text' },
        { name: 'goal', label: 'Goal', type: 'text' },
        { name: 'context', label: 'Personalization', type: 'textarea' }
      ] as any,
      sortOrder: 6
    },
    {
      slug: 'youtube-script',
      name: 'YouTube script',
      category: 'Content',
      icon: '🎬',
      promptTemplate:
        'Write a {{length}}-minute YouTube video script about "{{topic}}". Hook in first 10 seconds, clear chapters, retention beats, and CTA.',
      fields: [
        { name: 'topic', label: 'Topic', type: 'text', required: true },
        { name: 'length', label: 'Length (minutes)', type: 'number', default: 8 }
      ] as any,
      sortOrder: 7
    },
    {
      slug: 'seo-keywords',
      name: 'SEO keyword cluster',
      category: 'SEO',
      icon: '🔎',
      promptTemplate:
        'Generate an SEO keyword cluster for "{{topic}}". Group as: pillar keyword, 5-8 supporting keywords, 5 long-tail. Add intent (info/commercial/transactional).',
      fields: [{ name: 'topic', label: 'Topic', type: 'text', required: true }] as any,
      sortOrder: 8
    },
    {
      slug: 'meeting-summary',
      name: 'Meeting summary',
      category: 'Productivity',
      icon: '🗒️',
      promptTemplate:
        'Summarize the meeting transcript below. Output: 3-line TL;DR, decisions, action items (owner + due date), risks.\n\nTranscript:\n{{transcript}}',
      fields: [{ name: 'transcript', label: 'Transcript', type: 'textarea', required: true }] as any,
      sortOrder: 9
    },
    {
      slug: 'tweet-thread',
      name: 'Tweet / X thread',
      category: 'Social',
      icon: '🧵',
      promptTemplate:
        'Write a {{count}}-tweet X thread about "{{topic}}". Hook tweet that earns the click, value-dense body, strong close.',
      fields: [
        { name: 'topic', label: 'Topic', type: 'text', required: true },
        { name: 'count', label: 'Tweets', type: 'number', default: 8 }
      ] as any,
      sortOrder: 10
    }
  ];
  for (const t of templates) {
    await prisma.promptTemplate.upsert({
      where: { slug: t.slug },
      create: t as any,
      update: t as any
    });
  }

  const adminEmail = env.SEED_ADMIN_EMAIL;
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const passwordHash = await bcrypt.hash(env.SEED_ADMIN_PASSWORD, 10);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: 'CodexFuse Admin',
        role: 'SUPERADMIN',
        emailVerified: new Date(),
        credits: 1_000_000
      }
    });
    const ws = await prisma.workspace.create({
      data: { name: 'CodexFuse HQ', slug: 'codexfuse-hq', ownerId: admin.id }
    });
    await prisma.membership.create({ data: { userId: admin.id, workspaceId: ws.id, role: 'OWNER' } });
    // eslint-disable-next-line no-console
    console.log(`[seed] Admin created: ${adminEmail} / ${env.SEED_ADMIN_PASSWORD}`);
  }
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

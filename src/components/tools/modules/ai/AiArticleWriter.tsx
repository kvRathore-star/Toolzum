"use client";
import React, { useState, useEffect } from 'react';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from '@/lib/clipboard';

type Tone = 'Professional' | 'Casual' | 'Persuasive' | 'Informative' | 'Storytelling';
type Audience = 'General' | 'Technical' | 'Business' | 'Academic' | 'Beginners';
type SectionId = 'introduction' | 'body' | 'conclusion' | 'faq' | 'takeaways';
type Format = 'txt' | 'md' | 'html';
type LengthKey = 'Short' | 'Medium' | 'Long';

interface OutlineItem {
  sectionId: SectionId;
  title: string;
  subtopics: string[];
  content: string;
}

const TONES: Tone[] = ['Professional', 'Casual', 'Persuasive', 'Informative', 'Storytelling'];
const AUDIENCES: Audience[] = ['General', 'Technical', 'Business', 'Academic', 'Beginners'];
const LENGTHS: { key: LengthKey; label: string; words: number }[] = [
  { key: 'Short', label: 'Short (300 words)', words: 300 },
  { key: 'Medium', label: 'Medium (800 words)', words: 800 },
  { key: 'Long', label: 'Long (1500 words)', words: 1500 },
];
const ALL_SECTIONS: { id: SectionId; label: string }[] = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'body', label: 'Body paragraphs' },
  { id: 'conclusion', label: 'Conclusion' },
  { id: 'faq', label: 'FAQ' },
  { id: 'takeaways', label: 'Key Takeaways' },
];

const TRANSITIONS = [
  'Furthermore,', 'In addition,', 'Moreover,', 'On the other hand,',
  'However,', 'Similarly,', 'As a result,', 'Consequently,', 'Notably,',
  'Specifically,', 'In particular,', 'For instance,', 'To illustrate,',
  'Consider this:', 'In practice,', 'Additionally,', 'Beyond that,',
  'With this in mind,', 'Looking ahead,', 'At its core,',
];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]!; }
function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}
function fill(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce((s, [k, v]) => s.replace(new RegExp(`\\{${k}\\}`, 'g'), v), template);
}

const TOPIC_KEYWORDS: Record<string, string[]> = {
  default: ['innovation', 'transformation', 'growth', 'opportunity', 'strategy', 'impact', 'trends', 'solutions', 'challenges', 'advancements'],
};

const INTROS: Record<Tone, string[]> = {
  Professional: [
    "In today's {topic} landscape, {trend} has become increasingly important. This article explores {main_points} and provides actionable insights for {audience}.",
    "{topic} stands at a pivotal crossroads. As {trend} reshapes the industry, understanding its implications for {audience} has never been more critical.",
    "The landscape of {topic} is evolving rapidly. Organizations and individuals alike must stay informed about {trend} to remain competitive and effective.",
    "Over the past decade, {topic} has emerged as a cornerstone of modern practice. This comprehensive guide examines the key developments shaping its future.",
    "{topic} continues to transform how we approach {main_points}. This article provides {audience} with a thorough overview of current best practices and emerging trends.",
  ],
  Casual: [
    "Let's talk about {topic}. It's everywhere these days, and for good reason — {trend} is changing the game in exciting ways.",
    "So, {topic}. You've probably heard about it, but what's the real deal? In this article, we'll break down everything {audience} needs to know.",
    "If you've been following {topic}, you know things are moving fast. {trend} is making waves, and we're here to help you make sense of it all.",
    "Hey there! Welcome to our deep dive into {topic}. Whether you're just curious or looking to level up, we've got you covered.",
    "Confused about {topic}? Don't worry — you're not alone. Let's untangle it together and explore what {trend} means for you.",
  ],
  Persuasive: [
    "It's time to rethink {topic}. The evidence is clear: {trend} offers unprecedented advantages for {audience} who are ready to act.",
    "Imagine a world where {topic} works seamlessly for everyone. That future is closer than you think, and here's why {audience} should care.",
    "Don't get left behind. {topic} is transforming at breakneck speed, and those who embrace {trend} will reap the greatest rewards.",
    "The question isn't whether {topic} matters — it's whether you can afford to ignore it. Let us show you why action is essential now.",
    "Every day without embracing {topic} is a missed opportunity. This article makes the case for why {audience} must prioritize {trend} today.",
  ],
  Informative: [
    "{topic} refers to the practice of {main_points}. Understanding its core components is essential for {audience} looking to build foundational knowledge.",
    "What exactly is {topic}? In simple terms, it encompasses {main_points}. This guide provides a comprehensive overview for {audience}.",
    "This article aims to define and explore {topic} in detail. We'll examine its history, current applications, and future directions for {audience}.",
    "To understand {topic}, we must first examine its fundamental principles. This resource breaks down the key concepts for {audience}.",
    "Here is everything {audience} needs to know about {topic}. From basic definitions to practical applications, we cover it all.",
  ],
  Storytelling: [
    "Every great innovation has a story, and {topic} is no exception. Our journey begins with a simple question: how did {trend} change everything?",
    "Picture this: a world without {topic}. Hard to imagine, right? Let's take a journey through the story of how {trend} reshaped our reality.",
    "It started as an idea — a spark that would grow into something much bigger. The story of {topic} is one of {trend}, resilience, and transformation.",
    "Once upon a time, {topic} was just a concept. Today, it's woven into the fabric of our daily lives. Here's the story of that incredible journey.",
    "The best stories reveal something about ourselves, and {topic}'s story is no different. Join us as we explore the narrative behind {trend}.",
  ],
};

const BODIES: Record<Tone, string[]> = {
  Professional: [
    "One of the most significant aspects of {topic} is {subtopic}. {explanation} For {audience}, this means {implication}.",
    "When examining {topic}, {subtopic} emerges as a critical factor. Organizations implementing this approach see {benefit} in their operations.",
    "The relationship between {topic} and {subtopic} cannot be overstated. Research shows that {finding}, which directly impacts {audience}.",
    "A key consideration in {topic} is {subtopic}. By focusing on this area, {audience} can achieve {benefit} while mitigating potential risks.",
    "Industry data reveals that {topic} drives significant improvements in {subtopic}. Case studies demonstrate {finding} across multiple sectors.",
  ],
  Casual: [
    "Here's something cool about {topic}: {subtopic}. {explanation} Pretty neat, right? {audience} can totally use this to {benefit}.",
    "Let's dive into {subtopic}, which is a huge part of {topic}. The gist is simple: {explanation} and that's great news for {audience}.",
    "One thing you'll notice about {topic} is {subtopic}. {explanation} This matters because it helps {audience} {benefit}.",
    "Now, {subtopic} might sound complicated, but trust me — it's not. {explanation} In plain English, {audience} gets to {benefit}.",
    "Alright, let's get into the nitty-gritty of {topic}. First up: {subtopic}. {explanation} Here's why {audience} should care.",
  ],
  Persuasive: [
    "Here is the hard truth about {topic}: {subtopic} can no longer be ignored. {explanation} {audience} must act now to {benefit}.",
    "Think about {subtopic} for a moment. Studies consistently show that {finding} — yet most {audience} are still not taking advantage.",
    "The evidence supporting {topic} is overwhelming. When it comes to {subtopic}, {finding} proves that {audience} stands to gain significantly.",
    "What sets successful approaches apart is attention to {subtopic}. {explanation} The choice is clear: {audience} must embrace this or risk falling behind.",
    "Consider the impact of {subtopic} on {topic}. {finding} Those who ignore this do so at their own peril.",
  ],
  Informative: [
    "To understand {topic}, one must first examine {subtopic}. This component plays a vital role because {explanation}.",
    "{subtopic} is defined as {definition}. In the context of {topic}, it serves to {benefit} for {audience}.",
    "A detailed analysis of {subtopic} reveals that {finding}. This is particularly relevant for {audience} studying {topic}.",
    "The following section examines {subtopic} in depth. Key characteristics include {characteristics}, which contribute to {topic}'s overall function.",
    "Research indicates that {subtopic} affects {topic} in several ways. First, {point_one}. Second, {point_two}. Understanding this helps {audience}.",
  ],
  Storytelling: [
    "The story of {topic} takes an interesting turn when we look at {subtopic}. {explanation} This is where the magic really happens.",
    "Imagine you're exploring {topic} for the first time. You'd quickly discover {subtopic}, and that's where the transformation begins.",
    "Every hero's journey has a turning point, and in the story of {topic}, {subtopic} plays that role. {explanation} The result? {benefit} for {audience}.",
    "Let me tell you about the moment everything changed in {topic}. It happened when {subtopic} emerged, and {explanation} changed the game forever.",
    "What makes the story of {topic} compelling is {subtopic}. {explanation} {audience} everywhere experienced a shift in how they approached things.",
  ],
};

const CONCLUSIONS: Record<Tone, string[]> = {
  Professional: [
    "As we've seen, {topic} offers {key_benefit}. By {action_step}, {audience} can {positive_outcome}.",
    "In conclusion, {topic} represents a significant opportunity for {audience}. The path forward involves {action_step} to achieve {positive_outcome}.",
    "To summarize, the key takeaway from our exploration of {topic} is that {summary_point}. {audience} should prioritize {action_step} moving forward.",
    "The evidence presented makes it clear: {topic} is reshaping how {audience} approaches {key_area}. Strategic action today will yield substantial benefits.",
  ],
  Casual: [
    "So there you have it — everything you need to know about {topic}. The bottom line? {summary_point} {audience} can start by {action_step}.",
    "Wrapping things up: {topic} is pretty amazing, and the best part is {key_benefit}. Go ahead, give {action_step} a try!",
    "And that's a wrap! We hope this guide to {topic} was helpful. Remember, {summary_point} So don't wait — start {action_step} today.",
    "To sum it all up: {topic} doesn't have to be complicated. Just focus on {action_step}, and you'll see {positive_outcome} in no time.",
  ],
  Persuasive: [
    "The time for action is now. {topic} offers {key_benefit}, and {audience} who embrace {action_step} will be the ones to {positive_outcome}.",
    "Don't wait another day. The evidence is irrefutable — {topic} delivers {positive_outcome} for those who commit to {action_step}.",
    "Here's the bottom line: {topic} works. {summary_point} Take the first step today by {action_step} and join the leaders already benefiting.",
    "The verdict is in: {topic} is not just important — it's essential. {audience} must act on {action_step} to secure {positive_outcome}.",
  ],
  Informative: [
    "This article has provided an overview of {topic}, covering its definition, key components, and practical applications for {audience}.",
    "In summary, {topic} encompasses {main_points}. {audience} can apply these concepts by {action_step} to achieve {positive_outcome}.",
    "To conclude, {topic} is a multifaceted domain with significant implications for {audience}. Further reading is recommended on {action_step}.",
    "We have explored the fundamental aspects of {topic}. Armed with this knowledge, {audience} is well-positioned to {positive_outcome}.",
  ],
  Storytelling: [
    "And so our story draws to a close. {topic}'s journey from {beginning} to {present} teaches us that {summary_point}.",
    "Every great story ends with a lesson, and {topic}'s tale is no different. The moral is clear: {summary_point} {audience} can write their own chapter next.",
    "As our journey through {topic} comes to an end, remember that this is just the beginning of your story. {summary_point}",
    "The story of {topic} continues to evolve, and now you're part of it. {summary_point} The next chapter is yours to write.",
  ],
};

const FAQS: Record<Tone, { q: string; a: string }[]> = {
  Professional: [
    { q: 'What is {topic}?', a: '{topic} refers to {definition}. It encompasses {aspect1}, {aspect2}, and {aspect3}.' },
    { q: 'Why is {topic} important for {audience}?', a: '{topic} is crucial because {importance}. Organizations and individuals who prioritize it see measurable improvements in {benefit}.' },
    { q: 'How can {audience} get started with {topic}?', a: 'The first step is to {action}. From there, focus on {step2} and {step3} to build a solid foundation.' },
    { q: 'What are the common challenges in {topic}?', a: 'Some common challenges include {challenge1}, {challenge2}, and {challenge3}. Each can be addressed through {solution}.' },
    { q: 'What does the future hold for {topic}?', a: 'The future of {topic} is shaped by {trend1} and {trend2}. {audience} should prepare for {prediction}.' },
  ],
  Casual: [
    { q: 'What exactly is {topic}?', a: "Great question! {topic} is basically {definition}. Think of it as {analogy}." },
    { q: 'Why should {audience} care about {topic}?', a: 'Honestly? Because {importance}. It makes life easier and helps you {benefit}.' },
    { q: 'How do I start with {topic}?', a: 'Start small! Just {action}. Then move on to {step2} and {step3}. You\'ll get the hang of it in no time.' },
    { q: 'What mistakes should I avoid with {topic}?', a: 'The biggest one is {mistake}. Also watch out for {mistake2}. Stick to {tip} and you\'ll be fine.' },
    { q: 'Is {topic} worth the hype?', a: 'Short answer: yes! {importance} Plus, it opens up {benefit} for everyone.' },
  ],
  Persuasive: [
    { q: 'Why should I invest in {topic} now?', a: 'Because waiting costs you {cost}. Early adopters of {topic} gain {benefit} while others play catch-up.' },
    { q: 'What is the ROI of {topic}?', a: '{topic} delivers significant returns: {metric1} improvement in {area1} and {metric2} boost in {area2}.' },
    { q: 'How does {topic} compare to alternatives?', a: 'Unlike traditional approaches, {topic} offers {advantage1} and {advantage2}. The choice is clear.' },
    { q: 'What happens if {audience} ignores {topic}?', a: 'The risk is {risk}. Meanwhile, competitors who embrace {topic} gain {benefit}.' },
    { q: 'Can {topic} really make a difference?', a: 'Absolutely. Data shows that {stat}. {audience} who adopt {topic} consistently outperform their peers.' },
  ],
  Informative: [
    { q: 'What is the definition of {topic}?', a: '{topic} is formally defined as {definition}. It comprises {aspect1}, {aspect2}, and {aspect3}.' },
    { q: 'What are the key components of {topic}?', a: 'The primary components include {component1}, {component2}, and {component3}. Each serves a distinct function.' },
    { q: 'How does {topic} work in practice?', a: 'In practice, {topic} operates through {mechanism}. {audience} typically implements it via {method}.' },
    { q: 'What research supports {topic}?', a: 'Numerous studies, including {study1} and {study2}, demonstrate that {finding}.' },
    { q: 'Where can I learn more about {topic}?', a: 'Recommended resources include {resource1}, {resource2}, and {resource3} for comprehensive coverage.' },
  ],
  Storytelling: [
    { q: 'Where did {topic} originate?', a: 'The story of {topic} begins with {origin}. From there, it evolved through {milestone1} to what we know today.' },
    { q: 'How has {topic} changed over time?', a: '{topic} has transformed dramatically. Early versions focused on {early_focus}, but today it encompasses so much more.' },
    { q: 'What is the most inspiring {topic} success story?', a: 'One of the most remarkable stories is {story}. It shows how {topic} can {impact}.' },
    { q: 'Who are the pioneers of {topic}?', a: 'Key figures include {pioneer1}, who {contribution1}, and {pioneer2}, known for {contribution2}.' },
    { q: 'What is the future vision for {topic}?', a: 'Looking ahead, {topic} aims to {vision}. It\'s a story still being written, and we\'re all part of it.' },
  ],
};

const TAKEAWAY_TEMPLATES: Record<Tone, string[]> = {
  Professional: [
    '{topic} enables {audience} to {benefit} through strategic implementation of {method}.',
    'Understanding {subtopic} is essential for maximizing the value of {topic}.',
    '{audience} should prioritize {action} to stay ahead in the evolving {topic} landscape.',
    'The integration of {topic} into daily practice yields measurable improvements in {metric}.',
    'Continuous learning and adaptation are key to leveraging {topic} effectively.',
  ],
  Casual: [
    '{topic} makes life easier for {audience} by {benefit}. Simple as that.',
    'Don\'t overthink {subtopic} — just start with {action} and build from there.',
    'The best thing about {topic}? It helps {audience} {benefit} without the hassle.',
    'Stay curious about {topic}. Try {action} and see what works for you.',
    '{topic} is a game-changer for {audience}. Give it a shot!',
  ],
  Persuasive: [
    'Adopting {topic} now gives {audience} a competitive edge through {benefit}.',
    '{action} is the single most impactful step {audience} can take for {topic}.',
    'The data is clear: {topic} delivers {benefit} — the time to act is now.',
    '{audience} who embrace {topic} will define the future of {field}.',
    'Don\'t underestimate {subtopic} — it\'s the key to unlocking {topic}\'s full potential.',
  ],
  Informative: [
    '{topic} is built on the core principles of {principle1} and {principle2}.',
    'Key methods in {topic} include {method1}, {method2}, and {method3}.',
    '{audience} should understand that {topic} requires {requirement} for effective implementation.',
    'The most important fact about {topic} is {key_fact}.',
  ],
  Storytelling: [
    'Every journey with {topic} starts with a single step: {action}.',
    'The story of {topic} teaches us that {lesson}.',
    '{audience} can write their own success story with {topic} by {action}.',
    'Remember: {topic} is not just a tool — it\'s a narrative of {theme}.',
  ],
};

interface AudienceCtx {
  trend: string; implication: string; benefit: string; explanation: string;
  finding: string; action_step: string; positive_outcome: string; key_benefit: string;
  summary_point: string; definition: string; importance: string; analogy: string;
}
const AUDIENCE_CONTEXT: Record<Audience, AudienceCtx> = {
  General: {
    trend: 'digital transformation',
    implication: 'staying informed and adapting to change',
    benefit: 'improve their daily workflows and decision-making',
    explanation: 'it affects how we interact, work, and live',
    finding: 'adoption rates continue to climb across all age groups',
    action_step: 'learning the fundamentals and experimenting with practical applications',
    positive_outcome: 'make more informed decisions and enhance their productivity',
    key_benefit: 'practical advantages that anyone can leverage',
    summary_point: 'it is accessible, practical, and increasingly essential',
    definition: 'the application of modern methods and technologies to solve everyday problems',
    importance: 'it touches nearly every aspect of modern life',
    analogy: 'a Swiss Army knife for modern challenges',
  },
  Technical: {
    trend: 'architectural innovation and system optimization',
    implication: 'rethinking infrastructure and adopting scalable patterns',
    benefit: 'optimize systems, reduce latency, and improve reliability',
    explanation: 'it directly impacts performance benchmarks and system architecture',
    finding: 'performance improvements of 40-60% are consistently reported',
    action_step: 'evaluating current architecture and implementing incremental improvements',
    positive_outcome: 'achieve measurable performance gains and operational efficiency',
    key_benefit: 'significant improvements in system performance and maintainability',
    summary_point: 'the technical advantages are quantifiable and substantial',
    definition: 'a set of technical practices and architectural patterns for building robust systems',
    importance: 'it addresses fundamental challenges in scalability and maintainability',
    analogy: 'a well-architected framework for complex systems',
  },
  Business: {
    trend: 'market disruption and competitive differentiation',
    implication: 'reassessing business models and value propositions',
    benefit: 'increase revenue, reduce costs, and gain market share',
    explanation: 'it drives efficiency and creates new revenue opportunities',
    finding: 'companies implementing this see 25% faster growth',
    action_step: 'developing a strategic roadmap and allocating resources effectively',
    positive_outcome: 'achieve sustainable growth and competitive advantage',
    key_benefit: 'measurable ROI and long-term competitive advantage',
    summary_point: 'the business case is compelling and the ROI is proven',
    definition: 'a strategic approach to improving business outcomes through modern practices',
    importance: 'it directly impacts profitability and market positioning',
    analogy: 'a strategic investment portfolio for business growth',
  },
  Academic: {
    trend: 'paradigm shifts in theoretical frameworks',
    implication: 'revisiting established theories and research methodologies',
    benefit: 'advance research, publish findings, and secure funding',
    explanation: 'it opens new avenues for inquiry and methodological innovation',
    finding: 'peer-reviewed studies demonstrate statistically significant outcomes',
    action_step: 'reviewing current literature and designing rigorous studies',
    positive_outcome: 'contribute meaningful research to the field',
    key_benefit: 'new theoretical insights and methodological advancements',
    summary_point: 'the academic implications are far-reaching and merit further investigation',
    definition: 'a field of study encompassing theoretical frameworks and empirical research',
    importance: 'it addresses fundamental questions in the discipline',
    analogy: 'a rich interdisciplinary research paradigm',
  },
  Beginners: {
    trend: 'new opportunities for learning and growth',
    implication: 'building foundational skills and gaining confidence',
    benefit: 'learn new skills and build confidence quickly',
    explanation: 'it is designed to be approachable and easy to understand',
    finding: 'beginners can get started with just a few basic concepts',
    action_step: 'starting with the basics and practicing regularly',
    positive_outcome: 'build a strong foundation and grow from there',
    key_benefit: 'a gentle learning curve with practical results',
    summary_point: 'anyone can learn it with the right approach and patience',
    definition: 'a way of doing things that is designed to be simple and effective',
    importance: 'it helps people get started without feeling overwhelmed',
    analogy: 'training wheels for a new skill',
  },
};

function fillFAQ(template: { q: string; a: string }, vars: Record<string, string>): { question: string; answer: string } {
  return {
    question: fill(template.q, vars),
    answer: fill(template.a, vars),
  };
}

function generateOutline(topic: string, tone: Tone, audience: Audience, sections: SectionId[]): OutlineItem[] {
  const ctx = AUDIENCE_CONTEXT[audience]!;
  const words = TOPIC_KEYWORDS.default!;
  const vars: Record<string, string> = {
    topic, audience,
    trend: ctx.trend,
    implication: ctx.implication,
    benefit: ctx.benefit,
    explanation: ctx.explanation,
    finding: ctx.finding,
    action_step: ctx.action_step,
    positive_outcome: ctx.positive_outcome,
    key_benefit: ctx.key_benefit,
    summary_point: ctx.summary_point,
    definition: ctx.definition,
    importance: ctx.importance,
    analogy: ctx.analogy,
    main_points: pickN(words, 3).join(', '),
    subtopic: pickN(words, 2).join(' and '),
    key_area: pick(words),
    sub: pick(words),
    action: pick(words),
  };

  return sections.map((sectionId) => {
    switch (sectionId) {
      case 'introduction': {
        const t = pick(INTROS[tone]);
        return {
          sectionId,
          title: `Introduction to ${topic}`,
          subtopics: [
            `Overview of ${topic} and its relevance`,
            `Current ${ctx.trend} shaping the landscape`,
            `What ${audience.toLowerCase()} needs to know`,
          ],
          content: fill(t, vars),
        };
      }
      case 'body': {
        const bodyVars = { ...vars, sub: pick(words), characteristic: pick(words) };
        const p1 = fill(pick(BODIES[tone]), {
          ...bodyVars,
          subtopic: pickN(words, 3).join(', '),
          explanation: ctx.explanation,
          implication: ctx.implication,
          benefit: ctx.benefit,
          finding: ctx.finding,
          point_one: pick(words),
          point_two: pick(words),
          characteristics: `${pick(words)}, ${pick(words)}`,
          definition: ctx.definition,
        });
        const p2 = fill(pick(BODIES[tone]), {
          ...bodyVars,
          subtopic: `key methodologies in ${topic}`,
          explanation: 'it provides a structured approach to problem-solving',
          benefit: ctx.benefit,
          finding: ctx.finding,
          implication: ctx.implication,
          point_one: pick(words),
          point_two: pick(words),
          characteristics: `${pick(words)} and ${pick(words)}`,
          definition: ctx.definition,
        });
        const p3 = fill(pick(BODIES[tone]), {
          ...bodyVars,
          subtopic: `practical applications of ${topic}`,
          explanation: 'real-world implementations demonstrate its effectiveness',
          benefit: ctx.benefit,
          finding: ctx.finding,
          implication: ctx.implication,
          point_one: pick(words),
          point_two: pick(words),
          characteristics: `${pick(words)}, ${pick(words)}`,
          definition: ctx.definition,
        });
        return {
          sectionId,
          title: `Understanding ${topic}`,
          subtopics: ['Core concepts and principles', 'Key methodologies', 'Practical applications'],
          content: [p1, p2, p3].map(s => `${pick(TRANSITIONS)} ${s}`).join('\n\n'),
        };
      }
      case 'conclusion': {
        const t = pick(CONCLUSIONS[tone]);
        return {
          sectionId,
          title: 'Conclusion',
          subtopics: [`Summary of ${topic} insights`, 'Actionable next steps', `Future outlook for ${topic}`],
          content: fill(t, vars),
        };
      }
      case 'faq': {
        const faqTemplates = pickN(FAQS[tone], 3);
        const faqs = faqTemplates.map((ft) => fillFAQ(ft, {
          ...vars,
          aspect1: pick(words),
          aspect2: pick(words),
          aspect3: pick(words),
          trend1: pick(words),
          trend2: pick(words),
          prediction: ctx.trend,
          analogy: ctx.analogy,
          definition: ctx.definition,
          importance: ctx.importance,
          mistake: 'overcomplicating the basics',
          mistake2: 'ignoring best practices',
          tip: 'sticking to proven approaches',
          cost: 'valuable time and resources',
          metric1: 'up to 40%',
          metric2: 'over 50%',
          area1: 'efficiency',
          area2: 'productivity',
          advantage1: 'faster implementation',
          advantage2: 'lower overhead',
          risk: 'falling behind competitors',
          stat: 'adoption has grown 300% in recent years',
          component1: pick(words),
          component2: pick(words),
          component3: pick(words),
          mechanism: 'a combination of structured processes and best practices',
          method: 'established frameworks and guidelines',
          study1: 'recent industry reports',
          study2: 'academic research papers',
          resource1: 'industry publications',
          resource2: 'online courses',
          resource3: 'professional communities',
          origin: 'early experiments and pioneering efforts',
          milestone1: 'key breakthroughs and innovations',
          early_focus: 'foundational concepts',
          story: 'a startup that transformed their industry using these principles',
          impact: 'dramatically improve outcomes',
          pioneer1: 'early visionaries',
          contribution1: 'laid the groundwork',
          pioneer2: 'modern innovators',
          contribution2: 'expanded the possibilities',
          vision: 'become more accessible and impactful than ever before',
        }));
        return {
          sectionId,
          title: 'Frequently Asked Questions',
          subtopics: faqs.map((f) => f.question),
          content: faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n'),
        };
      }
      case 'takeaways': {
        const selected = pickN(TAKEAWAY_TEMPLATES[tone], 4);
        const takeawayVars = { ...vars, sub: pick(words), action: pick(words), theme: pick(words), method: pick(words), metric: pick(words), principle1: pick(words), principle2: pick(words), method1: pick(words), method2: pick(words), method3: pick(words), requirement: ctx.definition, key_fact: ctx.importance, lesson: ctx.summary_point, field: pick(words) };
        return {
          sectionId,
          title: 'Key Takeaways',
          subtopics: selected.map((s) => fill(s, takeawayVars)),
          content: selected.map((s) => `• ${fill(s, takeawayVars)}`).join('\n'),
        };
      }
    }
  });
}

function renderContent(items: OutlineItem[], format: Format): string {
  switch (format) {
    case 'txt':
      return items.map((item) => `${item.title}\n${'='.repeat(item.title.length)}\n\n${item.content}\n`).join('\n');
    case 'md':
      return items.map((item) => `## ${item.title}\n\n${item.content}\n`).join('\n');
    case 'html':
      return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Article: ${items.length} sections</title></head><body>\n${items.map((item) => `<h2>${item.title}</h2>\n<div>${item.content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</div>`).join('\n')}\n</body></html>`;
  }
}

function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export default function AiArticleWriter() {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState<Tone>('Professional');
  const [audience, setAudience] = useState<Audience>('General');
  const [length, setLength] = useState<LengthKey>('Medium');
  const [selectedSections, setSelectedSections] = useState<SectionId[]>(['introduction', 'body', 'conclusion']);
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [format, setFormat] = useState<Format>('md');
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    return () => {
      setOutline([]);
      setFinished(false);
    };
  }, []);

  const toggleSection = (id: SectionId) => {
    setSelectedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleGenerate = () => {
    if (!topic.trim()) { toast.error('Enter a topic first'); return; }
    if (selectedSections.length === 0) { toast.error('Select at least one section'); return; }
    setIsLoading(true);
    try {
      const result = generateOutline(topic.trim(), tone, audience, selectedSections);
      setOutline(result);
      setFinished(true);
      toast.success(`Outline generated with ${result.length} sections`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to generate outline');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (outline.length === 0) return;
    try {
      const content = renderContent(outline, format);
      const ext = format === 'html' ? 'html' : format === 'md' ? 'md' : 'txt';
      const mime = format === 'html' ? 'text/html' : format === 'md' ? 'text/markdown' : 'text/plain';
      const blob = new Blob([content], { type: `${mime};charset=utf-8` });
      const url = URL.createObjectURL(blob);
      downloadOrShare(url, `article_${topic.slice(0, 30).replace(/\s+/g, '_')}.${ext}`);
      URL.revokeObjectURL(url);
      toast.success('Article exported');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to export');
    }
  };

  const handleCopy = () => {
    if (outline.length === 0) return;
    try {
      const content = renderContent(outline, format);
      clipboardWrite(content).then(ok => { if (ok) toast.success('Copied to clipboard'); else toast.error('Copy blocked by the browser — select the text manually.'); });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to copy');
    }
  };

  const handleClear = () => {
    setOutline([]);
    setFinished(false);
    toast.success('Cleared');
  };

  const totalWords = outline.reduce((sum, item) => sum + wordCount(item.content), 0);

  const isShort = length === 'Short' && totalWords > 350;
  const isMedium = length === 'Medium' && totalWords > 850;
  const isLong = length === 'Long' && totalWords > 1550;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-overlay)] p-5 border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] rounded-2xl">
        <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          AI Article Writer
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1">Generate structured article outlines and content using intelligent templates.</p>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl px-4 py-3 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
        <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>This tool uses a smart template system with pre-written patterns — not a true AI generator. Content is generated locally from curated sentence templates and transition phrases.</span>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-5">
        <div className="space-y-2">
          <label htmlFor="lbl-aiarticlewriter-topic" className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Topic</label>
          <input id="lbl-aiarticlewriter-topic" aria-label="Topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="e.g., Artificial Intelligence in Healthcare, Remote Work Best Practices..."
            className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)] transition-colors text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label htmlFor="lbl-aiarticlewriter-tone" className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Tone</label>
            <select id="lbl-aiarticlewriter-tone" aria-label="Tone"
              value={tone}
              onChange={(e) => setTone(e.target.value as Tone)}
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)] transition-colors text-sm appearance-none cursor-pointer"
            >
              {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="lbl-aiarticlewriter-length" className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Length</label>
            <select id="lbl-aiarticlewriter-length" aria-label="Length"
              value={length}
              onChange={(e) => setLength(e.target.value as LengthKey)}
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)] transition-colors text-sm appearance-none cursor-pointer"
            >
              {LENGTHS.map((l) => <option key={l.key} value={l.key}>{l.label}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="lbl-aiarticlewriter-audience" className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Audience</label>
            <select id="lbl-aiarticlewriter-audience" aria-label="Audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value as Audience)}
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)] transition-colors text-sm appearance-none cursor-pointer"
            >
              {AUDIENCES.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Include Sections</label>
          <div className="flex flex-wrap gap-2">
            {ALL_SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => toggleSection(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  selectedSections.includes(s.id)
                    ? 'bg-[var(--accent)]/10 border-[var(--accent)]/20 text-[var(--accent)]'
                    : 'bg-[var(--bg-overlay)]/50 border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent)]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleGenerate} disabled={isLoading || !topic.trim()}
            className="flex-1 bg-[var(--accent-ink)] hover:bg-[var(--accent-ink)] disabled:bg-[var(--bg-elevated)] dark:disabled:bg-[var(--bg-elevated)] text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-xs cursor-pointer disabled:cursor-not-allowed">
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            )}
            {isLoading ? 'Generating...' : 'Generate Outline'}
          </button>
          <button onClick={handleClear} disabled={!finished}
            className="px-5 py-3 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear
          </button>
        </div>
      </div>

      {finished && outline.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">Generated Outline</h3>
                <span className="text-[10px] font-mono bg-[var(--bg-surface)] text-[var(--text-secondary)] px-2 py-0.5 rounded-full">
                  {totalWords} words
                </span>
                {(isShort || isMedium || isLong) && (
                  <span className="text-[10px] font-mono bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">
                    {length} target — regenerate if needed
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <select aria-label="Include Sections"
                  value={format}
                  onChange={(e) => setFormat(e.target.value as Format)}
                  className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)] appearance-none cursor-pointer"
                >
                  <option value="md">Markdown (.md)</option>
                  <option value="txt">Plain Text (.txt)</option>
                  <option value="html">HTML</option>
                </select>
                <button onClick={handleCopy}
                  className="p-2 border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-white hover:bg-[var(--bg-overlay)] dark:hover:bg-[var(--bg-elevated)] transition-all cursor-pointer"
                  aria-label="Copy article">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button onClick={handleExport}
                  className="p-2 border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] dark:hover:text-white hover:bg-[var(--bg-overlay)] dark:hover:bg-[var(--bg-elevated)] transition-all cursor-pointer"
                  aria-label="Download article">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {outline.map((item, i) => (
                <div key={item.sectionId} className="border border-[var(--border-subtle)] rounded-xl overflow-hidden">
                  <div className="bg-[var(--bg-overlay)]/50 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[var(--text-muted)]">{i + 1}.</span>
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">{item.title}</h4>
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)]">{wordCount(item.content)} words</span>
                  </div>
                  <div className="px-4 pb-3 pt-2">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {item.subtopics.map((st, j) => (
                        <span key={j} className="text-[10px] bg-[var(--bg-surface)] text-[var(--text-secondary)] dark:text-[var(--text-muted)] px-2 py-0.5 rounded-full">
                          {st}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                      {item.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

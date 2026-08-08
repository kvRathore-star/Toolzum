"use client";
import React, { useState, useEffect } from 'react';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: '📸', limit: 2200 },
  { id: 'twitter', label: 'Twitter/X', icon: '🐦', limit: 280 },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼', limit: 3000 },
  { id: 'facebook', label: 'Facebook', icon: '👍', limit: 63206 },
  { id: 'tiktok', label: 'TikTok', icon: '🎵', limit: 2200 },
  { id: 'pinterest', label: 'Pinterest', icon: '📌', limit: 500 },
];

const MOODS = ['Professional', 'Funny', 'Inspirational', 'Casual', 'Educational', 'Promotional'] as const;
const TONES = ['Formal', 'Conversational'] as const;
const FAV_KEY = 'aicaptions:favorites';

const T = {
  instagram: {
    Professional: ['Elevate your {topic} strategy with these proven approaches.', 'Mastering {topic} requires consistency and the right mindset.', 'The professional guide to {topic} — every detail matters.', 'Behind every successful {topic} is a well-thought-out plan.', 'Setting the standard in {topic} starts with quality execution.', 'Your {topic} goals are within reach with the right framework.', 'Precision and care define excellence in {topic}.', 'Building expertise in {topic} one step at a time.'],
    Funny: ['Me explaining {topic} like I have any idea what I am talking about.', 'My brain during {topic} discussions: full chaos mode.', '{topic} is easy they said. It will be fun they said.', 'Plot twist: {topic} is harder than assembling IKEA furniture.', 'My relationship with {topic} is complicated — mostly yelling.', 'That awkward moment when {topic} makes total sense in your head.', 'I put the pro in procrastination when it comes to {topic}.', 'Warning: may contain excessive enthusiasm about {topic}.'],
    Inspirational: ['Your {topic} journey is just beginning — embrace every moment.', 'Dream big about {topic} and watch the magic unfold.', 'The best time to explore {topic} was yesterday. The next best is now.', 'Let your passion for {topic} light the way forward.', 'Every expert in {topic} was once a beginner who never gave up.', 'Believe in your ability to master {topic} against all odds.', 'Small steps in {topic} lead to giant leaps of progress.'],
    Casual: ['Just diving into {topic} and honestly it is pretty cool.', 'Been thinking about {topic} lately and wanted to share some thoughts.', 'Casual evening deep dive into {topic}. Anyone else into this?', 'So I have been experimenting with {topic} and here is the deal.', 'Not gonna lie {topic} has been on my mind all week.', 'Quick thoughts on {topic} before I forget them.', 'Currently obsessed with {topic} and I am not sorry about it.'],
    Educational: ['Let us break down {topic} into simple understandable pieces.', 'Everything you need to know about {topic} in one post.', 'The science behind {topic} explained without the jargon.', 'A complete beginner guide to understanding {topic} effectively.', 'Here are the key principles of {topic} you should know.', 'How {topic} actually works — a step by step explanation.', 'Common misconceptions about {topic} debunked once and for all.', 'Why {topic} matters and how you can apply it today.'],
    Promotional: ['Introducing something game changing in the world of {topic}.', 'Your {topic} experience is about to level up big time.', 'We built this for everyone passionate about {topic}.', 'Finally the {topic} solution you have been waiting for.', 'Ready to transform how you approach {topic}? Try this.', 'Exclusive: new {topic} tools designed to supercharge your workflow.', 'Stop settling for average {topic} results. Upgrade today.', 'The {topic} revolution is here and you are invited.'],
  },
  twitter: {
    Professional: ['{topic} tip: focus on quality over quantity every time.', 'The key to {topic} success? Discipline and consistency.', 'Professional insight on {topic} that most people overlook.', '{topic} is evolving — here is what you need to know.', 'One thread about {topic} that will change your perspective.'],
    Funny: ['Me trying to explain {topic} in a single tweet. Bare with me.', '{topic} is basically adulting on hard mode.', 'My thoughts on {topic} are as organized as my desk. Yikes.', 'Started {topic} today. Send help and snacks.', '{topic} advice is 90% common sense and I am 0% common.'],
    Inspirational: ['Start small with {topic}. Consistency beats intensity.', 'Your breakthrough in {topic} is closer than you think.', 'Keep going. {topic} mastery takes time and patience.', 'The {topic} community is rooting for you. Keep at it.', 'One day your {topic} journey will inspire someone else.'],
    Casual: ['Hot take about {topic} incoming. Ready?', 'Unpopular opinion about {topic} but I stand by it.', '{topic} has been consuming my brain space lately.', 'Can we talk about {topic} for a minute? Good. Thanks.', 'Currently in my {topic} era and loving every second.'],
    Educational: ['{topic} explained in one tweet thread.', 'PSA: here is how {topic} actually works behind the scenes.', 'Stop overcomplicating {topic}. Here is the simple truth.', 'A quick lesson on {topic} for anyone starting out.', 'The {topic} fundamentals are simpler than you think.'],
    Promotional: ['Big {topic} news dropping soon. Stay tuned.', 'We are changing the {topic} game. You in?', 'Level up your {topic} game with this one tool.', 'Your {topic} workflow is about to get a major upgrade.', 'Exclusive {topic} offer for my followers only.'],
  },
  linkedin: {
    Professional: ['In my years working with {topic} I have learned one crucial lesson.', 'The future of {topic} demands a new approach to leadership.', 'I recently reflected on how {topic} has transformed our industry.', 'Here are three professional insights about {topic} worth considering.', 'What nobody tells you about building a career in {topic}.'],
    Funny: ['LinkedIn is serious but here is a lighthearted take on {topic}.', 'If corporate jargon about {topic} were a drinking game.', 'The meetings about {topic} could have been an email.', 'Networking advice about {topic} from someone who wing sit.', 'My professional journey in {topic} so far: plot twist at every turn.'],
    Inspirational: ['I went from knowing nothing about {topic} to leading projects in it.', 'The most resilient professionals share one thing about {topic}.', 'Your career in {topic} is not defined by your failures but by your grit.', 'Here is why I believe {topic} will define the next decade.', 'To everyone starting in {topic}: your perspective is valuable.'],
    Casual: ['Honest reflection on {topic} from my desk this Monday morning.', 'I have been thinking about {topic} and wanted to put this out there.', 'A candid take on {topic} that might ruffle some feathers.', 'My feed has been full of {topic} content so here is my two cents.', 'Lets keep it real about {topic} for a moment.'],
    Educational: ['Why {topic} matters: a deep dive into its business impact.', 'I broke down {topic} into five actionable strategies for you.', 'Understanding {topic} requires unlearning what you thought you knew.', 'A framework I use to approach {topic} effectively in any org.', 'The ROI of investing time in {topic} is higher than you estimate.'],
    Promotional: ['I am excited to share a new resource on {topic} we have been building.', 'If you care about {topic} you need to see what we just launched.', 'We are solving the biggest {topic} challenge. Here is how.', 'Proud to announce our latest initiative in the {topic} space.', 'After months of work our {topic} solution is finally here.'],
  },
  facebook: {
    Professional: ['I wanted to share some professional thoughts on {topic} today.', 'What is your experience with {topic} in your workplace?', 'A professional perspective on {topic} that might surprise you.', 'Here is what I have noticed about {topic} lately. Thoughts?', 'Lets discuss how {topic} is shaping our professional lives.'],
    Funny: ['My brain trying to handle {topic} today be like...', 'Who else finds {topic} simultaneously fascinating and exhausting?', 'I tried explaining {topic} to my family. Disaster.', 'Me pretending to understand advanced {topic} at work. Every time.', 'The struggle with {topic} is real and I am here for the comments.'],
    Inspirational: ['If you are working on {topic} and feeling stuck I see you.', 'The community working on {topic} is full of amazing people.', 'Remember why you started exploring {topic}. That fire is still there.', 'Your journey with {topic} is unique and that is your superpower.', 'Keep showing up for {topic}. The results will follow.'],
    Casual: ['Hey everyone just wanted to chat about {topic} today.', 'What has been your experience with {topic} so far?', 'I am curious who else here is into {topic}. Raise your hand.', 'Spent the weekend diving into {topic}. Anyone want to discuss?', 'Just a casual thought about {topic} for my timeline.'],
    Educational: ['Did you know this fascinating fact about {topic}?', 'I put together a quick guide on {topic} for anyone interested.', 'Lets learn about {topic} together. Share your tips below.', 'The more I study {topic} the more I realize how much I do not know.', 'Here is a helpful breakdown of {topic} that cleared things up.'],
    Promotional: ['I found something amazing related to {topic} and had to share.', 'If you love {topic} as much as I do you will want to see this.', 'Just launched a new project around {topic}. Would love your feedback.', 'Sharing something special for the {topic} enthusiasts out there.', 'Check out what I have been working on in the {topic} space.'],
  },
  tiktok: {
    Professional: ['Professional {topic} tips in 30 seconds.', 'The professional way to handle {topic} no one talks about.', 'Career hack: mastering {topic} changed everything for me.', 'Industry secrets about {topic} they do not teach you.', 'Professional {topic} energy: unlocked.'],
    Funny: ['POV: you finally understand {topic} and cannot stop talking about it.', 'Me trying to explain {topic} in a TikTok comment section.', 'The way {topic} has me in a chokehold right now.', 'I said I would not get into {topic} and now look at me.', 'My toxic trait is thinking I can master {topic} overnight.'],
    Inspirational: ['Your {topic} journey is valid no matter where you start.', 'This is your sign to start that {topic} project you keep putting off.', 'Confidence in {topic} comes from showing up imperfectly.', 'You belong in the {topic} space. Full stop.', 'Manifesting big {topic} energy for you today.'],
    Casual: ['Caught me in my {topic} era and I am thriving.', 'Quick little {topic} update for the algorithm.', 'Rant about {topic} coming up. Fair warning.', 'Currently hyperfixated on {topic} and it is all I think about.', 'Rate my {topic} hot take from 1 to 10 in the comments.'],
    Educational: ['Let me teach you about {topic} in under 60 seconds.', 'The truth about {topic} they do not want you to know.', 'Day 1 of explaining {topic} until everyone understands.', 'Complete guide to {topic} for absolute beginners.', 'Everything wrong with how {topic} is taught — fixed here.'],
    Promotional: ['New {topic} drop alert. You want to see this.', 'If you are into {topic} this collab is for you.', 'The {topic} upgrade nobody asked for but everyone needed.', 'Run do not walk to check out this {topic} launch.', 'This {topic} product changed my life not sponsored.'],
  },
  pinterest: {
    Professional: ['The ultimate professional guide to mastering {topic}.', 'Essential {topic} resources for the modern professional.', 'How professionals approach {topic} for maximum results.', 'Top {topic} strategies used by industry experts.', 'Professional grade {topic} tips you need to know.'],
    Funny: ['When you try to be productive with {topic} but your brain says no.', 'The {topic} struggle is aesthetic apparently.', 'Me convincing myself I need more {topic} supplies.', 'My {topic} journey documented in one chaotic mood board.', 'That feeling when {topic} is your whole personality now.'],
    Inspirational: ['Save this for when you need {topic} motivation.', 'Your dream {topic} project starts with a single pin.', 'Daily affirmation: you are capable of amazing {topic} work.', 'Vision board energy for your {topic} goals this year.', 'Let your {topic} inspiration flow freely and beautifully.'],
    Casual: ['Simple and stylish {topic} ideas for everyday life.', 'Easy {topic} inspiration for when you want something fresh.', 'Casual {topic} favorites I keep coming back to.', 'Aesthetic {topic} finds that caught my eye.', 'Low effort high reward {topic} ideas you will love.'],
    Educational: ['Learn everything about {topic} with this complete guide.', 'Step by step {topic} tutorial for beginners.', 'The best {topic} resources all in one place.', 'DIY {topic} guide that actually works.', 'Everything pinned you need to understand {topic}.'],
    Promotional: ['New {topic} collection dropping soon pin it now.', 'Curated {topic} picks you will want to save.', 'The best {topic} finds handpicked just for you.', 'Shop this {topic} idea before it sells out.', 'Exclusive {topic} roundup you need in your board.'],
  },
};

const CAT_HT: Record<string, string[]> = {
  business: ['business','entrepreneur','startup','growth','success','marketing','branding','strategy','leadership','innovation','productivity','management','finance','investment','career','networking','sales','ecommerce','startuplife','businesstips','smallbusiness','b2b','entrepreneurship','goals','vision','scale','revenue','funding','pitch'],
  technology: ['tech','technology','digital','innovation','coding','programming','AI','software','app','web','data','cybersecurity','cloud','IoT','blockchain','dev','engineering','saas','futuretech','code','developer','product','design','ux','ui','automation','robotics','technews','gadgets'],
  lifestyle: ['lifestyle','life','daily','routine','habits','mindset','wellness','selfcare','health','fitness','mentalhealth','travel','food','home','family','friends','community','balance','minimalism','organization','goals','inspiration','motivation','happiness','gratitude','peace','simpleliving','mindfulness'],
  health: ['health','wellness','fitness','nutrition','mentalhealth','selfcare','exercise','yoga','meditation','healthyliving','healthcare','wellbeing','diet','workout','strength','cardio','immunity','sleep','hydration','organic','natural','holistic','therapy','mindfulness','healing','recovery','healthtips','bodypositivity'],
  food: ['food','foodie','cooking','recipe','delicious','yummy','tasty','healthyfood','comfortfood','homemade','baking','grill','vegan','vegetarian','organic','fresh','instafood','foodblogger','chef','kitchen','dinner','lunch','breakfast','dessert','snack','mealprep','nutrition','eatclean'],
  travel: ['travel','wanderlust','adventure','explore','vacation','trip','journey','destination','nature','culture','backpacking','roadtrip','solotravel','travelgram','travelphotography','world','discover','explorer','passport','holiday','getaway','bucketlist','travelblog','nomad','flight','hotel','local'],
  fashion: ['fashion','style','outfit','trend','ootd','wardrobe','vintage','streetwear','luxury','accessories','jewelry','shoes','bag','dress','casual','formal','chic','elegant','modern','classic','minimal','bold','fashionblogger','styleinspo','whatiwore','fashionweek','thrift','sustainablefashion'],
  education: ['education','learning','study','knowledge','skills','training','course','school','university','onlinelearning','elearning','student','teacher','tutor','lesson','class','workshop','certification','degree','research','science','history','math','reading','writing','language','growthmindset','lifelonglearning'],
  marketing: ['marketing','socialmedia','content','seo','branding','digitalmarketing','ads','copywriting','emailmarketing','influencer','strategy','analytics','growth','conversion','leadgeneration','funnel','campaign','engagement','reach','impressions','cta','landingpage','webinar','newsletter','viral','trending','contentmarketing','smm'],
  fitness: ['fitness','workout','gym','exercise','training','strength','cardio','yoga','pilates','crossfit','running','cycling','weights','muscle','endurance','flexibility','mobility','bodybuilding','calisthenics','hiit','stretching','recovery','fitnessmotivation','fitnessgoals','personaltrainer','fitfam','gymlife'],
};

const EMOJI: Record<string, string[]> = {
  business: ['💼','📊','🚀','📈','💡','🏆','🎯','⚡','📋','🔍'], technology: ['💻','📱','🤖','⚙️','💾','🔧','🖥️','🔬','📡','🧠'],
  lifestyle: ['🌿','☀️','📖','🎧','✨','🌸','🏡','🌅','🧘','🎨'], health: ['💪','🧠','🥗','🏃','🧘','❤️','💊','🌱','💧','🫀'],
  food: ['🍕','🥗','🍝','🍰','☕','🍔','🌮','🍣','🥑','🍪'], travel: ['✈️','🌍','🗺️','🏔️','🏖️','🌴','🧳','📍','🌅','🌊'],
  fashion: ['👗','👠','👜','💅','👑','✨','🧥','👟','💎','🎀'], education: ['📚','✏️','🎓','📝','💡','🔬','📖','🧪','📐','🏫'],
  marketing: ['📢','📊','🎯','📈','💡','🔍','📱','💬','🤝','📣'], fitness: ['💪','🏋️','🏃','🔥','💯','⚡','🎯','💦','🏆','🧘'],
};

const CTA: Record<string, string[]> = {
  instagram: ['Double tap if you agree','Save this for later','Share with someone who needs this','Tag a friend','Drop your thoughts in the comments','Follow for more {topic} content'],
  twitter: ['RT if you agree','Quote tweet with your take','Reply with your thoughts','Follow for more insights','Like and share','Retweet to spread the word'],
  linkedin: ['Share your experience in the comments','Repost if you found this valuable','Tag a colleague who needs to see this','Comment your thoughts below','Follow for more industry insights'],
  facebook: ['Like and share if you agree','Comment your experience below','Tag someone who needs to see this','Share your thoughts in the comments','What do you think? Comment below'],
  tiktok: ['Follow for part 2','Comment your take','Share this with a friend','Like if you agree','Save this for later','Duet this and share your version'],
  pinterest: ['Save this pin for later','Share on your board','Like if you love this','Comment your favorite','Follow for more ideas','Pin this to your collection'],
};

function pick<T>(a: T[]): T { return a[Math.floor(Math.random() * a.length)]; }
function pickN<T>(a: T[], n: number): T[] { return [...a].sort(() => Math.random() - 0.5).slice(0, Math.min(n, a.length)); }

function cats(topic: string): string[] {
  const l = topic.toLowerCase(); const r: string[] = [];
  if (/business|entrepreneur|startup|market|finance|invest|revenue|sale|brand/.test(l)) r.push('business');
  if (/tech|software|app|code|program|digital|ai|data|web|compute/.test(l)) r.push('technology');
  if (/life|lifestyle|daily|routine|habit|mindset|home|family/.test(l)) r.push('lifestyle');
  if (/health|wellness|fitness|workout|exercise|diet|yoga|meditat/.test(l)) { r.push('health'); r.push('fitness'); }
  if (/food|recipe|cook|eat|dinner|meal|bake|kitchen/.test(l)) r.push('food');
  if (/travel|trip|vacation|journey|adventure|destination|explore/.test(l)) r.push('travel');
  if (/fashion|style|outfit|wear|cloth|trend|ootd/.test(l)) r.push('fashion');
  if (/learn|study|educat|course|train|lesson|school|university|teach/.test(l)) r.push('education');
  if (/market|brand|seo|content|social.?media|advert|promot|campaign/.test(l)) r.push('marketing');
  if (/fitness|gym|workout|exercise|train|muscle|strength|cardio/.test(l)) { r.push('fitness'); r.push('health'); }
  return r.length > 0 ? r : ['lifestyle'];
}

function hashtags(topic: string, count: number): string[] {
  const c = cats(topic);
  const w = topic.toLowerCase().split(/\s+/).filter(w => w.length > 2).map(w => w.replace(/[^a-z0-9]/g,'')).filter((w,i,a) => w.length > 2 && a.indexOf(w) === i);
  const p: string[] = [...w];
  for (const cat of c) if (CAT_HT[cat]) p.push(...CAT_HT[cat]);
  return pickN([...new Set(p)], Math.min(count, p.length));
}

function emojis(topic: string, count: number): string[] {
  const c = cats(topic); const e: string[] = [];
  for (const cat of c) if (EMOJI[cat]) e.push(...EMOJI[cat]);
  return pickN([...new Set([...e, '✨','🔥','💯','⭐','🎉','👏','💫','🌟','⚡','💥'])], Math.min(count, e.length + 10));
}

function build(topic: string, platform: string, mood: string, tone: string, h: boolean, e: boolean, cta: boolean): string {
  const t = (T as any)[platform]?.[mood] || (T as any)[platform]?.Casual || ['Check out this {topic} content.'];
  let cap = pickN<string>(t, Math.max(2, Math.floor(Math.random() * 3) + 2)).map(s => {
    let line = (s as string).replace(/\{topic\}/g, topic);
    if (tone === 'Formal') line = line.replace(/\bdont\b/g,"do not").replace(/\bcouldnt\b/g,"could not").replace(/\bwont\b/g,"will not").replace(/\bcant\b/g,"cannot").replace(/\bim\b/g,"I am").replace(/\byoure\b/g,"you are").replace(/\bthats\b/g,"that is").replace(/\bits\b/g,"it is").replace(/\bLets\b/g,"Let us").replace(/\bheres\b/g,"here is");
    return line;
  }).join('\n\n');

  if (e) { const em = emojis(topic, 4); const l = cap.split('\n'); l[0] = `${pick(em)} ${l[0]}`; cap = l.join('\n'); if (Math.random() > 0.5) cap = `${cap}\n\n${em.slice(1,3).join(' ')}`; }
  if (h) {
    const tags = hashtags(topic, platform === 'twitter' ? 3 : platform === 'instagram' ? 15 : 8).map(t => `#${t.replace(/\s+/g,'')}`).join(' ');
    if (platform === 'twitter') { if (tags.length <= 280 - cap.length - 2) cap = `${cap}\n${tags}`; }
    else cap = `${cap}\n\n${tags}`;
  }
  if (cta) cap = `${cap}\n\n${(pick(CTA[platform] || CTA.instagram)).replace(/\{topic\}/g, topic)}`;
  return cap;
}

function generate(topic: string, platform: string, mood: string, tone: string, h: boolean, e: boolean, cta: boolean, count: number = 5): string[] {
  const r: string[] = []; const s = new Set<string>(); let a = 0;
  while (r.length < count && a < count * 10) { a++; const c = build(topic, platform, mood, tone, h, e, cta); if (!s.has(c)) { s.add(c); r.push(c); } }
  return r;
}

export default function AiSocialCaption() {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [mood, setMood] = useState<string>('Casual');
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeEmojis, setIncludeEmojis] = useState(true);
  const [includeCTA, setIncludeCTA] = useState(false);
  const [tone, setTone] = useState<string>('Conversational');
  const [captions, setCaptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try { const s = localStorage.getItem(FAV_KEY); // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate favorites from localStorage on mount
    if (s) setFavorites(JSON.parse(s)); } catch {}
    return () => { setCaptions([]); setIsLoading(false); };
  }, []);

  useEffect(() => { try { localStorage.setItem(FAV_KEY, JSON.stringify(favorites)); } catch {} }, [favorites]);

  const handleGenerate = () => {
    if (!topic.trim()) { toast.error('Enter a topic or description first'); return; }
    setIsLoading(true);
    try {
      const result = generate(topic.trim(), platform, mood, tone, includeHashtags, includeEmojis, includeCTA);
      setCaptions(result);
      toast.success(`Generated ${result.length} caption${result.length > 1 ? 's' : ''}`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to generate captions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); toast.success('Caption copied to clipboard'); }
    catch { toast.error('Failed to copy'); }
  };

  const handleExportAll = () => {
    try {
      const blob = new Blob([captions.join('\n\n---\n\n')], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      downloadOrShare(url, `captions-${platform}-${Date.now()}.txt`);
      URL.revokeObjectURL(url);
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : 'Failed to export'); }
  };

  const toggleFavorite = (caption: string) => setFavorites(prev => prev.includes(caption) ? prev.filter(c => c !== caption) : [...prev, caption]);
  const clearFavorites = () => setFavorites([]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-overlay)] p-5 border border-zinc-200 dark:border-[var(--border-subtle)] rounded-2xl">
        <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          AI Social Media Caption Generator
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1">Generate engaging captions for any social media platform.</p>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">What is your post about?</label>
          <textarea
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="Describe your post topic, product, or idea..."
            rows={3}
            className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4 text-sm text-[var(--text-primary)] outline-none resize-none focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Platform</label>
            <div className="flex flex-wrap gap-1.5">
              {PLATFORMS.map(p => (
                <button key={p.id} onClick={() => setPlatform(p.id)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${platform === p.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'}`}>
                  {p.icon} {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Mood</label>
            <div className="flex flex-wrap gap-1.5">
              {MOODS.map(m => (
                <button key={m} onClick={() => setMood(m)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${mood === m ? 'bg-indigo-600 text-white shadow-md' : 'bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Tone</label>
            <div className="flex flex-wrap gap-1.5">
              {TONES.map(t => (
                <button key={t} onClick={() => setTone(t)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${tone === t ? 'bg-indigo-600 text-white shadow-md' : 'bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-[var(--text-primary)] cursor-pointer select-none">
            <input type="checkbox" checked={includeHashtags} onChange={e => setIncludeHashtags(e.target.checked)} className="accent-indigo-600 w-3.5 h-3.5" /> Hashtags
          </label>
          <label className="flex items-center gap-2 text-xs text-[var(--text-primary)] cursor-pointer select-none">
            <input type="checkbox" checked={includeEmojis} onChange={e => setIncludeEmojis(e.target.checked)} className="accent-indigo-600 w-3.5 h-3.5" /> Emojis
          </label>
          <label className="flex items-center gap-2 text-xs text-[var(--text-primary)] cursor-pointer select-none">
            <input type="checkbox" checked={includeCTA} onChange={e => setIncludeCTA(e.target.checked)} className="accent-indigo-600 w-3.5 h-3.5" /> Call-to-Action
          </label>
          <div className="ml-auto flex gap-2">
            <button onClick={handleGenerate} disabled={isLoading || !topic.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-400 dark:disabled:bg-zinc-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-xs cursor-pointer disabled:cursor-not-allowed">
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
              {isLoading ? 'Generating...' : 'Generate Captions'}
            </button>
          </div>
        </div>
      </div>

      {captions.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Generated Captions ({captions.length})</h3>
            <div className="flex gap-2">
              {captions.length > 0 && (
                <button onClick={handleExportAll}
                  className="text-xs bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export All
                </button>
              )}
              <button onClick={() => setCaptions([])}
                className="text-xs bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer">Clear</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {captions.map((caption, i) => {
              const limit = PLATFORMS.find(p => p.id === platform)?.limit || 280;
              const isOverLimit = caption.length > limit;
              const ratio = Math.min(caption.length / limit, 1);
              const isFav = favorites.includes(caption);
              return (
                <div key={i} className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-3 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)]">
                      <span className="font-mono font-bold">{caption.length}</span>
                      <span>/</span>
                      <span className={isOverLimit ? 'text-red-500 font-bold' : ''}>{limit}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${isOverLimit ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : ratio > 0.8 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'}`}>
                        {isOverLimit ? 'Over limit' : ratio > 0.8 ? 'Near limit' : 'Good fit'}
                      </span>
                    </div>
                    <button onClick={() => toggleFavorite(caption)}
                      className="cursor-pointer text-[var(--text-muted)] hover:text-amber-500 transition-colors shrink-0" title={isFav ? 'Remove from favorites' : 'Save as favorite'}>
                      <svg className="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                  </div>
                  <div className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed break-words max-h-60 overflow-y-auto">{caption}</div>
                  <button onClick={() => handleCopy(caption)}
                    className="w-full bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold py-2 rounded-xl transition-all text-xs cursor-pointer flex items-center justify-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {captions.length > 0 && (
        <button onClick={handleGenerate} disabled={isLoading}
          className="w-full bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] font-bold py-3 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-xs cursor-pointer disabled:cursor-not-allowed">
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          Regenerate
        </button>
      )}

      {favorites.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Saved Favorites ({favorites.length})
            </h3>
            <button onClick={clearFavorites} className="text-[10px] text-amber-600 dark:text-amber-400 hover:text-amber-700 font-bold cursor-pointer">Clear All</button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {favorites.map((fav, i) => (
              <div key={i} className="flex items-start gap-2 bg-white dark:bg-black/20 border border-amber-200 dark:border-amber-800/20 rounded-lg p-3">
                <p className="flex-1 text-xs text-[var(--text-primary)] line-clamp-2 whitespace-pre-wrap">{fav}</p>
                <button onClick={() => handleCopy(fav)} className="text-amber-600 dark:text-amber-400 hover:text-amber-700 font-bold text-[10px] cursor-pointer shrink-0">Copy</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

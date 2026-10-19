/**
 * MYBF Official Vision, Mission & Six Strategic Pillars
 * Single source of truth for organizational strategic positioning.
 */

export interface StrategicPillar {
  number: number;
  id: string;
  title: string;
  strategicIntent: string;
  iconName: 'TrendingUp' | 'Sparkles' | 'Rocket' | 'Cpu' | 'Network' | 'Globe';
  highlightBadge?: string;
  disclaimer?: string;
}

export const MYBF_OFFICIAL_VISION = {
  heading: 'Our Vision',
  statement:
    'To transform Malappuram into a globally competitive, entrepreneurship-driven district inspired by the ambition, infrastructure mindset and economic dynamism associated with hubs such as Singapore and Dubai, while building a generation of AI-ready youth and women entrepreneurs capable of creating scalable enterprises, employment and prosperity.',
  benchmarks: ['Singapore & Dubai Economic Dynamism', 'AI-Ready Youth & Women Founders', 'Scalable District Prosperity'],
} as const;

export const MYBF_MISSION_FRAMEWORK = {
  sectionTitle: 'Our Mission',
  sectionSubtitle: "Six Strategic Pillars Driving Malappuram's Entrepreneurial Future",
  description:
    'The six strategic pillars together represent the organization’s mission framework, operationalising decentralized economic growth across every constituency and community in Malappuram.',
  pillars: [
    {
      number: 1,
      id: 'youth-economic-empowerment',
      title: 'Youth Economic Empowerment',
      strategicIntent:
        'Build an ecosystem where young people can aspire to earn ₹50,000 to ₹1 lakh per month through high-value employment, freelancing, entrepreneurship and enterprise ownership. This is an aspiration, not an income guarantee.',
      disclaimer: 'This is an aspiration, not an income guarantee.',
      iconName: 'TrendingUp',
    },
    {
      number: 2,
      id: 'women-entrepreneurship',
      title: 'Women Entrepreneurship',
      strategicIntent:
        'Create Women Entrepreneurs in Malappuram, She’s Ready.\n\nIdentify, train, connect and promote women founders, professionals, creators, home-based entrepreneurs and family-business successors.',
      highlightBadge: "She’s Ready",
      iconName: 'Sparkles',
    },
    {
      number: 3,
      id: '100-crore-mindset',
      title: '₹100 Crore Mindset',
      strategicIntent:
        'Think ₹100 crore. Build ₹100 crore. Become ₹100 crore. Create the mindset. The purpose is to normalise scale, systems, market expansion, recurring revenue and global ambition.',
      highlightBadge: '₹100 Crore',
      iconName: 'Rocket',
    },
    {
      number: 4,
      id: 'ai-driven-business-leaders',
      title: 'AI-Driven Business Leaders',
      strategicIntent:
        'Create AI-driven business leaders, the architects of tomorrow’s economy. Build practical awareness of generative AI, agents, automation, digital distribution and responsible AI.',
      highlightBadge: 'AI & Automation',
      iconName: 'Cpu',
    },
    {
      number: 5,
      id: 'grassroots-chapter-network',
      title: 'Grassroots Chapter Network',
      strategicIntent:
        'Build permanent constituency-level infrastructure so entrepreneurship activity is decentralised across Malappuram.',
      highlightBadge: '16 Chapters',
      iconName: 'Network',
    },
    {
      number: 6,
      id: 'national-and-global-thinking',
      title: 'National and Global Thinking',
      strategicIntent:
        'Encourage founders to think beyond local markets and build brands, services and technology for Kerala, India and global customers.',
      highlightBadge: 'Global Scope',
      iconName: 'Globe',
    },
  ] as StrategicPillar[],
} as const;

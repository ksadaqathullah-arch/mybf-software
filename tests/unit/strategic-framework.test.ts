import { describe, it, expect } from 'vitest';
import {
  MYBF_OFFICIAL_VISION,
  MYBF_MISSION_FRAMEWORK,
} from '@/features/organization/constants/strategic-framework';

describe('MYBF Official Vision & Six Strategic Mission Pillars Specification', () => {
  it('preserves the exact approved official Vision statement without alteration', () => {
    const expectedVision =
      'To transform Malappuram into a globally competitive, entrepreneurship-driven district inspired by the ambition, infrastructure mindset and economic dynamism associated with hubs such as Singapore and Dubai, while building a generation of AI-ready youth and women entrepreneurs capable of creating scalable enterprises, employment and prosperity.';

    expect(MYBF_OFFICIAL_VISION.statement).toBe(expectedVision);
    expect(MYBF_OFFICIAL_VISION.heading).toBe('Our Vision');
  });

  it('defines the Mission framework with approved Section Title and Subtitle', () => {
    expect(MYBF_MISSION_FRAMEWORK.sectionTitle).toBe('Our Mission');
    expect(MYBF_MISSION_FRAMEWORK.sectionSubtitle).toBe(
      "Six Strategic Pillars Driving Malappuram's Entrepreneurial Future"
    );
  });

  it('contains exactly six mission pillars representing the strategic mission framework', () => {
    expect(MYBF_MISSION_FRAMEWORK.pillars).toHaveLength(6);
    const pillarNumbers = MYBF_MISSION_FRAMEWORK.pillars.map((p) => p.number);
    expect(pillarNumbers).toEqual([1, 2, 3, 4, 5, 6]);
  });

  describe('Pillar 1: Youth Economic Empowerment', () => {
    const pillar1 = MYBF_MISSION_FRAMEWORK.pillars[0];

    it('has correct title and icon', () => {
      expect(pillar1.title).toBe('Youth Economic Empowerment');
      expect(pillar1.iconName).toBe('TrendingUp');
    });

    it('contains exact approved strategic intent and numerical targets', () => {
      const expectedIntent =
        'Build an ecosystem where young people can aspire to earn ₹50,000 to ₹1 lakh per month through high-value employment, freelancing, entrepreneurship and enterprise ownership. This is an aspiration, not an income guarantee.';
      expect(pillar1.strategicIntent).toBe(expectedIntent);
      expect(pillar1.strategicIntent).toContain('₹50,000 to ₹1 lakh');
    });

    it('preserves visible income aspiration disclaimer', () => {
      expect(pillar1.disclaimer).toBe('This is an aspiration, not an income guarantee.');
      expect(pillar1.strategicIntent).toContain(pillar1.disclaimer);
    });
  });

  describe('Pillar 2: Women Entrepreneurship', () => {
    const pillar2 = MYBF_MISSION_FRAMEWORK.pillars[1];

    it('has correct title and icon', () => {
      expect(pillar2.title).toBe('Women Entrepreneurship');
      expect(pillar2.iconName).toBe('Sparkles');
    });

    it('preserves She’s Ready positioning and strategic intent', () => {
      const expectedIntent =
        "Create Women Entrepreneurs in Malappuram, She’s Ready.\n\nIdentify, train, connect and promote women founders, professionals, creators, home-based entrepreneurs and family-business successors.";
      expect(pillar2.strategicIntent).toBe(expectedIntent);
      expect(pillar2.strategicIntent).toContain('She’s Ready');
      expect(pillar2.highlightBadge).toBe("She’s Ready");
    });
  });

  describe('Pillar 3: ₹100 Crore Mindset', () => {
    const pillar3 = MYBF_MISSION_FRAMEWORK.pillars[2];

    it('has correct title and icon', () => {
      expect(pillar3.title).toBe('₹100 Crore Mindset');
      expect(pillar3.iconName).toBe('Rocket');
    });

    it('preserves ₹100 crore wording and strategic intent', () => {
      const expectedIntent =
        'Think ₹100 crore. Build ₹100 crore. Become ₹100 crore. Create the mindset. The purpose is to normalise scale, systems, market expansion, recurring revenue and global ambition.';
      expect(pillar3.strategicIntent).toBe(expectedIntent);
      expect(pillar3.strategicIntent).toContain('₹100 crore');
    });
  });

  describe('Pillar 4: AI-Driven Business Leaders', () => {
    const pillar4 = MYBF_MISSION_FRAMEWORK.pillars[3];

    it('has correct title and icon', () => {
      expect(pillar4.title).toBe('AI-Driven Business Leaders');
      expect(pillar4.iconName).toBe('Cpu');
    });

    it('contains exact approved strategic intent', () => {
      const expectedIntent =
        'Create AI-driven business leaders, the architects of tomorrow’s economy. Build practical awareness of generative AI, agents, automation, digital distribution and responsible AI.';
      expect(pillar4.strategicIntent).toBe(expectedIntent);
      expect(pillar4.strategicIntent).toContain('generative AI, agents, automation');
    });
  });

  describe('Pillar 5: Grassroots Chapter Network', () => {
    const pillar5 = MYBF_MISSION_FRAMEWORK.pillars[4];

    it('has correct title and icon', () => {
      expect(pillar5.title).toBe('Grassroots Chapter Network');
      expect(pillar5.iconName).toBe('Network');
    });

    it('contains exact approved strategic intent', () => {
      const expectedIntent =
        'Build permanent constituency-level infrastructure so entrepreneurship activity is decentralised across Malappuram.';
      expect(pillar5.strategicIntent).toBe(expectedIntent);
    });
  });

  describe('Pillar 6: National and Global Thinking', () => {
    const pillar6 = MYBF_MISSION_FRAMEWORK.pillars[5];

    it('has correct title and icon', () => {
      expect(pillar6.title).toBe('National and Global Thinking');
      expect(pillar6.iconName).toBe('Globe');
    });

    it('contains exact approved strategic intent', () => {
      const expectedIntent =
        'Encourage founders to think beyond local markets and build brands, services and technology for Kerala, India and global customers.';
      expect(pillar6.strategicIntent).toBe(expectedIntent);
      expect(pillar6.strategicIntent).toContain('Kerala, India and global customers');
    });
  });

  it('ensures no old contradictory placeholder text remains in the framework', () => {
    const serialized = JSON.stringify(MYBF_MISSION_FRAMEWORK) + JSON.stringify(MYBF_OFFICIAL_VISION);
    expect(serialized).not.toContain('Build an inclusive, measurable, and digitally connected ecosystem');
    expect(serialized).not.toContain('Equip MYBF chapters and members with trusted identities');
  });
});

export const site = {
  name: "MYBF",
  fullName: "Malappuram Youth Business Forum",
  url: "https://www.mybf.in",
  tagline: "Why not Malappuram.",
  description:
    "Malappuram Youth Business Forum is the room where founders, owners, students and mentors in the district actually meet — for mentorship, referrals, conclaves and the work in between.",
  email: "mybfcommunity@gmail.com",
  phoneDisplay: "+91 85929 56370",
  phoneHref: "+918592956370",
  instagram: "https://www.instagram.com/mybf.community",
  facebook: "https://www.facebook.com/mybf.community",
  instagramHandle: "@mybf.community",
  facebookHandle: "@mybf.community",
  linkedin: "https://www.linkedin.com/company/malappuram-youth-business-forum/",
  location: "Malappuram, Kerala",
  credit: "https://akhilmansoor.com",
  creditLabel: "akhilmansoor.com",
} as const;

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const navLinks = [
  { href: "/about", label: "About" },
  { href: "/what-we-offer", label: "What we offer" },
  { href: "/initiatives", label: "Initiatives" },
  { href: "/founders", label: "Founders" },
  { href: "/membership", label: "Membership" },
  { href: "/members", label: "Members" },
  { href: "/contact", label: "Contact" },
] as const;

export const offerings = [
  {
    title: "Mentorship",
    description:
      "Sit with someone who has already made the mistake. Guidance from entrepreneurs, mentors and business leaders — specific, not motivational.",
  },
  {
    title: "Learning",
    description:
      "Workshops and masterclasses aimed at the business in front of you: pricing, hiring, sales, the unglamorous middle.",
  },
  {
    title: "Networking",
    description:
      "Meetups and industry rooms. You should leave with a name you will actually call, not a photograph of a lanyard.",
  },
  {
    title: "Consultation",
    description:
      "A proper look at branding, marketing, finance, strategy and growth, from people who do that work for a living.",
  },
  {
    title: "Partnerships",
    description:
      "Referrals, joint ventures and collaborations — with members, and with organisations outside the forum.",
  },
  {
    title: "Growth",
    description:
      "Funding conversations, a wider market, investor introductions, and the next practical step for the business.",
  },
] as const;

export const initiatives = [
  {
    title: "Conclaves",
    description:
      "The large rooms. Business leaders, operators and people with a point of view, in one sitting.",
  },
  {
    title: "The Club",
    description:
      "A smaller circle that keeps meeting. Networking that does not reset every time the chairs are stacked.",
  },
  {
    title: "Business tours",
    description:
      "A day inside a company that is already running. Floors, not slides.",
  },
  {
    title: "Social commitment",
    description:
      "Work aimed outward: youth, entrepreneurship, and the parts of the district the forum can actually reach.",
  },
  {
    title: "Gatherings",
    description:
      "Regular meetups. Smaller than a conclave, frequent enough to matter.",
  },
  {
    title: "Panel discussions",
    description:
      "A table of people who disagree usefully, on a subject members are dealing with now.",
  },
  {
    title: "Webinars",
    description:
      "When the room cannot be physical: strategy, leadership, tools, a single topic done properly.",
  },
  {
    title: "Investor meetups",
    description:
      "Founders and people with capital in the same evening, with an introduction instead of a cold email.",
  },
  {
    title: "Awards",
    description:
      "A public note of businesses and people in Malappuram who have done something worth naming.",
  },
  {
    title: "Writing",
    description:
      "Notes from the forum: how a member built something, what a session actually covered, what the district is doing.",
  },
] as const;

export const audience = [
  {
    title: "Startup founders",
    description: "Early. The company is still mostly a bet, and you want people who have placed one.",
  },
  {
    title: "Business owners",
    description: "The shop, the firm, the unit is running. You want it to run better, or somewhere new.",
  },
  {
    title: "Students with an idea",
    description: "Not a pitch deck yet. A real itch to build, and a need for someone to tell you the truth.",
  },
  {
    title: "Professionals and mentors",
    description: "You have a craft — finance, design, law, operations — and you will spend it on members.",
  },
] as const;

export const benefits = [
  "Referrals that come from inside the room, with a name attached.",
  "Mentorship, one to one and in small groups.",
  "A standing circle of founders and owners across the district.",
  "Partnerships, suppliers and joint work you would not have found alone.",
  "Awards, a microphone, and the occasional public credit.",
  "First word on conclaves, tours, webinars and investor evenings.",
] as const;

export const values = [
  {
    title: "Collaboration",
    description: "Work moves across the table. Hoarding a contact is not how this forum behaves.",
  },
  {
    title: "Integrity",
    description: "Ethical business is the condition of entry. Charm does not cover for a bad dealing.",
  },
  {
    title: "Innovation",
    description: "A new idea gets a hearing before it gets a logo, a valuation, or a no.",
  },
  {
    title: "Leadership",
    description: "Members are asked to run something — a session, an introduction, a standard — not only to attend.",
  },
  {
    title: "Community impact",
    description: "A business that does nothing for Malappuram is unfinished, however well it pays.",
  },
] as const;

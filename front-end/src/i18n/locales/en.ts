const en = {
  nav: {
    home: "Home",
    services: "Services",
    rental: "Rental",
    blog: "Blog",
    team: "Team",
    portfolio: "Portfolio",
    contact: "Contact",
    letsTalk: "Let's Talk",
  },
  portfolio: {
    subtitle: "A selection of our standout projects and visuals.",
    empty: "No images yet — check back soon.",
  },
  cta: {
    contactBeez: "Contact BeeZ",
    viewMyWorkss: "View My Works",
  },
  services: {
    sectionTitle: "What We Do",
    sectionSubtitle: "From broadcast to short-form content, we master every format",
  },
  featured: {
    sectionTitle: "Featured",
  },
  gallery: {
    sectionTitle: "Product Images",
    sectionSubtitle: "A collection of behind-the-scenes and product shots from our projects",
  },
  project: {
    about: "About",
    members: "Team",
    productImages: "Product Images / Behind the Scenes",
    watchMore: "Watch More",
    clickArrows: "Click arrows",
  },
  stats: {
    items: [
      { value: "1000+", label: "Projects",  icon: "UserIcon",       details: ["TVC & Commercials", "Short-form", "Interviews – Brand films", "Social Media Content"] },
      { value: "100+",  label: "Clients",   icon: "UsersThreeIcon", details: ["F&B Brands", "Banking", "Health-care", "Entertainment"] },
      { value: "1 Billion", label: "Views", icon: "VideoIcon",      details: ["YouTube", "TikTok", "Instagram Reels", "Facebook"] },
    ],
  },
  brands: {
    badge: "We’ve partnered with amazing brands",
    heading: "Trusted by Brands",
  },
  // Bản dịch của khối Quy trình — sửa vi.ts thì sửa cả ở đây.
  process: {
    sectionTitle: "From the first call to the finished film",
    sectionSubtitle: "How we work",
    stepLabel: "STEP",
    steps: [
      {
        title: "Brief",
        desc: "A 30-minute call or meeting. You share the goal, the audience and the budget; we confirm what we understood and come back to you.",
        when: "Within 24 hours",
      },
      {
        title: "Proposal & quote",
        desc: "Concept, moodboard, outline script and an itemised quote.",
        when: "2–3 working days",
      },
      {
        title: "Pre-production",
        desc: "Locking the script, casting, locations and the shoot schedule. You approve before the cameras roll.",
        when: "3–7 days",
      },
      {
        title: "Shoot",
        desc: "Bee Z crew and equipment. You are welcome on set, or you can watch the live feed remotely.",
        when: "1–3 shoot days",
      },
      {
        title: "Post & delivery",
        desc: "Edit, colour and sound. Two rounds of revisions included. Master files handed back to you.",
        when: "5–10 days",
      },
    ],
  },
  team: {
    heroLine1: "The Minds Behind",
    heroLine2: "BeeZ Production",
    heroSubtitle: "The creative, dedicated and passionate team behind every project",
    aboutBadge: "About Us",
    aboutHeading: "Who We Are",
    aboutDescription: "We are a creative team passionate about visual storytelling. From TVCs and short films to social media content — every project receives our cinematic attention to detail and commitment to excellence.",
    stats: [
      { value: "1B+", label: "Views" },
      { value: "1000+", label: "Projects" },
      { value: "100+", label: "Clients" },
    ],
    meetBadge: "The Team",
    meetHeading: "Meet Our Team",
  },
  footer: {
    tagline: "A creative production studio crafting TVCs, brand films and social content — telling brand stories through cinematic visuals.",
    quickLinks: "Quick Links",
    contact: "Contact",
    hours: "Working Hours",
    followUs: "Follow Us",
    rights: "© {year} BeeZ Production. All rights reserved.",
    visitors: "Visitors",
  },
  contact: {
    title: "Contact",
    intro:
      "Whether you have questions about services, pricing, or anything else, our team is ready to answer.",
    emailLabel: "Email",
    phoneLabel: "Phone",
    locationLabel: "Location",
    workingHours: "Working Hours",
    connectWithUs: "Connect With Us",
    formTitle: "Send a Message",
    sentTitle: "Message sent!",
    sentDesc: "We'll get back to you as soon as possible.",
    sendAnother: "Send another message",
    nameLabel: "Full Name",
    namePlaceholder: "Your name",
    phoneFieldLabel: "Phone",
    serviceLabel: "Service of Interest",
    servicePlaceholder: "Select a service",
    messageLabel: "Message",
    messagePlaceholder: "Tell us about your project...",
    submit: "Send Message",
  },
  service: {
    experienceBadge: "5+ Years Multi-Platform Experience",
    heroAccent: "Video Production",
    heroTagline:
      "Professional talking head content, complex motion graphics, entertainment memes, and trend-based videos for every industry and style!",
    startProject: "Let's Talk",
    viewWork: "View Work",
    faqTitle: "Frequently Asked Questions",
    showcaseTitle: "Video Showcase",
    showcaseSubtitle: "Sample work from our shortform content production",
    featuredBadge: "Featured",
    ctaTitle: "Ready to Go Viral?",
    ctaSubtitle: "Let's build your short-form content empire together",
    ctaButton: "Start Creating",
    highlights: [
      {
        title: "Talking Head Videos",
        desc: "Expert-led content with complex motion graphics.",
      },
      {
        title: "Trend-Based Content",
        desc: "Memes, trending audio, viral formats across industries.",
      },
      {
        title: "Multi-Platform",
        desc: "TikTok, YouTube Shorts, Facebook & Instagram Reels.",
      },
    ],
    stats: [
      { value: "1000+", label: "Videos Produced" },
      { value: "5+", label: "Years Experience" },
      { value: "1B+", label: "Combined Views" },
      { value: "4", label: "Platforms" },
    ],
  },
} as const;

export default en;

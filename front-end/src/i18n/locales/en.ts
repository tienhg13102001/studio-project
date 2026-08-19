const en = {
  nav: {
    home: "Home",
    services: "Services",
    rental: "Rental",
    blog: "Blog",
    team: "Team",
    portfolio: "Portfolio",
    pricing: "Pricing",
    contact: "Contact",
    letsTalk: "Let's Talk",
  },
  portfolio: {
    subtitle: "A few projects and images worth showing.",
    empty: "No images yet — check back soon.",
    profileHeading: "Company profile",
    profileHint: "Drag sideways to browse · tap a page to read it",
    downloadProfile: "Download profile",
    profilePage: "Page",
    worksHeading: "Selected work",
    worksHint: "Pick a category to filter",
    all: "All",
    projectCount: "projects",
    emptyFilter: "No projects in this category yet.",
    closeReader: "Close page",
    prevPage: "Previous page",
    nextPage: "Next page",
  },
  cta: {
    contactBeez: "Contact Bee Z",
    viewMyWorkss: "View My Works",
  },
  services: {
    sectionTitle: "What We Do",
    sectionSubtitle: "From broadcast TVCs to short-form for social",
  },
  featured: {
    sectionTitle: "Featured",
  },
  gallery: {
    sectionTitle: "Product Images",
    sectionSubtitle: "Behind the scenes and finished work from our shoots",
  },
  project: {
    about: "About",
    members: "Team",
    productImages: "Product Images / Behind the Scenes",
    watchMore: "Watch More",
    clickArrows: "Click arrows",
    caseStudy: {
      heading: "Case study",
      challenge: "The challenge",
      approach: "What we did",
      result: "Results",
    },
  },
  stats: {
    items: [
      { value: "800+",  label: "Projects",  icon: "UserIcon",       details: ["TVC & commercials", "Short-form", "Interviews – Brand films", "Social Media Content"] },
      { value: "400+",  label: "Clients",   icon: "UsersThreeIcon", details: ["F&B Brands", "Banking", "Health-care", "Entertainment"] },
      { value: "1B+", label: "Views", icon: "VideoIcon",      details: ["YouTube", "TikTok", "Instagram Reels", "Facebook"] },
    ],
  },
  brands: {
    badge: "Some of the brands Bee Z has worked with",
    heading: "Bee Z clients",
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
  // Section heading only — the quotes themselves live in the database (Portal →
  // Nhận xét), because they change over time and must be editable without a
  // rebuild.
  testimonials: {
    sectionTitle: "What our clients say",
    sectionSubtitle: "Testimonials",
  },
  team: {
    heroLine1: "The Minds Behind",
    heroLine2: "Bee Z Production",
    heroSubtitle: "The people who actually make each project",
    aboutBadge: "About Us",
    aboutHeading: "Who We Are",
    aboutDescription: "Bee Z makes TVCs, short films and social content for brands. Concept, shoot, edit, colour and sound are handled by one team, so nothing falls through the gap between the people who think it up and the people who shoot it.",
    stats: [
      { value: "1B+", label: "Views" },
      { value: "800+", label: "Projects" },
      { value: "400+", label: "Clients" },
    ],
    meetBadge: "The Team",
    meetHeading: "Meet the Bee Z team",
  },
  footer: {
    tagline: "A production studio making TVCs, commercials and content for brands.",
    quickLinks: "Quick Links",
    contact: "Contact",
    hours: "Working Hours",
    followUs: "Follow Us",
    rights: "© {year} Bee Z Production.",
    visitors: "Visitors",
  },
  contact: {
    title: "Contact",
    intro:
      "Questions about services, pricing or anything else — just write. Bee Z will answer.",
    emailLabel: "Email",
    phoneLabel: "Phone",
    locationLabel: "Location",
    workingHours: "Working Hours",
    connectWithUs: "Follow Bee Z",
    formTitle: "Send a Message",
    sentTitle: "Message sent!",
    sentDesc: "We'll get back to you as soon as possible.",
    sendAnother: "Send a new message",
    nameLabel: "Full Name",
    namePlaceholder: "Your name",
    phoneFieldLabel: "Phone",
    serviceLabel: "Service of Interest",
    servicePlaceholder: "Select a service",
    messageLabel: "Message",
    messagePlaceholder: "Tell us about the project...",
    submit: "Send Message",
  },
  service: {
    // Same shared number set — see vi.ts.
    experienceBadge: "9 Years Multi-Platform Experience",
    // Gold line under the service name in the H1. Generic fallback, used only
    // when a service tag has no entry in `heroAccentByTag`.
    heroAccent: "Video Production",
    /**
     * Per-vertical accent line, looked up by the service's `tag`.
     *
     * WHY PER-PAGE: the H1 is a page's strongest signal. All six service pages
     * used to end their H1 with the same "Video Production", so half of every
     * H1 was identical — diluting the one thing that should be sharp. The
     * wedding page was also plainly wrong: wedding photography is not video
     * production.
     *
     * A new vertical with no entry here falls back to the generic line rather
     * than breaking the page.
     */
    heroAccentByTag: {
      TVC: "Brand commercials",
      "F&B": "Food & product on camera",
      LOOKBOOK: "Fashion lookbooks & campaigns",
      SHORT: "Short-form for social",
      EVENT: "Events & concerts, multi-camera",
      WEDDING: "Wedding photos and film",
    } as Record<string, string>,
    heroTagline:
      "Talking head, motion graphics, memes and trend-based video, for any industry.",
    startProject: "Let's Talk",
    viewWork: "View Work",
    faqTitle: "Frequently Asked Questions",
    showcaseTitle: "Video Showcase",
    showcaseSubtitle: "Sample work from our shortform content production",
    featuredBadge: "Featured",
    ctaTitle: "Start making short-form?",
    ctaSubtitle: "Write to Bee Z and we will map out the approach",
    ctaButton: "Start Creating",
    highlights: [
      {
        title: "Talking Head Videos",
        desc: "An expert on camera, with motion graphics.",
      },
      {
        title: "Trend-Based Content",
        desc: "Memes, trending audio, formats that are working now.",
      },
      {
        title: "Multi-Platform",
        desc: "TikTok, YouTube Shorts, Facebook & Instagram Reels.",
      },
    ],
    stats: [
      { value: "800+", label: "Projects" },
      { value: "9", label: "Years Experience" },
      { value: "1B+", label: "Combined Views" },
      { value: "4", label: "Platforms" },
    ],
  },
} as const;

export default en;

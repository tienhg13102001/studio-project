// API response shapes — mirrors back-end types

export type LocalizedString = { en: string; vi: string };

export type ApiLanding = {
  heroLine1: LocalizedString;
  heroLine2: LocalizedString;
  subheading: LocalizedString;
  videoBackground: string;
  /** Reference to the linked Contact document (contact info is sourced from there). */
  contactId?: string;
  phone?: string;
  email?: string;
  address?: LocalizedString;
  socials?: {
    zalo?: string;
    facebook?: string;
    instagram?: string;
  };
  /** QR code PNG data-URLs generated per social URL (portal only). */
  socialQrs?: {
    zalo?: string;
    facebook?: string;
    instagram?: string;
  };
};

export type ApiFaqItem = {
  question: LocalizedString;
  answer:   LocalizedString;
};

export type ApiServiceTag = {
  id:          string;
  tag:         string;
  title:       LocalizedString;
  description: LocalizedString;
};

export type ApiProject = {
  id:             string;
  layout:         "vertical" | "horizontal";
  service:        ApiServiceTag; // populated
  thumbnailImage: string;
  title:          string;
  subtitle:       LocalizedString;
  prominent:      boolean;
  video?: string; // optional, path to video file
  photos?: string[]; // optional, list of product photo paths
  shootDate?: string; // optional, ISO date string
  shootLocation?: string; // optional, VN province/city
  members?: ApiProjectMember[]; // optional, populated team members who worked on the project
};

export type ApiProjectMember = {
  id:    string;
  name:  string;
  photo?: string;
};

export type ApiHighlight = {
  icon:  string; // phosphor icon key (see lib/serviceIcons)
  title: LocalizedString;
  desc:  LocalizedString;
};

export type ApiStat = {
  value: string; // e.g. "1000+", "1B+"
  label: LocalizedString;
};

export type ApiService = {
  id:             string;
  tag:            string;
  thumbnailImage: string;
  title:          LocalizedString;
  description:    LocalizedString;
  faqs:           ApiFaqItem[];
  highlights:     ApiHighlight[];
  stats:          ApiStat[];
  order:          number; // sort order — lower shows first (gallery tabs, lists)
  projects:       ApiProject[]; // populated from Project collection
};

/** A tag-grouped set of product photos — powers the landing-page gallery. */
export type ApiPhotoGroup = {
  tag:    string;
  title:  LocalizedString;
  photos: string[];
};

export type ApiProjectsContent = {
  verticalCards:   ApiProject[];
  horizontalCards: ApiProject[];
};

export type ApiPaginatedServices = {
  items: ApiService[];
  pagination: {
    page:       number;
    limit:      number;
    total:      number;
    totalPages: number;
  };
};

export type ApiContact = {
  heading:    LocalizedString;
  subheading: LocalizedString;
  phone:      string;
  email:      string;
  address:    LocalizedString;
  mapUrl:     string;
  workingHours: Array<{ label: LocalizedString; hours: LocalizedString }>;
  socials: {
    zalo?:      string;
    facebook?:  string;
    youtube?:   string;
    tiktok?:    string;
    instagram?: string;
  };
};

export type ApiUser = {
  id:       string;
  name:     string;
  email:    string;
  role:     LocalizedString;
  photo?:   string;
  quote?:   LocalizedString;
  bio?:     LocalizedString;
  skills:   string[];
  featured: boolean;
  accountRole: "admin" | "member" | "editor";
};

export type ApiBrand = {
  id:       string;
  name:     string;
  logo:     string;
  features: ApiProject[];
  order:    number;
};

export type ApiTeamContent = {
  aboutBadge:       LocalizedString;
  aboutHeading:     LocalizedString;
  aboutDescription: LocalizedString;
  aboutImage:       string;
};

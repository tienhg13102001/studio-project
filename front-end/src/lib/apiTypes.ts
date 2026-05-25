// API response shapes — mirrors back-end types

export type LocalizedString = { en: string; vi: string };

export type ApiLanding = {
  heroLine1: LocalizedString;
  heroLine2: LocalizedString;
  subheading: LocalizedString;
  videoBackground: string;
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
  subtitle:       string;
  prominent:      boolean;
  video?: string; // optional, path to video file
};

export type ApiService = {
  id:             string;
  tag:            string;
  thumbnailImage: string;
  title:          LocalizedString;
  description:    LocalizedString;
  faqs:           ApiFaqItem[];
  projects:       ApiProject[]; // populated from Project collection
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

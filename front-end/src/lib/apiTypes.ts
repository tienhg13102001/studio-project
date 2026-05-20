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
  iconName:    string;
  title:       LocalizedString;
  description: LocalizedString;
};

export type ApiFeature = {
  id:        string;
  layout:    "vertical" | "horizontal";
  order:     number;
  tag:       ApiServiceTag; // populated
  image:     string;
  title:     string;
  subtitle:  string;
  prominent: boolean;
};

export type ApiService = {
  id:          string;
  tag:         string;
  iconName:    string;
  image:       string;
  title:       LocalizedString;
  description: LocalizedString;
  faqs:        ApiFaqItem[];
  features:    ApiFeature[]; // populated from Feature collection
};

export type ApiFeaturedContent = {
  verticalCards:   ApiFeature[];
  horizontalCards: ApiFeature[];
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
  role:     LocalizedString;
  photo?:   string;
  quote?:   LocalizedString;
  bio?:     LocalizedString;
  skills:   string[];
  order:    number;
  featured: boolean;
  accountRole: "admin" | "member" | "editor";
};

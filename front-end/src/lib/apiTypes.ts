// API response shapes — mirrors back-end types

export type LocalizedString = { en: string; vi: string };

export type ApiLanding = {
  heroLine1: LocalizedString;
  heroLine2: LocalizedString;
  subheading: LocalizedString;
  videoBackground: string;
};

export type ApiService = {
  id: string;
  tag: string;
  iconName: string;
  image: string;
  title: LocalizedString;
  description: LocalizedString;
};

export type ApiServiceTag = {
  id: string;
  tag: string;
  iconName: string;
  title: LocalizedString;
  description: LocalizedString;
};

export type ApiFeature = {
  id: string;
  section: "top" | "bottom";
  order: number;
  tag: ApiServiceTag; // populated
  image: string;
  title: string;
  subtitle: string;
};

export type ApiFeaturedContent = {
  topCards: ApiFeature[];
  bottomCards: ApiFeature[];
};

export type ApiPaginatedServices = {
  items: ApiService[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

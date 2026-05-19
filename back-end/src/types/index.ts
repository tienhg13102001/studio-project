// Shared types — mirrors front-end shape but API-safe (no React types)

export type LocalizedString = { en: string; vi: string };

// ─── Landing ─────────────────────────────────────────────────────────────────

export type LandingContent = {
  heroLine1: LocalizedString;
  heroLine2: LocalizedString;
  subheading: LocalizedString;
  videoBackground: string;
};

// ─── Services ────────────────────────────────────────────────────────────────

export type ServiceItem = {
  id: number;
  tag: string; // short code, e.g. "TVC", "SHORT", "F&B"
  iconName: string; // Phosphor icon name, e.g. "TelevisionSimple"
  image: string;
  title: LocalizedString;
  description: LocalizedString;
};

// ─── Featured ────────────────────────────────────────────────────────────────

export type Feature = {
  id: string;
  section: "top" | "bottom";
  order: number;
  tag: ServiceItem; // populated from Service
  image: string;
  title: string;
  subtitle: string;
};

export type FeaturedContent = {
  topCards: Feature[];
  bottomCards: Feature[];
};

// ─── API response envelope ───────────────────────────────────────────────────

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  error: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Pagination ──────────────────────────────────────────────────────────────

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedData<T> = {
  items: T[];
  pagination: PaginationMeta;
};

export type ApiPaginatedSuccess<T> = {
  success: true;
  data: PaginatedData<T>;
};

export type ApiPaginatedResponse<T> = ApiPaginatedSuccess<T> | ApiError;

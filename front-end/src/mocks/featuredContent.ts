// Portfolio items — titles are project names, no i18n needed
export type FeatureCardData = {
  id: number;
  tag: string;
  image: string;
  title: string;
  subtitle: string;
};

export const topCards: FeatureCardData[] = [
  {
    id: 1,
    tag: "SHORT",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400&h=600",
    title: "Greenfield Dental - V-Line...",
    subtitle: "Greenfield",
  },
  {
    id: 2,
    tag: "SHORT",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400&h=600",
    title: "bb.q Chicken - Birthday Ce...",
    subtitle: "bb.q Chicken",
  },
  {
    id: 3,
    tag: "SHORT",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=400&h=600",
    title: "Greenfield Braces - Nerdy...",
    subtitle: "Greenfield Dental",
  },
  {
    id: 4,
    tag: "SHORT",
    image: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&q=80&w=400&h=600",
    title: "bb.q Chicken - Crispy Chic...",
    subtitle: "bb.q Chicken",
  },
  {
    id: 5,
    tag: "SHORT",
    image: "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&q=80&w=400&h=600",
    title: "Greenfield Braces - Sporty...",
    subtitle: "Greenfield Dental",
  },
  {
    id: 6,
    tag: "F&B",
    image: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&q=80&w=400&h=600",
    title: "Grouper Fish - Chef's Sign...",
    subtitle: "Chapter Fine Dining",
  },
  {
    id: 7,
    tag: "F&B",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=400&h=600",
    title: "Fresh Sashimi - Master...",
    subtitle: "Chapter Fine Dining",
  },
];

export const bottomCards: FeatureCardData[] = [
  {
    id: 1,
    tag: "INTERVIEW",
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=600&h=338",
    title: "Emotional Interview - 45 Minutes of Talking",
    subtitle: "Healthcare",
  },
  {
    id: 2,
    tag: "TVC",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=600&h=338",
    title: "Join Our Club - Wake Up The Champion",
    subtitle: "Greenfield Dental",
  },
  {
    id: 3,
    tag: "TVC",
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=600&h=338",
    title: "A Gleaming Miracle",
    subtitle: "Greenfield Dental",
  },
  {
    id: 4,
    tag: "TVC",
    image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=600&h=338",
    title: "Đóng Stress - Mở Strong",
    subtitle: "T-Matsuoka Medical Center",
  },
];

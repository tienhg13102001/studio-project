import { apiFetch, invalidateApiCache, resolveAssetUrl } from "#lib/api";
import type { ApiProject, ApiProjectsContent } from "#lib/apiTypes";
import type { Lang } from "#i18n";
import { localized, localizedOrFallback } from "#lib/localized";
import { useCallback, useEffect, useRef, useState } from "react";

/** Câu chuyện dự án đã dịch sẵn. Phần nào chưa viết thì không có mặt ở đây. */
export type CaseStudyDisplay = {
  challenge?: string;
  approach?: string;
  result?: string;
};

export type ProjectDisplay = {
  id: string;
  /** Tên đường dẫn — cần để dựng `/du-an/<tên>`. */
  slug?: string;
  tag: string;
  thumbnailImage: string;
  title: string;
  subtitle: string;
  video?: string;
  photos?: string[];
  shootDate?: string;
  shootLocation?: string;
  members?: string[];
  caseStudy?: CaseStudyDisplay;
};

/**
 * Dịch câu chuyện dự án, bỏ hẳn phần chưa viết.
 *
 * Dùng `localizedOrFallback` chứ không phải `localized`: mấy phần này do người
 * quản trị tự gõ, bản tiếng Anh gần như luôn để trống — mà để trống thì thà hiện
 * bản tiếng Việt còn hơn hiện một mảng trắng.
 *
 * Trả `undefined` khi cả ba phần đều rỗng, để bên hiển thị chỉ cần kiểm một chỗ.
 */
export function mapCaseStudy(
  cs: ApiProject["caseStudy"],
  lang: Lang,
): CaseStudyDisplay | undefined {
  if (!cs) return undefined;
  const ra: CaseStudyDisplay = {};
  const challenge = localizedOrFallback(cs.challenge, lang);
  const approach = localizedOrFallback(cs.approach, lang);
  const result = localizedOrFallback(cs.result, lang);
  if (challenge) ra.challenge = challenge;
  if (approach) ra.approach = approach;
  if (result) ra.result = result;
  return Object.keys(ra).length > 0 ? ra : undefined;
}

function mapProject(f: ApiProject, lang: Lang): ProjectDisplay {
  return {
    id: f.id,
    slug: f.slug,
    tag: f.service?.tag ?? "",
    thumbnailImage: resolveAssetUrl(f.thumbnailImage),
    title: f.title,
    subtitle: localized(f.subtitle, lang),
    video: f.video,
    photos: f.photos,
    shootDate: f.shootDate,
    shootLocation: f.shootLocation,
    members: f.members?.map((m) => m.name),
    caseStudy: mapCaseStudy(f.caseStudy, lang),
  };
}

export function useProjects(lang: Lang = "vi") {
  const [raw, setRaw] = useState<ApiProjectsContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetched = useRef(false);

  const fetch = useCallback(() => {
    setLoading(true);
    apiFetch<ApiProjectsContent>("/api/projects")
      .then(setRaw)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const refetch = useCallback(() => {
    invalidateApiCache("/api/projects");
    fetch();
  }, [fetch]);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    fetch();
  }, [fetch]);

  const verticalCards = raw?.verticalCards.map((f) => mapProject(f, lang)) ?? null;
  const horizontalCards = raw?.horizontalCards.map((f) => mapProject(f, lang)) ?? null;

  return { verticalCards, horizontalCards, raw, loading, error, refetch };
}

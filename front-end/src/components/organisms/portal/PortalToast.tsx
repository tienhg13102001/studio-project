import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CheckCircleIcon, InfoIcon, WarningCircleIcon, XIcon } from "@phosphor-icons/react";
import { Button } from "#components/ui/button";

/**
 * Toast dùng chung cho toàn portal. Trước đây mỗi tab tự hiện lỗi bằng một dòng
 * chữ đỏ ở đáy modal, còn lưu/xoá thành công thì modal đóng im lặng — người dùng
 * không chắc thao tác đã ăn chưa. Xếp chồng nhiều toast ở góc trên phải (không
 * đặt dưới đáy vì LandingTab có thanh lưu `sticky bottom-0`).
 */

export type PortalToastType = "ok" | "err" | "info";

type ToastAction = { label: string; onClick: () => void };

type ToastItem = {
  id: number;
  type: PortalToastType;
  msg: string;
  action?: ToastAction;
};

type PortalToastApi = {
  /** Hiện một toast; trả về id để chủ động tắt sớm nếu cần. */
  toast: (msg: string, type?: PortalToastType, action?: ToastAction) => number;
  dismiss: (id: number) => void;
};

// Mặc định no-op để component dùng ngoài provider không crash (giống LanguageContext).
const PortalToastContext = createContext<PortalToastApi>({
  toast: () => 0,
  dismiss: () => undefined,
});

const AUTO_HIDE_MS = 3600;
/** Toast có nút hành động cần lâu hơn để người dùng kịp bấm. */
const AUTO_HIDE_WITH_ACTION_MS = 6000;

const ICON: Record<PortalToastType, React.ReactNode> = {
  ok: <CheckCircleIcon size={18} weight="fill" className="text-emerald-400" />,
  err: <WarningCircleIcon size={18} weight="fill" className="text-red-400" />,
  info: <InfoIcon size={18} weight="fill" className="text-primary" />,
};

export function PortalToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, number>());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (msg: string, type: PortalToastType = "info", action?: ToastAction) => {
      const id = ++nextId.current;
      setItems((prev) => [...prev, { id, type, msg, action }]);
      const timer = window.setTimeout(
        () => dismiss(id),
        action ? AUTO_HIDE_WITH_ACTION_MS : AUTO_HIDE_MS,
      );
      timers.current.set(id, timer);
      return id;
    },
    [dismiss],
  );

  // Provider sống suốt phiên portal (chỉ unmount khi đăng xuất) — dọn timer khi
  // đó để không gọi setState sau unmount.
  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((t) => window.clearTimeout(t));
      map.clear();
    };
  }, []);

  // Memo hoá để mỗi lần toast xuất hiện/tắt KHÔNG re-render cả cây portal:
  // `children` giữ nguyên identity nên React bỏ qua toàn bộ subtree.
  const api = useMemo<PortalToastApi>(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <PortalToastContext.Provider value={api}>
      {children}
      {/* Trên modal (z-50) và backdrop sidebar (z-40) để luôn nhìn thấy. */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed top-4 right-4 z-130 flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className="animate-in slide-in-from-right-4 fade-in border-foreground/10 bg-card/95 pointer-events-auto flex items-start gap-2.5 rounded-xl border p-3 shadow-2xl backdrop-blur duration-300 motion-reduce:animate-none"
          >
            <span className="mt-0.5 shrink-0">{ICON[t.type]}</span>
            <p className="text-foreground flex-1 text-sm leading-snug">{t.msg}</p>
            {t.action && (
              <Button
                variant="link"
                className="text-primary h-auto shrink-0 p-0 text-sm font-semibold"
                onClick={() => {
                  t.action?.onClick();
                  dismiss(t.id);
                }}
              >
                {t.action.label}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Đóng"
              className="shrink-0"
              onClick={() => dismiss(t.id)}
            >
              <XIcon size={14} />
            </Button>
          </div>
        ))}
      </div>
    </PortalToastContext.Provider>
  );
}

export const usePortalToast = () => useContext(PortalToastContext);

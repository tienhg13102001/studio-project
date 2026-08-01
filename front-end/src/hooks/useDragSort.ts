import { useCallback, useMemo, useRef, useState } from "react";
import { apiPut } from "#lib/api";

/**
 * Kéo thả để đổi thứ tự hiển thị.
 *
 * VÌ SAO CẦN: thứ tự đang phải gõ số vào ô `order` rồi bấm Lưu từng mục. Muốn
 * đưa một thương hiệu lên đầu trong danh sách 30 mục thì phải sửa số của mọi
 * mục nằm giữa cho khỏi trùng — sai một số là thứ tự hiển thị thành ngẫu nhiên
 * mà nhìn bảng không nhận ra.
 *
 * Thứ tự mới được áp ngay trên màn hình rồi mới gửi lên máy chủ, nên thao tác
 * không có độ trễ. Máy chủ báo lỗi thì trả lại đúng thứ tự cũ chứ không để màn
 * hình nói một đằng dữ liệu một nẻo.
 */

type Sortable = { id: string };

type Options = {
  /** Loại dữ liệu trên đường dẫn: "services" | "brands" | "portfolio". */
  type: string;
  /** Gọi sau khi máy chủ nhận, để tải lại danh sách. */
  onSaved?: () => void;
  /** Báo lỗi ra ngoài (dùng toast của portal). */
  onError?: (message: string) => void;
};

export function useDragSort<T extends Sortable>(items: T[], { type, onSaved, onError }: Options) {
  // Thứ tự tạm để kéo tới đâu thấy tới đó, chưa cần chờ máy chủ trả lời.
  // `null` nghĩa là đang dùng nguyên danh sách của máy chủ.
  const [localOrder, setLocalOrder] = useState<T[] | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const draggingId = useRef<string | null>(null);

  // Danh sách từ máy chủ đổi (tải lại, thêm, xoá) thì bỏ thứ tự tạm đi.
  // Chỉnh state ngay trong lúc dựng thay vì trong một effect: cách này React
  // khuyên dùng, và tránh một lượt dựng thừa với dữ liệu đã cũ.
  const signature = useMemo(() => items.map((i) => i.id).join(","), [items]);
  const [syncedTo, setSyncedTo] = useState(signature);
  if (signature !== syncedTo) {
    setSyncedTo(signature);
    setLocalOrder(null);
  }

  const order = localOrder ?? items;
  const setOrder = setLocalOrder;

  const commit = useCallback(
    async (next: T[]) => {
      const previous = order;
      setOrder(next);
      setSavingOrder(true);
      try {
        await apiPut(`/api/reorder/${type}`, {
          items: next.map((it, index) => ({ id: it.id, order: index })),
        });
        onSaved?.();
      } catch (e) {
        setOrder(previous); // trả lại đúng thứ tự cũ, không để lệch với máy chủ
        onError?.((e as Error).message);
      } finally {
        setSavingOrder(false);
      }
    },
    [order, type, onSaved, onError],
  );

  /** Chuyển một mục tới vị trí mới rồi lưu. Dùng cho cả kéo thả lẫn nút mũi tên. */
  const move = useCallback(
    (fromId: string, toIndex: number) => {
      const from = order.findIndex((i) => i.id === fromId);
      if (from === -1) return;
      const to = Math.max(0, Math.min(order.length - 1, toIndex));
      if (from === to) return;

      const next = [...order];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved!);
      void commit(next);
    },
    [order, commit],
  );

  /** Gắn vào từng phần tử trong danh sách. */
  const dragProps = useCallback(
    (id: string) => ({
      draggable: true,
      onDragStart: (e: React.DragEvent) => {
        draggingId.current = id;
        e.dataTransfer.effectAllowed = "move";
        // Firefox không bắt đầu kéo nếu không đặt dữ liệu.
        e.dataTransfer.setData("text/plain", id);
      },
      onDragOver: (e: React.DragEvent) => {
        if (!draggingId.current || draggingId.current === id) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      },
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        const dragged = draggingId.current;
        draggingId.current = null;
        if (!dragged || dragged === id) return;
        move(dragged, order.findIndex((i) => i.id === id));
      },
      onDragEnd: () => {
        draggingId.current = null;
      },
    }),
    [move, order],
  );

  return {
    /** Danh sách theo thứ tự đang hiển thị — dùng cái này để render. */
    order,
    /** Đang gửi thứ tự lên máy chủ. */
    savingOrder,
    dragProps,
    /** Đổi chỗ bằng nút mũi tên — cần cho điện thoại, nơi không kéo thả được. */
    moveBy: (id: string, delta: number) => {
      const from = order.findIndex((i) => i.id === id);
      if (from !== -1) move(id, from + delta);
    },
  };
}

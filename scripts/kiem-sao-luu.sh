#!/usr/bin/env bash
#
# Đo bản sao lưu mới nhất rồi giao số cho script gửi cảnh báo trong container.
#
# VÌ SAO TÁCH LÀM HAI: bản sao lưu nằm ở /var/backups/beezvn trên MÁY CHỦ, còn
# script gửi email chạy trong container beez-backend (nơi có sẵn cấu hình SMTP)
# và không nhìn thấy thư mục đó. Thay vì mount thêm thư mục vào một hệ thống
# đang chạy, chỗ này đo ở ngoài rồi truyền ba con số vào.
#
# Chạy hằng ngày qua cron, SAU khi backup.sh đã chạy xong.

set -uo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/beezvn}"
BACKEND_CONTAINER="${BACKEND_CONTAINER:-beez-backend}"

log() { printf '%s  %s\n' "$(date '+%F %T')" "$*"; }

# ── Bản kết xuất mới nhất bao nhiêu ngày tuổi, bao nhiêu KB ──────────────────
# Tuổi -1 = KHÔNG TÌM THẤY BẢN NÀO. Đây là trạng thái nguy nhất và phải phân
# biệt được với "có bản nhưng cũ", nên không dùng 0 làm giá trị thiếu.
moi=$(ls -t "$BACKUP_DIR"/beezvn-*-db.archive.gz 2>/dev/null | head -1)
if [[ -z "$moi" ]]; then
  tuoi=-1
  kb=0
else
  giay=$(( $(date +%s) - $(stat -c %Y "$moi") ))
  tuoi=$(( giay / 86400 ))
  kb=$(( $(stat -c %s "$moi") / 1024 ))
fi

so_file=$(find "$BACKUP_DIR/files" -type f 2>/dev/null | wc -l)

log "đo được tại chỗ: tuổi=${tuoi} ngày · ${kb}KB · ${so_file} file ảnh/video"

# ── Bản ở NGOÀI máy chủ ──────────────────────────────────────────────────────
#
# VÌ SAO PHẢI ĐO RIÊNG: bản tại chỗ và bản ngoài hỏng vì những lý do KHÁC NHAU.
# Bản tại chỗ có thể vẫn ngon trong khi việc đẩy lên Google Drive đã chết từ lâu
# — hết hạn uỷ quyền, đổi mật khẩu Google, hoặc mã ứng dụng dùng chung của
# rclone bị Google khai tử (đã có cảnh báo đúng chuyện đó, hạn trong năm 2026).
#
# Đo mỗi bản tại chỗ rồi báo "mọi thứ bình thường" chính là kiểu im lặng mà cả
# hệ thống cảnh báo này sinh ra để chống.
#
# Tuổi -1 = không với tới được đích, hoặc đích rỗng.
r_tuoi=-1
r_file=0
if [[ -n "${BACKUP_REMOTE:-}" ]] && command -v rclone >/dev/null; then
  # Tên file có dạng beezvn-YYYYMMDD-HHMM-db.archive.gz nên sắp xếp theo tên
  # là ra bản mới nhất, không cần hỏi ngày sửa của Google.
  r_moi=$(rclone lsf "$BACKUP_REMOTE/db" 2>/dev/null | grep -E '^beezvn-[0-9]{8}-[0-9]{4}-db\.archive\.gz$' | sort | tail -1)
  if [[ -n "$r_moi" ]]; then
    r_ngay=$(echo "$r_moi" | sed -E 's/^beezvn-([0-9]{8})-.*/\1/')
    r_tuoi=$(( ( $(date +%s) - $(date -d "$r_ngay" +%s) ) / 86400 ))
  fi
  r_file=$(rclone size "$BACKUP_REMOTE/files" --json 2>/dev/null | sed -E 's/.*"count":([0-9]+).*/\1/')
  [[ "$r_file" =~ ^[0-9]+$ ]] || r_file=0
  log "đo được ngoài máy chủ: tuổi=${r_tuoi} ngày · ${r_file} file · đích ${BACKUP_REMOTE}"
else
  log "CHƯA đặt BACKUP_REMOTE — không có bản nào ngoài máy chủ để đo"
fi

# ── Giao cho container gửi email nếu có vấn đề ───────────────────────────────
if ! docker inspect -f '{{.State.Running}}' "$BACKEND_CONTAINER" 2>/dev/null | grep -q true; then
  log "LỖI: container $BACKEND_CONTAINER không chạy — không gửi cảnh báo được"
  exit 1
fi

docker exec "$BACKEND_CONTAINER" \
  npx tsx src/scripts/canh-bao-sao-luu.ts "$tuoi" "$so_file" "$kb" "$r_tuoi" "$r_file"

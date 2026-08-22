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

log "đo được: tuổi=${tuoi} ngày · ${kb}KB · ${so_file} file ảnh/video"

# ── Giao cho container gửi email nếu có vấn đề ───────────────────────────────
if ! docker inspect -f '{{.State.Running}}' "$BACKEND_CONTAINER" 2>/dev/null | grep -q true; then
  log "LỖI: container $BACKEND_CONTAINER không chạy — không gửi cảnh báo được"
  exit 1
fi

docker exec "$BACKEND_CONTAINER" \
  npx tsx src/scripts/canh-bao-sao-luu.ts "$tuoi" "$so_file" "$kb"

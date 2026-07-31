#!/usr/bin/env bash
#
# Sao lưu beezvn.com — cơ sở dữ liệu + toàn bộ ảnh/video khách xem trên web.
#
# VÌ SAO CẦN: hiện tại toàn bộ dữ liệu chỉ nằm trong Docker volume trên đúng một
# máy chủ. Ổ hỏng, gõ nhầm một lệnh, hoặc nhà cung cấp xoá máy là mất sạch —
# không có bản nào ở nơi khác để lấy lại.
#
# CÁCH DÙNG
#   ./scripts/backup.sh --check     # kiểm tra điều kiện, KHÔNG ghi gì
#   ./scripts/backup.sh             # chạy sao lưu thật
#
# Hướng dẫn cài đặt và cách phục hồi: xem docs/sao-luu.md
#
# Script CỐ Ý không đọc mật khẩu từ đâu cả: mongodump chạy bên trong container
# MongoDB, nơi đã sẵn có biến môi trường tài khoản. Không có mật khẩu nào đi qua
# dòng lệnh (ai đang đăng nhập máy chủ cũng đọc được `ps`) hay nằm trong log.

set -euo pipefail

# ── Cấu hình (đổi được bằng biến môi trường) ─────────────────────────────────
BACKUP_DIR="${BACKUP_DIR:-/var/backups/beezvn}"
# Giữ bao nhiêu ngày bản kết xuất cơ sở dữ liệu. Ảnh/video không tính ở đây vì
# chúng được đồng bộ tăng dần chứ không chép lại mỗi ngày.
KEEP_DAYS="${BACKUP_KEEP_DAYS:-14}"
# Đích ngoài máy chủ theo cú pháp rclone, ví dụ "gdrive:beezvn-backup".
# Để trống thì chỉ sao lưu tại chỗ — vẫn cứu được lỗi gõ nhầm, nhưng KHÔNG cứu
# được ổ hỏng. Nên cấu hình.
REMOTE="${BACKUP_REMOTE:-}"

MONGO_CONTAINER="${MONGO_CONTAINER:-beez-mongodb}"
BACKEND_CONTAINER="${BACKEND_CONTAINER:-beez-backend}"
DB_NAME="${DB_NAME:-beez_db}"
# Ảnh nhỏ dùng để chép file ra/vào volume. Kéo về một lần rồi nằm sẵn trên máy.
HELPER_IMAGE="${HELPER_IMAGE:-alpine:3}"

# Cần ít nhất ngần này chỗ trống mới dám bắt đầu.
MIN_FREE_MB="${MIN_FREE_MB:-2048}"

CHECK_ONLY=0
[[ "${1:-}" == "--check" ]] && CHECK_ONLY=1

STAMP="$(date +%Y%m%d-%H%M)"
DB_FILE="$BACKUP_DIR/beezvn-$STAMP-db.archive.gz"
MIRROR_DIR="$BACKUP_DIR/files"

log()  { printf '%s  %s\n' "$(date '+%F %T')" "$*"; }
die()  { printf '%s  LỖI: %s\n' "$(date '+%F %T')" "$*" >&2; exit 1; }

# ── Kiểm tra điều kiện ───────────────────────────────────────────────────────
preflight() {
  command -v docker >/dev/null || die "không tìm thấy docker"

  docker inspect -f '{{.State.Running}}' "$MONGO_CONTAINER" 2>/dev/null | grep -q true \
    || die "container '$MONGO_CONTAINER' không chạy"
  docker inspect -f '{{.State.Running}}' "$BACKEND_CONTAINER" 2>/dev/null | grep -q true \
    || die "container '$BACKEND_CONTAINER' không chạy"

  # mongodump nằm trong ảnh mongo chính thức, nhưng kiểm tra vẫn hơn: thiếu nó
  # thì script chạy im rồi đẻ ra file rỗng, mà file rỗng còn tệ hơn không có gì
  # vì tưởng là đã có bản sao lưu.
  docker exec "$MONGO_CONTAINER" sh -c 'command -v mongodump' >/dev/null 2>&1 \
    || die "container MongoDB không có mongodump — xem mục Xử lý sự cố trong docs/sao-luu.md"

  mkdir -p "$MIRROR_DIR" || die "không tạo được thư mục $MIRROR_DIR"
  [[ -w "$BACKUP_DIR" ]] || die "không ghi được vào $BACKUP_DIR"

  local free_mb
  free_mb=$(df -Pm "$BACKUP_DIR" | awk 'NR==2 {print $4}')
  [[ "$free_mb" -ge "$MIN_FREE_MB" ]] \
    || die "chỉ còn ${free_mb}MB trống ở $BACKUP_DIR, cần tối thiểu ${MIN_FREE_MB}MB"
  log "chỗ trống: ${free_mb}MB"

  if [[ -n "$REMOTE" ]]; then
    command -v rclone >/dev/null || die "đã đặt BACKUP_REMOTE nhưng máy chưa có rclone"
    rclone lsd "${REMOTE%%:*}:" >/dev/null 2>&1 \
      || die "rclone không kết nối được tới '${REMOTE%%:*}:' — chạy 'rclone config' để cấu hình lại"
    log "đích ngoài máy chủ: $REMOTE (kết nối được)"
  else
    log "CẢNH BÁO: chưa đặt BACKUP_REMOTE — bản sao lưu chỉ nằm trên chính máy này"
  fi
}

# ── Kết xuất cơ sở dữ liệu ───────────────────────────────────────────────────
dump_db() {
  local tmp="$DB_FILE.dang-ghi"

  # Ghi ra tên tạm rồi mới đổi tên: nếu đứt giữa chừng sẽ không có file mang tên
  # hoàn chỉnh, tránh cảnh phục hồi nhầm một bản dở dang.
  docker exec "$MONGO_CONTAINER" sh -c '
    mongodump --quiet --archive --gzip \
      --db "'"$DB_NAME"'" \
      -u "$MONGO_INITDB_ROOT_USERNAME" \
      -p "$MONGO_INITDB_ROOT_PASSWORD" \
      --authenticationDatabase admin
  ' > "$tmp" || die "mongodump thất bại"

  local size
  size=$(stat -c %s "$tmp" 2>/dev/null || stat -f %z "$tmp")
  [[ "$size" -gt 1024 ]] || { rm -f "$tmp"; die "bản kết xuất chỉ có ${size} byte — chắc chắn sai"; }

  # Đọc thử lại bằng chính công cụ sẽ dùng lúc phục hồi. Sao lưu chưa từng đọc
  # lại được thì không tính là sao lưu.
  docker exec -i "$MONGO_CONTAINER" sh -c '
    mongorestore --quiet --archive --gzip --dryRun \
      -u "$MONGO_INITDB_ROOT_USERNAME" \
      -p "$MONGO_INITDB_ROOT_PASSWORD" \
      --authenticationDatabase admin
  ' < "$tmp" >/dev/null 2>&1 || { rm -f "$tmp"; die "bản kết xuất không đọc lại được"; }

  mv "$tmp" "$DB_FILE"
  log "cơ sở dữ liệu: $(basename "$DB_FILE") ($((size / 1024))KB, đã đọc thử lại được)"
}

# ── Đồng bộ ảnh và video ─────────────────────────────────────────────────────
mirror_files() {
  # Chép tăng dần (chỉ file mới/mới hơn) thay vì nén lại toàn bộ mỗi ngày: video
  # có thể lên tới vài GB, nén lại hằng ngày là vừa chậm vừa đầy ổ.
  docker run --rm \
    --volumes-from "$BACKEND_CONTAINER" \
    -v "$MIRROR_DIR":/mirror \
    "$HELPER_IMAGE" sh -c '
      set -e
      mkdir -p /mirror/uploads /mirror/videos
      [ -d /app/public/uploads ] && cp -au /app/public/uploads/. /mirror/uploads/
      [ -d /app/public/videos ]  && cp -au /app/public/videos/.  /mirror/videos/
      exit 0
    ' || die "không đồng bộ được ảnh/video"

  local n bytes
  n=$(find "$MIRROR_DIR" -type f | wc -l)
  bytes=$(du -sm "$MIRROR_DIR" | awk '{print $1}')
  [[ "$n" -gt 0 ]] || log "CẢNH BÁO: chưa có file ảnh/video nào được chép"
  log "ảnh & video: $n file, ${bytes}MB"
}

# ── Dọn bản cũ ───────────────────────────────────────────────────────────────
prune_local() {
  local removed
  removed=$(find "$BACKUP_DIR" -maxdepth 1 -name 'beezvn-*-db.archive.gz' -type f \
    -mtime "+$KEEP_DAYS" -print -delete | wc -l)
  log "dọn bản cũ hơn $KEEP_DAYS ngày: xoá $removed file"
}

# ── Đẩy ra ngoài máy chủ ─────────────────────────────────────────────────────
push_remote() {
  [[ -n "$REMOTE" ]] || return 0

  rclone copyto "$DB_FILE" "$REMOTE/db/$(basename "$DB_FILE")" \
    || die "không đẩy được bản cơ sở dữ liệu lên $REMOTE"

  # sync để bản trên mây khớp với bản dưới máy; ảnh/video hầu như chỉ thêm nên
  # mỗi lần chạy chỉ tải phần mới.
  rclone sync "$MIRROR_DIR" "$REMOTE/files" \
    || die "không đồng bộ được ảnh/video lên $REMOTE"

  # Dọn bản cũ ở xa theo đúng số ngày như dưới máy.
  rclone delete "$REMOTE/db" --min-age "${KEEP_DAYS}d" >/dev/null 2>&1 || true

  log "đã đẩy lên $REMOTE"
}

# ── Chạy ─────────────────────────────────────────────────────────────────────
log "── bắt đầu sao lưu beezvn.com ──"
preflight

if [[ "$CHECK_ONLY" -eq 1 ]]; then
  log "chế độ --check: mọi điều kiện đều đạt, chưa ghi gì cả"
  exit 0
fi

dump_db
mirror_files
prune_local
push_remote
log "── xong ──"

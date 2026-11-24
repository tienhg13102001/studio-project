#!/usr/bin/env node
/**
 * Báo cho Bing, Yandex, Naver, Seznam biết trang nào mới / vừa đổi (IndexNow).
 *
 * VÌ SAO: Bing (và Copilot, ChatGPT tìm kiếm — vốn lấy kết quả từ chỉ mục Bing)
 * tự bò lại trang theo lịch của nó, có khi vài tuần. IndexNow cho mình gõ cửa
 * ngay sau khi đẩy. Google KHÔNG dùng IndexNow; với Google thì vào Search
 * Console gửi sitemap / "Yêu cầu lập chỉ mục" bằng tay.
 *
 * Tệp khoá nằm ở public/<khoá>.txt (nội dung = chính khoá), phải ĐÃ LÊN WEB
 * thì bên nhận mới tin. Đổi khoá thì đổi cả tệp lẫn hằng số dưới.
 *
 * Cách dùng (chạy SAU khi deploy xong):
 *   node scripts/gui-indexnow.mjs                 # gửi mọi URL trong sitemap (lần đầu)
 *   node scripts/gui-indexnow.mjs /du-an/abc /service/san-xuat-tvc   # chỉ trang vừa đổi
 *
 * Đừng gửi cả sitemap mỗi lần đẩy: IndexNow muốn chỉ trang mới/đổi, gửi lặp
 * vô cớ có thể bị coi là spam.
 */

const HOST = "www.beezvn.com";
const KHOA = "14ffbba5dabe9b4f0d26fd42b26963c8";
const GOC = `https://${HOST}`;

async function urlTuSitemap() {
  const r = await fetch(`${GOC}/sitemap.xml`);
  if (!r.ok) throw new Error(`sitemap ${r.status}`);
  const xml = await r.text();
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
}

const thamSo = process.argv.slice(2);
const ds = thamSo.length
  ? thamSo.map((p) => (p.startsWith("http") ? p : GOC + (p.startsWith("/") ? p : "/" + p)))
  : await urlTuSitemap();

const lech = ds.filter((u) => new URL(u).host !== HOST);
if (lech.length) {
  console.error("URL khác tên miền (IndexNow sẽ từ chối cả lô):", lech);
  process.exit(1);
}

// Kiểm tệp khoá đã lên web chưa — chưa có thì bên nhận trả 403, đỡ gửi phí.
const k = await fetch(`${GOC}/${KHOA}.txt`);
if (!k.ok || (await k.text()).trim() !== KHOA) {
  console.error(`Tệp khoá ${GOC}/${KHOA}.txt chưa lên web (hoặc sai nội dung). Đẩy + deploy trước đã.`);
  process.exit(1);
}

const r = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KHOA, keyLocation: `${GOC}/${KHOA}.txt`, urlList: ds }),
});
// 200 = nhận, 202 = nhận và đang xác minh khoá. 4xx: xem https://www.indexnow.org/documentation
console.log(`IndexNow ${r.status} ${r.statusText} — đã gửi ${ds.length} URL`);
if (r.status >= 400) {
  console.log(await r.text());
  process.exit(1);
}

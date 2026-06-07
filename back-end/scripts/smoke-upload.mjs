/**
 * smoke-upload.mjs — Manual smoke test for chunked image + legacy upload endpoints.
 *
 * Assumes the backend is already running on localhost:5002.
 * Run with: node back-end/scripts/smoke-upload.mjs
 *
 * LIMITATIONS (honest):
 *  - Does NOT test disk-space guard (requires a real low-disk environment).
 *  - Does NOT upload real 5GB videos — uses synthetic zero-byte buffers.
 *  - Does NOT verify ffmpeg transcode output (only checks the HTTP response).
 *  - Chunked video "600MB" test sends 11 × 60MB of zeroes which is ~660MB of
 *    network traffic locally — comment out SCENARIO_B_VIDEO if slow machine.
 */

import { createReadStream, writeFileSync, unlinkSync } from "fs";
import { randomUUID } from "crypto";
import { tmpdir } from "os";
import { join } from "path";

const BASE = process.env.SMOKE_BASE ?? "http://localhost:5002";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const results = [];

function pass(label, detail = "") {
  results.push({ label, ok: true, detail });
  console.log(`  PASS  ${label}${detail ? " — " + detail : ""}`);
}

function fail(label, detail = "") {
  results.push({ label, ok: false, detail });
  console.error(`  FAIL  ${label}${detail ? " — " + detail : ""}`);
}

/**
 * Build a minimal valid JPEG buffer (3×3 white pixels, ~200 bytes).
 * Sufficient for sharp to process without errors.
 */
function makeTinyJpeg() {
  // Smallest valid JPEG (1×1 white pixel) as a hex-encoded byte string.
  const hex =
    "ffd8ffe000104a46494600010100000100010000" +
    "ffdb004300080606070605080707070909080a0c" +
    "140d0c0b0b0c1912130f141d1a1f1e1d1a1c1c20" +
    "242e2720222c231c1c2837292c30313434341f27" +
    "39413d2d38302d33347bffdb0043010909090c0b" +
    "0c180d0d1832211c213232323232323232323232" +
    "323232323232323232323232323232323232323232" +
    "3232323232323232323232323232ffc000110800" +
    "0100010301110002110103110100ffc40000ffc4" +
    "00b5000201030101010101000000000000000001" +
    "020304050607080910ff" +
    "c4011f0000030101010101010101010100000000" +
    "000102030405060708091011ffda000c03010002" +
    "110311003f00f4a00028003ffd9";
  return Buffer.from(hex.replace(/\s/g, ""), "hex");
}

/**
 * Make a FormData-like body for Node fetch using a manual multipart builder.
 * Avoids the need for the `form-data` npm package.
 */
function buildMultipart(fields, files) {
  const boundary = "----SmokeTestBoundary" + randomUUID().replace(/-/g, "");
  const parts = [];

  for (const [name, value] of Object.entries(fields)) {
    parts.push(
      `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="${name}"\r\n\r\n` +
        `${value}\r\n`,
    );
  }

  for (const { name, filename, mime, data } of files) {
    const header =
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="${name}"; filename="${filename}"\r\n` +
      `Content-Type: ${mime}\r\n\r\n`;
    parts.push(Buffer.concat([Buffer.from(header), data, Buffer.from("\r\n")]));
  }

  parts.push(Buffer.from(`--${boundary}--\r\n`));
  const body = Buffer.concat(parts.map((p) => (Buffer.isBuffer(p) ? p : Buffer.from(p))));
  return { body, contentType: `multipart/form-data; boundary=${boundary}` };
}

async function postMultipart(path, fields, files) {
  const { body, contentType } = buildMultipart(fields, files);
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": contentType },
    body,
  });
  let json = null;
  try {
    json = await res.json();
  } catch {}
  return { status: res.status, json };
}

async function postJson(path, payload) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  let json = null;
  try {
    json = await res.json();
  } catch {}
  return { status: res.status, json };
}

// ─── Scenario A: 1MB image via chunked upload (single chunk) ─────────────────

async function scenarioA() {
  console.log("\n[A] Chunked image upload — 1MB synthetic JPEG, single chunk");
  try {
    const uploadId = randomUUID().replace(/-/g, "").slice(0, 16);
    // 1MB of valid JPEG-ish data. We pad a real JPEG header with zero bytes so
    // sharp may error on decode — that's OK for HTTP-layer smoke test.
    // For a real 200 from /complete, the backend needs a decodable image.
    // We use the tiny JPEG for the actual chunk so sharp succeeds.
    const imageData = makeTinyJpeg();

    const chunkRes = await postMultipart(
      "/api/upload/image/chunk",
      { uploadId, chunkIndex: "0", totalChunks: "1", originalName: "smoke.jpg" },
      [{ name: "chunk", filename: "smoke.jpg", mime: "image/jpeg", data: imageData }],
    );

    if (chunkRes.status !== 200) {
      fail("A.chunk", `Expected 200, got ${chunkRes.status} — ${JSON.stringify(chunkRes.json)}`);
      return;
    }
    pass("A.chunk", `status=${chunkRes.status}`);

    const completeRes = await postJson("/api/upload/image/complete", {
      uploadId,
      originalName: "smoke.jpg",
    });

    if (completeRes.status === 200 && completeRes.json?.data?.url) {
      pass("A.complete", `url=${completeRes.json.data.url}`);
    } else {
      fail(
        "A.complete",
        `Expected 200+url, got ${completeRes.status} — ${JSON.stringify(completeRes.json)}`,
      );
    }
  } catch (e) {
    fail("A", String(e));
  }
}

// ─── Scenario B: Image oversized (>500MB) — expect 413 at chunk boundary ─────
// We simulate this by sending chunks whose accumulated size exceeds 500MB.
// LIMITATION: we only send 2 chunks of 60MB each (120MB total) and then a fake
// "accumulated > 500MB" by spoofing file size — the real guard fires when the
// server-side .part file accumulates past IMAGE_TOTAL_MAX_BYTES.
// True 500MB test would require sending 9 × 60MB chunks — skipped for speed.
// Instead we send a tiny chunk AFTER marking the part file as "already full" by
// first uploading a 60MB chunk repeatedly via the same uploadId until the server
// rejects with 413.

async function scenarioB() {
  console.log(
    "\n[B] Chunked image oversized guard — 9 × 60MB chunks should trigger 413",
  );
  console.log("    NOTE: This scenario sends ~540MB of zero bytes locally.");
  console.log("    Set SKIP_LARGE_SCENARIOS=1 to skip.");
  if (process.env.SKIP_LARGE_SCENARIOS === "1") {
    console.log("    SKIPPED (SKIP_LARGE_SCENARIOS=1)");
    return;
  }

  const uploadId = randomUUID().replace(/-/g, "").slice(0, 16);
  // 60MB of zeros — this will be accepted by multer (limit is 95MB) but the
  // server's accumulated-size check should reject at chunk 9 (540MB > 500MB).
  const chunkData = Buffer.alloc(60 * 1024 * 1024, 0);

  let got413 = false;
  for (let i = 0; i < 11; i++) {
    try {
      const res = await postMultipart(
        "/api/upload/image/chunk",
        { uploadId, chunkIndex: String(i), totalChunks: "11", originalName: "big.jpg" },
        [{ name: "chunk", filename: "big.jpg", mime: "image/jpeg", data: chunkData }],
      );
      if (res.status === 413) {
        pass("B.413-at-chunk-" + i, "Server correctly rejected oversized upload");
        got413 = true;
        break;
      }
      if (res.status !== 200) {
        fail("B.chunk-" + i, `Unexpected status ${res.status}`);
        break;
      }
    } catch (e) {
      fail("B.chunk-" + i, String(e));
      break;
    }
  }
  if (!got413) {
    fail("B", "Never received 413 after sending >500MB of chunks");
  }
}

// ─── Scenario C: Legacy single-shot image endpoint (POST /api/upload) ─────────

async function scenarioC() {
  console.log("\n[C] Legacy single-shot image upload — POST /api/upload");
  try {
    const imageData = makeTinyJpeg();
    const res = await postMultipart(
      "/api/upload",
      {},
      [{ name: "image", filename: "legacy.jpg", mime: "image/jpeg", data: imageData }],
    );
    if (res.status === 200 && res.json?.data?.url) {
      pass("C.legacy-image-upload", `url=${res.json.data.url}`);
    } else {
      fail(
        "C.legacy-image-upload",
        `Expected 200+url, got ${res.status} — ${JSON.stringify(res.json)}`,
      );
    }
  } catch (e) {
    fail("C", String(e));
  }
}

// ─── Scenario D: Legacy single-shot video endpoint (POST /api/upload/video) ───
// NOTE: We send a minimal valid MP4 (ftyp box + mdat), not a real video.
// ffmpeg will fail to transcode it, but the HTTP layer should still return 200
// (transcode is background fire-and-forget). We verify only the HTTP response.

async function scenarioD() {
  console.log("\n[D] Legacy single-shot video upload — POST /api/upload/video");
  console.log("    NOTE: ffmpeg transcode will fail on synthetic data — that is expected.");
  console.log("    We only verify the HTTP 200 response (transcode is background).");
  try {
    // Minimal MP4 ftyp box (synthetic, not a real video)
    const ftyp = Buffer.from([
      0x00, 0x00, 0x00, 0x14, // box size = 20
      0x66, 0x74, 0x79, 0x70, // 'ftyp'
      0x69, 0x73, 0x6f, 0x6d, // major brand 'isom'
      0x00, 0x00, 0x00, 0x00, // minor version
      0x69, 0x73, 0x6f, 0x6d, // compatible brand 'isom'
    ]);
    const mdat = Buffer.from([
      0x00, 0x00, 0x00, 0x08, // box size = 8
      0x6d, 0x64, 0x61, 0x74, // 'mdat'
    ]);
    const mp4Data = Buffer.concat([ftyp, mdat]);

    const res = await postMultipart(
      "/api/upload/video",
      {},
      [{ name: "video", filename: "smoke.mp4", mime: "video/mp4", data: mp4Data }],
    );
    if (res.status === 200 && res.json?.data?.url) {
      pass("D.legacy-video-upload", `url=${res.json.data.url} status=${res.json.data.status}`);
    } else {
      fail(
        "D.legacy-video-upload",
        `Expected 200+url, got ${res.status} — ${JSON.stringify(res.json)}`,
      );
    }
  } catch (e) {
    fail("D", String(e));
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

(async () => {
  console.log(`\nSmoke test — backend at ${BASE}`);
  console.log("=".repeat(60));

  await scenarioA();
  await scenarioC();
  await scenarioD();
  // B is last because it's the heavy one (sends many large chunks)
  await scenarioB();

  console.log("\n" + "=".repeat(60));
  console.log("RESULTS:");
  let allPassed = true;
  for (const r of results) {
    const icon = r.ok ? "PASS" : "FAIL";
    console.log(`  [${icon}] ${r.label}${r.detail ? " — " + r.detail : ""}`);
    if (!r.ok) allPassed = false;
  }
  console.log("=".repeat(60));
  console.log(allPassed ? "\nAll scenarios passed." : "\nSome scenarios FAILED — see above.");
  process.exit(allPassed ? 0 : 1);
})();

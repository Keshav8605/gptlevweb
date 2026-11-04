import { NextResponse } from "next/server";
import { addMediaAsset, getGiftById } from "@/lib/server-db";
import { getAuthenticatedCreator } from "@/lib/auth-guard";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Validates actual file magic bytes and rejects forbidden formats (such as SVG).
 */
function validateBufferFormat(
  buf: Buffer,
  declaredMime: string
): { valid: boolean; error?: string } {
  if (!buf || buf.length === 0) {
    return { valid: false, error: "Empty file payload." };
  }

  // 1. Strictly reject SVG (MIME or payload content) to prevent stored XSS
  const lowerMime = (declaredMime || "").toLowerCase();
  if (lowerMime === "image/svg+xml" || lowerMime.includes("svg")) {
    return { valid: false, error: "SVG uploads are rejected for security reasons." };
  }
  const sample = buf.subarray(0, 1024).toString("utf8").toLowerCase();
  if (sample.includes("<svg") || sample.includes('xmlns="http://www.w3.org/2000/svg"')) {
    return { valid: false, error: "SVG uploads are rejected for security reasons." };
  }

  // 2. Validate Image Magic Bytes
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    if (lowerMime !== "image/jpeg" && lowerMime !== "image/jpg") {
      return { valid: false, error: "MIME type mismatch: content is JPEG." };
    }
    return { valid: true };
  }

  // PNG: 89 50 4E 47
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    if (lowerMime !== "image/png") {
      return { valid: false, error: "MIME type mismatch: content is PNG." };
    }
    return { valid: true };
  }

  // GIF: GIF8
  if (buf.subarray(0, 4).toString("ascii") === "GIF8") {
    if (lowerMime !== "image/gif") {
      return { valid: false, error: "MIME type mismatch: content is GIF." };
    }
    return { valid: true };
  }

  // WebP: RIFF....WEBP
  if (
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    if (lowerMime !== "image/webp") {
      return { valid: false, error: "MIME type mismatch: content is WEBP." };
    }
    return { valid: true };
  }

  // 3. Validate Audio Magic Bytes
  // MP3: ID3 or MPEG sync word
  if (
    buf.subarray(0, 3).toString("ascii") === "ID3" ||
    (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0)
  ) {
    if (lowerMime !== "audio/mpeg" && lowerMime !== "audio/mp3") {
      return { valid: false, error: "MIME type mismatch: content is MP3 audio." };
    }
    return { valid: true };
  }

  // WAV: RIFF....WAVE
  if (
    buf.subarray(0, 4).toString("ascii") === "RIFF" &&
    buf.subarray(8, 12).toString("ascii") === "WAVE"
  ) {
    if (lowerMime !== "audio/wav" && lowerMime !== "audio/x-wav") {
      return { valid: false, error: "MIME type mismatch: content is WAV audio." };
    }
    return { valid: true };
  }

  // OGG: OggS
  if (buf.subarray(0, 4).toString("ascii") === "OggS") {
    if (lowerMime !== "audio/ogg") {
      return { valid: false, error: "MIME type mismatch: content is OGG audio." };
    }
    return { valid: true };
  }

  return { valid: false, error: `Unsupported or invalid file signature for MIME type: ${declaredMime}` };
}

/**
 * Reads request body stream chunk-by-chunk to enforce byte limits upfront,
 * even when Content-Length header is omitted or unreliable.
 */
async function readStreamWithLimit(
  request: Request,
  maxBytes: number
): Promise<{ buffer: Buffer; error?: string; status?: number }> {
  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const parsed = parseInt(contentLength, 10);
    if (!isNaN(parsed) && parsed > maxBytes) {
      return {
        buffer: Buffer.alloc(0),
        error: "Upload payload exceeds 10MB limit.",
        status: 413,
      };
    }
  }

  if (!request.body) {
    return { buffer: Buffer.alloc(0) };
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        totalBytes += value.length;
        if (totalBytes > maxBytes) {
          try {
            await reader.cancel();
          } catch {}
          return {
            buffer: Buffer.alloc(0),
            error: "Upload payload stream exceeds 10MB limit.",
            status: 413,
          };
        }
        chunks.push(value);
      }
    }
  } catch {
    return {
      buffer: Buffer.alloc(0),
      error: "Failed to read upload stream.",
      status: 400,
    };
  }

  return { buffer: Buffer.concat(chunks) };
}

/**
 * Validates data URL structure, MIME congruence, base64 integrity, and decoded size.
 */
function parseAndValidateDataUrl(
  dataUrl: string,
  declaredMime: string,
  maxDecodedBytes: number
): { valid: boolean; buffer?: Buffer; error?: string } {
  if (!dataUrl || typeof dataUrl !== "string") {
    return { valid: false, error: "Missing media payload." };
  }

  const match = dataUrl.match(/^data:([a-zA-Z0-9\/\-+.]+);base64,([\s\S]+)$/);
  if (!match) {
    return { valid: false, error: "Malformed data URL format. Expected data:<mime>;base64,<data>." };
  }

  const [, dataUrlMime, rawBase64] = match;

  if (declaredMime && dataUrlMime.toLowerCase() !== declaredMime.toLowerCase()) {
    return {
      valid: false,
      error: `MIME type mismatch: declared '${declaredMime}' does not match data URL '${dataUrlMime}'.`,
    };
  }

  const cleaned = rawBase64.replace(/\r?\n|\r/g, "").trim();
  if (!cleaned || cleaned.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(cleaned)) {
    return { valid: false, error: "Malformed base64 payload." };
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(cleaned, "base64");
  } catch {
    return { valid: false, error: "Failed to decode base64 payload." };
  }

  if (buffer.length === 0 && cleaned.length > 0) {
    return { valid: false, error: "Decoded base64 payload is empty." };
  }

  if (buffer.length > maxDecodedBytes) {
    return { valid: false, error: `Decoded file size (${buffer.length} bytes) exceeds 10MB limit.` };
  }

  return { valid: true, buffer };
}

export async function POST(request: Request) {
  try {
    // 1. Strict creator authentication required for all uploads
    const auth = await getAuthenticatedCreator(request);
    if (!auth.authenticated || !auth.userId) {
      return NextResponse.json(
        { error: auth.error || "Creator authentication required to upload media." },
        { status: auth.statusCode || 401 }
      );
    }

    // 2. Enforce request size limit before buffering into memory
    const readRes = await readStreamWithLimit(request, MAX_FILE_SIZE);
    if (readRes.error) {
      return NextResponse.json({ error: readRes.error }, { status: readRes.status || 400 });
    }

    const contentType = request.headers.get("content-type") || "";

    // ----------------------------------------------------
    // Method A: Multipart Form Data
    // ----------------------------------------------------
    if (contentType.includes("multipart/form-data")) {
      const subReq = new Request(request.url, {
        method: request.method,
        headers: request.headers,
        body: new Uint8Array(readRes.buffer),
      });

      const formData = await subReq.formData();
      const file = formData.get("file") as File | null;
      const giftId = (formData.get("giftId") as string) || "";
      const caption = (formData.get("caption") as string) || undefined;

      if (!file) {
        return NextResponse.json({ error: "No file provided." }, { status: 400 });
      }

      if (!giftId || !giftId.trim()) {
        return NextResponse.json(
          { error: "A valid gift ID is required for media upload." },
          { status: 400 }
        );
      }

      // Verify gift existence and require explicit creator ownership (reject missing creatorId)
      const gift = getGiftById(giftId);
      if (!gift) {
        return NextResponse.json({ error: "Gift not found." }, { status: 404 });
      }
      if (!gift.creatorId || gift.creatorId !== auth.userId) {
        return NextResponse.json(
          { error: "Forbidden. Gift lacks creator ownership or does not belong to you." },
          { status: 403 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "File exceeds 10MB limit." },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const validation = validateBufferFormat(buffer, file.type);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      const base64 = buffer.toString("base64");
      const dataUrl = `data:${file.type};base64,${base64}`;

      const result = addMediaAsset({
        giftId,
        creatorId: auth.userId,
        name: file.name,
        type: file.type.startsWith("image/") ? "image" : "audio",
        mimeType: file.type,
        sizeBytes: file.size,
        dataUrl,
        caption,
      });

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({ success: true, asset: result.asset });
    }

    // ----------------------------------------------------
    // Method B: JSON Base64 Payload
    // ----------------------------------------------------
    interface JsonMediaUploadBody {
      giftId?: string;
      name?: string;
      mimeType?: string;
      sizeBytes?: number;
      dataUrl?: string;
      caption?: string;
    }
    let body: JsonMediaUploadBody;
    try {
      body = JSON.parse(readRes.buffer.toString("utf8")) as JsonMediaUploadBody;
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }

    const { giftId, name, mimeType, sizeBytes, dataUrl, caption } = body;

    if (!giftId || !String(giftId).trim()) {
      return NextResponse.json(
        { error: "A valid gift ID is required for media upload." },
        { status: 400 }
      );
    }

    // Verify gift existence and require explicit creator ownership (reject missing creatorId)
    const gift = getGiftById(giftId);
    if (!gift) {
      return NextResponse.json({ error: "Gift not found." }, { status: 404 });
    }
    if (!gift.creatorId || gift.creatorId !== auth.userId) {
      return NextResponse.json(
        { error: "Forbidden. Gift lacks creator ownership or does not belong to you." },
        { status: 403 }
      );
    }

    if (!mimeType || typeof mimeType !== "string") {
      return NextResponse.json({ error: "MIME type is required." }, { status: 400 });
    }

    if (sizeBytes && Number(sizeBytes) > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 10MB limit." },
        { status: 400 }
      );
    }

    if (!dataUrl || typeof dataUrl !== "string") {
      return NextResponse.json({ error: "Missing media payload." }, { status: 400 });
    }

    // Validate data URL and base64 integrity
    const decoded = parseAndValidateDataUrl(dataUrl, mimeType, MAX_FILE_SIZE);
    if (!decoded.valid || !decoded.buffer) {
      return NextResponse.json({ error: decoded.error || "Invalid media payload." }, { status: 400 });
    }

    // Validate actual file magic bytes
    const validation = validateBufferFormat(decoded.buffer, mimeType);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const result = addMediaAsset({
      giftId,
      creatorId: auth.userId,
      name: name || "Uploaded Media",
      type: mimeType.startsWith("image/") ? "image" : "audio",
      mimeType,
      sizeBytes: decoded.buffer.length,
      dataUrl,
      caption,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, asset: result.asset });
  } catch (err) {
    console.error("POST /api/media/upload error:", err);
    return NextResponse.json({ error: "Failed to upload media" }, { status: 500 });
  }
}

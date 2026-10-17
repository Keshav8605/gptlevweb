import { NextResponse } from "next/server";
import { addMediaAsset, verifyAccess } from "@/lib/server-db";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // Support multipart form upload or JSON base64 upload
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const giftId = (formData.get("giftId") as string) || undefined;
      const caption = (formData.get("caption") as string) || undefined;
      const token = (formData.get("token") as string) || "";

      if (token) {
        const auth = verifyAccess(token);
        if (!auth.authorized || auth.role !== "creator") {
          return NextResponse.json({ error: "Creator access required" }, { status: 403 });
        }
      }

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      const dataUrl = `data:${file.type};base64,${base64}`;

      const result = addMediaAsset({
        giftId,
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

    // JSON upload
    const body = await request.json();
    const { token, ...assetData } = body;

    if (token) {
      const auth = verifyAccess(token);
      if (!auth.authorized || auth.role !== "creator") {
        return NextResponse.json({ error: "Creator access required" }, { status: 403 });
      }
    }

    const result = addMediaAsset(assetData);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, asset: result.asset });
  } catch (err) {
    console.error("POST /api/media/upload error:", err);
    return NextResponse.json({ error: "Failed to upload media" }, { status: 500 });
  }
}

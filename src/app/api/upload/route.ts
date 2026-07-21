import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { uploadBufferToCloudinary } from "@/lib/cloudinaryUpload";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const authResult = requireAuth(req);
  if ("error" in authResult) return authResult.error;

  const limited = await rateLimit(req, { key: "upload", limit: 20, windowSeconds: 60 * 60 });
  if (limited) return limited;

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ success: false, message: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    try {
      const result = await uploadBufferToCloudinary(buffer, {
        folder: "dsabuddy_uploads",
      });

      return NextResponse.json({
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        filename: result.original_filename,
        raw: result,
      });
    } catch (cloudinaryErr) {
      console.warn(
        "Cloudinary upload failed, falling back to Base64 data URL:",
        cloudinaryErr instanceof Error ? cloudinaryErr.message : cloudinaryErr
      );

      const base64Data = buffer.toString("base64");
      const dataUrl = `data:${file.type};base64,${base64Data}`;

      return NextResponse.json({
        success: true,
        url: dataUrl,
        publicId: "local_base64",
        filename: file.name,
        raw: { fallback: true },
      });
    }
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ success: false, message: "Upload failed" }, { status: 500 });
  }
}

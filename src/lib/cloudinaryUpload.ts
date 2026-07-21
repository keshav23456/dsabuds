import { Readable } from "stream";
import type { UploadApiResponse } from "cloudinary";
import cloudinary from "@/lib/cloudinary";

export function uploadBufferToCloudinary(
  buffer: Buffer,
  {
    folder = "dsabuddy_uploads",
    publicId,
    resourceType = "auto",
  }: { folder?: string; publicId?: string; resourceType?: string } = {}
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: resourceType as "auto" | "image" | "video" | "raw",
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result as UploadApiResponse);
      }
    );

    Readable.from([buffer]).pipe(uploadStream);
  });
}

"use server";

import { createServerClient, STORAGE_BUCKETS, type StorageBucket } from "./supabase";

interface UploadResult {
  url: string;
  path: string;
  size: number;
}

export async function uploadFile(
  file: File,
  bucket: StorageBucket,
  folder: string = ""
): Promise<UploadResult> {
  const supabase = createServerClient();

  const ext = file.name.split(".").pop() ?? "bin";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const path = folder ? `${folder}/${filename}` : filename;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type,
  });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return {
    url: data.publicUrl,
    path,
    size: file.size,
  };
}

export async function deleteFile(
  bucket: StorageBucket,
  path: string
): Promise<void> {
  const supabase = createServerClient();
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}

export async function uploadImage(
  formData: FormData,
  bucket: StorageBucket,
  folder?: string
): Promise<UploadResult> {
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided");

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) {
    throw new Error("Only JPEG, PNG, WebP, and GIF images are allowed");
  }

  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
  if (file.size > MAX_SIZE) {
    throw new Error("Image must be smaller than 10 MB");
  }

  return uploadFile(file, bucket, folder);
}

export async function uploadDocument(
  formData: FormData,
  folder?: string
): Promise<UploadResult & { name: string; type: string }> {
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided");

  const allowed = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  if (!allowed.includes(file.type)) {
    throw new Error("Only PDF, Word, and Excel files are allowed");
  }

  const MAX_SIZE = 20 * 1024 * 1024; // 20 MB
  if (file.size > MAX_SIZE) {
    throw new Error("Document must be smaller than 20 MB");
  }

  const result = await uploadFile(file, STORAGE_BUCKETS.DOCUMENTS, folder);
  return { ...result, name: file.name, type: file.type };
}

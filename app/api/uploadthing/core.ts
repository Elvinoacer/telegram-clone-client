// app/api/uploadthing/core.ts
import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async () => {
      const token = await getServerSession(authOptions);
      if (!token) throw new UploadThingError("Unauthorized");
      return { token };
    })
    .onUploadComplete(async ({ file }) => {
      return {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        customId: file.customId,
        key: file.key,
        url: file.url,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

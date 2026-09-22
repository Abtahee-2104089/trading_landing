"use client";

import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

/** Typed UploadThing client for the `imageUploader` router. */
export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();

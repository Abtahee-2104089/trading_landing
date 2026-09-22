/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as adminAuth from "../adminAuth.js";
import type * as adminCrypto from "../adminCrypto.js";
import type * as adminUsers from "../adminUsers.js";
import type * as cms from "../cms.js";
import type * as emails from "../emails.js";
import type * as inquiries from "../inquiries.js";
import type * as inquiriesAdmin from "../inquiriesAdmin.js";
import type * as inquiryShared from "../inquiryShared.js";
import type * as media from "../media.js";
import type * as rateLimit from "../rateLimit.js";
import type * as seed from "../seed.js";
import type * as seedData from "../seedData.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  adminAuth: typeof adminAuth;
  adminCrypto: typeof adminCrypto;
  adminUsers: typeof adminUsers;
  cms: typeof cms;
  emails: typeof emails;
  inquiries: typeof inquiries;
  inquiriesAdmin: typeof inquiriesAdmin;
  inquiryShared: typeof inquiryShared;
  media: typeof media;
  rateLimit: typeof rateLimit;
  seed: typeof seed;
  seedData: typeof seedData;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

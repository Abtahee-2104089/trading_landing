"use node";

import nodemailer from "nodemailer";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

// ---------------------------------------------------------------------------
// SMTP delivery for new inquiries. Runs async after `inquiries.submit`
// via the scheduler, so mail latency/failure never blocks the form.
//
// - Secrets (GMAIL_SMTP_USER / GMAIL_SMTP_APP_PASSWORD) are read ONLY here
//   via process.env inside this action — never in queries/mutations, never
//   returned to the client, never stored in the database.
// - Sends two mails independently: team notification + sender acknowledgement.
// - Every attempt is logged to `mailOutbox`; the inquiry's `emailStatus`
//   ends as "sent" (both delivered) or "failed" (anything else, including
//   missing transport config), keeping the lead reviewable either way.
// ---------------------------------------------------------------------------

type InquiryDoc = {
  _id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  category: string;
  message: string;
};

function safeError(error: unknown): string {
  if (error instanceof Error) return error.message.slice(0, 1000);
  return String(error).slice(0, 1000);
}

export const sendInquiryEmails = internalAction({
  args: { inquiryId: v.id("inquiries") },
  returns: v.object({
    notified: v.boolean(),
    acknowledged: v.boolean(),
    emailStatus: v.union(v.literal("sent"), v.literal("failed")),
  }),
  handler: async (ctx, args) => {
    const inquiry: InquiryDoc | null = await ctx.runQuery(
      internal.inquiries.getInternal,
      { id: args.inquiryId },
    );
    if (!inquiry) {
      throw new Error("Inquiry not found.");
    }

    const transport = (process.env.EMAIL_TRANSPORT ?? "").trim();
    const smtpUser = (process.env.GMAIL_SMTP_USER ?? "").trim();
    const smtpPass = (process.env.GMAIL_SMTP_APP_PASSWORD ?? "").trim();
    const notifyTo = (process.env.INQUIRY_NOTIFY_TO ?? "").trim();
    const fromName = (process.env.EMAIL_FROM_NAME ?? "UAE Trade Gateway").trim().slice(0, 80);
    const siteUrl = (process.env.SITE_URL ?? "").trim();

    const from = smtpUser ? `${fromName} <${smtpUser}>` : `${fromName} <no-reply@localhost>`;

    // No transport configured: log + mark failed so the lead stays
    // reviewable and can be retried (re-invoke this action) later.
    if (transport !== "gmail_smtp" || !smtpUser || !smtpPass || !notifyTo) {
      const reason = "Email transport not configured (EMAIL_TRANSPORT/GMAIL_SMTP_USER/GMAIL_SMTP_APP_PASSWORD/INQUIRY_NOTIFY_TO).";
      const teamEntry = await ctx.runMutation(
        internal.inquiries.createOutboxEntry,
        {
          inquiryId: args.inquiryId,
          kind: "team_notify",
          to: notifyTo || "(unconfigured)",
          from,
          subject: `New trade inquiry — ${inquiry.category}`,
        },
      );
      await ctx.runMutation(internal.inquiries.markOutbox, {
        id: teamEntry.id,
        status: "skipped",
        lastError: reason,
      });
      const ackEntry = await ctx.runMutation(
        internal.inquiries.createOutboxEntry,
        {
          inquiryId: args.inquiryId,
          kind: "sender_ack",
          to: inquiry.email,
          from,
          subject: "We received your trade enquiry",
        },
      );
      await ctx.runMutation(internal.inquiries.markOutbox, {
        id: ackEntry.id,
        status: "skipped",
        lastError: reason,
      });
      await ctx.runMutation(internal.inquiries.recordEmailStatus, {
        id: args.inquiryId,
        emailStatus: "failed",
        teamNotified: false,
        senderAcked: false,
      });
      console.warn(`[emails] transport not configured; inquiry ${inquiry._id} saved with emailStatus=failed`);
      return { notified: false, acknowledged: false, emailStatus: "failed" as const };
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: smtpUser, pass: smtpPass },
    });

    const teamSubject = `New trade inquiry — ${inquiry.category} — ${inquiry.name}`;
    const teamLines = [
      `New inquiry from the landing page.`,
      ``,
      `Name: ${inquiry.name}`,
      `Email: ${inquiry.email}`,
      `Company: ${inquiry.company || "-"}`,
      `Phone: ${inquiry.phone || "-"}`,
      `Category: ${inquiry.category}`,
      ``,
      `Message:`,
      inquiry.message,
    ];
    if (siteUrl) {
      teamLines.push(``, `Site: ${siteUrl}`);
    }
    const teamText = teamLines.join("\n");

    const ackSubject = "We received your trade enquiry";
    const ackText = [
      `Hi ${inquiry.name},`,
      ``,
      `Thanks for contacting UAE Trade Gateway. Our trading desk will reply within one business day with price, lead time, and shipping options.`,
      ``,
      `Your enquiry summary:`,
      `Category: ${inquiry.category}`,
      `Message: ${inquiry.message.slice(0, 1000)}`,
      ``,
      `— UAE Trade Gateway, Jebel Ali, Dubai, UAE`,
    ].join("\n");

    async function deliver(
      kind: "team_notify" | "sender_ack",
      to: string,
      subject: string,
      text: string,
    ): Promise<boolean> {
      const entry = await ctx.runMutation(
        internal.inquiries.createOutboxEntry,
        { inquiryId: args.inquiryId, kind, to, from, subject },
      );
      try {
        await transporter.sendMail({ from, to, subject, text });
        await ctx.runMutation(internal.inquiries.markOutbox, {
          id: entry.id,
          status: "sent",
        });
        return true;
      } catch (error) {
        // Never include credentials in logs — only the safe error message.
        await ctx.runMutation(internal.inquiries.markOutbox, {
          id: entry.id,
          status: "failed",
          lastError: safeError(error),
        });
        console.error(`[emails] ${kind} to ${to} failed:`, safeError(error));
        return false;
      }
    }

    // Independent attempts: one failing must not block the other.
    const notified = await deliver("team_notify", notifyTo, teamSubject, teamText);
    const acknowledged = await deliver("sender_ack", inquiry.email, ackSubject, ackText);

    const emailStatus = notified && acknowledged ? ("sent" as const) : ("failed" as const);
    await ctx.runMutation(internal.inquiries.recordEmailStatus, {
      id: args.inquiryId,
      emailStatus,
      // P2 nit: per-mail flags so a partial success (team notified but ack
      // failed, or vice versa) is triageable instead of a flat "failed".
      teamNotified: notified,
      senderAcked: acknowledged,
    });

    return { notified, acknowledged, emailStatus };
  },
});

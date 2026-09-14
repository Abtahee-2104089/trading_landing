import type { HTMLAttributes } from "react";

type SectionHeadingProps = HTMLAttributes<HTMLDivElement> & {
  eyebrow: string;
  title: string;
  description?: string;
  /** Element id applied to the heading for aria-labelledby wiring. */
  headingId: string;
  /** Set for dark (navy) section backgrounds. */
  dark?: boolean;
  align?: "left" | "center";
};

/** Shared section heading — eyebrow + title + optional lede. */
export default function SectionHeading({
  eyebrow,
  title,
  description,
  headingId,
  dark = false,
  align = "left",
  className = "",
  ...props
}: SectionHeadingProps) {
  const alignClasses = align === "center" ? "text-center mx-auto items-center" : "text-left items-start";
  return (
    <div className={`flex max-w-2xl flex-col ${alignClasses} ${className}`} {...props}>
      <p
        className={`text-sm font-semibold tracking-widest uppercase ${
          dark ? "text-gold-400" : "text-teal-700"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        id={headingId}
        className={`mt-2 text-3xl font-bold tracking-tight sm:text-4xl ${
          dark ? "text-white" : "text-navy-950"
        }`}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`mt-3 text-base leading-relaxed ${
            dark ? "text-slate-300" : "text-slate-600"
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

type Variant = "primary" | "navy" | "outline-light" | "outline-dark" | "ghost-light";
type Size = "sm" | "md" | "lg";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
};

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type ButtonAsLink = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60";

const variants: Record<Variant, string> = {
  // Muted gold CTA — the one primary CTA repeated everywhere.
  primary:
    "bg-gold-500 text-navy-950 hover:bg-gold-400 focus-visible:ring-gold-500 focus-visible:ring-offset-navy-950",
  // Deep navy for light backgrounds (secondary emphasis).
  navy: "bg-navy-900 text-white hover:bg-navy-800",
  // Outline on dark backgrounds (hero secondary CTA).
  "outline-light":
    "border border-white/30 bg-white/5 text-white hover:bg-white/10",
  // Outline on light backgrounds.
  "outline-dark":
    "border border-navy-900/20 bg-white text-navy-900 hover:bg-navy-50",
  "ghost-light": "text-white/80 hover:text-white hover:bg-white/10",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2",
  md: "px-5 py-2.5",
  lg: "px-6 py-3",
};

/** Shared button — renders an <a> when `href` is set, else a <button>. */
export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if ("href" in props && props.href !== undefined) {
    const { href, ...rest } = props as ButtonAsLink;
    return <a href={href} className={classes} {...rest} />;
  }

  return (
    <button
      className={classes}
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    />
  );
}

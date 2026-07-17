// Tiny className joiner — avoids pulling in a dependency for the prototype.
export function clsx(
  ...parts: Array<string | false | null | undefined>
): string {
  return parts.filter(Boolean).join(" ");
}

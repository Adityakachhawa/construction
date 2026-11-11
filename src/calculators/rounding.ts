/** Round material demand up, ignoring only floating-point noise at integers.
 * The tolerance is a few representable doubles, not a construction allowance.
 */
export function ceilQuantity(value: number): number {
  const nearest = Math.round(value);
  const tolerance = 4 * Number.EPSILON * Math.max(1, Math.abs(value));
  return nearest !== 0 && Math.abs(value - nearest) <= tolerance ? nearest : Math.ceil(value);
}

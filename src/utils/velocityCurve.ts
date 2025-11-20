/**
 * Apply velocity curve transformation
 * @param velocity - Input velocity (0-1)
 * @param curve - Curve type
 * @returns Transformed velocity (0-1)
 */
export const applyVelocityCurve = (
  velocity: number,
  curve: "linear" | "exponential" | "logarithmic"
): number => {
  const v = Math.max(0, Math.min(1, velocity));

  switch (curve) {
    case "linear":
      return v;
    case "exponential":
      // Exponential curve: softer notes stay quiet longer, hard notes get loud quickly
      return Math.pow(v, 2);
    case "logarithmic":
      // Logarithmic curve: softer notes get louder faster, hard notes plateau
      return Math.sqrt(v);
    default:
      return v;
  }
};

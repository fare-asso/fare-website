/**
 * Returns a number whose value is limited to the given range.
 *
 * @param {number} num The number to clamp
 * @param {number} min The lower boundary of the output range
 * @param {number} max The upper boundary of the output range
 * @returns {number} A number in the range [min, max]
 */
export function clamp(num: number, min: number, max: number): number {
    return Math.min(Math.max(num, min), max)
}

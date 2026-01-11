/**
 * Fractional indexing utility for maintaining order of items.
 * Uses lexicographic ordering with base-62 characters (0-9, A-Z, a-z).
 *
 * This allows inserting items between any two existing items without
 * renumbering all items.
 */

const BASE_62_DIGITS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const MIDPOINT_CHAR = 'U' // Roughly middle of base-62

/**
 * Generates a fractional index between two existing indices.
 *
 * @param before - The index before the new item (or null if inserting at start)
 * @param after - The index after the new item (or null if inserting at end)
 * @returns A new index that sorts between before and after
 */
export function generateFractionalIndex(before: string | null, after: string | null): string {
  // Case 1: No items yet (first item)
  if (!before && !after) {
    return MIDPOINT_CHAR
  }

  // Case 2: Insert at the beginning
  if (!before) {
    return getIndexBefore(after!)
  }

  // Case 3: Insert at the end
  if (!after) {
    return getIndexAfter(before!)
  }

  // Case 4: Insert between two indices
  return getIndexBetween(before, after)
}

/**
 * Gets an index before the given index.
 */
function getIndexBefore(index: string): string {
  // If first character is not '0', decrement it
  if (index[0] !== '0') {
    const charIndex = BASE_62_DIGITS.indexOf(index[0])
    return BASE_62_DIGITS[charIndex - 1] + MIDPOINT_CHAR
  }

  // If first character is '0', prepend a character before it
  return `0${MIDPOINT_CHAR}`
}

/**
 * Gets an index after the given index.
 */
function getIndexAfter(index: string): string {
  // Simply append a midpoint character to ensure it sorts after
  return index + MIDPOINT_CHAR
}

/**
 * Gets an index between two indices.
 */
function getIndexBetween(before: string, after: string): string {
  // Make sure before < after
  if (before >= after) {
    throw new Error(`Invalid order: before (${before}) must be less than after (${after})`)
  }

  // Find the first position where they differ
  let pos = 0
  while (pos < before.length && pos < after.length && before[pos] === after[pos]) {
    pos++
  }

  // Get the characters at the divergence point
  const beforeChar = pos < before.length ? before[pos] : ''
  const afterChar = pos < after.length ? after[pos] : ''

  const beforeIndex = beforeChar ? BASE_62_DIGITS.indexOf(beforeChar) : -1
  const afterIndex = afterChar ? BASE_62_DIGITS.indexOf(afterChar) : BASE_62_DIGITS.length

  // If there's room between the characters, use the midpoint
  if (afterIndex - beforeIndex > 1) {
    const midIndex = Math.floor((beforeIndex + afterIndex) / 2)
    return before.substring(0, pos) + BASE_62_DIGITS[midIndex]
  }

  // If no room, we need to go deeper - append a character after the before prefix
  return before.substring(0, pos + 1) + MIDPOINT_CHAR
}

/**
 * Validates that a string is a valid fractional index.
 */
export function isValidFractionalIndex(index: string): boolean {
  if (!index || index.length === 0) {
    return false
  }

  // Check that all characters are in the valid set
  for (let i = 0; i < index.length; i++) {
    if (!BASE_62_DIGITS.includes(index[i])) {
      return false
    }
  }

  return true
}

/**
 * Compares two fractional indices.
 * Returns -1 if a < b, 0 if a === b, 1 if a > b.
 */
export function compareFractionalIndices(a: string, b: string): number {
  if (a === b) return 0
  return a < b ? -1 : 1
}

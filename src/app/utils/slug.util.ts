/**
 * Utility functions for generating and working with slugs
 */

/**
 * Generate a URL-friendly slug from a string
 * @param text - The text to convert to a slug
 * @returns A URL-friendly slug
 */
export function generateSlug(text: string): string {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '')        // Remove all non-word chars
    .replace(/\-\-+/g, '-')          // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '')              // Trim hyphens from start
    .replace(/-+$/, '');             // Trim hyphens from end
}

/**
 * Generate a slug with product ID appended for uniqueness
 * @param name - Product name
 * @param id - Product ID
 * @returns A unique slug with ID
 */
export function generateProductSlug(name: string, id: number): string {
  const baseSlug = generateSlug(name);
  return `${baseSlug}-${id}`;
}

/**
 * Extract product ID from a slug
 * @param slug - The slug (format: name-slug-id)
 * @returns The product ID or null if not found
 */
export function extractIdFromSlug(slug: string): number | null {
  const parts = slug.split('-');
  const lastPart = parts[parts.length - 1];
  const id = parseInt(lastPart, 10);
  return isNaN(id) ? null : id;
}


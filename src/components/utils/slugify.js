// src/components/utils/slugify.js
export function createSlug(title, id) {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // remove special chars
      .trim()
      .replace(/\s+/g, "-"); // replace spaces with dashes
    return `${slug}-${id}`;
  }
  
  export function extractIdFromSlug(slug) {
    const parts = slug.split("-");
    return parts[parts.length - 1]; // get the last segment = Firestore ID
  }
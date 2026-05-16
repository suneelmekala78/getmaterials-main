import { MeiliSearch } from "meilisearch";

export const searchClient = process.env.MEILISEARCH_HOST
  ? new MeiliSearch({
      host: process.env.MEILISEARCH_HOST,
      apiKey: process.env.MEILISEARCH_API_KEY,
    })
  : null;

export interface SearchableMaterial {
  id: string;
  title: string;
  description: string;
  type: string;
  subjectName: string;
  subjectSlug: string;
  chapterTitle: string;
  tags: string[];
  uploadedByName: string;
  createdAt: number;
}

const MATERIALS_INDEX = "materials";

export async function indexMaterial(material: SearchableMaterial): Promise<void> {
  if (!searchClient) return;

  try {
    const index = searchClient.index(MATERIALS_INDEX);
    await index.addDocuments([material]);
  } catch (error) {
    console.error("Failed to index material:", error);
  }
}

export async function removeMaterialFromIndex(id: string): Promise<void> {
  if (!searchClient) return;

  try {
    const index = searchClient.index(MATERIALS_INDEX);
    await index.deleteDocument(id);
  } catch (error) {
    console.error("Failed to remove material from index:", error);
  }
}

export async function searchMaterials(
  query: string,
  options?: {
    limit?: number;
    offset?: number;
    filter?: string;
  }
) {
  if (!searchClient) return { hits: [], estimatedTotalHits: 0 };

  try {
    const index = searchClient.index(MATERIALS_INDEX);
    return await index.search(query, {
      limit: options?.limit || 20,
      offset: options?.offset || 0,
      filter: options?.filter,
      attributesToHighlight: ["title", "description"],
    });
  } catch (error) {
    console.error("Search failed:", error);
    return { hits: [], estimatedTotalHits: 0 };
  }
}

export async function setupSearchIndex(): Promise<void> {
  if (!searchClient) return;

  try {
    const index = searchClient.index(MATERIALS_INDEX);
    await index.updateSettings({
      searchableAttributes: [
        "title",
        "description",
        "tags",
        "subjectName",
        "chapterTitle",
        "uploadedByName",
      ],
      filterableAttributes: ["type", "subjectSlug"],
      sortableAttributes: ["createdAt"],
    });
  } catch (error) {
    console.error("Failed to setup search index:", error);
  }
}

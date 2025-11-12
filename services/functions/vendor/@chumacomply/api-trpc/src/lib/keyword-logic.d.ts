/**
 * Keyword-based smart logic for fast pre-filtering before LLM intent analysis
 * This provides quick metadata hints based on common keywords in queries
 */
export interface KeywordHint {
    activities: string[];
    industry?: string;
    documentTypes: string[];
}
/**
 * Extract keyword-based hints from query text
 * This is a fast pre-filter that complements LLM-based intent analysis
 */
export declare function extractKeywordHints(query: string): KeywordHint;

/**
 * Keyword-based smart logic for fast pre-filtering before LLM intent analysis
 * This provides quick metadata hints based on common keywords in queries
 */
/**
 * Extract keyword-based hints from query text
 * This is a fast pre-filter that complements LLM-based intent analysis
 */
export function extractKeywordHints(query) {
    const queryLower = query.toLowerCase();
    const activities = [];
    const documentTypes = [];
    let industry;
    // Data Protection / Privacy keywords - Only trigger for explicit data privacy queries
    // Don't trigger on just "data" or "employees" - require explicit privacy/data protection context
    const hasExplicitDataPrivacyKeywords = (queryLower.includes('data protection') ||
        queryLower.includes('data privacy') ||
        queryLower.includes('privacy') ||
        queryLower.includes('personal information') ||
        queryLower.includes('customer data') ||
        queryLower.includes('client data') ||
        queryLower.includes('data protection act') ||
        queryLower.includes('data controller') ||
        queryLower.includes('data processor') ||
        (queryLower.includes('email') && (queryLower.includes('privacy') || queryLower.includes('protection'))));
    if (hasExplicitDataPrivacyKeywords) {
        activities.push('data_protection');
        documentTypes.push('data_protection');
        if (!industry)
            industry = 'technology';
    }
    // Tax keywords
    if (queryLower.includes('tax') ||
        queryLower.includes('vat') ||
        queryLower.includes('zra') ||
        queryLower.includes('tpin') ||
        queryLower.includes('paye') ||
        queryLower.includes('income tax')) {
        activities.push('tax');
        documentTypes.push('tax');
    }
    // Employment keywords
    if (queryLower.includes('employee') ||
        queryLower.includes('staff') ||
        queryLower.includes('hire') ||
        queryLower.includes('worker') ||
        queryLower.includes('napsa') ||
        queryLower.includes('pension') ||
        queryLower.includes('employment')) {
        activities.push('employment');
        documentTypes.push('employment');
    }
    // Business Registration keywords
    if (queryLower.includes('register') ||
        queryLower.includes('registration') ||
        queryLower.includes('business') ||
        queryLower.includes('pacra') ||
        queryLower.includes('company') ||
        queryLower.includes('incorporate') ||
        queryLower.includes('incorporation') ||
        queryLower.includes('starting') ||
        queryLower.includes('start') ||
        queryLower.includes('begin') ||
        queryLower.includes('new business') ||
        queryLower.includes('set up') ||
        queryLower.includes('setup') ||
        queryLower.includes('establish') ||
        queryLower.includes('launch')) {
        activities.push('business_registration');
        documentTypes.push('business_registration');
    }
    // Industry-specific keywords
    if (queryLower.includes('restaurant') ||
        queryLower.includes('bakery') ||
        queryLower.includes('food') ||
        queryLower.includes('cafe') ||
        queryLower.includes('kitchen')) {
        if (!industry)
            industry = 'food_service';
    }
    if (queryLower.includes('retail') ||
        queryLower.includes('shop') ||
        queryLower.includes('store') ||
        queryLower.includes('selling')) {
        if (!industry)
            industry = 'retail';
    }
    if (queryLower.includes('manufacturing') ||
        queryLower.includes('factory') ||
        queryLower.includes('production')) {
        if (!industry)
            industry = 'manufacturing';
    }
    if (queryLower.includes('tech') ||
        queryLower.includes('software') ||
        queryLower.includes('digital') ||
        queryLower.includes('app') ||
        queryLower.includes('website')) {
        if (!industry)
            industry = 'technology';
    }
    // Location keywords (for future use)
    // Could extract Lusaka, Kitwe, Ndola, etc.
    return {
        activities: [...new Set(activities)], // Remove duplicates
        industry,
        documentTypes: [...new Set(documentTypes)],
    };
}

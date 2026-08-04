import { defineCollection, z } from 'astro:content';

const localizedString = z.object({
  'zh-tw': z.string(),
  en: z.string(),
});

const localizedStringArray = z.object({
  'zh-tw': z.array(z.string()),
  en: z.array(z.string()),
});

const faqItem = z.object({
  question: localizedString,
  answer: localizedString,
});

const specRow = z.object({
  label: localizedString,
  value: localizedString,
});

const processStep = z.object({
  title: localizedString,
  description: localizedString,
});

/** Solutions: 精密定位與傳動 / 視覺定位與檢測 / 自動化組裝工作站 / 既有產線升級 / 客製設備整合 */
const solutions = defineCollection({
  type: 'content',
  schema: z.object({
    entrySlug: z.string(),
    order: z.number(),
    demoData: z.literal(true),
    name: localizedString,
    shortDescription: localizedString,
    heroSummary: localizedString,
    problem: localizedString,
    approach: localizedString,
    applicableIndustries: localizedStringArray,
    keyBenefits: localizedStringArray,
    compatibleProducts: z.array(z.string()), // product slugs
    // Detail-page-only fields (optional; populated for the one full detail page)
    background: localizedString.optional(),
    scenarios: localizedStringArray.optional(),
    systemComponents: localizedStringArray.optional(),
    workflow: z.array(processStep).optional(),
    integrableEquipment: localizedStringArray.optional(),
    advantages: localizedStringArray.optional(),
    prerequisites: localizedStringArray.optional(),
    faq: z.array(faqItem).optional(),
    seoTitle: localizedString,
    seoDescription: localizedString,
    hasDetailPage: z.boolean().default(false),
  }),
});

/** Products: AXM-400 / VISION-X2 / FLEXCELL-M */
const products = defineCollection({
  type: 'content',
  schema: z.object({
    entrySlug: z.string(),
    order: z.number(),
    demoData: z.literal(true),
    name: z.string(), // model code, not translated
    positioning: localizedString,
    shortDescription: localizedString,
    features: localizedStringArray,
    useCases: localizedStringArray,
    specs: z.array(specRow),
    options: localizedStringArray.optional(),
    relatedSolutions: z.array(z.string()), // solution slugs
    hasDetailPage: z.boolean().default(false),
    datasheetPath: z.string().optional(),
    seoTitle: localizedString,
    seoDescription: localizedString,
  }),
});

/** Industries: 半導體與電子組裝 / 汽車零組件 / 金屬加工 / 包裝與物流 */
const industries = defineCollection({
  type: 'content',
  schema: z.object({
    entrySlug: z.string(),
    order: z.number(),
    demoData: z.literal(true),
    name: localizedString,
    shortDescription: localizedString,
    commonProblems: localizedStringArray,
    suitableSolutions: z.array(z.string()), // solution slugs
    relatedProducts: z.array(z.string()), // product slugs
    prerequisites: localizedStringArray,
    hasDetailPage: z.boolean().default(false),
    seoTitle: localizedString,
    seoDescription: localizedString,
  }),
});

/**
 * Insights: technical resource articles.
 * Stored as locale-namespaced files (insights/zh-tw/<slug>.md,
 * insights/en/<slug>.md) because article bodies are full prose, not short
 * localizedString fields — each locale gets its own markdown body rendered
 * via Content Collections' native markdown renderer.
 */
const insights = defineCollection({
  type: 'content',
  schema: z.object({
    entrySlug: z.string(),
    locale: z.enum(['zh-tw', 'en']),
    demoData: z.literal(true),
    title: z.string(),
    summary: z.string(),
    publishDate: z.date(),
    seoTitle: z.string(),
    seoDescription: z.string(),
  }),
});

export const collections = { solutions, products, industries, insights };

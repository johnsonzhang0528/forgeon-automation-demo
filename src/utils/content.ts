import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '../config/site';

export async function getSortedSolutions() {
  const entries = await getCollection('solutions');
  return entries.sort((a, b) => a.data.order - b.data.order);
}

export async function getSortedProducts() {
  const entries = await getCollection('products');
  return entries.sort((a, b) => a.data.order - b.data.order);
}

export async function getSortedIndustries() {
  const entries = await getCollection('industries');
  return entries.sort((a, b) => a.data.order - b.data.order);
}

export async function getSortedInsights(locale: Locale) {
  const entries = await getCollection('insights', (entry) => entry.data.locale === locale);
  return entries.sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());
}

export function findBySlug<T extends { data: { entrySlug: string } }>(entries: T[], slug: string) {
  return entries.find((e) => e.data.entrySlug === slug);
}

export type SolutionEntry = CollectionEntry<'solutions'>;
export type ProductEntry = CollectionEntry<'products'>;
export type IndustryEntry = CollectionEntry<'industries'>;
export type InsightEntry = CollectionEntry<'insights'>;

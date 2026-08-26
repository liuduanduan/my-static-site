import {
  chineseSupportLabels,
  pricingModeLabels,
  type CategoryFilter,
  type ChineseSupport,
  type ChineseSupportFilter,
  type PricingFilter,
  type PricingMode,
  type ToolCategory
} from '../domain/aiTools'

interface CategoryValue {
  readonly value: ToolCategory
}

type FilterEmitter<Filter extends string> = (value: Filter) => void

export const pricingModes: readonly PricingMode[] = Object.freeze(
  Object.keys(pricingModeLabels) as PricingMode[]
)
export const chineseSupportModes: readonly ChineseSupport[] = Object.freeze(
  Object.keys(chineseSupportLabels) as ChineseSupport[]
)

function includesValue<Value extends string>(
  values: readonly Value[],
  value: string
): value is Value {
  return values.includes(value as Value)
}

export function parseCategoryFilter(
  value: string,
  categories: readonly CategoryValue[]
): CategoryFilter | undefined {
  return value === 'all' || categories.some((category) => category.value === value)
    ? value as CategoryFilter
    : undefined
}

export function parsePricingFilter(value: string): PricingFilter | undefined {
  return value === 'all' || includesValue(pricingModes, value) ? value : undefined
}

export function parseChineseSupportFilter(value: string): ChineseSupportFilter | undefined {
  return value === 'all' || includesValue(chineseSupportModes, value) ? value : undefined
}

export function handleCategoryFilterValue(
  value: string,
  categories: readonly CategoryValue[],
  emit: FilterEmitter<CategoryFilter>
): void {
  const parsed = parseCategoryFilter(value, categories)
  if (parsed !== undefined) emit(parsed)
}

export function handlePricingFilterValue(
  value: string,
  emit: FilterEmitter<PricingFilter>
): void {
  const parsed = parsePricingFilter(value)
  if (parsed !== undefined) emit(parsed)
}

export function handleChineseSupportFilterValue(
  value: string,
  emit: FilterEmitter<ChineseSupportFilter>
): void {
  const parsed = parseChineseSupportFilter(value)
  if (parsed !== undefined) emit(parsed)
}

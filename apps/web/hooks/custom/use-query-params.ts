import { useRouter, useSearchParams } from "next/navigation"

import { buildQueryString } from "@/lib/build-query-string"

type TAction = "push" | "replace"

type TQueryParams = Record<string, string | undefined>

/**
 * Type-safe hook for managing URL query parameters.
 *
 * @example
 * ```tsx
 * // Without types (backward compatible)
 * const { params, updateParam } = useQueryParams()
 *
 * // With types for autocomplete and safety
 * type TMyParams = {
 *   page?: string
 *   search?: string
 *   agent_id?: string
 * }
 * const { params, updateParam, updateParams } = useQueryParams<TMyParams>()
 * updateParam('page', '1') // ✓ type-safe
 * updateParam('invalid', '1') // ✗ type error
 * ```
 */
export const useQueryParams = <T extends TQueryParams = TQueryParams>() => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const _params = {} as T
  searchParams.forEach((value, key) => {
    _params[key as keyof T] = value as T[keyof T]
  })
  const params = _params

  // Derive hasParams: true if any real param (with non-empty string value) is present
  const hasParams = Array.from(searchParams.keys()).length > 0

  const updateParam = <K extends keyof T>(
    filterKey: K,
    value: T[K],
    action: TAction = "push"
  ) => {
    const updatedParams = { ...params, [filterKey]: value }
    const qs = buildQueryString(updatedParams)

    if (action === "push")
      router.push(qs ? `?${qs}` : window.location.pathname, {
        scroll: false,
      })
    else {
      router.replace(qs ? `?${qs}` : window.location.pathname, {
        scroll: false,
      })
    }
  }

  const updateParams = (newParams: Partial<T>, action: TAction = "push") => {
    const updatedParams = { ...params, ...newParams }
    const qs = buildQueryString(updatedParams)

    if (action === "push")
      router.push(qs ? `?${qs}` : window.location.pathname, {
        scroll: false,
      })
    else {
      router.replace(qs ? `?${qs}` : window.location.pathname, {
        scroll: false,
      })
    }
  }

  const removeParam = <K extends keyof T>(
    filterKey: K,
    action: TAction = "push"
  ): void => {
    const updatedParams = { ...params, [filterKey]: undefined }
    const qs = buildQueryString(updatedParams)

    if (action === "push")
      router.push(qs ? `?${qs}` : window.location.pathname, {
        scroll: false,
      })
    else {
      router.replace(qs ? `?${qs}` : window.location.pathname, {
        scroll: false,
      })
    }
  }

  const removeAllParams = (
    excludeKeys: Array<keyof T> = [],
    action: TAction = "push"
  ) => {
    const updatedParams = {} as Partial<T>

    if (excludeKeys.length > 0) {
      excludeKeys.forEach((key) => {
        if (params[key] !== undefined) {
          updatedParams[key] = params[key]
        }
      })
    }

    const qs = buildQueryString(updatedParams)

    if (action === "push")
      router.push(qs ? `?${qs}` : window.location.pathname, {
        scroll: false,
      })
    else {
      router.replace(qs ? `?${qs}` : window.location.pathname, {
        scroll: false,
      })
    }
  }

  return {
    params,
    hasParams,
    updateParam,
    updateParams,
    removeParam,
    removeAllParams,
  }
}

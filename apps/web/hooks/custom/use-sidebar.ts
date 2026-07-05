"use client"

import { useCookies } from "@/hooks/custom/use-cookies"

const COOKIE_KEY = "sidebar_collapsed"

export const useSidebar = (defaultCollapsed = false) => {
  const [isCollapsed, setIsCollapsed] = useCookies<boolean>(
    COOKIE_KEY,
    defaultCollapsed
  )

  const toggle = () => {
    setIsCollapsed((prev) => !prev)
  }

  const collapse = () => setIsCollapsed(true)
  const expand = () => setIsCollapsed(false)

  return { isCollapsed, toggle, collapse, expand }
}

import { useState } from "react"

/*
  Hook to manage the open/close state of a component.
  @param initialState - The initial state of the component.
  @returns An object containing the open/close state, open, close, toggle, and onOpenChange functions.
*/
export const useOpenClose = (initialState: boolean = false) => {
  const [isOpen, setIsOpen] = useState(initialState)

  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  const toggle = () => setIsOpen((prev) => !prev)
  const onOpenChange = (open: boolean) => setIsOpen(open)

  return { isOpen, open, close, toggle, onOpenChange }
}

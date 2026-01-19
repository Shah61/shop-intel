"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface ComboboxProps {
  options: { label: string; value: string }[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  emptyText?: string
  className?: string
}

export function Combobox({
  options = [],
  value,
  onValueChange,
  placeholder = "Select an option",
  emptyText = "No results found.",
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  const filteredOptions = React.useMemo(() => {
    const search = searchQuery.toLowerCase()
    return options.filter((option) => 
      option.label.toLowerCase().includes(search)
    )
  }, [options, searchQuery])

  const handleSelect = React.useCallback((selectedValue: string) => {
    onValueChange?.(selectedValue)
    setOpen(false)
    setSearchQuery("")
  }, [onValueChange])

  // Handle click outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className="relative w-full" ref={inputRef}>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn("w-full justify-between", className)}
        onClick={() => setOpen(!open)}
      >
        {value ? options.find((option) => option.value === value)?.label : placeholder}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-popover rounded-md shadow-md">
          <div className="p-2">
            <input
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={`Search ${placeholder.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={(e) => e.target.select()}
              role="searchbox"
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground text-center">{emptyText}</p>
            ) : (
              <div role="listbox">
                {filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    role="option"
                    aria-selected={value === option.value}
                    className={cn(
                      "relative flex cursor-pointer select-none items-center rounded-sm px-4 py-2.5 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
                      value === option.value && "bg-accent text-accent-foreground"
                    )}
                    onClick={() => handleSelect(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 
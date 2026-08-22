import * as React from "react"

const Select = ({ children, ...props }) => {
  return (
    <select
      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    >
      {children}
    </select>
  )
}

const SelectTrigger = ({ children }) => <>{children}</>
const SelectValue = ({ placeholder }) => <>{placeholder}</>
const SelectContent = ({ children }) => <>{children}</>
const SelectItem = ({ value, children }) => <option value={value}>{children}</option>

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }

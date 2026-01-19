"use client"

import * as React from "react"
import { type DialogProps } from "@radix-ui/react-dialog"
import { Command as CommandPrimitive } from "cmdk"
import { Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Dialog, DialogContent } from "@/components/ui/dialog"

const Command = React.forwardRef<any, any>(({ className, ...props }, ref) => {
  const CommandComponent = CommandPrimitive as any;
  return (
    <CommandComponent
      ref={ref}
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
        className
      )}
      {...props}
    />
  );
}) as any
Command.displayName = CommandPrimitive.displayName || "Command"

const CommandDialog = ({ children, ...props }: DialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

const CommandInput = React.forwardRef<any, any>(({ className, ...props }, ref) => {
  const InputComponent = CommandPrimitive.Input as any;
  return (
    <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
      <InputComponent
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  );
}) as any

CommandInput.displayName = CommandPrimitive.Input.displayName

const CommandList = React.forwardRef<any, any>(({ className, ...props }, ref) => {
  const ListComponent = CommandPrimitive.List as any;
  return (
    <ListComponent
      ref={ref}
      className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
      {...props}
    />
  );
}) as any

CommandList.displayName = CommandPrimitive.List.displayName

const CommandEmpty = React.forwardRef<any, any>((props, ref) => {
  const EmptyComponent = CommandPrimitive.Empty as any;
  return (
    <EmptyComponent
      ref={ref}
      className="py-6 text-center text-sm"
      {...props}
    />
  );
}) as any

CommandEmpty.displayName = CommandPrimitive.Empty.displayName

const CommandGroup = React.forwardRef<any, any>(({ className, ...props }, ref) => {
  const GroupComponent = CommandPrimitive.Group as any;
  return (
    <GroupComponent
      ref={ref}
      className={cn(
        "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}) as any

CommandGroup.displayName = CommandPrimitive.Group.displayName

const CommandSeparator = React.forwardRef<any, any>(({ className, ...props }, ref) => {
  const SeparatorComponent = CommandPrimitive.Separator as any;
  return (
    <SeparatorComponent
      ref={ref}
      className={cn("-mx-1 h-px bg-border", className)}
      {...props}
    />
  );
}) as any
CommandSeparator.displayName = CommandPrimitive.Separator.displayName

const CommandItem = React.forwardRef<any, any>(({ className, ...props }, ref) => {
  const ItemComponent = CommandPrimitive.Item as any;
  return (
    <ItemComponent
      ref={ref}
      className={cn(
        "relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        className
      )}
      {...props}
    />
  );
}) as any

CommandItem.displayName = CommandPrimitive.Item.displayName

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}
CommandShortcut.displayName = "CommandShortcut"

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}

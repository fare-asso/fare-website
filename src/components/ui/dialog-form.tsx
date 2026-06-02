"use client"

import { Loader2Icon } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { FieldGroup } from "@/components/ui/field"
import { cn } from "@/lib/utils"

interface DialogFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    /** The dialog trigger, including its own `DialogTrigger` (and any tooltip). */
    trigger: ReactNode
    title: ReactNode
    description: ReactNode
    /** Shared by the `<form>` and the footer submit button. */
    formId: string
    onSubmit: () => void
    isPending: boolean
    submitError: string | null
    submitLabel: ReactNode
    children: ReactNode
    contentClassName?: string
}

/**
 * Dialog shell for a TanStack form: header, scrollable field area, submit-error
 * alert and a footer submit button with a pending spinner. The caller owns the
 * form instance and renders its fields as `children`.
 */
export function DialogForm({
    open,
    onOpenChange,
    trigger,
    title,
    description,
    formId,
    onSubmit,
    isPending,
    submitError,
    submitLabel,
    children,
    contentClassName
}: DialogFormProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger}
            <DialogContent
                className={cn(
                    "h-[90%] max-h-[90%] sm:max-w-[60%] lg:max-w-[40%]",
                    contentClassName
                )}
            >
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <form
                    id={formId}
                    className="overflow-y-auto p-2"
                    onSubmit={(e) => {
                        e.preventDefault()
                        onSubmit()
                    }}
                >
                    <FieldGroup>
                        {children}
                        {submitError && (
                            <p
                                role="alert"
                                className="border-destructive bg-destructive/10 text-destructive rounded-md border px-4 py-3 text-sm"
                            >
                                {submitError}
                            </p>
                        )}
                    </FieldGroup>
                </form>

                <DialogFooter>
                    <Button type="submit" form={formId} disabled={isPending}>
                        {isPending ? (
                            <Loader2Icon className="animate-spin" />
                        ) : null}{" "}
                        {submitLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

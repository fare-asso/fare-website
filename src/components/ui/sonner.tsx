import { Toaster as Sonner, type ToasterProps } from "sonner"

function Toaster({ ...props }: ToasterProps): React.JSX.Element {
    return (
        <Sonner
            className="toaster group"
            position="bottom-right"
            richColors
            closeButton
            {...props}
        />
    )
}

export { Toaster }

// import { useQueryState, parseAsBoolean } from "nuqs"

import { useState } from "react"

export const useOpenCandidateModal = () => {
    // const [isOpen, setIsOpen] = useQueryState(
    //     "create-workspace",
    //     parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })

    // )
    const [isOpen, setIsOpen] = useState(false)
    const open = () => setIsOpen(true)
    const close = () => setIsOpen(false)

    return {
        isOpen,
        open,
        close,
        setIsOpen
    }
}
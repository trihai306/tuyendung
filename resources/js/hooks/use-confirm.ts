import { useCallback, useState } from 'react';

interface ConfirmState {
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
}

export function useConfirm() {
    const [state, setState] = useState<ConfirmState>({
        isOpen: false,
        title: '',
        description: '',
        onConfirm: () => {},
    });

    const confirm = useCallback(
        (title: string, description: string, onConfirm: () => void) => {
            setState({ isOpen: true, title, description, onConfirm });
        },
        []
    );

    const handleConfirm = useCallback(() => {
        state.onConfirm();
        setState((prev) => ({ ...prev, isOpen: false }));
    }, [state]);

    const handleCancel = useCallback(() => {
        setState((prev) => ({ ...prev, isOpen: false }));
    }, []);

    return {
        isOpen: state.isOpen,
        title: state.title,
        description: state.description,
        confirm,
        handleConfirm,
        handleCancel,
    };
}

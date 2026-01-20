import React from 'react';
import { useState } from 'react';
import ConfirmDialog from '../components/confirmDialog';
export function useConfirm() {
    const [options, setOptions] = useState(null);

    const confirm = (message, title) =>
        new Promise((resolve) => {
            setOptions({message, title, resolve});
        });

        const handleClose = (result) => {
            options?.resolve(result);
            setOptions(null);
        };

        const ConfirmUI = () => options ?(
            <ConfirmDialog
                open={true}
                title={options.title}
                message = {options.message}
                onClose={handleClose}
            />
        ) : null;
        return {confirm, ConfirmUI};
}
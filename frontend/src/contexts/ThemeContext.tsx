import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { type PaletteMode } from '@mui/material';

interface ColorModeContextType {
    mode: PaletteMode;
    toggleColorMode: () => void;
}

const ColorModeContext = createContext<ColorModeContextType>({
    mode: 'dark',
    toggleColorMode: () => { },
});

export const useColorMode = () => useContext(ColorModeContext);

export const ColorModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mode, setMode] = useState<PaletteMode>(() => {
        const savedMode = localStorage.getItem('colorMode');
        return (savedMode as PaletteMode) || 'dark';
    });

    useEffect(() => {
        localStorage.setItem('colorMode', mode);
        // Update global color-scheme
        document.documentElement.setAttribute('data-theme', mode);
    }, [mode]);

    const colorMode = useMemo(
        () => ({
            mode,
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
            },
        }),
        [mode]
    );

    return (
        <ColorModeContext.Provider value={colorMode}>
            {children}
        </ColorModeContext.Provider>
    );
};

import { createTheme, MantineColorsTuple } from '@mantine/core';

const medievalGold: MantineColorsTuple = [
    '#fff9e1', '#fff2c8', '#ffe49a', '#ffd667', '#ffca3e',
    '#ffc225', '#ffbe18', '#e3a60d', '#ca9206', '#af7c00'
];

export const theme = createTheme({
    colors: {
        medievalGold,
    },
    primaryColor: 'medievalGold',
    components: {
        Paper: {
            defaultProps: {
                bg: 'rgba(26, 27, 30, 0.85)',
                style: {
                    backdropFilter: 'blur(5px)',
                }
            }
        },
        Title: {
            defaultProps: {
                c: 'medievalGold.4',
            },
        },
        Button: {
            defaultProps: {
                color: 'medievalGold',
            },
        },
    },

});
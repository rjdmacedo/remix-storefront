import {createThemeAction} from 'remix-themes';

import {themeSessionResolver} from '~/lib/hydrogen.server';

export const action = createThemeAction(themeSessionResolver);

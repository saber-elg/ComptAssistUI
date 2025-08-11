import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () =>
            import('./pages/auth/auth.module').then(m => m.AuthModule)
    },
    {
        path: '',
        redirectTo: '/auth/login',
        pathMatch: 'full'
    }
];

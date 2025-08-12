import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'welcome',
        loadComponent: () =>
            import('./pages/welcome/welcome.component').then(c => c.WelcomeComponent)
    },
    {
        path: 'auth',
        loadChildren: () =>
            import('./pages/auth/auth.module').then(m => m.AuthModule)
    },
    {
        path: '',
        redirectTo: '/welcome',
        pathMatch: 'full'
    }
];
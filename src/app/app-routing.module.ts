import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { FullLayoutComponent } from './layouts/full-layout/full-layout.component';
import { fullLayoutRoutes } from './shared/routes/full-layout.routes';

const appRoutes: Routes = [
    {
        path: '',
        redirectTo: '/map/main',
        pathMatch: 'full',
    },
    {
        path: '',
        component: FullLayoutComponent,
        children: fullLayoutRoutes
    }
]

@NgModule({
    imports: [
        RouterModule.forRoot(appRoutes, {
            preloadingStrategy: PreloadAllModules,
            useHash: true,
            scrollPositionRestoration: 'enabled'
        })
    ],
    exports: [
        RouterModule
    ]
})

export class AppRoutingModule { }

import { Routes } from '@angular/router'

export const fullLayoutRoutes: Routes = [
    {
        path: 'map',
        loadChildren: () => import('../../pages/map/map.module').then(m => m.MapModule)
    }
]

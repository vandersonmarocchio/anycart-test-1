import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { MainComponent } from './main/main.component'
import { MainResolver } from './main/main.resolver'

const routes: Routes = [
    {
        path: '',
        redirectTo: 'main',
        pathMatch: 'full'
    },
    {
        path: 'main',
        component: MainComponent,
        resolve: {
            data: MainResolver
        }
    },
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
    providers: [
        MainResolver
    ]
})
export class MapRoutingModule { }

import { NgModule } from '@angular/core'
import { SharedModule } from 'src/app/shared/shared.module'
import { MainComponent } from './main/main.component'
import { MapRoutingModule } from './map-routing.module'
@NgModule({
    declarations: [
        MainComponent
    ],
    imports: [
        SharedModule,
        MapRoutingModule
    ]
})
export class MapModule { }

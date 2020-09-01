import { CommonModule } from '@angular/common'
import { HttpClientModule } from '@angular/common/http'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { NextBusService } from './services/next-bus.service'
import { JsonService } from './services/json.service'
import { NzGridModule } from 'ng-zorro-antd/grid'
import { NzCardModule } from 'ng-zorro-antd/card'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox'
import { NzButtonModule } from 'ng-zorro-antd/button'

@NgModule({
    exports: [
        FormsModule,
        CommonModule,
        HttpClientModule,
        NzGridModule,
        NzCardModule,
        NzFormModule,
        NzSelectModule,
        NzCheckboxModule,
        NzButtonModule
    ],
    imports: [
        FormsModule,
        RouterModule,
        CommonModule,
    ],
    declarations: [],
    providers: [
        NextBusService,
        JsonService
    ]
})

export class SharedModule { }

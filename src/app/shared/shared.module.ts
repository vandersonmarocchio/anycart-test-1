import { CommonModule } from '@angular/common'
import { HttpClientModule } from '@angular/common/http'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { NgZorroAntdModule } from 'ng-zorro-antd'
import { NextBusService } from './services/next-bus.service'
import { JsonService } from './services/json.service'

@NgModule({
    exports: [
        FormsModule,
        CommonModule,
        HttpClientModule,
        NgZorroAntdModule,
    ],
    imports: [
        FormsModule,
        RouterModule,
        CommonModule,
    ],
    declarations: [],
    providers: [
        NextBusService,
        JsonService,
    ]
})

export class SharedModule { }

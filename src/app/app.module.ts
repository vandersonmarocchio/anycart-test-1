import { registerLocaleData } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import pt from '@angular/common/locales/pt';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgZorroAntdModule, NZ_I18N, pt_BR } from 'ng-zorro-antd';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { JsonService } from './json.service';
import { NextBusService } from './next-bus.service';

registerLocaleData(pt);
@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserAnimationsModule,
        AppRoutingModule,
        HttpClientModule,
        NgZorroAntdModule,
        BrowserModule,
        FormsModule,
    ],
    providers: [
        { provide: NZ_I18N, useValue: pt_BR },
        NextBusService,
        JsonService,
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }

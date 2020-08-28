import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { JsonService } from './json.service';
import { HttpClientModule } from '@angular/common/http';
import { NextBusService } from './next-bus.service';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule
    ],
    providers: [
        JsonService,
        NextBusService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }

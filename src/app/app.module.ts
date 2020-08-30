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
import { SharedModule } from './shared/shared.module';
import { FullLayoutComponent } from './layouts/full-layout/full-layout.component';

registerLocaleData(pt);
@NgModule({
    declarations: [
        AppComponent,
        FullLayoutComponent
    ],
    imports: [
        BrowserAnimationsModule,
        AppRoutingModule,
        BrowserModule,
        SharedModule,
        FormsModule,
    ],
    providers: [
        { provide: NZ_I18N, useValue: pt_BR },
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }

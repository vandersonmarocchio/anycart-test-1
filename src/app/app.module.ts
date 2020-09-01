import { registerLocaleData } from '@angular/common'
import pt from '@angular/common/locales/pt'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import * as firebase from 'firebase/app'
import { NZ_I18N, pt_BR } from 'ng-zorro-antd'
import { environment } from 'src/environments/environment'
import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { FullLayoutComponent } from './layouts/full-layout/full-layout.component'
import { SharedModule } from './shared/shared.module'

registerLocaleData(pt)
firebase.initializeApp(environment.firebaseConfig)
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

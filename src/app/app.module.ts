import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {ReactiveFormsModule} from "@angular/forms";
import {EasyMdeModule} from "../lib/easy-mde/easy-mde.module";


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    EasyMdeModule.forRoot({
      options: {},
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

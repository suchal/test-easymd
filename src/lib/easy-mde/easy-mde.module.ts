import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import {EasyMdeComponent} from "./components/easy-mde.component";
import {EasyMdeConfig} from "./utils/config";

@NgModule({
  declarations: [
    EasyMdeComponent,
  ],
  imports: [
    CommonModule
  ],
  exports: [
    EasyMdeComponent,
  ]
})
export class EasyMdeModule {
  static forRoot(config?: EasyMdeConfig): ModuleWithProviders<EasyMdeModule> {
    return {
      ngModule: EasyMdeModule,
      providers: [{ provide: EasyMdeConfig, useValue: config }],
    };
  }
}

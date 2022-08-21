import {Component, ViewChild} from '@angular/core';
import {FormControl} from "@angular/forms";
import {EasyMdeComponent} from "../lib/easy-mde/components/easy-mde.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('easymde', { static: true }) private readonly easymde?: EasyMdeComponent;
  title = 'test-quill';
  text = new FormControl('');

  constructor() {

  }
}

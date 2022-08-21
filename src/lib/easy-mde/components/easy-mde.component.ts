import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChange,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

import {map, Subject, Subscription, take} from "rxjs";
import {iconClassMap} from "../utils/easymd-fonts";
import * as EasyMDE from "easymde"
import  {Options, toggleBold} from "easymde"
import {EasyMdeConfig} from "../utils/config";

@Component({
  selector: 'easy-mde',
  template: `<div class="easy-mde"><textarea #easyMarkDownEditor></textarea> </div> `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EasyMdeComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class EasyMdeComponent implements AfterViewInit, OnChanges, OnDestroy, ControlValueAccessor {
  @ViewChild('easyMarkDownEditor') private _elRef?: ElementRef;
  private _value = "";
  private _viewReady$ = new Subject();
  private _instance = this._viewReady$.pipe(
    map(() => this._init())
  );

  private _subscriptions: Subscription[] = [];
  @Input() options: Options = {
    autoDownloadFontAwesome: false,
    toolbar: [
      {
        name: "bold",
        action: toggleBold,
        className: iconClassMap.bold,
        title: "Bold",
      }
    ]
  };
  @Input() disabled = false;

  @Output() onChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() onBlur: EventEmitter<string> = new EventEmitter<string>();

  private _runOnReady(fn: (instance: EasyMDE) => any) {
    this._instance.pipe(
      take(1),
      map((instance) => fn(instance))).subscribe();
  }

  /**
   * Call [setOption](https://codemirror.net/doc/manual.html#setOption) method
   * of Codemirror.
   */
  setOptions(option: string, value: any): void {
    this._runOnReady((instance) =>
      instance.codemirror.setOption(option, value)
    )
  }

  constructor(private _config: EasyMdeConfig, private _zone: NgZone) {
    this.options = {
      ...this.options,
      ...this._config.options,
    }
  }

  registerOnChange(fn: any): void {
    this._runOnReady((instance) =>
      instance.codemirror.on('change', fn)
    );
  }

  registerOnTouched(fn: any): void {
    this._runOnReady((instance) =>
      instance.codemirror.on('blur', fn)
    )
  }

  private _init() {
    const options: Options = {
      ...this.options,
      };

    options.element = this._elRef!.nativeElement;
      const instance = new EasyMDE(options);
      if (this._value) {
        instance.value(this._value);
      }
      instance.codemirror.on('blur', () => {
        this._value = instance.value();
        this._zone.run(() => {
          this.onBlur.emit(this._value);
        });
      });
      instance.codemirror.on('change', () => {
        this._value = this._instance.value();
        this._zone.run(() => {
          this.onChange.emit(this._value);
        });
      });
      this.setDisable();
      return instance;
  }

  private destroy() {
    this._runOnReady((instance) => {
      instance.toTextArea();
    })
  }

  private setDisable() {
    this._runOnReady((instance) => instance.codemirror.options.readOnly = this.disabled )
  }

  ngAfterViewInit() {
    this._viewReady$.next(true);
    this._subscriptions.push(this._viewReady$.subscribe());
  }

  ngOnChanges(changes: { [P in keyof this]?: SimpleChange } & SimpleChanges) {
    if (changes.options && !changes.options.firstChange) this._viewReady$.next(true);
  }

  ngOnDestroy() {
    if(this._subscriptions.length) {
      this._subscriptions.forEach((sub) => sub.unsubscribe());
    }
    this.destroy();
  }

  writeValue(value: string): void {
    this._value = value;
    this._runOnReady((instance) => {
      instance.value(this._value);
    })
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.setDisable();
  }
}

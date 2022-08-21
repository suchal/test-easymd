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
import {
  drawLink,
  Options, toggleBlockquote,
  toggleBold, toggleCodeBlock,
  toggleHeadingBigger,
  toggleHeadingSmaller,
  toggleItalic, toggleOrderedList, togglePreview, toggleSideBySide,
  toggleStrikethrough, toggleUnorderedList
} from "easymde"
import {EasyMdeConfig} from "../utils/config";
import {EditorConfiguration} from "codemirror";

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
  private _instance?: EasyMDE;
  private _value = "";
  private _viewReady$ = new Subject();
  public  _ready$ = this._viewReady$.asObservable().pipe(
    take(1),
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
        },
        {
          name: "italic",
          action: toggleItalic,
          className: iconClassMap.italic,
          title: "Italics",
        },
      {
        name: "strikethrough",
        action: toggleStrikethrough,
        className: iconClassMap.strikethrough,
        title: "Strikethrough",
      },
      '|',
      {
        name: "header-smaller",
        action: toggleHeadingSmaller,
        className: iconClassMap["heading-smaller"],
        title: "Smaller Heading",
      },
      {
        name: "heading-bigger",
        action: toggleHeadingBigger,
        className: iconClassMap["heading-bigger"],
        title: "Heading Bigger",
      },
      {
        name: "code-block",
        action: toggleCodeBlock,
        className: iconClassMap.code,
        title: "code-block",
      },
      '|',
      {
        name: "blockquote",
        action: toggleBlockquote,
        className: iconClassMap.quote,
        title: "Blockquote",
      },
      {
        name: "unordered-list",
        action: toggleUnorderedList,
        className: iconClassMap['unordered-list'],
        title: "Unordered List",
      },
      {
        name: "ordered-list",
        action: toggleOrderedList,
        className: iconClassMap["ordered-list"],
        title: "Ordered List",
      },
      '|',
      {
        name: "link",
        action: drawLink,
        className: iconClassMap["link"],
        title: "Link",
      },
      {
        name: "preview",
        action: togglePreview,
        className: iconClassMap["preview"],
        title: "Preview",
      },
    ]
  };
  @Input() disabled = false;

  @Output() onChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() onBlur: EventEmitter<string> = new EventEmitter<string>();

  get Instance(): EasyMDE|undefined {
    return this._instance;
  }

  private _runOnReady(fn: any) {
    this._ready$.pipe(take(1), map(() => {
      if (this._instance) {
        fn(this._instance)
      }
    })).subscribe();
  }

  /**
   * Call [setOption](https://codemirror.net/doc/manual.html#setOption) method
   * of Codemirror.
   */
  setOptions(option: keyof EditorConfiguration, value: any): void {
    this._runOnReady((instance: EasyMDE) =>
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
    this._runOnReady((instance: EasyMDE) =>
      instance.codemirror.on('change', fn)
    );
  }

  registerOnTouched(fn: any): void {
    this._runOnReady((instance: EasyMDE) =>
      instance.codemirror.on('blur', fn)
    )
  }

  private _init() {
    this.destroy();
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
        this._value = this._instance?.value() ?? '';
        this._zone.run(() => {
          this.onChange.emit(this._value);
        });
      });
      this.setDisable();

  }

  private destroy() {
    if (this._instance) {
      this._instance.toTextArea();
      this._instance = undefined;
    }
  }

  private setDisable() {
    this._zone.runOutsideAngular(() => {
      if (this._instance?.codemirror)
        this._instance?.codemirror?.setOption('readOnly', true)
    });
  }

  ngAfterViewInit() {
    this._init();
    this._viewReady$.next(true);
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
    if (this._instance) {
      this._instance.value(this._value);
    }
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.setDisable();
  }
}

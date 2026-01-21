import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { QueryGroupComponent } from './query-group.component';
import { QueryGroup, createEmptyGroup } from './query-schema.types';

@Component({
  selector: 'app-query-builder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [QueryGroupComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => QueryBuilderComponent),
      multi: true,
    },
  ],
  template: `
    <fieldset class="query-builder-wrapper" [disabled]="disabled()">
      <legend class="sr-only">Query builder</legend>
      <app-query-group
        [group]="group()"
        [depth]="0"
        (groupChange)="onGroupChange($event)"
      />
    </fieldset>
  `,
  styles: `
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    .query-builder-wrapper {
      border: none;
      padding: 0;
      margin: 0;
    }

    .query-builder-wrapper:disabled {
      opacity: 0.6;
      pointer-events: none;
    }
  `,
})
export class QueryBuilderComponent implements ControlValueAccessor {
  protected readonly group = signal<QueryGroup>(createEmptyGroup());
  protected readonly disabled = signal(false);

  private onChange: (value: QueryGroup) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: QueryGroup | null): void {
    this.group.set(value ?? createEmptyGroup());
  }

  registerOnChange(fn: (value: QueryGroup) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected onGroupChange(group: QueryGroup): void {
    this.group.set(group);
    this.onChange(group);
    this.onTouched();
  }
}

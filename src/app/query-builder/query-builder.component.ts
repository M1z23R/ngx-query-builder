import {
  ChangeDetectionStrategy,
  Component,
  model,
} from '@angular/core';
import { QueryGroupComponent } from './query-group.component';
import { QueryGroup, createEmptyGroup } from './query-schema.types';

@Component({
  selector: 'app-query-builder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [QueryGroupComponent],
  template: `
    <fieldset class="query-builder-wrapper" [disabled]="disabled()">
      <legend class="sr-only">Query builder</legend>
      <app-query-group
        [(group)]="value"
        [depth]="0"
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
export class QueryBuilderComponent {
  readonly value = model<QueryGroup>(createEmptyGroup());
  readonly disabled = model(false);
}

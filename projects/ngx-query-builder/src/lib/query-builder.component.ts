import {
  ChangeDetectionStrategy,
  Component,
  contentChild,
  contentChildren,
  input,
  model,
} from '@angular/core';
import { QueryGroupComponent } from './query-group.component';
import { QueryGroup, QuerySchema, createEmptyGroup } from './query-builder.types';
import {
  QbAddButtonsDirective,
  QbConjunctionSelectorDirective,
  QbFieldSelectorDirective,
  QbNegationToggleDirective,
  QbOperatorSelectorDirective,
  QbRemoveButtonDirective,
  QbRemoveGroupButtonDirective,
  QbValueInputDirective,
} from './query-builder.templates';

/**
 * The main Query Builder component.
 *
 * @example
 * // Basic usage
 * const schema = createSchema({
 *   fields: [
 *     { key: 'name', label: 'Name', type: 'text' },
 *     { key: 'age', label: 'Age', type: 'number' },
 *   ]
 * });
 *
 * <qb-query-builder [schema]="schema" [(value)]="query" />
 *
 * @example
 * // With custom templates
 * <qb-query-builder [schema]="schema" [(value)]="query">
 *   <ng-template qbValueInput="text-input" let-value let-onChange="onChange">
 *     <my-custom-input [value]="value" (valueChange)="onChange($event)" />
 *   </ng-template>
 * </qb-query-builder>
 */
@Component({
  selector: 'qb-query-builder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [QueryGroupComponent],
  template: `
    <fieldset class="qb-wrapper" [disabled]="disabled()">
      <legend class="qb-sr-only">Query builder</legend>
      <qb-group
        [(group)]="value"
        [depth]="0"
        [schema]="schema()"
        [fieldSelectorTpl]="fieldSelectorTpl()?.template"
        [operatorSelectorTpl]="operatorSelectorTpl()?.template"
        [valueInputTpls]="valueInputTpls()"
        [removeButtonTpl]="removeButtonTpl()?.template"
        [conjunctionSelectorTpl]="conjunctionSelectorTpl()?.template"
        [negationToggleTpl]="negationToggleTpl()?.template"
        [addButtonsTpl]="addButtonsTpl()?.template"
        [removeGroupButtonTpl]="removeGroupButtonTpl()?.template"
      />
    </fieldset>
  `,
  styles: `
    .qb-sr-only {
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

    .qb-wrapper {
      border: none;
      padding: 0;
      margin: 0;
    }

    .qb-wrapper:disabled {
      opacity: 0.6;
      pointer-events: none;
    }
  `,
})
export class QueryBuilderComponent {
  /** The query value (two-way bindable) */
  readonly value = model<QueryGroup>(createEmptyGroup());

  /** Whether the query builder is disabled */
  readonly disabled = model(false);

  /** The schema defining fields and operators (required) */
  readonly schema = input.required<QuerySchema>();

  // Content queries for custom templates - condition level
  readonly fieldSelectorTpl = contentChild(QbFieldSelectorDirective);
  readonly operatorSelectorTpl = contentChild(QbOperatorSelectorDirective);
  readonly valueInputTpls = contentChildren(QbValueInputDirective);
  readonly removeButtonTpl = contentChild(QbRemoveButtonDirective);

  // Content queries for custom templates - group level
  readonly conjunctionSelectorTpl = contentChild(QbConjunctionSelectorDirective);
  readonly negationToggleTpl = contentChild(QbNegationToggleDirective);
  readonly addButtonsTpl = contentChild(QbAddButtonsDirective);
  readonly removeGroupButtonTpl = contentChild(QbRemoveGroupButtonDirective);
}

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
  TemplateRef,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
  FieldDef,
  FieldOption,
  INPUT_TYPES,
  InputType,
  OperatorDef,
  OperatorKey,
  QueryCondition,
  QuerySchema,
} from './query-builder.types';
import {
  FieldSelectorContext,
  OperatorSelectorContext,
  QbValueInputDirective,
  RemoveButtonContext,
  ValueInputContext,
} from './query-builder.templates';

@Component({
  selector: 'qb-condition',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  template: `
    <div class="qb-condition-row">
      <div class="qb-field-group">
        <label [for]="'qb-field-' + index()">Field</label>
        @if (fieldSelectorTpl(); as tpl) {
          <ng-container
            [ngTemplateOutlet]="tpl"
            [ngTemplateOutletContext]="fieldSelectorContext()"
          />
        } @else {
          <select
            [id]="'qb-field-' + index()"
            [value]="condition().field ?? ''"
            (change)="onFieldChange($event)"
          >
            <option value="">Select a field</option>
            @for (field of schema().fields; track field.key) {
              <option [value]="field.key">{{ field.label }}</option>
            }
          </select>
        }
      </div>

      @if (selectedField()) {
        <div class="qb-field-group">
          <label [for]="'qb-operator-' + index()">Operator</label>
          @if (operatorSelectorTpl(); as tpl) {
            <ng-container
              [ngTemplateOutlet]="tpl"
              [ngTemplateOutletContext]="operatorSelectorContext()"
            />
          } @else {
            <select
              [id]="'qb-operator-' + index()"
              [value]="condition().operator ?? ''"
              (change)="onOperatorChange($event)"
            >
              <option value="">Select an operator</option>
              @for (op of availableOperators(); track op[0]) {
                <option [value]="op[0]">{{ op[1].label }}</option>
              }
            </select>
          }
        </div>
      }

      @if (resolvedInputType(); as inputType) {
        <div class="qb-field-group">
          <label [for]="'qb-value-' + index()">Value</label>
          @if (valueInputTpl(); as tpl) {
            <ng-container
              [ngTemplateOutlet]="tpl"
              [ngTemplateOutletContext]="valueInputContext()"
            />
          } @else {
            @switch (inputType) {
              @case (INPUT_TYPES.TEXT) {
                <input
                  type="text"
                  [id]="'qb-value-' + index()"
                  [value]="condition().value ?? ''"
                  [placeholder]="placeholder()"
                  (input)="onTextInput($event)"
                />
              }
              @case (INPUT_TYPES.NUMBER) {
                <input
                  type="number"
                  [id]="'qb-value-' + index()"
                  [value]="condition().value ?? ''"
                  (input)="onNumberInput($event)"
                />
              }
              @case (INPUT_TYPES.DATE) {
                <input
                  type="date"
                  [id]="'qb-value-' + index()"
                  [value]="condition().value ?? ''"
                  (input)="onTextInput($event)"
                />
              }
              @case (INPUT_TYPES.BOOLEAN) {
                <input
                  type="checkbox"
                  [id]="'qb-value-' + index()"
                  [checked]="condition().value === true"
                  [disabled]="true"
                  [attr.aria-describedby]="'qb-bool-hint-' + index()"
                />
                <span [id]="'qb-bool-hint-' + index()" class="qb-hint">
                  Always true
                </span>
              }
              @case (INPUT_TYPES.SELECT) {
                <select
                  [id]="'qb-value-' + index()"
                  [value]="condition().value ?? ''"
                  (change)="onSelectChange($event)"
                >
                  <option value="">Select a value</option>
                  @for (opt of fieldOptions(); track opt.value) {
                    <option [value]="opt.value">{{ opt.label }}</option>
                  }
                </select>
              }
              @case (INPUT_TYPES.MULTI_SELECT) {
                <select
                  [id]="'qb-value-' + index()"
                  multiple
                  [attr.aria-describedby]="'qb-multi-hint-' + index()"
                  (change)="onMultiSelectChange($event)"
                >
                  @for (opt of fieldOptions(); track opt.value) {
                    <option
                      [value]="opt.value"
                      [selected]="isOptionSelected(opt.value)"
                    >
                      {{ opt.label }}
                    </option>
                  }
                </select>
                <span [id]="'qb-multi-hint-' + index()" class="qb-hint">
                  Hold Ctrl/Cmd to select multiple
                </span>
              }
            }
          }
        </div>
      }

      @if (removeButtonTpl(); as tpl) {
        <ng-container
          [ngTemplateOutlet]="tpl"
          [ngTemplateOutletContext]="removeButtonContext()"
        />
      } @else {
        <button
          type="button"
          class="qb-remove-btn"
          [attr.aria-label]="'Remove condition ' + (index() + 1)"
          (click)="remove.emit()"
        >
          &times;
        </button>
      }
    </div>
  `,
  styles: `
    .qb-condition-row {
      display: flex;
      gap: 0.75rem;
      align-items: flex-end;
      flex-wrap: wrap;
    }

    .qb-field-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .qb-field-group label {
      font-size: 0.75rem;
      font-weight: 500;
      color: #555;
    }

    .qb-field-group select,
    .qb-field-group input {
      padding: 0.5rem 0.75rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 0.875rem;
      min-width: 150px;
    }

    .qb-field-group select:focus,
    .qb-field-group input:focus {
      outline: 2px solid #0066cc;
      outline-offset: 1px;
      border-color: #0066cc;
    }

    .qb-hint {
      font-size: 0.7rem;
      color: #666;
    }

    .qb-remove-btn {
      padding: 0.5rem 0.75rem;
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      line-height: 1;
    }

    .qb-remove-btn:hover {
      background: #c82333;
    }

    .qb-remove-btn:focus {
      outline: 2px solid #0066cc;
      outline-offset: 1px;
    }
  `,
})
export class QueryConditionComponent {
  protected readonly INPUT_TYPES = INPUT_TYPES;

  readonly condition = model.required<QueryCondition>();
  readonly index = input.required<number>();
  readonly schema = input.required<QuerySchema>();

  // Template inputs
  readonly fieldSelectorTpl = input<TemplateRef<FieldSelectorContext>>();
  readonly operatorSelectorTpl = input<TemplateRef<OperatorSelectorContext>>();
  readonly valueInputTpls = input<readonly QbValueInputDirective[]>([]);
  readonly removeButtonTpl = input<TemplateRef<RemoveButtonContext>>();

  readonly remove = output<void>();

  protected readonly selectedField = computed<FieldDef | undefined>(() => {
    const key = this.condition().field;
    return key ? this.schema().getFieldByKey(key) : undefined;
  });

  protected readonly selectedOperator = computed<OperatorDef | undefined>(() => {
    const key = this.condition().operator;
    return key ? this.schema().getOperatorByKey(key) : undefined;
  });

  protected readonly availableOperators = computed(() => {
    const field = this.selectedField();
    return field ? this.schema().getOperatorsForField(field) : [];
  });

  protected readonly resolvedInputType = computed<InputType | null>(() => {
    const field = this.selectedField();
    const operator = this.selectedOperator();
    const operatorKey = this.condition().operator;
    if (!field || !operator) {
      return null;
    }
    return this.schema().resolveValueInput(field, operator, operatorKey ?? undefined);
  });

  protected readonly fieldOptions = computed<readonly FieldOption[]>(() => {
    const field = this.selectedField();
    return field?.options ?? [];
  });

  protected readonly valueInputTpl = computed(() => {
    const inputType = this.resolvedInputType();
    if (!inputType) return null;
    return this.valueInputTpls().find(d => d.qbValueInput() === inputType)?.template ?? null;
  });

  protected readonly placeholder = computed<string>(() => {
    const operatorKey = this.condition().operator;
    const field = this.selectedField();
    if (operatorKey === 'in' || operatorKey === 'nin') {
      return field?.type === 'number' ? 'e.g. 1, 2, 3' : 'e.g. value1, value2';
    }
    if (operatorKey === 'contains') return 'Search text...';
    if (operatorKey === 'starts_with') return 'Starts with...';
    if (operatorKey === 'ends_with') return 'Ends with...';
    return '';
  });

  protected readonly fieldSelectorContext = computed<FieldSelectorContext>(() => ({
    $implicit: this.condition().field,
    fields: this.schema().fields,
    onChange: (key: string | null) => this.onFieldKeyChange(key),
  }));

  protected readonly operatorSelectorContext = computed<OperatorSelectorContext>(() => ({
    $implicit: this.condition().operator,
    operators: this.availableOperators(),
    onChange: (key: OperatorKey | null) => this.onOperatorKeyChange(key),
  }));

  protected readonly valueInputContext = computed<ValueInputContext>(() => ({
    $implicit: this.condition().value,
    inputType: this.resolvedInputType() ?? '',
    field: this.selectedField()!,
    operator: this.selectedOperator()!,
    operatorKey: this.condition().operator,
    options: this.fieldOptions(),
    placeholder: this.placeholder(),
    onChange: (value: unknown) => this.onValueChange(value),
  }));

  protected readonly removeButtonContext = computed<RemoveButtonContext>(() => ({
    $implicit: undefined,
    onRemove: () => this.remove.emit(),
  }));

  protected onFieldChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.condition.set({
      type: 'condition',
      field: value || null,
      operator: null,
      value: null,
    });
  }

  protected onOperatorChange(event: Event): void {
    const operatorKey = (event.target as HTMLSelectElement).value || null;
    const field = this.selectedField();
    let defaultValue: unknown = null;

    if (field?.type === 'bool') {
      defaultValue = true;
    } else if (operatorKey) {
      const operator = this.schema().getOperatorByKey(operatorKey);
      const inputType = field ? this.schema().resolveValueInput(field, operator) : null;
      if (inputType === INPUT_TYPES.MULTI_SELECT) {
        defaultValue = [];
      }
    }

    this.condition.update(c => ({
      ...c,
      operator: operatorKey as OperatorKey | null,
      value: defaultValue,
    }));
  }

  protected onTextInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.condition.update(c => ({ ...c, value }));
  }

  protected onNumberInput(event: Event): void {
    const stringValue = (event.target as HTMLInputElement).value;
    const value = stringValue === '' ? null : Number(stringValue);
    this.condition.update(c => ({ ...c, value }));
  }

  protected onSelectChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value || null;
    this.condition.update(c => ({ ...c, value }));
  }

  protected onMultiSelectChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = Array.from(select.selectedOptions).map(opt => opt.value);
    this.condition.update(c => ({ ...c, value }));
  }

  protected isOptionSelected(optionValue: string): boolean {
    const value = this.condition().value;
    return Array.isArray(value) && value.includes(optionValue);
  }

  protected onFieldKeyChange(key: string | null): void {
    this.condition.set({
      type: 'condition',
      field: key,
      operator: null,
      value: null,
    });
  }

  protected onOperatorKeyChange(operatorKey: OperatorKey | null): void {
    const field = this.selectedField();
    let defaultValue: unknown = null;

    if (field?.type === 'bool') {
      defaultValue = true;
    } else if (operatorKey) {
      const operator = this.schema().getOperatorByKey(operatorKey);
      const inputType = field ? this.schema().resolveValueInput(field, operator) : null;
      if (inputType === INPUT_TYPES.MULTI_SELECT) {
        defaultValue = [];
      }
    }

    this.condition.update(c => ({
      ...c,
      operator: operatorKey,
      value: defaultValue,
    }));
  }

  protected onValueChange(value: unknown): void {
    this.condition.update(c => ({ ...c, value }));
  }
}

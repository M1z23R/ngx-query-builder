import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { QUERY_SCHEMA } from './query-schema.token';
import {
  FieldDef,
  FieldOption,
  INPUT_TYPES,
  InputType,
  OperatorDef,
  OperatorKey,
  QueryCondition,
} from './query-schema.types';

@Component({
  selector: 'app-query-condition',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="condition-row">
      <div class="field-group">
        <label [for]="'field-' + index()">Field</label>
        <select
          [id]="'field-' + index()"
          [value]="condition().field ?? ''"
          (change)="onFieldChange($event)"
        >
          <option value="">Select a field</option>
          @for (field of schema.fields; track field.key) {
            <option [value]="field.key">{{ field.label }}</option>
          }
        </select>
      </div>

      @if (selectedField()) {
        <div class="field-group">
          <label [for]="'operator-' + index()">Operator</label>
          <select
            [id]="'operator-' + index()"
            [value]="condition().operator ?? ''"
            (change)="onOperatorChange($event)"
          >
            <option value="">Select an operator</option>
            @for (op of availableOperators(); track op[0]) {
              <option [value]="op[0]">{{ op[1].label }}</option>
            }
          </select>
        </div>
      }

      @if (resolvedInputType(); as inputType) {
        <div class="field-group">
          <label [for]="'value-' + index()">Value</label>
          @switch (inputType) {
            @case (INPUT_TYPES.TEXT) {
              <input
                type="text"
                [id]="'value-' + index()"
                [value]="condition().value ?? ''"
                (input)="onTextInput($event)"
              />
            }
            @case (INPUT_TYPES.NUMBER) {
              <input
                type="number"
                [id]="'value-' + index()"
                [value]="condition().value ?? ''"
                (input)="onNumberInput($event)"
              />
            }
            @case (INPUT_TYPES.DATE) {
              <input
                type="date"
                [id]="'value-' + index()"
                [value]="condition().value ?? ''"
                (input)="onTextInput($event)"
              />
            }
            @case (INPUT_TYPES.BOOLEAN) {
              <input
                type="checkbox"
                [id]="'value-' + index()"
                [checked]="condition().value === true"
                [disabled]="true"
                [attr.aria-describedby]="'bool-hint-' + index()"
              />
              <span [id]="'bool-hint-' + index()" class="hint">
                Always true
              </span>
            }
            @case (INPUT_TYPES.SELECT) {
              <select
                [id]="'value-' + index()"
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
                [id]="'value-' + index()"
                multiple
                [attr.aria-describedby]="'multi-hint-' + index()"
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
              <span [id]="'multi-hint-' + index()" class="hint">
                Hold Ctrl/Cmd to select multiple
              </span>
            }
          }
        </div>
      }

      <button
        type="button"
        class="remove-btn"
        [attr.aria-label]="'Remove condition ' + (index() + 1)"
        (click)="remove.emit()"
      >
        &times;
      </button>
    </div>
  `,
  styles: `
    .condition-row {
      display: flex;
      gap: 0.75rem;
      align-items: flex-end;
      flex-wrap: wrap;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .field-group label {
      font-size: 0.75rem;
      font-weight: 500;
      color: #555;
    }

    .field-group select,
    .field-group input {
      padding: 0.5rem 0.75rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 0.875rem;
      min-width: 150px;
    }

    .field-group select:focus,
    .field-group input:focus {
      outline: 2px solid #0066cc;
      outline-offset: 1px;
      border-color: #0066cc;
    }

    .hint {
      font-size: 0.7rem;
      color: #666;
    }

    .remove-btn {
      padding: 0.5rem 0.75rem;
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      line-height: 1;
    }

    .remove-btn:hover {
      background: #c82333;
    }

    .remove-btn:focus {
      outline: 2px solid #0066cc;
      outline-offset: 1px;
    }
  `,
})
export class QueryConditionComponent {
  protected readonly schema = inject(QUERY_SCHEMA);
  protected readonly INPUT_TYPES = INPUT_TYPES;

  readonly condition = model.required<QueryCondition>();
  readonly index = input.required<number>();

  readonly remove = output<void>();

  protected readonly selectedField = computed<FieldDef | undefined>(() => {
    const key = this.condition().field;
    return key ? this.schema.getFieldByKey(key) : undefined;
  });

  protected readonly selectedOperator = computed<OperatorDef | undefined>(() => {
    const key = this.condition().operator;
    return key ? this.schema.getOperatorByKey(key) : undefined;
  });

  protected readonly availableOperators = computed(() => {
    const field = this.selectedField();
    return field ? this.schema.getOperatorsForField(field) : [];
  });

  protected readonly resolvedInputType = computed<InputType | null>(() => {
    const field = this.selectedField();
    const operator = this.selectedOperator();
    if (!field || !operator) {
      return null;
    }
    return this.schema.resolveValueInput(field, operator);
  });

  protected readonly fieldOptions = computed<readonly FieldOption[]>(() => {
    const field = this.selectedField();
    return field?.options ?? [];
  });

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
      const operator = this.schema.getOperatorByKey(operatorKey);
      const inputType = field ? this.schema.resolveValueInput(field, operator) : null;
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
}

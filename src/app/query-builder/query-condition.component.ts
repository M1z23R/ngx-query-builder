import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QuerySchemaService } from './query-schema.service';
import {
  FieldDef,
  FieldOption,
  InputType,
  OperatorDef,
  OperatorKey,
  QueryCondition,
} from './query-schema.types';

@Component({
  selector: 'app-query-condition',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="condition-row">
      <div class="field-group">
        <label [for]="'field-' + index()">Field</label>
        <select
          [id]="'field-' + index()"
          [ngModel]="condition().field"
          (ngModelChange)="onFieldChange($event)"
        >
          <option [ngValue]="null">Select a field</option>
          @for (field of schema.fields; track field.key) {
            <option [ngValue]="field.key">{{ field.label }}</option>
          }
        </select>
      </div>

      @if (selectedField()) {
        <div class="field-group">
          <label [for]="'operator-' + index()">Operator</label>
          <select
            [id]="'operator-' + index()"
            [ngModel]="condition().operator"
            (ngModelChange)="onOperatorChange($event)"
          >
            <option [ngValue]="null">Select an operator</option>
            @for (op of availableOperators(); track op[0]) {
              <option [ngValue]="op[0]">{{ op[1].label }}</option>
            }
          </select>
        </div>
      }

      @if (resolvedInputType(); as inputType) {
        <div class="field-group">
          <label [for]="'value-' + index()">Value</label>
          @switch (inputType) {
            @case ('text-input') {
              <input
                type="text"
                [id]="'value-' + index()"
                [ngModel]="condition().value"
                (ngModelChange)="onValueChange($event)"
              />
            }
            @case ('number-input') {
              <input
                type="number"
                [id]="'value-' + index()"
                [ngModel]="condition().value"
                (ngModelChange)="onValueChange($event)"
              />
            }
            @case ('date-picker') {
              <input
                type="date"
                [id]="'value-' + index()"
                [ngModel]="condition().value"
                (ngModelChange)="onValueChange($event)"
              />
            }
            @case ('boolean-toggle') {
              <input
                type="checkbox"
                [id]="'value-' + index()"
                [ngModel]="condition().value"
                (ngModelChange)="onValueChange($event)"
                [disabled]="true"
                aria-describedby="bool-hint-{{ index() }}"
              />
              <span [id]="'bool-hint-' + index()" class="hint">
                Always true
              </span>
            }
            @case ('select') {
              <select
                [id]="'value-' + index()"
                [ngModel]="condition().value"
                (ngModelChange)="onValueChange($event)"
              >
                <option [ngValue]="null">Select a value</option>
                @for (opt of fieldOptions(); track opt.value) {
                  <option [ngValue]="opt.value">{{ opt.label }}</option>
                }
              </select>
            }
            @case ('multi-select') {
              <select
                [id]="'value-' + index()"
                multiple
                [ngModel]="condition().value"
                (ngModelChange)="onValueChange($event)"
                [attr.aria-describedby]="'multi-hint-' + index()"
              >
                @for (opt of fieldOptions(); track opt.value) {
                  <option [ngValue]="opt.value">{{ opt.label }}</option>
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
  protected readonly schema = inject(QuerySchemaService);

  readonly condition = input.required<QueryCondition>();
  readonly index = input.required<number>();

  readonly conditionChange = output<QueryCondition>();
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

  protected onFieldChange(fieldKey: string | null): void {
    this.conditionChange.emit({
      type: 'condition',
      field: fieldKey,
      operator: null,
      value: null,
    });
  }

  protected onOperatorChange(operatorKey: OperatorKey | null): void {
    const field = this.selectedField();
    let defaultValue: unknown = null;

    if (field?.type === 'bool') {
      defaultValue = true;
    } else if (operatorKey) {
      const operator = this.schema.getOperatorByKey(operatorKey);
      const inputType = field ? this.schema.resolveValueInput(field, operator) : null;
      if (inputType === 'multi-select') {
        defaultValue = [];
      }
    }

    this.conditionChange.emit({
      ...this.condition(),
      operator: operatorKey,
      value: defaultValue,
    });
  }

  protected onValueChange(value: unknown): void {
    this.conditionChange.emit({
      ...this.condition(),
      value,
    });
  }
}

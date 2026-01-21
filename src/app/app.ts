import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';

// Import from library
import {
  QueryBuilderComponent,
  QbFieldSelectorDirective,
  QbOperatorSelectorDirective,
  QbValueInputDirective,
  createSchema,
  createEmptyGroup,
  OPERATORS,
  QueryGroup,
  QuerySchema,
  FieldDef,
  OperatorDef,
  OperatorKey,
} from '../lib';

// ============================================================================
// Demo: Custom Schema with "between" operator
// ============================================================================

const CUSTOM_INPUT_TYPES = {
  NUMBER_RANGE: 'number-range',
  DATE_RANGE: 'date-range',
} as const;

const productSchema = createSchema({
  fields: [
    { key: 'product_name', label: 'Product Name', type: 'text' },
    { key: 'price', label: 'Price ($)', type: 'number' },
    { key: 'in_stock', label: 'In Stock', type: 'bool' },
    { key: 'release_date', label: 'Release Date', type: 'date', nullable: true },
    {
      key: 'category',
      label: 'Category',
      type: 'text',
      options: [
        { value: 'electronics', label: 'Electronics' },
        { value: 'clothing', label: 'Clothing' },
        { value: 'food', label: 'Food & Beverages' },
      ],
    },
  ],
  operators: {
    ...OPERATORS,
    between: { label: 'between', supportedTypes: ['number', 'date'], valueKind: 'multi' },
  },
  resolveValueInput: (field, _operator, operatorKey) => {
    if (operatorKey === 'between') {
      return field.type === 'date' ? CUSTOM_INPUT_TYPES.DATE_RANGE : CUSTOM_INPUT_TYPES.NUMBER_RANGE;
    }
    return null; // fall back to default
  },
});

// Simple default schema for the first demo
const simpleSchema = createSchema({
  fields: [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'email', label: 'Email', type: 'text', nullable: true },
    { key: 'age', label: 'Age', type: 'number', nullable: true },
    { key: 'created_at', label: 'Created At', type: 'date', nullable: true },
    {
      key: 'status',
      label: 'Status',
      type: 'text',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' },
      ],
    },
  ],
});

// ============================================================================
// Demo: Custom Input Components
// ============================================================================

@Component({
  selector: 'app-custom-text-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <input
      type="text"
      class="custom-text-input"
      [value]="value() ?? ''"
      (input)="onInput($event)"
      placeholder="Custom text..."
    />
  `,
  styles: `
    .custom-text-input {
      padding: 0.5rem 0.75rem;
      border: 2px solid #9333ea;
      border-radius: 4px;
      font-size: 0.875rem;
      min-width: 150px;
      background: #faf5ff;
    }
    .custom-text-input:focus {
      outline: 2px solid #9333ea;
      outline-offset: 1px;
      border-color: #7e22ce;
    }
  `,
})
export class CustomTextInputComponent {
  readonly value = input<unknown>();
  readonly valueChange = output<unknown>();

  protected onInput(event: Event): void {
    this.valueChange.emit((event.target as HTMLInputElement).value);
  }
}

@Component({
  selector: 'app-custom-date-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <input
      type="date"
      class="custom-date-input"
      [value]="value() ?? ''"
      (input)="onInput($event)"
    />
  `,
  styles: `
    .custom-date-input {
      padding: 0.5rem 0.75rem;
      border: 2px solid #059669;
      border-radius: 4px;
      font-size: 0.875rem;
      min-width: 150px;
      background: #ecfdf5;
    }
    .custom-date-input:focus {
      outline: 2px solid #059669;
      outline-offset: 1px;
      border-color: #047857;
    }
  `,
})
export class CustomDateInputComponent {
  readonly value = input<unknown>();
  readonly valueChange = output<unknown>();

  protected onInput(event: Event): void {
    this.valueChange.emit((event.target as HTMLInputElement).value);
  }
}

@Component({
  selector: 'app-custom-number-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <input
      type="number"
      class="custom-number-input"
      [value]="value() ?? ''"
      (input)="onInput($event)"
      placeholder="0"
    />
  `,
  styles: `
    .custom-number-input {
      padding: 0.5rem 0.75rem;
      border: 2px solid #dc2626;
      border-radius: 4px;
      font-size: 0.875rem;
      min-width: 150px;
      background: #fef2f2;
    }
    .custom-number-input:focus {
      outline: 2px solid #dc2626;
      outline-offset: 1px;
      border-color: #b91c1c;
    }
  `,
})
export class CustomNumberInputComponent {
  readonly value = input<unknown>();
  readonly valueChange = output<unknown>();

  protected onInput(event: Event): void {
    const str = (event.target as HTMLInputElement).value;
    this.valueChange.emit(str === '' ? null : Number(str));
  }
}

@Component({
  selector: 'app-custom-field-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <select class="field-select" [value]="value() ?? ''" (change)="onChange($event)">
      <option value="">-- Pick a field --</option>
      @for (field of fields(); track field.key) {
        <option [value]="field.key">{{ field.label }}</option>
      }
    </select>
  `,
  styles: `
    .field-select {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 20px;
      font-size: 0.875rem;
      min-width: 150px;
      background: #3b82f6;
      color: white;
      font-weight: 500;
      cursor: pointer;
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 8px center;
      background-size: 20px;
      padding-right: 32px;
    }
    .field-select:focus { outline: 2px solid #1d4ed8; outline-offset: 2px; }
    .field-select:hover { background-color: #2563eb; }
    .field-select option { background: white; color: #333; }
  `,
})
export class CustomFieldSelectComponent {
  readonly value = input<string | null>();
  readonly fields = input<readonly FieldDef[]>([]);
  readonly valueChange = output<string | null>();

  protected onChange(event: Event): void {
    this.valueChange.emit((event.target as HTMLSelectElement).value || null);
  }
}

@Component({
  selector: 'app-custom-operator-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <select class="operator-select" [value]="value() ?? ''" (change)="onChange($event)">
      <option value="">-- Pick operator --</option>
      @for (op of operators(); track op[0]) {
        <option [value]="op[0]">{{ op[1].label }}</option>
      }
    </select>
  `,
  styles: `
    .operator-select {
      padding: 0.5rem 1rem;
      border: 2px solid #f97316;
      border-radius: 4px;
      font-size: 0.875rem;
      min-width: 140px;
      background: white;
      color: #ea580c;
      font-weight: 600;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .operator-select:focus { outline: 2px solid #f97316; outline-offset: 1px; background: #fff7ed; }
    .operator-select:hover { background: #fff7ed; }
    .operator-select option { text-transform: none; font-weight: normal; color: #333; }
  `,
})
export class CustomOperatorSelectComponent {
  readonly value = input<OperatorKey | null>();
  readonly operators = input<[OperatorKey, OperatorDef][]>([]);
  readonly valueChange = output<OperatorKey | null>();

  protected onChange(event: Event): void {
    this.valueChange.emit((event.target as HTMLSelectElement).value || null);
  }
}

@Component({
  selector: 'app-number-range-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="range-container">
      <input type="number" class="range-input" placeholder="Min" [value]="minValue()" (input)="onMinChange($event)" />
      <span class="range-separator">to</span>
      <input type="number" class="range-input" placeholder="Max" [value]="maxValue()" (input)="onMaxChange($event)" />
    </div>
  `,
  styles: `
    .range-container { display: flex; align-items: center; gap: 0.5rem; }
    .range-input {
      padding: 0.5rem 0.75rem;
      border: 2px solid #8b5cf6;
      border-radius: 4px;
      font-size: 0.875rem;
      width: 100px;
      background: #faf5ff;
    }
    .range-input:focus { outline: 2px solid #8b5cf6; outline-offset: 1px; }
    .range-separator { color: #666; font-size: 0.875rem; }
  `,
})
export class NumberRangeInputComponent {
  readonly value = input<unknown>();
  readonly valueChange = output<unknown>();

  protected minValue = computed(() => {
    const val = this.value();
    return Array.isArray(val) && val[0] != null ? val[0] : '';
  });

  protected maxValue = computed(() => {
    const val = this.value();
    return Array.isArray(val) && val[1] != null ? val[1] : '';
  });

  protected onMinChange(event: Event): void {
    const min = (event.target as HTMLInputElement).value;
    const current = this.value();
    const max = Array.isArray(current) ? current[1] : null;
    this.valueChange.emit([min === '' ? null : Number(min), max]);
  }

  protected onMaxChange(event: Event): void {
    const max = (event.target as HTMLInputElement).value;
    const current = this.value();
    const min = Array.isArray(current) ? current[0] : null;
    this.valueChange.emit([min, max === '' ? null : Number(max)]);
  }
}

@Component({
  selector: 'app-date-range-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="range-container">
      <input type="date" class="range-input" [value]="minValue()" (input)="onMinChange($event)" />
      <span class="range-separator">to</span>
      <input type="date" class="range-input" [value]="maxValue()" (input)="onMaxChange($event)" />
    </div>
  `,
  styles: `
    .range-container { display: flex; align-items: center; gap: 0.5rem; }
    .range-input {
      padding: 0.5rem 0.75rem;
      border: 2px solid #0891b2;
      border-radius: 4px;
      font-size: 0.875rem;
      background: #ecfeff;
    }
    .range-input:focus { outline: 2px solid #0891b2; outline-offset: 1px; }
    .range-separator { color: #666; font-size: 0.875rem; }
  `,
})
export class DateRangeInputComponent {
  readonly value = input<unknown>();
  readonly valueChange = output<unknown>();

  protected minValue = computed(() => {
    const val = this.value();
    return Array.isArray(val) && val[0] != null ? val[0] : '';
  });

  protected maxValue = computed(() => {
    const val = this.value();
    return Array.isArray(val) && val[1] != null ? val[1] : '';
  });

  protected onMinChange(event: Event): void {
    const min = (event.target as HTMLInputElement).value || null;
    const current = this.value();
    const max = Array.isArray(current) ? current[1] : null;
    this.valueChange.emit([min, max]);
  }

  protected onMaxChange(event: Event): void {
    const max = (event.target as HTMLInputElement).value || null;
    const current = this.value();
    const min = Array.isArray(current) ? current[0] : null;
    this.valueChange.emit([min, max]);
  }
}

// ============================================================================
// Demo App
// ============================================================================

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    JsonPipe,
    QueryBuilderComponent,
    QbFieldSelectorDirective,
    QbOperatorSelectorDirective,
    QbValueInputDirective,
    CustomTextInputComponent,
    CustomDateInputComponent,
    CustomNumberInputComponent,
    CustomFieldSelectComponent,
    CustomOperatorSelectComponent,
    NumberRangeInputComponent,
    DateRangeInputComponent,
  ],
  template: `
    <main>
      <h1>Query Builder Demo</h1>

      <section aria-labelledby="demo-heading">
        <h2 id="demo-heading">Custom Templates Demo</h2>
        <p class="schema-note">Custom field selector (blue pill), operator (orange), and value inputs (colored)</p>
        <qb-query-builder [schema]="simpleSchema" [(value)]="query">
          <ng-template qbFieldSelector let-value let-fields="fields" let-onChange="onChange">
            <app-custom-field-select [value]="value" [fields]="fields" (valueChange)="onChange($event)" />
          </ng-template>

          <ng-template qbOperatorSelector let-value let-operators="operators" let-onChange="onChange">
            <app-custom-operator-select [value]="value" [operators]="operators" (valueChange)="onChange($event)" />
          </ng-template>

          <ng-template qbValueInput="text-input" let-value let-onChange="onChange">
            <app-custom-text-input [value]="value" (valueChange)="onChange($event)" />
          </ng-template>

          <ng-template qbValueInput="date-picker" let-value let-onChange="onChange">
            <app-custom-date-input [value]="value" (valueChange)="onChange($event)" />
          </ng-template>

          <ng-template qbValueInput="number-input" let-value let-onChange="onChange">
            <app-custom-number-input [value]="value" (valueChange)="onChange($event)" />
          </ng-template>
        </qb-query-builder>
      </section>

      <section aria-labelledby="output-heading">
        <h2 id="output-heading">Output</h2>
        <pre><code>{{ query() | json }}</code></pre>
      </section>

      <hr />

      <section aria-labelledby="products-heading">
        <h2 id="products-heading">Products Query (Custom Schema + "between" Operator)</h2>
        <p class="schema-note">Custom fields, custom "between" operator with range inputs</p>
        <qb-query-builder [schema]="productSchema" [(value)]="productQuery">
          <ng-template qbValueInput="number-range" let-value let-onChange="onChange">
            <app-number-range-input [value]="value" (valueChange)="onChange($event)" />
          </ng-template>

          <ng-template qbValueInput="date-range" let-value let-onChange="onChange">
            <app-date-range-input [value]="value" (valueChange)="onChange($event)" />
          </ng-template>
        </qb-query-builder>
      </section>

      <section aria-labelledby="products-output-heading">
        <h2 id="products-output-heading">Output</h2>
        <pre><code>{{ productQuery() | json }}</code></pre>
      </section>
    </main>
  `,
  styles: `
    main {
      max-width: 900px;
      margin: 2rem auto;
      padding: 1rem;
      font-family: system-ui, sans-serif;
    }
    h1 { margin-bottom: 2rem; }
    section { margin-bottom: 2rem; }
    h2 { font-size: 1.25rem; margin-bottom: 1rem; }
    hr { margin: 2rem 0; border: none; border-top: 2px dashed #ccc; }
    .schema-note { font-size: 0.875rem; color: #666; margin-bottom: 1rem; }
    pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; }
  `,
})
export class App {
  protected readonly simpleSchema = simpleSchema;
  protected readonly productSchema = productSchema;
  protected readonly query = signal<QueryGroup>(createEmptyGroup());
  protected readonly productQuery = signal<QueryGroup>(createEmptyGroup());
}

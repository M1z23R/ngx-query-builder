import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';

// Import from library
import {
  QueryBuilderComponent,
  // Condition-level directives
  QbFieldSelectorDirective,
  QbOperatorSelectorDirective,
  QbValueInputDirective,
  QbRemoveButtonDirective,
  // Group-level directives
  QbConjunctionSelectorDirective,
  QbNegationToggleDirective,
  QbAddButtonsDirective,
  QbRemoveGroupButtonDirective,
  // Utilities & types
  createSchema,
  createEmptyGroup,
  OPERATORS,
  QueryGroup,
  Conjunction,
  FieldDef,
  OperatorDef,
  OperatorKey,
} from '../lib';

// ============================================================================
// Demo Schema
// ============================================================================

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
  operators: {
    ...OPERATORS,
    between: { label: 'between', supportedTypes: ['number', 'date'], valueKind: 'multi' },
  },
  resolveValueInput: (field, _operator, operatorKey) => {
    if (operatorKey === 'between') {
      return field.type === 'date' ? 'date-range' : 'number-range';
    }
    return null; // use default
  },
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
    .field-select:focus {
      outline: 2px solid #1d4ed8;
      outline-offset: 2px;
    }
    .field-select:hover {
      background-color: #2563eb;
    }
    .field-select option {
      background: white;
      color: #333;
    }
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
    .operator-select:focus {
      outline: 2px solid #f97316;
      outline-offset: 1px;
      background: #fff7ed;
    }
    .operator-select:hover {
      background: #fff7ed;
    }
    .operator-select option {
      text-transform: none;
      font-weight: normal;
      color: #333;
    }
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

// ============================================================================
// Demo: Range Input Components (for "between" operator)
// ============================================================================

@Component({
  selector: 'app-number-range-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="range-container">
      <input
        type="number"
        class="range-input"
        placeholder="Min"
        [value]="minValue()"
        (input)="onMinChange($event)"
      />
      <span class="range-separator">to</span>
      <input
        type="number"
        class="range-input"
        placeholder="Max"
        [value]="maxValue()"
        (input)="onMaxChange($event)"
      />
    </div>
  `,
  styles: `
    .range-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .range-input {
      padding: 0.5rem 0.75rem;
      border: 2px solid #8b5cf6;
      border-radius: 4px;
      font-size: 0.875rem;
      width: 80px;
      background: #faf5ff;
    }
    .range-input:focus {
      outline: 2px solid #8b5cf6;
      outline-offset: 1px;
    }
    .range-separator {
      color: #666;
      font-size: 0.875rem;
      font-weight: 500;
    }
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
    .range-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .range-input {
      padding: 0.5rem 0.75rem;
      border: 2px solid #0891b2;
      border-radius: 4px;
      font-size: 0.875rem;
      background: #ecfeff;
    }
    .range-input:focus {
      outline: 2px solid #0891b2;
      outline-offset: 1px;
    }
    .range-separator {
      color: #666;
      font-size: 0.875rem;
      font-weight: 500;
    }
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
// Demo: Custom Group-Level Components
// ============================================================================

@Component({
  selector: 'app-custom-conjunction',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="conjunction-toggle">
      <button type="button" [class.active]="value() === 'and'" (click)="onChange.emit('and')">
        AND
      </button>
      <button type="button" [class.active]="value() === 'or'" (click)="onChange.emit('or')">
        OR
      </button>
    </div>
  `,
  styles: `
    .conjunction-toggle {
      display: inline-flex;
      border-radius: 20px;
      overflow: hidden;
      border: 2px solid #6366f1;
    }
    button {
      padding: 0.4rem 1rem;
      border: none;
      background: white;
      color: #6366f1;
      font-weight: 600;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.15s;
    }
    button.active {
      background: #6366f1;
      color: white;
    }
    button:hover:not(.active) {
      background: #eef2ff;
    }
    button:focus {
      outline: 2px solid #6366f1;
      outline-offset: 2px;
    }
  `,
})
export class CustomConjunctionComponent {
  readonly value = input<Conjunction>('and');
  readonly onChange = output<Conjunction>();
}

@Component({
  selector: 'app-custom-negation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="negation-btn"
      [class.active]="value()"
      (click)="onChange.emit(!value())"
    >
      NOT
    </button>
  `,
  styles: `
    .negation-btn {
      padding: 0.4rem 0.75rem;
      border: 2px dashed #dc2626;
      border-radius: 4px;
      background: white;
      color: #dc2626;
      font-weight: 600;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.15s;
    }
    .negation-btn.active {
      background: #dc2626;
      color: white;
      border-style: solid;
    }
    .negation-btn:hover:not(.active) {
      background: #fef2f2;
    }
    .negation-btn:focus {
      outline: 2px solid #dc2626;
      outline-offset: 2px;
    }
  `,
})
export class CustomNegationComponent {
  readonly value = input(false);
  readonly onChange = output<boolean>();
}

@Component({
  selector: 'app-custom-add-buttons',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="add-buttons">
      <button type="button" class="add-rule" (click)="onAddCondition.emit()">+ Add Rule</button>
      <button type="button" class="add-group" (click)="onAddGroup.emit()">+ Add Group</button>
    </div>
  `,
  styles: `
    .add-buttons {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }
    button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 20px;
      font-weight: 500;
      font-size: 0.8rem;
      cursor: pointer;
      transition:
        transform 0.1s,
        box-shadow 0.1s;
    }
    button:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
    button:focus {
      outline: 2px solid #333;
      outline-offset: 2px;
    }
    .add-rule {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
    }
    .add-group {
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      color: white;
    }
  `,
})
export class CustomAddButtonsComponent {
  readonly onAddCondition = output<void>();
  readonly onAddGroup = output<void>();
}

@Component({
  selector: 'app-custom-remove-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" class="remove-group" (click)="onRemove.emit()" aria-label="Remove group">
      ✕
    </button>
  `,
  styles: `
    .remove-group {
      width: 28px;
      height: 28px;
      border: none;
      border-radius: 50%;
      background: #ef4444;
      color: white;
      font-size: 0.875rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition:
        transform 0.1s,
        background 0.15s;
    }
    .remove-group:hover {
      background: #dc2626;
      transform: scale(1.1);
    }
    .remove-group:focus {
      outline: 2px solid #dc2626;
      outline-offset: 2px;
    }
  `,
})
export class CustomRemoveGroupComponent {
  readonly onRemove = output<void>();
}

@Component({
  selector: 'app-custom-remove-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="remove-condition"
      (click)="onRemove.emit()"
      aria-label="Remove condition"
    >
      🗑️
    </button>
  `,
  styles: `
    .remove-condition {
      padding: 0.4rem 0.6rem;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      background: white;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.15s;
    }
    .remove-condition:hover {
      background: #fef2f2;
      border-color: #fca5a5;
      transform: scale(1.05);
    }
    .remove-condition:focus {
      outline: 2px solid #f87171;
      outline-offset: 2px;
    }
  `,
})
export class CustomRemoveButtonComponent {
  readonly onRemove = output<void>();
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
    // Condition-level directives
    QbFieldSelectorDirective,
    QbOperatorSelectorDirective,
    QbValueInputDirective,
    QbRemoveButtonDirective,
    // Group-level directives
    QbConjunctionSelectorDirective,
    QbNegationToggleDirective,
    QbAddButtonsDirective,
    QbRemoveGroupButtonDirective,
    // Custom condition components
    CustomTextInputComponent,
    CustomDateInputComponent,
    CustomNumberInputComponent,
    CustomFieldSelectComponent,
    CustomOperatorSelectComponent,
    NumberRangeInputComponent,
    DateRangeInputComponent,
    // Custom group components
    CustomConjunctionComponent,
    CustomNegationComponent,
    CustomAddButtonsComponent,
    CustomRemoveGroupComponent,
    CustomRemoveButtonComponent,
  ],
  template: `
    <main>
      <h1>Query Builder - Full Customization Demo</h1>

      <section aria-labelledby="demo-heading">
        <h2 id="demo-heading">All Custom Components</h2>
        <ul class="legend">
          <li><span class="legend-color" style="background: #6366f1"></span> AND/OR toggle</li>
          <li>
            <span
              class="legend-color"
              style="background: #dc2626; border: 2px dashed #dc2626; background: white"
            ></span>
            NOT button
          </li>
          <li><span class="legend-color" style="background: #3b82f6"></span> Field selector</li>
          <li><span class="legend-color" style="background: #f97316"></span> Operator selector</li>
          <li><span class="legend-color" style="background: #9333ea"></span> Text input</li>
          <li><span class="legend-color" style="background: #059669"></span> Date input</li>
          <li><span class="legend-color" style="background: #dc2626"></span> Number input</li>
          <li>
            <span class="legend-color" style="background: #8b5cf6"></span> Number range (between)
          </li>
          <li>
            <span class="legend-color" style="background: #0891b2"></span> Date range (between)
          </li>
          <li>
            <span
              class="legend-color"
              style="background: linear-gradient(135deg, #10b981, #8b5cf6)"
            ></span>
            Add buttons
          </li>
          <li>🗑️ Remove condition</li>
          <li>
            <span class="legend-color" style="background: #ef4444; border-radius: 50%"></span>
            Remove group
          </li>
        </ul>
        <qb-query-builder [schema]="simpleSchema" [(value)]="query">
          <!-- GROUP-LEVEL CUSTOMIZATIONS -->
          <ng-template qbConjunctionSelector let-value let-onChange="onChange">
            <app-custom-conjunction [value]="value" (onChange)="onChange($event)" />
          </ng-template>

          <ng-template qbNegationToggle let-value let-onChange="onChange">
            <app-custom-negation [value]="value" (onChange)="onChange($event)" />
          </ng-template>

          <ng-template qbAddButtons let-onAddCondition="onAddCondition" let-onAddGroup="onAddGroup">
            <app-custom-add-buttons
              (onAddCondition)="onAddCondition()"
              (onAddGroup)="onAddGroup()"
            />
          </ng-template>

          <ng-template qbRemoveGroupButton let-onRemove="onRemove">
            <app-custom-remove-group (onRemove)="onRemove()" />
          </ng-template>

          <!-- CONDITION-LEVEL CUSTOMIZATIONS -->
          <ng-template qbFieldSelector let-value let-fields="fields" let-onChange="onChange">
            <app-custom-field-select
              [value]="value"
              [fields]="fields"
              (valueChange)="onChange($event)"
            />
          </ng-template>

          <ng-template
            qbOperatorSelector
            let-value
            let-operators="operators"
            let-onChange="onChange"
          >
            <app-custom-operator-select
              [value]="value"
              [operators]="operators"
              (valueChange)="onChange($event)"
            />
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

          <ng-template
            qbValueInput="select"
            let-value
            let-options="options"
            let-onChange="onChange"
          >
            <select
              class="custom-select"
              [value]="value ?? ''"
              (change)="onChange($any($event.target).value || null)"
            >
              <option value="">-- Select --</option>
              @for (opt of options; track opt.value) {
                <option [value]="opt.value">{{ opt.label }}</option>
              }
            </select>
          </ng-template>

          <ng-template qbValueInput="number-range" let-value let-onChange="onChange">
            <app-number-range-input [value]="value" (valueChange)="onChange($event)" />
          </ng-template>

          <ng-template qbValueInput="date-range" let-value let-onChange="onChange">
            <app-date-range-input [value]="value" (valueChange)="onChange($event)" />
          </ng-template>

          <ng-template qbRemoveButton let-onRemove="onRemove">
            <app-custom-remove-button (onRemove)="onRemove()" />
          </ng-template>
        </qb-query-builder>
      </section>

      <section aria-labelledby="output-heading">
        <h2 id="output-heading">Query Output</h2>
        <pre><code>{{ query() | json }}</code></pre>
      </section>

      <hr />

      <section aria-labelledby="default-heading">
        <h2 id="default-heading">Default UI (No Customization)</h2>
        <p class="schema-note">Same schema, but using built-in default components</p>
        <qb-query-builder [schema]="simpleSchema" [(value)]="defaultQuery" />
      </section>

      <section aria-labelledby="default-output-heading">
        <h2 id="default-output-heading">Output</h2>
        <pre><code>{{ defaultQuery() | json }}</code></pre>
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
    h1 {
      margin-bottom: 2rem;
    }
    section {
      margin-bottom: 2rem;
    }
    h2 {
      font-size: 1.25rem;
      margin-bottom: 1rem;
    }
    hr {
      margin: 2rem 0;
      border: none;
      border-top: 2px dashed #ccc;
    }
    .schema-note {
      font-size: 0.875rem;
      color: #666;
      margin-bottom: 1rem;
    }
    pre {
      background: #f5f5f5;
      padding: 1rem;
      border-radius: 4px;
      overflow-x: auto;
    }
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem 1.5rem;
      list-style: none;
      padding: 0;
      margin: 0 0 1.5rem 0;
      font-size: 0.8rem;
      color: #555;
    }
    .legend li {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .legend-color {
      width: 14px;
      height: 14px;
      border-radius: 3px;
      flex-shrink: 0;
    }
    .custom-select {
      padding: 0.5rem 0.75rem;
      border: 2px solid #10b981;
      border-radius: 4px;
      font-size: 0.875rem;
      min-width: 150px;
      background: #ecfdf5;
    }
    .custom-select:focus {
      outline: 2px solid #10b981;
      outline-offset: 1px;
    }
  `,
})
export class App {
  protected readonly simpleSchema = simpleSchema;
  protected readonly query = signal<QueryGroup>(createEmptyGroup());
  protected readonly defaultQuery = signal<QueryGroup>(createEmptyGroup());
}

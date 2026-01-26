# @m1z23r/ngx-query-builder

A flexible, schema-driven query builder component for Angular 17+ with full customization support. Built with signals and standalone components.

## Features

- Schema-driven configuration for fields and operators
- Built-in operators for common use cases (equals, contains, greater than, etc.)
- Nested groups with AND/OR conjunctions and NOT negation
- 8 customization points for complete UI control
- Two-way binding with Angular signals
- Accessible by default (WCAG AA compliant)
- Zero dependencies beyond Angular
- Tree-shakeable

## Installation

```bash
npm install @m1z23r/ngx-query-builder
# or
yarn add @m1z23r/ngx-query-builder
```

## Quick Start

### 1. Import the component

```typescript
import { Component } from '@angular/core';
import {
  QueryBuilderComponent,
  QueryGroup,
  createSchema,
  createEmptyGroup,
} from '@m1z23r/ngx-query-builder';

@Component({
  selector: 'app-root',
  imports: [QueryBuilderComponent],
  template: `
    <qb-query-builder [schema]="schema" [(value)]="query" />
    <pre>{{ query | json }}</pre>
  `,
})
export class AppComponent {
  schema = createSchema({
    fields: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'age', label: 'Age', type: 'number' },
      { key: 'created_at', label: 'Created At', type: 'date' },
    ],
  });

  query: QueryGroup = createEmptyGroup();
}
```

That's it! You now have a fully functional query builder with default UI.

## Schema Configuration

The schema defines what fields users can filter on and what operators are available.

### Field Definition

```typescript
interface FieldDef {
  key: string;           // Backend field identifier
  label: string;         // Display label
  type: FieldType;       // 'text' | 'number' | 'date' | 'bool'
  options?: FieldOption[]; // For select/dropdown fields
  nullable?: boolean;    // Enables is_null/is_not_null operators
}

interface FieldOption {
  value: string;
  label: string;
}
```

### Example with Options

```typescript
const schema = createSchema({
  fields: [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'age', label: 'Age', type: 'number', nullable: true },
    { key: 'created_at', label: 'Created At', type: 'date', nullable: true },
    { key: 'is_active', label: 'Active', type: 'bool' },
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
```

## Built-in Operators

The library includes 13 built-in operators via the `OPERATORS` constant:

| Key | Label | Supported Types | Value Kind |
|-----|-------|-----------------|------------|
| `eq` | equals | text, number, date, bool | single |
| `neq` | not equals | text, number, date, bool | single |
| `gt` | greater than | number, date | single |
| `gte` | greater than or equals | number, date | single |
| `lt` | less than | number, date | single |
| `lte` | less than or equals | number, date | single |
| `contains` | contains | text | single |
| `starts_with` | starts with | text | single |
| `ends_with` | ends with | text | single |
| `in` | in | text, number | multi |
| `nin` | not in | text, number | multi |
| `is_null` | is null | all (requires `nullable: true`) | none |
| `is_not_null` | is not null | all (requires `nullable: true`) | none |

### Using Default Operators

```typescript
import { createSchema } from '@m1z23r/ngx-query-builder';

// Uses OPERATORS by default
const schema = createSchema({
  fields: [...],
});
```

### Custom Operators

You can extend or replace the default operators:

```typescript
import { createSchema, OPERATORS } from '@m1z23r/ngx-query-builder';

const schema = createSchema({
  fields: [...],
  operators: {
    ...OPERATORS, // Include defaults
    between: {
      label: 'between',
      supportedTypes: ['number', 'date'],
      valueKind: 'multi',
    },
    regex: {
      label: 'matches regex',
      supportedTypes: ['text'],
      valueKind: 'single',
    },
  },
});
```

## Custom Input Types

For custom operators like `between`, you'll want custom input components. Use `resolveValueInput`:

```typescript
const schema = createSchema({
  fields: [...],
  operators: {
    ...OPERATORS,
    between: {
      label: 'between',
      supportedTypes: ['number', 'date'],
      valueKind: 'multi',
    },
  },
  resolveValueInput: (field, operator, operatorKey) => {
    if (operatorKey === 'between') {
      return field.type === 'date' ? 'date-range' : 'number-range';
    }
    return null; // Use default resolution
  },
});
```

## Query Structure

The query builder produces a tree structure:

```typescript
interface QueryGroup {
  type: 'group';
  conjunction: 'and' | 'or';
  negated: boolean;
  children: QueryNode[];
}

interface QueryCondition {
  type: 'condition';
  field: string | null;
  operator: string | null;
  value: unknown;
}

type QueryNode = QueryGroup | QueryCondition;
```

### Example Output

```json
{
  "type": "group",
  "conjunction": "and",
  "negated": false,
  "children": [
    {
      "type": "condition",
      "field": "name",
      "operator": "contains",
      "value": "John"
    },
    {
      "type": "group",
      "conjunction": "or",
      "negated": false,
      "children": [
        {
          "type": "condition",
          "field": "age",
          "operator": "gte",
          "value": 18
        },
        {
          "type": "condition",
          "field": "status",
          "operator": "eq",
          "value": "active"
        }
      ]
    }
  ]
}
```

## Template Customization

The query builder provides 8 customization points using structural directives. Each accepts an `ng-template` with a typed context.

### Condition-Level Directives

#### Field Selector

```html
<qb-query-builder [schema]="schema" [(value)]="query">
  <ng-template qbFieldSelector let-field let-fields="fields" let-onChange="onChange">
    <select [value]="field" (change)="onChange($any($event.target).value)">
      <option value="">Select field...</option>
      @for (f of fields; track f.key) {
        <option [value]="f.key">{{ f.label }}</option>
      }
    </select>
  </ng-template>
</qb-query-builder>
```

**Context:**
```typescript
interface FieldSelectorContext {
  $implicit: string | null;        // Current field key
  fields: FieldDef[];              // Available fields
  onChange: (key: string) => void; // Update handler
}
```

#### Operator Selector

```html
<ng-template qbOperatorSelector let-operator let-operators="operators" let-onChange="onChange">
  <select [value]="operator" (change)="onChange($any($event.target).value)">
    <option value="">Select operator...</option>
    @for (op of operators; track op[0]) {
      <option [value]="op[0]">{{ op[1].label }}</option>
    }
  </select>
</ng-template>
```

**Context:**
```typescript
interface OperatorSelectorContext {
  $implicit: string | null;                      // Current operator key
  operators: [string, OperatorDef][];            // Available operators
  onChange: (key: string) => void;               // Update handler
}
```

#### Value Input

Use `qbValueInput` with an input type to customize specific value inputs:

```html
<!-- Custom text input -->
<ng-template [qbValueInput]="'text-input'" let-value let-onChange="onChange">
  <input type="text" [value]="value ?? ''" (input)="onChange($any($event.target).value)" />
</ng-template>

<!-- Custom date input -->
<ng-template [qbValueInput]="'date-picker'" let-value let-onChange="onChange">
  <input type="date" [value]="value ?? ''" (change)="onChange($any($event.target).value)" />
</ng-template>

<!-- Custom range input for "between" operator -->
<ng-template [qbValueInput]="'number-range'" let-value let-onChange="onChange">
  <app-number-range [value]="value" (valueChange)="onChange($event)" />
</ng-template>
```

**Context:**
```typescript
interface ValueInputContext {
  $implicit: unknown;                    // Current value
  inputType: string;                     // Resolved input type
  field: FieldDef;                       // Selected field
  operator: OperatorDef;                 // Selected operator
  operatorKey: string | null;            // Operator key
  options: FieldOption[];                // Field options (if any)
  placeholder: string;                   // Suggested placeholder
  onChange: (value: unknown) => void;    // Update handler
}
```

#### Remove Button

```html
<ng-template qbRemoveButton let-onRemove="onRemove">
  <button type="button" (click)="onRemove()">Remove</button>
</ng-template>
```

**Context:**
```typescript
interface RemoveButtonContext {
  $implicit: void;
  onRemove: () => void;
}
```

### Group-Level Directives

#### Conjunction Selector

```html
<ng-template qbConjunctionSelector let-conjunction let-onChange="onChange">
  <button
    type="button"
    [class.active]="conjunction === 'and'"
    (click)="onChange('and')">
    AND
  </button>
  <button
    type="button"
    [class.active]="conjunction === 'or'"
    (click)="onChange('or')">
    OR
  </button>
</ng-template>
```

**Context:**
```typescript
interface ConjunctionSelectorContext {
  $implicit: 'and' | 'or';
  onChange: (conjunction: 'and' | 'or') => void;
}
```

#### Negation Toggle

```html
<ng-template qbNegationToggle let-negated let-onChange="onChange">
  <button
    type="button"
    [class.active]="negated"
    (click)="onChange(!negated)">
    NOT
  </button>
</ng-template>
```

**Context:**
```typescript
interface NegationToggleContext {
  $implicit: boolean;
  onChange: (negated: boolean) => void;
}
```

#### Add Buttons

```html
<ng-template qbAddButtons let-onAddCondition="onAddCondition" let-onAddGroup="onAddGroup">
  <button type="button" (click)="onAddCondition()">+ Condition</button>
  <button type="button" (click)="onAddGroup()">+ Group</button>
</ng-template>
```

**Context:**
```typescript
interface AddButtonsContext {
  $implicit: void;
  onAddCondition: () => void;
  onAddGroup: () => void;
}
```

#### Remove Group Button

```html
<ng-template qbRemoveGroupButton let-depth="depth" let-onRemove="onRemove">
  @if (depth > 0) {
    <button type="button" (click)="onRemove()">Remove Group</button>
  }
</ng-template>
```

**Context:**
```typescript
interface RemoveGroupButtonContext {
  $implicit: void;
  depth: number;     // Nesting depth (0 = root)
  onRemove: () => void;
}
```

## Full Customization Example

```typescript
@Component({
  selector: 'app-custom-query-builder',
  imports: [
    QueryBuilderComponent,
    QbFieldSelectorDirective,
    QbOperatorSelectorDirective,
    QbValueInputDirective,
    QbRemoveButtonDirective,
    QbConjunctionSelectorDirective,
    QbNegationToggleDirective,
    QbAddButtonsDirective,
    QbRemoveGroupButtonDirective,
  ],
  template: `
    <qb-query-builder [schema]="schema" [(value)]="query">
      <!-- Field selector -->
      <ng-template qbFieldSelector let-field let-fields="fields" let-onChange="onChange">
        <app-custom-field-select
          [value]="field"
          [fields]="fields"
          (valueChange)="onChange($event)"
        />
      </ng-template>

      <!-- Operator selector -->
      <ng-template qbOperatorSelector let-op let-operators="operators" let-onChange="onChange">
        <app-custom-operator-select
          [value]="op"
          [operators]="operators"
          (valueChange)="onChange($event)"
        />
      </ng-template>

      <!-- Text input -->
      <ng-template [qbValueInput]="'text-input'" let-value let-onChange="onChange">
        <app-custom-text-input [value]="value" (valueChange)="onChange($event)" />
      </ng-template>

      <!-- Number input -->
      <ng-template [qbValueInput]="'number-input'" let-value let-onChange="onChange">
        <app-custom-number-input [value]="value" (valueChange)="onChange($event)" />
      </ng-template>

      <!-- Date input -->
      <ng-template [qbValueInput]="'date-picker'" let-value let-onChange="onChange">
        <app-custom-date-input [value]="value" (valueChange)="onChange($event)" />
      </ng-template>

      <!-- Remove condition button -->
      <ng-template qbRemoveButton let-onRemove="onRemove">
        <app-custom-remove-button (click)="onRemove()" />
      </ng-template>

      <!-- Conjunction selector (AND/OR) -->
      <ng-template qbConjunctionSelector let-conj let-onChange="onChange">
        <app-custom-conjunction [value]="conj" (valueChange)="onChange($event)" />
      </ng-template>

      <!-- Negation toggle (NOT) -->
      <ng-template qbNegationToggle let-negated let-onChange="onChange">
        <app-custom-negation [value]="negated" (valueChange)="onChange($event)" />
      </ng-template>

      <!-- Add buttons -->
      <ng-template qbAddButtons let-onAddCondition="onAddCondition" let-onAddGroup="onAddGroup">
        <app-custom-add-buttons
          (addCondition)="onAddCondition()"
          (addGroup)="onAddGroup()"
        />
      </ng-template>

      <!-- Remove group button -->
      <ng-template qbRemoveGroupButton let-depth="depth" let-onRemove="onRemove">
        <app-custom-remove-group [depth]="depth" (click)="onRemove()" />
      </ng-template>
    </qb-query-builder>
  `,
})
export class CustomQueryBuilderComponent {
  schema = createSchema({ fields: [...] });
  query = createEmptyGroup();
}
```

## API Reference

### QueryBuilderComponent

**Selector:** `qb-query-builder`

| Input/Output | Type | Description |
|--------------|------|-------------|
| `schema` | `input.required<QuerySchema>()` | Schema configuration |
| `value` | `model<QueryGroup>()` | Two-way bindable query state |
| `disabled` | `model<boolean>()` | Disable all inputs |

### Utility Functions

```typescript
// Create a schema from options
createSchema(options: CreateSchemaOptions): QuerySchema

// Create an empty condition
createEmptyCondition(): QueryCondition
// Returns: { type: 'condition', field: null, operator: null, value: null }

// Create an empty group with one condition
createEmptyGroup(): QueryGroup
// Returns: { type: 'group', conjunction: 'and', negated: false, children: [emptyCondition] }

// Type guards
isCondition(node: QueryNode): node is QueryCondition
isGroup(node: QueryNode): node is QueryGroup
```

### Constants

```typescript
// Built-in input type identifiers
INPUT_TYPES = {
  TEXT: 'text-input',
  NUMBER: 'number-input',
  DATE: 'date-picker',
  BOOLEAN: 'boolean-toggle',
  SELECT: 'select',
  MULTI_SELECT: 'multi-select',
}

// Built-in operators
OPERATORS = { eq, neq, gt, gte, lt, lte, contains, starts_with, ends_with, in, nin, is_null, is_not_null }
```

## Styling

The default UI uses minimal inline styles. You can style the component using CSS classes:

| Class | Element |
|-------|---------|
| `.qb-wrapper` | Root fieldset |
| `.qb-group` | Group container |
| `.qb-group-header` | Group header (conjunction, negation, remove) |
| `.qb-group-children` | Children container |
| `.qb-condition` | Condition row |
| `.qb-add-buttons` | Add condition/group buttons |

For full control, use template customization to render your own markup.

## Accessibility

The default UI includes:

- Semantic HTML (`<fieldset>`, `<legend>`, `<label>`)
- Screen-reader-only labels (`.qb-sr-only`)
- Proper focus management
- Keyboard navigation support
- ARIA attributes where needed

## TypeScript Support

All types are exported for full TypeScript support:

```typescript
import type {
  FieldType,
  ValueKind,
  InputType,
  OperatorKey,
  Conjunction,
  FieldOption,
  OperatorDef,
  FieldDef,
  QueryCondition,
  QueryGroup,
  QueryNode,
  QuerySchema,
  CreateSchemaOptions,
  BuiltinOperatorKey,
  // Template contexts
  FieldSelectorContext,
  OperatorSelectorContext,
  ValueInputContext,
  RemoveButtonContext,
  ConjunctionSelectorContext,
  NegationToggleContext,
  AddButtonsContext,
  RemoveGroupButtonContext,
} from '@m1z23r/ngx-query-builder';
```

## Browser Support

Supports all browsers that Angular 17+ supports.

## License

MIT

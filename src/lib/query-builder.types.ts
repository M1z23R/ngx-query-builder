// ============================================================================
// Core Types
// ============================================================================

export type FieldType = 'text' | 'number' | 'date' | 'bool';

export type ValueKind = 'none' | 'single' | 'multi';

export type InputType = string;

export type OperatorKey = string;

export type Conjunction = 'and' | 'or';

// ============================================================================
// Built-in Constants
// ============================================================================

/** Built-in input type identifiers. Use these or define your own custom strings. */
export const INPUT_TYPES = {
  TEXT: 'text-input',
  NUMBER: 'number-input',
  DATE: 'date-picker',
  BOOLEAN: 'boolean-toggle',
  SELECT: 'select',
  MULTI_SELECT: 'multi-select',
} as const;

// ============================================================================
// Interfaces
// ============================================================================

export interface FieldOption {
  readonly value: string;
  readonly label: string;
}

export interface OperatorDef {
  readonly label: string;
  readonly supportedTypes: readonly FieldType[];
  readonly valueKind: ValueKind;
}

export interface FieldDef {
  /** The field key sent to backend (e.g., "created_at") */
  readonly key: string;
  /** The display label shown in UI (e.g., "Created At") */
  readonly label: string;
  readonly type: FieldType;
  readonly options?: readonly FieldOption[];
  readonly nullable?: boolean;
}

export interface QueryCondition {
  type: 'condition';
  field: string | null;
  operator: OperatorKey | null;
  value: unknown;
}

export interface QueryGroup {
  type: 'group';
  conjunction: Conjunction;
  negated: boolean;
  children: QueryNode[];
}

export type QueryNode = QueryCondition | QueryGroup;

// ============================================================================
// Default Operators
// ============================================================================

/** Default operators that cover most common use cases. Spread and extend as needed. */
export const OPERATORS = {
  eq: {
    label: 'equals',
    supportedTypes: ['text', 'number', 'date', 'bool'],
    valueKind: 'single',
  },
  neq: {
    label: 'not equals',
    supportedTypes: ['text', 'number', 'date', 'bool'],
    valueKind: 'single',
  },
  gt: {
    label: 'greater than',
    supportedTypes: ['number', 'date'],
    valueKind: 'single',
  },
  gte: {
    label: 'greater than or equals',
    supportedTypes: ['number', 'date'],
    valueKind: 'single',
  },
  lt: {
    label: 'less than',
    supportedTypes: ['number', 'date'],
    valueKind: 'single',
  },
  lte: {
    label: 'less than or equals',
    supportedTypes: ['number', 'date'],
    valueKind: 'single',
  },
  contains: {
    label: 'contains',
    supportedTypes: ['text'],
    valueKind: 'single',
  },
  starts_with: {
    label: 'starts with',
    supportedTypes: ['text'],
    valueKind: 'single',
  },
  ends_with: {
    label: 'ends with',
    supportedTypes: ['text'],
    valueKind: 'single',
  },
  in: {
    label: 'in',
    supportedTypes: ['text', 'number'],
    valueKind: 'multi',
  },
  nin: {
    label: 'not in',
    supportedTypes: ['text', 'number'],
    valueKind: 'multi',
  },
  is_null: {
    label: 'is null',
    supportedTypes: ['text', 'number', 'date', 'bool'],
    valueKind: 'none',
  },
  is_not_null: {
    label: 'is not null',
    supportedTypes: ['text', 'number', 'date', 'bool'],
    valueKind: 'none',
  },
} as const satisfies Record<string, OperatorDef>;

export type BuiltinOperatorKey = keyof typeof OPERATORS;

// ============================================================================
// Schema Interface
// ============================================================================

export interface QuerySchema {
  readonly fields: readonly FieldDef[];
  readonly operators: Record<OperatorKey, OperatorDef>;

  getFieldByKey(key: string): FieldDef | undefined;
  getOperatorByKey(key: OperatorKey): OperatorDef;
  getOperatorsForField(field: FieldDef): [OperatorKey, OperatorDef][];
  resolveValueInput(field: FieldDef, operator: OperatorDef, operatorKey?: OperatorKey): InputType | null;

  /** Returns a new schema with the field added. No-op if a field with the same key already exists. */
  addField(field: FieldDef): QuerySchema;
  /** Returns a new schema with the field removed. No-op if the key doesn't exist. */
  removeField(key: string): QuerySchema;
  /** Returns a new schema with the operator added. No-op if an operator with the same key already exists. */
  addOperator(key: OperatorKey, operator: OperatorDef): QuerySchema;
  /** Returns a new schema with the operator removed. No-op if the key doesn't exist. */
  removeOperator(key: OperatorKey): QuerySchema;
}

// ============================================================================
// Schema Factory
// ============================================================================

export interface CreateSchemaOptions {
  /** Required: Define your fields */
  fields: readonly FieldDef[];
  /** Optional: Custom operators (defaults to OPERATORS) */
  operators?: Record<OperatorKey, OperatorDef>;
  /** Optional: Custom logic to resolve input type */
  resolveValueInput?: (field: FieldDef, operator: OperatorDef, operatorKey?: OperatorKey) => InputType | null;
}

const INPUT_TYPE_MAP: Record<FieldType, InputType> = {
  text: INPUT_TYPES.TEXT,
  number: INPUT_TYPES.NUMBER,
  date: INPUT_TYPES.DATE,
  bool: INPUT_TYPES.BOOLEAN,
};

const NULLABLE_OPERATORS: readonly string[] = ['is_null', 'is_not_null'];

function defaultResolveValueInput(
  field: FieldDef,
  operator: OperatorDef,
): InputType | null {
  if (operator.valueKind === 'none') {
    return null;
  }

  if (operator.valueKind === 'multi') {
    if (field.options && field.options.length > 0) {
      return INPUT_TYPES.MULTI_SELECT;
    }
    // For "in" / "not in" without options, use text input for comma-separated values
    return INPUT_TYPES.TEXT;
  }

  if (field.options && field.options.length > 0) {
    return INPUT_TYPES.SELECT;
  }

  return INPUT_TYPE_MAP[field.type];
}

/**
 * Creates a QuerySchema instance from configuration.
 *
 * @example
 * // Basic usage with default operators
 * const schema = createSchema({
 *   fields: [
 *     { key: 'name', label: 'Name', type: 'text' },
 *     { key: 'age', label: 'Age', type: 'number' },
 *   ]
 * });
 *
 * @example
 * // With custom operators
 * const schema = createSchema({
 *   fields: [...],
 *   operators: {
 *     ...OPERATORS,
 *     between: { label: 'between', supportedTypes: ['number', 'date'], valueKind: 'multi' },
 *   }
 * });
 *
 * @example
 * // With custom input type resolution
 * const schema = createSchema({
 *   fields: [...],
 *   operators: { ...OPERATORS, between: {...} },
 *   resolveValueInput: (field, operator, operatorKey) => {
 *     if (operatorKey === 'between') {
 *       return field.type === 'date' ? 'date-range' : 'number-range';
 *     }
 *     return null; // fall back to default
 *   }
 * });
 */
export function createSchema(options: CreateSchemaOptions): QuerySchema {
  const operators: Record<OperatorKey, OperatorDef> = options.operators ?? OPERATORS;

  return {
    fields: options.fields,
    operators,

    getFieldByKey(key: string): FieldDef | undefined {
      return options.fields.find(f => f.key === key);
    },

    getOperatorByKey(key: OperatorKey): OperatorDef {
      return operators[key];
    },

    getOperatorsForField(field: FieldDef): [OperatorKey, OperatorDef][] {
      return (Object.entries(operators) as [OperatorKey, OperatorDef][]).filter(
        ([key, op]) => {
          if (!op.supportedTypes.includes(field.type)) {
            return false;
          }
          if (NULLABLE_OPERATORS.includes(key) && !field.nullable) {
            return false;
          }
          return true;
        }
      );
    },

    resolveValueInput(field: FieldDef, operator: OperatorDef, operatorKey?: OperatorKey): InputType | null {
      // Try custom resolver first
      if (options.resolveValueInput) {
        const result = options.resolveValueInput(field, operator, operatorKey);
        if (result !== null) {
          return result;
        }
      }
      // Fall back to default
      return defaultResolveValueInput(field, operator);
    },

    addField(field: FieldDef): QuerySchema {
      if (options.fields.some(f => f.key === field.key)) {
        return this;
      }
      return createSchema({ ...options, fields: [...options.fields, field] });
    },

    removeField(key: string): QuerySchema {
      if (!options.fields.some(f => f.key === key)) {
        return this;
      }
      return createSchema({ ...options, fields: options.fields.filter(f => f.key !== key) });
    },

    addOperator(key: OperatorKey, operator: OperatorDef): QuerySchema {
      if (operators[key]) {
        return this;
      }
      return createSchema({ ...options, operators: { ...operators, [key]: operator } });
    },

    removeOperator(key: OperatorKey): QuerySchema {
      if (!operators[key]) {
        return this;
      }
      const { [key]: _, ...rest } = operators;
      return createSchema({ ...options, operators: rest });
    },
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

export function isCondition(node: QueryNode): node is QueryCondition {
  return node.type === 'condition';
}

export function isGroup(node: QueryNode): node is QueryGroup {
  return node.type === 'group';
}

export function createEmptyCondition(): QueryCondition {
  return { type: 'condition', field: null, operator: null, value: null };
}

export function createEmptyGroup(): QueryGroup {
  return {
    type: 'group',
    conjunction: 'and',
    negated: false,
    children: [createEmptyCondition()],
  };
}

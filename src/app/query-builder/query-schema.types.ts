export type FieldType = 'text' | 'number' | 'date' | 'bool';

export type ValueKind = 'none' | 'single' | 'multi';

// Built-in input types as constants
export const INPUT_TYPES = {
  TEXT: 'text-input',
  NUMBER: 'number-input',
  DATE: 'date-picker',
  BOOLEAN: 'boolean-toggle',
  SELECT: 'select',
  MULTI_SELECT: 'multi-select',
} as const;

// InputType is now string to allow custom types
export type InputType = string;

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
  readonly key: string;
  readonly label: string;
  readonly type: FieldType;
  readonly options?: readonly FieldOption[];
  readonly nullable?: boolean;
}

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

// OperatorKey is now string to allow custom operators
export type OperatorKey = string;

// Built-in operator keys type for type safety when using OPERATORS
export type BuiltinOperatorKey = keyof typeof OPERATORS;

export const FIELDS: readonly FieldDef[] = [
  {
    key: 'name',
    label: 'Name',
    type: 'text',
  },
  {
    key: 'email',
    label: 'Email',
    type: 'text',
    nullable: true,
  },
  {
    key: 'age',
    label: 'Age',
    type: 'number',
    nullable: true,
  },
  {
    key: 'salary',
    label: 'Salary',
    type: 'number',
  },
  {
    key: 'created_at',
    label: 'Created At',
    type: 'date',
    nullable: true,
  },
  {
    key: 'status',
    label: 'Status',
    type: 'text',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'pending', label: 'Pending' },
      { value: 'suspended', label: 'Suspended' },
    ],
  },
  {
    key: 'category',
    label: 'Category',
    type: 'text',
    options: [
      { value: 'electronics', label: 'Electronics' },
      { value: 'clothing', label: 'Clothing' },
      { value: 'books', label: 'Books' },
      { value: 'home', label: 'Home & Garden' },
    ],
    nullable: true,
  },
  {
    key: 'is_active',
    label: 'Is Active',
    type: 'bool',
  },
] as const;

const INPUT_TYPE_MAP: Record<FieldType, InputType> = {
  text: INPUT_TYPES.TEXT,
  number: INPUT_TYPES.NUMBER,
  date: INPUT_TYPES.DATE,
  bool: INPUT_TYPES.BOOLEAN,
};

const NULLABLE_OPERATORS: readonly string[] = ['is_null', 'is_not_null'];

export function getOperatorsForField(
  field: FieldDef
): [OperatorKey, OperatorDef][] {
  return (Object.entries(OPERATORS) as [OperatorKey, OperatorDef][]).filter(
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
}

export function resolveValueInput(
  field: FieldDef,
  operator: OperatorDef
): InputType | null {
  if (operator.valueKind === 'none') {
    return null;
  }

  if (operator.valueKind === 'multi') {
    if (field.options && field.options.length > 0) {
      return INPUT_TYPES.MULTI_SELECT;
    }
    return field.type === 'number' ? INPUT_TYPES.NUMBER : INPUT_TYPES.TEXT;
  }

  if (field.options && field.options.length > 0) {
    return INPUT_TYPES.SELECT;
  }

  return INPUT_TYPE_MAP[field.type];
}

export interface QueryCondition {
  type: 'condition';
  field: string | null;
  operator: OperatorKey | null;
  value: unknown;
}

export type Conjunction = 'and' | 'or';

export type QueryNode = QueryCondition | QueryGroup;

export interface QueryGroup {
  type: 'group';
  conjunction: Conjunction;
  negated: boolean;
  children: QueryNode[];
}

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

// Abstract class for schema customization
export abstract class QuerySchema {
  abstract readonly fields: readonly FieldDef[];
  abstract readonly operators: Record<OperatorKey, OperatorDef>;

  abstract getFieldByKey(key: string): FieldDef | undefined;
  abstract getOperatorByKey(key: OperatorKey): OperatorDef;
  abstract getOperatorsForField(field: FieldDef): [OperatorKey, OperatorDef][];
  abstract resolveValueInput(field: FieldDef, operator: OperatorDef): InputType | null;
}

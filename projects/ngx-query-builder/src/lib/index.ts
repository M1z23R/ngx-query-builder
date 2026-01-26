// ============================================================================
// Query Builder Library - Public API
// ============================================================================

// Components
export { QueryBuilderComponent } from './query-builder.component';

// Template Directives
export {
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
} from './query-builder.templates';

// Template Context Types
export type {
  // Condition-level contexts
  FieldSelectorContext,
  OperatorSelectorContext,
  ValueInputContext,
  RemoveButtonContext,
  // Group-level contexts
  ConjunctionSelectorContext,
  NegationToggleContext,
  AddButtonsContext,
  RemoveGroupButtonContext,
} from './query-builder.templates';

// Types
export type {
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
} from './query-builder.types';

// Constants
export { INPUT_TYPES, OPERATORS } from './query-builder.types';

// Factory & Utilities
export {
  createSchema,
  createEmptyCondition,
  createEmptyGroup,
  isCondition,
  isGroup,
} from './query-builder.types';

import { Directive, input, TemplateRef } from '@angular/core';
import { FieldDef, FieldOption, OperatorDef, OperatorKey } from './query-schema.types';

// Context interfaces
export interface FieldSelectorContext {
  $implicit: string | null; // current field key
  fields: readonly FieldDef[];
  onChange: (key: string | null) => void;
}

export interface OperatorSelectorContext {
  $implicit: OperatorKey | null; // current operator
  operators: [OperatorKey, OperatorDef][];
  onChange: (key: OperatorKey | null) => void;
}

export interface ValueInputContext {
  $implicit: unknown; // current value
  inputType: string; // 'text-input' | 'number-input' | 'date-picker' | 'select' | 'multi-select' | custom
  field: FieldDef;
  operator: OperatorDef;
  options: readonly FieldOption[]; // empty if no options
  onChange: (value: unknown) => void;
}

export interface RemoveButtonContext {
  $implicit: void;
  onRemove: () => void;
}

// Directives
@Directive({ selector: '[qbFieldSelector]' })
export class QbFieldSelectorDirective {
  constructor(public readonly template: TemplateRef<FieldSelectorContext>) {}

  static ngTemplateContextGuard(
    _dir: QbFieldSelectorDirective,
    ctx: unknown
  ): ctx is FieldSelectorContext {
    return true;
  }
}

@Directive({ selector: '[qbOperatorSelector]' })
export class QbOperatorSelectorDirective {
  constructor(public readonly template: TemplateRef<OperatorSelectorContext>) {}

  static ngTemplateContextGuard(
    _dir: QbOperatorSelectorDirective,
    ctx: unknown
  ): ctx is OperatorSelectorContext {
    return true;
  }
}

@Directive({ selector: '[qbValueInput]' })
export class QbValueInputDirective {
  readonly qbValueInput = input.required<string>(); // e.g. 'text-input', 'number-input', 'my-custom-input'

  constructor(public readonly template: TemplateRef<ValueInputContext>) {}

  static ngTemplateContextGuard(
    _dir: QbValueInputDirective,
    ctx: unknown
  ): ctx is ValueInputContext {
    return true;
  }
}

@Directive({ selector: '[qbRemoveButton]' })
export class QbRemoveButtonDirective {
  constructor(public readonly template: TemplateRef<RemoveButtonContext>) {}

  static ngTemplateContextGuard(
    _dir: QbRemoveButtonDirective,
    ctx: unknown
  ): ctx is RemoveButtonContext {
    return true;
  }
}

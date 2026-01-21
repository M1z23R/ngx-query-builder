import { Directive, input, TemplateRef } from '@angular/core';
import { FieldDef, FieldOption, OperatorDef, OperatorKey } from './query-builder.types';

// ============================================================================
// Template Context Interfaces
// ============================================================================

/** Context provided to custom field selector templates */
export interface FieldSelectorContext {
  /** Current field key (use with let-value) */
  $implicit: string | null;
  /** Available fields to choose from */
  fields: readonly FieldDef[];
  /** Call this when selection changes */
  onChange: (key: string | null) => void;
}

/** Context provided to custom operator selector templates */
export interface OperatorSelectorContext {
  /** Current operator key (use with let-value) */
  $implicit: OperatorKey | null;
  /** Available operators for the selected field */
  operators: [OperatorKey, OperatorDef][];
  /** Call this when selection changes */
  onChange: (key: OperatorKey | null) => void;
}

/** Context provided to custom value input templates */
export interface ValueInputContext {
  /** Current value (use with let-value) */
  $implicit: unknown;
  /** The input type identifier (e.g., 'text-input', 'number-range') */
  inputType: string;
  /** The selected field definition */
  field: FieldDef;
  /** The selected operator definition */
  operator: OperatorDef;
  /** Field options if available (for select inputs) */
  options: readonly FieldOption[];
  /** Call this when value changes */
  onChange: (value: unknown) => void;
}

/** Context provided to custom remove button templates */
export interface RemoveButtonContext {
  $implicit: void;
  /** Call this to remove the condition */
  onRemove: () => void;
}

// ============================================================================
// Template Directives
// ============================================================================

/**
 * Directive to provide a custom field selector template.
 *
 * @example
 * <ng-template qbFieldSelector let-value let-fields="fields" let-onChange="onChange">
 *   <my-custom-select [value]="value" [options]="fields" (change)="onChange($event)" />
 * </ng-template>
 */
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

/**
 * Directive to provide a custom operator selector template.
 *
 * @example
 * <ng-template qbOperatorSelector let-value let-operators="operators" let-onChange="onChange">
 *   <my-custom-select [value]="value" [options]="operators" (change)="onChange($event)" />
 * </ng-template>
 */
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

/**
 * Directive to provide a custom value input template for a specific input type.
 *
 * @example
 * // Override built-in text input
 * <ng-template qbValueInput="text-input" let-value let-onChange="onChange">
 *   <my-text-input [value]="value" (valueChange)="onChange($event)" />
 * </ng-template>
 *
 * @example
 * // Add custom input type
 * <ng-template qbValueInput="date-range" let-value let-onChange="onChange">
 *   <my-date-range [value]="value" (valueChange)="onChange($event)" />
 * </ng-template>
 */
@Directive({ selector: '[qbValueInput]' })
export class QbValueInputDirective {
  /** The input type this template handles (e.g., 'text-input', 'number-range') */
  readonly qbValueInput = input.required<string>();

  constructor(public readonly template: TemplateRef<ValueInputContext>) {}

  static ngTemplateContextGuard(
    _dir: QbValueInputDirective,
    ctx: unknown
  ): ctx is ValueInputContext {
    return true;
  }
}

/**
 * Directive to provide a custom remove button template.
 *
 * @example
 * <ng-template qbRemoveButton let-onRemove="onRemove">
 *   <button (click)="onRemove()">Delete</button>
 * </ng-template>
 */
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

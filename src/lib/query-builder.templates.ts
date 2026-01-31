import { Directive, input, TemplateRef } from '@angular/core';
import { Conjunction, FieldDef, FieldOption, OperatorDef, OperatorKey } from './query-builder.types';

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
  /** Call this to dynamically add a new field to the schema */
  addField?: (field: FieldDef) => void;
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
  /** The operator key (e.g., 'eq', 'in', 'between') */
  operatorKey: string | null;
  /** Field options if available (for select inputs) */
  options: readonly FieldOption[];
  /** Suggested placeholder text */
  placeholder: string;
  /** Call this when value changes */
  onChange: (value: unknown) => void;
}

/** Context provided to custom remove button templates (for conditions) */
export interface RemoveButtonContext {
  $implicit: void;
  /** Call this to remove the condition */
  onRemove: () => void;
}

/** Context provided to custom conjunction selector templates (All/Any toggle) */
export interface ConjunctionSelectorContext {
  /** Current conjunction value (use with let-value) */
  $implicit: Conjunction;
  /** Call this when conjunction changes */
  onChange: (conjunction: Conjunction) => void;
}

/** Context provided to custom negation toggle templates (NOT checkbox) */
export interface NegationToggleContext {
  /** Current negated state (use with let-value) */
  $implicit: boolean;
  /** Call this when negation changes */
  onChange: (negated: boolean) => void;
}

/** Context provided to custom add buttons template */
export interface AddButtonsContext {
  $implicit: void;
  /** Call this to add a new condition */
  onAddCondition: () => void;
  /** Call this to add a new nested group */
  onAddGroup: () => void;
}

/** Context provided to custom remove group button template */
export interface RemoveGroupButtonContext {
  $implicit: void;
  /** Current nesting depth (0 = root) */
  depth: number;
  /** Call this to remove the group */
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
 * Directive to provide a custom remove button template (for conditions).
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

/**
 * Directive to provide a custom conjunction selector template (All/Any toggle).
 *
 * @example
 * <ng-template qbConjunctionSelector let-value let-onChange="onChange">
 *   <select [value]="value" (change)="onChange($event.target.value)">
 *     <option value="and">AND</option>
 *     <option value="or">OR</option>
 *   </select>
 * </ng-template>
 */
@Directive({ selector: '[qbConjunctionSelector]' })
export class QbConjunctionSelectorDirective {
  constructor(public readonly template: TemplateRef<ConjunctionSelectorContext>) {}

  static ngTemplateContextGuard(
    _dir: QbConjunctionSelectorDirective,
    ctx: unknown
  ): ctx is ConjunctionSelectorContext {
    return true;
  }
}

/**
 * Directive to provide a custom negation toggle template (NOT checkbox).
 *
 * @example
 * <ng-template qbNegationToggle let-value let-onChange="onChange">
 *   <label>
 *     <input type="checkbox" [checked]="value" (change)="onChange($event.target.checked)" />
 *     Negate
 *   </label>
 * </ng-template>
 */
@Directive({ selector: '[qbNegationToggle]' })
export class QbNegationToggleDirective {
  constructor(public readonly template: TemplateRef<NegationToggleContext>) {}

  static ngTemplateContextGuard(
    _dir: QbNegationToggleDirective,
    ctx: unknown
  ): ctx is NegationToggleContext {
    return true;
  }
}

/**
 * Directive to provide custom add buttons template.
 *
 * @example
 * <ng-template qbAddButtons let-onAddCondition="onAddCondition" let-onAddGroup="onAddGroup">
 *   <button (click)="onAddCondition()">New Rule</button>
 *   <button (click)="onAddGroup()">New Group</button>
 * </ng-template>
 */
@Directive({ selector: '[qbAddButtons]' })
export class QbAddButtonsDirective {
  constructor(public readonly template: TemplateRef<AddButtonsContext>) {}

  static ngTemplateContextGuard(
    _dir: QbAddButtonsDirective,
    ctx: unknown
  ): ctx is AddButtonsContext {
    return true;
  }
}

/**
 * Directive to provide a custom remove group button template.
 *
 * @example
 * <ng-template qbRemoveGroupButton let-depth="depth" let-onRemove="onRemove">
 *   <button (click)="onRemove()">Remove Group</button>
 * </ng-template>
 */
@Directive({ selector: '[qbRemoveGroupButton]' })
export class QbRemoveGroupButtonDirective {
  constructor(public readonly template: TemplateRef<RemoveGroupButtonContext>) {}

  static ngTemplateContextGuard(
    _dir: QbRemoveGroupButtonDirective,
    ctx: unknown
  ): ctx is RemoveGroupButtonContext {
    return true;
  }
}

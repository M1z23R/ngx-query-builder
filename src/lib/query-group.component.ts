import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  output,
  TemplateRef,
} from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { QueryConditionComponent } from './query-condition.component';
import {
  Conjunction,
  QueryGroup,
  QueryNode,
  QuerySchema,
  createEmptyCondition,
  createEmptyGroup,
  isCondition,
  isGroup,
} from './query-builder.types';
import {
  FieldSelectorContext,
  OperatorSelectorContext,
  QbValueInputDirective,
  RemoveButtonContext,
} from './query-builder.templates';

@Component({
  selector: 'qb-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UpperCasePipe, QueryConditionComponent],
  template: `
    <div class="qb-group" [class.qb-nested]="depth() > 0" [class.qb-negated]="group().negated">
      <div class="qb-group-header">
        <div class="qb-group-controls">
          <div class="qb-toggle-group">
            <span class="qb-toggle-label">Match</span>
            <div class="qb-toggle-buttons" role="radiogroup">
              <button
                type="button"
                role="radio"
                [attr.aria-checked]="group().conjunction === 'and'"
                [class.qb-active]="group().conjunction === 'and'"
                (click)="onConjunctionChange('and')"
              >
                All
              </button>
              <button
                type="button"
                role="radio"
                [attr.aria-checked]="group().conjunction === 'or'"
                [class.qb-active]="group().conjunction === 'or'"
                (click)="onConjunctionChange('or')"
              >
                Any
              </button>
            </div>
          </div>

          <label class="qb-checkbox-label">
            <input
              type="checkbox"
              [checked]="group().negated"
              (change)="onNegatedChange($event)"
            />
            NOT
          </label>
        </div>

        @if (depth() > 0) {
          <button
            type="button"
            class="qb-remove-group-btn"
            aria-label="Remove group"
            (click)="remove.emit()"
          >
            &times;
          </button>
        }
      </div>

      <div class="qb-children-list">
        @for (child of group().children; track $index) {
          @if (isCondition(child)) {
            <qb-condition
              [condition]="child"
              [index]="$index"
              [schema]="schema()"
              [fieldSelectorTpl]="fieldSelectorTpl()"
              [operatorSelectorTpl]="operatorSelectorTpl()"
              [valueInputTpls]="valueInputTpls()"
              [removeButtonTpl]="removeButtonTpl()"
              (conditionChange)="onChildChange($index, $event)"
              (remove)="removeChild($index)"
            />
          } @else if (isGroup(child)) {
            <qb-group
              [group]="child"
              [depth]="depth() + 1"
              [schema]="schema()"
              [fieldSelectorTpl]="fieldSelectorTpl()"
              [operatorSelectorTpl]="operatorSelectorTpl()"
              [valueInputTpls]="valueInputTpls()"
              [removeButtonTpl]="removeButtonTpl()"
              (groupChange)="onChildChange($index, $event)"
              (remove)="removeChild($index)"
            />
          }
          @if (!$last) {
            <div class="qb-conjunction-separator" aria-hidden="true">
              {{ group().conjunction | uppercase }}
            </div>
          }
        }
      </div>

      <div class="qb-group-actions">
        <button type="button" class="qb-add-btn" (click)="addCondition()">
          + Condition
        </button>
        <button type="button" class="qb-add-btn qb-add-group-btn" (click)="addGroup()">
          + Group
        </button>
      </div>
    </div>
  `,
  styles: `
    .qb-group {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 1rem;
      background: #fafafa;
    }

    .qb-group.qb-nested {
      margin-top: 0.5rem;
      background: #f0f4f8;
      border-color: #c0c8d0;
    }

    .qb-group.qb-negated {
      border-left: 3px solid #dc3545;
    }

    .qb-group-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #ddd;
    }

    .qb-group-controls {
      display: flex;
      gap: 1.5rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .qb-toggle-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .qb-toggle-label {
      font-weight: 500;
      font-size: 0.875rem;
      color: #333;
    }

    .qb-toggle-buttons {
      display: flex;
      border: 1px solid #ccc;
      border-radius: 4px;
      overflow: hidden;
    }

    .qb-toggle-buttons button {
      padding: 0.35rem 0.75rem;
      border: none;
      background: white;
      cursor: pointer;
      font-size: 0.8rem;
      transition: background 0.15s, color 0.15s;
    }

    .qb-toggle-buttons button:not(:last-child) {
      border-right: 1px solid #ccc;
    }

    .qb-toggle-buttons button:hover {
      background: #f0f0f0;
    }

    .qb-toggle-buttons button.qb-active {
      background: #0066cc;
      color: white;
    }

    .qb-toggle-buttons button:focus {
      outline: 2px solid #0066cc;
      outline-offset: -2px;
      z-index: 1;
      position: relative;
    }

    .qb-checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.875rem;
      color: #333;
    }

    .qb-checkbox-label input {
      width: 0.9rem;
      height: 0.9rem;
      cursor: pointer;
    }

    .qb-remove-group-btn {
      padding: 0.25rem 0.5rem;
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      line-height: 1;
    }

    .qb-remove-group-btn:hover {
      background: #c82333;
    }

    .qb-remove-group-btn:focus {
      outline: 2px solid #0066cc;
      outline-offset: 1px;
    }

    .qb-children-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .qb-conjunction-separator {
      font-size: 0.7rem;
      font-weight: 600;
      color: #666;
      padding-left: 0.5rem;
    }

    .qb-group-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .qb-add-btn {
      padding: 0.4rem 0.75rem;
      background: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
    }

    .qb-add-btn:hover {
      background: #218838;
    }

    .qb-add-btn:focus {
      outline: 2px solid #0066cc;
      outline-offset: 2px;
    }

    .qb-add-group-btn {
      background: #6c757d;
    }

    .qb-add-group-btn:hover {
      background: #5a6268;
    }
  `,
})
export class QueryGroupComponent {
  readonly group = model.required<QueryGroup>();
  readonly depth = input<number>(0);
  readonly schema = input.required<QuerySchema>();

  // Template inputs
  readonly fieldSelectorTpl = input<TemplateRef<FieldSelectorContext>>();
  readonly operatorSelectorTpl = input<TemplateRef<OperatorSelectorContext>>();
  readonly valueInputTpls = input<readonly QbValueInputDirective[]>([]);
  readonly removeButtonTpl = input<TemplateRef<RemoveButtonContext>>();

  readonly remove = output<void>();

  protected readonly isCondition = isCondition;
  protected readonly isGroup = isGroup;

  protected onConjunctionChange(conjunction: Conjunction): void {
    this.updateGroup({ conjunction });
  }

  protected onNegatedChange(event: Event): void {
    const negated = (event.target as HTMLInputElement).checked;
    this.updateGroup({ negated });
  }

  protected onChildChange(index: number, child: QueryNode): void {
    this.group.update(g => ({
      ...g,
      children: g.children.map((c, i) => (i === index ? child : c)),
    }));
  }

  protected addCondition(): void {
    this.group.update(g => ({
      ...g,
      children: [...g.children, createEmptyCondition()],
    }));
  }

  protected addGroup(): void {
    this.group.update(g => ({
      ...g,
      children: [...g.children, createEmptyGroup()],
    }));
  }

  protected removeChild(index: number): void {
    this.group.update(g => {
      const newChildren = g.children.filter((_, i) => i !== index);
      return {
        ...g,
        children: newChildren.length > 0 ? newChildren : [createEmptyCondition()],
      };
    });
  }

  private updateGroup(partial: Partial<QueryGroup>): void {
    this.group.update(g => ({ ...g, ...partial }));
  }
}

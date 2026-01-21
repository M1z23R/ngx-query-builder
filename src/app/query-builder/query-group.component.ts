import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  output,
} from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { QueryConditionComponent } from './query-condition.component';
import {
  Conjunction,
  QueryCondition,
  QueryGroup,
  QueryNode,
  createEmptyCondition,
  createEmptyGroup,
  isCondition,
  isGroup,
} from './query-schema.types';

@Component({
  selector: 'app-query-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UpperCasePipe, QueryConditionComponent],
  template: `
    <div class="query-group" [class.nested]="depth() > 0" [class.negated]="group().negated">
      <div class="group-header">
        <div class="group-controls">
          <div class="toggle-group">
            <span class="toggle-label">Match</span>
            <div class="toggle-buttons" role="radiogroup">
              <button
                type="button"
                role="radio"
                [attr.aria-checked]="group().conjunction === 'and'"
                [class.active]="group().conjunction === 'and'"
                (click)="onConjunctionChange('and')"
              >
                All
              </button>
              <button
                type="button"
                role="radio"
                [attr.aria-checked]="group().conjunction === 'or'"
                [class.active]="group().conjunction === 'or'"
                (click)="onConjunctionChange('or')"
              >
                Any
              </button>
            </div>
          </div>

          <label class="checkbox-label">
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
            class="remove-group-btn"
            aria-label="Remove group"
            (click)="remove.emit()"
          >
            &times;
          </button>
        }
      </div>

      <div class="children-list">
        @for (child of group().children; track $index) {
          @if (isCondition(child)) {
            <app-query-condition
              [condition]="child"
              [index]="$index"
              (conditionChange)="onChildChange($index, $event)"
              (remove)="removeChild($index)"
            />
          } @else if (isGroup(child)) {
            <app-query-group
              [group]="child"
              [depth]="depth() + 1"
              (groupChange)="onChildChange($index, $event)"
              (remove)="removeChild($index)"
            />
          }
          @if (!$last) {
            <div class="conjunction-separator" aria-hidden="true">
              {{ group().conjunction | uppercase }}
            </div>
          }
        }
      </div>

      <div class="group-actions">
        <button type="button" class="add-btn" (click)="addCondition()">
          + Condition
        </button>
        <button type="button" class="add-btn add-group-btn" (click)="addGroup()">
          + Group
        </button>
      </div>
    </div>
  `,
  styles: `
    .query-group {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 1rem;
      background: #fafafa;
    }

    .query-group.nested {
      margin-top: 0.5rem;
      background: #f0f4f8;
      border-color: #c0c8d0;
    }

    .query-group.negated {
      border-left: 3px solid #dc3545;
    }

    .group-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #ddd;
    }

    .group-controls {
      display: flex;
      gap: 1.5rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .toggle-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .toggle-label {
      font-weight: 500;
      font-size: 0.875rem;
      color: #333;
    }

    .toggle-buttons {
      display: flex;
      border: 1px solid #ccc;
      border-radius: 4px;
      overflow: hidden;
    }

    .toggle-buttons button {
      padding: 0.35rem 0.75rem;
      border: none;
      background: white;
      cursor: pointer;
      font-size: 0.8rem;
      transition: background 0.15s, color 0.15s;
    }

    .toggle-buttons button:not(:last-child) {
      border-right: 1px solid #ccc;
    }

    .toggle-buttons button:hover {
      background: #f0f0f0;
    }

    .toggle-buttons button.active {
      background: #0066cc;
      color: white;
    }

    .toggle-buttons button:focus {
      outline: 2px solid #0066cc;
      outline-offset: -2px;
      z-index: 1;
      position: relative;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.875rem;
      color: #333;
    }

    .checkbox-label input {
      width: 0.9rem;
      height: 0.9rem;
      cursor: pointer;
    }

    .remove-group-btn {
      padding: 0.25rem 0.5rem;
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      line-height: 1;
    }

    .remove-group-btn:hover {
      background: #c82333;
    }

    .remove-group-btn:focus {
      outline: 2px solid #0066cc;
      outline-offset: 1px;
    }

    .children-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .conjunction-separator {
      font-size: 0.7rem;
      font-weight: 600;
      color: #666;
      padding-left: 0.5rem;
    }

    .group-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .add-btn {
      padding: 0.4rem 0.75rem;
      background: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
    }

    .add-btn:hover {
      background: #218838;
    }

    .add-btn:focus {
      outline: 2px solid #0066cc;
      outline-offset: 2px;
    }

    .add-group-btn {
      background: #6c757d;
    }

    .add-group-btn:hover {
      background: #5a6268;
    }
  `,
})
export class QueryGroupComponent {
  readonly group = model.required<QueryGroup>();
  readonly depth = input<number>(0);

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

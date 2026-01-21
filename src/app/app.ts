import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { QueryBuilderComponent } from './query-builder/query-builder.component';
import { QueryGroup } from './query-builder/query-schema.types';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, JsonPipe, QueryBuilderComponent],
  template: `
    <main>
      <h1>Query Builder Demo</h1>

      <section aria-labelledby="demo-heading">
        <h2 id="demo-heading">Build a Query</h2>
        <app-query-builder [formControl]="queryControl" />
      </section>

      <section aria-labelledby="output-heading">
        <h2 id="output-heading">Current Value</h2>
        <pre><code>{{ queryControl.value | json }}</code></pre>
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

    pre {
      background: #f5f5f5;
      padding: 1rem;
      border-radius: 4px;
      overflow-x: auto;
    }
  `,
})
export class App {
  protected readonly queryControl = new FormControl<QueryGroup>({
    type: 'group',
    conjunction: 'and',
    negated: false,
    children: [{ type: 'condition', field: null, operator: null, value: null }],
  });
}

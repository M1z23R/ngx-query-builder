import { inject, InjectionToken } from '@angular/core';
import { QuerySchema } from './query-schema.types';
import { QuerySchemaService } from './query-schema.service';

export const QUERY_SCHEMA = new InjectionToken<QuerySchema>('QUERY_SCHEMA', {
  providedIn: 'root',
  factory: () => inject(QuerySchemaService),
});

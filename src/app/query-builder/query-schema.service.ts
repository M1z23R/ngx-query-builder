import { Injectable } from '@angular/core';
import {
  FIELDS,
  OPERATORS,
  FieldDef,
  OperatorDef,
  OperatorKey,
  InputType,
  getOperatorsForField,
  resolveValueInput,
  QuerySchema,
} from './query-schema.types';

@Injectable({ providedIn: 'root' })
export class QuerySchemaService extends QuerySchema {
  readonly fields: readonly FieldDef[] = FIELDS;
  readonly operators: Record<OperatorKey, OperatorDef> = OPERATORS;

  getFieldByKey(key: string): FieldDef | undefined {
    return this.fields.find((f) => f.key === key);
  }

  getOperatorByKey(key: OperatorKey): OperatorDef {
    return this.operators[key];
  }

  getOperatorsForField(field: FieldDef): [OperatorKey, OperatorDef][] {
    return getOperatorsForField(field);
  }

  resolveValueInput(field: FieldDef, operator: OperatorDef, _operatorKey?: OperatorKey): InputType | null {
    return resolveValueInput(field, operator);
  }
}

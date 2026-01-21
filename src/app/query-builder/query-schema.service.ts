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
} from './query-schema.types';

@Injectable({ providedIn: 'root' })
export class QuerySchemaService {
  readonly fields: readonly FieldDef[] = FIELDS;
  readonly operators = OPERATORS;

  getFieldByKey(key: string): FieldDef | undefined {
    return this.fields.find((f) => f.key === key);
  }

  getOperatorByKey(key: OperatorKey): OperatorDef {
    return this.operators[key];
  }

  getOperatorsForField(field: FieldDef): [OperatorKey, OperatorDef][] {
    return getOperatorsForField(field);
  }

  resolveValueInput(field: FieldDef, operator: OperatorDef): InputType | null {
    return resolveValueInput(field, operator);
  }
}

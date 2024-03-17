import * as z from 'zod';

function getShape<Schema extends z.ZodTypeAny>(schema: Schema) {
  // find actual shape definition
  let shape = schema;
  while (shape instanceof z.ZodObject || shape instanceof z.ZodEffects) {
    shape =
      shape instanceof z.ZodObject
        ? shape.shape
        : shape instanceof z.ZodEffects
        ? shape._def.schema
        : null;
    if (shape === null) {
      throw new Error(`Could not find shape`);
    }
  }
  return shape;
}

function mapObj<Key extends string, Value, MappedValue>(
  obj: Record<Key, Value>,
  cb: (entry: [Key, Value]) => MappedValue,
): Record<Key, MappedValue> {
  return Object.entries(obj).reduce((acc, entry) => {
    acc[entry[0] as Key] = cb(entry as [Key, Value]);
    return acc;
  }, {} as Record<Key, MappedValue>);
}

function transformDataValueBasedOnSchema(
  value: unknown,
  propertySchema: z.ZodTypeAny,
): unknown {
  if (propertySchema instanceof z.ZodEffects) {
    return transformDataValueBasedOnSchema(value, propertySchema.innerType());
  } else if (propertySchema instanceof z.ZodOptional) {
    return transformDataValueBasedOnSchema(value, propertySchema.unwrap());
  } else if (propertySchema instanceof z.ZodDefault) {
    return transformDataValueBasedOnSchema(
      value,
      propertySchema.removeDefault(),
    );
  } else if (propertySchema instanceof z.ZodArray) {
    if (!value || !Array.isArray(value)) {
      throw new Error('Expected array');
    }
    return value.map((v) =>
      transformDataValueBasedOnSchema(v, propertySchema.element),
    );
  } else if (propertySchema instanceof z.ZodObject) {
    throw new Error('Support object types');
  } else if (propertySchema instanceof z.ZodBoolean) {
    return Boolean(value);
  } else if (propertySchema instanceof z.ZodNumber) {
    if (value === null || value === '') {
      return undefined;
    } else {
      return Number(value);
    }
  } else if (propertySchema instanceof z.ZodString) {
    if (value === null) {
      return undefined;
    } else {
      return String(value);
    }
  } else {
    return value;
  }
}

function getValueBasedOnSchema<
  Value,
  Data extends {
    get: (key: string) => Value | null;
    getAll: (key: string) => Array<Value>;
  },
>(
  formData: Data,
  name: string,
  schema: z.ZodTypeAny,
): Value | Array<Value> | null | undefined {
  if (schema instanceof z.ZodEffects) {
    return getValueBasedOnSchema(formData, name, schema.innerType());
  } else if (schema instanceof z.ZodOptional) {
    return getValueBasedOnSchema(formData, name, schema.unwrap());
  } else if (schema instanceof z.ZodDefault) {
    return getValueBasedOnSchema(formData, name, schema.removeDefault());
  } else if (schema instanceof z.ZodArray) {
    return formData.getAll(name);
  } else {
    return formData.get(name);
  }
}

export function preprocessFormData<Schema extends z.ZodTypeAny>(
  formData: FormData,
  schema: Schema,
) {
  const shape = getShape(schema);
  return mapObj(shape, ([name, propertySchema]) =>
    transformDataValueBasedOnSchema(
      getValueBasedOnSchema(formData, String(name), propertySchema),
      propertySchema,
    ),
  );
}

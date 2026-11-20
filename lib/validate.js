/**
 * Validates tool arguments against a tool's JSON inputSchema.
 * Enforces required, type, enum, minimum, and maximum constraints, and applies defaults.
 * Throws an Error with a descriptive message naming the offending argument on failure.
 */
export function validate(schema, rawArgs = {}) {
  if (!schema || schema.type !== "object") return rawArgs;

  const args = { ...rawArgs };
  const properties = schema.properties || {};
  const required = schema.required || [];

  // 1. Required fields check
  for (const field of required) {
    if (args[field] === undefined || args[field] === null) {
      throw new Error(`Missing required argument: ${field}`);
    }
  }

  // 2. Validate provided arguments and assign defaults
  for (const [key, propSchema] of Object.entries(properties)) {
    const val = args[key];

    // Handle undefined: apply default if present
    if (val === undefined) {
      if (propSchema.default !== undefined) {
        args[key] = propSchema.default;
      }
      continue;
    }

    // Null checks for non-nullable schema types
    if (val === null) {
      throw new Error(`Argument "${key}" cannot be null; expected ${propSchema.type || "valid value"}`);
    }

    // Type validations
    if (propSchema.type) {
      if (propSchema.type === "string") {
        if (typeof val !== "string") {
          throw new Error(`Argument "${key}" must be a string, got ${typeof val}`);
        }
      } else if (propSchema.type === "number") {
        if (typeof val !== "number" || Number.isNaN(val) || !Number.isFinite(val)) {
          throw new Error(`Argument "${key}" must be a number, got ${typeof val}`);
        }
      } else if (propSchema.type === "integer") {
        if (typeof val !== "number" || !Number.isInteger(val)) {
          throw new Error(`Argument "${key}" must be an integer, got ${typeof val}`);
        }
      } else if (propSchema.type === "boolean") {
        if (typeof val !== "boolean") {
          throw new Error(`Argument "${key}" must be a boolean, got ${typeof val}`);
        }
      } else if (propSchema.type === "object") {
        if (typeof val !== "object" || Array.isArray(val)) {
          throw new Error(`Argument "${key}" must be an object, got ${typeof val}`);
        }
      } else if (propSchema.type === "array") {
        if (!Array.isArray(val)) {
          throw new Error(`Argument "${key}" must be an array, got ${typeof val}`);
        }
      }
    }

    // Enum validation
    if (propSchema.enum && Array.isArray(propSchema.enum)) {
      if (!propSchema.enum.includes(val)) {
        throw new Error(`Argument "${key}" must be one of [${propSchema.enum.join(", ")}], got "${val}"`);
      }
    }

    // Minimum constraint
    if (propSchema.minimum !== undefined && typeof val === "number") {
      if (val < propSchema.minimum) {
        throw new Error(`Argument "${key}" must be at least ${propSchema.minimum}, got ${val}`);
      }
    }

    // Maximum constraint
    if (propSchema.maximum !== undefined && typeof val === "number") {
      if (val > propSchema.maximum) {
        throw new Error(`Argument "${key}" must be at most ${propSchema.maximum}, got ${val}`);
      }
    }
  }

  return args;
}

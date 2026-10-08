function invalidOrder(message) {
  const error = new Error(message);
  error.statusCode = 400;
  error.code = "INVALID_ORDER";
  return error;
}

function normalizeOptionalString(value, fieldName, itemNumber) {
  if (value === undefined || value === null) return "";

  if (typeof value !== "string") {
    throw invalidOrder(`Item ${itemNumber} ${fieldName} must be a string`);
  }

  return value.trim();
}

function normalizeItem(item, index) {
  const itemNumber = index + 1;

  if (!item || typeof item !== "object" || Array.isArray(item)) {
    throw invalidOrder(`Item ${itemNumber} must be an object`);
  }

  const name = typeof item.name === "string" ? item.name.trim() : "";

  if (!name) {
    throw invalidOrder(`Item ${itemNumber} must have a non-empty name`);
  }

  const quantity =
    item.quantity === undefined || item.quantity === null
      ? 1
      : item.quantity;

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw invalidOrder(`Item ${itemNumber} quantity must be a positive number`);
  }

  if (item.includes !== undefined && !Array.isArray(item.includes)) {
    throw invalidOrder(`Item ${itemNumber} includes must be an array`);
  }

  const includes = (item.includes ?? []).map((value) => {
    if (typeof value !== "string") {
      throw invalidOrder(`Item ${itemNumber} includes must contain strings`);
    }

    return value.trim();
  }).filter(Boolean);

  return {
    name,
    quantity,
    size: normalizeOptionalString(item.size, "size", itemNumber),
    includes,
    specialInstructions: normalizeOptionalString(
      item.specialInstructions,
      "specialInstructions",
      itemNumber,
    ),
  };
}

export function finalizeOrder(request, response, next) {
  try {
    const body = request.body;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw invalidOrder("Order body is required");
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      throw invalidOrder("Order must contain at least one item");
    }

    const status =
      typeof body.status === "string" ? body.status.trim().toLowerCase() : "";

    if (status !== "confirmed") {
      throw invalidOrder("Order status must be confirmed");
    }

    const items = body.items.map(normalizeItem);
    const totalItems = items.reduce(
      (total, item) => total + item.quantity,
      0,
    );

    response.status(200).json({
      success: true,
      order: {
        customerIntent: "place_order",
        items,
        status: "confirmed",
        totalItems,
      },
    });
  } catch (error) {
    next(error);
  }
}

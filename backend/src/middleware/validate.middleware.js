const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues,
      });
    }

    if (source === "body") {
      req.body = result.data;
    } else if (source === "params") {
      req.params = result.data;
    } else if (source === "query") {
      req.validatedQuery = result.data;
    }

    next();
  };
};

export default validate;
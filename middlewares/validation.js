const yup = require("yup")

// Base rules of each fields
// https://v-max.atlassian.net/wiki/spaces/VTT1/pages/18579515/Error+code+and+Input+Validation

// Javascript automatically convert year 0000 to 1900 when creating new Date()
// Need to check it manually
const date_rule = yup.string().
  // Check if date is in YYYY-MM-DD form
  matches(/^\d{4}-\d{2}-\d{2}$/, "date must be in YYYY-MM-DD format").
  // Check if the date within 1900-01-01 and today
  test("test date range", "date out of range",
    value => {
      // Skip validation if the value is not provided
      if (!value) return true;

      // Check year first
      const year = parseInt(value.substring(0, 4), 10);
      if (year < 1900) {
        return false;
      }
      // Try to convert it to date
      try {
        const date = new Date(value)
        // Date invalid
        if (isNaN(date)) {
          return False
        }

        if (date < new Date(1900, 0, 1) || date > new Date()) {
          return false;
        }
        return true;
      } catch (error) {
        return false;
      }
    }
  )

const rules = {
  id: yup.number().min(1),
  first_name: yup.string().min(1).max(100),
  last_name: yup.string().min(1).max(100),
  gender: yup.number().oneOf([0, 1, 2]),
  email: yup.string().email().max(254),
  date_of_birth: date_rule,
  start_date: date_rule,
  end_date: date_rule,
  document_type: yup.number().oneOf([1, 2, 3, 4, 5]),
  side: yup.string().oneOf(["front", "back"]),
  physical_address: yup.object({
    address1: yup.string().max(200).required(),
    address2: yup.string().max(200), // Assume address 2 is optional
    city: yup.string().max(50).required(),
    province: yup.string().max(50).required(),
    postal: yup.string().max(20).required()
  }),
  cognito_id: yup.string().max(100)
  // TODO
  // add the following schema below
  // "phone": yup.string().phone(), // currently not available
}

// Method to create a schema with optional requirement
const createSchema = (fields) => {
  let schemaFields = {
    body: {},
    params: {},
    query: {},
  };

  // Create validators of each fields in body and params
  for (const part in fields) {
    for (const field in fields[part]) {
      if (rules[field]) {
        // Get basic rule of the field
        let validator = rules[field];
        // Add required if specified
        if (fields[part][field]) {
          validator = validator.required();
        }

        // Add the composed validator into the schema
        schemaFields[part][field] = validator;
      }
    }
  }

  return yup.object().shape({
    params: yup.object().shape(schemaFields.params),
    query: yup.object().shape(schemaFields.query),
    body: yup.object().shape(schemaFields.body),
  });
};

// Validate method
const validate = (schema) => async (req, res, next) => {
    try {
      await schema.validate({
        params: req.params,
        query: req.query,
        body: req.body
      });
      next();
    } catch (error) {
      // General Error message for field value error
      return res.status(400).json({
        code: 400,
        message: `Invalid value. ${error.message}`
      });
    }
};

module.exports = {
  createSchema,
  validate
};


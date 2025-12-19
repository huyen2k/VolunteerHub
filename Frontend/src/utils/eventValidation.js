import Joi from "joi";

// Joi schema for event validation
export const eventSchema = Joi.object({
  title: Joi.string().min(3).max(200).required().messages({
    "string.empty": "Tiêu đề không được để trống",
    "string.min": "Tiêu đề phải có ít nhất 3 ký tự",
    "string.max": "Tiêu đề không được vượt quá 200 ký tự",
    "any.required": "Tiêu đề là bắt buộc",
  }),
  description: Joi.string().min(10).max(2000).required().messages({
    "string.empty": "Mô tả không được để trống",
    "string.min": "Mô tả phải có ít nhất 10 ký tự",
    "string.max": "Mô tả không được vượt quá 2000 ký tự",
    "any.required": "Mô tả là bắt buộc",
  }),
  date: Joi.date().greater("now").required().messages({
    "date.base": "Ngày phải là một ngày hợp lệ",
    "date.greater": "Ngày phải là ngày trong tương lai",
    "any.required": "Ngày là bắt buộc",
  }),
  location: Joi.string().min(5).max(200).required().messages({
    "string.empty": "Địa điểm không được để trống",
    "string.min": "Địa điểm phải có ít nhất 5 ký tự",
    "string.max": "Địa điểm không được vượt quá 200 ký tự",
    "any.required": "Địa điểm là bắt buộc",
  }),
  category: Joi.string().min(2).max(100).optional().messages({
    "string.min": "Danh mục phải có ít nhất 2 ký tự",
    "string.max": "Danh mục không được vượt quá 100 ký tự",
  }),
  image: Joi.string().uri().allow("").allow(null).optional().messages({
    "string.uri": "URL hình ảnh không hợp lệ",
  }),
  maxVolunteers: Joi.number().integer().min(1).optional().messages({
    "number.base": "Số người tối đa phải là số",
    "number.min": "Số người tối đa phải lớn hơn 0",
    "number.integer": "Số người tối đa phải là số nguyên",
  }),
});

// Validate entire event object
export const validateEvent = (data) => {
  const { error, value } = eventSchema.validate(data, { abortEarly: false, allowUnknown: true });
  return {
    error,
    value,
    isValid: !error,
  };
};

// Validate a single field
export const validateEventField = (field, value) => {
  const fieldSchema = Joi.object({
    [field]: eventSchema.extract(field),
  });
  const { error } = fieldSchema.validate({ [field]: value });
  return {
    error: error ? error.details[0]?.message : null,
    isValid: !error,
  };
};

// Get all validation errors as an object
export const getValidationErrors = (data) => {
  const { error } = eventSchema.validate(data, { abortEarly: false });
  if (!error) return {};

  const errors = {};
  error.details.forEach((detail) => {
    const field = detail.path[0];
    errors[field] = detail.message;
  });
  return errors;
};

import joi from "joi";

// check if schema of sending contact us data is correct
// implemented at contact-us form 
export let emailSchemaContact = joi.object({
  name: joi.string().required(),
  email: joi.string().min(5).max(50).email().message({
    "string.email": "Email must be valid ",
  }),
  subject: joi.string().required(),
  message: joi.string().required(),
});

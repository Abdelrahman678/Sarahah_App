import Joi from "joi";

const ageRule = (value, helper) => {
    if(value < 18){
        return helper.error("any.invalid", "Age must be at least 18")
    }
    return value;
}
export const signUpSchema = {
    body: Joi.object({
        username: Joi.string().required().messages({
            "any.required": "Username is required",
            "string.base": "Username must be a string"
        }),
        email: Joi.string().email(
            {
                tlds: {
                    allow: ['com', 'net', 'org', 'edu'],
                    // deny: ['example']
                },
                minDomainSegments: 2,
                maxDomainSegments: 3
            }
        ).required(),
        password: Joi.string().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
        phone: Joi.string().required(),
        age: Joi.number().custom(ageRule).required()
    }).options({presence: "required"})
    //.options({presence: "required"}) ==> all in the object are required
    // .with("password","confirmPassword") ==> if there is password ,confirmPassword is required else it is not required
}

// ---- .when() -----
/* const schema = {
    min: Joi.number(),
    max: Joi
        .number()
        .when('min', { 
		       is: Joi.number().integer().greater(10), 
		       then: Joi.number().greater( Joi.ref('min')) , 
		       otherwise: Joi.number().integer().less(10)
       })
}; */

export const validationMiddleware = (schema) => {
    return (req, res, next) => {
        const schemaKey = Object.keys(schema) // Array whith keys that have a schema from ["body","query", "params", "headers"]
        // console.log("schemaKey", schemaKey);

        let validationErrors = []
        for (const key of schemaKey) {
            // console.log("key", key);
            const {error} = schema[key].validate(req[key], {abortEarly:false});
            if (error) {
                validationErrors.push(error.details)
            }
        }
        if (validationErrors.length) {
            return res.status(400).json({message: "Validation Error", validationErrors})
        }
        next();
    }
    
}

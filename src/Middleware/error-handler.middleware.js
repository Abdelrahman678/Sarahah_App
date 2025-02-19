export const errorHandlerMiddleware = (api) => {
    return async (req, res, next) => {

        api(req, res, next).catch(error => {
            console.log(`Error in ${req.url} from error handler middleware`, error);
            return next(new Error(error.message, {cause: error}));
        }) 
    }
}

export const globalErrorHandlerMiddleware = (err, req, res, next) => {
    console.log(`Global error handler: ${err.message}`);
    return res.status(500).json({
        message: "something went wrong",
        err: err.message
    }) 
}
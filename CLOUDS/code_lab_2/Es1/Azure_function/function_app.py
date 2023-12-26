import azure.functions as func
import logging
import json
import numpy as np

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

def function(x):
    return np.abs(np.sin(x))

def trapezoidal_rule(x1, x2, N):
    x_values = np.linspace(x1, x2, N)
    step = (x2 - x1) / N
    x_values=x_values[:-1]+0.5*step
    f_values = function(x_values)
    integral = np.sum(f_values * step)
    return integral

@app.route(route='numericalintegralservice/{lower}/{upper}', methods=['GET'])
def numerical_integration_service(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')
    results = []
    lower=req.route_params.get('lower')
    upper=req.route_params.get('upper')
    if lower is None or upper is None:
        return func.HttpResponse("error: missing parameters",status_code=400)
    try:
        x1 = float(lower)
        x2 = float(upper)
    except ValueError as e:
        return func.HttpResponse("error: not convertible parameters",status_code=400)
    for N in (10, 100, 1000, 10**4, 10**5, 10**6):
        integral = trapezoidal_rule(x1, x2, N)
        results.append(integral)
    return func.HttpResponse(json.dumps(results),status_code=200, mimetype="application/json")

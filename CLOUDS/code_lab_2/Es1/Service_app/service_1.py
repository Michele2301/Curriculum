import numpy as np
from flask import Flask, request, jsonify

app = Flask(__name__)

def func(x):
    return np.abs(np.sin(x))

def trapezoidal_rule(x1, x2, N):
    x_values = np.linspace(x1, x2, N)
    step = (x2 - x1) / N
    x_values=x_values[:-1]+0.5*step
    f_values = func(x_values)
    integral = np.sum(f_values * step)
    return integral

@app.route('/numericalintegralservice/<lower>/<upper>', methods=['GET'])
def numerical_integration_service(lower, upper):
    results = []
    x1 = float(lower)
    x2 = float(upper)
    for N in (10, 100, 1000, 10**4, 10**5, 10**6):
        integral = trapezoidal_rule(x1, x2, N)
        results.append(integral)
    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=False)


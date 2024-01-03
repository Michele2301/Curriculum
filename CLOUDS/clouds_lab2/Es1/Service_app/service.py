import numpy as np
import math
from flask import Flask, request, jsonify
app = Flask(__name__)

def func(x):
    return abs(math.sin(x))

def trapezoidal_rule(x1, x2, N):
    step = (x2 - x1) / N
    integral = 0
    for i in range(0,N-1):
        integral += step * (func(x1 + i * step) + func(x1 + (i + 1) * step)) / 2
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
    app.run(debug=True)


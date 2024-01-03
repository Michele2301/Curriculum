import time
from locust import HttpUser, task, between

class QuickstartUser(HttpUser):
    host="http://20.216.130.25:5000"
    @task
    def hello_world(self):
        self.client.get("/numericalintegralservice/0/3.14159")

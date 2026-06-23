from locust import HttpUser, task, between

class WebsiteUser(HttpUser):
    wait_time = between(0.1, 0.3)

    @task(3)
    def get_jobs(self):
        self.client.get("/api/jobs/")
        
    @task(1)
    def get_companies(self):
        self.client.get("/api/companies/")

import smtplib
from decouple import config, AutoConfig
config = AutoConfig(search_path='.')

user = config('EMAIL_HOST_USER')
pwd = config('EMAIL_HOST_PASSWORD')
host = config('EMAIL_HOST')
port = config('EMAIL_PORT', cast=int)

print(f"Testing SMTP with: {user} / {pwd} at {host}:{port}")

try:
    server = smtplib.SMTP(host, port)
    server.set_debuglevel(1)
    server.starttls()
    server.login(user, pwd)
    print("Success!")
    server.quit()
except Exception as e:
    print(f"Failed: {e}")

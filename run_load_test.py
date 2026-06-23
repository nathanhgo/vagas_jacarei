import os
import sys
import subprocess

def check_locust():
    try:
        import locust
        return True
    except ImportError:
        return False

def install_locust():
    print("Locust nao detectado.")
    resposta = input("Deseja instalar o locust agora? (s/n): ")
    if resposta.lower() in ['s', 'sim', 'y', 'yes']:
        print("Instalando Locust...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "locust"])
            print("Locust instalado com sucesso.")
            return True
        except subprocess.CalledProcessError:
            print("Erro ao tentar instalar o Locust.")
            return False
    else:
        print("Instalacao cancelada.")
        return False

def create_locustfile():
    locustfile_content = """from locust import HttpUser, task, between

class WebsiteUser(HttpUser):
    wait_time = between(1, 5)

    @task(3)
    def get_jobs(self):
        self.client.get("/api/jobs/")
        
    @task(1)
    def get_companies(self):
        self.client.get("/api/companies/")
"""
    if not os.path.exists("locustfile.py"):
        with open("locustfile.py", "w", encoding="utf-8") as f:
            f.write(locustfile_content)
        print("Arquivo locustfile.py criado na raiz do projeto apontando para /api/jobs/ e /api/companies/.")

def run_load_test():
    create_locustfile()

    users = 125
    spawn_rate = 10
    run_time = "30s"
    host = "http://localhost:8000"
    html_report = "load_test_report.html"

    print("Iniciando Teste de Carga...")
    print(f"Alvo: {host}")
    print(f"Usuarios Simultaneos: {users}")
    print(f"Duracao: {run_time}")

    cmd = [
        sys.executable, "-m", "locust",
        "-f", "locustfile.py",
        "--headless",
        "-u", str(users),
        "-r", str(spawn_rate),
        "--run-time", run_time,
        "--html", html_report,
        "--csv", "load_test_report",
        "--host", host
    ]

    try:
        subprocess.run(cmd, capture_output=True, text=True)
        
        reqs = "0"
        fails = "0.00%"
        
        csv_file = "load_test_report_stats.csv"
        if os.path.exists(csv_file):
            with open(csv_file, "r", encoding="utf-8") as f:
                for line in f:
                    if "Aggregated" in line:
                        parts = line.strip().split(',')
                        try:
                            # A linha CSV tem a estrutura: "Type","Name",Request Count,Failure Count,...
                            # Exemplo: "","Aggregated",3600,0,...
                            reqs_count = int(parts[2].strip('"'))
                            fails_count = int(parts[3].strip('"'))
                            fails_pct = (fails_count / reqs_count) * 100 if reqs_count > 0 else 0
                            
                            reqs = str(reqs_count)
                            fails = f"{fails_pct:.2f}%"
                        except:
                            pass
        
        print("\nRELATORIO FINAL")
        resultado_texto = f"{reqs} requisicoes · {fails} falha sob {users} usuarios simultaneos"
        print(f"RESULTADO: {resultado_texto}")
        print(f"Relatorio salvo em: {html_report}")

        if os.path.exists(html_report):
            with open(html_report, "r", encoding="utf-8") as f:
                html_content = f.read()
            
            banner_html = f'<div style="text-align: center; font-family: sans-serif; font-size: 28px; font-weight: bold; color: #333; padding: 20px; background-color: #e9ecef; border-bottom: 2px solid #ccc;">{resultado_texto}</div>'
            html_content = html_content.replace("<body>", f"<body>\n{banner_html}")
            
            with open(html_report, "w", encoding="utf-8") as f:
                f.write(html_content)

    except KeyboardInterrupt:
        print("\nTeste interrompido.")
    except Exception as e:
        print(f"\nErro ao executar o teste: {e}")

if __name__ == "__main__":
    if not check_locust():
        if not install_locust():
            sys.exit(1)
    
    run_load_test()

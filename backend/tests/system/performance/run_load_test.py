import os
import sys
import subprocess
import argparse

def check_locust():
    try:
        import locust
        return True
    except ImportError:
        return False

def run_performance_test(test_type):
    # Diretório atual deste script
    base_dir = os.path.dirname(os.path.abspath(__file__))
    locustfile_path = os.path.join(base_dir, "locustfile.py")

    # Verifica se locustfile existe, se não, cria.
    if not os.path.exists(locustfile_path):
        locustfile_content = """from locust import HttpUser, task, between\n\nclass WebsiteUser(HttpUser):\n    wait_time = between(1, 5)\n\n    @task(3)\n    def get_jobs(self):\n        self.client.get("/api/jobs/")\n        \n    @task(1)\n    def get_companies(self):\n        self.client.get("/api/companies/")\n"""
        with open(locustfile_path, "w", encoding="utf-8") as f:
            f.write(locustfile_content)

    # Configurações para cada tipo de teste
    configs = {
        "carga": {"users": 125, "spawn_rate": 10, "run_time": "30s"},
        "estresse": {"users": 500, "spawn_rate": 50, "run_time": "30s"},
        "capacidade": {"users": 1000, "spawn_rate": 100, "run_time": "30s"},
        "resistencia": {"users": 50, "spawn_rate": 5, "run_time": "2m"},
        "volume": {"users": 200, "spawn_rate": 20, "run_time": "45s"}
    }

    if test_type not in configs:
        print(f"Tipo de teste desconhecido: {test_type}. Escolha entre: {', '.join(configs.keys())}")
        return

    config = configs[test_type]
    users = config["users"]
    spawn_rate = config["spawn_rate"]
    run_time = config["run_time"]
    
    # Se rodar via docker-compose exec backend, o host local é o próprio backend na porta 8000
    host = "http://localhost:8000"
    
    report_prefix = os.path.join(base_dir, f"report_{test_type}")
    html_report = f"{report_prefix}.html"

    print(f"Iniciando Teste de {test_type.upper()}...")
    print(f"Alvo: {host}")
    print(f"Usuarios Simultaneos: {users}")
    print(f"Duracao: {run_time}")

    cmd = [
        sys.executable, "-m", "locust",
        "-f", locustfile_path,
        "--headless",
        "-u", str(users),
        "-r", str(spawn_rate),
        "--run-time", run_time,
        "--html", html_report,
        "--csv", report_prefix,
        "--host", host
    ]

    try:
        subprocess.run(cmd, capture_output=True, text=True)
        print(f"\nTeste concluído! Relatorio salvo em: {html_report}")
    except KeyboardInterrupt:
        print("\nTeste interrompido.")
    except Exception as e:
        print(f"\nErro ao executar o teste: {e}")

if __name__ == "__main__":
    if not check_locust():
        print("Locust não detectado. Instale as dependências com: pip install -r requirements.txt")
        sys.exit(1)
    
    parser = argparse.ArgumentParser(description="Executa testes de desempenho com Locust.")
    parser.add_argument("--type", choices=["carga", "estresse", "capacidade", "resistencia", "volume"], 
                        default="carga", help="Tipo de teste de desempenho a executar")
    
    args = parser.parse_args()
    run_performance_test(args.type)

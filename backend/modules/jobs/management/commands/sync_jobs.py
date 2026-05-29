from django.core.management.base import BaseCommand
from modules.jobs.services import JobSyncService

class Command(BaseCommand):
    help = "Sincroniza vagas de emprego de fontes externas (Adzuna ou fallback mockado)"

    def handle(self, *args, **options):
        self.stdout.write("Iniciando sincronização de vagas externas...")
        
        # Chama o serviço que decide se usa a API real ou o mock como fallback
        total_sincronizado = JobSyncService.sync_from_adzuna()
        
        if total_sincronizado > 0:
            self.stdout.write(self.style.SUCCESS(f"Sincronização concluída! {total_sincronizado} vagas salvas no banco."))
        else:
            self.stdout.write(self.style.WARNING("Nenhuma vaga foi sincronizada."))

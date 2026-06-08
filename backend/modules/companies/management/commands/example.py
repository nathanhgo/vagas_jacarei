from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Management command for companies"

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Companies management command"))

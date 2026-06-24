"""
pytest configuration file.
Defines fixtures shared across all tests.
"""

import sys
import os
import pytest

# HACK PARA O MUTMUT:
# Como o mutmut roda o pytest de dentro da pasta 'mutants', precisamos garantir
# que o Python priorize essa pasta na hora de importar, caso contrário ele
# vai carregar os arquivos originais do projeto e o teste forçado de falha vai passar.
if "mutants" in os.getcwd():
    sys.path.insert(0, os.getcwd())



@pytest.fixture
def api_client():
    """DRF APIClient fixture for testing API endpoints directly."""
    from rest_framework.test import APIClient

    return APIClient()

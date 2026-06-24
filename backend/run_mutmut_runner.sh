#!/bin/bash
# Este script é chamado pelo mutmut de dentro da pasta 'mutants/'
# Copiamos o arquivo mutado para a pasta real do projeto para que o Django o encontre
cp modules/jobs/services.py ../modules/jobs/services.py

# Rodamos o pytest na pasta raiz do projeto
cd ..
pytest tests/unit/
RET=$?

# Restauramos o arquivo original usando o git
git checkout modules/jobs/services.py

# Retornamos o exit code do pytest para o mutmut saber se o mutante sobreviveu ou morreu
exit $RET

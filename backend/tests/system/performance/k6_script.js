import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '10s', target: 50 }, // Ramp-up para 50 usuários em 10s
        { duration: '20s', target: 50 }, // Mantém 50 usuários por 20s
        { duration: '10s', target: 0 },  // Ramp-down para 0 usuários em 10s
    ],
};

export default function () {
    // Alvo é o host docker (host.docker.internal ou o IP que resolve pro backend)
    // Usaremos a URL base que será passada via variável de ambiente, padrão é http://host.docker.internal:8000
    const BASE_URL = __ENV.BASE_URL || 'http://host.docker.internal:8000';
    
    const responses = http.batch([
        ['GET', `${BASE_URL}/api/jobs/`],
        ['GET', `${BASE_URL}/api/companies/`]
    ]);

    check(responses[0], {
        'jobs status is 200': (r) => r.status === 200,
    });
    
    check(responses[1], {
        'companies status is 200': (r) => r.status === 200,
    });

    sleep(1);
}

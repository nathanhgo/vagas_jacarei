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

export function handleSummary(data) {
    const totalReqs = data.metrics.http_reqs ? data.metrics.http_reqs.values.count : 0;
    const failures = data.metrics.http_req_failed ? data.metrics.http_req_failed.values.passes : 0;
    const failRate = totalReqs > 0 ? ((failures / totalReqs) * 100).toFixed(2) : 0;
    const avgRt = data.metrics.http_req_duration ? data.metrics.http_req_duration.values.avg.toFixed(2) : 0;
    
    let summary = '\n' + '='.repeat(45) + '\n';
    summary += '📊 RESUMO DE DESEMPENHO (k6)\n';
    summary += '='.repeat(45) + '\n';
    summary += `🔹 Duração Total: 40s (10s ramp-up, 20s hold, 10s ramp-down)\n`;
    summary += `🔹 Pico de Usuários: 50\n`;
    summary += `🔹 Total de Requisições: ${totalReqs}\n`;
    summary += `🔹 Taxa de Falha: ${failRate}% (${failures} falhas)\n`;
    summary += `🔹 Tempo Médio de Resposta: ${avgRt} ms\n`;
    summary += '='.repeat(45) + '\n';
    
    return {
        'stdout': summary
    };
}

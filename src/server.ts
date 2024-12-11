import { HttpService } from './services/http.service';

async function main() {
    const httpService = new HttpService();
    await httpService.start();
}

main().catch((error) => {
    console.error('Failed to start application:', error);
    process.exit(1);
});
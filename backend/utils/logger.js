import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDir = path.join(__dirname, '..', 'logs');

// Create logs directory if it doesn't exist
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

class Logger {
    constructor() {
        this.logFile = path.join(logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
    }

    formatMessage(level, message) {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${level}] ${message}\n`;
    }

    writeToFile(message) {
        fs.appendFileSync(this.logFile, message, 'utf8');
    }

    info(message) {
        const formatted = this.formatMessage('INFO', message);
        console.log(formatted.trim());
        this.writeToFile(formatted);
    }

    error(message, error = null) {
        const errorMsg = error ? `${message}: ${error.message}` : message;
        const formatted = this.formatMessage('ERROR', errorMsg);
        console.error(formatted.trim());
        this.writeToFile(formatted);
        
        if (error && error.stack) {
            this.writeToFile(error.stack + '\n');
        }
    }

    warn(message) {
        const formatted = this.formatMessage('WARN', message);
        console.warn(formatted.trim());
        this.writeToFile(formatted);
    }

    debug(message) {
        if (process.env.NODE_ENV === 'development') {
            const formatted = this.formatMessage('DEBUG', message);
            console.log(formatted.trim());
            this.writeToFile(formatted);
        }
    }
}

export default new Logger();
import { URI } from "vs/base/common/uri";
import { AbstractLoggerService, ConsoleMainLogger, ILogger, ILoggerOptions, ILoggerService, ILogService, LogLevel } from "vs/platform/log/common/log";

export class ConsoleLoggerService extends AbstractLoggerService implements ILoggerService {
    constructor(
		@ILogService logService: ILogService,
	) {
		super(logService.getLevel(), logService.onDidChangeLogLevel);
	}

	protected doCreateLogger(resource: URI, logLevel: LogLevel, options?: ILoggerOptions): ILogger {
		return new ConsoleMainLogger();
	}

}
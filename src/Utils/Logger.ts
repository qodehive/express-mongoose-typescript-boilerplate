import * as stackTrace from "stack-trace";
import Winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import clsTracer from "cls-rtracer";

// adding the ability to focus or ignore messages.
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

Winston.addColors(colors);

const consoleTransport = new Winston.transports.Console({
  format: Winston.format.combine(
    Winston.format.colorize({
      all: true,
    }),
  ),
  handleExceptions: true,
  handleRejections: true,
});

const fileRotationWarnTransport = new DailyRotateFile({
  level: "warn",
  filename: "warn-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "100m",
  maxFiles: "90d",
  dirname: "WinstonLogs",
  zippedArchive: true,
});

const fileRotationCombinedTransport = new DailyRotateFile({
  filename: "combined-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "100m",
  maxFiles: "30d",
  dirname: "WinstonLogs",
  handleExceptions: true,
  handleRejections: true,
  zippedArchive: true,
});

// fileRotationCombinedTransport.on("rotate", function (oldFilename, newFilename) {
//   // call function like upload to s3 or on cloud
// });

const myFormatter = Winston.format((info) => {
  const rid = clsTracer.id();
  if (rid) {
    info.requestId = rid;
  }
  return info;
})();

const winstonLogger = Winston.createLogger({
  level: "silly", //to print all the log levels,
  format: Winston.format.combine(
    myFormatter,
    Winston.format.timestamp(),
    Winston.format.json({ deterministic: false, space: 1 }),
  ), //print in json format along with timestamp
  transports: [consoleTransport, fileRotationWarnTransport, fileRotationCombinedTransport],
});

interface ErrorInfoI {
  message: string;
  error: any;
  extraData: any;
  stack: any;
  // trace: any[];
}

/**
 * Get the readable details of the erorr
 * @param {any} errObj - error data object,from which we will extract the error info
 * @returns {ErrorInfoI} the error indo
 */
function getErrorInfo(errObj: any): ErrorInfoI {
  let errorInfo: ErrorInfoI | undefined;

  if (errObj && errObj instanceof Error) {
    const error = errObj;
    errorInfo = {
      message: error.message ? error.message : "No message",
      error: error,
      extraData: null,
      // trace: getTrace(error),
      stack: error.stack,
    };
  }

  if (errObj && !(errObj instanceof Error) && typeof errObj == "object") {
    for (const key in errObj) {
      if (errObj.hasOwnProperty(key)) {
        if (errObj[key] instanceof Error) {
          // const error=errObj[key];

          const { [key]: error, ...extraData } = errObj;

          errorInfo = {
            message: error.message ? error.message : "No message",
            error: error,
            extraData,
            // trace: getTrace(error),
            stack: error.stack,
          };
          break;
        }
      }
    }
  }

  if (!errorInfo) {
    errorInfo = {
      message: "No message",
      error: null,
      extraData: errObj,
      // trace: [null],
      stack: null,
    };
  }

  return errorInfo;
}

/**
 * Get the trace information of the error object
 * @param {Error} err  - the error object
 * @returns
 */
function getTrace(err: Error) {
  const trace = err ? stackTrace.parse(err) : stackTrace.get();
  return trace.map(function (site: any) {
    return {
      column: site.getColumnNumber(),
      file: site.getFileName(),
      function: site.getFunctionName(),
      line: site.getLineNumber(),
      method: site.getMethodName(),
      native: site.isNative(),
    };
  });
}

/**
 * Wrapper on the winston Logger Module
 */
export const Logger = {
  info: (input: { message: string; data?: any; tag: string }) => {
    const logData = {
      tag: input.tag,
      message: input.message,
      data: input.data,
    };

    winstonLogger.info(logData);
  },

  /**
   * Logs the error info along with extra data provided
   * @param input
   */
  warn: (input: { message: string; error: any; tag: string }) => {
    const errorInfo: ErrorInfoI = getErrorInfo(input.error);

    const logData = {
      tag: input.tag,
      message: input.message,
      errorData: errorInfo,
    };

    winstonLogger.error(logData);
  },

  http: winstonLogger.http.bind(winstonLogger),
};

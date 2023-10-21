import cp from 'child_process';

export interface ExecResult {
  stdout: string;
  stderr: string;
}

export function asyncExec(command: string) {
  return new Promise<ExecResult>((res, rej) => {
    cp.exec(command, (err, stdout, stderr) => {
      if (err !== null) rej(err);

      res({ stderr, stdout });
    });
  });
}
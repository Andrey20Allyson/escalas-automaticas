export abstract class IntegrityInconsistence {
  private _messages?: string[] | string;
  accumulate: number = 1;

  constructor(
    readonly name: string,
    message?: string,
  ) {
    if (message) this._addMessage(message);
  }

  join(inconsistence: IntegrityInconsistence) {
    if (inconsistence._messages) this._addMessage(inconsistence._messages);

    this.accumulate += inconsistence.accumulate;
  }

  private _addMessage(messageOrMessages: string | string[]) {
    if (this._messages === undefined) {
      this._messages = [];
    }

    if (typeof this._messages === 'string') {
      this._messages = [this._messages];
    }

    if (typeof messageOrMessages === 'string') {
      this._messages.push(messageOrMessages);
      return;
    }

    for (const message of messageOrMessages) {
      this._messages.push(message);
    }
  }

  getMessages(): readonly string[] {
    if (typeof this._messages === 'string') {
      return [this._messages];
    }

    return this._messages ?? [];
  }
}
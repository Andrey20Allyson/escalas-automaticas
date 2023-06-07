export class Text {
  private text: string;

  constructor() {
    this.text = '';
  }

  write(...data: unknown[]) {
    for (const entry of data) {
      this.text += String(entry);
    }
  }

  writeLn(...data: unknown[]) {
    this.write(...data, '\n');
  }

  read() {
    return this.text;
  }

  toString() {
    return this.read();
  }

  static from(data: unknown) {
    const text = new this();

    text.write(data);

    return text;
  }
}
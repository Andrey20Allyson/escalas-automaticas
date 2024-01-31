export class Text {
  private text: string;

  constructor() {
    this.text = '';
  }

  tab(count: number = 1): this {
    this.write('  '.repeat(count));
  
    return this
  }

  write(...data: unknown[]): this {
    for (const entry of data) {
      this.text += String(entry);
    }
    
    return this;
  }

  writeLn(...data: unknown[]): this {
    this.write(...data, '\n');

    return this;
  }

  read(): string {
    return this.text;
  }

  toString(): string {
    return this.read();
  }

  static from(data: unknown) {
    const text = new this();

    text.write(data);

    return text;
  }
}
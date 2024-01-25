export interface Parser<I, O> {
  parse(data: I): O;
}
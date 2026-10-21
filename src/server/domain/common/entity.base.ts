/**
 * Clean Architecture — Base Entity & Value Object
 */

export abstract class BaseEntity<TProps> {
  protected readonly _id: string;
  protected _props: TProps;
  protected readonly _createdAt: Date;
  protected _updatedAt: Date;

  constructor(id: string, props: TProps, createdAt: Date = new Date(), updatedAt: Date = new Date()) {
    this._id = id;
    this._props = props;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  public get id(): string {
    return this._id;
  }

  public get props(): Readonly<TProps> {
    return this._props;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }

  public equals(other?: BaseEntity<TProps>): boolean {
    if (other === null || other === undefined) return false;
    if (this === other) return true;
    return this._id === other._id;
  }
}

export abstract class ValueObject<TProps> {
  protected readonly props: Readonly<TProps>;

  constructor(props: TProps) {
    this.props = Object.freeze(props);
  }

  public equals(vo?: ValueObject<TProps>): boolean {
    if (vo === null || vo === undefined) return false;
    if (vo.props === undefined) return false;
    return JSON.stringify(this.props) === JSON.stringify(vo.props);
  }
}

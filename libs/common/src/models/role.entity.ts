import { AbstractEntity } from '../database';
import { Column, Entity } from 'typeorm';

@Entity()
export class Role extends AbstractEntity<Role> {
  @Column()
  name: string;
}

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('characters')
export class Character {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  role: 'waiter' | 'customer';

  @Column('text', { nullable: true })
  personality: string;

  @Column('simple-array', { nullable: true })
  defaultDialogue: string[];

  @Column()
  speechStyle: 'formal' | 'casual' | 'friendly';

  @Column()
  avatarColor: string;

  @Column()
  clothingColor: string;

  @Column('float')
  positionX: number;

  @Column('float')
  positionY: number;

  @Column('float')
  positionZ: number;
}

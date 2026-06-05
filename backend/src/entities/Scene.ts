import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { SceneObject } from './SceneObject';

@Entity('scenes')
export class Scene {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  type: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: false })
  model_url: string;

  @Column({ nullable: true })
  thumbnail_url: string;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => SceneObject, object => object.scene)
  objects: SceneObject[];

  @CreateDateColumn()
  created_at: Date;
}
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Scene } from './Scene';

@Entity('scene_objects')
export class SceneObject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Scene)
  scene: Scene;

  @Column()
  scene_id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ type: 'float', default: 0 })
  position_x: number;

  @Column({ type: 'float', default: 0 })
  position_y: number;

  @Column({ type: 'float', default: 0 })
  position_z: number;

  @Column({ default: false })
  interactive: boolean;

  @Column({ nullable: true })
  trigger_action: string;
}
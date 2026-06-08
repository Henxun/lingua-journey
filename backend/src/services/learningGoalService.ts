import { AppDataSource } from '../config/database';
import { LearningGoal, GoalType, GoalStatus } from '../entities/LearningGoal';

const goalRepository = AppDataSource.getRepository(LearningGoal);

export interface CreateGoalInput {
  title: string;
  description?: string;
  goal_type: GoalType;
  target_date?: Date;
}

export async function createGoal(userId: string, input: CreateGoalInput): Promise<LearningGoal> {
  const goal = new LearningGoal();
  goal.user_id = userId;
  goal.title = input.title;
  goal.description = input.description || '';
  goal.goal_type = input.goal_type;
  goal.target_date = input.target_date || null as any;
  goal.status = GoalStatus.ACTIVE;
  goal.progress = 0;

  return await goalRepository.save(goal);
}

export async function getUserGoals(userId: string): Promise<LearningGoal[]> {
  return await goalRepository.find({
    where: { user_id: userId },
    order: { created_at: 'DESC' }
  });
}

export async function getGoalById(goalId: string, userId: string): Promise<LearningGoal | null> {
  return await goalRepository.findOne({
    where: { id: goalId, user_id: userId }
  });
}

export async function updateGoal(
  goalId: string,
  userId: string,
  updates: Partial<CreateGoalInput>
): Promise<LearningGoal | null> {
  const goal = await getGoalById(goalId, userId);
  if (!goal) return null;

  if (updates.title !== undefined) goal.title = updates.title;
  if (updates.description !== undefined) goal.description = updates.description;
  if (updates.goal_type !== undefined) goal.goal_type = updates.goal_type;
  if (updates.target_date !== undefined) goal.target_date = updates.target_date;

  return await goalRepository.save(goal);
}

export async function updateGoalProgress(goalId: string, userId: string, progress: number): Promise<LearningGoal | null> {
  const goal = await getGoalById(goalId, userId);
  if (!goal) return null;

  goal.progress = Math.min(100, Math.max(0, progress));
  if (goal.progress >= 100) {
    goal.status = GoalStatus.COMPLETED;
  }

  return await goalRepository.save(goal);
}

export async function deleteGoal(goalId: string, userId: string): Promise<boolean> {
  const goal = await getGoalById(goalId, userId);
  if (!goal) return false;

  await goalRepository.remove(goal);
  return true;
}

export async function getActiveGoals(userId: string): Promise<LearningGoal[]> {
  return await goalRepository.find({
    where: { user_id: userId, status: GoalStatus.ACTIVE },
    order: { created_at: 'DESC' }
  });
}

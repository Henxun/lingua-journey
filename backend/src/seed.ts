import { AppDataSource } from './config/database';
import { Course, Difficulty } from './entities/Course';
import { Lesson, LessonType } from './entities/Lesson';

const sampleCourses = [
  {
    name: 'English Conversation - Beginner',
    description: 'Learn basic English conversation skills through practical lessons',
    language: 'English',
    difficulty: Difficulty.BEGINNER,
    thumbnail_url: null,
    is_active: true,
    lessons: [
      {
        title: 'Greetings and Introductions',
        description: 'Learn how to greet people and introduce yourself',
        order: 1,
        type: LessonType.CONVERSATION,
        conversation_config: {
          theme: 'greetings',
          difficulty: 'beginner'
        }
      },
      {
        title: 'Asking for Directions',
        description: 'Practice asking for and giving directions',
        order: 2,
        type: LessonType.CONVERSATION,
        conversation_config: {
          theme: 'directions',
          difficulty: 'beginner'
        }
      },
      {
        title: 'Ordering Food',
        description: 'Learn how to order food in a restaurant',
        order: 3,
        type: LessonType.CONVERSATION,
        conversation_config: {
          theme: 'restaurant',
          difficulty: 'beginner'
        }
      }
    ]
  },
  {
    name: 'Business English - Intermediate',
    description: 'Improve your business communication skills',
    language: 'English',
    difficulty: Difficulty.INTERMEDIATE,
    thumbnail_url: null,
    is_active: true,
    lessons: [
      {
        title: 'Business Meetings',
        description: 'Learn professional meeting vocabulary and expressions',
        order: 1,
        type: LessonType.CONVERSATION,
        conversation_config: {
          theme: 'meetings',
          difficulty: 'intermediate'
        }
      },
      {
        title: 'Email Writing',
        description: 'Master formal email communication',
        order: 2,
        type: LessonType.CONVERSATION,
        conversation_config: {
          theme: 'email',
          difficulty: 'intermediate'
        }
      },
      {
        title: 'Negotiations',
        description: 'Practice business negotiation skills',
        order: 3,
        type: LessonType.CONVERSATION,
        conversation_config: {
          theme: 'negotiation',
          difficulty: 'intermediate'
        }
      }
    ]
  },
  {
    name: 'Japanese - Travel Phrases',
    description: 'Essential Japanese phrases for travel',
    language: 'Japanese',
    difficulty: Difficulty.BEGINNER,
    thumbnail_url: null,
    is_active: true,
    lessons: [
      {
        title: 'Basic Greetings',
        description: 'Learn to say hello and thank you in Japanese',
        order: 1,
        type: LessonType.CONVERSATION,
        conversation_config: {
          theme: 'greetings',
          difficulty: 'beginner'
        }
      },
      {
        title: 'Shopping',
        description: 'Practice shopping conversations',
        order: 2,
        type: LessonType.CONVERSATION,
        conversation_config: {
          theme: 'shopping',
          difficulty: 'beginner'
        }
      },
      {
        title: 'Eating Out',
        description: 'Ordering food in Japanese',
        order: 3,
        type: LessonType.CONVERSATION,
        conversation_config: {
          theme: 'restaurant',
          difficulty: 'beginner'
        }
      }
    ]
  }
];

export const seedCourses = async () => {
  const courseRepository = AppDataSource.getRepository(Course);
  const lessonRepository = AppDataSource.getRepository(Lesson);

  const existingCourses = await courseRepository.count();
  if (existingCourses > 0) {
    console.log('Courses already exist, skipping seed');
    return;
  }

  for (const courseData of sampleCourses) {
    const course = courseRepository.create({
      name: courseData.name,
      description: courseData.description,
      language: courseData.language,
      difficulty: courseData.difficulty,
      thumbnail_url: courseData.thumbnail_url,
      is_active: courseData.is_active
    });
    
    const savedCourse = await courseRepository.save(course);

    for (const lessonData of courseData.lessons) {
      const lesson = lessonRepository.create({
        course_id: savedCourse.id,
        title: lessonData.title,
        description: lessonData.description,
        order: lessonData.order,
        type: lessonData.type,
        conversation_config: lessonData.conversation_config
      });
      await lessonRepository.save(lesson);
    }
  }

  console.log('Sample courses and lessons seeded successfully');
};

if (require.main === module) {
  AppDataSource.initialize()
    .then(async () => {
      console.log('Database connected');
      await seedCourses();
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}

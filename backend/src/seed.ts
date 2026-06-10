import { AppDataSource } from './config/database';
import { Course, Difficulty } from './entities/Course';
import { Lesson, LessonType } from './entities/Lesson';
import { Scene } from './entities/Scene';
import { SceneObject } from './entities/SceneObject';

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

const sampleScenes = [
  {
    name: 'Cozy Restaurant',
    type: 'restaurant',
    description: 'A warm and inviting restaurant where you can practice ordering food, making reservations, and polite dining conversations.',
    model_url: '/models/restaurant.glb',
    objects: [
      { name: 'Restaurant', position: { x: 0, y: 0, z: 0 }, interactive: false, trigger_action: null },
      { name: 'Table', position: { x: 0, y: 0, z: 0 }, interactive: false, trigger_action: null },
      { name: 'Menu', position: { x: 1.5, y: 0.5, z: 0.5 }, interactive: true, trigger_action: 'view_menu' },
      { name: 'Waiter', position: { x: -1.5, y: 0, z: 1 }, interactive: true, trigger_action: 'order_food' },
      { name: 'Cash Register', position: { x: 2.5, y: 0, z: -1 }, interactive: true, trigger_action: 'pay_bill' },
    ]
  },
  {
    name: 'Modern Cafe',
    type: 'cafe',
    description: 'A trendy cafe perfect for practicing casual conversations, ordering coffee, and making small talk with baristas.',
    model_url: '/models/cafe.glb',
    objects: [
      { name: 'Cafe', position: { x: 0, y: 0, z: 0 }, interactive: false, trigger_action: null },
      { name: 'Coffee Counter', position: { x: 0, y: 0.5, z: -1 }, interactive: true, trigger_action: 'order_coffee' },
      { name: 'Pastry Display', position: { x: 1.5, y: 0.5, z: 0 }, interactive: true, trigger_action: 'view_pastries' },
      { name: 'Barista', position: { x: 0, y: 0, z: -1.5 }, interactive: true, trigger_action: 'chat_barista' },
      { name: 'Table', position: { x: -1.5, y: 0, z: 1 }, interactive: false, trigger_action: null },
    ]
  },
  {
    name: 'Airport Terminal',
    type: 'airport',
    description: 'Navigate through an airport terminal to practice check-in procedures, asking for directions, and travel-related conversations.',
    model_url: '/models/airport.glb',
    objects: [
      { name: 'Airport', position: { x: 0, y: 0, z: 0 }, interactive: false, trigger_action: null },
      { name: 'Check-in Counter', position: { x: -2, y: 0, z: 0 }, interactive: true, trigger_action: 'check_in' },
      { name: 'Information Desk', position: { x: 0, y: 0, z: -2 }, interactive: true, trigger_action: 'ask_directions' },
      { name: 'Security', position: { x: 2, y: 0, z: 0 }, interactive: true, trigger_action: 'pass_security' },
      { name: 'Gate', position: { x: 3, y: 0, z: 2 }, interactive: true, trigger_action: 'board_plane' },
    ]
  },
  {
    name: 'Hotel Lobby',
    type: 'hotel',
    description: 'A luxurious hotel lobby for practicing check-in, concierge services, and polite hospitality conversations.',
    model_url: '/models/hotel.glb',
    objects: [
      { name: 'Hotel', position: { x: 0, y: 0, z: 0 }, interactive: false, trigger_action: null },
      { name: 'Front Desk', position: { x: 0, y: 0, z: -2 }, interactive: true, trigger_action: 'check_in_hotel' },
      { name: 'Concierge', position: { x: -2, y: 0, z: 0 }, interactive: true, trigger_action: 'ask_concierge' },
      { name: 'Elevator', position: { x: 2, y: 0, z: -1 }, interactive: true, trigger_action: 'call_elevator' },
      { name: 'Luggage', position: { x: 1, y: 0, z: 2 }, interactive: true, trigger_action: 'store_luggage' },
    ]
  },
  {
    name: 'Shopping Mall',
    type: 'shop',
    description: 'Explore a vibrant shopping mall to practice bargaining, asking for sizes, and retail conversations.',
    model_url: '/models/mall.glb',
    objects: [
      { name: 'Mall', position: { x: 0, y: 0, z: 0 }, interactive: false, trigger_action: null },
      { name: 'Clothing Store', position: { x: -2, y: 0, z: 0 }, interactive: true, trigger_action: 'shop_clothes' },
      { name: 'Salesperson', position: { x: -1.5, y: 0, z: 1 }, interactive: true, trigger_action: 'ask_salesperson' },
      { name: 'Food Court', position: { x: 2, y: 0, z: 0 }, interactive: true, trigger_action: 'order_food_court' },
      { name: 'ATM', position: { x: 0, y: 0, z: -2 }, interactive: true, trigger_action: 'withdraw_money' },
    ]
  },
  {
    name: 'Train Station',
    type: 'station',
    description: 'A busy train station for practicing ticket purchases, platform announcements, and travel dialogues.',
    model_url: '/models/station.glb',
    objects: [
      { name: 'Station', position: { x: 0, y: 0, z: 0 }, interactive: false, trigger_action: null },
      { name: 'Ticket Counter', position: { x: -2, y: 0, z: 0 }, interactive: true, trigger_action: 'buy_ticket' },
      { name: 'Platform', position: { x: 0, y: 0, z: 2 }, interactive: true, trigger_action: 'wait_train' },
      { name: 'Information Board', position: { x: 0, y: 1, z: -1 }, interactive: true, trigger_action: 'check_schedule' },
      { name: 'Station Master', position: { x: 2, y: 0, z: 0 }, interactive: true, trigger_action: 'ask_station_master' },
    ]
  }
];

export const seedScenes = async () => {
  const sceneRepository = AppDataSource.getRepository(Scene);
  const sceneObjectRepository = AppDataSource.getRepository(SceneObject);

  const existingScenes = await sceneRepository.count();
  if (existingScenes > 0) {
    console.log('Scenes already exist, skipping seed');
    return;
  }

  for (const sceneData of sampleScenes) {
    const scene = sceneRepository.create({
      name: sceneData.name,
      type: sceneData.type,
      description: sceneData.description,
      model_url: sceneData.model_url,
      is_active: true
    });
    
    const savedScene = await sceneRepository.save(scene);

    for (const objData of sceneData.objects) {
      const sceneObject = sceneObjectRepository.create({
        scene_id: savedScene.id,
        name: objData.name,
        position_x: objData.position.x,
        position_y: objData.position.y,
        position_z: objData.position.z,
        interactive: objData.interactive,
        trigger_action: objData.trigger_action
      });
      await sceneObjectRepository.save(sceneObject);
    }
  }

  console.log('Sample scenes and objects seeded successfully');
};

if (require.main === module) {
  AppDataSource.initialize()
    .then(async () => {
      console.log('Database connected');
      await seedCourses();
      await seedScenes();
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}

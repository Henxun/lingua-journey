import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { fallbackLanguage, defaultLanguage } from './languages';

// Translation resources
const resources = {
  en: {
    translation: {
      common: {
        appName: "Lingua Journey",
        loading: "Loading...",
        error: "An error occurred",
        retry: "Retry",
        save: "Save",
        cancel: "Cancel",
        delete: "Delete",
        edit: "Edit",
        close: "Close",
        confirm: "Confirm",
        back: "Back",
        next: "Next",
        previous: "Previous",
        submit: "Submit",
        search: "Search",
        filter: "Filter",
        sort: "Sort",
        clear: "Clear",
        yes: "Yes",
        no: "No",
        or: "or",
        confirmDelete: "Are you sure you want to delete this?"
      },
      nav: {
        home: "Home",
        courses: "Courses",
        scenes: "3D Scenes",
        vocabulary: "Vocabulary",
        progress: "Progress",
        aiTeacher: "AI Teacher",
        assessment: "Assessment",
        profile: "Profile",
        settings: "Settings",
        logout: "Logout",
        login: "Login",
        register: "Register"
      },
      home: {
        hero: {
          titleLine1: "Learn Languages",
          titleLine2: "In Real-World Scenarios",
          subtitle: "AI-Powered Language Learning",
          description: "Practice with AI-simulated conversations, immerse yourself in multilingual scenarios. From everyday dialogue to business settings, make language learning engaging and rapidly improve your skills.",
          startLearning: "Start Learning",
          learnMore: "Learn More"
        },
        features: {
          title: "Why Choose Lingua Journey?",
          aiDialog: {
            title: "AI Conversation Practice",
            description: "Realistic scenario simulation with intelligent correction feedback"
          },
          aiTeacher: {
            title: "AI Teacher Instruction",
            description: "Personalized course recommendations with knowledge explanations"
          },
          scene3d: {
            title: "3D Scene Interaction",
            description: "Immersive 3D scenarios with interactive learning experience"
          }
        },
        languages: {
          title: "Multi-Language Support",
          subtitle: "From mainstream global languages to rare ones, meeting all your learning needs",
          english: "English",
          chinese: "Chinese",
          japanese: "Japanese",
          korean: "Korean",
          spanish: "Spanish",
          french: "French",
          german: "German",
          arabic: "Arabic"
        },
        footer: {
          description: "Your AI-powered language learning companion",
          features: "Features",
          aiDialog: "AI Conversation",
          aiTeacher: "AI Teacher",
          assessment: "Language Assessment",
          vocabulary: "Vocabulary",
          supportedLanguages: "Supported Languages",
          english: "English",
          chinese: "Chinese",
          japanese: "Japanese",
          korean: "Korean",
          contactUs: "Contact Us",
          aboutUs: "About Us",
          privacyPolicy: "Privacy Policy",
          termsOfService: "Terms of Service"
        }
      },
      auth: {
        login: {
          title: "Welcome Back",
          subtitle: "Welcome back! Continue your language learning journey",
          email: "Email",
          password: "Password",
          rememberMe: "Remember me",
          forgotPassword: "Forgot password?",
          submit: "Login",
          signin: "Sign in",
          signingIn: "Signing in...",
          sendCode: "Send Code",
          resendIn: "Resend in {{seconds}}s",
          sending: "Sending...",
          verifySignin: "Verify & Sign in",
          verifying: "Verifying...",
          verificationCode: "Verification Code",
          noAccount: "Don't have an account?",
          signUp: "Sign up"
        },
        register: {
          title: "Create Account",
          subtitle: "Start your language learning journey today",
          username: "Username",
          email: "Email",
          password: "Password",
          confirmPassword: "Confirm password",
          nativeLanguage: "Native Language",
          targetLanguage: "Target Language",
          submit: "Create Account",
          creating: "Creating...",
          hasAccount: "Already have an account?",
          login: "Login",
          sendCode: "Send Code",
          sending: "Sending...",
          resendIn: "Resend in {{seconds}}s",
          verifyCreate: "Verify & Create",
          verifying: "Verifying...",
          verificationCode: "Verification Code"
        },
        oauth: {
          google: "Continue with Google",
          github: "Continue with GitHub"
        }
      },
      courses: {
        pageTitle: "Browse Courses",
        title: "Language Courses",
        subtitle: "Find the perfect course for your language learning journey",
        notFound: "Course not found",
        yourProgress: "Your Progress",
        continueLearning: "Continue Learning",
        startLearning: "Start Learning",
        enrolling: "Enrolling...",
        courseContent: "Course Content",
        noLessonsAvailable: "No lessons available yet",
        lesson: "Lesson {{number}}",
        current: "Current",
        completed: "Completed",
        locked: "Locked",
        browse: "Browse all courses",
        filter: {
          language: "Language",
          difficulty: "Difficulty",
          all: "All",
          beginner: "Beginner",
          intermediate: "Intermediate",
          advanced: "Advanced"
        },
        empty: {
          title: "No courses found",
          description: "Try adjusting your filters"
        },
        lessons: "{{count}} lessons"
      },
      lesson: {
        notFound: "Lesson not found",
        conversationPractice: "Conversation Practice",
        conversationDescription: "Practice your conversation skills in this lesson. Start a chat and get feedback!",
        startConversation: "Start Conversation",
        scenePractice: "Scene Practice",
        sceneDescription: "Immersive scene practice coming soon!",
        previousLesson: "Previous Lesson",
        nextLesson: "Next Lesson",
        completing: "Completing...",
        markAsComplete: "Mark as Complete",
        completed: "Completed"
      },
      vocabulary: {
        title: "Vocabulary",
        subtitle: "Smart flashcards to help you memorize words",
        pageTitle: "Vocabulary",
        flashcards: "Flashcards",
        decks: "My Decks",
        decksEmpty: "No decks yet",
        allCards: "All Cards",
        cards: "{{count}} cards",
        review: "Review",
        createDeck: "Create Deck",
        addCard: "Add Card",
        front: "Front",
        back: "Back",
        example: "Example",
        progress: "Progress",
        reviewedCount: "Reviewed: {{count}}",
        correctCount: "Correct: {{correct}}/{{total}}",
        reviewBanner: {
          title: "Review Ready!",
          cardsReady: "{{count}} cards ready for review",
          dueNow: "due now",
          startReview: "Start Review Session"
        },
        noCards: {
          title: "No cards yet",
          subtitle: "Create your first flashcard to get started",
          createFirst: "Create Your First Card"
        },
        addCardModal: {
          title: "Add New Card",
          frontLabel: "Front (Question/Term)",
          frontPlaceholder: "Enter the question or term",
          backLabel: "Back (Answer/Definition)",
          backPlaceholder: "Enter the answer or definition",
          exampleLabel: "Example (optional)",
          examplePlaceholder: "Enter an example sentence",
          submit: "Add Card"
        },
        createDeckModal: {
          title: "Create New Deck",
          nameLabel: "Deck Name",
          namePlaceholder: "Enter deck name",
          descriptionLabel: "Description (optional)",
          descriptionPlaceholder: "Enter deck description",
          submit: "Create Deck"
        },
        reviewComplete: {
          title: "Review Complete!",
          score: "You scored {{score}}%",
          cardsReviewed: "Cards reviewed: {{count}}",
          continue: "Continue"
        }
      },
      aiTeacher: {
        pageTitle: "AI Language Teacher",
        title: "AI Language Teacher",
        subtitle: "Your personal language tutor available 24/7",
        sessions: "Sessions",
        topicPlaceholder: "Enter a topic...",
        messages: "messages",
        you: "You",
        aiTeacher: "AI Teacher",
        inputPlaceholder: "Type your message...",
        sending: "Sending...",
        send: "Send",
        startLearning: "Start Learning",
        startLearningDescription: "Create a new session to start practicing with your AI teacher",
        newSession: "New Session",
        topic: "Topic",
        startChat: "Start Chat",
        typeMessage: "Type your message...",
        suggestions: {
          grammar: "Explain Grammar",
          vocabulary: "Explain Vocabulary",
          correction: "Get Correction",
          practice: "Practice Conversation"
        },
        features: {
          grammar: "Grammar Explanation",
          vocabulary: "Vocabulary Builder",
          correction: "Text Correction",
          conversation: "Conversation Practice"
        },
        tabs: {
          chat: "Chat",
          learningPath: "Learning Path",
          adaptivePractice: "Adaptive Practice",
          learningStyle: "Learning Style",
          contentGenerator: "Content Generator"
        },
        generating: "Generating...",
        analyzing: "Analyzing...",
        learningPath: {
          title: "Personalized Learning Path",
          description: "Get a custom learning path based on your goals, progress, and learning preferences.",
          generate: "Generate Learning Path",
          result: "Your Personalized Learning Path"
        },
        adaptivePractice: {
          title: "Adaptive Practice",
          description: "Generate practice exercises tailored to your skill level and performance history.",
          topicLabel: "Practice Topic",
          topicPlaceholder: "Enter a topic to practice...",
          generate: "Generate Practice",
          result: "Your Practice Exercises"
        },
        learningStyle: {
          title: "Learning Style Analysis",
          description: "Discover your learning style and get personalized recommendations.",
          analyze: "Analyze Learning Style",
          primaryStyle: "Primary Learning Style",
          secondaryStyle: "Secondary Learning Style",
          recommendations: "Recommendations",
          optimalActivities: "Optimal Activities"
        },
        contentGenerator: {
          title: "AI Content Generator",
          description: "Generate custom lessons, exercises, and stories tailored to your level.",
          topicLabel: "Topic",
          topicPlaceholder: "Enter a topic...",
          typeLabel: "Content Type",
          types: {
            lesson: "Lesson",
            exercise: "Exercise",
            story: "Story"
          },
          generate: "Generate Content",
          result: "Generated Content"
        }
      },
      assessment: {
        pageTitle: "Language Assessment",
        title: "Language Assessment",
        subtitle: "Test your language proficiency",
        start: "Start Assessment",
        loading: "Loading assessments...",
        noAssessments: "No assessments available",
        checkBackLater: "Check back later for new assessments",
        skills: "Skills",
        min: "min",
        questions: "questions",
        toPass: "to pass",
        questionOf: "Question {{current}} of {{total}}",
        typeAnswer: "Type your answer here...",
        writeAnswer: "Write your answer here...",
        previous: "Previous",
        next: "Next",
        submitting: "Submitting...",
        submitAssessment: "Submit Assessment",
        complete: "Assessment Complete!",
        recommendations: "Recommendations",
        backToAssessments: "Back to Assessments"
      },
      progress: {
        pageTitle: "Learning Progress",
        title: "Learning Progress",
        subtitle: "Track your language learning journey",
        loading: "Loading progress...",
        stats: {
          averageScore: "Average Score",
          assessmentsCompleted: "Assessments Completed",
          totalAssessments: "Total Assessments",
          bestSkill: "Best Skill",
          needsImprovement: "Needs Improvement"
        },
        skillBreakdown: {
          title: "Skill Breakdown",
          level: "Level"
        },
        weeklyProgress: {
          title: "Weekly Progress"
        },
        recommendations: {
          title: "Recommendations"
        },
        actions: {
          takeAssessment: "Take Assessment",
          chatWithAi: "Chat with AI Teacher"
        }
      },
      scenes: {
        pageTitle: "3D Immersive Scenes",
        title: "3D Immersive Scenes",
        subtitle: "Explore interactive 3D environments to practice real-world language skills",
        scenes: "Available Scenes",
        selectScene: "Select a scene to explore",
        noScenes: "No scenes available",
        sceneDescription: "Scene Description",
        controls: {
          hint: "Click and drag to rotate, scroll to zoom"
        },
        learning: {
          vocabulary: "Vocabulary",
          grammar: "Grammar Patterns",
          dialogue: "Sample Dialogue",
          culturalTip: "Cultural Tip",
          startConversation: "Start AI Conversation",
          noContent: "No learning content available for this object"
        },
        interactive: "Interactive",
        nonInteractive: "Non-interactive"
      },
      profile: {
        pageTitle: "My Profile",
        title: "My Profile",
        stats: "Learning Statistics",
        achievements: "Achievements",
        settings: "Account Settings",
        learningPath: "Learning Path",
        streak: {
          title: "Current Streak",
          days: "{{count}} days"
        },
        myCourses: "My Courses",
        complete: "{{percentage}}% Complete",
        completed: "Completed",
        inProgress: "In Progress",
        loadError: "Failed to load profile",
        updateSuccess: "Profile updated successfully",
        updateError: "Failed to update profile",
        passwordChangeSuccess: "Password changed successfully",
        passwordChangeError: "Failed to change password",
        unlinkSuccess: "{{provider}} account unlinked successfully",
        unlinkError: "Failed to unlink account",
        verified: "Verified",
        notVerified: "Not Verified",
        emailStatus: "Email Status",
        linkedAccounts: "Linked Accounts",
        unlink: "Unlink",
        viewStats: "View Stats",
        gameCenter: "Game Center",
        vocabulary: "Vocabulary",
        logout: "Logout",
        editProfile: "Edit Profile",
        nativeLanguage: "Native Language",
        targetLanguage: "Target Language",
        changePassword: "Change Password",
        setupPassword: "Set Up Password",
        currentPassword: "Current Password",
        newPassword: "New Password",
        changing: "Changing...",
        changePasswordBtn: "Change Password",
        cancel: "Cancel",
        username: "Username",
        saving: "Saving...",
        saveChanges: "Save Changes"
      },
      levels: {
        A1: "Beginner",
        A2: "Elementary",
        B1: "Intermediate",
        B2: "Upper Intermediate",
        C1: "Advanced",
        C2: "Proficient"
      },
      skills: {
        listening: "Listening",
        reading: "Reading",
        speaking: "Speaking",
        writing: "Writing"
      }
    }
  },
  zh: {
    translation: {
      common: {
        appName: "语言旅程",
        loading: "加载中...",
        error: "发生错误",
        retry: "重试",
        save: "保存",
        cancel: "取消",
        delete: "删除",
        edit: "编辑",
        close: "关闭",
        confirm: "确认",
        back: "返回",
        next: "下一步",
        previous: "上一步",
        submit: "提交",
        search: "搜索",
        filter: "筛选",
        sort: "排序",
        clear: "清除",
        yes: "是",
        no: "否",
        or: "或",
        confirmDelete: "确定要删除吗？"
      },
      nav: {
        home: "首页",
        courses: "课程",
        scenes: "3D场景",
        vocabulary: "词汇",
        progress: "进度",
        aiTeacher: "AI老师",
        assessment: "测评",
        profile: "我的",
        settings: "设置",
        logout: "退出登录",
        login: "登录",
        register: "注册"
      },
      home: {
        hero: {
          titleLine1: "在真实场景中",
          titleLine2: "沉浸式学习语言",
          subtitle: "AI驱动的语言学习",
          description: "通过AI模拟真实对话场景，沉浸式学习多语种。从日常对话到商务场景，让语言学习变得更加生动有趣，快速提升您的语言能力。",
          startLearning: "开始学习",
          learnMore: "了解更多"
        },
        features: {
          title: "为什么选择语言旅程？",
          aiDialog: {
            title: "AI对话练习",
            description: "真实场景模拟对话，智能纠错反馈"
          },
          aiTeacher: {
            title: "AI老师教学",
            description: "个性化课程推荐，知识点讲解答疑"
          },
          scene3d: {
            title: "3D场景互动",
            description: "沉浸式3D场景，可交互学习体验"
          }
        },
        languages: {
          title: "支持多语种学习",
          subtitle: "从全球主流语言到小众语种，满足您的学习需求",
          english: "英语",
          chinese: "中文",
          japanese: "日语",
          korean: "韩语",
          spanish: "西班牙语",
          french: "法语",
          german: "德语",
          arabic: "阿拉伯语"
        },
        footer: {
          description: "您的AI驱动语言学习伙伴",
          features: "功能",
          aiDialog: "AI对话练习",
          aiTeacher: "AI老师教学",
          assessment: "语言测评",
          vocabulary: "词汇记忆",
          supportedLanguages: "支持语言",
          english: "英语",
          chinese: "汉语",
          japanese: "日语",
          korean: "韩语",
          contactUs: "联系我们",
          aboutUs: "关于我们",
          privacyPolicy: "隐私政策",
          termsOfService: "服务条款"
        }
      },
      auth: {
        login: {
          title: "欢迎回来",
          subtitle: "欢迎回来！继续您的语言学习之旅",
          email: "邮箱",
          password: "密码",
          rememberMe: "记住我",
          forgotPassword: "忘记密码？",
          submit: "登录",
          signin: "登录",
          signingIn: "登录中...",
          sendCode: "发送验证码",
          resendIn: "{{seconds}}秒后重发",
          sending: "发送中...",
          verifySignin: "验证并登录",
          verifying: "验证中...",
          verificationCode: "验证码",
          noAccount: "没有账号？",
          signUp: "注册"
        },
        register: {
          title: "创建账号",
          subtitle: "立即开始您的语言学习之旅",
          username: "用户名",
          email: "邮箱",
          password: "密码",
          confirmPassword: "确认密码",
          nativeLanguage: "母语",
          targetLanguage: "目标语言",
          submit: "创建账号",
          creating: "创建中...",
          hasAccount: "已有账号？",
          login: "登录",
          sendCode: "发送验证码",
          sending: "发送中...",
          resendIn: "{{seconds}}秒后重发",
          verifyCreate: "验证并创建",
          verifying: "验证中...",
          verificationCode: "验证码"
        },
        oauth: {
          google: "使用Google继续",
          github: "使用GitHub继续"
        }
      },
      courses: {
        pageTitle: "浏览课程",
        title: "语言课程",
        subtitle: "找到适合您的语言学习之旅的完美课程",
        notFound: "课程未找到",
        yourProgress: "您的进度",
        continueLearning: "继续学习",
        startLearning: "开始学习",
        enrolling: "报名中...",
        courseContent: "课程内容",
        noLessonsAvailable: "暂无可用课时",
        lesson: "第{{number}}课",
        current: "当前",
        completed: "已完成",
        locked: "未解锁",
        browse: "浏览全部课程",
        filter: {
          language: "语言",
          difficulty: "难度",
          all: "全部",
          beginner: "初级",
          intermediate: "中级",
          advanced: "高级"
        },
        empty: {
          title: "没有找到课程",
          description: "尝试调整筛选条件"
        },
        lessons: "{{count}}节课"
      },
      lesson: {
        notFound: "课时未找到",
        conversationPractice: "会话练习",
        conversationDescription: "在本课中练习您的会话技巧。开始聊天并获取反馈！",
        startConversation: "开始会话",
        scenePractice: "场景练习",
        sceneDescription: "沉浸式场景练习即将推出！",
        previousLesson: "上一课",
        nextLesson: "下一课",
        completing: "完成中...",
        markAsComplete: "标记为完成",
        completed: "已完成"
      },
      vocabulary: {
        title: "词汇",
        subtitle: "用智能闪卡建立您的单词库",
        pageTitle: "词汇",
        flashcards: "闪卡",
        decks: "我的卡组",
        decksEmpty: "暂无卡组",
        allCards: "全部卡片",
        cards: "{{count}}张卡片",
        review: "复习",
        createDeck: "创建卡组",
        addCard: "添加卡片",
        front: "正面",
        back: "背面",
        example: "例句",
        progress: "进度",
        reviewedCount: "已复习：{{count}}",
        correctCount: "正确：{{correct}}/{{total}}",
        reviewBanner: {
          title: "复习就绪！",
          cardsReady: "{{count}}张卡片可以复习",
          dueNow: "待复习",
          startReview: "开始复习"
        },
        noCards: {
          title: "暂无卡片",
          subtitle: "创建您的第一张闪卡开始学习",
          createFirst: "创建第一张卡片"
        },
        addCardModal: {
          title: "添加新卡片",
          frontLabel: "正面（问题/术语）",
          frontPlaceholder: "输入问题或术语",
          backLabel: "背面（答案/定义）",
          backPlaceholder: "输入答案或定义",
          exampleLabel: "例句（可选）",
          examplePlaceholder: "输入例句",
          submit: "添加卡片"
        },
        createDeckModal: {
          title: "创建新卡组",
          nameLabel: "卡组名称",
          namePlaceholder: "输入卡组名称",
          descriptionLabel: "描述（可选）",
          descriptionPlaceholder: "输入卡组描述",
          submit: "创建卡组"
        },
        reviewComplete: {
          title: "复习完成！",
          score: "您的得分是{{score}}%",
          cardsReviewed: "复习卡片数：{{count}}",
          continue: "继续"
        }
      },
      aiTeacher: {
        pageTitle: "AI语言老师",
        title: "AI语言老师",
        subtitle: "全天候24/7您的个人语言导师",
        sessions: "会话列表",
        topicPlaceholder: "输入话题...",
        messages: "条消息",
        you: "你",
        aiTeacher: "AI老师",
        inputPlaceholder: "输入您的消息...",
        sending: "发送中...",
        send: "发送",
        startLearning: "开始学习",
        startLearningDescription: "创建新会话以开始与AI老师练习",
        newSession: "新建会话",
        topic: "话题",
        startChat: "开始聊天",
        typeMessage: "输入您的消息...",
        suggestions: {
          grammar: "语法解释",
          vocabulary: "词汇解释",
          correction: "获取纠正",
          practice: "会话练习"
        },
        features: {
          grammar: "语法解释",
          vocabulary: "词汇积累",
          correction: "文本纠正",
          conversation: "会话练习"
        },
        tabs: {
          chat: "聊天",
          learningPath: "学习路径",
          adaptivePractice: "自适应练习",
          learningStyle: "学习风格",
          contentGenerator: "内容生成"
        },
        generating: "生成中...",
        analyzing: "分析中...",
        learningPath: {
          title: "个性化学习路径",
          description: "根据您的目标、进度和学习偏好，获取定制化学习路径。",
          generate: "生成学习路径",
          result: "您的个性化学习路径"
        },
        adaptivePractice: {
          title: "自适应练习",
          description: "根据您的技能水平和表现历史生成练习题目。",
          topicLabel: "练习主题",
          topicPlaceholder: "输入要练习的主题...",
          generate: "生成练习",
          result: "您的练习题目"
        },
        learningStyle: {
          title: "学习风格分析",
          description: "发现您的学习风格并获取个性化建议。",
          analyze: "分析学习风格",
          primaryStyle: "主要学习风格",
          secondaryStyle: "次要学习风格",
          recommendations: "建议",
          optimalActivities: "最佳活动"
        },
        contentGenerator: {
          title: "AI内容生成器",
          description: "生成适合您水平的定制课程、练习和故事。",
          topicLabel: "主题",
          topicPlaceholder: "输入主题...",
          typeLabel: "内容类型",
          types: {
            lesson: "课程",
            exercise: "练习",
            story: "故事"
          },
          generate: "生成内容",
          result: "生成的内容"
        }
      },
      assessment: {
        pageTitle: "语言测评",
        title: "语言测评",
        subtitle: "测试您的语言水平",
        start: "开始测评",
        loading: "加载测评中...",
        noAssessments: "暂无可用测评",
        checkBackLater: "稍后再来查看新测评",
        skills: "技能",
        min: "分钟",
        questions: "题",
        toPass: "及格",
        questionOf: "第{{current}}题，共{{total}}题",
        typeAnswer: "在此输入您的答案...",
        writeAnswer: "在此写下您的答案...",
        previous: "上一题",
        next: "下一题",
        submitting: "提交中...",
        submitAssessment: "提交测评",
        complete: "测评完成！",
        recommendations: "建议",
        backToAssessments: "返回测评"
      },
      progress: {
        pageTitle: "学习进度",
        title: "学习进度",
        subtitle: "跟踪您的语言学习之旅",
        loading: "加载进度中...",
        stats: {
          averageScore: "平均分",
          assessmentsCompleted: "已完成测评",
          totalAssessments: "测评总数",
          bestSkill: "最佳技能",
          needsImprovement: "需要改进"
        },
        skillBreakdown: {
          title: "技能分布",
          level: "级别"
        },
        weeklyProgress: {
          title: "每周进度"
        },
        recommendations: {
          title: "建议"
        },
        actions: {
          takeAssessment: "参加测评",
          chatWithAi: "与AI老师聊天"
        }
      },
      scenes: {
        pageTitle: "3D沉浸式场景",
        title: "3D沉浸式场景",
        subtitle: "探索互动3D环境，练习真实世界语言技能",
        scenes: "可用场景",
        selectScene: "选择一个场景开始探索",
        noScenes: "暂无可用场景",
        sceneDescription: "场景描述",
        controls: {
          hint: "点击拖动旋转，滚轮缩放"
        },
        learning: {
          vocabulary: "词汇",
          grammar: "语法模式",
          dialogue: "示例对话",
          culturalTip: "文化提示",
          startConversation: "开始AI对话",
          noContent: "该对象暂无学习内容"
        },
        interactive: "可交互",
        nonInteractive: "不可交互"
      },
      profile: {
        pageTitle: "我的资料",
        title: "我的资料",
        stats: "学习统计",
        achievements: "成就",
        settings: "账户设置",
        learningPath: "学习路径",
        streak: {
          title: "当前连续学习",
          days: "{{count}}天"
        },
        myCourses: "我的课程",
        complete: "{{percentage}}% 完成",
        completed: "已完成",
        inProgress: "进行中",
        loadError: "加载资料失败",
        updateSuccess: "资料更新成功",
        updateError: "资料更新失败",
        passwordChangeSuccess: "密码修改成功",
        passwordChangeError: "密码修改失败",
        unlinkSuccess: "{{provider}}账号已解除绑定",
        unlinkError: "解除绑定失败",
        verified: "已验证",
        notVerified: "未验证",
        emailStatus: "邮箱状态",
        linkedAccounts: "已绑定账号",
        unlink: "解除绑定",
        viewStats: "查看统计",
        gameCenter: "游戏中心",
        vocabulary: "词汇",
        logout: "退出登录",
        editProfile: "编辑资料",
        nativeLanguage: "母语",
        targetLanguage: "目标语言",
        changePassword: "修改密码",
        setupPassword: "设置密码",
        currentPassword: "当前密码",
        newPassword: "新密码",
        changing: "修改中...",
        changePasswordBtn: "修改密码",
        cancel: "取消",
        username: "用户名",
        saving: "保存中...",
        saveChanges: "保存修改"
      },
      levels: {
        A1: "初级",
        A2: "基础",
        B1: "中级",
        B2: "中高级",
        C1: "高级",
        C2: "精通"
      },
      skills: {
        listening: "听力",
        reading: "阅读",
        speaking: "口语",
        writing: "写作"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: defaultLanguage,
    fallbackLng: fallbackLanguage,
    ns: ['translation'],
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;

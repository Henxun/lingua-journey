import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { assessmentAPI, Assessment, Question, Answer, AssessmentResult } from '../../lib/api';
import { Navbar } from '../../components/Navbar';

export default function AssessmentPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const data = await assessmentAPI.getAssessments();
      setAssessments(data);
    } catch (error) {
      console.error('Failed to load assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const startAssessment = (assessment: Assessment) => {
    setCurrentAssessment(assessment);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setResult(null);
  };

  const submitAnswer = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const nextQuestion = () => {
    if (currentAssessment && currentQuestionIndex < currentAssessment.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitAssessment = async () => {
    if (!currentAssessment) return;
    
    try {
      setSubmitting(true);
      const formattedAnswers: Answer[] = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));
      
      const result = await assessmentAPI.submitAssessment(currentAssessment.id, formattedAnswers);
      setResult(result);
    } catch (error) {
      console.error('Failed to submit assessment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const currentQuestion = currentAssessment?.questions[currentQuestionIndex];
  const isLastQuestion = currentAssessment ? currentQuestionIndex === currentAssessment.questions.length - 1 : false;

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Head>
          <title>Assessment Result - Lingua Journey</title>
        </Head>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('assessment.complete')}</h1>
              <div className="text-6xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">
                {result.score}%
              </div>
            </div>

            {result.feedback && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">
                <p className="text-gray-700">{result.feedback}</p>
              </div>
            )}

            {result.recommendations && result.recommendations.length > 0 && (
              <div className="bg-indigo-50 p-4 rounded mb-6">
                <h3 className="font-bold text-gray-900 mb-2">{t('assessment.recommendations')}</h3>
                <ul className="list-disc list-inside space-y-1">
                  {result.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-gray-700">{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => {
                setCurrentAssessment(null);
                setResult(null);
              }}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              {t('assessment.backToAssessments')}
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (currentAssessment && currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Head>
          <title>Assessment - Lingua Journey</title>
        </Head>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{currentAssessment.name}</h1>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentQuestionIndex + 1) / currentAssessment.questions.length) * 100}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {t('assessment.questionOf', { current: currentQuestionIndex + 1, total: currentAssessment.questions.length })}
            </p>
          </div>

          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8 mb-6"
          >
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-4">
                {currentQuestion.skill} - {currentQuestion.type}
              </span>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentQuestion.prompt}</h2>
            </div>

            {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => submitAnswer(currentQuestion.id, option)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      answers[currentQuestion.id] === option
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <span className="font-medium">{String.fromCharCode(65 + idx)}.</span> {option}
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.type === 'fill-blank' && (
              <input
                type="text"
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => submitAnswer(currentQuestion.id, e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                placeholder={t('assessment.typeAnswer')}
              />
            )}

            {currentQuestion.type === 'open-ended' && (
              <textarea
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => submitAnswer(currentQuestion.id, e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none h-48"
                placeholder={t('assessment.writeAnswer')}
              />
            )}
          </motion.div>

          <div className="flex justify-between">
            <button
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium disabled:opacity-50 hover:bg-gray-300 transition-all"
            >
              {t('assessment.previous')}
            </button>
            
            {isLastQuestion ? (
              <button
                onClick={submitAssessment}
                disabled={submitting || Object.keys(answers).length < currentAssessment.questions.length}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium disabled:opacity-50 hover:shadow-lg transition-all"
              >
                {submitting ? t('assessment.submitting') : t('assessment.submitAssessment')}
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                {t('assessment.next')}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Head>
        <title>Assessments - Lingua Journey</title>
      </Head>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('assessment.title')}</h1>
            <p className="text-xl text-gray-600">{t('assessment.subtitle')}</p>
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-600">{t('assessment.loading')}</p>
          </div>
        ) : assessments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-xl">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('assessment.noAssessments')}</h2>
            <p className="text-gray-600">{t('assessment.checkBackLater')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assessments.map((assessment) => (
              <motion.div
                key={assessment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow"
              >
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-2">
                    {assessment.level}
                  </span>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{assessment.name}</h2>
                  <p className="text-gray-600 text-sm mb-4">
                    {t('assessment.skills')}: {assessment.skills.join(', ')}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>⏱ {assessment.timeLimit} {t('assessment.min')}</span>
                    <span>📊 {assessment.questions.length} {t('assessment.questions')}</span>
                    <span>✓ {assessment.passingScore}% {t('assessment.toPass')}</span>
                  </div>
                </div>
                <button
                  onClick={() => startAssessment(assessment)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  {t('assessment.start')}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
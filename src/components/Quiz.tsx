import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  explanation: string;
}

interface QuizProps {
  questions: QuizQuestion[];
  onScoreUpdate: (points: number) => void;
  onComplete?: () => void;
}

export function Quiz({ questions, onScoreUpdate, onComplete }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const selectedOption = currentQuestion.options.find(opt => opt.id === selectedAnswer);
  const isCorrect = selectedOption?.isCorrect || false;

  const handleAnswerSelect = (optionId: string) => {
    if (showFeedback) return;
    setSelectedAnswer(optionId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || answeredQuestions.has(currentQuestionIndex)) return;

    setShowFeedback(true);
    setAnsweredQuestions(new Set([...answeredQuestions, currentQuestionIndex]));

    const points = isCorrect ? 10 : -5;
    const newScore = score + points;
    setScore(newScore);
    onScoreUpdate(points);
  };

  const handleNextQuestion = () => {
    if (isLastQuestion && onComplete) {
      onComplete();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
      <div className="mb-6">
        <h3 className="text-2xl font-semibold">Quiz Interactif</h3>
        <p className="text-gray-400 text-sm mt-1">
          Question {currentQuestionIndex + 1} sur {questions.length}
        </p>
      </div>

      <div className="mb-6">
        <p className="text-lg text-gray-200 mb-4 leading-relaxed">{currentQuestion.question}</p>

        <div className="space-y-3">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedAnswer === option.id;
            const showCorrect = showFeedback && option.isCorrect;
            const showIncorrect = showFeedback && isSelected && !option.isCorrect;

            return (
              <button
                key={option.id}
                onClick={() => handleAnswerSelect(option.id)}
                disabled={showFeedback}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-300 ${
                  showCorrect
                    ? 'border-green-500 bg-green-500/20 animate-pulse'
                    : showIncorrect
                    ? 'border-red-500 bg-red-500/20 animate-shake'
                    : isSelected
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                } ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-200">{option.text}</span>
                  {showFeedback && (
                    <>
                      {option.isCorrect && (
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      )}
                      {showIncorrect && (
                        <XCircle className="w-6 h-6 text-red-400" />
                      )}
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {showFeedback && (
        <div
          className={`mb-6 p-4 rounded-lg border-2 ${
            isCorrect
              ? 'border-green-500 bg-green-500/10'
              : 'border-red-500 bg-red-500/10'
          } animate-fadeIn`}
        >
          <div className="flex items-start gap-3">
            {isCorrect ? (
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
            ) : (
              <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
            )}
            <div>
              <p className={`font-semibold mb-2 ${isCorrect ? 'text-green-300' : 'text-red-300'}`}>
                {isCorrect ? 'Bonne réponse !' : 'Mauvaise réponse.'}
              </p>
              <p className="text-gray-300 text-sm leading-relaxed">{currentQuestion.explanation}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {!showFeedback ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={!selectedAnswer}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 ${
              selectedAnswer
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            Valider
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="flex-1 py-3 rounded-lg font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white transition-all duration-300"
          >
            {isLastQuestion ? 'Terminer le Quiz' : 'Question Suivante'}
          </button>
        )}
      </div>
    </div>
  );
}

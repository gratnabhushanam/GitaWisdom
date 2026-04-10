import React, { useState, useEffect } from 'react';
import KrishnaSVG from '../assets/krishna-scene.svg';
import axios from 'axios';
import { Trophy, CheckCircle, XCircle, ArrowRight, RefreshCcw, Play, Loader } from 'lucide-react';

export default function Quiz() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  if (loading) {
    return (
      <div className="min-h-screen bg-[#06101E] pt-24 pb-12 px-4 flex items-center justify-center relative overflow-hidden">
        {/* Cinematic Krishna SVG background */}
        <img src={KrishnaSVG} alt="Krishna Scene" className="w-full max-w-xs absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none select-none opacity-70" style={{zIndex:1}} />
        <div className="text-center">
          <Loader className="w-12 h-12 text-[#FFD700] mx-auto mb-4 animate-spin" />
          <p className="text-[#FFD700] font-black text-lg">Loading Questions...</p>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="min-h-screen bg-[#06101E] pt-24 pb-12 px-4 flex items-center justify-center relative overflow-hidden">
        <div className="text-center">
          <p className="text-gray-400 font-bold text-lg">No questions available</p>
          <button 
            onClick={fetchQuestions}
            className="mt-4 bg-[#FFD700] text-[#06101E] px-6 py-2 rounded-full font-bold hover:brightness-110"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06101E] pt-24 pb-12 px-4 flex items-center justify-center relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-[#FFD700]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FF9F1C]/10 rounded-full blur-3xl"></div>
      <div className="max-w-3xl w-full bg-[#0B1F3A]/60 backdrop-blur-xl border border-[#FFD700]/30 rounded-3xl p-8 md:p-12 shadow-[0_0_50px_rgba(255,215,0,0.1)] relative z-10">
        {showScore ? (
          <div className="text-center animate-fade-in-up">
            <Trophy className="w-24 h-24 text-[#FFD700] mx-auto mb-6 drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]" />
            <h2 className="text-4xl font-serif font-bold text-white mb-4">Quiz Completed!</h2>
            <div className="text-2xl mb-8 flex justify-center items-center gap-2">
              You scored <span className="text-[#FFD700] font-bold text-4xl">{score}</span> out of <span className="font-bold text-4xl">{questions.length}</span>
            </div>
            <button 
              onClick={restartQuiz}
              className="bg-gradient-to-r from-[#FFD700] to-[#FF9F1C] text-[#06101E] px-8 py-3 rounded-full font-bold text-lg hover:shadow-[0_0_20px_rgba(255,215,0,0.4)] transition-all flex items-center gap-2 mx-auto disabled:opacity-50"
            >
              <RefreshCcw className="w-5 h-5" />
              Play Again
            </button>
          </div>
        ) : (
          <div className="animate-fade-in-up">
            {/* Video Section if available */}
            {questions[currentQuestion]?.videoUrl && (
              <div className="mb-8 rounded-2xl overflow-hidden border border-[#FFD700]/20">
                <video 
                  src={questions[currentQuestion].videoUrl}
                  className="w-full h-auto max-h-64 bg-black"
                  controls
                  poster={questions[currentQuestion]?.thumbnail}
                />
              </div>
            )}
            <div className="flex justify-between items-center border-b border-white/10 pb-6 mb-8">
              <h1 className="text-3xl font-serif font-bold text-[#FFD700]">
                {questions[currentQuestion]?.category ? `${questions[currentQuestion].category}` : 'Gita Challenge'}
              </h1>
              <div className="text-xl font-medium px-4 py-1 bg-[#06101E]/50 rounded-full border border-white/10">
                Question <span className="text-[#FFD700]">{currentQuestion + 1}</span><span className="text-gray-500">/{questions.length}</span>
              </div>
            </div>
            <div className="mb-10 min-h-32 flex items-center">
              <h2 className="text-2xl md:text-3xl text-white font-light leading-relaxed">
                {questions[currentQuestion].questionText}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questions[currentQuestion].options.map((option, index) => {
                let buttonStyle = "bg-[#06101E]/60 text-white hover:bg-[#FFD700]/10 hover:border-[#FFD700]/50 border-white/10";
                if (selectedAnswer !== null) {
                  if (option.isCorrect) {
                    buttonStyle = "bg-green-500/20 text-green-300 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)]";
                  } else if (selectedAnswer === index) {
                    buttonStyle = "bg-red-500/20 text-red-300 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]";
                  } else {
                    buttonStyle = "bg-[#06101E]/40 text-gray-500 border-white/5 opacity-50";
                  }
                }
                return (
                  <button
                    key={index}
                    onClick={() => selectedAnswer === null && handleAnswerOptionClick(option.isCorrect, index)}
                    disabled={selectedAnswer !== null}
                    className={`border p-6 rounded-2xl text-left text-lg font-medium transition-all duration-300 flex justify-between items-center group ${buttonStyle}`}
                  >
                    {option.answerText}
                    {selectedAnswer !== null && option.isCorrect && <CheckCircle className="w-6 h-6 text-green-400" />}
                    {selectedAnswer === index && !option.isCorrect && <XCircle className="w-6 h-6 text-red-400" />}
                    {selectedAnswer === null && <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-[#FFD700]" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Duplicate code removed

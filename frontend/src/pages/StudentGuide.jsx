import React, { useState } from 'react';
import { Target, Brain, Shield, Clock, BookOpen } from 'lucide-react';

export default function StudentGuide() {
  const [activeTab, setActiveTab] = useState('focus');

  const topics = {
    focus: {
      title: "Building Concentration",
      icon: <Target className="w-8 h-8" />,
      situation: "When studying feels impossible and distractions are everywhere.",
      sloka: "चञ्चलं हि मनः कृष्ण प्रमाथि बलवद् दृढम्।\nतस्याहं निग्रहं मन्ये वायोरिव सुदुष्करम्॥",
      meaning: "Arjuna says: The mind is restless, turbulent, obstinate and very strong, O Krishna. Subduing it is more difficult than controlling the wind. (6.34)",
      solution: "Krishna answers in 6.35 that through practice (Abhyasa) and detachment (Vairagya), the mind can definitely be controlled. Set small 25-minute study timers."
    },
    stress: {
      title: "Overcoming Exam Stress",
      icon: <Brain className="w-8 h-8" />,
      situation: "Anxiety before exams or results.",
      sloka: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।",
      meaning: "You have a right to perform your prescribed duty, but you are not entitled to the fruits of action. (2.47)",
      solution: "Focus 100% on preparation. The result is a combination of many factors. Detach from the fear of marks; attach to the joy of learning."
    },
    fear: {
      title: "Fear of Failure",
      icon: <Shield className="w-8 h-8" />,
      situation: "Scared to try something new or take a tough exam.",
      sloka: "क्लैब्यं मा स्म गमः पार्थ नैतत्त्वय्युपपद्यते।",
      meaning: "O Arjuna, do not yield to this degrading impotence. It does not become you. (2.3)",
      solution: "You possess immense inner strength. Stand up and fight your inner battles. Failure is just feedback."
    }
  };

  return (
    <div className="min-h-screen bg-[#06101E] pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] font-bold tracking-widest text-sm mb-4">
            STUDENT MODE
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            Gita For <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FF9F1C]">Young Minds</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Practical life lessons applied directly to modern student problems.
          </p>
        </div>

        <div className="grid md:grid-cols-[1fr_2fr] gap-8">
          <div className="flex flex-col gap-4">
            {Object.keys(topics).map(key => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-4 p-5 rounded-2xl text-left transition-all ${activeTab === key ? 'bg-gradient-to-r from-[#FFD700] to-[#FF9F1C] text-[#06101E] shadow-lg scale-105' : 'bg-[#0B1F3A]/60 text-white hover:bg-[#0B1F3A]'}`}
              >
                {topics[key].icon}
                <div>
                  <h3 className="font-bold text-lg">{topics[key].title}</h3>
                </div>
              </button>
            ))}
          </div>

          <div className="bg-[#0B1F3A]/80 backdrop-blur-xl border border-[#FFD700]/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD700]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-serif font-bold text-white mb-2 flex items-center gap-3">
                {topics[activeTab].icon} {topics[activeTab].title}
              </h2>
              <div className="mb-8 inline-block bg-red-500/20 text-red-200 px-4 py-1.5 rounded-full text-sm font-medium border border-red-500/30">
                Situation: {topics[activeTab].situation}
              </div>

              <div className="bg-[#06101E]/80 p-6 rounded-2xl border border-white/10 mb-8 text-center shadow-inner">
                <p className="text-2xl text-[#FFD700] font-serif leading-relaxed mb-4">
                  {topics[activeTab].sloka}
                </p>
                <p className="text-gray-300 italic text-lg border-t border-white/10 pt-4">
                  "{topics[activeTab].meaning}"
                </p>
              </div>

              <div>
                <h3 className="text-xl text-[#FF9F1C] font-bold mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Practical Application
                </h3>
                <p className="text-gray-300 leading-relaxed text-lg bg-[#06101E]/40 p-5 rounded-xl border border-white/5">
                  {topics[activeTab].solution}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Safe Supabase initialization to prevent crashing if env vars are missing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

const questionsData = [
  {
    id: 1,
    question: "Diketahui fungsi f(x) = 2x^2 - 5x + 3. Nilai dari turunan pertama f'(x) untuk x = 2 adalah...",
    options: ["A. 1", "B. 3", "C. 5", "D. 7", "E. 9"],
    correct: 3 // D
  },
  {
    id: 2,
    question: "Sebuah partikel bergerak dengan persamaan s(t) = t^3 - 6t^2 + 9t. Kecepatan partikel saat t = 2 sekon adalah...",
    options: ["A. -3 m/s", "B. 0 m/s", "C. 3 m/s", "D. 6 m/s", "E. 9 m/s"],
    correct: 0 // A
  },
  {
    id: 3,
    question: "Integral tentu dari fungsi (3x^2 + 4x - 5) dengan batas bawah 0 dan batas atas 2 adalah...",
    options: ["A. 10", "B. 12", "C. 14", "D. 16", "E. 18"],
    correct: 2 // C
  },
  {
    id: 4,
    question: "Nilai limit x mendekati 0 dari (sin 3x) / (tan 2x) adalah...",
    options: ["A. 2/3", "B. 3/2", "C. 1", "D. 0", "E. Tak hingga"],
    correct: 1 // B
  },
  {
    id: 5,
    question: "Jika vektor a = 2i - j + 3k dan b = i + 2j - k, maka hasil perkalian titik (dot product) a . b adalah...",
    options: ["A. -3", "B. -1", "C. 1", "D. 3", "E. 5"],
    correct: 3 // D
  }
];

export default function CBTApp() {
  const [currentView, setCurrentView] = useState<'login' | 'exam' | 'admin'>('login');
  
  const [examId, setExamId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [examToken, setExamToken] = useState('');

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminUser, setAdminUser] = useState('admin_sekolah');
  const [adminPass, setAdminPass] = useState('admin123');

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState<Record<number, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [violationCount, setViolationCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(7200);

  const [submissionsList, setSubmissionsList] = useState<any[]>([]);
  const [loadingDb, setLoadingDb] = useState(false);

  const [modalInfo, setModalInfo] = useState<{ show: boolean; title: string; message: string }>({
    show: false,
    title: '',
    message: ''
  });

  const showAlert = (title: string, message: string) => {
    setModalInfo({ show: true, title, message });
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentView === 'exam') {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            showAlert("Waktu Habis", "Waktu ujian telah berakhir. Jawaban Anda dikirim otomatis.");
            handleSubmitExam(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      const handleVisibilityChange = () => {
        if (document.hidden) {
          setViolationCount((v) => {
            const newCount = v + 1;
            if (newCount >= 3) {
              showAlert("Peringatan Kritis", "Anda terdeteksi keluar dari tab ujian sebanyak 3 kali.");
            } else {
              showAlert("Peringatan Anti-Curang", "Peringatan (" + newCount + "/3): Anda terdeteksi meninggalkan halaman ujian!");
            }
            return newCount;
          });
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => {
        clearInterval(timer);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }
  }, [currentView]);

  useEffect(() => {
    if (currentView === 'admin') {
      fetchSubmissionsFromSupabase();
    }
  }, [currentView]);

  const fetchSubmissionsFromSupabase = async () => {
    setLoadingDb(true);
    try {
      if (!supabase) {
        setSubmissionsList([
          { exam_id: 'CBT-DEMO-01', student_name: 'Budi Santoso', violation_count: 0, score: 85, submitted_at: new Date().toISOString() }
        ]);
        setLoadingDb(false);
        return;
      }

      const { data, error } = await supabase
        .from('exam_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) {
        console.warn('Gagal memuat dari Supabase, menggunakan mode lokal:', error.message);
        setSubmissionsList([]);
      } else if (data) {
        setSubmissionsList(data);
      }
    } catch (err) {
      console.error('Error fetching:', err);
    } finally {
      setLoadingDb(false);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (examToken.length < 3) {
      showAlert("Token Tidak Valid", "Masukkan token ujian minimal 3 karakter.");
      return;
    }

    if (supabase) {
      try {
        await supabase.from('students').upsert([
          { exam_id: examId, name: studentName, token: examToken }
        ], { onConflict: 'exam_id' });
      } catch (err) {
        console.log('Catatan database offline mode:', err);
      }
    }

    setCurrentView('exam');
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAdminModal(false);
    setCurrentView('admin');
  };

  const handleSubmitExam = async (isAuto = false) => {
    let correctCount = 0;
    questionsData.forEach((q, idx) => {
      if (studentAnswers[idx] === q.correct) {
        correctCount++;
      }
    });
    const finalScore = (correctCount / questionsData.length) * 100;

    if (supabase) {
      try {
        await supabase.from('exam_submissions').insert([
          {
            exam_id: examId || 'CBT-UNKNOWN',
            student_name: studentName || 'Siswa Anonim',
            answers: studentAnswers,
            violation_count: violationCount,
            score: finalScore
          }
        ]);
      } catch (err) {
        console.error('Gagal mengirim ke Supabase:', err);
      }
    }

    showAlert("Ujian Selesai", `Jawaban berhasil diproses! Nilai akhir Anda: ${finalScore}`);
    setTimeout(() => {
      setCurrentView('login');
    }, 3000);
  };

  return (
    <div className="bg-gray-50 text-gray-900 font-sans antialiased min-h-screen flex flex-col justify-between">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-black text-white px-3 py-1.5 rounded-lg font-bold text-sm">
              <span>CBT.EDU System</span>
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${supabase ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
              {supabase ? 'Terhubung Cloud' : 'Mode Offline / Lokal'}
            </span>
          </div>
          {currentView !== 'login' && (
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">
                {currentView === 'exam' ? `${studentName || 'Siswa'} (${examId || 'CBT-001'})` : 'Administrator'}
              </span>
              <button 
                onClick={() => setCurrentView('login')}
                className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
              >
                Keluar
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'login' && (
          <div className="max-w-md mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-8 mt-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Portal Ujian Siswa</h1>
              <p className="text-sm text-gray-500 mt-1">Masukkan Nomor Peserta dan Token</p>
            </div>

            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">Nomor Peserta</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Contoh: CBT-2026-001" 
                  value={examId}
                  onChange={(e) => setExamId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">Nama Lengkap</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Nama siswa" 
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1.5">Token Ujian</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Token" 
                  value={examToken}
                  onChange={(e) => setExamToken(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <button 
                type="submit" 
                className="w-full mt-2 bg-black hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-xl text-sm transition-all shadow-sm"
              >
                Mulai Ujian Sekarang
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <button 
                type="button"
                onClick={() => setShowAdminModal(true)} 
                className="text-xs text-gray-500 hover:text-black font-medium transition-colors"
              >
                Masuk sebagai Administrator / Pengawas
              </button>
            </div>
          </div>
        )}

        {currentView === 'exam' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm flex flex-col justify-between min-h-[500px]">
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-6">
                  <div>
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-lg text-xs font-semibold">
                      Soal No. {currentQuestionIndex + 1} dari {questionsData.length}
                    </span>
                    <span className="ml-2 text-xs text-gray-500 font-medium">Matematika Peminatan</span>
                  </div>
                  <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-xl border border-red-100 font-mono text-sm font-semibold">
                    <span>{formatTime(timeLeft)}</span>
                  </div>
                </div>

                <div className="mb-8">
                  <p className="text-base sm:text-lg font-medium text-gray-900 leading-relaxed mb-6">
                    {questionsData[currentQuestionIndex].question}
                  </p>
                  <div className="space-y-3">
                    {questionsData[currentQuestionIndex].options.map((opt, idx) => {
                      const isSelected = studentAnswers[currentQuestionIndex] === idx;
                      return (
                        <label 
                          key={idx} 
                          className={`flex items-center p-3.5 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 hover:bg-gray-50'}`}
                        >
                          <input 
                            type="radio" 
                            name={`question-${currentQuestionIndex}`}
                            checked={isSelected}
                            onChange={() => setStudentAnswers({ ...studentAnswers, [currentQuestionIndex]: idx })}
                            className="w-4 h-4 text-black border-gray-300"
                          />
                          <span className="ml-3 text-sm font-medium text-gray-800">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <button 
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-40"
                >
                  Sebelumnya
                </button>
                <button 
                  onClick={() => {
                    const currentFlag = flaggedQuestions[currentQuestionIndex];
                    setFlaggedQuestions({ ...flaggedQuestions, [currentQuestionIndex]: !currentFlag });
                  }}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${flaggedQuestions[currentQuestionIndex] ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'}`}
                >
                  {flaggedQuestions[currentQuestionIndex] ? 'Ragu-ragu (Ditandai)' : 'Ragu-ragu'}
                </button>
                <button 
                  onClick={() => {
                    if (currentQuestionIndex < questionsData.length - 1) {
                      setCurrentQuestionIndex(prev => prev + 1);
                    } else {
                      handleSubmitExam(false);
                    }
                  }}
                  className="px-5 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  {currentQuestionIndex === questionsData.length - 1 ? 'Selesai & Kirim' : 'Selanjutnya'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-900">Navigasi Soal</h3>
                  <span className="text-xs text-gray-500 font-medium">
                    {Object.keys(studentAnswers).length}/{questionsData.length} Terjawab
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2 mb-6">
                  {questionsData.map((_, idx) => {
                    const isAnswered = studentAnswers[idx] !== undefined;
                    const isFlagged = flaggedQuestions[idx];
                    const isCurrent = currentQuestionIndex === idx;

                    let btnClass = "h-10 rounded-xl text-xs font-semibold flex items-center justify-center transition-all border ";
                    if (isCurrent) btnClass += "ring-2 ring-black font-bold ";
                    if (isFlagged) btnClass += "bg-amber-400 text-white border-amber-500";
                    else if (isAnswered) btnClass += "bg-black text-white border-black";
                    else btnClass += "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100";

                    return (
                      <button key={idx} onClick={() => setCurrentQuestionIndex(idx)} className={btnClass}>
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <button 
                  onClick={() => handleSubmitExam(false)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-all"
                >
                  Selesai & Kirim Ujian
                </button>
              </div>
            </div>
          </div>
        )}

        {currentView === 'admin' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dasbor Pengawas & Admin</h1>
                <p className="text-sm text-gray-500">Rekapitulasi nilai dan jawaban siswa.</p>
              </div>
              <button 
                onClick={() => setCurrentView('login')}
                className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800"
              >
                Keluar Dasbor
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-6">
              <h3 className="text-base font-bold text-gray-900 mb-4">Hasil Rekapitulasi Siswa</h3>
              {loadingDb ? (
                <p className="text-sm text-gray-500 py-6 text-center">Memuat data...</p>
              ) : submissionsList.length === 0 ? (
                <p className="text-sm text-gray-500 py-6 text-center">Belum ada data ujian yang masuk.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <th className="py-3 px-4">ID Ujian</th>
                        <th className="py-3 px-4">Nama Siswa</th>
                        <th className="py-3 px-4">Pelanggaran</th>
                        <th className="py-3 px-4">Nilai</th>
                        <th className="py-3 px-4">Waktu Kirim</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {submissionsList.map((sub, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-mono text-xs">{sub.exam_id}</td>
                          <td className="py-3 px-4 font-medium text-gray-900">{sub.student_name}</td>
                          <td className="py-3 px-4">{sub.violation_count} kali</td>
                          <td className="py-3 px-4 font-bold text-emerald-600">{sub.score}</td>
                          <td className="py-3 px-4 text-xs text-gray-500">{new Date(sub.submitted_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {showAdminModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Login Administrator</h3>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Username Admin</label>
                <input 
                  type="text" 
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">Password</label>
                <input 
                  type="password" 
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm"
                  required 
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAdminModal(false)}
                  className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-medium"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="w-1/2 bg-black hover:bg-gray-800 text-white py-2.5 rounded-xl text-sm font-medium"
                >
                  Masuk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalInfo.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-100 text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{modalInfo.title}</h3>
            <p className="text-sm text-gray-600 mb-6">{modalInfo.message}</p>
            <button 
              type="button"
              onClick={() => setModalInfo({ ...modalInfo, show: false })}
              className="w-full bg-black text-white py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-500">
        <p>© 2026 CBT Online Platform. Robust Safe Mode Active.</p>
      </footer>
    </div>
  );
}
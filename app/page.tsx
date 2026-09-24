'use client';

import React, { useState, useEffect } from 'react';

export default function CBTApp() {
const [view, setView] = useState<'portal' | 'exam' | 'result' | 'admin'>('portal');
const [adminTab, setAdminTab] = useState<'rekap' | 'siswa' | 'soal' | 'token'>('rekap');

const [students, setStudents] = useState<any[]>([]);
const [questions, setQuestions] = useState<any[]>([]);
const [results, setResults] = useState<any[]>([]);
const [settings, setSettings] = useState({
title: 'Tryout Matematika SMP Kelas 7',
token: 'CBT2026',
duration: 60,
adminPassword: 'admin123'
});

const [loginForm, setLoginForm] = useState({ id: '', name: '', token: '' });
const [currentSession, setCurrentSession] = useState<{
student: { id: string; name: string } | null;
answers: { [key: number]: string };
currentIndex: number;
timeLeft: number;
}>({ student: null, answers: {}, currentIndex: 0, timeLeft: 60 * 60 });

const [newStudent, setNewStudent] = useState({ id: '', name: '', class: 'SMP Kelas 7' });
const [newQuestion, setNewQuestion] = useState({ subject: 'Matematika', text: '', a: '', b: '', c: '', d: '', ans: 'A' });
const [bulkJson, setBulkJson] = useState('');
const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

useEffect(() => {
const savedStudents = localStorage.getItem('cbt_students');
const savedQuestions = localStorage.getItem('cbt_questions');
const savedResults = localStorage.getItem('cbt_results');
const savedSettings = localStorage.getItem('cbt_settings');

if (savedStudents) {
  setStudents(JSON.parse(savedStudents));
} else {
  const defaultStudents = [
    { id: '7A-001', name: 'Ahmad Fauzi', class: 'SMP Kelas 7' },
    { id: '8B-001', name: 'Budi Santoso', class: 'SMP Kelas 8' },
    { id: '9C-001', name: 'Dewi Lestari', class: 'SMP Kelas 9' }
  ];
  setStudents(defaultStudents);
  localStorage.setItem('cbt_students', JSON.stringify(defaultStudents));
}

if (savedQuestions) {
  setQuestions(JSON.parse(savedQuestions));
} else {
  const defaultQuestions = [
    { id: 1, subject: 'Matematika', text: 'Berapakah hasil dari 15 + 25 x 2?', options: ['80', '65', '50', '90'], answer: 'B' },
    { id: 2, subject: 'Bahasa Indonesia', text: 'Sinonim dari kata "Cermat" adalah...', options: ['Ceroboh', 'Teliti', 'Cepat', 'Lambat'], answer: 'B' }
  ];
  setQuestions(defaultQuestions);
  localStorage.setItem('cbt_questions', JSON.stringify(defaultQuestions));
}

if (savedResults) setResults(JSON.parse(savedResults));
if (savedSettings) setSettings(JSON.parse(savedSettings));


}, []);

const saveToStorage = (key: string, data: any) => {
localStorage.setItem(key, JSON.stringify(data));
};

useEffect(() => {
let timer: ReturnType;
if (view === 'exam' && currentSession.timeLeft > 0) {
timer = setInterval(() => {
setCurrentSession(prev => {
if (prev.timeLeft <= 1) {
clearInterval(timer);
submitExam();
return { ...prev, timeLeft: 0 };
}
return { ...prev, timeLeft: prev.timeLeft - 1 };
});
}, 1000);
}
return () => clearInterval(timer);
}, [view, currentSession.timeLeft]);

const handleStudentLogin = (e: React.FormEvent) => {
e.preventDefault();
if (loginForm.token.toUpperCase() !== settings.token) {
alert('Token ujian salah atau belum aktif!');
return;
}
if (questions.length === 0) {
alert('Belum ada soal ujian di bank soal!');
return;
}

setCurrentSession({
  student: { id: loginForm.id, name: loginForm.name },
  answers: {},
  currentIndex: 0,
  timeLeft: settings.duration * 60
});
setView('exam');


};

const submitExam = () => {
let correct = 0;
questions.forEach((q, idx) => {
if (currentSession.answers[idx] === q.answer) correct++;
});
const score = Math.round((correct / questions.length) * 100);

const newResult = {
  id: Date.now(),
  studentId: currentSession.student?.id || 'Unknown',
  studentName: currentSession.student?.name || 'Siswa',
  subject: settings.title,
  score,
  timestamp: new Date().toLocaleString('id-ID')
};

const updatedResults = [...results, newResult];
setResults(updatedResults);
saveToStorage('cbt_results', updatedResults);
setView('result');


};

const handleAdminLoginPrompt = () => {
const pass = prompt('Masukkan Password Admin:');
const validPass = settings.adminPassword || 'admin123';
if (pass === validPass || pass === 'admin123') {
setIsAdminLoggedIn(true);
setView('admin');
} else if (pass !== null) {
alert('Password admin salah!');
}
};

const deleteQuestion = (idx: number) => {
const updated = questions.filter((_, i) => i !== idx);
setQuestions(updated);
saveToStorage('cbt_questions', updated);
};

const deleteResult = (id: number) => {
const updated = results.filter((r: any) => r.id !== id);
setResults(updated);
saveToStorage('cbt_results', updated);
};

return (




CBT.EDU


Terhubung Cloud



{view === 'admin' ? 'Administrator' : 'Portal Siswa'}
{view === 'admin' ? (
<button onClick={() => { setView('portal'); setIsAdminLoggedIn(false); }} className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1.5 rounded-lg font-medium transition">
Keluar Admin

) : (

Login Admin

)}




  <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8">
    {view === 'portal' && (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Portal Ujian Siswa</h1>
          <p className="text-sm text-slate-500 mt-1">Masukkan Nomor Peserta dan Token Ujian</p>
        </div>
        <form onSubmit={handleStudentLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Nomor Peserta</label>
            <input type="text" required value={loginForm.id} onChange={e => setLoginForm({...loginForm, id: e.target.value})} placeholder="Contoh: 7A-001" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-black" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Nama Lengkap</label>
            <input type="text" required value={loginForm.name} onChange={e => setLoginForm({...loginForm, name: e.target.value})} placeholder="Nama lengkap siswa" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-black" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Token Ujian</label>
            <input type="text" required value={loginForm.token} onChange={e => setLoginForm({...loginForm, token: e.target.value})} placeholder="Masukkan Token" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 uppercase tracking-widest font-bold text-sm outline-none focus:ring-2 focus:ring-black" />
          </div>
          <button type="submit" className="w-full bg-black hover:bg-slate-800 text-white font-medium py-3 rounded-xl transition text-sm">
            Mulai Ujian Sekarang
          </button>
        </form>
      </div>
    )}

    {view === 'exam' && (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6 flex justify-between items-center">
          <div>
            <span className="text-xs font-bold bg-black text-white px-2.5 py-1 rounded-md">{questions[currentSession.currentIndex]?.subject}</span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">{settings.title}</h2>
          </div>
          <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-2 rounded-xl">
            <span className="text-xs block text-amber-700 font-medium">Sisa Waktu</span>
            <span className="font-bold text-lg font-mono">
              {Math.floor(currentSession.timeLeft / 3600).toString().padStart(2, '0')}:
              {Math.floor((currentSession.timeLeft % 3600) / 60).toString().padStart(2, '0')}:
              {(currentSession.timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
              <span className="text-sm font-bold text-slate-600">Soal No. {currentSession.currentIndex + 1} dari {questions.length}</span>
            </div>
            <div className="text-slate-800 font-medium text-base mb-6">
              {questions[currentSession.currentIndex]?.text}
            </div>
            <div className="space-y-3">
              {questions[currentSession.currentIndex]?.options.map((opt: string, idx: number) => {
                const optLetter = ['A', 'B', 'C', 'D'][idx];
                const isSelected = currentSession.answers[currentSession.currentIndex] === optLetter;
                return (
                  <div key={idx} onClick={() => setCurrentSession({ ...currentSession, answers: { ...currentSession.answers, [currentSession.currentIndex]: optLetter } })} className={`p-3.5 rounded-xl border cursor-pointer flex items-center space-x-3 transition ${isSelected ? 'border-black bg-slate-50 font-medium' : 'border-slate-200 hover:border-slate-300'}`}>
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${isSelected ? 'bg-black text-white' : 'bg-slate-100 text-slate-700'}`}>{optLetter}</span>
                    <span className="text-sm">{opt}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-100">
              <button disabled={currentSession.currentIndex === 0} onClick={() => setCurrentSession({...currentSession, currentIndex: currentSession.currentIndex - 1})} className="px-5 py-2.5 border border-slate-300 rounded-xl text-sm font-medium disabled:opacity-50">Sebelumnya</button>
              <button disabled={currentSession.currentIndex === questions.length - 1} onClick={() => setCurrentSession({...currentSession, currentIndex: currentSession.currentIndex + 1})} className="px-5 py-2.5 bg-black text-white rounded-xl text-sm font-medium disabled:opacity-50">Selanjutnya</button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">Navigasi Soal</h3>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((_, idx: number) => {
                  const answered = currentSession.answers[idx] !== undefined;
                  const active = currentSession.currentIndex === idx;
                  return (
                    <button key={idx} onClick={() => setCurrentSession({...currentSession, currentIndex: idx})} className={`h-10 rounded-xl font-bold text-xs border ${active ? 'border-black ring-2 ring-black/20' : 'border-slate-200'} ${answered ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50'}`}>
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
            <button onClick={() => { if(confirm('Kumpulkan ujian?')) submitExam(); }} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-xl text-sm mt-6">
              Selesai & Kumpulkan
            </button>
          </div>
        </div>
      </div>
    )}

    {view === 'result' && (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">✓</div>
        <h2 className="text-2xl font-bold text-slate-900">Ujian Telah Selesai</h2>
        <div className="my-6 p-6 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">Nilai Akhir Anda</span>
          <span className="text-4xl font-extrabold text-slate-900 font-mono">
            {results[results.length - 1]?.score || 0}
          </span>
        </div>
        <button onClick={() => setView('portal')} className="w-full bg-black text-white font-medium py-3 rounded-xl text-sm">
          Keluar / Selesai
        </button>
      </div>
    )}

    {view === 'admin' && (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dasbor Admin & Master Data CBT</h1>
            <p className="text-sm text-slate-500">Kelola peserta ujian SMP & SMA, bank soal, token, dan rekapitulasi nilai.</p>
          </div>
        </div>

        <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-4 pt-2 space-x-4 overflow-x-auto">
          <button onClick={() => setAdminTab('rekap')} className={`px-6 py-3 border-b-2 font-semibold text-sm whitespace-nowrap ${adminTab === 'rekap' ? 'border-black text-black' : 'border-transparent text-slate-500'}`}>Rekap Nilai</button>
          <button onClick={() => setAdminTab('siswa')} className={`px-6 py-3 border-b-2 font-semibold text-sm whitespace-nowrap ${adminTab === 'siswa' ? 'border-black text-black' : 'border-transparent text-slate-500'}`}>Master Data Siswa</button>
          <button onClick={() => setAdminTab('soal')} className={`px-6 py-3 border-b-2 font-semibold text-sm whitespace-nowrap ${adminTab === 'soal' ? 'border-black text-black' : 'border-transparent text-slate-500'}`}>Bank Soal & Import</button>
          <button onClick={() => setAdminTab('token')} className={`px-6 py-3 border-b-2 font-semibold text-sm whitespace-nowrap ${adminTab === 'token' ? 'border-black text-black' : 'border-transparent text-slate-500'}`}>Pengaturan & Password</button>
        </div>

        {adminTab === 'rekap' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-slate-900">Hasil Rekapitulasi Ujian</h2>
              <div className="space-x-2">
                <button onClick={() => {
                  if (results.length === 0) { alert('Belum ada data rekap'); return; }
                  let csv = "No Peserta,Nama,Mapel,Nilai,Waktu\n";
                  results.forEach((r: any) => csv += `"${r.studentId}","${r.studentName}","${r.subject}",${r.score},"${r.timestamp}"\n`);
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a'); a.href = url; a.download = 'rekap_cbt.csv'; a.click();
                }} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3 py-2 rounded-xl font-medium">Unduh CSV</button>
                <button onClick={() => { if(confirm('Hapus seluruh arsip nilai lama?')) { setResults([]); saveToStorage('cbt_results', []); }}} className="bg-rose-50 text-rose-700 text-xs px-3 py-2 rounded-xl font-medium">Hapus Data Lama</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                    <th className="p-3">No Peserta</th>
                    <th className="p-3">Nama Siswa</th>
                    <th className="p-3">Ujian</th>
                    <th className="p-3">Nilai</th>
                    <th className="p-3">Waktu</th>
                    <th className="p-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {results.length === 0 ? (
                    <tr><td colSpan={6} className="p-6 text-center text-slate-400">Belum ada data rekapitulasi ujian.</td></tr>
                  ) : (
                    results.map((r: any) => (
                      <tr key={r.id} className="border-b border-slate-100">
                        <td className="p-3 font-mono">{r.studentId}</td>
                        <td className="p-3">{r.studentName}</td>
                        <td className="p-3 text-xs text-slate-500">{r.subject}</td>
                        <td className="p-3 font-bold">{r.score}</td>
                        <td className="p-3 text-xs text-slate-400">{r.timestamp}</td>
                        <td className="p-3 text-center">
                          <button onClick={() => deleteResult(r.id)} className="text-rose-600 hover:underline text-xs font-medium">Hapus</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {adminTab === 'siswa' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4">Tambah Siswa Baru</h3>
              <form onSubmit={e => {
                e.preventDefault();
                const updated = [...students, newStudent];
                setStudents(updated);
                saveToStorage('cbt_students', updated);
                setNewStudent({ id: '', name: '', class: 'SMP Kelas 7' });
                alert('Siswa berhasil ditambahkan');
              }} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nomor Peserta</label>
                  <input type="text" required value={newStudent.id} onChange={e => setNewStudent({...newStudent, id: e.target.value})} placeholder="7A-001" className="w-full px-3 py-2 rounded-xl border text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Lengkap</label>
                  <input type="text" required value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} placeholder="Nama Siswa" className="w-full px-3 py-2 rounded-xl border text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tingkat Kelas</label>
                  <select value={newStudent.class} onChange={e => setNewStudent({...newStudent, class: e.target.value})} className="w-full px-3 py-2 rounded-xl border text-sm bg-white">
                    <option value="SMP Kelas 7">SMP Kelas 7</option>
                    <option value="SMP Kelas 8">SMP Kelas 8</option>
                    <option value="SMP Kelas 9">SMP Kelas 9</option>
                    <option value="SMA Kelas 10">SMA Kelas 10</option>
                    <option value="SMA Kelas 11">SMA Kelas 11</option>
                    <option value="SMA Kelas 12">SMA Kelas 12</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-black text-white py-2.5 rounded-xl text-sm font-medium">Simpan Siswa</button>
              </form>
            </div>

            <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-slate-900">Daftar Peserta Terdaftar</h3>
                <button onClick={() => {
                  const sample = [
                    { id: '7A-001', name: 'Ahmad Fauzi', class: 'SMP Kelas 7' },
                    { id: '8B-001', name: 'Rizky Pratama', class: 'SMP Kelas 8' },
                    { id: '9C-001', name: 'Dewi Lestari', class: 'SMP Kelas 9' }
                  ];
                  setStudents(sample);
                  saveToStorage('cbt_students', sample);
                }} className="text-xs text-blue-600 font-medium hover:underline">Muat Contoh Siswa (SMP 7,8,9)</button>
              </div>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b text-xs uppercase text-slate-500 font-semibold">
                      <th className="p-3">No Peserta</th>
                      <th className="p-3">Nama</th>
                      <th className="p-3">Kelas</th>
                      <th className="p-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, idx: number) => (
                      <tr key={idx} className="border-b">
                        <td className="p-3 font-mono">{s.id}</td>
                        <td className="p-3">{s.name}</td>
                        <td className="p-3"><span className="bg-slate-100 text-xs px-2.5 py-1 rounded">{s.class}</span></td>
                        <td className="p-3 text-center">
                          <button onClick={() => {
                            const updated = students.filter((_, i: number) => i !== idx);
                            setStudents(updated);
                            saveToStorage('cbt_students', updated);
                          }} className="text-rose-600 text-xs font-medium">Hapus</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {adminTab === 'soal' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-base font-bold text-slate-900 mb-2">Buat Soal Manual</h3>
                <form onSubmit={e => {
                  e.preventDefault();
                  const q = {
                    id: Date.now(),
                    subject: newQuestion.subject,
                    text: newQuestion.text,
                    options: [newQuestion.a, newQuestion.b, newQuestion.c, newQuestion.d],
                    answer: newQuestion.ans
                  };
                  const updated = [...questions, q];
                  setQuestions(updated);
                  saveToStorage('cbt_questions', updated);
                  setNewQuestion({ subject: 'Matematika', text: '', a: '', b: '', c: '', d: '', ans: 'A' });
                  alert('Soal berhasil ditambahkan');
                }} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Mata Pelajaran</label>
                    <input type="text" required value={newQuestion.subject} onChange={e => setNewQuestion({...newQuestion, subject: e.target.value})} className="w-full px-3 py-2 rounded-xl border text-sm outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Pertanyaan</label>
                    <textarea required rows={2} value={newQuestion.text} onChange={e => setNewQuestion({...newQuestion, text: e.target.value})} className="w-full px-3 py-2 rounded-xl border text-sm outline-none"></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" required placeholder="Opsi A" value={newQuestion.a} onChange={e => setNewQuestion({...newQuestion, a: e.target.value})} className="px-3 py-2 rounded-xl border text-sm" />
                    <input type="text" required placeholder="Opsi B" value={newQuestion.b} onChange={e => setNewQuestion({...newQuestion, b: e.target.value})} className="px-3 py-2 rounded-xl border text-sm" />
                    <input type="text" required placeholder="Opsi C" value={newQuestion.c} onChange={e => setNewQuestion({...newQuestion, c: e.target.value})} className="px-3 py-2 rounded-xl border text-sm" />
                    <input type="text" required placeholder="Opsi D" value={newQuestion.d} onChange={e => setNewQuestion({...newQuestion, d: e.target.value})} className="px-3 py-2 rounded-xl border text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Kunci Jawaban (A/B/C/D)</label>
                    <input type="text" maxLength={1} required value={newQuestion.ans} onChange={e => setNewQuestion({...newQuestion, ans: e.target.value.toUpperCase()})} className="w-20 px-3 py-2 rounded-xl border text-sm uppercase font-bold" />
                  </div>
                  <button type="submit" className="w-full bg-black text-white py-2 rounded-xl text-sm font-medium">Tambah Soal</button>
                </form>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">Import Cepat Soal (JSON)</h3>
                  <textarea rows={6} value={bulkJson} onChange={e => setBulkJson(e.target.value)} placeholder='[{"question":"2+2?", "options":["2","3","4","5"], "answer":"C", "subject":"Matematika"}]' className="w-full px-3 py-2 rounded-xl border text-xs font-mono outline-none"></textarea>
                </div>
                <div className="mt-4 space-y-2">
                  <button onClick={() => {
                    try {
                      const parsed = JSON.parse(bulkJson);
                      if (Array.isArray(parsed)) {
                        const formatted = parsed.map((item: any) => ({
                          id: Date.now() + Math.random(),
                          subject: item.subject || 'Umum',
                          text: item.question,
                          options: item.options,
                          answer: item.answer.toUpperCase()
                        }));
                        const updated = [...questions, ...formatted];
                        setQuestions(updated);
                        saveToStorage('cbt_questions', updated);
                        setBulkJson('');
                        alert(`${parsed.length} soal berhasil diimport!`);
                      }
                    } catch {
                      alert('Format JSON salah!');
                    }
                  }} className="w-full bg-slate-900 text-white py-2.5 rounded-xl text-sm font-medium">Proses Import Cepat</button>
                  <button onClick={() => {
                    const sample = [
                      { id: 1, subject: 'Matematika', text: 'Berapakah 12 x 8 - 15?', options: ['81', '71', '91', '61'], answer: 'A' },
                      { id: 2, subject: 'Bahasa Indonesia', text: 'Sinonim "Cermat" adalah...', options: ['Ceroboh', 'Teliti', 'Cepat', 'Lambat'], answer: 'B' }
                    ];
                    setQuestions(sample);
                    saveToStorage('cbt_questions', sample);
                  }} className="w-full bg-slate-100 text-slate-700 py-2 rounded-xl text-xs font-medium">Muat Soal Contoh</button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-base font-bold text-slate-900 mb-4">Daftar Soal di Bank Soal</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {questions.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">Belum ada soal di bank soal.</p>
                ) : (
                  questions.map((q: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex justify-between items-start gap-4">
                      <div>
                        <span className="text-xs font-bold bg-black text-white px-2 py-0.5 rounded">Soal #{idx + 1} ({q.subject})</span>
                        <p className="text-sm font-medium text-slate-800 mt-2">{q.text}</p>
                        <p className="text-xs text-slate-500 mt-1">Kunci Jawaban: <strong className="text-emerald-600">{q.answer}</strong></p>
                      </div>
                      <button onClick={() => deleteQuestion(idx)} className="text-rose-600 hover:underline text-xs whitespace-nowrap font-medium">Hapus</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {adminTab === 'token' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 max-w-lg">
            <h3 className="text-base font-bold text-slate-900 mb-4">Pengaturan Token & Keamanan</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Judul Ujian</label>
                <input type="text" value={settings.title} onChange={e => setSettings({...settings, title: e.target.value})} className="w-full px-3 py-2 rounded-xl border text-sm outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Token Ujian Aktif</label>
                <div className="flex space-x-2">
                  <input type="text" readOnly value={settings.token} className="w-full px-3 py-2 rounded-xl border text-sm font-mono font-bold bg-slate-50" />
                  <button onClick={() => {
                    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                    let t = ''; for(let i=0; i<6; i++) t += chars.charAt(Math.floor(Math.random()*chars.length));
                    setSettings({...settings, token: t});
                  }} className="bg-black text-white px-4 py-2 rounded-xl text-xs">Buat Baru</button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Durasi Ujian (Menit)</label>
                <input type="number" value={settings.duration} onChange={e => setSettings({...settings, duration: parseInt(e.target.value) || 60})} className="w-full px-3 py-2 rounded-xl border text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Ubah Password Admin</label>
                <input type="text" value={settings.adminPassword} onChange={e => setSettings({...settings, adminPassword: e.target.value})} className="w-full px-3 py-2 rounded-xl border text-sm font-mono" />
              </div>
              <button onClick={() => {
                saveToStorage('cbt_settings', settings);
                alert('Pengaturan dan password admin berhasil disimpan!');
              }} className="w-full bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-medium">Simpan Pengaturan</button>
            </div>
          </div>
        )}
      </div>
    )}
  </main>
</div>


);
}

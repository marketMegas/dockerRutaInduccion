import React, { useEffect, useState } from 'react';
import {
  GraduationCap, Trophy, BookOpen, CheckCircle2, XCircle,
  Clock, BarChart3, Star, Award, RefreshCcw, ChevronRight
} from 'lucide-react';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

// Course metadata from api.js (same source of truth)
const COURSES_META = [
  {
    id: 4,
    title: 'pruebaCreacion28',
    level: 'Prueba',
    totalLessons: 3,
    totalQuestions: 3,
    color: '#5fbd44',
    bgLight: '#f2ffee',
    icon: '🟢',
    description: 'Curso de prueba para validar la creación de nuevos cursos.',
  },
];

const getGradeInfo = (percentage) => {
  if (percentage === null || percentage === undefined) {
    return { label: 'Sin calificar', color: '#a0af9c', bg: '#f3f4f6', textColor: '#70806b' };
  }
  if (percentage >= 90) return { label: 'Excelente', color: '#10b981', bg: '#d1fae5', textColor: '#065f46' };
  if (percentage >= 70) return { label: 'Bueno', color: '#f59e0b', bg: '#fef3c7', textColor: '#92400e' };
  return { label: 'Por mejorar', color: '#ef4444', bg: '#fee2e2', textColor: '#991b1b' };
};

const CircularProgress = ({ percentage, color, size = 80 }) => {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const value = percentage ?? 0;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e5e7eb" strokeWidth="8" fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        stroke={color}
        strokeWidth="8"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
      />
    </svg>
  );
};

export const CalificacionesPage = () => {
  const { currentUser } = useAuth();
  const [grades, setGrades] = useState({});   // { courseId: gradeDoc }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    // Fetch desde API de Django
    const fetchDjangoGrades = async () => {
      try {
        const res = await fetch(`/api/cursos/calificaciones/${currentUser.uid}/`);
        if (res.ok) {
          const list = await res.json();
          const result = {};
          list.forEach((item) => {
            result[item.course_id] = {
              courseId: item.course_id,
              courseName: item.course_name,
              score: item.score,
              totalQuestions: item.total_questions,
              percentage: item.percentage,
              passed: item.passed,
              completedAt: item.fecha_creacion,
            };
          });
          setGrades((prev) => ({ ...result, ...prev }));
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching grades from Django API:', err);
      }
    };

    fetchDjangoGrades();

    const q = query(
      collection(db, 'calificaciones'),
      where('userId', '==', currentUser.uid)
    );

    // Real-time listener — updates instantly when a quiz is finished
    const unsubscribe = onSnapshot(q, (snap) => {
      const result = {};
      snap.forEach((d) => {
        const data = d.data();
        result[data.courseId] = data;
      });
      setGrades((prev) => ({ ...prev, ...result }));
      setLoading(false);
    }, (err) => {
      console.error('Error fetching grades from Firestore:', err);
      setLoading(false);
    });

    // Cleanup listener when component unmounts
    return () => unsubscribe();
  }, [currentUser]);


  // Compute overall stats
  const gradeValues = Object.values(grades);
  const attempted = gradeValues.length;
  const passed = gradeValues.filter((g) => g.passed).length;
  const avgPercentage = attempted > 0
    ? Math.round(gradeValues.reduce((sum, g) => sum + g.percentage, 0) / attempted)
    : null;

  const formatDate = (ts) => {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-14 h-14 rounded-full border-4 border-[#f6811e] border-t-transparent animate-spin" />
        <p className="text-gray-500 font-semibold">Cargando calificaciones…</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">

      {/* ── PAGE HEADER ── */}
      <div className="bg-gradient-to-r from-[#f6811e] to-[#5fbd44] rounded-3xl p-8 text-white relative overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#f6811e]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-6 left-20 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/20">
            <GraduationCap className="w-8 h-8 text-[#f6811e]" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-black tracking-tight">Mis Calificaciones</h1>
            <p className="text-green-200 font-medium mt-1">
              Resultados de tus evaluaciones en Universidad G‑MAX
            </p>
          </div>

          {avgPercentage !== null && (
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl px-6 py-4 text-center flex-shrink-0">
              <p className="text-green-200 text-xs font-bold uppercase tracking-widest mb-1">Promedio general</p>
              <p className={`text-4xl font-black ${avgPercentage >= 90 ? 'text-green-400' : avgPercentage >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                {avgPercentage}%
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── SUMMARY STATS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: BookOpen,
            label: 'Cursos evaluados',
            value: `${attempted} / ${COURSES_META.length}`,
            color: '#f6811e',
            bg: '#edffe8',
          },
          {
            icon: CheckCircle2,
            label: 'Aprobados (≥ 90%)',
            value: `${passed} / ${attempted || '—'}`,
            color: '#10b981',
            bg: '#d1fae5',
          },
          {
            icon: Trophy,
            label: 'Mejor calificación',
            value: gradeValues.length
              ? `${Math.max(...gradeValues.map((g) => g.percentage))}%`
              : '—',
            color: '#f59e0b',
            bg: '#fef3c7',
          },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4 hover:shadow-md transition-shadow duration-300"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
              <Icon className="w-6 h-6" style={{ color }} />
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{label}</p>
              <p className="text-2xl font-black text-[#f6811e] mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── COURSE GRADE CARDS ── */}
      <div>
        <h2 className="text-lg font-black text-[#f6811e] mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#f6811e]" />
          Resultados por curso
        </h2>

        <div className="space-y-4">
          {COURSES_META.map((course) => {
            const grade = grades[course.id];
            const gradeInfo = getGradeInfo(grade?.percentage);
            const pct = grade?.percentage ?? null;

            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6">

                  {/* Course info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* circular progress */}
                    <div className="relative flex-shrink-0">
                      <CircularProgress percentage={pct} color={course.color} size={72} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-black text-[#f6811e]">
                          {pct !== null ? `${pct}%` : '—'}
                        </span>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: course.bgLight, color: course.color }}
                        >
                          {course.level}
                        </span>
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: gradeInfo.bg, color: gradeInfo.textColor }}
                        >
                          {gradeInfo.label}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-[#f6811e] truncate">{course.title}</h3>
                      <p className="text-gray-400 text-xs mt-0.5 truncate">{course.description}</p>
                    </div>
                  </div>

                  {/* Grade detail */}
                  <div className="flex-shrink-0 sm:text-right w-full sm:w-auto">
                    {grade ? (
                      <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-1 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <Star className="w-4 h-4" style={{ color: course.color }} />
                          <span className="font-black text-[#f6811e]">
                            {grade.score} / {grade.totalQuestions}
                          </span>
                          <span className="text-gray-400 text-sm font-medium">respuestas correctas</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Completado: {formatDate(grade.completedAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {grade.passed
                            ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                            : <XCircle className="w-4 h-4 text-red-400" />}
                          <span className={`text-xs font-bold ${grade.passed ? 'text-green-600' : 'text-red-500'}`}>
                            {grade.passed ? 'APROBADO' : 'NO APROBADO'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400">
                        <RefreshCcw className="w-4 h-4" />
                        <span className="text-sm font-semibold">Evaluación pendiente</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar at bottom */}
                <div className="h-1.5 bg-gray-100">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${pct ?? 0}%`,
                      backgroundColor: gradeInfo.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── GRADE SCALE LEGEND ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-black text-[#f6811e] uppercase tracking-widest mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-[#f6811e]" />
          Escala de calificaciones
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { range: '90% – 100%', label: 'Excelente', desc: 'Curso aprobado', color: '#10b981', bg: '#d1fae5' },
            { range: '70% – 89%', label: 'Bueno', desc: 'Sigue practicando', color: '#f59e0b', bg: '#fef3c7' },
            { range: '0% – 69%', label: 'Por mejorar', desc: 'Requiere repaso', color: '#ef4444', bg: '#fee2e2' },
          ].map(({ range, label, desc, color, bg }) => (
            <div key={range} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: bg }}>
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <div>
                <p className="text-xs font-black" style={{ color }}>{label} &nbsp;·&nbsp; {range}</p>
                <p className="text-xs font-medium text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── EMPTY STATE ── */}
      {attempted === 0 && (
        <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-[#edffe8] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-[#f6811e]" />
          </div>
          <h3 className="text-xl font-black text-[#f6811e] mb-2">Aún no tienes evaluaciones</h3>
          <p className="text-gray-400 font-medium mb-6 max-w-sm mx-auto">
            Completa el quiz al final de cada curso para que tus calificaciones aparezcan aquí.
          </p>
          <a
            href="/cursos"
            className="inline-flex items-center gap-2 bg-[#f6811e] text-white font-black px-6 py-3 rounded-xl hover:bg-[#5fbd44] transition-colors duration-200"
          >
            Ir a mis cursos
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      )}

    </div>
  );
};

import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase, Exam } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, FileText, Users, CheckCircle, Clock, Copy, Eye } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import toast from 'react-hot-toast'

export default function TeacherDashboard() {
  const { profile } = useAuth()
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (profile?.id) fetchExams()
  }, [profile])

  const fetchExams = async () => {
    const { data } = await supabase.from('exams').select('*').eq('teacher_id', profile!.id).order('created_at', { ascending: false })
    setExams(data || [])
    setLoading(false)
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Session code copied!')
  }

  const stats = [
    { label: 'Total Exams', value: exams.length, icon: FileText, color: 'bg-blue-100 text-blue-600' },
    { label: 'Active Exams', value: exams.filter(e => e.status === 'active').length, icon: Eye, color: 'bg-green-100 text-green-600' },
    { label: 'Closed Exams', value: exams.filter(e => e.status === 'closed').length, icon: CheckCircle, color: 'bg-gray-100 text-gray-600' },
  ]

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {profile?.name?.split(' ')[0]}!</h1>
            <p className="text-gray-500 mt-1">{profile?.institution}</p>
          </div>
          <button onClick={() => navigate('/teacher/create-exam')} className="btn-primary flex items-center gap-2">
            <PlusCircle size={20} />Create Exam
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {stats.map(s => (
            <div key={s.label} className="card-p flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                <s.icon size={22} />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{s.value}</div>
                <div className="text-gray-500 text-sm">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Exams */}
        <div className="card-p">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">My Exams</h2>
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : exams.length === 0 ? (
            <div className="text-center py-16">
              <FileText size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">No exams created yet</p>
              <button onClick={() => navigate('/teacher/create-exam')} className="btn-primary">Create Your First Exam</button>
            </div>
          ) : (
            <div className="space-y-4">
              {exams.map(exam => (
                <div key={exam.id} className="flex items-center justify-between p-5 rounded-xl border border-gray-200 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-900 text-lg">{exam.title}</h3>
                      <span className={exam.status === 'active' ? 'badge-green' : exam.status === 'closed' ? 'badge-gray' : 'badge-amber'}>
                        {exam.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{exam.subject}</span>
                      <span>•</span>
                      <span>{exam.exam_type}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock size={14} />{exam.duration_minutes} min</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Users size={14} />{(exam.questions || []).length} questions</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <div className="text-right">
                      <div className="text-xs text-gray-400 mb-1">Session Code</div>
                      <div className="font-mono font-bold text-blue-600 text-lg tracking-widest">{exam.session_code}</div>
                    </div>
                    <button onClick={() => copyCode(exam.session_code)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400" aria-label="Copy code">
                      <Copy size={18} />
                    </button>
                    <button onClick={() => navigate(`/teacher/submissions/${exam.id}`)} className="btn-secondary text-sm px-4 py-2 min-h-0">
                      View Submissions
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

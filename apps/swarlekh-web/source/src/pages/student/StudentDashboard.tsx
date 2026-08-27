import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase, ExamSession } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Clock, CheckCircle, Mic } from 'lucide-react'
import Layout from '../../components/layout/Layout'

export default function StudentDashboard() {
  const { profile } = useAuth()
  const [sessions, setSessions] = useState<ExamSession[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => { if (profile?.id) fetchSessions() }, [profile])

  const fetchSessions = async () => {
    const { data } = await supabase.from('exam_sessions').select('*, exam:exams(*)').eq('student_id', profile!.id).order('created_at', { ascending: false })
    setSessions(data || [])
    setLoading(false)
  }

  return (
    <Layout>
      <div className="p-8">
        {/* Welcome */}
        <div className="rounded-2xl p-8 mb-8 text-white" style={{background:'linear-gradient(135deg,#0A1628,#1E3A5F)'}}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center"><Mic size={20} /></div>
            <span className="text-blue-300 font-medium">SwarLekh</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome, {profile?.name?.split(' ')[0]}!</h1>
          <p className="text-white/60 mb-6">{profile?.institution}</p>
          <button onClick={() => navigate('/student/join')} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all flex items-center gap-2">
            <BookOpen size={22} />Join Exam with Code
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label:'Exams Given', value: sessions.length, icon: BookOpen, color:'text-blue-600 bg-blue-100' },
            { label:'Submitted', value: sessions.filter(s => s.status === 'submitted').length, icon: CheckCircle, color:'text-green-600 bg-green-100' },
            { label:'In Progress', value: sessions.filter(s => s.status === 'in_progress').length, icon: Clock, color:'text-amber-600 bg-amber-100' },
          ].map(s => (
            <div key={s.label} className="card-p flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}><s.icon size={22} /></div>
              <div>
                <div className="text-3xl font-bold text-gray-900">{s.value}</div>
                <div className="text-gray-500 text-sm">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* History */}
        <div className="card-p">
          <h2 className="text-xl font-semibold text-gray-900 mb-5">Exam History</h2>
          {loading ? <div className="text-center py-12 text-gray-400">Loading...</div>
          : sessions.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No exams taken yet</p>
              <button onClick={() => navigate('/student/join')} className="btn-primary mt-4">Join Your First Exam</button>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map(session => (
                <div key={session.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
                  <div>
                    <div className="font-semibold text-gray-900">{(session.exam as any)?.title}</div>
                    <div className="text-sm text-gray-500">{(session.exam as any)?.subject} • {new Date(session.created_at).toLocaleDateString()}</div>
                  </div>
                  <span className={session.status === 'submitted' ? 'badge-green' : session.status === 'in_progress' ? 'badge-amber' : 'badge-blue'}>
                    {session.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

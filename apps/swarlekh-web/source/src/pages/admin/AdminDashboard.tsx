import { useEffect, useState } from 'react'
import { supabase, Profile, Exam } from '../../lib/supabase'
import { Users, FileText, GraduationCap, BookOpen, Shield, Clock } from 'lucide-react'
import Layout from '../../components/layout/Layout'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const [users, setUsers] = useState<Profile[]>([])
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview'|'users'|'exams'>('overview')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const [{ data: u }, { data: e }] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('exams').select('*, teacher:profiles(name)').order('created_at', { ascending: false }),
    ])
    setUsers(u || [])
    setExams(e || [])
    setLoading(false)
  }

  const pendingTeachers = users.filter(u => u.role === 'teacher' && u.approved === false)

  const stats = [
    { label:'Total Users', value: users.length, icon: Users, color:'bg-blue-100 text-blue-600' },
    { label:'Teachers', value: users.filter(u => u.role === 'teacher').length, icon: GraduationCap, color:'bg-purple-100 text-purple-600' },
    { label:'Students', value: users.filter(u => u.role === 'student').length, icon: BookOpen, color:'bg-green-100 text-green-600' },
    { label:'Total Exams', value: exams.length, icon: FileText, color:'bg-amber-100 text-amber-600' },
    { label:'Active Exams', value: exams.filter(e => e.status === 'active').length, icon: Shield, color:'bg-red-100 text-red-600' },
  ]

  const setTeacherApproval = async (userId: string, approved: boolean) => {
    const { error } = await supabase.from('profiles').update({ approved }).eq('id', userId)
    if (error) {
      toast.error('Could not update approval. Make sure ADD_FEATURES.sql has been run.')
      return
    }
    toast.success(approved ? 'Teacher approved' : 'Teacher access revoked')
    setUsers(u => u.map(x => x.id === userId ? { ...x, approved } : x))
  }

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-500 mb-8">System overview and management</p>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {stats.map(s => (
            <div key={s.label} className="card-p text-center">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${s.color}`}><s.icon size={22} /></div>
              <div className="text-3xl font-bold text-gray-900">{s.value}</div>
              <div className="text-gray-500 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['overview','users','exams'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-xl font-medium capitalize transition-all ${tab === t ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-200'}`}>
              {t}
            </button>
          ))}
        </div>

        {loading ? <div className="text-center py-12 text-gray-400">Loading...</div> : (
          <>
            {pendingTeachers.length > 0 && (
              <div className="card-p mb-6 border-l-4 border-amber-400">
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={18} className="text-amber-500" />
                  <h2 className="text-lg font-semibold text-gray-900">Pending Teacher Approvals ({pendingTeachers.length})</h2>
                </div>
                <div className="space-y-3">
                  {pendingTeachers.map(u => (
                    <div key={u.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-200">
                      <div>
                        <div className="font-medium text-gray-900">{u.name}</div>
                        <div className="text-sm text-gray-500">{u.email} • {u.institution}</div>
                      </div>
                      <button onClick={() => setTeacherApproval(u.id, true)} className="btn-primary text-sm px-4 py-2 min-h-0">
                        Approve
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {tab === 'users' && (
              <div className="card-p">
                <h2 className="text-lg font-semibold text-gray-900 mb-5">All Users ({users.length})</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-gray-200">
                      {['Name','Email','Role','Institution','Joined','Status'].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-gray-500 font-medium">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{u.name}</td>
                          <td className="py-3 px-4 text-gray-500">{u.email}</td>
                          <td className="py-3 px-4">
                            <span className={u.role === 'teacher' ? 'badge-blue' : u.role === 'admin' ? 'badge-red' : 'badge-green'}>{u.role}</span>
                          </td>
                          <td className="py-3 px-4 text-gray-500">{u.institution}</td>
                          <td className="py-3 px-4 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                          <td className="py-3 px-4">
                            {u.role !== 'teacher' ? (
                              <span className="text-gray-400">—</span>
                            ) : u.approved === false ? (
                              <button onClick={() => setTeacherApproval(u.id, true)} className="badge-amber cursor-pointer">Pending — Approve</button>
                            ) : (
                              <button onClick={() => setTeacherApproval(u.id, false)} className="badge-green cursor-pointer">Approved — Revoke</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {tab === 'exams' && (
              <div className="card-p">
                <h2 className="text-lg font-semibold text-gray-900 mb-5">All Exams ({exams.length})</h2>
                <div className="space-y-3">
                  {exams.map(e => (
                    <div key={e.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-200">
                      <div>
                        <div className="font-semibold text-gray-900">{e.title}</div>
                        <div className="text-sm text-gray-500">{e.subject} • {e.exam_type} • {(e.teacher as any)?.name}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-blue-600 font-bold">{e.session_code}</span>
                        <span className={e.status === 'active' ? 'badge-green' : 'badge-gray'}>{e.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {tab === 'overview' && (
              <div className="grid grid-cols-2 gap-6">
                <div className="card-p">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h2>
                  <div className="space-y-3">
                    {users.slice(0,5).map(u => (
                      <div key={u.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{u.name}</div>
                          <div className="text-xs text-gray-500">{u.role} • {u.institution}</div>
                        </div>
                        <span className={`ml-auto flex-shrink-0 ${u.role === 'teacher' ? 'badge-blue' : 'badge-green'}`}>{u.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card-p">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Exams</h2>
                  <div className="space-y-3">
                    {exams.slice(0,5).map(e => (
                      <div key={e.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <FileText size={16} className="text-green-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">{e.title}</div>
                          <div className="text-xs text-gray-500">{e.subject} • {(e.teacher as any)?.name}</div>
                        </div>
                        <span className={`ml-auto flex-shrink-0 ${e.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{e.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}

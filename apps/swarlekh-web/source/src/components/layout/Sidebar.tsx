import { useAuth } from '../../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, PlusCircle, Eye, FileText, Users, LogOut, Mic, BookOpen, ClipboardList } from 'lucide-react'

export default function Sidebar() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const teacherNav = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/teacher' },
    { icon: PlusCircle, label: 'Create Exam', path: '/teacher/create-exam' },
    { icon: Eye, label: 'Monitor Exams', path: '/teacher/monitor' },
    { icon: FileText, label: 'Submissions', path: '/teacher/submissions' },
  ]
  const studentNav = [
    { icon: LayoutDashboard, label: 'Home', path: '/student' },
    { icon: BookOpen, label: 'Join Exam', path: '/student/join' },
    { icon: ClipboardList, label: 'My Results', path: '/student/results' },
  ]
  const adminNav = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'Users', path: '/admin/users' },
    { icon: FileText, label: 'All Exams', path: '/admin/exams' },
  ]

  const navItems = profile?.role === 'teacher' ? teacherNav : profile?.role === 'student' ? studentNav : adminNav
  const initials = profile?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0,2) || 'U'

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 flex flex-col z-50" style={{background:'#0A1628'}} role="navigation" aria-label="Main navigation">
      <div className="px-6 py-5" style={{borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <Mic size={18} color="white" />
          </div>
          <div>
            <div className="text-white font-semibold text-lg leading-tight">SwarLekh</div>
            <div className="text-xs" style={{color:'rgba(255,255,255,0.35)',fontFamily:'monospace'}}>Accessible Exams</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="text-xs font-semibold uppercase tracking-widest px-3 mb-3" style={{color:'rgba(255,255,255,0.3)'}}>
          {profile?.role === 'teacher' ? 'Teacher Panel' : profile?.role === 'student' ? 'Student Panel' : 'Admin Panel'}
        </div>
        {navItems.map(item => {
          const active = location.pathname === item.path
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              aria-current={active ? 'page' : undefined}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: active ? 'rgba(37,99,235,0.25)' : 'transparent',
                color: active ? 'white' : 'rgba(255,255,255,0.55)',
              }}>
              <item.icon size={18} color={active ? '#60A5FA' : 'rgba(255,255,255,0.45)'} />
              {item.label}
            </button>
          )
        })}
      </nav>
      <div className="px-4 py-4" style={{borderTop:'1px solid rgba(255,255,255,0.1)'}}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">{initials}</div>
          <div className="min-w-0">
            <div className="text-white text-sm font-medium truncate">{profile?.name}</div>
            <div className="text-xs truncate" style={{color:'rgba(255,255,255,0.4)'}}>{profile?.role}</div>
          </div>
        </div>
        <button onClick={signOut} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all" style={{color:'rgba(255,255,255,0.55)'}}>
          <LogOut size={16} />Sign Out
        </button>
      </div>
    </aside>
  )
}

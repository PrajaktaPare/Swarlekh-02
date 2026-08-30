import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Mic, GraduationCap, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Register() {
  const [form, setForm] = useState({ name:'', email:'', password:'', institution:'', role:'student' as 'teacher'|'student' })
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password || !form.institution) { toast.error('Please fill all fields'); return }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    const { data, error } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { data: { name: form.name, role: form.role, institution: form.institution } }
    })
    if (error) { toast.error(error.message); setLoading(false); return }
    if (data.user) {
      toast.success('Account created!')
      // Don't navigate here — same reasoning as Login.tsx: AuthContext picks
      // up the new session and loads the profile, and AppRoutes' /register
      // route redirects once that settles. A second, separately-timed
      // navigate() here caused a redirect race.
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{background:'linear-gradient(135deg,#0A1628,#1E3A5F,#0A1628)'}}>
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center"><Mic size={20} color="white" /></div>
            <span className="text-xl font-bold text-gray-900">SwarLekh</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Account</h2>
          <p className="text-gray-500 mb-6">Join the accessible exam platform</p>

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {(['student','teacher'] as const).map(role => (
              <button key={role} type="button" onClick={() => setForm(f => ({...f, role}))}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  form.role === role ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                {role === 'student' ? <BookOpen size={24} className={form.role === role ? 'text-blue-600' : 'text-gray-400'} />
                  : <GraduationCap size={24} className={form.role === role ? 'text-blue-600' : 'text-gray-400'} />}
                <span className={`font-medium capitalize ${form.role === role ? 'text-blue-600' : 'text-gray-600'}`}>{role}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {[
              {id:'name', label:'Full Name', type:'text', placeholder:'Enter your full name'},
              {id:'email', label:'Email Address', type:'email', placeholder:'you@example.com'},
              {id:'password', label:'Password', type:'password', placeholder:'Min 6 characters'},
              {id:'institution', label:'School / College / Institution', type:'text', placeholder:'e.g. Modern College Pune'},
            ].map(field => (
              <div key={field.id}>
                <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
                <input id={field.id} type={field.type} placeholder={field.placeholder}
                  value={(form as any)[field.id]} onChange={e => setForm(f => ({...f, [field.id]: e.target.value}))}
                  className="input-field" aria-required="true" />
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-gray-500 mt-4 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
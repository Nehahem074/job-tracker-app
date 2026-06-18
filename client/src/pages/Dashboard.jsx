import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { token } = useAuth();
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    axios.get('/api/jobs', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setJobs(r.data));
  }, []);

  const counts = ['Applied','OA','Interview','Rejected','Offer'].map(s => ({
    name: s, count: jobs.filter(j => j.status === s).length
  }));

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {counts.map(c => (
          <div key={c.name} className="bg-white rounded-xl p-4 shadow-sm border text-center">
            <p className="text-3xl font-bold">{c.count}</p>
            <p className="text-sm text-gray-500">{c.name}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h2 className="text-lg mb-4">Applications by status</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={counts}>
            <XAxis dataKey="name" /><YAxis /><Tooltip />
            <Bar dataKey="count" fill="#6366f1" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
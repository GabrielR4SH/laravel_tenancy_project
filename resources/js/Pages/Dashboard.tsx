import { useEffect, useState } from 'react';
import axios from 'axios';
import { Task } from '../types';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import { usePage } from '@inertiajs/react';

export default function Dashboard() {
  const { props } = usePage(); // Para acessar props do Inertia
  if (props.token && !localStorage.getItem('token')) {
    localStorage.setItem('token', props.token);
    console.log('Token recebido do login e salvo:', props.token); // Debug
  }

  const token = localStorage.getItem('token') || props.token; // Fallback com props.token
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('Token no Dashboard:', token); // Debug
    if (!token) {
      setError('Usuário não autenticado. Faça login primeiro.');
      setLoading(false);
      return;
    }
    setLoading(true);
    axios.get('http://localhost:8000/api/tasks', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    })
      .then((res) => {
        console.log('Tarefas recebidas:', res.data); // Debug
        setTasks(res.data);
      })
      .catch((err) => {
        console.error('Erro ao carregar tarefas:', err.response?.data || err.message); // Debug
        setError('Erro ao carregar tarefas');
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleCreate = (e: React.FormEvent) => {
  e.preventDefault();

  if (!token) {
    setError('Usuário não autenticado');
    return;
  }

  setLoading(true);
  axios.post('http://localhost:8000/api/tasks', newTask, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
  })
  .then((res) => {
    console.log('Tarefa criada:', res.data);
    setTasks([...tasks, res.data]);
    setNewTask({ title: '', description: '' }); // Remove user_id e organization_id
  })
  .catch((err) => {
    console.error('Erro ao criar tarefa:', err.response?.data || err.message);
    setError('Erro ao criar tarefa: ' + (err.response?.data?.message || err.message));
  })
  .finally(() => setLoading(false));
};

  return (
    <AuthenticatedLayout
      user={props.auth?.user || { name: 'User A' }} // Fallback com auth.user do Inertia
      header={<h2>Dashboard</h2>}
    >
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {error && <p className="text-red-500">{error}</p>}
          {loading && <p>Carregando...</p>}

          <form onSubmit={handleCreate} className="mb-4">
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Título"
              className="border p-2 mr-2"
              required
            />
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Descrição"
              className="border p-2 mr-2"
            />
            <button type="submit" disabled={loading} className="bg-blue-500 text-white p-2">
              Criar Tarefa
            </button>
          </form>

          <ul>
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <li key={task.id} className="mb-2 p-2 border">
                  {task.title} - {task.status}
                </li>
              ))
            ) : (
              <p>Nenhuma tarefa encontrada.</p>
            )}
          </ul>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

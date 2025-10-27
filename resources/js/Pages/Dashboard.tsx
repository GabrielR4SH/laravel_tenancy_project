// Dashboard.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Task } from '../types';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import { usePage } from '@inertiajs/react';

export default function Dashboard() {
  const { props } = usePage();
  if (props.token && !localStorage.getItem('token')) {
    localStorage.setItem('token', props.token);
  }

  const token = localStorage.getItem('token') || props.token;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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
        setTasks(res.data);
      })
      .catch((err) => {
        setError('Erro ao carregar tarefas');
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleCreateOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Usuário não autenticado');
      return;
    }
    setLoading(true);
    const payload = editingTask ? { ...editingTask, ...newTask } : newTask;
    const url = editingTask ? `http://localhost:8000/api/tasks/${editingTask.id}` : 'http://localhost:8000/api/tasks';
    const method = editingTask ? 'put' : 'post';

    axios[method](url, payload, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    })
      .then((res) => {
        if (editingTask) {
          setTasks(tasks.map(t => t.id === editingTask.id ? res.data : t));
          setEditingTask(null);
        } else {
          setTasks([...tasks, res.data]);
        }
        setNewTask({ title: '', description: '', priority: 'medium' });
      })
      .catch((err) => {
        setError('Erro ao criar/atualizar tarefa: ' + (err.response?.data?.message || ''));
      })
      .finally(() => setLoading(false));
  };

  const handleEdit = (task: Task) => {
    setNewTask({ title: task.title, description: task.description || '', priority: task.priority || 'medium' });
    setEditingTask(task);
  };

  const handleDelete = (id: number) => {
    if (!token) {
      setError('Usuário não autenticado');
      return;
    }
    setLoading(true);
    axios.delete(`http://localhost:8000/api/tasks/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        setTasks(tasks.filter(t => t.id !== id));
      })
      .catch((err) => {
        setError('Erro ao deletar tarefa: ' + (err.response?.data?.message || ''));
      })
      .finally(() => setLoading(false));
  };

  const handleStatusChange = (id: number, status: 'pending' | 'in_progress' | 'done') => {
    if (!token) {
      setError('Usuário não autenticado');
      return;
    }
    setLoading(true);
    axios.patch(`http://localhost:8000/api/tasks/${id}/status`, { status }, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    })
      .then((res) => {
        setTasks(tasks.map(t => t.id === id ? res.data : t));
      })
      .catch((err) => {
        setError('Erro ao atualizar status: ' + (err.response?.data?.message || ''));
      })
      .finally(() => setLoading(false));
  };

  return (
    <AuthenticatedLayout
      user={props.auth?.user || { name: 'User A' }}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
    >
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {loading && <p className="text-gray-600 mb-4">Carregando...</p>}

          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{editingTask ? 'Editar Tarefa' : 'Criar Nova Tarefa'}</h3>
            <form onSubmit={handleCreateOrUpdate} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título</label>
                <input
                  id="title"
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
                <textarea
                  id="description"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Prioridade</label>
                <select
                  id="priority"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
              <button type="submit" disabled={loading} className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-500 focus:bg-blue-500 active:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150">
                {editingTask ? 'Atualizar Tarefa' : 'Criar Tarefa'}
              </button>
            </form>
          </div>

          <div className="mt-8 bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 p-6">Minhas Tarefas</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <tr key={task.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        >
                          <option value="pending">Pendente</option>
                          <option value="in_progress">Em Progresso</option>
                          <option value="done">Concluída</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.priority}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => handleEdit(task)} className="text-indigo-600 hover:text-indigo-900 mr-4">Editar</button>
                        <button onClick={() => handleDelete(task.id)} className="text-red-600 hover:text-red-900">Apagar</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Nenhuma tarefa encontrada.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

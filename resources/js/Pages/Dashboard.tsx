// resources/js/Pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Task } from '../types';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Modal from '@/Components/Modal';

export default function Dashboard() {
  const token = localStorage.getItem('auth_token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', due_date: '' });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 10;
  const [theme, setTheme] = useState({ primary: '#0000FF', secondary: '#FFFFFF', style: 'light' });

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');

    if (!storedToken || !storedUser) {
        router.visit(route('login'));
        return;
    }

    // if (!token || !user) {
    //   router.visit(route('login'));
    //   return;
    // }

    // Fetch theme from organization
    axios.get('/api/organization/theme', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        const { primary_color, secondary_color, theme_style } = res.data;
        setTheme({ primary: primary_color, secondary: secondary_color, style: theme_style });
        document.documentElement.style.setProperty('--primary-color', primary_color);
        document.documentElement.style.setProperty('--secondary-color', secondary_color);
        document.body.classList.toggle('dark', theme_style === 'dark');
      })
      .catch(() => setError('Erro ao carregar tema da organização'));

    // Fetch tasks
    setLoading(true);
    axios.get(`/api/tasks?page=${currentPage}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    })
      .then((res) => {
        setTasks(res.data.data || res.data);
      })
      .catch((err) => {
        setError('Erro ao carregar tarefas: ' + (err.response?.data?.message || ''));
      })
      .finally(() => setLoading(false));
  }, [token, currentPage]);

  const handleOpenTaskModal = (task: Task | null = null) => {
    setShowTaskModal(true);
    setEditingTask(task);
    setNewTask(task ? { title: task.title, description: task.description || '', priority: task.priority || 'medium', due_date: task.due_date || '' } : { title: '', description: '', priority: 'medium', due_date: '' });
  };

  const handleCreateOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return setError('Usuário não autenticado');

    setLoading(true);
    const payload = { ...newTask, organization_id: user.organization_id };
    const url = editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks';
    const method = editingTask ? 'put' : 'post';

    axios[method](url, payload, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    })
      .then((res) => {
        setSuccess(editingTask ? 'Atualizado!' : 'Inserido!');
        setTasks(editingTask
          ? tasks.map(t => t.id === editingTask.id ? res.data : t)
          : [...tasks, res.data]);
        setShowTaskModal(false);
        setTimeout(() => setSuccess(''), 3000);
      })
      .catch((err) => setError('Erro: ' + (err.response?.data?.message || '')))
      .finally(() => setLoading(false));
  };

  const handleDeleteConfirm = () => {
    if (!deletingTaskId || !token) return;

    setLoading(true);
    axios.delete(`/api/tasks/${deletingTaskId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        setSuccess('Deletado!');
        setTasks(tasks.filter(t => t.id !== deletingTaskId));
        setDeletingTaskId(null);
        setTimeout(() => setSuccess(''), 3000);
      })
      .catch((err) => setError('Erro ao deletar: ' + (err.response?.data?.message || '')))
      .finally(() => setLoading(false));
  };

  const handleStatusChange = (id: number, status: 'pending' | 'in_progress' | 'done') => {
    if (!token) return setError('Usuário não autenticado');

    setLoading(true);
    axios.patch(`/api/tasks/${id}/status`, { status }, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    })
      .then((res) => {
        setSuccess('Status atualizado!');
        setTasks(tasks.map(t => t.id === id ? res.data : t));
        setTimeout(() => setSuccess(''), 3000);
      })
      .catch((err) => setError('Erro: ' + (err.response?.data?.message || '')))
      .finally(() => setLoading(false));
  };

  // Pagination
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = tasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(tasks.length / tasksPerPage);

  if (!user) return null; // Or loading spinner

  return (
    <AuthenticatedLayout user={user} header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}>
      <Head title="Dashboard" />
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {success && <p className="text-green-600 mb-4">{success}</p>}
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {loading && <p className="text-gray-600 mb-4">Carregando...</p>}

          <div className="mb-4">
            <button
              onClick={() => handleOpenTaskModal()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Criar Nova Tarefa
            </button>
          </div>

          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <h3 className="text-lg font-medium p-6">Minhas Tarefas</h3>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioridade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data de Entrega</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentTasks.length > 0 ? currentTasks.map((task) => (
                  <tr key={task.id}>
                    <td className="px-6 py-4 text-sm">{task.id}</td>
                    <td className="px-6 py-4 text-sm font-medium">{task.title}</td>
                    <td className="px-6 py-4 text-sm">{task.description}</td>
                    <td className="px-6 py-4 text-sm">
                      <select value={task.status} onChange={(e) => handleStatusChange(task.id, e.target.value as any)} className="rounded-md border-gray-300">
                        <option value="pending">Pendente</option>
                        <option value="in_progress">Em Progresso</option>
                        <option value="done">Concluída</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm">{task.priority}</td>
                    <td className="px-6 py-4 text-sm">{task.due_date}</td>
                    <td className="px-6 py-4 text-sm">
                      <button onClick={() => handleOpenTaskModal(task)} className="text-indigo-600 hover:text-indigo-900 mr-4">Editar</button>
                      <button onClick={() => setDeletingTaskId(task.id)} className="text-red-600 hover:text-red-900">Apagar</button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">Nenhuma tarefa encontrada.</td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="px-6 py-3 bg-gray-50 flex justify-between">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50">Anterior</button>
              <span>Página {currentPage} de {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50">Próximo</button>
            </div>
          </div>
        </div>
      </div>

      {/* Task Modal for Create/Edit */}
      <Modal show={showTaskModal} onClose={() => setShowTaskModal(false)}>
        <h2 className="text-lg font-medium mb-4">{editingTask ? 'Editar Tarefa' : 'Criar Nova Tarefa'}</h2>
        <form onSubmit={handleCreateOrUpdate} className="space-y-4">
          <div>
            <label htmlFor="title">Título</label>
            <input id="title" type="text" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <div>
            <label htmlFor="description">Descrição</label>
            <textarea id="description" value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <div>
            <label htmlFor="priority">Prioridade</label>
            <select id="priority" value={newTask.priority} onChange={(e) => setNewTask({...newTask, priority: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
          </div>
          <div>
            <label htmlFor="due_date">Data de Entrega</label>
            <input id="due_date" type="date" value={newTask.due_date} onChange={(e) => setNewTask({...newTask, due_date: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
          </div>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md">{editingTask ? 'Atualizar' : 'Criar'}</button>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal show={!!deletingTaskId} onClose={() => setDeletingTaskId(null)}>
        <h2 className="text-lg font-medium mb-4">Confirmar Deleção</h2>
        <p>Tem certeza que deseja deletar esta tarefa?</p>
        <div className="mt-4 flex justify-end">
          <button onClick={() => setDeletingTaskId(null)} className="px-4 py-2 bg-gray-300 rounded-md mr-2">Cancelar</button>
          <button onClick={handleDeleteConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md">Deletar</button>
        </div>
      </Modal>
    </AuthenticatedLayout>
  );
}

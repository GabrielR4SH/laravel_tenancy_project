import { useForm } from '@inertiajs/react';

export default function Login() {
  const { data, setData, post, processing, errors } = useForm({
    email: '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit chamado', { email: data.email, password: data.password }); // Debug
    post('/api/login', {
      onSuccess: (response) => {
        console.log('Resposta do Inertia:', response.props); // Debug
        const token = response.props.token;
        if (token) {
          localStorage.setItem('token', token);
          console.log('Token salvo:', token); // Debug
        } else {
          console.error('Token não encontrado na resposta Inertia'); // Debug
        }
      },
      onError: (err) => {
        console.error('Erro no login:', err); // Debug
      },
      onFinish: () => {
        console.log('Requisição concluída, redirecionando para /dashboard'); // Debug
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={data.email}
        onChange={(e) => setData('email', e.target.value)}
        placeholder="Email"
      />
      {errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}
      <input
        type="password"
        value={data.password}
        onChange={(e) => setData('password', e.target.value)}
        placeholder="Senha"
      />
      {errors.password && <p style={{ color: 'red' }}>{errors.password}</p>}
      <button type="submit" disabled={processing}>Login</button>
    </form>
  );
}

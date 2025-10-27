// resources/js/Pages/Auth/Register.tsx
import { useEffect, useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, router } from '@inertiajs/react'; // Keep router for redirect
import axios from 'axios';

export default function Register() {
    // Remove Inertia's useForm - we'll handle manually
    const [data, setData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        organization_name: '',
        organization_id: '',
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [processing, setProcessing] = useState(false);

    const [organizations, setOrganizations] = useState<{ id: number; name: string }[]>([]);
    const [isNewOrg, setIsNewOrg] = useState(true);

    useEffect(() => {
        axios.get('http://localhost:8000/api/organizations')
            .then((res) => setOrganizations(res.data))
            .catch(() => console.error('Erro ao carregar organizações'));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        // Prepare payload - exclude the unused org field based on isNewOrg
        const payload = {
            name: data.name,
            email: data.email,
            password: data.password,
            ...(isNewOrg ? { organization_name: data.organization_name } : { organization_id: data.organization_id }),
        };

        try {
            const response = await axios.post('/api/register', payload);
            // Store token (adjust based on your auth flow, e.g., localStorage or context)
            localStorage.setItem('auth_token', response.data.token);
            // Redirect to dashboard or tasks page
            router.visit('/dashboard'); // Or wherever your tasks list is
        } catch (error: any) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
            } else {
                console.error('Erro ao registrar:', error);
                setErrors({ general: 'Erro ao registrar usuário.' });
            }
        } finally {
            setProcessing(false);
        }
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="name" value="Name" />
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={handleChange}
                        required
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={handleChange}
                        required
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={handleChange}
                        required
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={handleChange}
                        required
                    />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div className="mt-4">
                    <label>
                        <input type="checkbox" checked={isNewOrg} onChange={(e) => {
                            setIsNewOrg(e.target.checked);
                            setData({ ...data, organization_id: '', organization_name: '' });
                        }} />
                        Criar nova organização
                    </label>
                </div>

                {isNewOrg ? (
                    <div className="mt-4">
                        <InputLabel htmlFor="organization_name" value="Nome da Organização" />
                        <TextInput
                            id="organization_name"
                            name="organization_name"
                            value={data.organization_name}
                            className="mt-1 block w-full"
                            onChange={handleChange}
                            required
                        />
                        <InputError message={errors.organization_name} className="mt-2" />
                    </div>
                ) : (
                    <div className="mt-4">
                        <InputLabel htmlFor="organization_id" value="Selecionar Organização Existente" />
                        <select
                            id="organization_id"
                            name="organization_id"
                            value={data.organization_id}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            onChange={handleChange}
                            required
                        >
                            <option value="">Selecione...</option>
                            {organizations.map(org => (
                                <option key={org.id} value={org.id}>{org.name}</option>
                            ))}
                        </select>
                        <InputError message={errors.organization_id} className="mt-2" />
                    </div>
                )}

                {errors.general && <InputError message={errors.general} className="mt-2" />}

                <div className="flex items-center justify-end mt-4">
                    <Link
                        href={route('login')}
                        className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Already registered?
                    </Link>

                    <PrimaryButton className="ms-4" disabled={processing}>
                        Register
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}

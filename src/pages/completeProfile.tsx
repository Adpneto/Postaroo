import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { auth, db } from '../firebaseConfig'
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

const ProfileCompletion = () => {

    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm({
        defaultValues: {
            username: '',
            name: '',
            surname: '',
            phone_number: '',
            gender: 'others'
        },
    })

    const isUsernameAvailable = async (username: string): Promise<boolean> => {
        try {
            const q = query(collection(db, 'users'), where('username', '==', username));
            const querySnapshot = await getDocs(q);
            return querySnapshot.empty
        } catch (error) {
            console.error("Erro ao verificar nome de usuário:", error);
            return false
        }
    }

    const handleUsernameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const username = e.target.value
        form.setValue('username', username);

        const usernameAvailable = await isUsernameAvailable(username);

        if (!usernameAvailable) {
            form.setError('username', {
                type: 'Error',
                message: 'Este nome de usuário já está em uso.',
            })

            await toast({
                title: "Erro",
                variant: "destructive",
                description: "Este nome de usuário já está em uso. Por favor, escolha outro.",
            })
        } else {
            form.clearErrors('username')
        }
    };

    const navigate = useNavigate()
    const user = auth.currentUser

    useEffect(() => {
        if (!user) {
            navigate('/sign');
            toast({
                title: "Aviso",
                description: "Você precisa estar autenticado para acessar esta página.",
                variant: "destructive",
            })
        }
    }, [user, navigate, toast])

    const handleCompleteProfile = async (data: { username: string; name: string; surname: string; gender: string; phone_number: string; }) => {
        setIsLoading(true)
        try {
            if (user) {
                const usernameAvailable = await isUsernameAvailable(data.username);

                if (!usernameAvailable) {
                    await toast({
                        title: "Erro",
                        description: "Este nome de usuário já está em uso. Escolha outro.",
                    })
                    return
                }

                const userDocRef = doc(db, 'users', user.uid);
                await updateDoc(userDocRef, {
                    username: data.username,
                    name: data.name,
                    surname: data.surname,
                    gender: data.gender,
                    phone_number: data.phone_number,
                    isProfileComplete: true
                })
                await toast({
                    title: "Parabens!!!",
                    description: "Seu perfil foi criado com sucesso, seja bem-vindo a nossa plataforma!",
                })
                navigate('/')
            }
        } catch (error) {
            console.error("Erro ao completar perfil:", error)
            await toast({
                title: "Erro",
                variant: "destructive",
                description: "Houve um erro ao salvar seu perfil. Tente novamente.",
            });
        } finally {
            setIsLoading(false)
        }
    };

    return (
        <div className='flex items-center justify-center h-screen'>
            <Card className='m-2 py-2 px-4 flex flex-col items-center justify-center space-y-2'>
                <img src="logo.png" className='w-14' alt="" />
                <form onSubmit={form.handleSubmit(handleCompleteProfile)} className='flex flex-col items-center gap-2'>
                    <h1 className='font-semibold text-2xl'>Complete seu cadastro</h1>
                    <Input
                        {...form.register('username')}
                        placeholder='Nome de Usuário'
                        required
                        onChange={handleUsernameChange}
                        className={form.formState.errors.username ? 'border-red-500' : ''}
                    />
                    {form.formState.errors.username && (
                        <span className="text-red-500 text-sm">{form.formState.errors.username.message}</span>
                    )}
                    <div className='flex gap-2'>
                        <Input {...form.register('name')} placeholder='Nome' required />
                        <Input {...form.register('surname')} placeholder='Sobrenome' required />
                    </div>
                    <Input {...form.register('phone_number')} placeholder='(DDD) Numero de telefone' required />
                    <Select
                        defaultValue="others"
                        onValueChange={(value) => form.setValue('gender', value)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Gênero" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="male">Masculino</SelectItem>
                            <SelectItem value="female">Feminino</SelectItem>
                            <SelectItem value="others">Outros</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant={'outline'} type='submit' disabled={isLoading}>
                        {isLoading ? 'Salvando...' : 'Salvar'}
                    </Button>
                </form>
            </Card>
        </div>
    )
}

export default ProfileCompletion

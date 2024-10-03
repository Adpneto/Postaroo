import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { auth, db } from '../firebaseConfig'
import { doc, updateDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'

const ProfileCompletion = () => {
    const form = useForm({
        defaultValues: {
            username: '',
            name: '',
            surname: '',
            phone_number: '',
            gender: 'others'
        },
    })

    const navigate = useNavigate()
    const user = auth.currentUser

    useEffect(() => {
        if (!user) {
            navigate('/sign')
        }
    }, [user, navigate])

    const handleCompleteProfile = async (data: { username: string; name: string; surname: string; gender: string; phone_number: string; }) => {
        if (user) {
            const userDocRef = doc(db, 'users', user.uid)
            await updateDoc(userDocRef, {
                username: data.username,
                name: data.name,
                surname: data.surname,
                gender: data.gender,
                phone_number: data.phone_number,
                isProfileComplete: true
            })
            navigate('/')
        }
    }

    return (
        <div className='flex items-center justify-center h-screen'>
            <Card className='m-2 py-2 px-4 flex flex-col items-center justify-center space-y-2'>
                <img src="logo.png" className='w-14' alt="" />
                <form onSubmit={form.handleSubmit(handleCompleteProfile)} className='flex flex-col items-center gap-2'>
                    <h1 className='font-semibold text-2xl'>Complete seu cadastro</h1>
                    <Input {...form.register('username')} placeholder='Nome de Usuario' required />
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
                    <Button variant={'outline'} type='submit'>Salvar</Button>
                </form>
            </Card>
        </div>
    )
}

export default ProfileCompletion
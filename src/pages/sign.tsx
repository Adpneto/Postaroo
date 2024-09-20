import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { auth, db } from '../firebaseConfig'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { useForm } from 'react-hook-form'
import { BsGoogle, BsFacebook } from "react-icons/bs"
import { FirebaseError } from 'firebase/app'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { UserData } from '@/interfaces/UserData'
import { doc, setDoc } from 'firebase/firestore'

export default function Sign() {
    const form = useForm<UserData>({
        defaultValues: {
            email: '',
            password: '',
            name: '',
            surname: '',
            cpf: ''
        },
    });

    const { reset } = form
    const navigate = useNavigate()
    const [isCompletingProfile, setIsCompletingProfile] = useState(false)

    const handleRegister = async (data: UserData) => {
        if (!isCompletingProfile) {
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
                const user = userCredential.user;

                await setDoc(doc(db, 'users', user.uid), {
                    email: data.email,
                    name: '',
                    surname: '',
                })

                reset()
                setIsCompletingProfile(true)
                return
            } catch (error) {
                console.error("Erro ao registrar:", error)
            }
        } else {
            const currentUser = auth.currentUser;
            if (currentUser) {
                try {
                    await setDoc(doc(db, 'users', currentUser.uid), {
                        email: data.email,
                        name: data.name,
                        surname: data.surname,
                        cpf: data.cpf,
                    });
                    reset()
                    navigate('/home')
                } catch (error) {
                    console.error("Erro ao salvar dados do usuário:", error)
                }
            } else {
                console.error("Usuário não autenticado.")
            }
        }
    }

    const handleLogin = async (data: UserData) => {
        try {
            await signInWithEmailAndPassword(auth, data.email, data.password)
            navigate('/home')
        } catch (error) {
            if (error instanceof FirebaseError) {
                console.error("Erro ao fazer login:", error.message)
                alert("Erro ao fazer login. Verifique seu e-mail e senha.")
            } else {
                console.error("Erro desconhecido:", error)
                alert("Erro desconhecido. Tente novamente.")
            }
        }
    };

    return (
        <Tabs defaultValue="login" className='space-y-2'>
            <TabsList className="w-full h-10">
                <TabsTrigger value="login" className="w-full h-full font-extrabold">Entrar</TabsTrigger>
                <TabsTrigger value="register" className="w-full h-full font-extrabold">Registrar-se</TabsTrigger>
            </TabsList>
            <Card className='w-96 h-[350px] px-6 py-3 flex flex-col items-center justify-center'>
                <TabsContent value="login" className='w-full space-y-2 mb-2'>
                    <div className='py-2 space-y-2'>
                        <div>
                            <h1 className='font-semibold text-2xl text-center mb-1'>Que bom que você voltou</h1>
                            <p className='font-light text-center text-sm'>Deseja se conectar com essas redes?</p>
                        </div>
                        <div className='flex gap-2'>
                            <Button variant={'outline'} className='flex gap-2 w-full '><BsGoogle /> Google</Button>
                            <Button variant={'outline'} className='flex gap-2 w-full '><BsFacebook /> Facebook</Button>
                        </div>
                    </div>
                    <div className='flex items-center justify-center gap-2'>
                        <div className='bg-[#1F2937] w-full h-[2px] rounded-lg'></div>
                        <h3 className='font-bold text-[#313c4b]'>OU</h3>
                        <div className='bg-[#1F2937] w-full h-[2px] rounded-lg'></div>
                    </div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleLogin)} className='py-2 flex flex-col items-center justify-center space-y-2'>
                            <FormField
                                control={form.control}
                                name='email'
                                render={({ field }) => (
                                    <FormItem className='w-full'>
                                        <FormControl>
                                            <Input type='text' placeholder='Email' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}>
                            </FormField>
                            <FormField
                                control={form.control}
                                name='password'
                                render={({ field }) => (
                                    <FormItem className='w-full'>
                                        <FormControl>
                                            <Input type='text' placeholder='Senha' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}>
                            </FormField>
                            <Button type='submit' variant='outline' className='w-full'>Entrar</Button>
                        </form>
                    </Form>
                </TabsContent>
                <TabsContent value="register" className='w-full space-y-2 mb-2'>
                    <div>
                        <h1 className='font-semibold text-4xl text-center mb-2'>Crie sua conta</h1>
                        <p className='font-light text-sm'>Para desfrutar dos serviços, crie de graça agora mesmo!</p>
                    </div>
                    <div className='flex gap-2'>
                        <Button variant={'outline'} className='flex gap-2 w-full '><BsGoogle /> Google</Button>
                        <Button variant={'outline'} className='flex gap-2 w-full '><BsFacebook /> Facebook</Button>
                    </div>
                    <div className='flex items-center justify-center gap-2'>
                        <div className='bg-[#1F2937] w-full h-[2px] rounded-lg'></div>
                        <h3 className='font-bold text-[#313c4b]'>OU</h3>
                        <div className='bg-[#1F2937] w-full h-[2px] rounded-lg'></div>
                    </div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleRegister)} className='flex flex-col items-center justify-center space-y-2'>
                            {!isCompletingProfile ? (
                                <>
                                    <FormField
                                        control={form.control}
                                        name='email'
                                        render={({ field }) => (
                                            <FormItem className='w-full'>
                                                <FormControl>
                                                    <Input type='text' placeholder='Email' {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}>
                                    </FormField>
                                    <FormField
                                        control={form.control}
                                        name='password'
                                        render={({ field }) => (
                                            <FormItem className='w-full'>
                                                <FormControl>
                                                    <Input type='text' placeholder='Senha' {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}>
                                    </FormField>
                                </>
                            ) : (
                                <>
                                    <div className='flex gap-2'>
                                        <FormField
                                            control={form.control}
                                            name='name'
                                            render={({ field }) => (
                                                <FormItem className='w-full'>
                                                    <FormControl>
                                                        <Input type='text' placeholder='Nome' {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}>
                                        </FormField>
                                        <FormField
                                            control={form.control}
                                            name='surname'
                                            render={({ field }) => (
                                                <FormItem className='w-full'>
                                                    <FormControl>
                                                        <Input type='text' placeholder='Sobrenome' {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}>
                                        </FormField>
                                    </div>
                                    <FormField
                                        control={form.control}
                                        name='cpf'
                                        render={({ field }) => (
                                            <FormItem className='w-full'>
                                                <FormControl>
                                                    <Input type='text' placeholder='CPF' {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}>
                                    </FormField>
                                    <div className='space-x-2 w-full flex items-center'>
                                        <Checkbox id='active' className='border-zinc-700' />
                                        <label htmlFor='active' className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            Aceitar termos de uso
                                        </label>
                                    </div>
                                </>
                            )}
                            <Button type='submit' variant='outline' className='w-full'>{isCompletingProfile ? 'Concluir Cadastro' : 'Registrar'}</Button>
                        </form>
                    </Form>
                </TabsContent>
            </Card>
        </Tabs>
    )
}
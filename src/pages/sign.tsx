import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { auth, db } from '../firebaseConfig'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { useForm } from 'react-hook-form'
import { BsGoogle, BsFacebook } from "react-icons/bs"
import { FirebaseError } from 'firebase/app'
import { useNavigate } from 'react-router-dom'
import { doc, setDoc } from 'firebase/firestore'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'

export default function Sign() {
    const { t } = useTranslation()

    const formSchema = z.object({
        email: z.string({
            required_error: t('formSchema.register.email.required_error'),
        })
            .email({ message: t('formSchema.register.email.email') }),
        password: z.string({
            required_error: t('formSchema.register.password.required_error'),
        })
            .min(8, { message: t('formSchema.register.password.min') })
            .max(36, { message: t('formSchema.register.password.max') })
            .regex(/[A-Z]/, { message: t('formSchema.register.password.regex_uppercase') })
            .regex(/[a-z]/, { message: t('formSchema.register.password.regex_lowercase') })
            .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: t('formSchema.register.password.regex_special') }),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        mode: 'onSubmit',
        defaultValues: {
            email: '',
            password: '',
        },
    })

    const { reset } = form
    const navigate = useNavigate()

    const handleRegister = async (data: { email: string; password: string }) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)
            const user = userCredential.user
            const userDocRef = doc(db, 'users', user.uid)

            await setDoc(userDocRef, {
                email: data.email,
                isProfileComplete: false
            }, { merge: true })

            reset({ email: data.email })
            navigate('/complete-profile')
        } catch (error) {
            console.error("Erro ao registrar:", error)
        }
    }

    const handleLogin = async (data: { email: string; password: string }) => {
        try {
            await signInWithEmailAndPassword(auth, data.email, data.password)
            navigate('/')
        } catch (error) {
            if (error instanceof FirebaseError) {
                console.error("Erro ao fazer login:", error.message)
                alert("Erro ao fazer login. Verifique seu e-mail e senha.")
            } else {
                console.error("Erro desconhecido:", error)
                alert("Erro desconhecido. Tente novamente.")
            }
        }
    }

    return (
        <div className='h-screen flex items-center justify-center'>
            <Tabs defaultValue="login" className='space-y-2'>
                <TabsList className="w-full h-10">
                    <TabsTrigger value="login" className="w-full h-full font-extrabold">Entrar</TabsTrigger>
                    <TabsTrigger value="register" className="w-full h-full font-extrabold">Registrar-se</TabsTrigger>
                </TabsList>
                <Card className='w-96 mim-h-[350px] px-6 py-3 flex flex-col items-center justify-center'>
                    <img src="logo.png" className='w-16' alt="" />
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
                                                <Input type='password' placeholder='Senha' {...field} />
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
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleRegister)} className='flex flex-col items-center justify-center space-y-2'>
                                <div className='py-2 space-y-2'>
                                    <div>
                                        <h1 className='font-semibold text-4xl text-center mb-2'>Crie sua conta</h1>
                                        <p className='font-light text-sm'>Para desfrutar dos serviços, crie de graça agora mesmo!</p>
                                    </div>
                                    <div className='flex gap-2'>
                                        <Button variant={'outline'} className='flex gap-2 w-full '><BsGoogle /> Google</Button>
                                        <Button variant={'outline'} className='flex gap-2 w-full '><BsFacebook /> Facebook</Button>
                                    </div>
                                </div>
                                <div className='flex items-center justify-center gap-2'>
                                    <div className='bg-[#d7dee9] w-full h-[2px] rounded-lg'></div>
                                    <h3 className='font-bold text-[#313c4b]'>OU</h3>
                                    <div className='bg-[#1F2937] w-full h-[2px] rounded-lg'></div>
                                </div>
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
                                                <Input type='password' placeholder='Senha' {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}>
                                </FormField>
                                <Button type='submit' variant='outline' className='w-full'>Registrar</Button>
                            </form>
                        </Form>
                    </TabsContent>
                </Card>
            </Tabs>
        </div>
    )
}
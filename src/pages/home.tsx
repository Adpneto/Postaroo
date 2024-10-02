import { Button } from "@/components/ui/button"
import { Card } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Post } from '@/interfaces/IPost'
import { UserData } from '@/interfaces/UserData'
import { zodResolver } from "@hookform/resolvers/zod"
import { onAuthStateChanged } from 'firebase/auth'
import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query } from 'firebase/firestore'
import { User, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from "react-hook-form"
import { useNavigate } from 'react-router-dom'
import { z } from "zod"
import { auth, db } from '../firebaseConfig'
import Sekeleton from "../components/skeleton"

const FormSchema = z.object({
  bio: z
    .string()
    .min(10, {
      message: "Seu post não pode conter menos de 10 caracteres.",
    })
    .max(400, {
      message: "Seu post não pode conter mais de 400 caracteres.",
    }),
})

export default function Home() {
  const [userData, setUserData] = useState<UserData | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<Post[]>([])
  const [bioError, setBioError] = useState(false) // Estado para controlar o erro de bio
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true)
      if (user) {
        try {
          const userDoc = doc(db, 'users', user.uid)
          const userSnapshot = await getDoc(userDoc)

          if (userSnapshot.exists()) {
            const data = userSnapshot.data() as UserData
            setUserData(data)

            if (!data.isProfileComplete) {
              navigate('/complete-profile')
            }
          } else {
            console.log('Nenhum dado do usuário encontrado.')
            navigate('/complete-profile')
          }
        } catch (error) {
          console.error('Erro ao buscar os dados do usuário:', error)
        }
      } else {
        console.log('Usuário não autenticado')
        navigate('/sign')
      }
      setLoading(false)
    })

    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    const unsubscribePosts = onSnapshot(q, (querySnapshot) => {
      const postsArray: Post[] = [];
      querySnapshot.forEach((doc) => {
        postsArray.push({ id: doc.id, ...doc.data() } as Post)
      })
      setPosts(postsArray)
    })
    return () => {
      unsubscribe()
      unsubscribePosts()
    }
  }, [])

  const handleDeletePost = async (postId: string) => {
    try {
      await deleteDoc(doc(db, 'posts', postId))
    } catch (error) {
      console.error('Erro ao deletar post:', error)
    }
  }

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  const getRandomColorById = (id: string): string => {
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#57FFA3', '#FFA333']
    const defaultId = 'default'
    const validId = id || defaultId
    const index = parseInt(validId, 36) % colors.length
    return colors[index]
  }

  const onSubmit = async (data: { bio: string }) => {
    if (data.bio.length < 10) {
      setBioError(true); // Define o erro se o comprimento for menor que 10
      return;
    } else {
      setBioError(false); // Limpa o erro se o comprimento for válido
    }

    if (auth.currentUser && userData) {
      try {
        await addDoc(collection(db, 'posts'), {
          name: userData.name,
          surname: userData.surname,
          content: data.bio, 
          userId: auth.currentUser.uid,
          profilePicture: userData.profilePicture || null,
          timestamp: new Date(),
        })
        form.setValue('bio', ''); // Limpa o campo de texto
      } catch (error) {
        console.error('Erro ao adicionar post:', error);
      }
    }
  }

  return (
    <div className='w-full flex flex-col items-center m-5'>
      {loading ? (
        <Sekeleton />
      ) : userData ? (
        <div className='lg:w-[900px] space-y-10'>
          <h1 className='text-3xl font-semibold'>Bem-vindo, {userData.name} {userData.surname}!</h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-lg'>Compartilhe seu pensamento</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Conte-nos um pouco sobre você"
                        className="resize-none h-32"
                      />
                    </FormControl>
                    <FormDescription className='flex justify-between'>
                      <span className="font-bold">Você pode @mencionar outros usuários e organizações.</span>
                      <Button 
                        type="submit" 
                        variant={'outline'} 
                        className='w-40'
                      >
                        Compartilhar
                      </Button>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {bioError && (
                <p className="text-red-500">O texto deve conter pelo menos 10 caracteres.</p>
              )}
            </form>
          </Form>

          <div>
            {posts.map((post) => (
              <Card key={post.id} className='relative flex flex-col px-8 py-6 mb-4 gap-2'>
                <div className='w-fit flex items-center justify-center gap-4'>
                  {post.profilePicture ? (
                    <img
                      src={post.profilePicture}
                      alt="Foto de perfil"
                      className="rounded-full w-16 h-16 lg:w-20 lg:h-20 object-cover"
                    />
                  ) : (
                    <div className={`rounded-full w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center`} style={{ backgroundColor: getRandomColorById(post.userId) }}>
                      <User className="text-white w-8 h-8" />
                    </div>
                  )}
                  <div>
                    <p className='font-extrabold'>{post.name} {post.surname}</p>
                    <p className='text-xs opacity-80 font-extralight'>{new Date(post.timestamp.seconds * 1000).toLocaleString()}</p>
                  </div>
                </div>
                <p className='text-lg' style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word', wordBreak: 'break-word' }}>{post.content}</p>
                {auth.currentUser?.uid === post.userId && (
                  <Button className='absolute top-2 right-2 bg-transparent hover:text-gray-800 rounded-full p-1'
                    onClick={() => handleDeletePost(post.id)}><X /></Button>
                )}
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <h1>Nenhum dado do usuário encontrado.</h1>
      )}
    </div>
  )
}

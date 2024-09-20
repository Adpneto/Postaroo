import { useEffect, useState } from 'react'
import { doc, getDoc, collection, addDoc, query, onSnapshot, deleteDoc, orderBy } from 'firebase/firestore'
import { auth, db } from '../firebaseConfig'
import { onAuthStateChanged } from 'firebase/auth'
import { UserData } from '@/interfaces/UserData'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { signOut } from 'firebase/auth'
import { Button } from "@/components/ui/button"
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
import { Card } from '@/components/ui/card'
import { User, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Post } from '@/interfaces/IPost'

const FormSchema = z.object({
  bio: z
    .string()
    .min(10, {
      message: "Seu post não pode conter menos de 10 characteres.",
    })
    .max(400, {
      message: "Seu post não pode conter mais de 400 characteres.",
    }),
})

export default function Home() {
  const [userData, setUserData] = useState<UserData | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [newPost, setNewPost] = useState<string>('')
  const [posts, setPosts] = useState<Post[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = doc(db, 'users', user.uid)
          const userSnapshot = await getDoc(userDoc)

          if (userSnapshot.exists()) {
            const data = userSnapshot.data() as UserData
            setUserData(data)
          } else {
            console.log('Nenhum dado do usuário encontrado.')
          }
        } catch (error) {
          console.error('Erro ao buscar os dados do usuário:', error)
        }
      } else {
        console.log('Usuário não autenticado')
        return navigate('/sign')
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const postsArray: Post[] = []
      querySnapshot.forEach((doc) => {
        postsArray.push({ id: doc.id, ...doc.data() } as Post)
      })
      setPosts(postsArray);
    })
    return () => unsubscribe()
  }, []);

  const handleAddPost = async () => {
    if (auth.currentUser && newPost.trim() !== '' && userData) {
      try {
        await addDoc(collection(db, 'posts'), {
          name: userData.name,
          surname: userData.surname,
          content: newPost,
          userId: auth.currentUser.uid,
          timestamp: new Date(),
        });
        setNewPost('')
      } catch (error) {
        console.error('Erro ao adicionar post:', error)
      }
    }
  }

  const handleDeletePost = async (postId: string) => {
    try {
      await deleteDoc(doc(db, 'posts', postId))
    } catch (error) {
      console.error('Erro ao deletar post:', error);
    }
  }

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate('/sign')
    } catch (error) {
      console.error('Erro ao sair da conta:', error)
    }
  }

  function onSubmit() {

  }

  return (
    <div className='w-full flex flex-col items-center m-5'>
      {loading ? (
        <h1>Carregando...</h1>
      ) : userData ? (
        <div className='lg:w-[900px] space-y-10'>
          <div className='flex justify-between'>
            <h1 className='text-3xl font-semibold'>Bem-vindo, {userData.name} {userData.surname}!</h1>
            <Button onClick={handleLogout} variant={'outline'} className='text-zinc-500'>Sair</Button>
          </div>
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
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                      />
                    </FormControl>
                    <FormDescription className='flex justify-between'>
                      <h1>Você pode <span>@mencionar</span> outros usuários e organizações.</h1>
                      <Button type="submit" variant={'outline'} className='w-40' onClick={handleAddPost}>Compartilhar</Button>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <div>
            {posts.map((post) => (
              <Card key={post.id} className='relative flex flex-col px-8 py-6 mb-4 gap-2'>
                <div className='w-fit flex items-center justify-center gap-4'>
                  <User className="bg-indigo-900 rounded-full w-16 h-16 lg:w-16 lg:h-16 " />
                  <div>
                    <p className='font-extrabold'>{post.name} {post.surname}</p>
                    <p className='text-xs opacity-80 font-extralight'>{new Date(post.timestamp.seconds * 1000).toLocaleString()}</p>
                  </div>
                </div>
                <p className='text-lg'>{post.content}</p>
                {auth.currentUser?.uid === post.userId && (
                  <button className='absolute top-2 right-2 bg-transparent hover:text-gray-800 rounded-full p-1' onClick={() => handleDeletePost(post.id)}><X /></button>
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
import { Button } from "@/components/ui/button"
import { Card } from '@/components/ui/card'
import { Post } from '@/interfaces/IPost'
import { UserData } from '@/interfaces/UserData'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query } from 'firebase/firestore'
import { User, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sekeleton from "../components/skeleton"
import { auth, db } from '../firebaseConfig'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'

export default function Home() {
  const [posts, setPosts] = useState<{ post: Post; user: UserData | null }[]>([])
  const [postsLoading, setPostsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<{ post: Post; user: UserData | null } | null>(null);
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
        } catch (error) {
          console.error('Erro ao buscar os dados do usuário:', error)
        }
      } else {
        console.log('Usuário não autenticado')
        navigate('/sign')
      }
    })

    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    const unsubscribePosts = onSnapshot(q, async (querySnapshot) => {
      const postsArray: { post: Post; user: UserData | null }[] = [];

      setPostsLoading(true)
      for (const docSnapshot of querySnapshot.docs) {
        const postData = { id: docSnapshot.id, ...docSnapshot.data() } as Post
        const userDoc = await getDoc(doc(db, 'users', postData.userId))
        const userData = userDoc.exists() ? (userDoc.data() as UserData) : null
        postsArray.push({ post: postData, user: userData })
      }
      setPosts(postsArray);
      setPostsLoading(false);
    })

    return () => {
      unsubscribe();
      unsubscribePosts();
    };
  }, []);

  const handleDeletePost = async (postId: string) => {
    try {
      await deleteDoc(doc(db, 'posts', postId))
    } catch (error) {
      console.error('Erro ao deletar post:', error)
    }
  }

  const getRandomColorById = (id: string): string => {
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#57FFA3', '#FFA333']
    const defaultId = 'default'
    const validId = id || defaultId
    const index = parseInt(validId, 36) % colors.length
    return colors[index]
  }

  const handleViewMore = (post: Post, user: UserData | null) => {
    setSelectedPost({ post, user });
    setDialogOpen(true);
  }

  return (
    <div className='w-full lg:w-[600px] flex flex-col items-center justify-center m-5'>
      <div className='lg:w-[600px] flex flex-col items-center justify-center space-y-5'>
        {postsLoading ? (
          <>
            {Array.from({ length: 3 }).map((_, index) => (
              <Sekeleton key={index} />
            ))}
          </>
        ) : (
          posts.map(({ post, user }) => (
            <Card key={post.id} className='relative flex flex-col pb-5 gap-2 w-full overflow-hidden'>
              <div className='w-fit flex items-center justify-center gap-4 p-4 pb-0'>
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Foto de perfil"
                    className="rounded-full w-16 h-16 lg:w-20 lg:h-20 object-cover"
                  />
                ) : (
                  <div className={`rounded-full w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center`} style={{ backgroundColor: getRandomColorById(post.userId) }}>
                    <User className="text-white w-8 h-8" />
                  </div>
                )}
                <div>
                  <p className='font-extrabold text-left'>@{user?.username}</p>
                  <p className='opacity-70 text-sm text-left'>{user?.name} {user?.surname}</p>
                </div>
              </div>
              <p className='text-lg px-4' style={{ whiteSpace: 'pre-wrap', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                {post.content.length > 200 ? `${post.content.slice(0, 200)}... ` : post.content}
                {post.content.length > 200 && (
                  <Button
                    variant='link'
                    className='text-zinc-600 font-bold underline'
                    onClick={() => handleViewMore(post, user)}
                  >
                    Ver mais
                  </Button>
                )}
              </p>
              {post.imageUrl && (
                <img
                  src={post.imageUrl}
                  alt="Imagem do post"
                  className="w-[400px] lg:w-[600px] h-[400px] object-cover"
                />
              )}
              {auth.currentUser?.uid === post.userId && (
                <Button className='absolute top-2 right-2 bg-transparent hover:text-gray-800 rounded-full p-1' onClick={() => handleDeletePost(post.id)}>
                  <X />
                </Button>
              )}
              <p className='text-[0.7rem] opacity-20 text-right pr-4'>{new Date(post.timestamp.seconds * 1000).toLocaleString()}</p>
            </Card>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <div className='flex items-center gap-4'>
              {selectedPost?.user?.profilePicture ? (
                <img
                  src={selectedPost.user.profilePicture}
                  alt="Foto de perfil"
                  className="rounded-full w-16 h-16 object-cover"
                />
              ) : (
                <div className={`rounded-full w-12 h-12 flex items-center justify-center`} style={{ backgroundColor: getRandomColorById(selectedPost?.user?.id || '') }}>
                  <User className="text-white w-6 h-6" />
                </div>
              )}
              <div>
                <p className='font-bold text-lg text-left'>@{selectedPost?.user?.username}</p>
                <p className='opacity-70 text-sm text-left'>{selectedPost?.user?.name} {selectedPost?.user?.surname}</p>
              </div>
            </div>
            <DialogTitle className="hidden">Post completo</DialogTitle>
            <DialogDescription className="hidden">Post completo</DialogDescription>
          </DialogHeader>

          <p className='text-lg'>{selectedPost?.post.content}</p>
          {selectedPost?.post.imageUrl && (
            <img
              src={selectedPost.post.imageUrl}
              alt="Imagem do post"
              className="w-full rounded-md object-cover"
            />
          )}

          <DialogFooter>
            <p className='text-[0.7rem] opacity-20 text-right'>{new Date(selectedPost?.post.timestamp.seconds * 1000).toLocaleString()}</p>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
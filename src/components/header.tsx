import { useEffect, useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Button } from './ui/button'
import { Edit, LogOut, Settings, User } from 'lucide-react'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { auth, storage, db } from '@/firebaseConfig'
import { UserData } from '@/interfaces/UserData'
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import imageCompression from 'browser-image-compression'
import { useNavigate } from 'react-router-dom'
import NewPost from './newPost'

export default function Header() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [tempUserData, setTempUserData] = useState<UserData | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isUpdating, setIsUpdating] = useState<boolean>(false)
  const navigate = useNavigate()

  const loadUserData = async (userId: string) => {
    const userDocRef = doc(db, 'users', userId)
    const userDocSnap = await getDoc(userDocRef)
    if (userDocSnap.exists()) {
      setUserData(userDocSnap.data() as UserData)
    } else {
      console.error('Usuário não encontrado no Firestore.')
    }
    setIsLoading(false)
  }

  const updateUserData = async (updatedData: Partial<UserData>) => {
    if (auth.currentUser) {
      const userDocRef = doc(db, 'users', auth.currentUser.uid)
      await updateDoc(userDocRef, updatedData)
    }
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await loadUserData(user.uid)
      } else {
        setUserData(null)
        setIsLoading(false)
        console.log('Nenhum usuário autenticado.')
      }
    })

    return () => unsubscribe()
  }, [])

  const handleDialogOpen = () => {
    setTempUserData(userData)
    setIsDialogOpen(true)
  }

  const handleChange = (field: keyof UserData, value: string) => {
    setTempUserData((prev) => {
      if (prev) {
        return {
          ...prev,
          [field]: value,
        }
      }
      return prev
    })
  }

  const handleProfileUpdate = async () => {
    if (!auth.currentUser) {
      console.error('Usuário não está autenticado.')
      return
    }
    setIsUpdating(true)
    try {
      let profilePictureUrl = tempUserData?.profilePicture || undefined

      if (selectedFile) {
        const storageRef = ref(storage, `profilePictures/${auth.currentUser.uid}`)
        await uploadBytes(storageRef, selectedFile)
        profilePictureUrl = `${await getDownloadURL(storageRef)}?timestamp=${Date.now()}`
      }

      if (tempUserData) {
        const updatedUserData = {
          ...tempUserData,
          profilePicture: profilePictureUrl,
        }

        await updateUserData(updatedUserData)
        setTempUserData(updatedUserData)
        setUserData(updatedUserData)
        setIsDialogOpen(false)
        navigate(0)
      }
    } catch (error) {
      console.error('Erro ao atualizar o perfil:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        const compressedFile = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 800 })
        setSelectedFile(compressedFile)

        const imageUrl = URL.createObjectURL(compressedFile)
        setTempUserData((prev) => {
          if (prev) {
            return {
              ...prev,
              profilePicture: imageUrl,
            }
          }
          return prev
        })
      } catch (error) {
        console.error('Erro ao comprimir a imagem:', error)
      }
    }
  }

  return (
    <div className='w-full lg:w-[900px] m-5 flex justify-between'>
      <img src="logo.png" className='w-10' alt="Logo" />
      {isLoading ? (
        <div className='flex gap-2'>
          <Button disabled size='icon' variant={'ghost'} className='text-zinc-500'>
            <Settings />
          </Button>
          <Button disabled size='icon' variant={'ghost'} className='text-zinc-500'>
            <LogOut />
          </Button>
        </div>
      ) : (
        userData && (
          <div className='flex gap-2'>
            <NewPost />
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size='icon' variant={'ghost'} className='text-zinc-500' onClick={handleDialogOpen}>
                  <Settings />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className='hidden'>Edição de Perfil</DialogTitle>
                  <DialogDescription className='hidden'>Faça alterações em seu perfil aqui. Clique em salvar quando terminar.</DialogDescription>
                </DialogHeader>
                <div className="gap-4 py-4 flex flex-col justify-center items-center">
                  <div className="relative group">
                    {tempUserData?.profilePicture ? (
                      <img src={tempUserData.profilePicture} alt="Foto de Perfil" className="rounded-full w-40 cursor-pointer object-cover" onClick={() => fileInputRef.current?.click()} />
                    ) : (
                      <User className="bg-purple-900 p-2 rounded-full w-40 h-40 text-white" onClick={() => fileInputRef.current?.click()} />
                    )}
                    <Edit className="absolute inset-0 m-auto w-6 h-6 text-white opacity-0 group-hover:opacity-100 cursor-pointer" onClick={() => fileInputRef.current?.click()} />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <div className='flex gap-2'>
                      <Input
                        id="name"
                        value={tempUserData?.name || ''}
                        className="w-full"
                        onChange={(e) => handleChange('name', e.target.value)}
                      />
                      <Input
                        id="surname"
                        value={tempUserData?.surname || ''}
                        className="w-full"
                        onChange={(e) => handleChange('surname', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <Label htmlFor="username">Nome de Usuario</Label>
                    <Input
                      id="username"
                      value={tempUserData?.username || ''}
                      onChange={(e) => handleChange('username', e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2 w-full">
                    <Label htmlFor="gender">Gênero</Label>
                    <Select
                      value={tempUserData?.gender || ''}
                      onValueChange={(value) => handleChange('gender', value)}
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
                  </div>
                </div>
                <DialogFooter className='flex justify-between gap-2'>
                  <p className='text-xs text-zinc-500'>Faça alterações em seu perfil aqui. Clique em salvar quando terminar.</p>
                  <Button onClick={handleProfileUpdate} disabled={isUpdating}>
                    {isUpdating ? "Salvando..." : "Salvar alterações"}
                  </Button>
                </DialogFooter>

              </DialogContent>
            </Dialog>
            <Button onClick={() => auth.signOut()} size='icon' variant={'ghost'} className='text-zinc-500'><LogOut /></Button>
          </div>
        )
      )}
    </div>
  )
}

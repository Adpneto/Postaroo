import { useEffect, useState, useRef } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Edit, Loader, LogOut, Settings, User } from 'lucide-react'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { auth, storage } from '@/firebaseConfig' 
import { useUser } from '@/lib/useUser'
import { UserData } from '@/interfaces/UserData'
import { ref, uploadBytes, getDownloadURL } from "firebase/storage" 

export default function Header() {
  const { userData, loadUserData, updateProfile, logout } = useUser()
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [tempUserData, setTempUserData] = useState<UserData | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadUserData(user.uid)
      } else {
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
    try {
      let profilePictureUrl = tempUserData?.profilePicture || undefined

      if (selectedFile) {
        const storageRef = ref(storage, `profilePictures/${auth.currentUser?.uid}`)
        await uploadBytes(storageRef, selectedFile)
        profilePictureUrl = await getDownloadURL(storageRef) 
      }

      if (tempUserData) {
        await updateProfile({
          ...tempUserData,
          profilePicture: profilePictureUrl,
        })
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error('Erro ao atualizar o perfil:', error)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      console.log('Arquivo de imagem selecionado:', file)
      setSelectedFile(file)
    }
  }

  return (
    <div className='w-full lg:w-[900px] m-5 flex justify-between'>
      <img src="logo.png" className='w-10' alt="Logo" />
      {userData ? (
        <div className='flex gap-2'>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size='icon' variant={'ghost'} className='text-zinc-500' onClick={handleDialogOpen}>
                <Settings />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edição de Perfil</DialogTitle>
                <DialogDescription>Faça alterações em seu perfil aqui. Clique em salvar quando terminar.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex gap-2">
                  <div className="relative group">
                    {tempUserData?.profilePicture ? (
                      <img src={tempUserData.profilePicture} alt="Foto de Perfil" className="rounded-full w-20 cursor-pointer object-cover" />
                    ) : (
                      <User className="w-20 h-20 text-white" />
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
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="username">Nome de Usuario</Label>
                  <Input
                    id="username"
                    value={tempUserData?.username || ''}
                    className="col-span-3"
                    onChange={(e) => handleChange('username', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
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
              <DialogFooter>
                <Button onClick={handleProfileUpdate}>Salvar alterações</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={logout} size='icon' variant={'ghost'} className='text-zinc-500'><LogOut /></Button>
        </div>
      ) : (
        <Loader/>
      )}
    </div>
  )
}  
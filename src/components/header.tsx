import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Edit, LogOut, Settings, User } from 'lucide-react'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { auth } from '@/firebaseConfig'
import { useUser } from '@/lib/useUser'
import { UserData } from '@/interfaces/UserData'

export default function Header() {
  const { userData, loadUserData, updateProfile, logout } = useUser()
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [tempUserData, setTempUserData] = useState<UserData | null>(null)

  useEffect(() => {
    if (auth.currentUser) {
      loadUserData(auth.currentUser.uid)
    }
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
    if (tempUserData) {
      await updateProfile({
        name: tempUserData.name,
        surname: tempUserData.surname,
        username: tempUserData.username,
        gender: tempUserData.gender,
      })
      setIsDialogOpen(false)
    }
  }

  return (
    <div className='w-full lg:w-[900px] m-5 flex justify-between'>
      <img src="logo.png" className='w-10' alt="Logo" />
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
              {/* Formulário de Edição de Perfil */}
              <div className="flex gap-2">
                <div>
                  <div className="relative group">
                    {tempUserData?.profilePicture ? (
                      <img src={tempUserData.profilePicture} alt="Foto de Perfil" className="rounded-full w-20 cursor-pointer object-cover" />
                    ) : (
                      <User className="w-20 h-20 text-white" />
                    )}
                    <Edit className="absolute inset-0 m-auto w-6 h-6 text-white opacity-0 group-hover:opacity-100 cursor-pointer" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <div className='flex gap-2'>
                    <Input
                      id="name"
                      value={tempUserData?.name || ''}
                      className="w-full"
                      onChange={(e) => handleChange('name', e.target.value)} // Atualiza tempUserData
                    />
                    <Input
                      id="surname"
                      value={tempUserData?.surname || ''}
                      className="w-full"
                      onChange={(e) => handleChange('surname', e.target.value)} // Atualiza tempUserData
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
                  onChange={(e) => handleChange('username', e.target.value)} // Atualiza tempUserData
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="gender">Gênero</Label>
                <Select
                  value={tempUserData?.gender || ''}
                  onValueChange={(value) => handleChange('gender', value)} // Atualiza tempUserData
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
    </div>
  )
}
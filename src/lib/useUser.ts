import { useRecoilState } from 'recoil'
import { userState } from './atom'
import { auth, db } from '@/firebaseConfig'
import { doc, getDoc, updateDoc, query, collection, getDocs, where } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { UserData } from '@/interfaces/UserData'

export const useUser = () => {
  const [userData, setUserData] = useRecoilState<UserData | null>(userState)
  const navigate = useNavigate()

  const loadUserData = async (userId: string): Promise<void> => {
    const userDocRef = doc(db, 'users', userId)
    const userDocSnap = await getDoc(userDocRef)

    if (userDocSnap.exists()) {
      setUserData(userDocSnap.data() as UserData)
    } else {
      console.error('Usuário não encontrado no Firestore.')
    }
  }

  const updateProfile = async (updatedData: Partial<UserData>): Promise<void> => {
    if (auth.currentUser) {
      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid)
        await updateDoc(userDocRef, updatedData)
        
        // Atualiza o estado local
        setUserData((prevData) => (prevData ? { ...prevData, ...updatedData } : null))

        const postsQuery = query(collection(db, 'posts'), where('userId', '==', auth.currentUser.uid))
        const querySnapshot = await getDocs(postsQuery)
        
        await Promise.all(querySnapshot.docs.map(postDoc => {
          return updateDoc(postDoc.ref, {
            name: updatedData.name,
            surname: updatedData.surname,
            profilePicture: updatedData.profilePicture,
          })
        }))
      } catch (error) {
        console.error('Erro ao atualizar o perfil:', error)
      }
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth)
      setUserData(null)
      navigate('/sign')
    } catch (error) {
      console.error('Erro ao sair da conta:', error)
    }
  }

  return {
    userData,
    loadUserData,
    updateProfile,
    logout,
  }
}
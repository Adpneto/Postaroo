import { initializeApp } from "firebase/app"
import { getAuth, User } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { setPersistence, browserLocalPersistence } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyA-ZzwRXDU8xbaTlMNST0s0BCkaBKqHt78",
  authDomain: "postaroo-c83e4.firebaseapp.com",
  projectId: "postaroo-c83e4",
  storageBucket: "postaroo-c83e4.appspot.com",
  messagingSenderId: "411469451082",
  appId: "1:411469451082:web:ebe915153a2d7f10f2bbb3",
  measurementId: "G-5NJJV5Z9VT"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

export interface AuthContextType {
  currentUser: User | null
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          setCurrentUser(user)
        });
        return () => unsubscribe()
      })
      .catch((error) => {
        console.error("Erro ao configurar a persistência:", error)
      });
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
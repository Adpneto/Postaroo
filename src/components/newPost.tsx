import { Button } from "@/components/ui/button"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { UserData } from '@/interfaces/UserData'
import { zodResolver } from "@hookform/resolvers/zod"
import { addDoc, collection, doc, getDoc } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { useEffect, useRef, useState } from 'react'
import { useForm } from "react-hook-form"
import { useNavigate } from 'react-router-dom'
import { z } from "zod"
import { auth, db, storage } from '../firebaseConfig'
import { onAuthStateChanged } from "firebase/auth"
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from './ui/dialog'
import { CopyPlus, ImagePlus, X } from "lucide-react"

const FormSchema = z.object({
	bio: z
		.string()
		.min(10, {
			message: "Seu post não pode conter menos de 10 caracteres.",
		})
		.max(400, {
			message: "Seu post não pode conter mais de 400 caracteres.",
		}),
	image: z.any().optional(),
})

export default function NewPost() {
	const [bioError, setBioError] = useState(false)
	const [image, setImage] = useState<File | null>(null)
	const [userData, setUserData] = useState<UserData | null>(null)
	const [isOpen, setIsOpen] = useState<boolean>(false)
	const navigate = useNavigate()
	const fileInputRef = useRef<HTMLInputElement | null>(null)
	const [posting, setPosting] = useState<boolean>(false)

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
	})

	const loadUserData = async (userId: string) => {
		try {
			const userDoc = doc(db, 'users', userId);
			const userSnapshot = await getDoc(userDoc);

			if (userSnapshot.exists()) {
				const data = userSnapshot.data() as UserData;
				setUserData(data);

				if (!data.isProfileComplete) {
					navigate('/complete-profile')
				}
			} else {
				navigate('/complete-profile')
			}
		} catch (error) {
			console.error('Erro ao carregar dados do usuário:', error)
		}
	}

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (user) {
				try {
					await loadUserData(user.uid);
				} catch (error) {
					console.error('Erro ao buscar os dados do usuário:', error)
				}
			} else {
				navigate('/sign');
			}
		});

		return () => unsubscribe();
	}, [])

	const onSubmit = async (data: { bio: string }) => {
		setPosting(true)
		if (data.bio.length < 10) {
			setBioError(true)
			return;
		} else {
			setBioError(false)
		}

		let imageUrl = '';
		if (image) {
			const storageRef = ref(storage, `images/${auth.currentUser?.uid}/${Date.now()}_${image.name}`);
			const snapshot = await uploadBytes(storageRef, image)
			imageUrl = await getDownloadURL(snapshot.ref)
		}

		if (auth.currentUser && userData) {
			try {
				await addDoc(collection(db, 'posts'), {
					name: userData.name,
					surname: userData.surname,
					content: data.bio,
					userId: auth.currentUser.uid,
					profilePicture: userData.profilePicture || null,
					imageUrl: imageUrl || null,
					timestamp: new Date(),
				});
				setIsOpen(false)
				form.reset()
				setImage(null)
				setPosting(false)
				await loadUserData(auth.currentUser.uid);
			} catch (error) {
				console.error('Erro ao adicionar post:', error)
			}
		}
	}

	const handleDialog = () => {
		setIsOpen(true)
	}

	const handleImageClick = () => {
		fileInputRef.current?.click()
	}

	const handleRemoveImage = () => {
		setImage(null)
	}

	return (
		<div>
			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogTrigger asChild>
					<Button onClick={handleDialog} variant={"ghost"} className="flex gap-2 text-zinc-500 font-bold"><CopyPlus/>Novo Post</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Novo Post</DialogTitle>
					</DialogHeader>
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
												className="resize-none h-22"
											/>
										</FormControl>
										<FormControl>
											<div
												className="relative h-[300px] flex items-center justify-center bg-[#403f413f] rounded-lg"
												onClick={handleImageClick}
											>
												{image ? (
													<>
														<img
															src={URL.createObjectURL(image)}
															alt="Imagem carregada"
															className="object-cover w-full h-full rounded-lg"
														/>
														<button
															className="absolute top-2 right-2 bg-red-500 rounded-full p-1"
															onClick={handleRemoveImage}
															type="button"
														>
															<X size={24} color="white" />
														</button>
													</>
												) : (
													<ImagePlus size={80} color="#403f41" />
												)}
												<input
													type="file"
													accept="image/*"
													className="hidden"
													ref={fileInputRef}
													onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
												/>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							{bioError && (
								<p className="text-red-500">O texto deve conter pelo menos 10 caracteres.</p>
							)}
							<DialogFooter>
								<span className="font-bold text-xs text-zinc-500">Você pode @mencionar outros usuários e organizações.</span>
								<Button
									type="submit"
									variant={'outline'}
									className='w-40'
									disabled={posting}
								>
									{posting ? "Postando..." : "Compartilhar"}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	)
}

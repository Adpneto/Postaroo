import { atom } from 'recoil';
import { UserData } from '@/interfaces/UserData';

export const userState = atom<UserData | null>({
    key: 'userState',
    default: null,
})
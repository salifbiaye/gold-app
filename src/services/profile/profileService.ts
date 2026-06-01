import { endpoints } from '../../config/api';
import { AuthUser } from '../../types/auth';
import { apiRequest } from '../api/client';

export type AvatarUploadFile =
  | File
  | {
      name?: string;
      type?: string;
      uri: string;
    };

export type ProfileUser = Omit<AuthUser, 'token'> & { token?: string };

export async function uploadAvatar(file: AvatarUploadFile): Promise<ProfileUser> {
  const form = new FormData();
  form.append('file', file as unknown as Blob);

  return apiRequest<AuthUser>(endpoints.profile.avatar, {
    method: 'POST',
    body: form,
  });
}

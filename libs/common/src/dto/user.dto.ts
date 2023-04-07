export interface UserDto {
  _id: string;
  email: string;
  password: string;
  roles?: string[];
}

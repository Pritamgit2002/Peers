export type TUser = {
  id: number;
  name: string;
  email: string;
  clerkUserId: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  isActive?: boolean;
};

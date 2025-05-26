"use server"
import { z } from 'zod';
import { userRegisterSchema } from '@/schemas/shema';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const registerUser = async (formData: z.infer<typeof userRegisterSchema>) => {
  const {  email, password, confirmPassword } = formData;
  
  if ( !email || !password || !confirmPassword) {
    return {
      success: false,
      errors: {
        general: ['All fields are required.'],
      },
    };
  }

  const values = userRegisterSchema.safeParse(formData);
  if (!values.success) {
    return {
      success: false,
      errors: values.error.flatten().fieldErrors,
    };
  }


  const existingUser = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (existingUser) {
    return {
      success: false,
      errors: { email: ['Email already exists'] },
    };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return {
      success: true,
      message: 'User successfully registered',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return {
      success: false,
      errors: { general: ['An error occurred during registration'] },
    };
  }
};

export { registerUser };

import bcrypt from 'bcryptjs';
import pkg from '@prisma/client';
const { PrismaClient, Role } = pkg;

const prisma = new PrismaClient();

// @desc    Register a new user
// @route   POST /api/users
// @access  Private (Admin only)
export const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Please provide all required fields: name, email, password, role.' });
  }

  if (!Object.values(Role).includes(role)) {
    return res.status(400).json({ error: 'Invalid role specified.' });
  }

  try {
    let user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    // Don't send the password back
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only)
export const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
            }
        });
        res.json(users);
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: 'Server error' });
    }
};

// @desc    Update a user
// @route   PUT /api/users/:id
// @access  Private (Admin only)
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, password, role, isActive } = req.body;

  try {
    const userIdToUpdate = parseInt(id);
    let user = await prisma.user.findUnique({ where: { id: userIdToUpdate } });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const updateData = {
      name: name || user.name,
      email: email || user.email,
      role: role || user.role,
      isActive: typeof isActive === 'boolean' ? isActive : user.isActive,
    };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // Prevent an admin from deactivating their own account or changing their own role to non-admin
    if (req.user.id === userIdToUpdate) {
      if (typeof isActive === 'boolean' && !isActive) {
        return res.status(403).json({ error: 'You cannot deactivate your own account.' });
      }
      if (role && role !== 'ADMIN') {
        return res.status(403).json({ error: 'You cannot change your own role from Admin.' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userIdToUpdate },
      data: updateData,
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.status(200).json(userWithoutPassword);

  } catch (error) {
    console.error(error.message);
    // Handle unique email constraint violation
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  
  try {
    const userIdToDelete = parseInt(id);

    if (req.user.id === userIdToDelete) {
      return res.status(403).json({ error: 'You cannot delete your own account.' });
    }

    await prisma.user.delete({
      where: { id: userIdToDelete },
    });

    res.status(204).send();

  } catch (error) {
    console.error(`Failed to delete user with id ${id}:`, error);
    if (error.code === 'P2025') { // Prisma's "record to delete not found"
      return res.status(404).json({ error: 'User not found.' });
    }
    res.status(500).json({ error: 'Server error while deleting user.' });
  }
};
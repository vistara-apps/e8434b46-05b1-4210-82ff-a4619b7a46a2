import { NextRequest, NextResponse } from 'next/server';
import { User } from '@/lib/types';
import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// In-memory storage fallback for development
const memoryStorage = new Map<string, User>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, telegramId } = body;

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Generate user ID from wallet address
    const userId = `user_${walletAddress.toLowerCase()}`;

    // Check if user exists
    let existingUser: User | null = null;
    
    if (redis) {
      const redisUser = await redis.get(`user:${userId}`);
      existingUser = redisUser ? JSON.parse(redisUser as string) : null;
    } else {
      existingUser = memoryStorage.get(userId) || null;
    }

    if (existingUser) {
      // Update existing user if needed
      if (telegramId && existingUser.telegramId !== telegramId) {
        existingUser.telegramId = telegramId;
        
        // Save updated user
        if (redis) {
          await redis.set(`user:${userId}`, JSON.stringify(existingUser));
        } else {
          memoryStorage.set(userId, existingUser);
        }
      }

      return NextResponse.json({
        success: true,
        data: existingUser,
        message: 'User authenticated successfully',
      });
    }

    // Create new user
    const newUser: User = {
      userId,
      telegramId,
      notificationPreferences: {
        browser: true,
        telegram: !!telegramId,
      },
      alertSlots: 3, // Free tier default
      subscription: {
        type: 'free',
      },
    };

    // Save new user
    if (redis) {
      await redis.set(`user:${userId}`, JSON.stringify(newUser));
    } else {
      memoryStorage.set(userId, newUser);
    }

    return NextResponse.json({
      success: true,
      data: newUser,
      message: 'User created successfully',
    });

  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    let user: User | null = null;
    
    if (redis) {
      const redisUser = await redis.get(`user:${userId}`);
      user = redisUser ? JSON.parse(redisUser as string) : null;
    } else {
      user = memoryStorage.get(userId) || null;
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, updates } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get existing user
    let existingUser: User | null = null;
    
    if (redis) {
      const redisUser = await redis.get(`user:${userId}`);
      existingUser = redisUser ? JSON.parse(redisUser as string) : null;
    } else {
      existingUser = memoryStorage.get(userId) || null;
    }

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user data
    const updatedUser: User = {
      ...existingUser,
      ...updates,
      userId, // Ensure userId cannot be changed
    };

    // Save updated user
    if (redis) {
      await redis.set(`user:${userId}`, JSON.stringify(updatedUser));
    } else {
      memoryStorage.set(userId, updatedUser);
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully',
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

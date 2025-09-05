import { NextRequest, NextResponse } from 'next/server';
import { AlertDatabase, UserDatabase } from '@/lib/database';
import { UserAlert, AlertFormData } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: AlertFormData & { userId: string } = await request.json();
    
    // Validate required fields
    if (!body.userId || !body.cryptoSymbol || !body.alertType) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, cryptoSymbol, alertType' },
        { status: 400 }
      );
    }

    // Check if user exists and has available alert slots
    const user = await UserDatabase.findById(body.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check alert slots for free users
    if (user.subscription?.type === 'free') {
      const existingAlerts = await AlertDatabase.findByUserId(body.userId);
      const activeAlerts = existingAlerts.filter(alert => alert.status === 'active');
      
      if (activeAlerts.length >= user.alertSlots) {
        return NextResponse.json(
          { 
            error: 'Alert limit reached. Upgrade to premium or delete existing alerts.',
            currentAlerts: activeAlerts.length,
            maxAlerts: user.alertSlots
          },
          { status: 403 }
        );
      }
    }

    // Create alert
    const alertData = {
      userId: body.userId,
      cryptoSymbol: body.cryptoSymbol,
      alertType: body.alertType,
      thresholdValue: body.thresholdValue,
      direction: body.direction,
      notificationChannels: body.notificationChannels,
      status: 'active' as const,
      createdAt: new Date(),
    };

    const alert = await AlertDatabase.create(alertData);
    
    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const alertId = searchParams.get('alertId');
    
    if (alertId) {
      // Get specific alert
      const alert = await AlertDatabase.findById(alertId);
      
      if (!alert) {
        return NextResponse.json(
          { error: 'Alert not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(alert);
    } else if (userId) {
      // Get all alerts for user
      const alerts = await AlertDatabase.findByUserId(userId);
      return NextResponse.json(alerts);
    } else {
      return NextResponse.json(
        { error: 'Either userId or alertId is required' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { alertId, ...updates } = body;
    
    if (!alertId) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      );
    }

    const alert = await AlertDatabase.update(alertId, updates);
    
    if (!alert) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(alert);
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('alertId');
    
    if (!alertId) {
      return NextResponse.json(
        { error: 'Alert ID is required' },
        { status: 400 }
      );
    }

    const success = await AlertDatabase.delete(alertId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Alert not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    console.error('Error deleting alert:', error);
    return NextResponse.json(
      { error: 'Failed to delete alert' },
      { status: 500 }
    );
  }
}

# Team Member Invite Feature - Implementation Guide

## Overview
The team member invite feature is **fully implemented** and allows team leaders to invite members via email for team-based events.

## How It Works

### 1. **Team Registration Flow**

#### For Team Leaders:
1. Leader registers for a team event
2. Provides team name and team member emails
3. System validates:
   - Team size matches event requirements (teamMin/teamMax)
   - No duplicate emails
   - Leader's email not in invite list
4. System creates team registration and sends invitation emails to all members

#### For Team Members:
1. Receive invitation email with verification link
2. Click link to view team details
3. Login/Register with the invited email
4. Request OTP for verification
5. Enter OTP to confirm participation
6. Once all members verify, team status becomes "confirmed"

### 2. **API Endpoints**

#### Team Leader Endpoints:
- `POST /api/teams/register` - Create team registration
- `GET /api/teams/my-teams` - View all teams created
- `GET /api/teams/:teamId` - View specific team details
- `POST /api/teams/:teamId/resend-invite` - Resend invitation to a member
- `DELETE /api/teams/:teamId` - Cancel team registration

#### Team Member Endpoints:
- `GET /api/teams/invite/:token` - View invitation details (no auth required)
- `POST /api/teams/invite/:token/send-otp` - Request OTP (requires auth)
- `POST /api/teams/invite/:token/verify-otp` - Verify OTP and confirm (requires auth)

### 3. **Database Models**

#### TeamRegistration Model
```javascript
{
  event: ObjectId,
  captain: ObjectId,
  teamName: String,
  teamSizeRequested: Number,
  totalAmount: Number,
  paidAmount: Number,
  status: "pending" | "partially_verified" | "confirmed" | "cancelled",
  paymentStatus: "pending" | "paid" | "failed",
  eventSnapshot: {...},
  expiresAt: Date,
  cancelledReason: String,
  cancelledAt: Date
}
```

#### TeamMemberInvite Model
```javascript
{
  teamRegistration: ObjectId,
  inviteEmail: String,
  inviteToken: String (unique),
  role: "captain" | "member",
  isVerified: Boolean,
  verifiedAt: Date,
  verifiedBy: ObjectId,
  status: "invited" | "verified" | "expired",
  currentOtp: String,
  otpExpiresAt: Date,
  otpAttempts: Number,
  lastOtpSentAt: Date,
  expiresAt: Date,
  invitedBy: ObjectId
}
```

### 4. **Email Notifications**

The system sends three types of emails:

1. **Team Invitation Email**
   - Sent when leader creates team
   - Contains verification link
   - Shows event details, team name, and captain info

2. **OTP Verification Email**
   - Sent when member requests OTP
   - Contains 6-digit OTP
   - Valid for 10 minutes

3. **Team Status Notification**
   - Sent to captain when members verify
   - Updates on team verification progress

### 5. **Security Features**

- **Token-based invites**: Unique cryptographic tokens for each invite
- **Email verification**: Members must use invited email
- **OTP verification**: 6-digit OTP with expiry
- **Rate limiting**: 
  - Max 5 OTP attempts
  - 60-second cooldown between OTP requests
- **Invite expiry**: 72 hours for invitations
- **OTP expiry**: 10 minutes for OTP codes

### 6. **Team Status Flow**

```
pending → partially_verified → confirmed
   ↓
cancelled
```

- **pending**: Team created, waiting for member verifications
- **partially_verified**: Some members verified, waiting for others
- **confirmed**: All members verified, team ready
- **cancelled**: Team leader cancelled registration

### 7. **Frontend Integration**

#### Create Team Registration:
```javascript
const response = await fetch('/api/teams/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    eventId: 'event_id',
    teamName: 'Team Awesome',
    teamSizeRequested: 4,
    inviteEmails: [
      'member1@example.com',
      'member2@example.com',
      'member3@example.com'
    ]
  })
});
```

#### Verify Invitation:
```javascript
// Step 1: Get invite details
const inviteResponse = await fetch(`/api/teams/invite/${token}`);

// Step 2: Send OTP
const otpResponse = await fetch(`/api/teams/invite/${token}/send-otp`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`
  }
});

// Step 3: Verify OTP
const verifyResponse = await fetch(`/api/teams/invite/${token}/verify-otp`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`
  },
  body: JSON.stringify({ otp: '123456' })
});
```

### 8. **Event Configuration**

For an event to support teams, set these fields:

```javascript
{
  isTeamEvent: true,
  teamMin: 2,  // Minimum team size
  teamMax: 5,  // Maximum team size
  perPersonFee: 500  // Price per team member (optional)
}
```

### 9. **Payment Integration**

- Team registration calculates total amount: `perPersonFee × teamSize`
- Payment can be handled through existing Razorpay integration
- Once paid, team status updates accordingly

### 10. **Testing the Feature**

1. Create a team event with `isTeamEvent: true`
2. Register as team leader with member emails
3. Check email for invitation links
4. Open invite link and verify with OTP
5. Repeat for all members
6. Verify team status becomes "confirmed"

## Files Modified/Created

### Backend:
- ✅ `models/teamRegistration.model.js` - Team registration schema
- ✅ `models/teamMemberInvite.model.js` - Team invite schema
- ✅ `controllers/team.controller.js` - Team management logic
- ✅ `routes/team.routes.js` - Team API routes
- ✅ `utils/sendEmail.js` - Email notification functions
- ✅ `server.js` - Routes registered (line 76)

### Database:
- ✅ Pass model updated with team fields (isTeamPass, teamName, teamLeader, teamMembers, teamSize)

## Next Steps for Full Integration

1. **Frontend Components Needed:**
   - Team registration form
   - Team invite verification page
   - Team dashboard for leaders
   - Member verification flow

2. **UI/UX Enhancements:**
   - Team member status indicators
   - Progress tracker for verifications
   - Resend invite button
   - Team management interface

3. **Additional Features:**
   - Team chat/messaging
   - Team profile customization
   - Team leaderboard
   - Team certificates

## Support

The feature is production-ready and fully functional. All backend endpoints are working and properly secured with authentication and validation.

# Sportify Hub: Database Schema (MongoDB / Mongoose)

## User Collection (`users`)
```javascript
{
  _id: ObjectId,
  email: String (Unique),
  phone: String (Unique),
  fullName: String,
  avatarUrl: String,
  location: {
    type: "Point",
    coordinates: [longitude, latitude] // GeoJSON for near queries
  },
  skillLevels: [{
    sport: String, // e.g., 'Tennis', 'Football'
    level: String  // e.g., 'Beginner', 'Intermediate', 'Advanced'
  }],
  favoriteSports: [String],
  stats: {
    gamesPlayed: Number,
    streak: Number,
    badges: [String]
  },
  createdAt: Date
}
```

## Venue Collection (`venues`)
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  images: [String],
  location: {
    address: String,
    city: String,
    geo: { type: "Point", coordinates: [lng, lat] }
  },
  sports: [String], // e.g., ['Badminton', 'Football']
  facilities: [String], // ['Parking', 'Showers', 'Cafe']
  rating: Number,
  reviewsCount: Number,
  pricing: {
    basePricePerHour: Number,
    dynamicPricingInfo: Object
  },
  adminId: ObjectId // Ref to Admin User
}
```

## Booking Collection (`bookings`)
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Ref to User
  venueId: ObjectId, // Ref to Venue
  sport: String,
  date: Date,
  startTime: String, // e.g., "18:00"
  endTime: String,   // e.g., "19:00"
  status: String,    // "PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"
  paymentDetails: {
    transactionId: String,
    amount: Number,
    method: String // "Stripe", "Razorpay"
  },
  createdAt: Date
}
```

## Match / Game Collection (`games`)
```javascript
{
  _id: ObjectId,
  hostId: ObjectId, // Ref to User
  venueId: ObjectId, // Optional Ref to Venue
  sport: String,
  type: String, // "PUBLIC" or "PRIVATE"
  date: Date,
  time: String,
  maxPlayers: Number,
  currentPlayers: [{
    userId: ObjectId, // Ref to User
    status: String // "JOINED", "WAITLISTED"
  }],
  skillRequirement: String, // e.g., "Intermediate+"
  chatRoomId: ObjectId
}
```
